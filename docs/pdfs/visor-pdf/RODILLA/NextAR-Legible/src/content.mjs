import { PROJECTS } from "../../shared-preview/projects.mjs";

export const brochure = PROJECTS.NEXTAR;

if (!brochure) {
  throw new Error("No existe la configuración editorial de NEXTAR");
}
