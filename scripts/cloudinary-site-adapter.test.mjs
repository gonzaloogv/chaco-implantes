import assert from "node:assert/strict";
import test from "node:test";

import { buildSiteMediaCollections } from "../src/data/cloudinary-media-adapter.mjs";

const baseGallery = [
  {
    category: "Productos",
    thumb: "/base-thumb.jpg",
    full: "/base-full.jpg",
    alt: "Producto local",
  },
];
const fallbackEvents = [
  {
    category: "Eventos",
    thumb: "/fallback-thumb.jpg",
    full: "/fallback-full.jpg",
    alt: "Evento manual",
  },
];
const standImage = {
  assetId: "stand-image",
  sourceFolder: "chaco-implantes/stand/2026",
  category: "Eventos",
  thumb: "https://example.com/stand-thumb.jpg",
  full: "https://example.com/stand-full.jpg",
  alt: "Evento sincronizado",
};
const cajasImage = {
  assetId: "cajas-image",
  sourceFolder: "chaco-implantes/cajas",
  category: "Instrumental",
  thumb: "https://example.com/cajas-thumb.jpg",
  full: "https://example.com/cajas-full.jpg",
  alt: "Caja sincronizada",
};
const standVideo = {
  assetId: "stand-video",
  sourceFolder: "chaco-implantes/stand",
  category: "Eventos",
  poster: "https://example.com/poster.jpg",
  src: "https://example.com/video.mp4",
  title: "Recorrido por el stand",
};

test("buildSiteMediaCollections keeps fallback events for an empty manifest", () => {
  const result = buildSiteMediaCollections({
    manifest: {
      schemaVersion: 1,
      images: [],
      videos: [],
    },
    baseGallery,
    fallbackEvents,
  });

  assert.deepEqual(result, {
    gallery: [...baseGallery, ...fallbackEvents],
    videos: [],
  });
});

test("buildSiteMediaCollections replaces fallback events and maps synchronized videos", () => {
  const result = buildSiteMediaCollections({
    manifest: {
      schemaVersion: 1,
      images: [standImage, cajasImage],
      videos: [standVideo],
    },
    baseGallery,
    fallbackEvents,
  });

  assert.deepEqual(result.gallery, [
    ...baseGallery,
    {
      category: "Eventos",
      thumb: standImage.thumb,
      full: standImage.full,
      alt: standImage.alt,
    },
    {
      category: "Instrumental",
      thumb: cajasImage.thumb,
      full: cajasImage.full,
      alt: cajasImage.alt,
    },
  ]);
  assert.equal(
    result.gallery.some(({ alt }) => alt === "Evento manual"),
    false,
  );
  assert.deepEqual(result.videos, [
    {
      id: "stand-video",
      category: "Eventos",
      poster: standVideo.poster,
      src: standVideo.src,
      title: standVideo.title,
    },
  ]);
});

test("buildSiteMediaCollections retains fallback events when only cajas is synchronized", () => {
  const result = buildSiteMediaCollections({
    manifest: {
      schemaVersion: 1,
      images: [cajasImage],
      videos: [],
    },
    baseGallery,
    fallbackEvents,
  });

  assert.deepEqual(result.gallery, [
    ...baseGallery,
    ...fallbackEvents,
    {
      category: "Instrumental",
      thumb: cajasImage.thumb,
      full: cajasImage.full,
      alt: cajasImage.alt,
    },
  ]);
});

test("buildSiteMediaCollections rejects duplicate asset identifiers", () => {
  assert.throws(
    () =>
      buildSiteMediaCollections({
        manifest: {
          schemaVersion: 1,
          images: [standImage],
          videos: [{ ...standVideo, assetId: standImage.assetId }],
        },
        baseGallery,
        fallbackEvents,
      }),
    /assetId duplicado: stand-image/,
  );
});

test("buildSiteMediaCollections rejects an incompatible manifest", () => {
  assert.throws(
    () =>
      buildSiteMediaCollections({
        manifest: {
          schemaVersion: 2,
          images: [],
          videos: [],
        },
        baseGallery,
        fallbackEvents,
      }),
    /schemaVersion 1/,
  );
});

test("buildSiteMediaCollections rejects blank fields and insecure delivery URLs", () => {
  assert.throws(
    () =>
      buildSiteMediaCollections({
        manifest: {
          schemaVersion: 1,
          images: [{ ...standImage, thumb: "   " }],
          videos: [],
        },
        baseGallery,
        fallbackEvents,
      }),
    /images\[0\].thumb/,
  );

  assert.throws(
    () =>
      buildSiteMediaCollections({
        manifest: {
          schemaVersion: 1,
          images: [],
          videos: [{ ...standVideo, src: "http://example.com/video.mp4" }],
        },
        baseGallery,
        fallbackEvents,
      }),
    /videos\[0\].src debe usar HTTPS/,
  );
});
