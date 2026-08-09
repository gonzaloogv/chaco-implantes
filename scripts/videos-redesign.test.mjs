import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const videosSource = readFileSync(
  new URL("../src/pages/videos.astro", import.meta.url),
  "utf8",
);
const siteSource = readFileSync(
  new URL("../src/data/site.ts", import.meta.url),
  "utf8",
);
const videosStyles = readFileSync(
  new URL("../src/styles/videos.css", import.meta.url),
  "utf8",
);
const videoPlayerSource = readFileSync(
  new URL("../src/components/VideoPlayer.astro", import.meta.url),
  "utf8",
);

test("Galería elimina las dos tarjetas genéricas señaladas", () => {
  assert.doesNotMatch(siteSource, /Caja de instrumental quirúrgico/);
  assert.doesNotMatch(siteSource, /Insumos y descartables/);
});

test("Videos adopta una composición editorial propia", () => {
  assert.match(videosSource, /import "\.\.\/styles\/videos\.css"/);
  assert.match(videosSource, /data-videos-hero/);
  assert.match(videosSource, /data-video-featured/);
  assert.match(videosSource, /data-videos-library/);
  assert.doesNotMatch(videosSource, /\bpremium-card\b/);
  assert.doesNotMatch(videosSource, /\bdark-card\b/);
});

test("El video de Eventos se prioriza sin perder el resto del archivo", () => {
  assert.match(
    videosSource,
    /videos\.find\(\(video\) => video\.category === "Eventos"\) \?\? videos\[0\]/,
  );
  assert.match(videosSource, /const libraryVideos = featuredVideo/);
  assert.match(videosSource, /videos\.filter\(\(video\) => video\.id !== featuredVideo\.id\)/);
  assert.match(videosSource, /libraryVideos\.map/);
});

test("Videos conserva reproducción, filtros y navegación hacia Galería", () => {
  assert.match(videosSource, /<VideoPlayer/);
  assert.match(videosSource, /data-video-filters/);
  assert.match(videosSource, /data-video-filter=/);
  assert.match(videosSource, /href="\/galeria"/);
  assert.match(videosSource, /data-video-item/);
  assert.equal(
    (videosSource.match(/audioEnabled=\{[^}]+\.audioEnabled\}/g) ?? []).length,
    2,
  );
  assert.match(videoPlayerSource, /audioEnabled\?: boolean/);
  assert.match(videoPlayerSource, /data-video-volume/);
  assert.match(videoPlayerSource, /\{!audioEnabled && <span class="video-player__badge">SIN AUDIO<\/span>\}/);
});

test("El reproductor permite ajustar el volumen sin perder el mute", () => {
  assert.match(videoPlayerSource, /data-video-volume-range/);
  assert.match(
    videoPlayerSource,
    /data-video-volume-range[\s\S]*?type="range"[\s\S]*?min="0"[\s\S]*?max="100"/,
  );
  assert.match(
    videoPlayerSource,
    /\.video-player__volume-control:(?:hover|focus-within)[\s\S]*?\.video-player__volume-panel/,
  );
  assert.match(
    videoPlayerSource,
    /volumeRange\?\.addEventListener\("input"[\s\S]*?video\.volume\s*=\s*nextVolume[\s\S]*?video\.muted\s*=\s*nextVolume === 0/,
  );
});

test("La biblioteca limita la carga visual inicial y permite ampliar el archivo", () => {
  assert.match(videosSource, /const VIDEO_PAGE_SIZE = 12/);
  assert.match(videosSource, /data-video-library/);
  assert.match(videosSource, /data-video-load-more/);
  assert.match(videosSource, /let visibleLimit = VIDEO_PAGE_SIZE/);
  assert.match(videosSource, /visibleLimit \+= VIDEO_PAGE_SIZE/);
});

test("El hero de Videos enlaza directamente con Galería", () => {
  assert.match(
    videosSource,
    /data-videos-hero-action[\s\S]*?href="\/galeria"/,
  );
});

test("El destacado conserva 16:9 y expone pantalla completa desde el estado inicial", () => {
  assert.match(
    videosStyles,
    /\.videos-featured__player \.video-player:not\(:fullscreen\)\s*{[\s\S]*?height:\s*auto/,
  );
  assert.match(
    videosStyles,
    /grid-template-columns:\s*minmax\(0,\s*3fr\) minmax\(0,\s*2fr\)/,
  );
  assert.match(
    videosSource,
    /data-video-featured[\s\S]*?<VideoPlayer[\s\S]*?showIdleControls/,
  );
  assert.match(videoPlayerSource, /showIdleControls\?: boolean/);
  assert.match(videoPlayerSource, /data-show-idle-controls={String\(showIdleControls\)}/);
  assert.match(
    videoPlayerSource,
    /\[data-show-idle-controls="true"\]\[data-state="idle"\][\s\S]*?visibility:\s*visible/,
  );
});
