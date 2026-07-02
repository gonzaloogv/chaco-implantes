import { spawn } from "node:child_process";
import { mkdir, rename } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const videosDir = path.join(root, "videos");
const host = "127.0.0.1";
const port = 4321;
const baseUrl = `http://${host}:${port}`;
const viewport = { width: 1920, height: 1080 };

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function assertPortAvailable() {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        reject(new Error(`El puerto ${port} ya esta ocupado. Cerralo o liberalo antes de grabar la demo.`));
        return;
      }
      reject(error);
    });
    server.once("listening", () => {
      server.close(resolve);
    });
    server.listen(port, host);
  });
}

function startDevServer() {
  const child = spawn(`npm run dev -- --host ${host} --port ${port}`, {
    cwd: root,
    env: process.env,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  child.stdout.on("data", (data) => process.stdout.write(`[astro] ${data}`));
  child.stderr.on("data", (data) => process.stderr.write(`[astro] ${data}`));

  return child;
}

async function waitForServer(child) {
  const startedAt = Date.now();
  const timeoutMs = 45000;

  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode !== null) {
      throw new Error(`El servidor Astro se cerro antes de responder en ${baseUrl}.`);
    }

    try {
      const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1500) });
      if (response.ok) return;
    } catch {
      await pause(500);
    }
  }

  throw new Error(`El servidor Astro no respondio en ${baseUrl} despues de ${timeoutMs / 1000} segundos.`);
}

async function stopDevServer(child) {
  if (!child || child.exitCode !== null || child.pid === undefined) return;

  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      killer.once("close", resolve);
      killer.once("error", resolve);
    });
    return;
  }

  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("close", resolve)),
    pause(3000).then(() => child.kill("SIGKILL")),
  ]);
}

async function goto(page, route, label) {
  console.log(`Demo: ${label}`);
  await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1100);
}

async function clickAndWait(page, locator, label) {
  console.log(`Demo: ${label}`);
  await locator.first().click();
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1100);
}

async function scrollByScreens(page, screens = 2) {
  for (let index = 0; index < screens; index += 1) {
    await page.evaluate(() => {
      window.scrollBy({ top: Math.round(window.innerHeight * 0.78), left: 0, behavior: "smooth" });
    });
    await page.waitForTimeout(950);
  }
}

async function returnToTop(page) {
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" }));
  await page.waitForTimeout(900);
}

async function recordDemo() {
  await mkdir(videosDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport,
    recordVideo: {
      dir: videosDir,
      size: viewport,
    },
  });
  const page = await context.newPage();
  const video = page.video();

  try {
    await goto(page, "/", "inicio");
    await page.locator("[data-hero-dot]").nth(1).click();
    await page.waitForTimeout(1200);
    await page.locator("[data-hero-dot]").nth(2).click();
    await page.waitForTimeout(1200);
    await scrollByScreens(page, 4);

    await goto(page, "/catalogos", "catalogos");
    await scrollByScreens(page, 1);
    await clickAndWait(page, page.locator('a[href="/catalogos/cadera"]'), "catalogos > cadera");
    await scrollByScreens(page, 1);
    await clickAndWait(
      page,
      page.locator('a[href="/catalogos/cadera/productos/cotilo-doble"]'),
      "cadera > cotilo doble",
    );
    await scrollByScreens(page, 2);

    await goto(page, "/galeria", "galeria");
    if (await page.locator("[data-load-more]").isVisible()) {
      await page.locator("[data-load-more]").click();
      await page.waitForTimeout(900);
    }
    await page.locator('[data-filter="Instrumental"]').click();
    await page.waitForTimeout(900);
    await page.locator("[data-gallery-item]:not(.hidden)").first().click();
    await page.waitForTimeout(1200);
    await page.locator("[data-lightbox-close]").click();
    await page.waitForTimeout(700);

    await goto(page, "/videos", "videos");
    await scrollByScreens(page, 2);

    await goto(page, "/eventos", "eventos");
    await scrollByScreens(page, 2);

    await goto(page, "/nosotros", "nosotros");
    await scrollByScreens(page, 2);

    await goto(page, "/contacto", "contacto");
    await page.locator('input[name="nombre"]').fill("Demo Chaco Implantes");
    await page.locator('input[name="institucion"]').fill("Institucion de muestra");
    await page.locator('input[name="telefono"]').fill("3624571854");
    await page.locator('input[name="email"]').fill("demo@example.com");
    await page.locator('textarea[name="mensaje"]').fill("Consulta de muestra para grabar la demo del sitio.");
    await page.waitForTimeout(1300);
    await scrollByScreens(page, 1);
    await returnToTop(page);
  } finally {
    await context.close();
    await browser.close();
  }

  if (!video) {
    throw new Error("Playwright no devolvio una referencia al video grabado.");
  }

  const videoPath = await video.path();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const finalPath = path.join(videosDir, `demo-chaco-implantes-${stamp}.webm`);
  await rename(videoPath, finalPath);
  console.log(`Video guardado en: ${finalPath}`);
}

async function main() {
  let devServer;

  try {
    await assertPortAvailable();
    devServer = startDevServer();
    await waitForServer(devServer);
    await recordDemo();
  } finally {
    await stopDevServer(devServer);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
