import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  await readFile(
    path.join(root, "src", "data", "generated", "cloudinary-media.json"),
    "utf8",
  ),
);
const host = "127.0.0.1";
const port = 4332;
const baseUrl = `http://${host}:${port}`;
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function assertManifest() {
  assert.ok(
    Array.isArray(manifest.videos),
    "El manifiesto debe incluir una colección de videos.",
  );
  assert.ok(
    manifest.videos.length >= 4,
    "La verificación necesita al menos cuatro videos.",
  );
}

function assertProcessManagementContract() {
  const posixPlan = getPreviewProcessPlan("linux");
  assert.equal(
    posixPlan.command,
    "npm",
    "POSIX debe iniciar npm directamente.",
  );
  assert.deepEqual(posixPlan.args, [
    "run",
    "preview",
    "--",
    "--host",
    host,
    "--port",
    String(port),
  ]);
  assert.equal(posixPlan.options.shell, false);
  assert.equal(
    posixPlan.options.detached,
    true,
    "POSIX debe crear un grupo de procesos independiente.",
  );

  const windowsPlan = getPreviewProcessPlan("win32");
  assert.equal(
    windowsPlan.command,
    "npm run preview -- --host 127.0.0.1 --port 4332",
  );
  assert.equal(windowsPlan.args, undefined);
  assert.equal(windowsPlan.options.shell, true);
  assert.equal(windowsPlan.options.detached, undefined);

  const signals = [];
  assert.equal(
    signalPosixProcessGroup(42, "SIGTERM", (pid, signal) => {
      signals.push([pid, signal]);
    }),
    true,
  );
  assert.deepEqual(
    signals,
    [[-42, "SIGTERM"]],
    "Las señales POSIX deben dirigirse al grupo completo.",
  );

  const missingGroup = new Error("missing");
  missingGroup.code = "ESRCH";
  assert.equal(
    signalPosixProcessGroup(42, "SIGTERM", () => {
      throw missingGroup;
    }),
    false,
    "ESRCH debe tratarse como un grupo ya finalizado.",
  );

  const deniedSignal = new Error("denied");
  deniedSignal.code = "EPERM";
  assert.throws(
    () =>
      signalPosixProcessGroup(42, "SIGTERM", () => {
        throw deniedSignal;
      }),
    (error) => error === deniedSignal,
    "Los errores distintos de ESRCH deben conservarse.",
  );
}

function assertPortAvailable() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (error) => {
      reject(
        new Error(`El puerto ${port} no está disponible.`, { cause: error }),
      );
    });
    server.listen(port, host, () => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });
}

function prefixAstroOutput(stream, target) {
  let pending = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    pending += chunk;
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() ?? "";

    for (const line of lines) {
      target.write(`[astro] ${line}\n`);
    }
  });
  stream.on("end", () => {
    if (pending.length > 0) target.write(`[astro] ${pending}\n`);
  });
}

function getPreviewProcessPlan(platform = process.platform) {
  const options = {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  };

  if (platform === "win32") {
    return {
      command: "npm run preview -- --host 127.0.0.1 --port 4332",
      args: undefined,
      options: {
        ...options,
        shell: true,
      },
    };
  }

  return {
    command: "npm",
    args: [
      "run",
      "preview",
      "--",
      "--host",
      host,
      "--port",
      String(port),
    ],
    options: {
      ...options,
      shell: false,
      detached: true,
    },
  };
}

function startPreview() {
  const { command, args, options } = getPreviewProcessPlan();
  const preview =
    args === undefined
      ? spawn(command, options)
      : spawn(command, args, options);

  prefixAstroOutput(preview.stdout, process.stdout);
  prefixAstroOutput(preview.stderr, process.stderr);
  return preview;
}

async function waitForPreview(preview) {
  const deadline = Date.now() + 45_000;
  let spawnError;
  const rememberSpawnError = (error) => {
    spawnError = error;
  };

  preview.once("error", rememberSpawnError);
  try {
    while (Date.now() < deadline) {
      if (spawnError) {
        throw new Error("No se pudo iniciar la vista previa.", {
          cause: spawnError,
        });
      }
      if (preview.exitCode !== null || preview.signalCode !== null) {
        throw new Error(
          `La vista previa terminó antes de responder (código ${String(
            preview.exitCode,
          )}, señal ${String(preview.signalCode)}).`,
        );
      }

      try {
        const response = await fetch(baseUrl, {
          signal: AbortSignal.timeout(1_500),
        });
        if (response.ok) return;
      } catch {
        // La vista previa todavía está iniciando.
      }

      await delay(300);
    }
  } finally {
    preview.off("error", rememberSpawnError);
  }

  throw new Error("La vista previa no respondió dentro de 45 segundos.");
}

function signalPosixProcessGroup(pid, signal, kill = process.kill) {
  try {
    kill(-pid, signal);
    return true;
  } catch (error) {
    if (error?.code === "ESRCH") return false;
    throw error;
  }
}

function isPosixProcessGroupRunning(pid) {
  try {
    process.kill(-pid, 0);
    return true;
  } catch (error) {
    if (error?.code === "ESRCH") return false;
    if (error?.code === "EPERM") return true;
    throw error;
  }
}

async function waitForPosixProcessGroupExit(pid, timeout = 3_000) {
  const deadline = Date.now() + timeout;

  while (isPosixProcessGroupRunning(pid)) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) return false;
    await delay(Math.min(50, remaining));
  }

  return true;
}

async function stopPreview(preview) {
  if (!preview?.pid) return;

  if (process.platform === "win32") {
    if (preview.exitCode !== null || preview.signalCode !== null) return;

    await new Promise((resolve) => {
      const taskkill = spawn(
        "taskkill",
        ["/pid", String(preview.pid), "/T", "/F"],
        {
          stdio: "ignore",
          windowsHide: true,
        },
      );
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      taskkill.once("close", finish);
      taskkill.once("error", finish);
    });
    return;
  }

  if (!isPosixProcessGroupRunning(preview.pid)) return;
  if (!signalPosixProcessGroup(preview.pid, "SIGTERM")) return;
  if (await waitForPosixProcessGroupExit(preview.pid)) return;

  if (!signalPosixProcessGroup(preview.pid, "SIGKILL")) return;
  if (!(await waitForPosixProcessGroupExit(preview.pid))) {
    throw new Error(
      `El grupo de procesos de la vista previa ${preview.pid} no terminó.`,
    );
  }
}

function isMp4(value) {
  try {
    return new URL(value).pathname.endsWith(".mp4");
  } catch {
    return false;
  }
}

async function waitForPlayers(page) {
  const result = await page.waitForFunction(
    (expectedCount) => {
      const players = Array.from(
        document.querySelectorAll("[data-video-player]"),
      );
      return (
        players.length === expectedCount &&
        players.every((player) => player.dataset.enhanced === "true")
      );
    },
    manifest.videos.length,
  );
  await result.dispose();
}

async function waitForLocator(
  page,
  locator,
  condition,
  argument,
  timeout = 30_000,
) {
  const element = await locator.elementHandle();
  assert.ok(element, "No se encontró el elemento esperado.");

  try {
    const result = await page.waitForFunction(
      condition,
      { element, argument },
      { timeout },
    );
    await result.dispose();
  } finally {
    await element.dispose();
  }
}

function waitForState(page, player, state, timeout) {
  return waitForLocator(
    page,
    player,
    ({ element, argument }) => element.dataset.state === argument,
    state,
    timeout,
  );
}

function waitForCurrentTime(page, video, minimum) {
  return waitForLocator(
    page,
    video,
    ({ element, argument }) => element.currentTime > argument,
    minimum,
  );
}

async function assertFocused(locator, message) {
  assert.equal(
    await locator.evaluate((element) => document.activeElement === element),
    true,
    message,
  );
}

async function assertMinimumBox(locator, label) {
  const box = await locator.boundingBox();
  assert.ok(box, `${label} debe ser visible.`);
  assert.ok(
    box.width >= 44 && box.height >= 44,
    `${label} debe medir al menos 44 × 44 px (mide ${box.width} × ${box.height}).`,
  );
}

async function verifyDesktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  let stalledRoute;
  let stalledSource;
  let stalledHandler;

  try {
    await context.addInitScript(() => {
      window.__videoTestFullscreenElement = null;
      Object.defineProperty(document, "fullscreenEnabled", {
        configurable: true,
        get: () => true,
      });
      Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        get: () => window.__videoTestFullscreenElement,
      });
      Object.defineProperty(Element.prototype, "requestFullscreen", {
        configurable: true,
        value() {
          window.__videoTestFullscreenElement = this;
          document.dispatchEvent(new Event("fullscreenchange"));
          return Promise.resolve();
        },
      });
      Object.defineProperty(document, "exitFullscreen", {
        configurable: true,
        value() {
          window.__videoTestFullscreenElement = null;
          document.dispatchEvent(new Event("fullscreenchange"));
          return Promise.resolve();
        },
      });
    });

    const page = await context.newPage();
    const mp4Requests = [];
    page.on("request", (request) => {
      if (isMp4(request.url())) mp4Requests.push(request.url());
    });

    await page.goto(`${baseUrl}/videos`, { waitUntil: "domcontentloaded" });
    await waitForPlayers(page);

    const players = page.locator("[data-video-player]");
    assert.equal(
      await players.count(),
      manifest.videos.length,
      "La página debe renderizar todos los videos del manifiesto.",
    );
    assert.equal(
      mp4Requests.length,
      0,
      "No debe solicitar MP4 antes de iniciar reproducción.",
    );
    assert.equal(
      await page.locator("[data-video-volume]").count(),
      0,
      "El reproductor sin audio no debe incluir controles de volumen.",
    );

    const first = players.nth(0);
    const second = players.nth(1);
    const third = players.nth(2);
    const fourth = players.nth(3);
    const firstVideo = first.locator("[data-video-media]");
    const secondVideo = second.locator("[data-video-media]");
    const thirdVideo = third.locator("[data-video-media]");
    const fourthVideo = fourth.locator("[data-video-media]");
    const firstPrimary = first.locator("[data-video-primary]");
    const secondPrimary = second.locator("[data-video-primary]");
    const thirdPrimary = third.locator("[data-video-primary]");
    const fourthPrimary = fourth.locator("[data-video-primary]");
    const firstToggle = first.locator("[data-video-toggle]");
    const secondToggle = second.locator("[data-video-toggle]");
    const thirdToggle = third.locator("[data-video-toggle]");

    await firstVideo.evaluate((video) => {
      video.loop = true;
    });
    await secondVideo.evaluate((video) => {
      video.loop = true;
    });

    await firstPrimary.focus();
    await page.keyboard.press("Enter");
    await waitForState(page, first, "playing");
    await assertFocused(
      firstToggle,
      "El foco debe pasar al control principal después de iniciar.",
    );
    await waitForCurrentTime(page, firstVideo, 0.1);
    assert.equal(
      await firstVideo.evaluate((video) => video.muted),
      true,
      "El video debe permanecer silenciado.",
    );
    assert.match(
      await firstVideo.evaluate((video) => video.currentSrc),
      /ac_none/,
      "La fuente reproducida debe excluir la pista de audio.",
    );
    assert.equal(
      new Set(mp4Requests).size,
      1,
      "El primer inicio debe solicitar una única URL MP4.",
    );

    await secondPrimary.click();
    await waitForState(page, second, "playing");
    await waitForCurrentTime(page, secondVideo, 0.1);
    await waitForState(page, first, "paused");

    await secondToggle.focus();
    await page.keyboard.press("Space");
    await waitForState(page, second, "paused");

    const secondProgress = second.locator("[data-video-progress]");
    await waitForLocator(
      page,
      secondProgress,
      ({ element }) => !element.disabled,
    );
    const progressMaximum = await secondProgress.evaluate((progress) =>
      Number(progress.max),
    );
    assert.ok(
      Number.isFinite(progressMaximum) && progressMaximum > 0,
      "El progreso debe exponer una duración válida.",
    );
    const seekTarget = Math.min(1, progressMaximum / 2);
    await secondProgress.evaluate((progress, target) => {
      progress.value = String(target);
      progress.dispatchEvent(new Event("input", { bubbles: true }));
    }, seekTarget);
    assert.ok(
      Math.abs(
        (await secondVideo.evaluate((video) => video.currentTime)) - seekTarget,
      ) < 0.35,
      "El control de progreso debe actualizar el tiempo del video.",
    );

    await secondProgress.focus();
    const progressBeforeArrow = await secondProgress.evaluate((progress) =>
      Number(progress.value),
    );
    await page.keyboard.press("ArrowRight");
    await waitForLocator(
      page,
      secondProgress,
      ({ element, argument }) => Number(element.value) > argument,
      progressBeforeArrow,
    );

    await secondToggle.focus();
    await page.keyboard.press("Space");
    await waitForState(page, second, "playing");

    const fullscreen = second.locator("[data-video-fullscreen]");
    assert.equal(
      await fullscreen.isVisible(),
      true,
      "El control de pantalla completa debe estar visible.",
    );
    await fullscreen.focus();
    await fullscreen.click();
    await waitForLocator(
      page,
      second,
      ({ element }) => document.fullscreenElement === element,
    );
    assert.match(
      (await fullscreen.getAttribute("aria-label")) ?? "",
      /Salir/,
      "El control debe anunciar la salida de pantalla completa.",
    );
    assert.equal(
      await fullscreen.locator("[data-video-minimize]").isVisible(),
      true,
      "El icono de minimizar debe estar visible.",
    );
    await fullscreen.click();
    const fullscreenExited = await page.waitForFunction(
      () => document.fullscreenElement === null,
    );
    await fullscreenExited.dispose();
    assert.match(
      (await fullscreen.getAttribute("aria-label")) ?? "",
      /en pantalla completa/,
      "El control debe volver a anunciar la entrada a pantalla completa.",
    );

    await page.locator('[data-video-filter="Eventos"]').click();
    await waitForState(page, second, "paused");
    await waitForLocator(
      page,
      second,
      ({ element }) =>
        element.closest("[data-video-item]")?.classList.contains("hidden") ===
        true,
    );
    await page.locator('[data-video-filter="Todos"]').click();
    await waitForLocator(
      page,
      second,
      ({ element }) =>
        element.closest("[data-video-item]")?.classList.contains("hidden") ===
        false,
    );

    stalledSource = await fourthVideo.getAttribute("data-src");
    assert.ok(stalledSource, "El cuarto video debe exponer data-src.");
    stalledHandler = (route) => {
      stalledRoute = route;
    };
    await page.route(stalledSource, stalledHandler);
    try {
      await fourthPrimary.focus();
      await page.keyboard.press("Enter");
      await waitForState(page, fourth, "loading");
      await assertFocused(
        fourth.locator("[data-video-toggle]"),
        "El foco debe pasar al toggle mientras el video carga.",
      );

      const routeDeadline = Date.now() + 5_000;
      while (!stalledRoute && Date.now() < routeDeadline) {
        await delay(50);
      }
      assert.ok(stalledRoute, "La solicitud bloqueada del cuarto video debe iniciar.");

      await delay(2_400);
      assert.equal(
        await fourth.getAttribute("data-state"),
        "loading",
        "El cuarto reproductor debe seguir cargando.",
      );
      assert.equal(
        await fourth.getAttribute("data-controls-visible"),
        "true",
        "Los controles deben seguir visibles durante una carga prolongada.",
      );
      await page.keyboard.press("Space");
      await waitForState(page, fourth, "idle");
      await assertFocused(
        fourthPrimary,
        "Cancelar la carga debe devolver el foco al botón principal.",
      );
    } finally {
      if (stalledRoute) {
        await stalledRoute.abort().catch(() => {});
      }
      await page.unroute(stalledSource, stalledHandler).catch(() => {});
      stalledRoute = undefined;
      stalledSource = undefined;
      stalledHandler = undefined;
    }

    const thirdSource = await thirdVideo.getAttribute("data-src");
    assert.ok(thirdSource, "El tercer video debe exponer data-src.");
    const abortHandler = (route) => route.abort("failed");
    await page.route(thirdSource, abortHandler);
    try {
      await thirdPrimary.click();
      await waitForState(page, third, "error");
      assert.equal(
        await third.locator("[data-video-fallback]").isVisible(),
        true,
        "El enlace alternativo debe mostrarse ante un error.",
      );
      await assertFocused(
        third.locator("[data-video-retry]"),
        "El error debe llevar el foco al botón de reintento.",
      );
    } finally {
      await page.unroute(thirdSource, abortHandler).catch(() => {});
    }

    const thirdRetry = third.locator("[data-video-retry]");
    await thirdRetry.click();
    await waitForState(page, third, "playing");
    await assertFocused(
      thirdToggle,
      "El reintento exitoso debe llevar el foco al toggle.",
    );
    const thirdDuration = await thirdVideo.evaluate((video) => video.duration);
    assert.ok(
      Number.isFinite(thirdDuration) && thirdDuration > 0.1,
      "El tercer video debe exponer una duración válida.",
    );
    await thirdVideo.evaluate((video) => {
      video.currentTime = video.duration - 0.1;
    });
    await waitForState(page, third, "ended");
    await assertFocused(
      thirdPrimary,
      "Al finalizar, el foco debe volver al botón principal.",
    );
    await thirdPrimary.click();
    await waitForState(page, third, "playing");
    await assertFocused(
      thirdToggle,
      "La repetición debe devolver el foco al toggle.",
    );

    const verticalAsset = manifest.videos.find(
      (video) => video.height > video.width,
    );
    assert.ok(verticalAsset, "El manifiesto debe incluir un video vertical.");
    const vertical = page.locator(
      `[data-video-player][data-video-id="${verticalAsset.assetId}"]`,
    );
    assert.equal(
      await vertical.count(),
      1,
      "Debe existir el reproductor del video vertical.",
    );
    const verticalVideo = vertical.locator("[data-video-media]");
    const verticalState = await vertical.getAttribute("data-state");

    if (verticalState === "error") {
      await vertical.locator("[data-video-retry]").click();
    } else if (verticalState === "paused") {
      await vertical.locator("[data-video-toggle]").click();
    } else if (verticalState === "idle" || verticalState === "ended") {
      await vertical.locator("[data-video-primary]").click();
    }

    await waitForLocator(
      page,
      verticalVideo,
      ({ element }) =>
        element.readyState >= HTMLMediaElement.HAVE_METADATA &&
        element.videoWidth > 0 &&
        element.videoHeight > 0,
      undefined,
      30_000,
    );
    const verticalMetrics = await verticalVideo.evaluate((video) => ({
      width: video.videoWidth,
      height: video.videoHeight,
      objectFit: getComputedStyle(video).objectFit,
    }));
    assert.ok(
      verticalMetrics.height > verticalMetrics.width,
      "El medio vertical debe conservar sus dimensiones reales.",
    );
    assert.equal(
      verticalMetrics.objectFit,
      "contain",
      "El video vertical debe mostrarse completo, sin recorte.",
    );
  } finally {
    if (stalledRoute) {
      await stalledRoute.abort().catch(() => {});
    }
    if (stalledSource && stalledHandler) {
      const pages = context.pages();
      if (pages[0]) {
        await pages[0].unroute(stalledSource, stalledHandler).catch(() => {});
      }
    }
    await context.close();
  }
}

async function verifyNoJavaScript(browser) {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 900, height: 700 },
  });

  try {
    const page = await context.newPage();
    const mp4Requests = [];
    page.on("request", (request) => {
      if (isMp4(request.url())) mp4Requests.push(request.url());
    });

    await page.goto(`${baseUrl}/videos`, {
      waitUntil: "load",
      timeout: 45_000,
    });
    assert.equal(
      await page
        .locator("[data-video-player]")
        .first()
        .locator("[data-video-fallback]")
        .isVisible(),
      true,
      "Sin JavaScript debe quedar visible el enlace alternativo.",
    );
    assert.equal(
      mp4Requests.length,
      0,
      "Sin JavaScript no debe descargarse ningún MP4.",
    );
  } finally {
    await context.close();
  }
}

async function verifyTouch(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  try {
    const page = await context.newPage();
    await page.goto(`${baseUrl}/videos`, { waitUntil: "domcontentloaded" });
    await waitForPlayers(page);

    const first = page.locator("[data-video-player]").first();
    const primary = first.locator("[data-video-primary]");
    const toggle = first.locator("[data-video-toggle]");
    const progress = first.locator("[data-video-progress]");
    const fullscreen = first.locator("[data-video-fullscreen]");
    const video = first.locator("[data-video-media]");

    assert.equal(
      await first.getAttribute("data-controls-visible"),
      "true",
      "Los controles táctiles deben comenzar visibles.",
    );
    await assertMinimumBox(primary, "El botón principal");
    await video.evaluate((media) => {
      media.loop = true;
    });
    await primary.click();
    await waitForState(page, first, "playing");
    await delay(2_750);
    assert.equal(
      await first.getAttribute("data-controls-visible"),
      "true",
      "Los controles táctiles no deben ocultarse por temporizador.",
    );
    await assertMinimumBox(toggle, "El toggle táctil");
    await assertMinimumBox(progress, "El progreso táctil");
    if (await fullscreen.isVisible()) {
      await assertMinimumBox(fullscreen, "El botón de pantalla completa");
    }
  } finally {
    await context.close();
  }
}

async function main() {
  let preview;
  let browser;
  let primaryError;

  try {
    assertProcessManagementContract();
    assertManifest();
    await assertPortAvailable();
    preview = startPreview();
    await waitForPreview(preview);
    browser = await chromium.launch({ headless: true });
    await verifyDesktop(browser);
    await verifyNoJavaScript(browser);
    await verifyTouch(browser);
    console.log(`Player verificado con ${manifest.videos.length} videos.`);
  } catch (error) {
    primaryError = error;
  } finally {
    if (browser) await browser.close().catch(() => {});
    try {
      await stopPreview(preview);
    } catch (cleanupError) {
      if (primaryError) {
        console.error(
          "Error adicional al detener la vista previa:",
          cleanupError,
        );
      } else {
        primaryError = cleanupError;
      }
    }
  }

  if (primaryError) throw primaryError;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
