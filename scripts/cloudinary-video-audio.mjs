export const DEFAULT_MP4_INSPECTION_OPTIONS = Object.freeze({
  concurrency: 4,
  initialProbeBytes: 64 * 1024,
  maxMoovBytes: 8 * 1024 * 1024,
  maxTopLevelBoxes: 128,
  maxParsedBoxes: 1024,
  maxRangeRequests: 32,
  requestTimeoutMs: 15_000,
  timeoutMs: 60_000,
});

function requirePositiveInteger(value, name) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} debe ser un entero positivo seguro.`);
  }
}

function fourCc(bytes, offset) {
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    offset + 4 > bytes.length
  ) {
    throw new Error("El código FourCC está truncado.");
  }

  return String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3],
  );
}

function readBoxHeader(bytes, offset, parentEnd) {
  if (
    !Number.isSafeInteger(offset) ||
    !Number.isSafeInteger(parentEnd) ||
    offset < 0 ||
    parentEnd < offset ||
    parentEnd > bytes.length
  ) {
    throw new Error("Los límites de la caja MP4 no son válidos.");
  }
  if (parentEnd - offset < 8) {
    throw new Error("La cabecera de la caja MP4 está truncada.");
  }

  const view = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  );
  const size32 = view.getUint32(offset);
  const type = fourCc(bytes, offset + 4);
  let size = size32;
  let headerSize = 8;

  if (size32 === 1) {
    if (parentEnd - offset < 16) {
      throw new Error(
        `La cabecera extendida de la caja ${type} está truncada.`,
      );
    }
    const extendedSize = view.getBigUint64(offset + 8);
    if (extendedSize > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error(`La caja ${type} declara un tamaño inseguro.`);
    }
    size = Number(extendedSize);
    headerSize = 16;
  } else if (size32 === 0) {
    size = parentEnd - offset;
  }

  if (type === "uuid") {
    headerSize += 16;
  }
  if (parentEnd - offset < headerSize) {
    throw new Error(`La cabecera de la caja ${type} está truncada.`);
  }
  if (size < headerSize) {
    throw new Error(
      `La caja ${type} declara un tamaño menor que su cabecera.`,
    );
  }

  const end = offset + size;
  if (!Number.isSafeInteger(end)) {
    throw new Error(`La caja ${type} declara un tamaño inseguro.`);
  }
  if (end > parentEnd) {
    throw new Error(`La caja ${type} excede su contenedor.`);
  }

  const contentStart = offset + headerSize;
  return {
    type,
    start: offset,
    end,
    size,
    headerSize,
    contentStart,
    contentEnd: end,
    contentSize: end - contentStart,
  };
}

function directChildren(bytes, parent, state) {
  const children = [];
  let offset = parent.contentStart;

  while (offset < parent.contentEnd) {
    state.parsedBoxes += 1;
    if (state.parsedBoxes > state.maxParsedBoxes) {
      throw new Error("Se excedió el límite de cajas MP4 analizadas.");
    }

    const child = readBoxHeader(bytes, offset, parent.contentEnd);
    children.push(child);
    offset = child.end;
  }

  if (offset !== parent.contentEnd) {
    throw new Error(
      `Las cajas hijas de ${parent.type} no completan exactamente su contenedor.`,
    );
  }

  return children;
}

function exactlyOne(children, type, parentType) {
  const matches = children.filter((child) => child.type === type);
  if (matches.length !== 1) {
    throw new Error(
      `Cada caja ${parentType} debe contener exactamente una caja ${type}.`,
    );
  }
  return matches[0];
}

function inspectMp4Tracks(input, {
  maxParsedBoxes = DEFAULT_MP4_INSPECTION_OPTIONS.maxParsedBoxes,
} = {}) {
  requirePositiveInteger(maxParsedBoxes, "maxParsedBoxes");

  let bytes;
  if (input instanceof Uint8Array) {
    bytes = input;
  } else if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else {
    throw new TypeError("input debe ser un Uint8Array o ArrayBuffer.");
  }

  const root = readBoxHeader(bytes, 0, bytes.length);
  if (root.type !== "moov" || root.end !== bytes.length) {
    throw new Error("Se requiere exactamente una caja raíz moov completa.");
  }

  const state = { maxParsedBoxes, parsedBoxes: 1 };
  const tracks = directChildren(bytes, root, state)
    .filter((child) => child.type === "trak");
  const handlerTypes = tracks.map((track) => {
    const media = exactlyOne(
      directChildren(bytes, track, state),
      "mdia",
      "trak",
    );
    const handlerBox = exactlyOne(
      directChildren(bytes, media, state),
      "hdlr",
      "mdia",
    );
    if (handlerBox.contentSize < 12) {
      throw new Error("La caja hdlr está truncada.");
    }
    return fourCc(bytes, handlerBox.contentStart + 8);
  });

  const videoTrackCount = handlerTypes
    .filter((handlerType) => handlerType === "vide")
    .length;

  return {
    trackCount: tracks.length,
    videoTrackCount,
    handlerTypes,
  };
}

export function inspectMp4Moov(input, options = {}) {
  const details = inspectMp4Tracks(input, options);
  if (details.handlerTypes.includes("soun")) {
    throw new Error("El MP4 contiene una pista de audio (soun).");
  }
  if (details.videoTrackCount === 0) {
    throw new Error("El MP4 debe contener al menos una pista de video (vide).");
  }
  return details;
}

export function inspectMp4MoovHasAudio(input, options = {}) {
  const details = inspectMp4Tracks(input, options);
  if (!details.handlerTypes.includes("soun")) {
    throw new Error("El MP4 no contiene una pista de audio (soun).");
  }
  if (details.videoTrackCount === 0) {
    throw new Error("El MP4 debe contener al menos una pista de video (vide).");
  }
  return details;
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

function parseContentRange(value) {
  const match =
    typeof value === "string"
      ? /^bytes (\d+)-(\d+)\/(\d+)$/.exec(value)
      : null;
  if (match === null) {
    throw new Error("Cloudinary devolvió Content-Range inválido.");
  }

  const start = Number(match[1]);
  const end = Number(match[2]);
  const total = Number(match[3]);
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    !Number.isSafeInteger(total) ||
    start < 0 ||
    end < start ||
    total <= end
  ) {
    throw new Error("Cloudinary devolvió Content-Range inválido.");
  }

  return { start, end, total };
}

async function cancelResponseBody(response) {
  try {
    await response?.body?.cancel();
  } catch {
    // Preserve the validation error that made this response unusable.
  }
}

async function readBodyExactly(response, expectedLength) {
  if (
    response?.body === null ||
    response?.body === undefined ||
    typeof response.body.getReader !== "function"
  ) {
    throw new Error("Cloudinary devolvió un body truncado.");
  }

  const bytes = new Uint8Array(expectedLength);
  const reader = response.body.getReader();
  let offset = 0;

  try {
    while (true) {
      let chunk;
      try {
        chunk = await reader.read();
      } catch (error) {
        throw new Error(
          `Falló la lectura MP4: ${describeError(error)}`,
          { cause: error },
        );
      }

      if (chunk.done) break;
      if (!(chunk.value instanceof Uint8Array)) {
        await reader.cancel().catch(() => undefined);
        throw new Error("Cloudinary devolvió un body MP4 inválido.");
      }
      if (chunk.value.byteLength > expectedLength - offset) {
        await reader.cancel().catch(() => undefined);
        throw new Error("El body excede el rango solicitado.");
      }

      bytes.set(chunk.value, offset);
      offset += chunk.value.byteLength;
    }
  } finally {
    reader.releaseLock?.();
  }

  if (offset !== expectedLength) {
    throw new Error("Cloudinary devolvió un body truncado.");
  }
  return bytes;
}

function timeoutError(context) {
  return new Error(
    `La inspección MP4 excedió el plazo total de ${context.options.timeoutMs} ms.`,
  );
}

async function readExactRange(url, start, end, context) {
  context.rangeRequests += 1;
  if (context.rangeRequests > context.options.maxRangeRequests) {
    throw new Error("Se excedió el límite de solicitudes Range.");
  }

  const currentTime = context.options.now();
  const remainingMs = context.deadline - currentTime;
  if (remainingMs <= 0) throw timeoutError(context);

  const signal = AbortSignal.timeout(
    Math.min(context.options.requestTimeoutMs, remainingMs),
  );
  let response;
  try {
    response = await context.options.fetchImpl(url, {
      method: "GET",
      headers: { Range: `bytes=${start}-${end}` },
      redirect: "error",
      signal,
    });
  } catch (error) {
    throw new Error(
      `Falló la lectura MP4: ${describeError(error)}`,
      { cause: error },
    );
  }

  if (response?.status !== 206) {
    await cancelResponseBody(response);
    throw new Error(
      `Cloudinary debe responder HTTP 206 y respondió HTTP ${response?.status}.`,
    );
  }

  let contentRange;
  try {
    contentRange = parseContentRange(
      response.headers?.get?.("Content-Range"),
    );
  } catch (error) {
    await cancelResponseBody(response);
    throw error;
  }

  const expectedEnd = Math.min(end, contentRange.total - 1);
  if (
    contentRange.start !== start ||
    contentRange.end !== expectedEnd
  ) {
    await cancelResponseBody(response);
    throw new Error(
      "Cloudinary devolvió un rango distinto del rango solicitado.",
    );
  }

  if (
    context.remoteTotal !== undefined &&
    context.remoteTotal !== contentRange.total
  ) {
    await cancelResponseBody(response);
    throw new Error("El tamaño remoto cambió entre respuestas.");
  }
  context.remoteTotal ??= contentRange.total;

  return readBodyExactly(
    response,
    contentRange.end - contentRange.start + 1,
  );
}

function readRemoteBoxHeader(bytes, start, total) {
  if (bytes.length < 8) {
    throw new Error("La cabecera de la caja MP4 está truncada.");
  }

  const view = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  );
  const size32 = view.getUint32(0);
  const type = fourCc(bytes, 4);
  let size = size32;
  let headerSize = 8;

  if (size32 === 1) {
    if (bytes.length < 16) {
      throw new Error(
        `La cabecera extendida de la caja ${type} está truncada.`,
      );
    }
    const extendedSize = view.getBigUint64(8);
    if (extendedSize > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error(`La caja ${type} declara un tamaño inseguro.`);
    }
    size = Number(extendedSize);
    headerSize = 16;
  } else if (size32 === 0) {
    size = total - start;
  }

  if (type === "uuid") headerSize += 16;
  if (bytes.length < headerSize) {
    throw new Error(`La cabecera de la caja ${type} está truncada.`);
  }
  if (size < headerSize) {
    throw new Error(
      `La caja ${type} declara un tamaño menor que su cabecera.`,
    );
  }
  if (size > total - start) {
    throw new Error(`La caja ${type} excede el archivo remoto.`);
  }

  return {
    type,
    start,
    end: start + size,
    size,
    headerSize,
  };
}

async function findRemoteMoov(video, options) {
  const context = {
    deadline: options.now() + options.timeoutMs,
    options,
    rangeRequests: 0,
    remoteTotal: undefined,
  };
  const probe = await readExactRange(
    video.src,
    0,
    options.initialProbeBytes - 1,
    context,
  );
  const total = context.remoteTotal;
  let offset = 0;
  let moovBytes;
  let topLevelBoxes = 0;

  while (offset < total) {
    topLevelBoxes += 1;
    if (topLevelBoxes > options.maxTopLevelBoxes) {
      throw new Error(
        "Se excedió el límite de cajas MP4 superiores analizadas.",
      );
    }

    let headerBytes;
    if (offset <= probe.length - 32) {
      headerBytes = probe.subarray(offset, offset + 32);
    } else {
      headerBytes = await readExactRange(
        video.src,
        offset,
        Math.min(Number.MAX_SAFE_INTEGER, offset + 31),
        context,
      );
    }
    const remoteBox = readRemoteBoxHeader(headerBytes, offset, total);

    if (remoteBox.type === "moov") {
      if (moovBytes !== undefined) {
        throw new Error("El MP4 contiene más de una caja moov.");
      }
      if (remoteBox.size > options.maxMoovBytes) {
        throw new Error("La caja moov excede el límite permitido.");
      }
      if (remoteBox.end <= probe.length) {
        moovBytes = probe.slice(remoteBox.start, remoteBox.end);
      } else {
        moovBytes = await readExactRange(
          video.src,
          remoteBox.start,
          remoteBox.end - 1,
          context,
        );
      }
    }

    offset = remoteBox.end;
  }

  if (moovBytes === undefined) {
    throw new Error("No se encontró la caja moov del MP4.");
  }
  return moovBytes;
}

function validateCloudinaryVideo(video, index, requiredAudioTransform) {
  const hasAssetId =
    typeof video?.assetId === "string" &&
    video.assetId.trim().length > 0;
  const assetId = hasAssetId
    ? video.assetId.trim()
    : "<ausente>";

  try {
    if (!hasAssetId) {
      throw new Error(`videos[${index}].assetId es obligatorio.`);
    }

    let url;
    try {
      if (typeof video.src !== "string") throw new Error();
      url = new URL(video.src);
    } catch {
      throw new Error(`videos[${index}].src debe ser una URL válida.`);
    }
    if (url.protocol !== "https:") {
      throw new Error(`videos[${index}].src debe usar HTTPS.`);
    }
    if (url.host !== "res.cloudinary.com") {
      throw new Error(
        `videos[${index}].src debe usar el host res.cloudinary.com sin puerto.`,
      );
    }

    const pathSegments = url.pathname.split("/");
    if (
      pathSegments[0] !== "" ||
      pathSegments[1]?.length === 0 ||
      pathSegments[2] !== "video" ||
      pathSegments[3] !== "upload"
    ) {
      throw new Error(
        `videos[${index}].src debe ser una URL de video upload de Cloudinary.`,
      );
    }

    const deliverySegments = pathSegments.slice(4);
    const versionIndex = deliverySegments.findIndex(
      (segment) => /^v\d+$/.test(segment),
    );
    if (versionIndex < 0) {
      throw new Error(
        `videos[${index}].src debe incluir una versión de Cloudinary.`,
      );
    }
    const hasRequiredAudioTransform = deliverySegments
      .slice(0, versionIndex)
      .some((segment) =>
        segment.split(",").includes(requiredAudioTransform)
      );
    if (versionIndex === 0 || !hasRequiredAudioTransform) {
      throw new Error(
        `videos[${index}].src debe incluir la transformación ${requiredAudioTransform} antes de la primera versión.`,
      );
    }

    return { assetId, src: video.src };
  } catch (error) {
    throw new Error(
      `No se pudo validar videos[${index}] (assetId: ${assetId}): ${describeError(error)}`,
      { cause: error },
    );
  }
}

function buildRemoteInspectionOptions(overrides) {
  const options = {
    ...DEFAULT_MP4_INSPECTION_OPTIONS,
    fetchImpl: globalThis.fetch,
    now: Date.now,
    ...overrides,
  };

  for (const field of [
    "concurrency",
    "initialProbeBytes",
    "maxMoovBytes",
    "maxTopLevelBoxes",
    "maxParsedBoxes",
    "maxRangeRequests",
    "requestTimeoutMs",
    "timeoutMs",
  ]) {
    requirePositiveInteger(options[field], field);
  }
  for (const field of ["fetchImpl", "now"]) {
    if (typeof options[field] !== "function") {
      throw new Error(`${field} debe ser una función.`);
    }
  }

  return options;
}

async function ensureVideoSourcesMatchAudioPolicy(
  videos,
  {
    inspectMoov,
    requiredAudioTransform,
  },
  overrides = {},
) {
  if (!Array.isArray(videos)) {
    throw new Error("videos debe ser un arreglo.");
  }

  const options = buildRemoteInspectionOptions(overrides);
  const safeVideos = [];
  for (let index = 0; index < videos.length; index += 1) {
    safeVideos.push(
      validateCloudinaryVideo(
        videos[index],
        index,
        requiredAudioTransform,
      ),
    );
  }

  let nextIndex = 0;
  let firstError;
  const worker = async () => {
    while (firstError === undefined) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= safeVideos.length) return;

      const video = safeVideos[index];
      try {
        const moovBytes = await findRemoteMoov(video, options);
        inspectMoov(moovBytes, {
          maxParsedBoxes: options.maxParsedBoxes,
        });
      } catch (error) {
        firstError ??= new Error(
          `No se pudo inspeccionar el video ${video.assetId}: ${describeError(error)}`,
          { cause: error },
        );
      }
    }
  };

  const workerCount = Math.min(options.concurrency, safeVideos.length);
  await Promise.all(
    Array.from({ length: workerCount }, () => worker()),
  );

  if (firstError !== undefined) throw firstError;
}

export async function ensureVideoSourcesHaveNoAudio(
  videos,
  overrides = {},
) {
  return ensureVideoSourcesMatchAudioPolicy(
    videos,
    {
      inspectMoov: inspectMp4Moov,
      requiredAudioTransform: "ac_none",
    },
    overrides,
  );
}

export async function ensureVideoSourcesHaveAudio(
  videos,
  overrides = {},
) {
  return ensureVideoSourcesMatchAudioPolicy(
    videos,
    {
      inspectMoov: inspectMp4MoovHasAudio,
      requiredAudioTransform: "ac_aac",
    },
    overrides,
  );
}
