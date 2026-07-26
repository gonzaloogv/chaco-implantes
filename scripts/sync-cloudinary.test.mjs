import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  parseCliArgs,
  readCredentials,
  runSync,
} from "./sync-cloudinary.mjs";

const credentials = {
  cloudName: "demo",
  apiKey: "viewer-key",
  apiSecret: "viewer-secret",
};

const sources = [
  {
    path: "chaco-implantes/stand",
    imageCategory: "Eventos",
    videoCategory: "Eventos",
    fixedImageTitle: "61° Congreso Traumatología",
  },
  {
    path: "chaco-implantes/cajas",
    imageCategory: "Instrumental",
    videoCategory: "Instrumental",
    unnamedImageLabel: "Producto instrumental",
    fixedVideoTitle: "Producto instrumental",
  },
];

function imageResource({
  assetId,
  folder,
  publicId = assetId,
  createdAt = "2026-07-25T12:00:00Z",
}) {
  return {
    asset_id: assetId,
    public_id: publicId,
    resource_type: "image",
    type: "upload",
    status: "active",
    format: "jpg",
    secure_url: `https://res.cloudinary.com/demo/image/upload/v1/${publicId}.jpg`,
    asset_folder: folder,
    created_at: createdAt,
    width: 1200,
    height: 800,
    display_name: publicId,
  };
}

function videoResource({
  assetId,
  folder,
  publicId = assetId,
  createdAt = "2026-07-25T12:00:00Z",
}) {
  return {
    asset_id: assetId,
    public_id: publicId,
    resource_type: "video",
    type: "upload",
    status: "active",
    format: "mov",
    secure_url: `https://res.cloudinary.com/demo/video/upload/v1/${publicId}.mov`,
    asset_folder: folder,
    created_at: createdAt,
    width: 1920,
    height: 1080,
    duration: 12.5,
    display_name: publicId,
  };
}

async function createTempOutput(t, manifest) {
  const directory = await mkdtemp(join(tmpdir(), "cloudinary-command-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const outputPath = join(directory, "cloudinary-media.json");

  if (manifest) {
    await writeFile(
      outputPath,
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );
  }

  return outputPath;
}

function createLogger() {
  const messages = [];
  return {
    messages,
    log(message) {
      messages.push(String(message));
    },
    warn(message) {
      messages.push(String(message));
    },
  };
}

test("parseCliArgs accepts only the two explicit safety flags", () => {
  assert.deepEqual(parseCliArgs([]), {
    acceptRemovals: false,
    verifyFolderMode: false,
  });
  assert.deepEqual(
    parseCliArgs(["--verify-folder-mode", "--accept-removals"]),
    {
      acceptRemovals: true,
      verifyFolderMode: true,
    },
  );
  assert.throws(() => parseCliArgs(["--fallback"]), /Argumento desconocido/);
});

test("readCredentials maps environment variables and reports every missing name", () => {
  assert.deepEqual(
    readCredentials({
      CLOUDINARY_CLOUD_NAME: "demo",
      CLOUDINARY_API_KEY: "key",
      CLOUDINARY_API_SECRET: "secret",
    }),
    {
      cloudName: "demo",
      apiKey: "key",
      apiSecret: "secret",
    },
  );

  assert.throws(
    () => readCredentials({ CLOUDINARY_CLOUD_NAME: "demo" }),
    (error) => {
      assert.match(error.message, /CLOUDINARY_API_KEY/);
      assert.match(error.message, /CLOUDINARY_API_SECRET/);
      return true;
    },
  );
});

test("runSync performs one independent search per configured source", async (t) => {
  const outputPath = await createTempOutput(t);
  const searches = [];
  const logger = createLogger();
  const client = {
    async searchResources({ expression }) {
      searches.push(expression);
      if (expression.includes("chaco-implantes/stand")) {
        return [
          imageResource({
            assetId: "stand-image",
            folder: "chaco-implantes/stand/2026",
          }),
        ];
      }
      return [
        imageResource({
          assetId: "cajas-image",
          folder: "chaco-implantes/cajas",
        }),
      ];
    },
    async getFolderMode() {
      throw new Error("getFolderMode should not run");
    },
  };

  const result = await runSync({
    credentials,
    folderMode: "dynamic",
    sources,
    client,
    outputPath,
    logger,
  });

  assert.equal(searches.length, 2);
  assert.match(searches[0], /asset_folder="chaco-implantes\/stand"/);
  assert.match(searches[1], /asset_folder="chaco-implantes\/cajas"/);
  assert.equal(result.changed, true);
  assert.deepEqual(result.removedAssetIds, []);
  assert.equal(result.manifest.images.length, 2);
  assert.equal(
    result.manifest.images.find(({ assetId }) => assetId === "stand-image")
      .title,
    "61° Congreso Traumatología",
  );
  assert.match(logger.messages.join("\n"), /stand: 1 imágenes, 0 videos/);
  assert.match(logger.messages.join("\n"), /cajas: 1 imágenes, 0 videos/);

  const stored = JSON.parse(await readFile(outputPath, "utf8"));
  assert.deepEqual(stored, result.manifest);
});

test("runSync passes previous label assignments to the manifest builder", async (t) => {
  const previous = {
    schemaVersion: 1,
    images: [
      {
        assetId: "cajas-image",
        sourceFolder: "chaco-implantes/cajas",
        publicId: "cajas-image",
        category: "Instrumental",
        createdAt: "2026-07-25T12:00:00.000Z",
        title: "Producto instrumental 4",
        alt: "Producto instrumental 4",
        generatedLabelNumber: 4,
        width: 1200,
        height: 800,
        thumb: "https://example.com/thumb.jpg",
        full: "https://example.com/full.jpg",
      },
    ],
    videos: [],
  };
  const outputPath = await createTempOutput(t, previous);
  const client = {
    async searchResources({ expression }) {
      const isStand = expression.includes("/stand");
      return [
        imageResource({
          assetId: isStand ? "stand-image" : "cajas-image",
          folder: isStand
            ? "chaco-implantes/stand"
            : "chaco-implantes/cajas",
        }),
      ];
    },
    async getFolderMode() {
      return "dynamic";
    },
  };

  const result = await runSync({
    credentials,
    folderMode: "dynamic",
    sources,
    client,
    outputPath,
    logger: createLogger(),
  });

  const cajasImage = result.manifest.images.find(
    ({ assetId }) => assetId === "cajas-image",
  );
  assert.deepEqual(
    {
      title: cajasImage.title,
      alt: cajasImage.alt,
      generatedLabelNumber: cajasImage.generatedLabelNumber,
    },
    {
      title: "Producto instrumental 4",
      alt: "Producto instrumental 4",
      generatedLabelNumber: 4,
    },
  );
});

test("runSync verifies built manifest videos before publishing", async (t) => {
  const outputPath = await createTempOutput(t);
  const logger = createLogger();
  let readinessCalls = 0;
  let receivedVideos;
  const client = {
    async searchResources({ expression }) {
      if (expression.includes("/stand")) {
        return [
          imageResource({
            assetId: "stand-image",
            folder: "chaco-implantes/stand",
          }),
        ];
      }
      return [
        videoResource({
          assetId: "cajas-video",
          folder: "chaco-implantes/cajas",
        }),
      ];
    },
    async getFolderMode() {
      return "dynamic";
    },
  };

  const result = await runSync({
    credentials,
    folderMode: "dynamic",
    sources,
    client,
    outputPath,
    logger,
    async videoReadiness(videos) {
      readinessCalls += 1;
      receivedVideos = videos;
    },
  });

  assert.equal(readinessCalls, 1);
  assert.deepEqual(receivedVideos, result.manifest.videos);
  assert.deepEqual(
    receivedVideos.map(({ assetId, title, src }) => ({
      assetId,
      title,
      src,
    })),
    [
      {
        assetId: "cajas-video",
        title: "Producto instrumental",
        src:
          "https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto,ac_none/v1/cajas-video.mp4",
      },
    ],
  );
  assert.match(
    logger.messages.join("\n"),
    /Comprobando reproducción de 1 videos/,
  );
  assert.match(logger.messages.join("\n"), /Videos listos: 1/);
});

test("runSync preserves the previous manifest when video readiness fails", async (t) => {
  const previous = {
    schemaVersion: 1,
    images: [],
    videos: [],
  };
  const outputPath = await createTempOutput(t, previous);
  const previousContent = await readFile(outputPath, "utf8");
  let receivedVideos;
  const client = {
    async searchResources({ expression }) {
      if (expression.includes("/stand")) {
        return [
          imageResource({
            assetId: "stand-image",
            folder: "chaco-implantes/stand",
          }),
        ];
      }
      return [
        videoResource({
          assetId: "cajas-video",
          folder: "chaco-implantes/cajas",
        }),
      ];
    },
    async getFolderMode() {
      return "dynamic";
    },
  };

  await assert.rejects(
    () =>
      runSync({
        credentials,
        folderMode: "dynamic",
        sources,
        client,
        outputPath,
        logger: createLogger(),
        async videoReadiness(videos) {
          receivedVideos = videos;
          throw new Error("video todavía en proceso");
        },
      }),
    /video todavía en proceso/,
  );

  assert.equal(receivedVideos.length, 1);
  assert.equal(receivedVideos[0].assetId, "cajas-video");
  assert.equal(await readFile(outputPath, "utf8"), previousContent);
});

test("runSync only verifies the remote folder mode when requested", async (t) => {
  const outputPath = await createTempOutput(t);
  let modeChecks = 0;
  let searches = 0;
  const client = {
    async getFolderMode() {
      modeChecks += 1;
      return "fixed";
    },
    async searchResources() {
      searches += 1;
      return [];
    },
  };

  await assert.rejects(
    () =>
      runSync({
        credentials,
        folderMode: "dynamic",
        sources,
        client,
        outputPath,
        verifyFolderMode: true,
        logger: createLogger(),
      }),
    /modo remoto "fixed".*configurado "dynamic"/,
  );
  assert.equal(modeChecks, 1);
  assert.equal(searches, 0);
});

test("runSync leaves the previous manifest intact when Search fails", async (t) => {
  const previous = {
    schemaVersion: 1,
    images: [
      {
        assetId: "previous",
        sourceFolder: "chaco-implantes/stand",
        publicId: "previous",
        category: "Eventos",
        createdAt: "2026-07-20T12:00:00.000Z",
        title: "Anterior",
        alt: "Imagen anterior",
        width: 1200,
        height: 800,
        thumb: "https://res.cloudinary.com/demo/image/upload/thumb/previous.jpg",
        full: "https://res.cloudinary.com/demo/image/upload/full/previous.jpg",
      },
    ],
    videos: [],
  };
  const outputPath = await createTempOutput(t, previous);
  const previousContent = await readFile(outputPath, "utf8");
  const client = {
    async searchResources() {
      throw new Error("Search unavailable");
    },
    async getFolderMode() {
      return "dynamic";
    },
  };

  await assert.rejects(
    () =>
      runSync({
        credentials,
        folderMode: "dynamic",
        sources,
        client,
        outputPath,
        logger: createLogger(),
      }),
    /Search unavailable/,
  );
  assert.equal(await readFile(outputPath, "utf8"), previousContent);
});

test("runSync blocks valid reductions until acceptRemovals is true", async (t) => {
  const previous = {
    schemaVersion: 1,
    images: [
      {
        assetId: "removed",
        sourceFolder: "chaco-implantes/stand",
        publicId: "removed",
        category: "Eventos",
        createdAt: "2026-07-20T12:00:00.000Z",
        title: "A retirar",
        alt: "A retirar",
        width: 1200,
        height: 800,
        thumb: "https://res.cloudinary.com/demo/image/upload/thumb/removed.jpg",
        full: "https://res.cloudinary.com/demo/image/upload/full/removed.jpg",
      },
    ],
    videos: [],
  };
  const outputPath = await createTempOutput(t, previous);
  const client = {
    async searchResources({ expression }) {
      const folder = expression.includes("/stand")
        ? "chaco-implantes/stand"
        : "chaco-implantes/cajas";
      return [
        imageResource({
          assetId: folder.endsWith("stand") ? "new-stand" : "new-cajas",
          folder,
        }),
      ];
    },
    async getFolderMode() {
      return "dynamic";
    },
  };

  await assert.rejects(
    () =>
      runSync({
        credentials,
        folderMode: "dynamic",
        sources,
        client,
        outputPath,
        logger: createLogger(),
      }),
    /--accept-removals/,
  );
  assert.equal(JSON.parse(await readFile(outputPath, "utf8")).images[0].assetId, "removed");

  const result = await runSync({
    credentials,
    folderMode: "dynamic",
    sources,
    client,
    outputPath,
    acceptRemovals: true,
    logger: createLogger(),
  });
  assert.deepEqual(result.removedAssetIds, ["removed"]);
  assert.deepEqual(
    JSON.parse(await readFile(outputPath, "utf8")).images.map(
      ({ assetId }) => assetId,
    ),
    ["new-cajas", "new-stand"],
  );
});

test("runSync rejects a source with no public media before writing", async (t) => {
  const outputPath = await createTempOutput(t, {
    schemaVersion: 1,
    images: [],
    videos: [],
  });
  const previousContent = await readFile(outputPath, "utf8");
  const client = {
    async searchResources({ expression }) {
      if (expression.includes("/stand")) return [];
      return [
        imageResource({
          assetId: "cajas-image",
          folder: "chaco-implantes/cajas",
        }),
      ];
    },
    async getFolderMode() {
      return "dynamic";
    },
  };

  await assert.rejects(
    () =>
      runSync({
        credentials,
        folderMode: "dynamic",
        sources,
        client,
        outputPath,
        logger: createLogger(),
      }),
    /stand no produjo recursos publicables/,
  );
  assert.equal(await readFile(outputPath, "utf8"), previousContent);
});
