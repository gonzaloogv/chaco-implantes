import amisPdf from "../../docs/pdfs/ficha-tecnica/AMIS.pdf?url";
import cotiloDoblePdf from "../../docs/pdfs/ficha-tecnica/CADERA_DOBLE_MOVILIDAD_VERSAFITCUP_CHACO_IMPLANTES_ES.pdf?url";
import mustPdf from "../../docs/pdfs/ficha-tecnica/COLUMNA_MUST_CHACO_IMPLANTES_ES.pdf?url";
import mpactPdf from "../../docs/pdfs/ficha-tecnica/Folleto Sistema Mpact.pdf?url";
import gmkPrimaryPdf from "../../docs/pdfs/ficha-tecnica/GMK Primaria.pdf?url";
import hombroAnatomicoPdf from "../../docs/pdfs/ficha-tecnica/HOMBRO_ANATOMICO_CHACO_IMPLANTES_ES.pdf?url";
import nextarPdf from "../../docs/pdfs/ficha-tecnica/NEXTAR_CHACO_IMPLANTES_ES.pdf?url";
import hombroReversoPdf from "../../docs/pdfs/ficha-tecnica/PROTESIS_REVERSA_DE_HOMBRO_CHACO_IMPLANTES_ES.pdf?url";
import gmkSpherePdf from "../../docs/pdfs/ficha-tecnica/RODILLA GMK.pdf?url";
import gmkPrimaryPsPdf from "../../docs/pdfs/ficha-tecnica/RODILLA_GMK_ESTABILIZADA_POSTERIOR_CHACO_IMPLANTES_ES.pdf?url";
import sphereMedialPivotPdf from "../../docs/pdfs/ficha-tecnica/RODILLA_SPHERE_MEDIAL_PIVOT_CHACO_IMPLANTES_ES.pdf?url";
import sistemaHombroPdf from "../../docs/pdfs/ficha-tecnica/Sistema de Hombro - Brochure.pdf?url";
import masterlocPdf from "../../docs/pdfs/ficha-tecnica/TALLO MASTERLOC.pdf?url";
import vizionPdf from "../../docs/pdfs/ficha-tecnica/TALLO_REVISION_VIZION_CHACO_IMPLANTES_ES.pdf?url";
import smsPdf from "../../docs/pdfs/ficha-tecnica/TALLO_SMS_CHACO_IMPLANTES_ES.pdf?url";
import xActaPdf from "../../docs/pdfs/ficha-tecnica/Tallo X-Acta.pdf?url";
import gmkRevisionPdf from "../../docs/pdfs/ficha-tecnica/Tecnica Quirurgica GMK Revision.pdf?url";
import motoMedialPdf from "../../docs/pdfs/ficha-tecnica/Tecnica Quirurgica MOTO Medial.pdf?url";
import quadraPdf from "../../docs/pdfs/ficha-tecnica/Tecnica Quirurgica Quadra.pdf?url";
import versafitcupCcTrioPdf from "../../docs/pdfs/ficha-tecnica/VERSAFITCUP CC TRIO.pdf?url";

export type CatalogDocument = {
  title: string;
  fileName: string;
  downloadUrl: string;
  previewImages: string[];
  previewSources: string[];
};

type CatalogDocumentDefinition = Omit<
  CatalogDocument,
  "previewImages" | "previewSources"
> & {
  assetDirectory: string;
  assetPrefix: string;
  pageCount: number;
};

const previewAssetModules = import.meta.glob<string>(
  [
    "../../docs/pdfs/visor-pdf/*/*/output/*.webp",
    "../../docs/pdfs/visor-pdf/*/*/output/editable/*.svg",
    "../../docs/pdfs/visor-pdf/CADERA/AMIS/*.webp",
    "../../docs/pdfs/visor-pdf/CADERA/AMIS/editable/*.svg",
  ],
  {
    eager: true,
    import: "default",
    query: "?url",
  },
);

const getPreviewAsset = (relativePath: string) => {
  const modulePath = `../../docs/pdfs/visor-pdf/${relativePath}`;
  const assetUrl = previewAssetModules[modulePath];

  if (!assetUrl) {
    throw new Error(`No se encontró el recurso del visor: ${relativePath}`);
  }

  return assetUrl;
};

const createCatalogDocument = ({
  assetDirectory,
  assetPrefix,
  pageCount,
  ...document
}: CatalogDocumentDefinition): CatalogDocument => {
  const pageNumbers = Array.from({ length: pageCount }, (_, index) =>
    String(index + 1).padStart(2, "0"),
  );

  return {
    ...document,
    previewImages: pageNumbers.map((pageNumber) =>
      getPreviewAsset(
        `${assetDirectory}/${assetPrefix}-${pageNumber}.webp`,
      ),
    ),
    previewSources: pageNumbers.map((pageNumber) =>
      getPreviewAsset(
        `${assetDirectory}/editable/${assetPrefix}-${pageNumber}.svg`,
      ),
    ),
  };
};

const catalogDocuments: Record<string, CatalogDocument> = {
  "cadera/amis": createCatalogDocument({
    title: "AMIS",
    fileName: "AMIS.pdf",
    downloadUrl: amisPdf,
    assetDirectory: "CADERA/AMIS",
    assetPrefix: "amis",
    pageCount: 5,
  }),
  "cadera/cotilo-doble": createCatalogDocument({
    title: "Cadera de doble movilidad VersafitCup",
    fileName: "CADERA_DOBLE_MOVILIDAD_VERSAFITCUP_CHACO_IMPLANTES_ES.pdf",
    downloadUrl: cotiloDoblePdf,
    assetDirectory: "CADERA/Versafitcup/output",
    assetPrefix: "versafitcup",
    pageCount: 5,
  }),
  "cadera/sistema-mpact": createCatalogDocument({
    title: "Sistema Mpact",
    fileName: "Folleto Sistema Mpact.pdf",
    downloadUrl: mpactPdf,
    assetDirectory: "CADERA/MPact-Legible/output",
    assetPrefix: "mpact",
    pageCount: 6,
  }),
  "cadera/tallo-masterloc": createCatalogDocument({
    title: "Tallo Masterloc",
    fileName: "TALLO MASTERLOC.pdf",
    downloadUrl: masterlocPdf,
    assetDirectory: "CADERA/Masterloc-Legible/output",
    assetPrefix: "masterloc",
    pageCount: 6,
  }),
  "cadera/tallo-x-acta": createCatalogDocument({
    title: "Tallo X-Acta",
    fileName: "Tallo X-Acta.pdf",
    downloadUrl: xActaPdf,
    assetDirectory: "CADERA/X-Acta-Legible/output",
    assetPrefix: "x-acta",
    pageCount: 7,
  }),
  "cadera/tallo-revision-vizion": createCatalogDocument({
    title: "Tallo de revisión Vizion",
    fileName: "TALLO_REVISION_VIZION_CHACO_IMPLANTES_ES.pdf",
    downloadUrl: vizionPdf,
    assetDirectory: "CADERA/M-Vizion-Legible/output",
    assetPrefix: "m-vizion",
    pageCount: 7,
  }),
  "cadera/tallo-femoral-sms": createCatalogDocument({
    title: "Tallo femoral SMS",
    fileName: "TALLO_SMS_CHACO_IMPLANTES_ES.pdf",
    downloadUrl: smsPdf,
    assetDirectory: "CADERA/SMS-Legible/output",
    assetPrefix: "sms",
    pageCount: 6,
  }),
  "cadera/sistema-quadra": createCatalogDocument({
    title: "Sistema Quadra",
    fileName: "Tecnica Quirurgica Quadra.pdf",
    downloadUrl: quadraPdf,
    assetDirectory: "CADERA/Quadra-Legible/output",
    assetPrefix: "quadra",
    pageCount: 7,
  }),
  "cadera/versafitcup-cc-trio": createCatalogDocument({
    title: "VersafitCup CC Trio",
    fileName: "VERSAFITCUP CC TRIO.pdf",
    downloadUrl: versafitcupCcTrioPdf,
    assetDirectory: "CADERA/Versafitcup-CC-Trio-Legible/output",
    assetPrefix: "versafitcup-cc-trio",
    pageCount: 7,
  }),
  "rodilla/gmk-primary": createCatalogDocument({
    title: "GMK Primary",
    fileName: "GMK Primaria.pdf",
    downloadUrl: gmkPrimaryPdf,
    assetDirectory: "RODILLA/GMK-Primary-Legible/output",
    assetPrefix: "gmk-primary",
    pageCount: 7,
  }),
  "rodilla/gmk-sphere": createCatalogDocument({
    title: "GMK Sphere",
    fileName: "RODILLA GMK.pdf",
    downloadUrl: gmkSpherePdf,
    assetDirectory: "RODILLA/GMK-Sphere-Legible/output",
    assetPrefix: "gmk-sphere",
    pageCount: 7,
  }),
  "rodilla/gmk-primary-ps": createCatalogDocument({
    title: "GMK Primary PS",
    fileName: "RODILLA_GMK_ESTABILIZADA_POSTERIOR_CHACO_IMPLANTES_ES.pdf",
    downloadUrl: gmkPrimaryPsPdf,
    assetDirectory: "RODILLA/GMK-Primary-PS-Legible/output",
    assetPrefix: "gmk-primary-ps",
    pageCount: 6,
  }),
  "rodilla/rodilla-sphere-medial-pivot": createCatalogDocument({
    title: "Rodilla Sphere Medial Pivot",
    fileName: "RODILLA_SPHERE_MEDIAL_PIVOT_CHACO_IMPLANTES_ES.pdf",
    downloadUrl: sphereMedialPivotPdf,
    assetDirectory: "RODILLA/Sphere-Medial-Pivot-Legible/output",
    assetPrefix: "sphere-medial-pivot",
    pageCount: 6,
  }),
  "rodilla/gmk-revision": createCatalogDocument({
    title: "GMK Revision",
    fileName: "Tecnica Quirurgica GMK Revision.pdf",
    downloadUrl: gmkRevisionPdf,
    assetDirectory: "RODILLA/GMK-Revision-Legible/output",
    assetPrefix: "gmk-revision",
    pageCount: 7,
  }),
  "rodilla/moto-medial": createCatalogDocument({
    title: "MOTO Medial",
    fileName: "Tecnica Quirurgica MOTO Medial.pdf",
    downloadUrl: motoMedialPdf,
    assetDirectory: "RODILLA/MOTO-Medial-Legible/output",
    assetPrefix: "moto-medial",
    pageCount: 5,
  }),
  "rodilla/nextar-knee": createCatalogDocument({
    title: "NextAR Knee",
    fileName: "NEXTAR_CHACO_IMPLANTES_ES.pdf",
    downloadUrl: nextarPdf,
    assetDirectory: "RODILLA/NextAR-Legible/output",
    assetPrefix: "nextar",
    pageCount: 6,
  }),
  "columna/columna-must": createCatalogDocument({
    title: "Columna M.U.S.T.",
    fileName: "COLUMNA_MUST_CHACO_IMPLANTES_ES.pdf",
    downloadUrl: mustPdf,
    assetDirectory: "COLUMNA/MUST-Legible/output",
    assetPrefix: "must",
    pageCount: 6,
  }),
  "hombro/hombro-anatomico": createCatalogDocument({
    title: "Hombro anatómico",
    fileName: "HOMBRO_ANATOMICO_CHACO_IMPLANTES_ES.pdf",
    downloadUrl: hombroAnatomicoPdf,
    assetDirectory: "HOMBROS/Hombro-Anatomico-Legible/output",
    assetPrefix: "hombro-anatomico",
    pageCount: 7,
  }),
  "hombro/protesis-reversa-hombro": createCatalogDocument({
    title: "Prótesis reversa de hombro",
    fileName: "PROTESIS_REVERSA_DE_HOMBRO_CHACO_IMPLANTES_ES.pdf",
    downloadUrl: hombroReversoPdf,
    assetDirectory: "HOMBROS/Protesis-Reversa-Hombro-Legible/output",
    assetPrefix: "protesis-reversa-hombro",
    pageCount: 5,
  }),
  "hombro/sistema-hombro": createCatalogDocument({
    title: "Sistema de hombro",
    fileName: "Sistema de Hombro - Brochure.pdf",
    downloadUrl: sistemaHombroPdf,
    assetDirectory: "HOMBROS/Sistema-Hombro-Legible/output",
    assetPrefix: "sistema-hombro",
    pageCount: 6,
  }),
};

export function getCatalogDocument(
  categorySlug: string,
  productSlug: string,
): CatalogDocument | undefined {
  return catalogDocuments[`${categorySlug}/${productSlug}`];
}
