import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { PROJECTS } from "../../shared-preview/projects.mjs";
import { registerPreviewTests } from "../../shared-preview/register-preview-tests.mjs";
import { renderVersafitSystem } from "../../shared-preview/versafit-system.mjs";

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const projectKey = "SPHERE MEDIAL PIVOT";

async function renderPages() {
  return renderVersafitSystem({ projectDir, config: PROJECTS[projectKey] });
}

registerPreviewTests({
  projectKey,
  expectedPages: 6,
  slug: "sphere-medial-pivot",
  renderPages,
});

test("SPHERE MEDIAL PIVOT: conserva la narrativa editorial aprobada", () => {
  const config = PROJECTS[projectKey];
  assert.ok(config, "falta registrar el proyecto Sphere Medial Pivot");
  assert.deepEqual(
    config.pages.map((page) => page.type),
    ["cover", "overview", "gallery", "split", "range", "closing"],
  );
  assert.match(config.pages[1].title.join(" "), /Estabilidad medial/i);
  assert.match(config.pages[2].title.join(" "), /Componentes/i);
  assert.match(config.pages[3].title.join(" "), /cinemática|patelar/i);
  assert.match(config.pages[4].summary.join(" "), /documentación descargable/i);
  assert.match(config.pages[5].documentLine, /99\.26SPHERE\.12.*Rev\. 05/i);
});
