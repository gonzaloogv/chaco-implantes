export const brochure = Object.freeze({
  product: "COLUMNA M.U.S.T.",
  category: "SISTEMA DE COLUMNA",
  manufacturer: "Medacta International SA",
  distributor: "CHACO IMPLANTES",
  document: Object.freeze({
    reference: "99.46.12",
    revision: "12",
    updated: "Agosto de 2020",
    manufacturer: "Medacta International SA",
    ce: "0476",
  }),
  address: Object.freeze(["Corrientes 781", "Resistencia, Chaco (3500)"]),
  instagram: "@chacoimplanteok",
  email: "chacoimplantes@gmail.com",
  disclaimer: "Material destinado exclusivamente a profesionales de la salud",
  assets: Object.freeze({
    constructPosterior: "construct-posterior.png",
    constructLateral: "construct-lateral.png",
    polyaxial: "screw-polyaxial.png",
    monoaxial: "screw-monoaxial.png",
    revision: "screw-revision.png",
    reduction: "screw-reduction.png",
    augmentable: "screw-augmentable.png",
    crossConnector: "cross-connector.png",
    lateralConnector: "lateral-connector.png",
    pedicleHook: "pedicle-hook.png",
    dominoConnector: "domino-connector.png",
    logoChaco: "logo-chaco.png",
    logoMedacta: "logo-medacta.png",
  }),
  pages: Object.freeze([
    Object.freeze({
      type: "cover",
      eyebrow: "FIJACIÓN VERTEBRAL POSTERIOR",
      title: Object.freeze(["COLUMNA", "M.U.S.T."]),
      subtitle: Object.freeze([
        "Sistema universal de tornillos pediculares",
        "para estabilización vertebral.",
      ]),
      statement: "VERSATILIDAD DE ANCLAJES. CONTROL DEL CONSTRUCTO.",
      asset: "constructPosterior",
      assetLabel: "CONFIGURACIÓN POSTERIOR",
    }),
    Object.freeze({
      type: "platform",
      number: "02 / 06",
      section: "01 - PLATAFORMA",
      title: Object.freeze(["Una plataforma.", "Múltiples abordajes."]),
      summary: Object.freeze([
        "Sistema modular para fijación vertebral posterior",
        "no cervical y anterolateral.",
      ]),
      asset: "constructLateral",
      assetLabel: "VISTA LATERAL DEL CONSTRUCTO",
      facts: Object.freeze([
        Object.freeze({ label: "FIJACIÓN POSTERIOR", value: "T1-S2/ilion" }),
        Object.freeze({ label: "FIJACIÓN ANTEROLATERAL", value: "T8-L5" }),
        Object.freeze({ label: "ABORDAJES", value: "ABIERTO + MIS" }),
        Object.freeze({ label: "BARRAS", value: "Ø5,5 mm", copy: "Titanio o CoCr; rectas o precontorneadas." }),
      ]),
      note: Object.freeze([
        "La selección de componentes se adecua a la anatomía,",
        "la calidad ósea y el objetivo de corrección.",
      ]),
    }),
    Object.freeze({
      type: "screws",
      number: "03 / 06",
      section: "02 - ANCLAJES PEDICULARES",
      title: Object.freeze(["Tornillos pediculares.", "Dos comportamientos."]),
      summary: Object.freeze([
        "La familia integra alternativas poliaxiales y monoaxiales",
        "en múltiples diámetros y longitudes.",
      ]),
      items: Object.freeze([
        Object.freeze({
          asset: "polyaxial",
          label: "POLIAXIAL",
          copy: Object.freeze(["Cabeza móvil para acompañar", "la alineación de la barra."]),
        }),
        Object.freeze({
          asset: "monoaxial",
          label: "MONOAXIAL",
          copy: Object.freeze(["Cabeza fija para control", "directo del constructo."]),
        }),
      ]),
      facts: Object.freeze([
        Object.freeze({ label: "CONSTRUCCIÓN", value: "SÓLIDOS + CANULADOS" }),
        Object.freeze({ label: "AVANCE", value: "DOBLE ROSCA" }),
      ]),
      note: Object.freeze([
        "El diámetro y la longitud se seleccionan según la anatomía",
        "y la preparación pedicular planificada.",
      ]),
    }),
    Object.freeze({
      type: "specialized",
      number: "04 / 06",
      section: "03 - OPCIONES ESPECÍFICAS",
      title: Object.freeze(["Tres alternativas.", "Un mismo sistema."]),
      summary: Object.freeze([
        "Variantes orientadas a escenarios de revisión,",
        "reducción de barra y técnica de aumentación.",
      ]),
      items: Object.freeze([
        Object.freeze({
          asset: "revision",
          label: "REVISIÓN",
          copy: Object.freeze(["Opción de anclaje para", "cirugía de revisión."]),
        }),
        Object.freeze({
          asset: "reduction",
          label: "REDUCCIÓN",
          copy: Object.freeze(["Tulipa extendida", "para asistir el descenso", "de la barra."]),
        }),
        Object.freeze({
          asset: "augmentable",
          label: "AUMENTABLE",
          copy: Object.freeze(["Canales distales para", "técnica de aumentación."]),
        }),
      ]),
      note: Object.freeze([
        "La variante se define según la estrategia de fijación",
        "y las condiciones del sitio de anclaje.",
      ]),
    }),
    Object.freeze({
      type: "connections",
      number: "05 / 06",
      section: "04 - GANCHOS Y CONECTORES",
      title: Object.freeze(["Conexiones que completan", "el constructo."]),
      summary: Object.freeze([
        "Componentes para estabilización transversal, fijación",
        "ilíaca y unión de barras.",
      ]),
      items: Object.freeze([
        Object.freeze({
          asset: "crossConnector",
          label: "TRANSVERSAL",
          copy: "Estabilidad entre barras.",
        }),
        Object.freeze({
          asset: "lateralConnector",
          label: "LATERAL",
          copy: "Desplazamiento mediolateral.",
        }),
        Object.freeze({
          asset: "pedicleHook",
          label: "GANCHO PEDICULAR",
          copy: "Alternativa de anclaje posterior.",
        }),
        Object.freeze({
          asset: "dominoConnector",
          label: "BARRA A BARRA",
          copy: "Unión en línea o en paralelo.",
        }),
      ]),
    }),
    Object.freeze({
      type: "closing",
      eyebrow: "DOCUMENTACIÓN Y CONTACTO",
      title: Object.freeze(["Documentación técnica.", "Contacto profesional."]),
      summary: Object.freeze([
        "Accedé a la técnica quirúrgica completa",
        "y encontrá la referencia del documento",
        "junto a los canales de contacto.",
      ]),
      documentLine: Object.freeze([
        "Columna M.U.S.T. - Técnica Quirúrgica",
        "Ref. 99.46.12 · REV. 12 · Actualización: Agosto de 2020 · CE 0476",
      ]),
    }),
  ]),
});
