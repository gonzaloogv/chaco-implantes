export const brochure = Object.freeze({
  product: "X-ACTA",
  line: "Tallo femoral cementado",
  descriptor: "Diseño de doble conicidad · sin collar",
  disclaimer: "Material destinado exclusivamente a profesionales de la salud.",
  pages: [
    {
      number: "01 / 07",
      kind: "cover",
      eyebrow: "SISTEMA DE CADERA",
      title: "X-ACTA",
      subtitle: ["TALLO FEMORAL CEMENTADO"],
      statement: ["Doble conicidad", "Diseño sin collar"],
    },
    {
      number: "02 / 07",
      section: "01 — DISEÑO",
      kicker: "DOBLE CONICIDAD · SIN COLLAR",
      title: ["Seis decisiones visibles", "en un solo diseño"],
      summary: [
        "Geometría altamente pulida y de doble conicidad,",
        "con referencias visuales para una inserción controlada.",
      ],
      features: [
        {
          number: "01",
          title: "Sin collar",
          description: ["Ajuste de profundidad", "durante la prueba."],
        },
        {
          number: "02",
          title: "Cono con micro-rosca",
          description: ["Detalle proximal que debe", "protegerse en la inserción."],
        },
        {
          number: "03",
          title: "Doble conicidad",
          description: ["Geometría femoral para", "fijación cementada."],
        },
        {
          number: "04",
          title: "Marcas cada 4 mm",
          description: ["Referencias separadas 4 mm", "para controlar la inserción."],
        },
        {
          number: "05",
          title: "Altamente pulido",
          description: ["Acabado continuo sobre", "el cuerpo del tallo."],
        },
        {
          number: "06",
          title: "Centralizador distal",
          description: ["Componente de PMMA", "en la punta del tallo."],
        },
      ],
      technical: ["ACERO INOXIDABLE", "125° CCD", "CEMENTADO"],
    },
    {
      number: "03 / 07",
      section: "02 — CENTRALIZACIÓN",
      kicker: "CENTRALIZADOR DISTAL DE PMMA",
      title: ["Centralización distal", "según el canal femoral"],
      summary: [
        "El centralizador facilita el posicionamiento correcto",
        "y una distribución uniforme del cemento.",
      ],
      centralizers: [
        {
          name: "SIN ALETAS",
          range: "< Ø10 mm",
          description: ["Para canales menores que el", "centralizador regular cerrado."],
        },
        {
          name: "REGULAR",
          range: "Ø10–Ø18 mm",
          description: ["Configuración estándar para", "el rango intermedio del canal."],
        },
        {
          name: "GRANDE",
          range: "> Ø18 mm",
          description: ["Para canales mayores que el", "regular completamente abierto."],
        },
      ],
      process: ["CEMENTACIÓN RETRÓGRADA", "PRESURIZACIÓN DEL CEMENTO"],
    },
    {
      number: "04 / 07",
      section: "03 — CONFIGURACIONES",
      kicker: "CUATRO OPCIONES DE OFFSET",
      title: ["Cuatro offsets para", "ajustar la reconstrucción"],
      summary: [
        "Opciones de offset y tamaño resumidas para consulta rápida.",
        "La selección definitiva se confirma con la técnica completa.",
      ],
      configurations: [
        { offset: "35,5 mm", length: "ESTÁNDAR", sizes: "Tamaño 0" },
        { offset: "37,5 mm", length: "ESTÁNDAR · CORTO", sizes: "Tamaños 0–4" },
        { offset: "44 mm", length: "ESTÁNDAR · CORTO", sizes: "Tamaños 0–4" },
        { offset: "50 mm", length: "ESTÁNDAR · CORTO", sizes: "Tamaños 1–4" },
      ],
      note: "Las referencias y combinaciones vigentes se detallan en la documentación técnica.",
    },
    {
      number: "05 / 07",
      section: "04 — LONGITUD",
      kicker: "DISEÑO ESTÁNDAR Y CORTO",
      title: ["Dos longitudes", "con un CCD de 125°"],
      summary: [
        "La versión corta reduce la longitud del hombro",
        "manteniendo la familia de offsets seleccionada.",
      ],
      angle: "125°",
      lengths: [
        {
          name: "ESTÁNDAR",
          metric: "127–149 mm",
          description: ["Longitud de hombro según", "la configuración de offset."],
        },
        {
          name: "CORTO",
          metric: "123–124 mm",
          description: ["Disponible para offsets", "37,5 · 44 · 50 mm."],
        },
      ],
      note: "La opción de 35,5 mm se ofrece únicamente en longitud estándar.",
    },
    {
      number: "06 / 07",
      section: "05 — IMPLANTACIÓN",
      kicker: "SECUENCIA QUIRÚRGICA RESUMIDA",
      title: ["De la planificación", "a la cementación final"],
      summary: [
        "Cuatro momentos clave para ordenar la preparación,",
        "la prueba y la implantación del tallo X-acta.",
      ],
      steps: [
        {
          number: "01",
          title: "Planificación",
          detail: ["Preselección del tamaño", "y nivel de resección."],
        },
        {
          number: "02",
          title: "Preparación femoral",
          detail: ["Apertura y raspado progresivo", "del canal femoral."],
        },
        {
          number: "03",
          title: "Reducción de prueba",
          detail: ["Control de movilidad, estabilidad", "y longitud del miembro."],
        },
        {
          number: "04",
          title: "Cementación",
          detail: ["Centralizador distal, cementación", "retrógrada e inserción."],
        },
      ],
      closingBand: [
        { label: "FIJACIÓN", value: ["TALLO CEMENTADO"] },
        {
          label: "CONTROL FINAL",
          value: ["MOVILIDAD · ESTABILIDAD", "LONGITUD DEL MIEMBRO"],
        },
      ],
    },
    {
      number: "07 / 07",
      kind: "closing",
      title: ["Una solución cementada", "en dos longitudes"],
      highlights: [
        { label: "DOBLE CONICIDAD", detail: ["Geometría pulida", "y sin collar."] },
        { label: "CUATRO OFFSETS", detail: ["35,5 · 37,5", "44 · 50 mm."] },
        { label: "CENTRALIZADOR", detail: ["Tres opciones según", "el canal femoral."] },
      ],
      cta: "Consultá la técnica quirúrgica completa",
      ctaDetail: "Tallo X-acta® · Ref. 99.60.12 · Rev. 06",
      ctaAction: "Descargá la ficha completa",
    },
  ],
  contact: {
    address: ["Corrientes 781", "Resistencia, Chaco (3500)"],
    instagram: "@chacoimplanteok",
    email: "chacoimplantes@gmail.com",
  },
});
