import assert from "node:assert/strict";
import { test } from "node:test";

import { PROJECTS } from "../../shared-preview/projects.mjs";
import { renderPages } from "../src/pages.mjs";
import { registerPreviewTests } from "../../shared-preview/register-preview-tests.mjs";

registerPreviewTests({
  projectKey: "GMK REVISION",
  expectedPages: 7,
  slug: "gmk-revision",
  renderPages,
});

test("GMK REVISION: la imagen de portada respeta el bloque de texto", () => {
  const hero = PROJECTS["GMK REVISION"].pages[0].heroBox;

  assert.ok(hero.x >= 500, "la imagen debe comenzar después del bloque editorial");
  assert.ok(hero.y >= 620, "la imagen debe quedar por debajo del subtítulo");
  assert.ok(hero.x + hero.width <= 1120, "la imagen debe respetar el margen derecho");
  assert.ok(hero.y + hero.height <= 1380, "la imagen no debe invadir el pie de portada");
});
