import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PROJECTS } from "../../shared-preview/projects.mjs";
import { renderVersafitSystem } from "../../shared-preview/versafit-system.mjs";

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function renderPages() {
  return renderVersafitSystem({ projectDir, config: PROJECTS["GMK PRIMARY PS"] });
}
