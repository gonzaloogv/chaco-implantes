export const brochure = Object.freeze({
  product: "M-VIZION",
  line: "TALLO FEMORAL MODULAR DE REVISIÓN",
  document: Object.freeze({
    title: "Tallo de revisión Vizion · Técnica quirúrgica",
    reference: "99.66.12",
    revision: "06",
    manufacturer: "Medacta International SA",
  }),
  contact: Object.freeze({
    address: ["Corrientes 781", "Resistencia, Chaco (3500)"],
    instagram: "@chacoimplanteok",
    email: "chacoimplantes@gmail.com",
  }),
  pages: Object.freeze([
    Object.freeze({
      number: "01 / 07",
      eyebrow: "TALLO DE REVISIÓN",
      title: "M-VIZION",
      subtitle: "Sistema femoral modular no cementado",
      statement: ["CONFIGURACIÓN PROXIMAL", "Y DISTAL INDEPENDIENTE"],
    }),
    Object.freeze({
      number: "02 / 07",
      eyebrow: "01 — ARQUITECTURA MODULAR",
      title: ["Dos componentes.", "Una reconstrucción adaptable."],
      intro: [
        "El sistema combina un cuerpo proximal y un tallo distal",
        "de aleación de titanio. La unión cónica y el tornillo definitivo",
        "completan el bloqueo modular.",
      ],
      modules: Object.freeze([
        Object.freeze({
          name: "CUERPO PROXIMAL",
          copy: ["Define altura, diámetro,", "offset y anteversión."],
        }),
        Object.freeze({
          name: "TALLO DISTAL",
          copy: ["Aporta fijación axial", "y rotacional a presión."],
        }),
        Object.freeze({
          name: "BLOQUEO",
          copy: ["Acople cónico más tornillo", "definitivo con torque."],
        }),
      ]),
      note: Object.freeze([
        "Versiones proximales con o sin tres orificios",
        "para complementar la fijación trocantérica",
        "mediante cables.",
      ]),
    }),
    Object.freeze({
      number: "03 / 07",
      eyebrow: "02 — RECONSTRUCCIÓN PROXIMAL",
      title: ["Control proximal", "en múltiples variables"],
      intro: [
        "La modularidad permite seleccionar cada cuerpo según la anatomía",
        "y la estabilidad obtenida durante la prueba.",
      ],
      diameters: Object.freeze(["20 mm", "24 mm", "28 mm", "32 mm"]),
      lengthRange: "40–90 mm",
      lengthStep: "incrementos de 10 mm",
      variants: Object.freeze([
        Object.freeze({ label: "STD", value: "offset 37 mm" }),
        Object.freeze({ label: "LAT", value: "offset 43 mm" }),
      ]),
      angle: "132°",
      angleLabel: "ÁNGULO CCD",
    }),
    Object.freeze({
      number: "04 / 07",
      eyebrow: "03 — FIJACIÓN DISTAL",
      title: ["Tres longitudes.", "Diámetro progresivo."],
      intro: [
        "El tallo distal se selecciona de forma independiente para buscar",
        "contacto cortical y estabilidad primaria.",
      ],
      lengths: Object.freeze(["140 mm", "180 mm", "220 mm"]),
      diameterRange: "12–28 mm",
      diameterStep: "1 mm",
      facts: Object.freeze([
        Object.freeze({ label: "ALEACIÓN", value: "Titanio" }),
        Object.freeze({ label: "FIJACIÓN", value: "No cementada" }),
        Object.freeze({ label: "PREPARACIÓN", value: "Fresado manual" }),
      ]),
      caution: Object.freeze([
        "La selección definitiva depende de la calidad ósea y de la",
        "estabilidad axial y rotacional obtenida.",
      ]),
    }),
    Object.freeze({
      number: "05 / 07",
      eyebrow: "04 — PRUEBA Y AJUSTE",
      title: ["Verificar antes", "del bloqueo definitivo"],
      intro: [
        "El cuerpo proximal de prueba permite corregir anteversión,",
        "offset y longitud antes de elegir el implante definitivo.",
      ],
      checks: Object.freeze([
        Object.freeze({
          name: "SELECCIÓN",
          copy: ["Altura, diámetro", "y versión proximal."],
        }),
        Object.freeze({
          name: "ORIENTACIÓN",
          copy: ["Ajuste de anteversión", "sobre el tallo distal."],
        }),
        Object.freeze({
          name: "REDUCCIÓN",
          copy: ["Movilidad, estabilidad", "y longitud del miembro."],
        }),
      ]),
      summary: ["MOVILIDAD · ESTABILIDAD", "OFFSET · LONGITUD"],
    }),
    Object.freeze({
      number: "06 / 07",
      eyebrow: "05 — ENSAMBLAJE Y BLOQUEO",
      title: ["Ensamblaje sobre mesa", "con control de torque"],
      intro: [
        "La alternativa extracorpórea organiza el acople del cuerpo proximal",
        "y el tallo distal antes de la implantación.",
      ],
      steps: Object.freeze([
        Object.freeze({ number: "01", title: "POSICIONAR", copy: ["Elegir el inserto", "del tamaño distal."] }),
        Object.freeze({ number: "02", title: "ACOPLAR", copy: ["Unir los componentes", "sobre la mesa."] }),
        Object.freeze({ number: "03", title: "APLICAR TORQUE", copy: ["Confirmar el clic", "con contratorque."] }),
        Object.freeze({ number: "04", title: "BLOQUEAR", copy: ["Colocar el tornillo", "definitivo."] }),
      ]),
      warning: Object.freeze([
        "NO REUTILIZAR UN TORNILLO",
        "QUE YA FUE AJUSTADO",
      ]),
    }),
    Object.freeze({
      number: "07 / 07",
      eyebrow: "SISTEMA FEMORAL MODULAR DE REVISIÓN",
      title: ["Una plataforma", "para reconstrucción", "compleja"],
      benefits: Object.freeze([
        Object.freeze({ title: "MODULARIDAD", copy: ["Selección proximal", "y distal independiente."] }),
        Object.freeze({ title: "CONFIGURACIONES", copy: ["Alturas, diámetros", "y offsets combinables."] }),
        Object.freeze({ title: "FLUJO CONTROLADO", copy: ["Prueba, acople", "y bloqueo por torque."] }),
      ]),
      ctaTitle: "Consultá la técnica quirúrgica completa",
      ctaSubtitle: "M-Vizion Surgical Technique · Ref. 99.66.12 · REV. 06",
      ctaAction: "Descargá la ficha completa",
    }),
  ]),
});
