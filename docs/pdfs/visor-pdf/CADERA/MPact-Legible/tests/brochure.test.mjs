import { renderPages } from "../src/pages.mjs";
import { registerPreviewTests } from "../../shared-preview/register-preview-tests.mjs";

registerPreviewTests({
  projectKey: "MPACT",
  expectedPages: 6,
  slug: "mpact",
  renderPages,
});
