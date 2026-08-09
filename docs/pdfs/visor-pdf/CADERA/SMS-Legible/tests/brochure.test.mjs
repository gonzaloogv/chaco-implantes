import { renderPages } from "../src/pages.mjs";
import { registerPreviewTests } from "../../shared-preview/register-preview-tests.mjs";

registerPreviewTests({
  projectKey: "SMS",
  expectedPages: 6,
  slug: "sms",
  renderPages,
});
