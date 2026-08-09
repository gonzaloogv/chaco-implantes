export const brochure = Object.freeze({
  product: "GMK PRIMARY PS",
  line: "GLOBAL MEDACTA KNEE",
  descriptor: "Sistema de rodilla con estabilización posterior",
  document: Object.freeze({ reference: "99.26PRIMARY.12", revision: "00" }),
  specifications: Object.freeze({
    femoralStandardRange: "0–7",
    femoralNarrowRange: "1N–7N",
    tibialRange: "1–6",
    insertRange: "1–6",
    insertThicknesses: Object.freeze([10, 12, 14, 17, 20]),
    versions: Object.freeze(["ESTÁNDAR", "SENSITIN"]),
    patellaRange: "1–4",
    tibialExtensions: Object.freeze(["Ø11 mm × L30 mm", "Ø11 mm × L65 mm"]),
  }),
  contact: Object.freeze({
    address: Object.freeze(["Corrientes 781", "Resistencia, Chaco (3500)"]),
    instagram: "@chacoimplanteok",
  }),
  pages: Object.freeze([
    Object.freeze({ number: "01 / 06", section: "PORTADA" }),
    Object.freeze({ number: "02 / 06", section: "CONFIGURACIÓN PS" }),
    Object.freeze({ number: "03 / 06", section: "COMPONENTES Y VARIANTES" }),
    Object.freeze({ number: "04 / 06", section: "RANGO Y CONFIGURACIONES" }),
    Object.freeze({ number: "05 / 06", section: "OPCIONES COMPATIBLES" }),
    Object.freeze({ number: "06 / 06", section: "DOCUMENTACIÓN" }),
  ]),
});
