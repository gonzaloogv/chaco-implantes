export const brochure = Object.freeze({
  product: "MPACT",
  line: "CÓTILOS HEMISFÉRICOS SIN CEMENTAR",
  document: Object.freeze({
    title: "Sistema Mpact · Folleto",
    reference: "99.70.11",
    revision: "02",
    manufacturer: "Medacta International SA",
  }),
  contact: Object.freeze({
    address: ["Corrientes 781", "Resistencia, Chaco (3500)"],
    instagram: "@chacoimplanteok",
    email: "chacoimplantes@gmail.com",
  }),
  pages: Object.freeze([
    Object.freeze({
      number: "01 / 06",
      eyebrow: "SISTEMA ACETABULAR",
      title: "SISTEMA MPACT",
      subtitle: "CÓTILOS HEMISFÉRICOS SIN CEMENTAR",
      statement: ["UNA PLATAFORMA PARA CIRUGÍA", "PRIMARIA Y DE REVISIÓN"],
    }),
    Object.freeze({
      number: "02 / 06",
      eyebrow: "01 — PLATAFORMA ACETABULAR",
      title: ["Una plataforma.", "Múltiples soluciones."],
      intro: [
        "Sistema de cúpulas acetabulares hemisféricas press-fit",
        "en aleación de titanio, con configuraciones para cirugía",
        "primaria y de revisión.",
      ],
      benefits: Object.freeze([
        Object.freeze({
          title: "ESTABILIDAD PRIMARIA",
          copy: ["Diseño press-fit para", "una fijación inicial estable."],
        }),
        Object.freeze({
          title: "FIJACIÓN BIOLÓGICA",
          copy: ["Superficies porosas", "para favorecer la", "osteointegración."],
        }),
        Object.freeze({
          title: "BLOQUEO DEL INSERTO",
          copy: ["Sistema de clip", "y lengüetas", "antirrotación."],
        }),
      ]),
      facts: Object.freeze(["TITANIO", "PRESS-FIT", "PRIMARIA · REVISIÓN"]),
    }),
    Object.freeze({
      number: "03 / 06",
      eyebrow: "02 — TECNOLOGÍAS DE SUPERFICIE",
      title: ["Dos superficies.", "Una misma plataforma."],
      intro: [
        "La superficie exterior se selecciona según la configuración",
        "de copa y la solución acetabular requerida.",
      ],
      surfaces: Object.freeze([
        Object.freeze({
          name: "MECTAGRIP",
          subtitle: "RECUBRIMIENTO POROSO DE TITANIO",
          copy: [
            "Titanio comercialmente puro",
            "depositado por Vacuum Plasma",
            "Spray (VPS).",
          ],
          facts: ["Poros de 100–350 μm", "Alta porosidad", "Alto coeficiente de fricción"],
        }),
        Object.freeze({
          name: "3D METAL",
          subtitle: "ESTRUCTURA TRIDIMENSIONAL",
          copy: [
            "Arquitectura metálica visible",
            "en configuraciones identificadas",
            "como 3D Metal.",
          ],
          facts: ["Two-Hole", "Multi-Hole", "Selección por configuración"],
        }),
      ]),
      note: Object.freeze([
        "CONSULTÁ LA DISPONIBILIDAD DE CADA SUPERFICIE",
        "SEGÚN MEDIDA Y CONFIGURACIÓN",
      ]),
    }),
    Object.freeze({
      number: "04 / 06",
      eyebrow: "03 — CONFIGURACIONES DE COPA",
      title: ["Cuatro configuraciones", "para distintos escenarios"],
      intro: [
        "La cantidad y posición de los orificios amplían las opciones",
        "de fijación según el stock óseo disponible.",
      ],
      configurations: Object.freeze([
        Object.freeze({ name: "NO-HOLE", detail: "Sin orificios", range: "46–66 mm" }),
        Object.freeze({ name: "TWO-HOLE", detail: "Dos orificios", range: "46–66 mm", variant: "MectaGrip · 3D Metal" }),
        Object.freeze({ name: "MULTI-HOLE", detail: "Multiorificio", range: "46–76 mm", variant: "MectaGrip · 3D Metal" }),
        Object.freeze({ name: "RIM-HOLE", detail: "Orificios en el borde", range: "56–76 mm" }),
      ]),
      multiHole: "12–17 UBICACIONES SEGÚN TAMAÑO",
      rimHole: "TORNILLOS ESPONJOSOS Y CORTICALES",
    }),
    Object.freeze({
      number: "05 / 06",
      eyebrow: "04 — OPCIONES DE ARTICULACIÓN",
      title: ["Insertos para distintas", "estrategias de reconstrucción"],
      intro: [
        "La plataforma integra alternativas de polietileno, cerámica",
        "y doble movilidad según la configuración seleccionada.",
      ],
      liners: Object.freeze([
        Object.freeze({
          name: "DOBLE MOVILIDAD",
          copy: ["Copa e inserto para una", "opción de doble movilidad."],
        }),
        Object.freeze({
          name: "HIGHCROSS",
          copy: ["UHMWPE altamente", "reticulado.", "Configuración plana."],
        }),
        Object.freeze({
          name: "CERÁMICO",
          copy: ["BIOLOX delta", "para versiones", "Two-Hole", "y Rim-Hole."],
        }),
      ]),
      screws: Object.freeze([
        Object.freeze({ type: "ESPONJOSO", range: "15–70 mm" }),
        Object.freeze({ type: "CORTICAL", range: "25–55 mm" }),
      ]),
    }),
    Object.freeze({
      number: "06 / 06",
      eyebrow: "SISTEMA ACETABULAR MPACT",
      title: ["Una plataforma.", "Cuatro configuraciones.", "Tres opciones de inserto."],
      benefits: Object.freeze([
        Object.freeze({ title: "PRIMARIA Y REVISIÓN", copy: ["Soluciones para diferentes", "escenarios acetabulares."] }),
        Object.freeze({ title: "FIJACIÓN", copy: ["Configuraciones sin orificios,", "con orificios y Rim-Hole."] }),
        Object.freeze({ title: "ARTICULACIÓN", copy: ["Doble movilidad, Highcross", "y opción cerámica."] }),
      ]),
      ctaTitle: "Consultá la documentación completa",
      ctaSubtitle: "Folleto Sistema Mpact · Ref. 99.70.11 · REV. 02",
      ctaAction: "Descargá el folleto completo",
    }),
  ]),
});
