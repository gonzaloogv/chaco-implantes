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

export function inspectMp4Moov(input, {
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

  if (handlerTypes.includes("soun")) {
    throw new Error("El MP4 contiene una pista de audio (soun).");
  }

  const videoTrackCount = handlerTypes
    .filter((handlerType) => handlerType === "vide")
    .length;
  if (videoTrackCount === 0) {
    throw new Error("El MP4 debe contener al menos una pista de video (vide).");
  }

  return {
    trackCount: tracks.length,
    videoTrackCount,
    handlerTypes,
  };
}
