import assert from "node:assert/strict";
import test from "node:test";

import { inspectMp4Moov } from "./cloudinary-video-audio.mjs";

function concat(...parts) {
  return Buffer.concat(parts);
}

function box(type, content = Buffer.alloc(0)) {
  const result = Buffer.alloc(8 + content.length);
  result.writeUInt32BE(result.length, 0);
  result.write(type, 4, 4, "ascii");
  content.copy(result, 8);
  return result;
}

function extendedBox(type, content = Buffer.alloc(0)) {
  const result = Buffer.alloc(16 + content.length);
  result.writeUInt32BE(1, 0);
  result.write(type, 4, 4, "ascii");
  result.writeBigUInt64BE(BigInt(result.length), 8);
  content.copy(result, 16);
  return result;
}

function zeroSizedBox(type, content = Buffer.alloc(0)) {
  const result = Buffer.alloc(8 + content.length);
  result.writeUInt32BE(0, 0);
  result.write(type, 4, 4, "ascii");
  content.copy(result, 8);
  return result;
}

function uuidBox(content = Buffer.alloc(0)) {
  const userType = Buffer.from([
    0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77,
    0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff,
  ]);
  const result = Buffer.alloc(8 + userType.length + content.length);
  result.writeUInt32BE(result.length, 0);
  result.write("uuid", 4, 4, "ascii");
  userType.copy(result, 8);
  content.copy(result, 24);
  return result;
}

function handler(handlerType) {
  return box(
    "hdlr",
    concat(Buffer.alloc(8), Buffer.from(handlerType, "ascii")),
  );
}

function track(handlerType, {
  trackBox = box,
  mediaBox = box,
} = {}) {
  return trackBox("trak", mediaBox("mdia", handler(handlerType)));
}

function moov(...handlerTypes) {
  return box("moov", concat(...handlerTypes.map((type) => track(type))));
}

test("inspectMp4Moov reports a video-only MP4", () => {
  assert.deepEqual(inspectMp4Moov(moov("vide")), {
    trackCount: 1,
    videoTrackCount: 1,
    handlerTypes: ["vide"],
  });
});

test("inspectMp4Moov rejects unsupported input types", () => {
  for (const input of [64, "64", null]) {
    assert.throws(
      () => inspectMp4Moov(input),
      /input debe ser un Uint8Array o ArrayBuffer/,
    );
  }
});

test("inspectMp4Moov accepts an ArrayBuffer", () => {
  const buffer = moov("vide");
  const input = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );

  assert.deepEqual(inspectMp4Moov(input), {
    trackCount: 1,
    videoTrackCount: 1,
    handlerTypes: ["vide"],
  });
});

test("inspectMp4Moov rejects an audio track", () => {
  assert.throws(
    () => inspectMp4Moov(moov("vide", "soun")),
    /pista de audio \(soun\)/,
  );
});

test("inspectMp4Moov requires a video track", () => {
  assert.throws(
    () => inspectMp4Moov(moov("meta")),
    /pista de video \(vide\)/,
  );
});

test("inspectMp4Moov accepts extended moov, trak, and mdia boxes", () => {
  const bytes = extendedBox(
    "moov",
    track("vide", {
      trackBox: extendedBox,
      mediaBox: extendedBox,
    }),
  );

  assert.deepEqual(inspectMp4Moov(bytes), {
    trackCount: 1,
    videoTrackCount: 1,
    handlerTypes: ["vide"],
  });
});

test("inspectMp4Moov accepts a zero-sized root moov", () => {
  assert.deepEqual(
    inspectMp4Moov(zeroSizedBox("moov", track("vide"))),
    {
      trackCount: 1,
      videoTrackCount: 1,
      handlerTypes: ["vide"],
    },
  );
});

test("inspectMp4Moov accounts for a uuid user type before a video track", () => {
  const bytes = box(
    "moov",
    concat(uuidBox(Buffer.from([0xde, 0xad, 0xbe, 0xef])), track("vide")),
  );

  assert.deepEqual(inspectMp4Moov(bytes), {
    trackCount: 1,
    videoTrackCount: 1,
    handlerTypes: ["vide"],
  });
});

test("inspectMp4Moov requires exactly one mdia and one hdlr per track", () => {
  assert.throws(
    () => inspectMp4Moov(box("moov", box("trak"))),
    /exactamente una caja mdia/,
  );

  assert.throws(
    () => inspectMp4Moov(
      box(
        "moov",
        box("trak", box("mdia", concat(handler("vide"), handler("meta")))),
      ),
    ),
    /exactamente una caja hdlr/,
  );
});

test("inspectMp4Moov enforces the parsed-box limit", () => {
  assert.throws(
    () => inspectMp4Moov(moov("vide"), { maxParsedBoxes: 2 }),
    /límite de cajas MP4/,
  );
});

test("inspectMp4Moov counts the root moov toward the parsed-box limit", () => {
  assert.throws(
    () => inspectMp4Moov(moov("vide"), { maxParsedBoxes: 3 }),
    /límite de cajas MP4/,
  );
});

test("inspectMp4Moov requires a safe positive parsed-box limit", () => {
  assert.throws(
    () => inspectMp4Moov(moov("vide"), {
      maxParsedBoxes: Number.MAX_SAFE_INTEGER + 1,
    }),
    /entero positivo seguro/,
  );
});

test("inspectMp4Moov rejects a truncated hdlr", () => {
  assert.throws(() => inspectMp4Moov(
    box("moov", box("trak", box("mdia", box("hdlr", Buffer.alloc(4))))),
  ), /hdlr está truncada/);
});

test("inspectMp4Moov rejects a box outside its parent", () => {
  const bytes = moov("vide");
  bytes.writeUInt32BE(bytes.length + 1, 0);
  assert.throws(() => inspectMp4Moov(bytes), /excede su contenedor/);
});

test("inspectMp4Moov rejects an unsafe extended size", () => {
  const bytes = Buffer.alloc(16);
  bytes.writeUInt32BE(1, 0);
  bytes.write("moov", 4, 4, "ascii");
  bytes.writeBigUInt64BE(BigInt(Number.MAX_SAFE_INTEGER) + 1n, 8);
  assert.throws(() => inspectMp4Moov(bytes), /tamaño inseguro/);
});
