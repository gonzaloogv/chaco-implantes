import {
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { basename, dirname, join } from "node:path";

const SCHEMA_VERSION = 1;
const CATEGORIES = new Set([
  "Productos",
  "Instrumental",
  "Eventos",
  "Quirófano",
]);

function emptyManifest() {
  return {
    schemaVersion: SCHEMA_VERSION,
    images: [],
    videos: [],
  };
}

function requireString(record, field, location) {
  if (typeof record?.[field] !== "string" || record[field].length === 0) {
    throw new Error(`Manifiesto inválido: falta ${location}.${field}.`);
  }
}

function requirePositiveNumber(record, field, location) {
  if (!Number.isFinite(record?.[field]) || record[field] <= 0) {
    throw new Error(
      `Manifiesto inválido: ${location}.${field} debe ser positivo.`,
    );
  }
}

function validateCommonItem(item, location) {
  for (const field of [
    "assetId",
    "sourceFolder",
    "publicId",
    "category",
    "createdAt",
    "title",
  ]) {
    requireString(item, field, location);
  }

  if (!CATEGORIES.has(item.category)) {
    throw new Error(`Manifiesto inválido: ${location}.category no es válida.`);
  }
  if (!Number.isFinite(Date.parse(item.createdAt))) {
    throw new Error(
      `Manifiesto inválido: ${location}.createdAt no es una fecha.`,
    );
  }

  requirePositiveNumber(item, "width", location);
  requirePositiveNumber(item, "height", location);
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error("Manifiesto inválido: se esperaba un objeto.");
  }
  if (manifest.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(
      `Manifiesto inválido: se requiere schemaVersion ${SCHEMA_VERSION}.`,
    );
  }
  if (!Array.isArray(manifest.images) || !Array.isArray(manifest.videos)) {
    throw new Error(
      "Manifiesto inválido: images y videos deben ser arreglos.",
    );
  }

  const seenAssetIds = new Set();
  manifest.images.forEach((item, index) => {
    const location = `images[${index}]`;
    validateCommonItem(item, location);
    requireString(item, "alt", location);
    requireString(item, "thumb", location);
    requireString(item, "full", location);

    if (
      item.generatedLabelNumber !== undefined &&
      (!Number.isInteger(item.generatedLabelNumber) ||
        item.generatedLabelNumber <= 0)
    ) {
      throw new Error(
        `Manifiesto inválido: ${location}.generatedLabelNumber debe ser un entero positivo.`,
      );
    }

    if (seenAssetIds.has(item.assetId)) {
      throw new Error(`Manifiesto inválido: assetId duplicado ${item.assetId}.`);
    }
    seenAssetIds.add(item.assetId);
  });

  manifest.videos.forEach((item, index) => {
    const location = `videos[${index}]`;
    validateCommonItem(item, location);
    requireString(item, "poster", location);
    requireString(item, "src", location);

    if (
      item.duration !== undefined &&
      (!Number.isFinite(item.duration) || item.duration < 0)
    ) {
      throw new Error(
        `Manifiesto inválido: ${location}.duration no es válida.`,
      );
    }
    if (
      item.audioEnabled !== undefined &&
      typeof item.audioEnabled !== "boolean"
    ) {
      throw new Error(
        `Manifiesto inválido: ${location}.audioEnabled debe ser booleano.`,
      );
    }

    if (seenAssetIds.has(item.assetId)) {
      throw new Error(`Manifiesto inválido: assetId duplicado ${item.assetId}.`);
    }
    seenAssetIds.add(item.assetId);
  });

  return manifest;
}

function serializeManifest(manifest) {
  validateManifest(manifest);
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

export async function readManifest(path, { allowMissing = false } = {}) {
  let content;

  try {
    content = await readFile(path, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT" && allowMissing) {
      return emptyManifest();
    }
    if (error?.code === "ENOENT") {
      throw new Error(`El manifiesto no existe: ${path}.`);
    }
    throw error;
  }

  let manifest;
  try {
    manifest = JSON.parse(content);
  } catch {
    throw new Error(`El manifiesto contiene JSON inválido: ${path}.`);
  }

  return validateManifest(manifest);
}

export function findRemovedAssetIds(previousManifest, nextManifest) {
  validateManifest(previousManifest);
  validateManifest(nextManifest);

  const previousIds = new Set([
    ...previousManifest.images.map(({ assetId }) => assetId),
    ...previousManifest.videos.map(({ assetId }) => assetId),
  ]);
  const nextIds = new Set([
    ...nextManifest.images.map(({ assetId }) => assetId),
    ...nextManifest.videos.map(({ assetId }) => assetId),
  ]);

  return [...previousIds]
    .filter((assetId) => !nextIds.has(assetId))
    .sort((left, right) => {
      if (left === right) return 0;
      return left < right ? -1 : 1;
    });
}

export function assertRemovalsAccepted(
  removedAssetIds,
  { acceptRemovals },
) {
  if (!Array.isArray(removedAssetIds)) {
    throw new Error("La lista de eliminaciones es inválida.");
  }
  if (typeof acceptRemovals !== "boolean") {
    throw new Error("acceptRemovals debe ser booleano.");
  }
  if (removedAssetIds.length === 0 || acceptRemovals) {
    return;
  }

  throw new Error(
    [
      `La sincronización quitaría ${removedAssetIds.length} recurso(s).`,
      ...removedAssetIds.map((assetId) => `- ${assetId}`),
      "Revisá el resultado y repetí con --accept-removals si es intencional.",
    ].join("\n"),
  );
}

export async function writeManifestAtomic(
  path,
  manifest,
  { renameImpl = rename } = {},
) {
  const content = serializeManifest(manifest);

  try {
    if ((await readFile(path, "utf8")) === content) {
      return { changed: false };
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const directory = dirname(path);
  await mkdir(directory, { recursive: true });
  const temporaryPath = join(
    directory,
    `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`,
  );

  try {
    await writeFile(temporaryPath, content, {
      encoding: "utf8",
      flag: "wx",
    });
    await renameImpl(temporaryPath, path);
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => undefined);
    throw error;
  }

  return { changed: true };
}
