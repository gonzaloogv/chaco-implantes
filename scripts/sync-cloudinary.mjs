import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createCloudinaryAdminClient } from "./cloudinary-admin.mjs";
import {
  cloudinaryFolderMode,
  cloudinaryFolders,
} from "./cloudinary-folders.config.mjs";
import {
  buildManifest,
  buildSearchExpression,
  validateCloudinaryConfig,
} from "./cloudinary-media.mjs";
import {
  assertRemovalsAccepted,
  findRemovedAssetIds,
  readManifest,
  writeManifestAtomic,
} from "./cloudinary-sync-io.mjs";
import { ensureVideoSourcesReady } from "./cloudinary-video-readiness.mjs";

const DEFAULT_OUTPUT_PATH = fileURLToPath(
  new URL("../src/data/generated/cloudinary-media.json", import.meta.url),
);
const ENV_LOCAL_PATH = fileURLToPath(
  new URL("../.env.local", import.meta.url),
);
const CLI_FLAGS = new Set([
  "--accept-removals",
  "--verify-folder-mode",
]);

function validateCredentials(credentials) {
  const fields = ["cloudName", "apiKey", "apiSecret"];
  for (const field of fields) {
    if (
      typeof credentials?.[field] !== "string" ||
      credentials[field].trim().length === 0
    ) {
      throw new Error(`La credencial ${field} es obligatoria.`);
    }
  }

  return {
    cloudName: credentials.cloudName.trim(),
    apiKey: credentials.apiKey.trim(),
    apiSecret: credentials.apiSecret.trim(),
  };
}

export function readCredentials(environment) {
  const mapping = {
    cloudName: "CLOUDINARY_CLOUD_NAME",
    apiKey: "CLOUDINARY_API_KEY",
    apiSecret: "CLOUDINARY_API_SECRET",
  };
  const missing = Object.values(mapping).filter((name) => {
    const value = environment?.[name];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias: ${missing.join(", ")}.`,
    );
  }

  return {
    cloudName: environment[mapping.cloudName].trim(),
    apiKey: environment[mapping.apiKey].trim(),
    apiSecret: environment[mapping.apiSecret].trim(),
  };
}

export function parseCliArgs(args) {
  if (!Array.isArray(args)) {
    throw new Error("Los argumentos de la CLI son inválidos.");
  }

  for (const argument of args) {
    if (!CLI_FLAGS.has(argument)) {
      throw new Error(`Argumento desconocido: ${argument}.`);
    }
  }

  return {
    acceptRemovals: args.includes("--accept-removals"),
    verifyFolderMode: args.includes("--verify-folder-mode"),
  };
}

export async function runSync({
  credentials,
  folderMode,
  sources,
  client,
  outputPath = DEFAULT_OUTPUT_PATH,
  acceptRemovals = false,
  verifyFolderMode = false,
  logger = console,
  videoReadiness = ensureVideoSourcesReady,
}) {
  const safeCredentials = validateCredentials(credentials);
  const safeSources = validateCloudinaryConfig({ folderMode, sources });
  const adminClient =
    client ?? createCloudinaryAdminClient(safeCredentials);

  if (
    !adminClient ||
    typeof adminClient.searchResources !== "function" ||
    typeof adminClient.getFolderMode !== "function"
  ) {
    throw new Error("El cliente de Cloudinary es inválido.");
  }
  if (
    typeof acceptRemovals !== "boolean" ||
    typeof verifyFolderMode !== "boolean"
  ) {
    throw new Error("Las opciones de sincronización deben ser booleanas.");
  }

  const previousManifest = await readManifest(outputPath, {
    allowMissing: true,
  });

  if (verifyFolderMode) {
    const remoteFolderMode = await adminClient.getFolderMode();
    if (remoteFolderMode !== folderMode) {
      throw new Error(
        `Cloudinary informa el modo remoto "${remoteFolderMode}", pero el proyecto tiene configurado "${folderMode}".`,
      );
    }
  }

  const sourceResults = [];
  for (const source of safeSources) {
    const expression = buildSearchExpression(folderMode, source.path);
    const resources = await adminClient.searchResources({ expression });
    sourceResults.push({ source, resources });
  }

  const { manifest, skipped, countsBySource } = buildManifest({
    folderMode,
    sourceResults,
    previousManifest,
  });
  const removedAssetIds = findRemovedAssetIds(previousManifest, manifest);
  assertRemovalsAccepted(removedAssetIds, { acceptRemovals });

  if (manifest.videos.length > 0) {
    logger.log(
      `Comprobando reproducción de ${manifest.videos.length} videos...`,
    );
    await videoReadiness(manifest.videos);
    logger.log(`Videos listos: ${manifest.videos.length}.`);
  }

  const { changed } = await writeManifestAtomic(outputPath, manifest);

  for (const count of countsBySource) {
    logger.log(
      `${count.path}: ${count.images} imágenes, ${count.videos} videos, ${count.skipped} omitidos.`,
    );
  }
  for (const skippedResource of skipped) {
    logger.warn(
      `Omitido ${skippedResource.assetId} (${skippedResource.sourcePath}): ${skippedResource.reason}.`,
    );
  }
  if (removedAssetIds.length > 0) {
    logger.warn(
      `Eliminaciones aceptadas: ${removedAssetIds.join(", ")}.`,
    );
  }
  logger.log(
    changed
      ? `Manifiesto actualizado: ${outputPath}.`
      : "El manifiesto ya estaba actualizado.",
  );

  return {
    changed,
    manifest,
    skipped,
    countsBySource,
    removedAssetIds,
  };
}

async function main() {
  if (existsSync(ENV_LOCAL_PATH)) {
    process.loadEnvFile(ENV_LOCAL_PATH);
  }

  const options = parseCliArgs(process.argv.slice(2));
  await runSync({
    credentials: readCredentials(process.env),
    folderMode: cloudinaryFolderMode,
    sources: cloudinaryFolders,
    ...options,
  });
}

const isMain =
  typeof process.argv[1] === "string" &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) {
  main().catch((error) => {
    const message =
      error instanceof Error ? error.message : "Error desconocido.";
    console.error(`No se pudo sincronizar Cloudinary: ${message}`);
    process.exitCode = 1;
  });
}
