import assert from "node:assert/strict";
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  assertRemovalsAccepted,
  findRemovedAssetIds,
  readManifest,
  writeManifestAtomic,
} from "./cloudinary-sync-io.mjs";

const emptyManifest = {
  schemaVersion: 1,
  images: [],
  videos: [],
};

const image = {
  assetId: "image-1",
  sourceFolder: "chaco-implantes/stand",
  publicId: "Congreso_Traumato-99_ocnsrl",
  category: "Eventos",
  createdAt: "2026-07-24T12:00:00.000Z",
  title: "Congreso de traumatología",
  alt: "Stand de Chaco Implantes",
  width: 1600,
  height: 1067,
  thumb:
    "https://res.cloudinary.com/demo/image/upload/thumb/v1/congreso.jpg",
  full:
    "https://res.cloudinary.com/demo/image/upload/full/v1/congreso.jpg",
};

const video = {
  assetId: "video-1",
  sourceFolder: "chaco-implantes/cajas",
  publicId: "recorrido-caja",
  category: "Instrumental",
  createdAt: "2026-07-25T12:00:00.000Z",
  title: "Recorrido por la caja",
  poster:
    "https://res.cloudinary.com/demo/video/upload/poster/v1/recorrido.jpg",
  src: "https://res.cloudinary.com/demo/video/upload/video/v1/recorrido.mp4",
  width: 1920,
  height: 1080,
  duration: 15,
};

async function createTempDirectory(t) {
  const directory = await mkdtemp(join(tmpdir(), "cloudinary-sync-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test("readManifest only initializes a missing file when explicitly allowed", async (t) => {
  const directory = await createTempDirectory(t);
  const path = join(directory, "missing.json");

  await assert.rejects(() => readManifest(path), /no existe/);
  assert.deepEqual(
    await readManifest(path, { allowMissing: true }),
    emptyManifest,
  );
});

test("readManifest rejects invalid JSON and unknown schema versions", async (t) => {
  const directory = await createTempDirectory(t);
  const path = join(directory, "manifest.json");

  await writeFile(path, "{not json", "utf8");
  await assert.rejects(() => readManifest(path), /JSON inválido/);

  await writeFile(
    path,
    JSON.stringify({ ...emptyManifest, schemaVersion: 2 }),
    "utf8",
  );
  await assert.rejects(() => readManifest(path), /schemaVersion 1/);
});

test("stored manifests validate generated label numbers", async (t) => {
  const directory = await createTempDirectory(t);
  const path = join(directory, "manifest.json");

  await writeFile(
    path,
    JSON.stringify({
      schemaVersion: 1,
      images: [{ ...image, generatedLabelNumber: 2 }],
      videos: [],
    }),
    "utf8",
  );
  assert.equal(
    (await readManifest(path)).images[0].generatedLabelNumber,
    2,
  );

  for (const invalid of [0, 1.5, "2"]) {
    await writeFile(
      path,
      JSON.stringify({
        schemaVersion: 1,
        images: [{ ...image, generatedLabelNumber: invalid }],
        videos: [],
      }),
      "utf8",
    );
    await assert.rejects(
      () => readManifest(path),
      /generatedLabelNumber debe ser un entero positivo/,
    );
  }
});

test("findRemovedAssetIds compares images and videos with stable ordering", () => {
  const previous = {
    schemaVersion: 1,
    images: [{ ...image, assetId: "z-image" }],
    videos: [{ ...video, assetId: "a-video" }],
  };
  const next = {
    schemaVersion: 1,
    images: [],
    videos: [{ ...video, assetId: "new-video" }],
  };

  assert.deepEqual(findRemovedAssetIds(previous, next), [
    "a-video",
    "z-image",
  ]);
});

test("assertRemovalsAccepted blocks reductions unless explicitly accepted", () => {
  assert.throws(
    () =>
      assertRemovalsAccepted(["asset-1", "asset-2"], {
        acceptRemovals: false,
      }),
    (error) => {
      assert.match(error.message, /--accept-removals/);
      assert.match(error.message, /asset-1/);
      assert.match(error.message, /asset-2/);
      return true;
    },
  );

  assert.doesNotThrow(() =>
    assertRemovalsAccepted(["asset-1"], {
      acceptRemovals: true,
    }),
  );
  assert.doesNotThrow(() =>
    assertRemovalsAccepted([], {
      acceptRemovals: false,
    }),
  );
});

test("writeManifestAtomic writes UTF-8 and skips identical content", async (t) => {
  const directory = await createTempDirectory(t);
  const path = join(directory, "generated", "manifest.json");
  const manifest = {
    schemaVersion: 1,
    images: [image],
    videos: [video],
  };

  assert.deepEqual(await writeManifestAtomic(path, manifest), {
    changed: true,
  });
  const firstContent = await readFile(path, "utf8");
  assert.match(firstContent, /traumatología/);
  assert.equal(firstContent.endsWith("\n"), true);

  assert.deepEqual(await writeManifestAtomic(path, manifest), {
    changed: false,
  });
  assert.equal(await readFile(path, "utf8"), firstContent);
});

test("writeManifestAtomic preserves the previous file and removes temp data when rename fails", async (t) => {
  const directory = await createTempDirectory(t);
  const path = join(directory, "manifest.json");
  await writeFile(path, `${JSON.stringify(emptyManifest, null, 2)}\n`, "utf8");

  await assert.rejects(
    () =>
      writeManifestAtomic(
        path,
        {
          schemaVersion: 1,
          images: [image],
          videos: [],
        },
        {
          renameImpl: async () => {
            throw new Error("rename failed");
          },
        },
      ),
    /rename failed/,
  );

  assert.equal(
    await readFile(path, "utf8"),
    `${JSON.stringify(emptyManifest, null, 2)}\n`,
  );
  assert.deepEqual(await readdir(directory), ["manifest.json"]);
});

test("stored manifests reject duplicate or incomplete asset records", async (t) => {
  const directory = await createTempDirectory(t);
  const path = join(directory, "manifest.json");

  await writeFile(
    path,
    JSON.stringify({
      schemaVersion: 1,
      images: [image],
      videos: [{ ...video, assetId: image.assetId }],
    }),
    "utf8",
  );
  await assert.rejects(() => readManifest(path), /assetId duplicado/);

  await writeFile(
    path,
    JSON.stringify({
      schemaVersion: 1,
      images: [{ assetId: "incomplete" }],
      videos: [],
    }),
    "utf8",
  );
  await assert.rejects(() => readManifest(path), /images\[0\].sourceFolder/);
});
