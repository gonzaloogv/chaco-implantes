const READY_STATUSES = new Set([200, 206]);
const VARIANT_LABELS = { src: "MP4", poster: "póster" };

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function requirePositiveInteger(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} debe ser un entero positivo.`);
  }
}

function describeError(error) {
  if (
    error instanceof Error &&
    typeof error.message === "string" &&
    error.message.length > 0
  ) {
    return error.message;
  }
  return String(error);
}

async function cancelResponseBody(response, variant) {
  try {
    await response?.body?.cancel();
  } catch (error) {
    throw new Error(
      `No se pudo liberar la respuesta de la variante ${variant.label} del video ${variant.assetId}: ${describeError(error)}.`,
      { cause: error },
    );
  }
}

function timeoutError(variant, timeoutMs) {
  return new Error(
    `La variante ${variant.label} del video ${variant.assetId} no quedó lista dentro de ${timeoutMs} ms.`,
  );
}

function requireHttpsVariant(video, index, field) {
  try {
    if (typeof video[field] !== "string") throw new Error();
    const url = new URL(video[field]);
    if (url.protocol !== "https:") throw new Error();
  } catch {
    throw new Error(`videos[${index}].${field} debe usar HTTPS.`);
  }
  return {
    assetId: video.assetId,
    field,
    label: VARIANT_LABELS[field],
    url: video[field],
  };
}

function buildVariants(videos) {
  const variants = [];
  for (let index = 0; index < videos.length; index += 1) {
    const video = videos[index];
    if (
      typeof video?.assetId !== "string" ||
      video.assetId.trim().length === 0
    ) {
      throw new Error(`videos[${index}].assetId es obligatorio.`);
    }
    variants.push(
      requireHttpsVariant(video, index, "src"),
      requireHttpsVariant(video, index, "poster"),
    );
  }
  return variants;
}

async function waitForVideoSource(variant, options) {
  const startedAt = options.now();

  while (true) {
    const elapsedBeforeRequest = options.now() - startedAt;
    if (elapsedBeforeRequest >= options.timeoutMs) {
      throw timeoutError(variant, options.timeoutMs);
    }

    const remainingMs = options.timeoutMs - elapsedBeforeRequest;
    const requestTimeoutMs = Math.min(
      options.requestTimeoutMs,
      remainingMs,
    );
    const videoDeadlineControlsRequest =
      remainingMs <= options.requestTimeoutMs;
    const signal = AbortSignal.timeout(requestTimeoutMs);
    let response;
    try {
      response = await options.fetchImpl(variant.url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        signal,
      });
    } catch (error) {
      if (signal.aborted) {
        if (videoDeadlineControlsRequest) {
          throw timeoutError(variant, options.timeoutMs);
        }
        throw new Error(
          `La solicitud de la variante ${variant.label} del video ${variant.assetId} superó ${options.requestTimeoutMs} ms.`,
          { cause: error },
        );
      }
      throw new Error(
        `No se pudo comprobar la variante ${variant.label} del video ${variant.assetId}: ${describeError(error)}.`,
        { cause: error },
      );
    }

    await cancelResponseBody(response, variant);

    const elapsedAfterRequest = options.now() - startedAt;
    const deadlineReached = elapsedAfterRequest >= options.timeoutMs;

    if (READY_STATUSES.has(response.status)) {
      if (deadlineReached) {
        throw timeoutError(variant, options.timeoutMs);
      }
      return;
    }

    if (response.status !== 423) {
      const detail = response.headers?.get?.("X-Cld-Error");
      throw new Error(
        `La variante ${variant.label} del video ${variant.assetId} respondió HTTP ${response.status}${detail ? `: ${detail}` : ""}.`,
      );
    }

    if (deadlineReached) {
      throw timeoutError(variant, options.timeoutMs);
    }

    const remainingAfterRequestMs =
      options.timeoutMs - elapsedAfterRequest;
    await options.sleep(
      Math.min(options.retryDelayMs, remainingAfterRequestMs),
    );
  }
}

export async function ensureVideoSourcesReady(videos, overrides = {}) {
  if (!Array.isArray(videos)) {
    throw new Error("videos debe ser un arreglo.");
  }

  const options = {
    fetchImpl: globalThis.fetch,
    sleep: delay,
    now: Date.now,
    concurrency: 6,
    retryDelayMs: 2_000,
    timeoutMs: 120_000,
    requestTimeoutMs: 15_000,
    ...overrides,
  };

  for (const field of [
    "concurrency",
    "retryDelayMs",
    "timeoutMs",
    "requestTimeoutMs",
  ]) {
    requirePositiveInteger(options[field], field);
  }

  for (const field of ["fetchImpl", "sleep", "now"]) {
    if (typeof options[field] !== "function") {
      throw new Error(`${field} debe ser una función.`);
    }
  }

  const variants = buildVariants(videos);

  let nextIndex = 0;
  let firstError;
  const worker = async () => {
    while (firstError === undefined) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= variants.length) return;

      try {
        await waitForVideoSource(variants[index], options);
      } catch (error) {
        firstError ??= error;
      }
    }
  };

  const workerCount = Math.min(options.concurrency, variants.length);
  await Promise.all(
    Array.from({ length: workerCount }, () => worker()),
  );

  if (firstError !== undefined) throw firstError;
}
