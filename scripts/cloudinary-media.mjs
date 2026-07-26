const FOLDER_MODES = new Set(["dynamic", "fixed"]);
const GALLERY_CATEGORIES = new Set([
  "Productos",
  "Instrumental",
  "Eventos",
  "Quirófano",
]);
const SAFE_FOLDER_PATH = /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/;
const IMAGE_THUMB_TRANSFORM =
  "f_auto,q_auto,c_fill,g_auto,w_600,h_400";
const IMAGE_FULL_TRANSFORM = "f_auto,q_auto,c_limit,w_1920";
const VIDEO_SOURCE_TRANSFORM = "f_mp4,q_auto";
const VIDEO_POSTER_TRANSFORM =
  "so_0,f_jpg,q_auto,c_fill,g_auto,w_600,h_400";

function assertFolderMode(folderMode) {
  if (!FOLDER_MODES.has(folderMode)) {
    throw new Error('folderMode debe ser "dynamic" o "fixed".');
  }
}

function assertFolderPath(folderPath) {
  if (typeof folderPath !== "string" || !SAFE_FOLDER_PATH.test(folderPath)) {
    throw new Error(`Ruta de Cloudinary inválida: ${String(folderPath)}.`);
  }
}

function pathsOverlap(left, right) {
  return (
    left === right ||
    left.startsWith(`${right}/`) ||
    right.startsWith(`${left}/`)
  );
}

function normalizeOptionalTextOption(source, fieldName) {
  if (source[fieldName] === undefined) return undefined;
  if (
    typeof source[fieldName] !== "string" ||
    source[fieldName].trim().length === 0
  ) {
    throw new Error(
      `${fieldName} debe ser texto no vacío para ${source.path}.`,
    );
  }
  return source[fieldName].trim();
}

export function validateCloudinaryConfig({ folderMode, sources }) {
  assertFolderMode(folderMode);

  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error("La configuración debe incluir al menos una fuente.");
  }

  const normalized = sources.map((source, index) => {
    if (!source || typeof source !== "object") {
      throw new Error(`La fuente ${index + 1} es inválida.`);
    }

    assertFolderPath(source.path);

    if (!GALLERY_CATEGORIES.has(source.imageCategory)) {
      throw new Error(
        `La categoría de imagen inválida para ${source.path}: ${String(source.imageCategory)}.`,
      );
    }

    if (!GALLERY_CATEGORIES.has(source.videoCategory)) {
      throw new Error(
        `La categoría de video inválida para ${source.path}: ${String(source.videoCategory)}.`,
      );
    }

    if (
      source.allowEmpty !== undefined &&
      typeof source.allowEmpty !== "boolean"
    ) {
      throw new Error(`allowEmpty debe ser booleano para ${source.path}.`);
    }

    const unnamedImageLabel = normalizeOptionalTextOption(
      source,
      "unnamedImageLabel",
    );
    const fixedImageTitle = normalizeOptionalTextOption(
      source,
      "fixedImageTitle",
    );
    const fixedVideoTitle = normalizeOptionalTextOption(
      source,
      "fixedVideoTitle",
    );

    if (fixedImageTitle && unnamedImageLabel) {
      throw new Error(
        `fixedImageTitle y unnamedImageLabel no pueden coexistir para ${source.path}.`,
      );
    }

    return {
      path: source.path,
      imageCategory: source.imageCategory,
      videoCategory: source.videoCategory,
      allowEmpty: source.allowEmpty ?? false,
      ...(unnamedImageLabel ? { unnamedImageLabel } : {}),
      ...(fixedImageTitle ? { fixedImageTitle } : {}),
      ...(fixedVideoTitle ? { fixedVideoTitle } : {}),
    };
  });

  for (let leftIndex = 0; leftIndex < normalized.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < normalized.length;
      rightIndex += 1
    ) {
      const left = normalized[leftIndex].path;
      const right = normalized[rightIndex].path;

      if (pathsOverlap(left, right)) {
        throw new Error(
          `La fuente "${left}" se superpone con "${right}".`,
        );
      }
    }
  }

  return normalized;
}

export function buildSearchExpression(folderMode, folderPath) {
  assertFolderMode(folderMode);
  assertFolderPath(folderPath);

  const folderField = folderMode === "dynamic" ? "asset_folder" : "folder";
  const mediaFilter =
    "status=active AND type=upload AND (resource_type=image OR resource_type=video)";
  const folderFilter = `(${folderField}="${folderPath}" OR ${folderField}:${folderPath}/*)`;

  return `${mediaFilter} AND ${folderFilter}`;
}

function requireNonEmptyString(value, fieldName, assetId = "desconocido") {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      `Recurso ${assetId} inválido: falta ${fieldName}.`,
    );
  }

  return value.trim();
}

function requirePositiveDimension(value, fieldName, assetId) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(
      `Recurso ${assetId} inválido: ${fieldName} debe ser positivo.`,
    );
  }

  return value;
}

function sourceContainsFolder(sourcePath, resourceFolder) {
  return (
    resourceFolder === sourcePath ||
    resourceFolder.startsWith(`${sourcePath}/`)
  );
}

function hasAccessControlValue(value) {
  if (value === undefined || value === null || value === "") {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "string") {
    try {
      return hasAccessControlValue(JSON.parse(value));
    } catch {
      return true;
    }
  }
  if (typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return Boolean(value);
}

function hasRestrictedAccess(resource) {
  if (
    typeof resource.access_mode === "string" &&
    resource.access_mode.length > 0 &&
    resource.access_mode !== "public"
  ) {
    return true;
  }

  return [
    resource.access_control,
    resource.context?.access_control,
    resource.context?.custom?.access_control,
  ].some(hasAccessControlValue);
}

function normalizeCreatedAt(value, assetId) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`Recurso ${assetId} inválido: created_at no es una fecha.`);
  }

  return new Date(timestamp).toISOString();
}

function firstUsefulText(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function humanizePublicId(publicId) {
  const finalSegment = publicId.split("/").at(-1) ?? "";
  const withoutExtension = finalSegment.replace(/\.[^.]+$/, "");
  const withoutTechnicalSuffix = withoutExtension.replace(
    /[_-][a-z0-9]{6}$/i,
    "",
  );
  const text = withoutTechnicalSuffix
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > 0
    ? `${text[0].toLocaleUpperCase("es-AR")}${text.slice(1)}`
    : "";
}

function resolveTexts(resource, publicId) {
  const custom =
    resource.context?.custom && typeof resource.context.custom === "object"
      ? resource.context.custom
      : {};
  const fallback = humanizePublicId(publicId);
  const title = firstUsefulText(
    custom.title,
    custom.caption,
    resource.display_name,
    fallback,
  );
  const alt = firstUsefulText(
    custom.alt,
    custom.title,
    custom.caption,
    resource.display_name,
    fallback,
  );
  const editorialTitle = firstUsefulText(
    custom.title,
    custom.caption,
    custom.alt,
  );
  const editorialAlt = firstUsefulText(
    custom.alt,
    custom.title,
    custom.caption,
  );

  if (!title || !alt) {
    return null;
  }

  return {
    title,
    alt,
    editorialTitle,
    editorialAlt,
    hasEditorialText: Boolean(editorialTitle || editorialAlt),
  };
}

function deliveryVariant(
  secureUrl,
  resourceType,
  transformation,
  outputFormat,
) {
  let url;

  try {
    url = new URL(secureUrl);
  } catch {
    throw new Error(`URL de entrega inválida: ${secureUrl}.`);
  }

  if (url.protocol !== "https:") {
    throw new Error("La URL de entrega de Cloudinary debe usar HTTPS.");
  }

  const uploadMarker = `/${resourceType}/upload/`;
  if (!url.pathname.includes(uploadMarker)) {
    throw new Error(
      `La URL de entrega no corresponde a ${resourceType}/upload.`,
    );
  }

  url.pathname = url.pathname.replace(
    uploadMarker,
    `${uploadMarker}${transformation}/`,
  );

  if (outputFormat) {
    if (!/\.[^./]+$/.test(url.pathname)) {
      throw new Error("La URL de entrega no contiene una extensión.");
    }
    url.pathname = url.pathname.replace(/\.[^./]+$/, `.${outputFormat}`);
  }

  return url.toString();
}

function validateBaseResource(resource, folderField) {
  if (!resource || typeof resource !== "object") {
    throw new Error("Cloudinary devolvió un recurso inválido.");
  }

  const assetId = requireNonEmptyString(
    resource.asset_id,
    "asset_id",
  );
  const publicId = requireNonEmptyString(
    resource.public_id,
    "public_id",
    assetId,
  );
  const resourceType = requireNonEmptyString(
    resource.resource_type,
    "resource_type",
    assetId,
  );
  const deliveryType = requireNonEmptyString(
    resource.type,
    "type",
    assetId,
  );
  const sourceFolder = requireNonEmptyString(
    resource[folderField],
    folderField,
    assetId,
  );
  const secureUrl = requireNonEmptyString(
    resource.secure_url,
    "secure_url",
    assetId,
  );
  const createdAt = normalizeCreatedAt(resource.created_at, assetId);

  return {
    assetId,
    publicId,
    resourceType,
    deliveryType,
    sourceFolder,
    secureUrl,
    createdAt,
  };
}

function compareManifestItems(left, right) {
  if (left.createdAt !== right.createdAt) {
    return left.createdAt > right.createdAt ? -1 : 1;
  }

  if (left.assetId === right.assetId) return 0;
  return left.assetId < right.assetId ? -1 : 1;
}

function validatePreviousManifestForLabels(previousManifest) {
  if (
    !previousManifest ||
    typeof previousManifest !== "object" ||
    previousManifest.schemaVersion !== 1 ||
    !Array.isArray(previousManifest.images) ||
    !Array.isArray(previousManifest.videos)
  ) {
    throw new Error(
      "El manifiesto anterior debe usar schemaVersion 1 e incluir images y videos.",
    );
  }
}

function assignGeneratedImageLabels({
  images,
  candidatesByAssetId,
  previousManifest,
}) {
  const previousByAssetId = new Map(
    previousManifest.images.map((image) => [image.assetId, image]),
  );
  const groups = new Map();

  for (const image of images) {
    const candidate = candidatesByAssetId.get(image.assetId);
    if (!candidate) continue;

    const groupKey = `${candidate.sourcePath}\u0000${candidate.label}`;
    const group = groups.get(groupKey) ?? [];
    group.push({ image, ...candidate });
    groups.set(groupKey, group);
  }

  for (const group of groups.values()) {
    const usedNumbers = new Set();
    const unassigned = [];

    for (const candidate of group) {
      const previous = previousByAssetId.get(candidate.image.assetId);
      const previousNumber = previous?.generatedLabelNumber;
      const canReuse =
        Number.isInteger(previousNumber) &&
        previousNumber > 0 &&
        typeof previous.sourceFolder === "string" &&
        sourceContainsFolder(candidate.sourcePath, previous.sourceFolder);

      if (!canReuse) {
        unassigned.push(candidate);
        continue;
      }
      if (usedNumbers.has(previousNumber)) {
        throw new Error(
          `generatedLabelNumber duplicado para ${candidate.sourcePath}: ${previousNumber}.`,
        );
      }

      usedNumbers.add(previousNumber);
      candidate.image.generatedLabelNumber = previousNumber;
      candidate.image.title = `${candidate.label} ${previousNumber}`;
      candidate.image.alt = candidate.image.title;
    }

    for (const candidate of unassigned) {
      let nextNumber = 1;
      while (usedNumbers.has(nextNumber)) nextNumber += 1;

      usedNumbers.add(nextNumber);
      candidate.image.generatedLabelNumber = nextNumber;
      candidate.image.title = `${candidate.label} ${nextNumber}`;
      candidate.image.alt = candidate.image.title;
    }
  }
}

export function buildManifest({
  folderMode,
  sourceResults,
  previousManifest = {
    schemaVersion: 1,
    images: [],
    videos: [],
  },
}) {
  assertFolderMode(folderMode);
  validatePreviousManifestForLabels(previousManifest);

  if (!Array.isArray(sourceResults) || sourceResults.length === 0) {
    throw new Error("La sincronización debe incluir resultados por fuente.");
  }

  const sources = validateCloudinaryConfig({
    folderMode,
    sources: sourceResults.map((result) => result?.source),
  });
  const folderField = folderMode === "dynamic" ? "asset_folder" : "folder";
  const images = [];
  const videos = [];
  const skipped = [];
  const countsBySource = [];
  const seenAssetIds = new Set();
  const generatedLabelCandidates = new Map();

  sourceResults.forEach((sourceResult, sourceIndex) => {
    const source = sources[sourceIndex];
    const resources = sourceResult?.resources;

    if (!Array.isArray(resources)) {
      throw new Error(
        `Cloudinary devolvió una lista inválida para ${source.path}.`,
      );
    }

    let sourceImageCount = 0;
    let sourceVideoCount = 0;
    let sourceSkippedCount = 0;

    for (const resource of resources) {
      const base = validateBaseResource(resource, folderField);

      if (seenAssetIds.has(base.assetId)) {
        throw new Error(`assetId duplicado: ${base.assetId}.`);
      }
      seenAssetIds.add(base.assetId);

      if (!sourceContainsFolder(source.path, base.sourceFolder)) {
        throw new Error(
          `El recurso ${base.assetId} está fuera de la fuente ${source.path}.`,
        );
      }

      let skipReason;
      if (base.deliveryType !== "upload") {
        skipReason = "restricted_delivery";
      } else if (hasRestrictedAccess(resource)) {
        skipReason = "restricted_access";
      } else if (
        typeof resource.status === "string" &&
        resource.status !== "active"
      ) {
        skipReason = "inactive";
      } else if (
        base.resourceType !== "image" &&
        base.resourceType !== "video"
      ) {
        skipReason = "unsupported_resource_type";
      } else if (
        base.resourceType === "video" &&
        (!Number.isFinite(resource.width) ||
          resource.width <= 0 ||
          !Number.isFinite(resource.height) ||
          resource.height <= 0)
      ) {
        skipReason = "non_visual_video";
      } else if (
        base.resourceType === "video" &&
        Number.isFinite(resource.duration) &&
        resource.duration >= 0 &&
        resource.duration < 2
      ) {
        skipReason = "short_video";
      }

      if (skipReason) {
        skipped.push({
          assetId: base.assetId,
          sourcePath: source.path,
          reason: skipReason,
        });
        sourceSkippedCount += 1;
        continue;
      }

      const texts = resolveTexts(resource, base.publicId);
      if (!texts) {
        skipped.push({
          assetId: base.assetId,
          sourcePath: source.path,
          reason: "missing_text",
        });
        sourceSkippedCount += 1;
        continue;
      }

      const width = requirePositiveDimension(
        resource.width,
        "width",
        base.assetId,
      );
      const height = requirePositiveDimension(
        resource.height,
        "height",
        base.assetId,
      );

      if (base.resourceType === "image") {
        const usesEditorialText =
          Boolean(source.unnamedImageLabel) && texts.hasEditorialText;
        const imageTitle =
          source.fixedImageTitle ??
          (usesEditorialText ? texts.editorialTitle : texts.title);
        const imageAlt =
          source.fixedImageTitle ??
          (usesEditorialText ? texts.editorialAlt : texts.alt);
        const image = {
          assetId: base.assetId,
          sourceFolder: base.sourceFolder,
          publicId: base.publicId,
          category: source.imageCategory,
          createdAt: base.createdAt,
          title: imageTitle,
          alt: imageAlt,
          width,
          height,
          thumb: deliveryVariant(
            base.secureUrl,
            "image",
            IMAGE_THUMB_TRANSFORM,
          ),
          full: deliveryVariant(
            base.secureUrl,
            "image",
            IMAGE_FULL_TRANSFORM,
          ),
        };
        images.push(image);
        if (source.unnamedImageLabel && !texts.hasEditorialText) {
          generatedLabelCandidates.set(base.assetId, {
            sourcePath: source.path,
            label: source.unnamedImageLabel,
          });
        }
        sourceImageCount += 1;
        continue;
      }

      const videoTitle = source.fixedVideoTitle ?? texts.title;
      const video = {
        assetId: base.assetId,
        sourceFolder: base.sourceFolder,
        publicId: base.publicId,
        category: source.videoCategory,
        createdAt: base.createdAt,
        title: videoTitle,
        poster: deliveryVariant(
          base.secureUrl,
          "video",
          VIDEO_POSTER_TRANSFORM,
          "jpg",
        ),
        src: deliveryVariant(
          base.secureUrl,
          "video",
          VIDEO_SOURCE_TRANSFORM,
          "mp4",
        ),
        width,
        height,
      };

      if (Number.isFinite(resource.duration) && resource.duration >= 0) {
        video.duration = resource.duration;
      }

      videos.push(video);
      sourceVideoCount += 1;
    }

    if (
      sourceImageCount + sourceVideoCount === 0 &&
      source.allowEmpty !== true
    ) {
      throw new Error(
        `La fuente ${source.path} no produjo recursos publicables.`,
      );
    }

    countsBySource.push({
      path: source.path,
      images: sourceImageCount,
      videos: sourceVideoCount,
      skipped: sourceSkippedCount,
    });
  });

  images.sort(compareManifestItems);
  videos.sort(compareManifestItems);
  assignGeneratedImageLabels({
    images,
    candidatesByAssetId: generatedLabelCandidates,
    previousManifest,
  });

  return {
    manifest: {
      schemaVersion: 1,
      images,
      videos,
    },
    skipped,
    countsBySource,
  };
}
