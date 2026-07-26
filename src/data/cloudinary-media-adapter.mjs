const STAND_FOLDER = "chaco-implantes/stand";
const CATEGORIES = new Set([
  "Productos",
  "Instrumental",
  "Eventos",
  "Quirófano",
]);

function requireString(record, field, location) {
  if (
    typeof record?.[field] !== "string" ||
    record[field].trim().length === 0
  ) {
    throw new Error(`Manifiesto inválido: falta ${location}.${field}.`);
  }
}

function requireHttpsUrl(record, field, location) {
  requireString(record, field, location);

  try {
    if (new URL(record[field]).protocol !== "https:") {
      throw new Error();
    }
  } catch {
    throw new Error(
      `Manifiesto inválido: ${location}.${field} debe usar HTTPS.`,
    );
  }
}

function validateCategory(record, location) {
  requireString(record, "category", location);
  if (!CATEGORIES.has(record.category)) {
    throw new Error(`Manifiesto inválido: ${location}.category no es válida.`);
  }
}

function isStandFolder(sourceFolder) {
  return (
    sourceFolder === STAND_FOLDER ||
    sourceFolder.startsWith(`${STAND_FOLDER}/`)
  );
}

export function buildSiteMediaCollections({
  manifest,
  baseGallery,
  fallbackEvents,
}) {
  if (manifest?.schemaVersion !== 1) {
    throw new Error("El manifiesto debe usar schemaVersion 1.");
  }
  if (!Array.isArray(manifest.images) || !Array.isArray(manifest.videos)) {
    throw new Error(
      "Manifiesto inválido: images y videos deben ser arreglos.",
    );
  }
  if (!Array.isArray(baseGallery) || !Array.isArray(fallbackEvents)) {
    throw new Error("Las colecciones editoriales deben ser arreglos.");
  }

  const seenAssetIds = new Set();
  const generatedGallery = manifest.images.map((image, index) => {
    const location = `images[${index}]`;
    for (const field of ["assetId", "sourceFolder", "alt"]) {
      requireString(image, field, location);
    }
    requireHttpsUrl(image, "thumb", location);
    requireHttpsUrl(image, "full", location);
    validateCategory(image, location);

    if (seenAssetIds.has(image.assetId)) {
      throw new Error(`assetId duplicado: ${image.assetId}.`);
    }
    seenAssetIds.add(image.assetId);

    return {
      category: image.category,
      thumb: image.thumb,
      full: image.full,
      alt: image.alt,
    };
  });

  const videos = manifest.videos.map((video, index) => {
    const location = `videos[${index}]`;
    for (const field of ["assetId", "sourceFolder", "title"]) {
      requireString(video, field, location);
    }
    requireHttpsUrl(video, "poster", location);
    requireHttpsUrl(video, "src", location);
    validateCategory(video, location);

    if (seenAssetIds.has(video.assetId)) {
      throw new Error(`assetId duplicado: ${video.assetId}.`);
    }
    seenAssetIds.add(video.assetId);

    return {
      id: video.assetId,
      category: video.category,
      poster: video.poster,
      src: video.src,
      title: video.title,
    };
  });

  const hasSyncedStandImages = manifest.images.some(({ sourceFolder }) =>
    isStandFolder(sourceFolder),
  );

  return {
    gallery: [
      ...baseGallery,
      ...(hasSyncedStandImages ? [] : fallbackEvents),
      ...generatedGallery,
    ],
    videos,
  };
}
