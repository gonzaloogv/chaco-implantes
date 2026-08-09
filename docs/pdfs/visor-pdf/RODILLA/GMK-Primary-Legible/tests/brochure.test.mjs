import { renderPages } from "../src/pages.mjs";
import { registerPreviewTests } from "../../shared-preview/register-preview-tests.mjs";

registerPreviewTests({
  projectKey: "GMK PRIMARY",
  expectedPages: 7,
  slug: "gmk-primary",
  renderPages,
});
