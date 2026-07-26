const READY_STATUSES = new Set([200, 206]);

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

async function cancelResponseBody(response, assetId) {
  try {
    await response?.body?.cancel();
  } catch (error) {
    throw new Error(
      `No se pudo liberar la respuesta del video ${assetId}: ${describeError(error)}.`,
      { cause: error },
    );
  }
}

function timeoutError(video, timeoutMs) {
  return new Error(
    `El video ${video.assetId} no quedó listo dentro de ${timeoutMs} ms.`,
  );
}

async function waitForVideoSource(video, options) {
  const startedAt = options.now();

  while (true) {
    const elapsedBeforeRequest = options.now() - startedAt;
    if (elapsedBeforeRequest >= options.timeoutMs) {
      throw timeoutError(video, options.timeoutMs);
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
      response = await options.fetchImpl(video.src, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        signal,
      });
    } catch (error) {
      if (signal.aborted) {
        if (videoDeadlineControlsRequest) {
          throw timeoutError(video, options.timeoutMs);
        }
        throw new Error(
          `La solicitud del video ${video.assetId} superó ${options.requestTimeoutMs} ms.`,
          { cause: error },
        );
      }
      throw new Error(
        `No se pudo comprobar el video ${video.assetId}: ${describeError(error)}.`,
        { cause: error },
      );
    }

    await cancelResponseBody(response, video.assetId);

    const elapsedAfterRequest = options.now() - startedAt;
    const deadlineReached = elapsedAfterRequest >= options.timeoutMs;

    if (READY_STATUSES.has(response.status)) {
      if (deadlineReached) {
        throw timeoutError(video, options.timeoutMs);
      }
      return;
    }

    if (response.status !== 423) {
      const detail = response.headers?.get?.("X-Cld-Error");
      throw new Error(
        `El video ${video.assetId} respondió HTTP ${response.status}${detail ? `: ${detail}` : ""}.`,
      );
    }

    if (deadlineReached) {
      throw timeoutError(video, options.timeoutMs);
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

  const safeVideos = videos.map((video, index) => {
    if (
      typeof video?.assetId !== "string" ||
      video.assetId.trim().length === 0
    ) {
      throw new Error(`videos[${index}].assetId es obligatorio.`);
    }

    try {
      if (typeof video.src !== "string") throw new Error();
      const url = new URL(video.src);
      if (url.protocol !== "https:") throw new Error();
    } catch {
      throw new Error(`videos[${index}].src debe usar HTTPS.`);
    }

    return video;
  });

  let nextIndex = 0;
  let firstError;
  const worker = async () => {
    while (firstError === undefined) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= safeVideos.length) return;

      try {
        await waitForVideoSource(safeVideos[index], options);
      } catch (error) {
        firstError ??= error;
      }
    }
  };

  const workerCount = Math.min(options.concurrency, safeVideos.length);
  await Promise.all(
    Array.from({ length: workerCount }, () => worker()),
  );

  if (firstError !== undefined) throw firstError;
}
