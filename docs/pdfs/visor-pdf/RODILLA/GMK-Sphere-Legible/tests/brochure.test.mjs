import { renderPages } from "../src/pages.mjs";
import { registerPreviewTests } from "../../shared-preview/register-preview-tests.mjs";

registerPreviewTests({
  projectKey: "GMK SPHERE",
  expectedPages: 7,
  slug: "gmk-sphere",
  renderPages,
});
