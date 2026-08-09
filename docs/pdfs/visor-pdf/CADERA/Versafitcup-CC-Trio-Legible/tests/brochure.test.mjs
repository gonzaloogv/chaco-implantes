import { renderPages } from "../src/pages.mjs";
import { registerPreviewTests } from "../../shared-preview/register-preview-tests.mjs";

registerPreviewTests({
  projectKey: "VERSAFITCUP CC TRIO",
  expectedPages: 7,
  slug: "versafitcup-cc-trio",
  renderPages,
});
