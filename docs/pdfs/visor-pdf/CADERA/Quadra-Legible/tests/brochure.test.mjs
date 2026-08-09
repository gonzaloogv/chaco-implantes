import { renderPages } from "../src/pages.mjs";
import { registerPreviewTests } from "../../shared-preview/register-preview-tests.mjs";

registerPreviewTests({
  projectKey: "QUADRA",
  expectedPages: 7,
  slug: "quadra",
  renderPages,
});
