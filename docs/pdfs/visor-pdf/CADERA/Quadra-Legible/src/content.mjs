export const brochure = Object.freeze({
  product: "QUADRA",
  line: "FAMILIA DE TALLOS FEMORALES",
  document: Object.freeze({ reference: "99.14HSC.12US", revision: "07" }),
  contact: Object.freeze({
    address: Object.freeze(["Corrientes 781", "Resistencia, Chaco (3500)"]),
    instagram: "@chacoimplanteok",
  }),
  specifications: Object.freeze({
    models: Object.freeze(["QUADRA-S", "QUADRA-H", "QUADRA-C", "QUADRA-R"]),
    s: Object.freeze({
      fixation: "NO CEMENTADO",
      material: "ALEACIÓN DE TITANIO-NIOBIO",
      surface: "TRATAMIENTO ARENADO",
    }),
    h: Object.freeze({
      fixation: "NO CEMENTADO",
      material: "ALEACIÓN DE TITANIO-NIOBIO",
      surface: "RECUBRIMIENTO DE HIDROXIAPATITA (HA)",
    }),
    c: Object.freeze({
      fixation: "CEMENTADO",
      material: "ACERO INOXIDABLE CON ALTO CONTENIDO DE NITRÓGENO",
    }),
    r: Object.freeze({ fixation: "NO CEMENTADO", use: "REVISIÓN" }),
    geometry: "DISEÑO TRIPLE CÓNICO",
  }),
  pages: Object.freeze([
    Object.freeze({
      number: "01 / 07",
      eyebrow: "SISTEMA DE CADERA",
      title: Object.freeze(["SISTEMA", "QUADRA"]),
      subtitle: "FAMILIA DE TALLOS FEMORALES",
      statement: Object.freeze(["CUATRO CONFIGURACIONES.", "UNA PLATAFORMA DE IMPLANTACIÓN."]),
    }),
    Object.freeze({
      number: "02 / 07",
      eyebrow: "01 - FAMILIA",
      title: Object.freeze(["Cuatro tallos.", "Una familia."]),
      intro: Object.freeze([
        "Alternativas para cirugía primaria y de revisión,",
        "con opciones cementadas y no cementadas.",
      ]),
      models: Object.freeze([
        Object.freeze({
          key: "s",
          name: "QUADRA-S",
          badge: "NO CEMENTADO",
          copy: Object.freeze(["Titanio-niobio.", "Tratamiento arenado."]),
        }),
        Object.freeze({
          key: "h",
          name: "QUADRA-H",
          badge: "NO CEMENTADO",
          copy: Object.freeze(["Titanio-niobio.", "Recubrimiento de HA."]),
        }),
        Object.freeze({
          key: "c",
          name: "QUADRA-C",
          badge: "CEMENTADO",
          copy: Object.freeze(["Acero inoxidable.", "Alto contenido de", "nitrógeno."]),
        }),
        Object.freeze({
          key: "r",
          name: "QUADRA-R",
          badge: "REVISIÓN",
          copy: Object.freeze(["Opción no cementada", "para cirugía de revisión."]),
        }),
      ]),
    }),
    Object.freeze({
      number: "03 / 07",
      eyebrow: "02 - SUPERFICIES",
      title: Object.freeze(["Dos superficies", "no cementadas."]),
      intro: Object.freeze([
        "Quadra-S presenta tratamiento arenado; Quadra-H incorpora",
        "recubrimiento de hidroxiapatita sobre una base de titanio-niobio.",
      ]),
      surfaces: Object.freeze([
        Object.freeze({
          key: "s",
          name: "QUADRA-S",
          badge: "ARENADO",
          copy: Object.freeze(["Aleación de titanio-niobio", "con tratamiento arenado."]),
        }),
        Object.freeze({
          key: "h",
          name: "QUADRA-H",
          badge: "HA",
          copy: Object.freeze(["Aleación de titanio-niobio", "con hidroxiapatita."]),
        }),
      ]),
      facts: Object.freeze(["NO CEMENTADO", "BASE Ti-Nb", "DOS TRATAMIENTOS"]),
    }),
    Object.freeze({
      number: "04 / 07",
      eyebrow: "03 - CONFIGURACIONES",
      title: Object.freeze(["Cementación.", "Revisión."]),
      intro: Object.freeze([
        "La familia extiende su alcance con una alternativa cementada",
        "y un tallo específico para procedimientos de revisión.",
      ]),
      configurations: Object.freeze([
        Object.freeze({
          key: "c",
          name: "QUADRA-C",
          badge: "CEMENTADO",
          copy: Object.freeze(["Acero inoxidable con", "alto contenido de nitrógeno."]),
        }),
        Object.freeze({
          key: "r",
          name: "QUADRA-R",
          badge: "REVISIÓN",
          copy: Object.freeze(["Tallo no cementado", "para cirugía de revisión."]),
        }),
      ]),
    }),
    Object.freeze({
      number: "05 / 07",
      eyebrow: "04 - GEOMETRÍA",
      title: Object.freeze(["Diseño triple cónico.", "Detalles proximales."]),
      intro: Object.freeze([
        "Las vistas frontal, lateral y superior resumen la geometría",
        "del tallo, el cuello pulido y las macroestructuras proximales.",
      ]),
      geometryCards: Object.freeze([
        Object.freeze({ key: "triple", title: "TRIPLE CÓNICO", copy: Object.freeze(["Lectura del diseño", "en tres planos."]) }),
        Object.freeze({ key: "neck", title: "CUELLO PULIDO", copy: Object.freeze(["Detalle proximal", "del cuello femoral."]) }),
        Object.freeze({ key: "macro", title: "MACROESTRUCTURAS", copy: Object.freeze(["Relieves visibles", "en la región proximal."]) }),
      ]),
    }),
    Object.freeze({
      number: "06 / 07",
      eyebrow: "05 - INSTRUMENTAL",
      title: Object.freeze(["Instrumental coordinado.", "Secuencia definida."]),
      intro: Object.freeze([
        "El sistema contempla procedimientos manuales y motorizados",
        "para la preparación, prueba e implantación definitiva.",
      ]),
      steps: Object.freeze([
        Object.freeze({ number: "01", title: "PREPARACIÓN", copy: Object.freeze(["Preparación femoral", "progresiva."]) }),
        Object.freeze({ number: "02", title: "PRUEBA", copy: Object.freeze(["Verificación", "intraoperatoria."]) }),
        Object.freeze({ number: "03", title: "IMPLANTACIÓN", copy: Object.freeze(["Colocación del", "componente definitivo."]) }),
      ]),
      note: Object.freeze(["La selección final del implante", "se realiza intraoperatoriamente."]),
    }),
    Object.freeze({
      number: "07 / 07",
      eyebrow: "SISTEMA QUADRA",
      title: Object.freeze(["Cirugía primaria.", "Cirugía de revisión."]),
      benefits: Object.freeze([
        Object.freeze({ title: "CUATRO TALLOS", copy: Object.freeze(["S, H, C y R dentro", "de una misma familia."]) }),
        Object.freeze({ title: "FIJACIÓN", copy: Object.freeze(["Alternativas cementadas", "y no cementadas."]) }),
        Object.freeze({ title: "SUPERFICIES", copy: Object.freeze(["Tratamiento arenado", "e hidroxiapatita."]) }),
      ]),
      ctaTitle: "Consultá la técnica quirúrgica completa",
      ctaSubtitle: "Sistema Quadra · Ref. 99.14HSC.12US · REV. 07",
      ctaAction: "Descargá la técnica quirúrgica",
    }),
  ]),
});
