import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { readManifest } from "./cloudinary-sync-io.mjs";
import { ensureVideoSourcesHaveNoAudio } from "./cloudinary-video-audio.mjs";

export const DEFAULT_MANIFEST_PATH = fileURLToPath(
  new URL("../src/data/generated/cloudinary-media.json", import.meta.url),
);

export async function runVideoAudioVerification({
  manifestPath = DEFAULT_MANIFEST_PATH,
  logger = console,
  videoAudioInspection = ensureVideoSourcesHaveNoAudio,
} = {}) {
  const manifest = await readManifest(manifestPath);
  const count = manifest.videos.length;

  logger.log(`Inspeccionando audio de ${count} videos...`);
  await videoAudioInspection(manifest.videos);
  logger.log(`Videos sin pista de audio: ${count}.`);

  return { count };
}

const isMain =
  typeof process.argv[1] === "string" &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) {
  runVideoAudioVerification().catch((error) => {
    console.error(
      error instanceof Error ? error.message : String(error),
    );
    process.exitCode = 1;
  });
}
