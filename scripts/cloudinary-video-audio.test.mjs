import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  DEFAULT_MP4_INSPECTION_OPTIONS,
  ensureVideoSourcesHaveNoAudio,
  inspectMp4Moov,
} from "./cloudinary-video-audio.mjs";
import { runVideoAudioVerification } from "./verify-cloudinary-video-audio.mjs";

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

function cloudinarySrc(assetId = "video-asset") {
  return `https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto,ac_none/v1/${assetId}.mp4`;
}

function createRangeFetch(bytes, { respond } = {}) {
  const requests = [];
  return {
    requests,
    async fetchImpl(url, options) {
      requests.push({ url, options });
      const match = /^bytes=(\d+)-(\d+)$/.exec(
        new Headers(options.headers).get("Range") ?? "",
      );
      assert.ok(match);
      const start = Number(match[1]);
      const requestedEnd = Number(match[2]);
      const end = Math.min(requestedEnd, bytes.length - 1);
      if (respond !== undefined) {
        return respond({
          bytes,
          end,
          index: requests.length - 1,
          requestedEnd,
          start,
        });
      }
      return new Response(bytes.subarray(start, end + 1), {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${bytes.length}`,
        },
      });
    },
  };
}

test("ensureVideoSourcesHaveNoAudio skips a large mdat with bounded Range requests", async () => {
  const fileType = box("ftyp");
  const mediaData = box("mdat", Buffer.alloc(128 * 1024));
  const movie = moov("vide");
  const bytes = concat(fileType, mediaData, movie);
  const moovOffset = fileType.length + mediaData.length;
  const rangeFetch = createRangeFetch(bytes);
  const src = cloudinarySrc();

  await ensureVideoSourcesHaveNoAudio(
    [{ assetId: "video-asset", src }],
    { fetchImpl: rangeFetch.fetchImpl },
  );

  assert.deepEqual(
    rangeFetch.requests.map(({ options }) =>
      new Headers(options.headers).get("Range")),
    [
      "bytes=0-65535",
      `bytes=${moovOffset}-${moovOffset + 31}`,
      `bytes=${moovOffset}-${bytes.length - 1}`,
    ],
  );
  for (const { url, options } of rangeFetch.requests) {
    assert.equal(url, src);
    assert.equal(options.method, "GET");
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    const [, start, end] = /^bytes=(\d+)-(\d+)$/.exec(
      new Headers(options.headers).get("Range"),
    );
    assert.ok(Number(end) - Number(start) + 1 <= 64 * 1024);
    assert.ok(Number(start) === 0 || Number(start) >= moovOffset);
  }
});

test("ensureVideoSourcesHaveNoAudio rejects a second top-level moov without downloading it", async () => {
  const fileType = box("ftyp");
  const firstMovie = moov("vide");
  const mediaData = box("mdat", Buffer.alloc(128 * 1024));
  const secondMovie = moov("vide", "soun");
  const bytes = concat(fileType, firstMovie, mediaData, secondMovie);
  const secondMoovOffset =
    fileType.length + firstMovie.length + mediaData.length;
  const rangeFetch = createRangeFetch(bytes);

  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [
          {
            assetId: "duplicate-moov",
            src: cloudinarySrc("duplicate-moov"),
          },
        ],
        { fetchImpl: rangeFetch.fetchImpl },
      ),
    (error) => {
      assert.match(error.message, /duplicate-moov/);
      assert.match(error.message, /más de una caja moov/);
      return true;
    },
  );

  assert.deepEqual(
    rangeFetch.requests.map(({ options }) =>
      new Headers(options.headers).get("Range")),
    [
      "bytes=0-65535",
      `bytes=${secondMoovOffset}-${secondMoovOffset + 31}`,
    ],
  );
});

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

test("ensureVideoSourcesHaveNoAudio accepts remote extended and zero-sized moov boxes", async () => {
  for (const bytes of [
    concat(box("ftyp"), extendedBox("moov", track("vide"))),
    concat(box("ftyp"), zeroSizedBox("moov", track("vide"))),
  ]) {
    const rangeFetch = createRangeFetch(bytes);
    await ensureVideoSourcesHaveNoAudio(
      [{ assetId: "video-asset", src: cloudinarySrc() }],
      { fetchImpl: rangeFetch.fetchImpl },
    );
  }
});

test("ensureVideoSourcesHaveNoAudio reports the assetId with MP4 errors", async () => {
  const rangeFetch = createRangeFetch(concat(box("ftyp"), moov("soun")));

  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [{ assetId: "audio-video", src: cloudinarySrc("audio-video") }],
        { fetchImpl: rangeFetch.fetchImpl },
      ),
    (error) => {
      assert.match(error.message, /audio-video/);
      assert.match(error.message, /pista de audio \(soun\)/);
      return true;
    },
  );
});

test("ensureVideoSourcesHaveNoAudio rejects HTTP 200 and cancels its body", async () => {
  let cancellations = 0;
  const bytes = concat(box("ftyp"), moov("vide"));
  const rangeFetch = createRangeFetch(bytes, {
    respond() {
      const body = new ReadableStream({
        cancel() {
          cancellations += 1;
        },
        start(controller) {
          controller.enqueue(bytes);
        },
      });
      return new Response(body, { status: 200 });
    },
  });

  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [{ assetId: "video-asset", src: cloudinarySrc() }],
        { fetchImpl: rangeFetch.fetchImpl },
      ),
    /HTTP 200/,
  );
  assert.equal(cancellations, 1);
});

test("ensureVideoSourcesHaveNoAudio rejects invalid Content-Range values", async () => {
  for (const contentRange of [
    "bytes 0-1/*",
    "bytes 0-0/9007199254740993",
    "bytes 1-0/2",
    "bytes 0-1/1",
    "bytes 0-0/0",
    "Bytes 0-0/1",
  ]) {
    const bytes = concat(box("ftyp"), moov("vide"));
    const rangeFetch = createRangeFetch(bytes, {
      respond() {
        return new Response(Buffer.from([0]), {
          status: 206,
          headers: { "Content-Range": contentRange },
        });
      },
    });

    await assert.rejects(
      () =>
        ensureVideoSourcesHaveNoAudio(
          [{ assetId: "video-asset", src: cloudinarySrc() }],
          { fetchImpl: rangeFetch.fetchImpl },
        ),
      /Cloudinary devolvió Content-Range inválido\./,
    );
  }
});

test("ensureVideoSourcesHaveNoAudio rejects a shorter or distinct returned range", async () => {
  for (const contentRange of [
    "bytes 0-7/64",
    "bytes 1-63/64",
  ]) {
    const bytes = Buffer.alloc(64);
    const rangeFetch = createRangeFetch(bytes, {
      respond() {
        const [, start, end] = /^bytes (\d+)-(\d+)\//.exec(contentRange);
        return new Response(
          Buffer.alloc(Number(end) - Number(start) + 1),
          {
            status: 206,
            headers: { "Content-Range": contentRange },
          },
        );
      },
    });

    await assert.rejects(
      () =>
        ensureVideoSourcesHaveNoAudio(
          [{ assetId: "video-asset", src: cloudinarySrc() }],
          { fetchImpl: rangeFetch.fetchImpl },
        ),
      /rango solicitado/,
    );
  }
});

test("ensureVideoSourcesHaveNoAudio rejects truncated and oversized response bodies", async () => {
  const bytes = Buffer.alloc(64);
  for (const returnedLength of [63, 65]) {
    const rangeFetch = createRangeFetch(bytes, {
      respond() {
        return new Response(Buffer.alloc(returnedLength), {
          status: 206,
          headers: { "Content-Range": "bytes 0-63/64" },
        });
      },
    });

    await assert.rejects(
      () =>
        ensureVideoSourcesHaveNoAudio(
          [{ assetId: "video-asset", src: cloudinarySrc() }],
          { fetchImpl: rangeFetch.fetchImpl },
        ),
      returnedLength < 64 ? /body truncado/ : /body excede el rango/,
    );
  }
});

test("ensureVideoSourcesHaveNoAudio rejects an oversized moov before reading it", async () => {
  const bytes = concat(
    box("ftyp"),
    box("moov", Buffer.alloc(128)),
  );
  const rangeFetch = createRangeFetch(bytes);

  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [{ assetId: "large-moov", src: cloudinarySrc("large-moov") }],
        {
          fetchImpl: rangeFetch.fetchImpl,
          maxMoovBytes: 64,
        },
      ),
    /moov excede el límite/,
  );
  assert.equal(rangeFetch.requests.length, 1);
});

test("ensureVideoSourcesHaveNoAudio enforces the top-level box limit", async () => {
  const bytes = concat(box("free"), box("skip"), moov("vide"));
  const rangeFetch = createRangeFetch(bytes);

  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [{ assetId: "many-boxes", src: cloudinarySrc("many-boxes") }],
        {
          fetchImpl: rangeFetch.fetchImpl,
          maxTopLevelBoxes: 2,
        },
      ),
    /límite de cajas MP4 superiores/,
  );
});

test("ensureVideoSourcesHaveNoAudio enforces the Range request limit", async () => {
  const bytes = concat(box("ftyp"), moov("vide"));
  const rangeFetch = createRangeFetch(bytes);

  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [{ assetId: "range-limit", src: cloudinarySrc("range-limit") }],
        {
          fetchImpl: rangeFetch.fetchImpl,
          initialProbeBytes: 8,
          maxRangeRequests: 1,
        },
      ),
    /límite de solicitudes Range/,
  );
  assert.equal(rangeFetch.requests.length, 1);
});

test("ensureVideoSourcesHaveNoAudio rejects a changing remote total", async () => {
  const bytes = concat(box("ftyp"), moov("vide"));
  const rangeFetch = createRangeFetch(bytes, {
    respond({ end, index, start }) {
      const total = bytes.length + (index === 0 ? 0 : 1);
      return new Response(bytes.subarray(start, end + 1), {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${total}`,
        },
      });
    },
  });

  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [{ assetId: "changing-total", src: cloudinarySrc("changing-total") }],
        {
          fetchImpl: rangeFetch.fetchImpl,
          initialProbeBytes: 8,
        },
      ),
    /tamaño remoto cambió/,
  );
});

test("ensureVideoSourcesHaveNoAudio rejects an unsafe remote extended box size", async () => {
  const bytes = Buffer.alloc(16);
  bytes.writeUInt32BE(1, 0);
  bytes.write("moov", 4, 4, "ascii");
  bytes.writeBigUInt64BE(BigInt(Number.MAX_SAFE_INTEGER) + 1n, 8);
  const rangeFetch = createRangeFetch(bytes);

  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [{ assetId: "unsafe-box", src: cloudinarySrc("unsafe-box") }],
        { fetchImpl: rangeFetch.fetchImpl },
      ),
    /tamaño inseguro/,
  );
});

test("ensureVideoSourcesHaveNoAudio wraps network errors without losing their message", async () => {
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [{ assetId: "network-video", src: cloudinarySrc("network-video") }],
        {
          async fetchImpl() {
            throw new Error("socket cerrado");
          },
        },
      ),
    (error) => {
      assert.match(error.message, /network-video/);
      assert.match(error.message, /Falló la lectura MP4: socket cerrado/);
      return true;
    },
  );
});

test("ensureVideoSourcesHaveNoAudio enforces the total deadline before fetching", async () => {
  const timestamps = [0, 10];
  let requests = 0;

  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [{ assetId: "late-video", src: cloudinarySrc("late-video") }],
        {
          async fetchImpl() {
            requests += 1;
            throw new Error("no debería ejecutarse");
          },
          now: () => timestamps.shift() ?? 10,
          timeoutMs: 10,
        },
      ),
    /plazo total de 10 ms/,
  );
  assert.equal(requests, 0);
});

test("ensureVideoSourcesHaveNoAudio rejects a non-standard Cloudinary port before fetching", async () => {
  let requests = 0;

  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [
          {
            assetId: "asset-port",
            src:
              "https://res.cloudinary.com:444/demo/video/upload/ac_none/v1/video.mp4",
          },
        ],
        {
          async fetchImpl() {
            requests += 1;
            throw new Error("no debería ejecutarse");
          },
        },
      ),
    (error) => {
      assert.match(error.message, /asset-port/);
      assert.match(error.message, /host res\.cloudinary\.com/);
      assert.match(error.cause?.message ?? "", /host res\.cloudinary\.com/);
      return true;
    },
  );
  assert.equal(requests, 0);
});

test("ensureVideoSourcesHaveNoAudio treats the missing-asset label as a valid non-empty assetId", async () => {
  const bytes = concat(box("ftyp"), moov("vide"));
  const rangeFetch = createRangeFetch(bytes);

  await ensureVideoSourcesHaveNoAudio(
    [{ assetId: "<ausente>", src: cloudinarySrc("placeholder-label") }],
    { fetchImpl: rangeFetch.fetchImpl },
  );

  assert.equal(rangeFetch.requests.length, 1);
});

test("ensureVideoSourcesHaveNoAudio validates every URL before fetching", async () => {
  const invalidCases = [
    {
      video: { assetId: "", src: cloudinarySrc() },
      expected: /assetId es obligatorio/,
      expectedAssetId: "<ausente>",
    },
    {
      video: {
        assetId: "invalid-url",
        src: "no es una URL",
      },
      expected: /src debe ser una URL válida/,
      expectedAssetId: "invalid-url",
    },
    {
      video: {
        assetId: "asset-http",
        src:
          "http://res.cloudinary.com/demo/video/upload/ac_none/v1/video.mp4",
      },
      expected: /debe usar HTTPS/,
      expectedAssetId: "asset-http",
    },
    {
      video: {
        assetId: "asset-host",
        src:
          "https://res.cloudinary.com.example.test/demo/video/upload/ac_none/v1/video.mp4",
      },
      expected: /host res\.cloudinary\.com/,
      expectedAssetId: "asset-host",
    },
    {
      video: {
        assetId: "invalid-route",
        src:
          "https://res.cloudinary.com/demo/image/upload/ac_none/v1/video.mp4",
      },
      expected: /URL de video upload de Cloudinary/,
      expectedAssetId: "invalid-route",
    },
    {
      video: {
        assetId: "public-id-token",
        src:
          "https://res.cloudinary.com/demo/video/upload/q_auto/v1/folder/ac_none/video.mp4",
      },
      expected: /transformación ac_none/,
      expectedAssetId: "public-id-token",
    },
    {
      video: {
        assetId: "no-transform",
        src:
          "https://res.cloudinary.com/demo/video/upload/v1/ac_none/video.mp4",
      },
      expected: /transformación ac_none/,
      expectedAssetId: "no-transform",
    },
    {
      video: {
        assetId: "bypass",
        src:
          "https://res.cloudinary.com/demo/video/upload/v1/ac_none/v2/video.mp4",
      },
      expected: /transformación ac_none/,
      expectedAssetId: "bypass",
    },
    {
      video: {
        assetId: "partial-token",
        src:
          "https://res.cloudinary.com/demo/video/upload/q_auto,xac_none/v1/video.mp4",
      },
      expected: /transformación ac_none/,
      expectedAssetId: "partial-token",
    },
    {
      video: {
        assetId: "missing-version",
        src:
          "https://res.cloudinary.com/demo/video/upload/ac_none/video.mp4",
      },
      expected: /versión/,
      expectedAssetId: "missing-version",
    },
  ];

  for (const {
    video,
    expected,
    expectedAssetId,
  } of invalidCases) {
    let requests = 0;
    await assert.rejects(
      () =>
        ensureVideoSourcesHaveNoAudio(
          [
            { assetId: "valid-first", src: cloudinarySrc("valid-first") },
            video,
          ],
          {
            async fetchImpl() {
              requests += 1;
              throw new Error("no debería ejecutarse");
            },
          },
        ),
      (error) => {
        assert.match(error.message, expected);
        assert.ok(error.message.includes(expectedAssetId));
        assert.match(error.message, /videos\[1\]/);
        assert.ok(error.cause instanceof Error);
        assert.match(error.cause.message, expected);
        return true;
      },
    );
    assert.equal(requests, 0);
  }
});

test("ensureVideoSourcesHaveNoAudio validates sparse arrays numerically before fetching", async () => {
  const videos = Array(2);
  videos[1] = {
    assetId: "video-asset",
    src: cloudinarySrc(),
  };
  let requests = 0;

  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(videos, {
        async fetchImpl() {
          requests += 1;
          throw new Error("no debería ejecutarse");
        },
      }),
    (error) => {
      assert.match(error.message, /videos\[0\]\.assetId es obligatorio/);
      assert.match(error.message, /<ausente>/);
      return true;
    },
  );
  assert.equal(requests, 0);
});

test("ensureVideoSourcesHaveNoAudio validates its collection and function options", async () => {
  await assert.rejects(
    () => ensureVideoSourcesHaveNoAudio(null),
    /videos debe ser un arreglo/,
  );

  for (const field of ["fetchImpl", "now"]) {
    await assert.rejects(
      () => ensureVideoSourcesHaveNoAudio([], { [field]: null }),
      new RegExp(`${field} debe ser una función`),
    );
  }
});

test("ensureVideoSourcesHaveNoAudio uses frozen defaults and validates safe positive options", async () => {
  assert.equal(Object.isFrozen(DEFAULT_MP4_INSPECTION_OPTIONS), true);

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
    for (const value of [
      0,
      -1,
      1.5,
      "2",
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      await assert.rejects(
        () => ensureVideoSourcesHaveNoAudio([], { [field]: value }),
        new RegExp(`${field} debe ser un entero positivo seguro`),
      );
    }
  }
});

test("ensureVideoSourcesHaveNoAudio bounds concurrent video inspections", async () => {
  const bytes = concat(box("ftyp"), moov("vide"));
  const videos = Array.from({ length: 5 }, (_, index) => ({
    assetId: `video-${index}`,
    src: cloudinarySrc(`video-${index}`),
  }));
  let releaseRequests;
  const requestGate = new Promise((resolve) => {
    releaseRequests = resolve;
  });
  let activeRequests = 0;
  let maximumActiveRequests = 0;
  let startedRequests = 0;

  const inspection = ensureVideoSourcesHaveNoAudio(videos, {
    concurrency: 2,
    async fetchImpl(_url, options) {
      startedRequests += 1;
      activeRequests += 1;
      maximumActiveRequests = Math.max(
        maximumActiveRequests,
        activeRequests,
      );
      await requestGate;
      activeRequests -= 1;
      const match = /^bytes=(\d+)-(\d+)$/.exec(
        new Headers(options.headers).get("Range"),
      );
      const start = Number(match[1]);
      const end = Math.min(Number(match[2]), bytes.length - 1);
      return new Response(bytes.subarray(start, end + 1), {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${bytes.length}`,
        },
      });
    },
  });

  assert.equal(startedRequests, 2);
  assert.equal(maximumActiveRequests, 2);
  releaseRequests();
  await inspection;

  assert.equal(startedRequests, videos.length);
  assert.equal(maximumActiveRequests, 2);
});

async function createManifestFile(t, manifest) {
  const directory = await mkdtemp(
    join(tmpdir(), "cloudinary-audio-runner-test-"),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const manifestPath = join(directory, "cloudinary-media.json");
  await writeFile(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  return manifestPath;
}

function manifestVideo() {
  return {
    assetId: "runner-video",
    sourceFolder: "chaco-implantes/cajas",
    publicId: "runner-video",
    category: "Instrumental",
    createdAt: "2026-07-25T12:00:00.000Z",
    title: "Producto instrumental",
    width: 1920,
    height: 1080,
    duration: 12.5,
    poster:
      "https://res.cloudinary.com/demo/video/upload/so_0,f_jpg,q_auto/v1/runner-video.jpg",
    src: cloudinarySrc("runner-video"),
  };
}

test("runVideoAudioVerification reads the manifest and reports its count", async (t) => {
  const video = manifestVideo();
  const manifestPath = await createManifestFile(t, {
    schemaVersion: 1,
    images: [],
    videos: [video],
  });
  const messages = [];
  let receivedVideos;

  const result = await runVideoAudioVerification({
    manifestPath,
    logger: {
      log(message) {
        messages.push(String(message));
      },
    },
    async videoAudioInspection(videos) {
      receivedVideos = videos;
    },
  });

  assert.deepEqual(receivedVideos, [video]);
  assert.deepEqual(result, { count: 1 });
  assert.deepEqual(messages, [
    "Inspeccionando audio de 1 videos...",
    "Videos sin pista de audio: 1.",
  ]);
});

test("runVideoAudioVerification propagates inspection failures", async (t) => {
  const manifestPath = await createManifestFile(t, {
    schemaVersion: 1,
    images: [],
    videos: [manifestVideo()],
  });

  await assert.rejects(
    () =>
      runVideoAudioVerification({
        manifestPath,
        logger: { log() {} },
        async videoAudioInspection() {
          throw new Error("pista soun detectada");
        },
      }),
    /pista soun detectada/,
  );
});
