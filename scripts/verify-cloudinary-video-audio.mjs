import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { readManifest } from "./cloudinary-sync-io.mjs";
import {
  ensureVideoSourcesHaveAudio,
  ensureVideoSourcesHaveNoAudio,
} from "./cloudinary-video-audio.mjs";

export const DEFAULT_MANIFEST_PATH = fileURLToPath(
  new URL("../src/data/generated/cloudinary-media.json", import.meta.url),
);

export async function runVideoAudioVerification({
  manifestPath = DEFAULT_MANIFEST_PATH,
  logger = console,
  videoAudioInspection = ensureVideoSourcesHaveNoAudio,
  videoAudioPresenceInspection = ensureVideoSourcesHaveAudio,
} = {}) {
  const manifest = await readManifest(manifestPath);
  const count = manifest.videos.length;
  const silentVideos = manifest.videos.filter(
    (video) => video.audioEnabled !== true,
  );
  const audioEnabledVideos = manifest.videos.filter(
    (video) => video.audioEnabled === true,
  );

  if (silentVideos.length > 0) {
    logger.log(
      `Inspeccionando ausencia de audio en ${silentVideos.length} videos...`,
    );
    await videoAudioInspection(silentVideos);
    logger.log(`Videos sin pista de audio: ${silentVideos.length}.`);
  }
  if (audioEnabledVideos.length > 0) {
    logger.log(
      `Inspeccionando presencia de audio en ${audioEnabledVideos.length} videos...`,
    );
    await videoAudioPresenceInspection(audioEnabledVideos);
    logger.log(`Videos con pista de audio: ${audioEnabledVideos.length}.`);
  }

  return {
    count,
    silentCount: silentVideos.length,
    audioEnabledCount: audioEnabledVideos.length,
  };
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
