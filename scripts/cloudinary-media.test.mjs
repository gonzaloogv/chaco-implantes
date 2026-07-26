import assert from "node:assert/strict";
import test from "node:test";

import {
  buildManifest,
  buildSearchExpression,
  validateCloudinaryConfig,
} from "./cloudinary-media.mjs";

const validSources = [
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

test("validateCloudinaryConfig accepts the approved independent sources", () => {
  const sources = validateCloudinaryConfig({
    folderMode: "dynamic",
    sources: validSources,
  });

  assert.deepEqual(sources, [
    { ...validSources[0], allowEmpty: false },
    { ...validSources[1], allowEmpty: false },
  ]);
});

test("validateCloudinaryConfig rejects an unsupported folder mode", () => {
  assert.throws(
    () =>
      validateCloudinaryConfig({
        folderMode: "automatic",
        sources: validSources,
      }),
    /folderMode debe ser "dynamic" o "fixed"/,
  );
});

test("validateCloudinaryConfig rejects duplicate and overlapping sources", () => {
  assert.throws(
    () =>
      validateCloudinaryConfig({
        folderMode: "dynamic",
        sources: [validSources[0], { ...validSources[0] }],
      }),
    /se superpone/,
  );

  assert.throws(
    () =>
      validateCloudinaryConfig({
        folderMode: "dynamic",
        sources: [
          validSources[0],
          {
            ...validSources[0],
            path: "chaco-implantes/stand/2026",
          },
        ],
      }),
    /se superpone/,
  );
});

test("validateCloudinaryConfig rejects unsafe paths and categories", () => {
  assert.throws(
    () =>
      validateCloudinaryConfig({
        folderMode: "dynamic",
        sources: [{ ...validSources[0], path: "/chaco-implantes/stand" }],
      }),
    /Ruta de Cloudinary inválida/,
  );

  assert.throws(
    () =>
      validateCloudinaryConfig({
        folderMode: "dynamic",
        sources: [{ ...validSources[0], path: "chaco-implantes/stand (2026)" }],
      }),
    /Ruta de Cloudinary inválida/,
  );

  assert.throws(
    () =>
      validateCloudinaryConfig({
        folderMode: "dynamic",
        sources: [{ ...validSources[0], imageCategory: "Brands" }],
      }),
    /categoría de imagen inválida/,
  );
});

test("validateCloudinaryConfig requires allowEmpty to be boolean", () => {
  assert.throws(
    () =>
      validateCloudinaryConfig({
        folderMode: "fixed",
        sources: [{ ...validSources[0], allowEmpty: "yes" }],
      }),
    /allowEmpty debe ser booleano/,
  );
});

test("validateCloudinaryConfig validates generated image labels", () => {
  assert.throws(
    () =>
      validateCloudinaryConfig({
        folderMode: "dynamic",
        sources: [{ ...validSources[1], unnamedImageLabel: "   " }],
      }),
    /unnamedImageLabel debe ser texto no vacío/,
  );

  assert.throws(
    () =>
      validateCloudinaryConfig({
        folderMode: "dynamic",
        sources: [{ ...validSources[1], unnamedImageLabel: 42 }],
      }),
    /unnamedImageLabel debe ser texto no vacío/,
  );
});

test("validateCloudinaryConfig normalizes and validates fixed titles", () => {
  const [source] = validateCloudinaryConfig({
    folderMode: "dynamic",
    sources: [
      {
        ...validSources[0],
        fixedImageTitle: "  61° Congreso Traumatología  ",
        fixedVideoTitle: "  Producto instrumental  ",
      },
    ],
  });

  assert.equal(source.fixedImageTitle, "61° Congreso Traumatología");
  assert.equal(source.fixedVideoTitle, "Producto instrumental");

  for (const [fieldName, value] of [
    ["fixedImageTitle", "   "],
    ["fixedImageTitle", 42],
    ["fixedVideoTitle", "   "],
    ["fixedVideoTitle", 42],
  ]) {
    assert.throws(
      () =>
        validateCloudinaryConfig({
          folderMode: "dynamic",
          sources: [{ ...validSources[0], [fieldName]: value }],
        }),
      new RegExp(`${fieldName} debe ser texto no vacío`),
    );
  }
});

test("validateCloudinaryConfig rejects competing fixed and generated image titles", () => {
  assert.throws(
    () =>
      validateCloudinaryConfig({
        folderMode: "dynamic",
        sources: [
          {
            ...validSources[1],
            fixedImageTitle: "Producto instrumental",
          },
        ],
      }),
    /fixedImageTitle y unnamedImageLabel no pueden coexistir/,
  );
});

test("buildSearchExpression uses asset_folder in dynamic mode", () => {
  assert.equal(
    buildSearchExpression("dynamic", "chaco-implantes/stand"),
    'status=active AND type=upload AND (resource_type=image OR resource_type=video) AND (asset_folder="chaco-implantes/stand" OR asset_folder:chaco-implantes/stand/*)',
  );
});

test("buildSearchExpression uses folder in fixed mode", () => {
  assert.equal(
    buildSearchExpression("fixed", "chaco-implantes/cajas"),
    'status=active AND type=upload AND (resource_type=image OR resource_type=video) AND (folder="chaco-implantes/cajas" OR folder:chaco-implantes/cajas/*)',
  );
});

const standSource = {
  ...validSources[0],
  allowEmpty: false,
};
const cajasSource = {
  ...validSources[1],
  allowEmpty: false,
};

const imageResource = {
  asset_id: "asset-image",
  public_id: "Congreso_Traumato-99_ocnsrl",
  resource_type: "image",
  type: "upload",
  status: "active",
  format: "jpg",
  secure_url:
    "https://res.cloudinary.com/demo/image/upload/v1780000001/Congreso_Traumato-99_ocnsrl.jpg",
  asset_folder: "chaco-implantes/stand/2024",
  created_at: "2026-07-24T12:00:00Z",
  width: 1600,
  height: 1067,
  context: {
    custom: {
      title: "Congreso de traumatología",
      alt: "Stand de Chaco Implantes en el congreso",
    },
  },
};

const videoResource = {
  asset_id: "asset-video",
  public_id: "recorrido_caja_qwerty",
  resource_type: "video",
  type: "upload",
  status: "active",
  format: "mov",
  secure_url:
    "https://res.cloudinary.com/demo/video/upload/v1780000002/recorrido_caja_qwerty.mov",
  asset_folder: "chaco-implantes/stand",
  created_at: "2026-07-25T09:30:00Z",
  width: 1920,
  height: 1080,
  duration: 12.5,
  display_name: "Recorrido por el stand",
};

test("buildManifest normalizes dynamic images and visual videos", () => {
  const { manifest, skipped, countsBySource } = buildManifest({
    folderMode: "dynamic",
    sourceResults: [
      {
        source: standSource,
        resources: [imageResource, videoResource],
      },
    ],
  });

  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.images.length, 1);
  assert.equal(manifest.videos.length, 1);
  assert.deepEqual(skipped, []);
  assert.deepEqual(countsBySource, [
    {
      path: "chaco-implantes/stand",
      images: 1,
      videos: 1,
      skipped: 0,
    },
  ]);

  assert.deepEqual(manifest.images[0], {
    assetId: "asset-image",
    sourceFolder: "chaco-implantes/stand/2024",
    publicId: "Congreso_Traumato-99_ocnsrl",
    category: "Eventos",
    createdAt: "2026-07-24T12:00:00.000Z",
    title: "61° Congreso Traumatología",
    alt: "61° Congreso Traumatología",
    width: 1600,
    height: 1067,
    thumb:
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,g_auto,w_600,h_400/v1780000001/Congreso_Traumato-99_ocnsrl.jpg",
    full:
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_1920/v1780000001/Congreso_Traumato-99_ocnsrl.jpg",
  });

  assert.deepEqual(manifest.videos[0], {
    assetId: "asset-video",
    sourceFolder: "chaco-implantes/stand",
    publicId: "recorrido_caja_qwerty",
    category: "Eventos",
    createdAt: "2026-07-25T09:30:00.000Z",
    title: "Recorrido por el stand",
    poster:
      "https://res.cloudinary.com/demo/video/upload/so_0,f_jpg,q_auto,b_rgb:0f172a,c_pad,ar_16:9,w_600/v1780000002/recorrido_caja_qwerty.jpg",
    src:
      "https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto,ac_none/v1780000002/recorrido_caja_qwerty.mp4",
    width: 1920,
    height: 1080,
    duration: 12.5,
  });
});

test("buildManifest applies fixed titles over editorial and technical text", () => {
  const cajasVideoResource = {
    ...videoResource,
    asset_id: "cajas-video",
    public_id: "IMG_8803_ekabsw",
    asset_folder: "chaco-implantes/cajas",
    display_name: "IMG_8803_ekabsw",
  };

  const { manifest } = buildManifest({
    folderMode: "dynamic",
    sourceResults: [
      {
        source: standSource,
        resources: [imageResource],
      },
      {
        source: cajasSource,
        resources: [cajasVideoResource],
      },
    ],
  });

  assert.deepEqual(
    {
      title: manifest.images[0].title,
      alt: manifest.images[0].alt,
    },
    {
      title: "61° Congreso Traumatología",
      alt: "61° Congreso Traumatología",
    },
  );
  assert.equal(manifest.videos[0].title, "Producto instrumental");
});

test("buildManifest reads folder in fixed mode and preserves Unicode fallback text", () => {
  const fixedResource = {
    ...imageResource,
    asset_id: "asset-fixed",
    public_id: "instrumental/Bisturí_eléctrico_abc123",
    asset_folder: undefined,
    folder: "chaco-implantes/cajas/eléctrico",
    context: undefined,
    display_name: undefined,
  };

  const { manifest } = buildManifest({
    folderMode: "fixed",
    sourceResults: [
      {
        source: {
          path: "chaco-implantes/cajas",
          imageCategory: "Instrumental",
          videoCategory: "Instrumental",
          allowEmpty: false,
        },
        resources: [fixedResource],
      },
    ],
  });

  assert.equal(manifest.images[0].sourceFolder, "chaco-implantes/cajas/eléctrico");
  assert.equal(manifest.images[0].title, "Bisturí eléctrico");
  assert.equal(manifest.images[0].alt, "Bisturí eléctrico");
});

test("buildManifest assigns stable labels only to unnamed cajas images", () => {
  const unnamedNewest = {
    ...imageResource,
    asset_id: "caja-newest",
    public_id: "IMG_2000_abcdef",
    asset_folder: "chaco-implantes/cajas",
    created_at: "2026-07-25T12:00:00Z",
    context: undefined,
    display_name: "IMG_2000_abcdef",
  };
  const unnamedOlder = {
    ...unnamedNewest,
    asset_id: "caja-older",
    public_id: "IMG_1000_ghijkl",
    created_at: "2026-07-24T12:00:00Z",
    display_name: "IMG_1000_ghijkl",
  };
  const customAlt = {
    ...unnamedNewest,
    asset_id: "caja-custom",
    public_id: "IMG_3000_mnopqr",
    created_at: "2026-07-24T18:00:00Z",
    context: { custom: { alt: "Caja de revisión femoral" } },
    display_name: "IMG_3000_mnopqr",
  };

  const { manifest } = buildManifest({
    folderMode: "dynamic",
    sourceResults: [
      {
        source: cajasSource,
        resources: [unnamedOlder, customAlt, unnamedNewest],
      },
      {
        source: standSource,
        resources: [imageResource],
      },
    ],
  });

  const cajas = manifest.images.filter(
    ({ sourceFolder }) => sourceFolder === "chaco-implantes/cajas",
  );
  assert.deepEqual(
    cajas.map(({ assetId, title, alt, generatedLabelNumber }) => ({
      assetId,
      title,
      alt,
      generatedLabelNumber,
    })),
    [
      {
        assetId: "caja-newest",
        title: "Producto instrumental 1",
        alt: "Producto instrumental 1",
        generatedLabelNumber: 1,
      },
      {
        assetId: "caja-custom",
        title: "Caja de revisión femoral",
        alt: "Caja de revisión femoral",
        generatedLabelNumber: undefined,
      },
      {
        assetId: "caja-older",
        title: "Producto instrumental 2",
        alt: "Producto instrumental 2",
        generatedLabelNumber: 2,
      },
    ],
  );
  assert.equal(
    manifest.images.find(({ assetId }) => assetId === "asset-image")
      .generatedLabelNumber,
    undefined,
  );
});

test("buildManifest reuses numbers by assetId and fills the lowest gap", () => {
  const retained = {
    ...imageResource,
    asset_id: "caja-retained",
    public_id: "retained",
    asset_folder: "chaco-implantes/cajas",
    context: undefined,
    display_name: "retained",
  };
  const added = {
    ...retained,
    asset_id: "caja-new",
    public_id: "new",
    display_name: "new",
  };
  const previousManifest = {
    schemaVersion: 1,
    images: [
      {
        assetId: "removed",
        sourceFolder: "chaco-implantes/cajas",
        generatedLabelNumber: 1,
      },
      {
        assetId: "caja-retained",
        sourceFolder: "chaco-implantes/cajas",
        generatedLabelNumber: 2,
      },
    ],
    videos: [],
  };

  const { manifest } = buildManifest({
    folderMode: "dynamic",
    previousManifest,
    sourceResults: [
      {
        source: cajasSource,
        resources: [retained, added],
      },
    ],
  });

  assert.deepEqual(
    Object.fromEntries(
      manifest.images.map(({ assetId, generatedLabelNumber }) => [
        assetId,
        generatedLabelNumber,
      ]),
    ),
    {
      "caja-new": 1,
      "caja-retained": 2,
    },
  );
});

test("buildManifest defensively omits restricted, unsupported and audio resources", () => {
  const privateImage = {
    ...imageResource,
    asset_id: "private",
    type: "private",
  };
  const controlledImage = {
    ...imageResource,
    asset_id: "controlled",
    access_control: [{ access_type: "token" }],
  };
  const rawResource = {
    ...imageResource,
    asset_id: "raw",
    resource_type: "raw",
  };
  const audioResource = {
    ...videoResource,
    asset_id: "audio",
    format: "mp3",
    width: 0,
    height: 0,
  };

  const { manifest, skipped } = buildManifest({
    folderMode: "dynamic",
    sourceResults: [
      {
        source: standSource,
        resources: [
          imageResource,
          privateImage,
          controlledImage,
          rawResource,
          audioResource,
        ],
      },
    ],
  });

  assert.equal(manifest.images.length, 1);
  assert.equal(manifest.videos.length, 0);
  assert.deepEqual(
    skipped.map(({ assetId, reason }) => ({ assetId, reason })),
    [
      { assetId: "private", reason: "restricted_delivery" },
      { assetId: "controlled", reason: "restricted_access" },
      { assetId: "raw", reason: "unsupported_resource_type" },
      { assetId: "audio", reason: "non_visual_video" },
    ],
  );
});

test("buildManifest omits videos shorter than two seconds", () => {
  const shortVideo = {
    ...videoResource,
    asset_id: "short-video",
    duration: 1.999,
  };
  const exactVideo = {
    ...videoResource,
    asset_id: "exact-video",
    public_id: "exact-video",
    duration: 2,
  };
  const unknownVideo = {
    ...videoResource,
    asset_id: "unknown-video",
    public_id: "unknown-video",
    duration: undefined,
  };

  const { manifest, skipped, countsBySource } = buildManifest({
    folderMode: "dynamic",
    sourceResults: [
      {
        source: standSource,
        resources: [imageResource, shortVideo, exactVideo, unknownVideo],
      },
    ],
  });

  assert.deepEqual(
    manifest.videos.map(({ assetId, duration }) => ({ assetId, duration })),
    [
      { assetId: "exact-video", duration: 2 },
      { assetId: "unknown-video", duration: undefined },
    ],
  );
  assert.deepEqual(
    skipped.map(({ assetId, reason }) => ({ assetId, reason })),
    [{ assetId: "short-video", reason: "short_video" }],
  );
  assert.deepEqual(countsBySource, [
    {
      path: "chaco-implantes/stand",
      images: 1,
      videos: 2,
      skipped: 1,
    },
  ]);
});

test("buildManifest omits access control returned inside Search context", () => {
  const contextControlledImage = {
    ...imageResource,
    asset_id: "context-controlled",
    context: {
      custom: {
        ...imageResource.context.custom,
        access_control: '[{"access_type":"token"}]',
      },
    },
  };

  const { manifest, skipped } = buildManifest({
    folderMode: "dynamic",
    sourceResults: [
      {
        source: standSource,
        resources: [imageResource, contextControlledImage],
      },
    ],
  });

  assert.equal(manifest.images.length, 1);
  assert.deepEqual(
    skipped.map(({ assetId, reason }) => ({ assetId, reason })),
    [{ assetId: "context-controlled", reason: "restricted_access" }],
  );
});

test("buildManifest omits legacy authenticated access_mode resources", () => {
  const authenticatedImage = {
    ...imageResource,
    asset_id: "legacy-authenticated",
    access_mode: "authenticated",
  };

  const { manifest, skipped } = buildManifest({
    folderMode: "dynamic",
    sourceResults: [
      {
        source: standSource,
        resources: [imageResource, authenticatedImage],
      },
    ],
  });

  assert.equal(manifest.images.length, 1);
  assert.deepEqual(
    skipped.map(({ assetId, reason }) => ({ assetId, reason })),
    [{ assetId: "legacy-authenticated", reason: "restricted_access" }],
  );
});

test("buildManifest rejects a required source with no publishable resources", () => {
  assert.throws(
    () =>
      buildManifest({
        folderMode: "dynamic",
        sourceResults: [
          {
            source: standSource,
            resources: [{ ...videoResource, width: 0, height: 0 }],
          },
        ],
      }),
    /chaco-implantes\/stand no produjo recursos publicables/,
  );
});

test("buildManifest permits an explicitly empty source without bypassing validation", () => {
  const { manifest, countsBySource } = buildManifest({
    folderMode: "dynamic",
    sourceResults: [
      {
        source: { ...standSource, allowEmpty: true },
        resources: [],
      },
    ],
  });

  assert.deepEqual(manifest, {
    schemaVersion: 1,
    images: [],
    videos: [],
  });
  assert.deepEqual(countsBySource[0], {
    path: standSource.path,
    images: 0,
    videos: 0,
    skipped: 0,
  });
});

test("buildManifest rejects resources outside their configured source", () => {
  assert.throws(
    () =>
      buildManifest({
        folderMode: "dynamic",
        sourceResults: [
          {
            source: standSource,
            resources: [
              {
                ...imageResource,
                asset_folder: "chaco-implantes/brands",
              },
            ],
          },
        ],
      }),
    /fuera de la fuente chaco-implantes\/stand/,
  );
});

test("buildManifest rejects duplicate asset identifiers", () => {
  assert.throws(
    () =>
      buildManifest({
        folderMode: "dynamic",
        sourceResults: [
          {
            source: standSource,
            resources: [
              imageResource,
              {
                ...videoResource,
                asset_id: imageResource.asset_id,
              },
            ],
          },
        ],
      }),
    /assetId duplicado: asset-image/,
  );
});

test("buildManifest sorts newest first with a binary assetId tie-breaker", () => {
  const sameDate = "2026-07-25T10:00:00Z";
  const { manifest } = buildManifest({
    folderMode: "dynamic",
    sourceResults: [
      {
        source: standSource,
        resources: [
          {
            ...imageResource,
            asset_id: "b",
            created_at: sameDate,
          },
          {
            ...imageResource,
            asset_id: "a",
            created_at: sameDate,
          },
          {
            ...imageResource,
            asset_id: "older",
            created_at: "2026-07-24T10:00:00Z",
          },
        ],
      },
    ],
  });

  assert.deepEqual(
    manifest.images.map(({ assetId }) => assetId),
    ["a", "b", "older"],
  );
});
