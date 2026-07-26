# Cloudinary Media Labels and Short Videos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Assign stable `Producto instrumental N` labels to unnamed `cajas` images and omit Cloudinary videos shorter than two seconds without deleting remote assets.

**Architecture:** The folder configuration opts `cajas` into generated image labels. `buildManifest` distinguishes editorial context from technical fallbacks, reuses prior assignments by `assetId`, allocates the lowest free positive number, and persists it as `generatedLabelNumber`. The existing manifest builder also rejects visual videos with a known duration below two seconds and reports them as `short_video`.

**Tech Stack:** Node.js 22, native `node:test`, Astro 5, Cloudinary Search API, JSON manifest.

---

## File map

- Modify `scripts/cloudinary-folders.config.mjs`: opt `cajas` into the `Producto instrumental` fallback label.
- Modify `scripts/cloudinary-media.mjs`: validate the label option, resolve editorial text provenance, assign stable numbers, and filter short videos.
- Modify `scripts/cloudinary-media.test.mjs`: cover configuration, first assignment, reuse, free-number allocation, editorial text, and video duration boundaries.
- Modify `scripts/cloudinary-sync-io.mjs`: validate optional `generatedLabelNumber` values stored in the manifest.
- Modify `scripts/cloudinary-sync-io.test.mjs`: cover valid and invalid stored generated numbers.
- Modify `scripts/sync-cloudinary.mjs`: pass the previously validated manifest to `buildManifest`.
- Modify `scripts/sync-cloudinary.test.mjs`: prove that the command preserves an existing assignment.
- Modify `scripts/smoke.mjs`: verify generated labels in Galería and reject short videos in the generated manifest.
- Modify `README.md`: document both synchronization rules.
- Regenerate `src/data/generated/cloudinary-media.json`: persist the real labels and remove the one known 1.866667-second clip from site output.

### Task 1: Configure generated labels for `cajas`

**Files:**
- Modify: `scripts/cloudinary-folders.config.mjs`
- Modify: `scripts/cloudinary-media.mjs:36-80`
- Test: `scripts/cloudinary-media.test.mjs:10-110`

- [ ] **Step 1: Write the failing configuration tests**

Add `unnamedImageLabel` to the `cajas` fixture and assert that normalization
preserves it. Add invalid-value coverage:

```js
const validSources = [
  {
    path: "chaco-implantes/stand",
    imageCategory: "Eventos",
    videoCategory: "Eventos",
  },
  {
    path: "chaco-implantes/cajas",
    imageCategory: "Instrumental",
    videoCategory: "Instrumental",
    unnamedImageLabel: "Producto instrumental",
  },
];

test("validateCloudinaryConfig validates generated image labels", () => {
  assert.throws(
    () =>
      validateCloudinaryConfig({
        folderMode: "dynamic",
        sources: [
          { ...validSources[1], unnamedImageLabel: "   " },
        ],
      }),
    /unnamedImageLabel debe ser texto no vacío/,
  );

  assert.throws(
    () =>
      validateCloudinaryConfig({
        folderMode: "dynamic",
        sources: [
          { ...validSources[1], unnamedImageLabel: 42 },
        ],
      }),
    /unnamedImageLabel debe ser texto no vacío/,
  );
});
```

Update the accepted normalized source expectation so the second entry contains
`unnamedImageLabel: "Producto instrumental"`.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test --test-name-pattern="validateCloudinaryConfig" scripts/cloudinary-media.test.mjs
```

Expected: FAIL because `validateCloudinaryConfig` drops
`unnamedImageLabel` and accepts invalid values.

- [ ] **Step 3: Implement configuration validation**

Inside the source mapper in `validateCloudinaryConfig`, validate and normalize
the optional label:

```js
let unnamedImageLabel;
if (source.unnamedImageLabel !== undefined) {
  if (
    typeof source.unnamedImageLabel !== "string" ||
    source.unnamedImageLabel.trim().length === 0
  ) {
    throw new Error(
      `unnamedImageLabel debe ser texto no vacío para ${source.path}.`,
    );
  }
  unnamedImageLabel = source.unnamedImageLabel.trim();
}

return {
  path: source.path,
  imageCategory: source.imageCategory,
  videoCategory: source.videoCategory,
  allowEmpty: source.allowEmpty ?? false,
  ...(unnamedImageLabel ? { unnamedImageLabel } : {}),
};
```

Opt the real folder into the behavior:

```js
{
  path: "chaco-implantes/cajas",
  imageCategory: "Instrumental",
  videoCategory: "Instrumental",
  unnamedImageLabel: "Producto instrumental",
},
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
node --test --test-name-pattern="validateCloudinaryConfig" scripts/cloudinary-media.test.mjs
```

Expected: all matching tests pass.

- [ ] **Step 5: Commit the configuration contract**

```bash
git add scripts/cloudinary-folders.config.mjs scripts/cloudinary-media.mjs scripts/cloudinary-media.test.mjs
git commit -m "feat(cloudinary): configure instrumental fallback labels"
```

### Task 2: Assign and preserve instrumental numbers

**Files:**
- Modify: `scripts/cloudinary-media.mjs:198-239,332-520`
- Modify: `scripts/cloudinary-sync-io.mjs:81-93`
- Modify: `scripts/sync-cloudinary.mjs:121-145`
- Test: `scripts/cloudinary-media.test.mjs`
- Test: `scripts/cloudinary-sync-io.test.mjs`
- Test: `scripts/sync-cloudinary.test.mjs`

- [ ] **Step 1: Write failing manifest-builder tests**

Add a `cajasSource` fixture:

```js
const cajasSource = {
  ...validSources[1],
  allowEmpty: false,
};
```

Add a test with two unnamed images, one image that only has a custom alt, and
one unrelated stand image:

```js
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
```

Add a second test that passes a prior manifest. Keep asset `caja-retained` on
number 2, remove the old number 1 asset, and add `caja-new`; expect the new
asset to receive the lowest free number 1:

```js
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
```

- [ ] **Step 2: Run the label tests and verify RED**

Run:

```bash
node --test --test-name-pattern="stable labels|reuses numbers" scripts/cloudinary-media.test.mjs
```

Expected: FAIL because the builder does not expose text provenance, accept a
previous manifest, or write `generatedLabelNumber`.

- [ ] **Step 3: Preserve editorial text provenance**

Extend `resolveTexts` without changing fallback behavior for other folders:

```js
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

  if (!title || !alt) return null;

  return {
    title,
    alt,
    editorialTitle,
    editorialAlt,
    hasEditorialText: Boolean(editorialTitle || editorialAlt),
  };
}
```

For an image from a source with `unnamedImageLabel`, use
`editorialTitle`/`editorialAlt` when `hasEditorialText` is true. Record the
remaining asset IDs as generated-label candidates.

- [ ] **Step 4: Implement stable number allocation**

Change the builder signature:

```js
export function buildManifest({
  folderMode,
  sourceResults,
  previousManifest = {
    schemaVersion: 1,
    images: [],
    videos: [],
  },
}) {
```

Validate that `previousManifest` uses schema version 1 and contains image/video
arrays. After sorting `images`, group generated-label candidates by configured
source. For each group:

1. Reuse a positive integer from the previous item with the same `assetId`.
2. Reject duplicate reused numbers in one source.
3. Process new images in manifest order.
4. Assign the smallest positive integer absent from the used-number set.
5. Write `generatedLabelNumber`, `title`, and `alt`.

Use this assignment shape:

```js
image.generatedLabelNumber = generatedLabelNumber;
image.title = `${label} ${generatedLabelNumber}`;
image.alt = image.title;
```

Keep the pending-candidate bookkeeping outside the serialized image records so
no private marker reaches the manifest.

- [ ] **Step 5: Verify the label tests are GREEN**

Run:

```bash
node --test --test-name-pattern="stable labels|reuses numbers" scripts/cloudinary-media.test.mjs
```

Expected: both tests pass.

- [ ] **Step 6: Write a failing stored-manifest validation test**

In `scripts/cloudinary-sync-io.test.mjs`, prove that a positive integer is
accepted and zero, a decimal, and a string are rejected:

```js
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
```

- [ ] **Step 7: Run the stored-manifest test and verify RED**

Run:

```bash
node --test --test-name-pattern="generated label numbers" scripts/cloudinary-sync-io.test.mjs
```

Expected: FAIL because invalid values currently pass validation.

- [ ] **Step 8: Validate `generatedLabelNumber`**

Inside the image loop in `validateManifest`:

```js
if (
  item.generatedLabelNumber !== undefined &&
  (!Number.isInteger(item.generatedLabelNumber) ||
    item.generatedLabelNumber <= 0)
) {
  throw new Error(
    `Manifiesto inválido: ${location}.generatedLabelNumber debe ser un entero positivo.`,
  );
}
```

Run the focused test again. Expected: PASS.

- [ ] **Step 9: Write a failing command-level persistence test**

Create a prior output manifest with `cajas-image` assigned to number 4. Return
the same `assetId` from the fake Search client and assert that `runSync`
preserves number 4:

```js
test("runSync passes previous label assignments to the manifest builder", async (t) => {
  const previous = {
    schemaVersion: 1,
    images: [
      {
        assetId: "cajas-image",
        sourceFolder: "chaco-implantes/cajas",
        publicId: "cajas-image",
        category: "Instrumental",
        createdAt: "2026-07-25T12:00:00.000Z",
        title: "Producto instrumental 4",
        alt: "Producto instrumental 4",
        generatedLabelNumber: 4,
        width: 1200,
        height: 800,
        thumb: "https://example.com/thumb.jpg",
        full: "https://example.com/full.jpg",
      },
    ],
    videos: [],
  };
  const outputPath = await createTempOutput(t, previous);
  const client = {
    async searchResources({ expression }) {
      const isStand = expression.includes("/stand");
      return [
        imageResource({
          assetId: isStand ? "stand-image" : "cajas-image",
          folder: isStand
            ? "chaco-implantes/stand"
            : "chaco-implantes/cajas",
        }),
      ];
    },
    async getFolderMode() {
      return "dynamic";
    },
  };

  const result = await runSync({
    credentials,
    folderMode: "dynamic",
    sources,
    client,
    outputPath,
    logger: createLogger(),
  });

  assert.equal(
    result.manifest.images.find(
      ({ assetId }) => assetId === "cajas-image",
    ).generatedLabelNumber,
    4,
  );
});
```

Ensure the `cajas` source in this test file also declares
`unnamedImageLabel: "Producto instrumental"`.

- [ ] **Step 10: Run the command test and verify RED**

Run:

```bash
node --test --test-name-pattern="previous label assignments" scripts/sync-cloudinary.test.mjs
```

Expected: FAIL because `runSync` does not pass `previousManifest`.

- [ ] **Step 11: Pass the previous manifest into the builder**

Update the existing call:

```js
const { manifest, skipped, countsBySource } = buildManifest({
  folderMode,
  sourceResults,
  previousManifest,
});
```

Run:

```bash
node --test scripts/cloudinary-media.test.mjs scripts/cloudinary-sync-io.test.mjs scripts/sync-cloudinary.test.mjs
```

Expected: all tests in the three files pass.

- [ ] **Step 12: Commit stable labeling**

```bash
git add scripts/cloudinary-media.mjs scripts/cloudinary-media.test.mjs scripts/cloudinary-sync-io.mjs scripts/cloudinary-sync-io.test.mjs scripts/sync-cloudinary.mjs scripts/sync-cloudinary.test.mjs
git commit -m "feat(cloudinary): preserve instrumental image numbers"
```

### Task 3: Omit videos shorter than two seconds

**Files:**
- Modify: `scripts/cloudinary-media.mjs:376-410`
- Test: `scripts/cloudinary-media.test.mjs`

- [ ] **Step 1: Write the duration-boundary test**

```js
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
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test --test-name-pattern="shorter than two seconds" scripts/cloudinary-media.test.mjs
```

Expected: FAIL because all three visual videos remain in the manifest.

- [ ] **Step 3: Add the defensive duration filter**

Place this branch after the `non_visual_video` check so audio-like resources
retain their existing reason:

```js
} else if (
  base.resourceType === "video" &&
  Number.isFinite(resource.duration) &&
  resource.duration >= 0 &&
  resource.duration < 2
) {
  skipReason = "short_video";
}
```

- [ ] **Step 4: Run focused and full Cloudinary tests**

Run:

```bash
node --test --test-name-pattern="shorter than two seconds" scripts/cloudinary-media.test.mjs
npm run test:cloudinary
```

Expected: the focused test passes and the full suite reports zero failures.

- [ ] **Step 5: Commit the video filter**

```bash
git add scripts/cloudinary-media.mjs scripts/cloudinary-media.test.mjs
git commit -m "feat(cloudinary): omit sub-two-second videos"
```

### Task 4: Regenerate real data and verify the site

**Files:**
- Modify: `scripts/smoke.mjs:15-31,300-357`
- Modify: `README.md:42-90`
- Regenerate: `src/data/generated/cloudinary-media.json`

- [ ] **Step 1: Add failing smoke assertions**

After reading the manifest, derive generated instrumental images:

```js
const generatedInstrumentalImages = cloudinaryManifest.images.filter(
  ({ generatedLabelNumber }) =>
    Number.isInteger(generatedLabelNumber) &&
    generatedLabelNumber > 0,
);
```

After the synchronized-image gallery loop, add:

```js
for (const image of generatedInstrumentalImages) {
  const expectedLabel = `Producto instrumental ${image.generatedLabelNumber}`;
  assert(
    image.title === expectedLabel && image.alt === expectedLabel,
    `Generated instrumental label should match its number: ${image.assetId}`,
  );
  assert(
    galeria.includes(expectedLabel),
    `Gallery should render generated instrumental label ${expectedLabel}`,
  );
}

assert(
  cloudinaryManifest.videos.every(
    ({ duration }) =>
      duration === undefined || duration >= 2,
  ),
  "Generated manifest should not contain videos shorter than two seconds",
);
```

- [ ] **Step 2: Build and verify smoke RED against the old manifest**

Run:

```bash
npm run build
npm run test:smoke
```

Expected: smoke fails because the current manifest still contains
`IMG_8743_zyv1dr` with duration `1.866667`.

- [ ] **Step 3: Run the real read-only synchronization**

Run:

```bash
npm run sync:cloudinary -- --verify-folder-mode --accept-removals
```

Expected:

- `stand`: 80 images and 0 videos.
- `cajas`: 21 images and 70 videos.
- One omitted `short_video`.
- The removal guard accepts the approved removal from the local manifest.
- Cloudinary assets remain unchanged.

- [ ] **Step 4: Inspect the generated manifest**

Run:

```powershell
$manifest = Get-Content -LiteralPath 'src/data/generated/cloudinary-media.json' -Raw | ConvertFrom-Json
$generated = @($manifest.images | Where-Object { $_.generatedLabelNumber -ne $null })
$short = @($manifest.videos | Where-Object { $_.duration -ne $null -and [double]$_.duration -lt 2 })
[pscustomobject]@{
  Images = @($manifest.images).Count
  Videos = @($manifest.videos).Count
  GeneratedLabels = $generated.Count
  FirstLabel = ($generated | Sort-Object generatedLabelNumber | Select-Object -First 1).title
  LastLabel = ($generated | Sort-Object generatedLabelNumber | Select-Object -Last 1).title
  ShortVideos = $short.Count
} | Format-List
```

Expected: 101 images, 70 videos, 21 generated labels from
`Producto instrumental 1` through `Producto instrumental 21`, and zero short
videos.

- [ ] **Step 5: Document the rules**

Add to the Cloudinary section in `README.md`:

```md
Las imágenes de `cajas` sin `context.custom.title`, `caption` o `alt` reciben
un nombre `Producto instrumental N`. El sincronizador conserva el número por
`assetId` y asigna a cada imagen nueva el menor número libre.

Los videos con una duración conocida menor a dos segundos se registran como
`short_video` y no se publican. El archivo original permanece en Cloudinary.
```

- [ ] **Step 6: Run the complete verification gate**

Run:

```bash
npm run test:cloudinary
npm run check
npm run build
npm run test:smoke
git diff --check
```

Expected:

- Cloudinary tests: zero failures.
- Astro check: 0 errors, 0 warnings, 0 hints.
- Build: 60 static pages.
- Smoke: 13 pages pass.
- Diff check: no whitespace errors.

- [ ] **Step 7: Validate Galería and Videos in the browser**

Start `npm run preview -- --host 127.0.0.1 --port 4328` in a hidden background
process. Use the Chrome browser skill to verify:

- Galería renders 21 synchronized labels matching
  `Producto instrumental 1` through `Producto instrumental 21`.
- Existing manual instrumental cards retain their text.
- Videos renders 70 cards.
- No visible card references `IMG_8743_zyv1dr`.

Stop the exact preview process after validation and finalize the browser
session.

- [ ] **Step 8: Commit integration data and documentation**

```bash
git add README.md scripts/smoke.mjs src/data/generated/cloudinary-media.json docs/superpowers/plans/2026-07-26-cloudinary-media-labels-and-short-videos.md
git commit -m "feat(cloudinary): publish labeled instrumental media"
```
