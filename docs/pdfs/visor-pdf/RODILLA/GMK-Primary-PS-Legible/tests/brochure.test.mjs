import { renderPages } from "../src/pages.mjs";
import { registerPreviewTests } from "../../shared-preview/register-preview-tests.mjs";

registerPreviewTests({
  projectKey: "GMK PRIMARY PS",
  expectedPages: 6,
  slug: "gmk-primary-ps",
  renderPages,
});
