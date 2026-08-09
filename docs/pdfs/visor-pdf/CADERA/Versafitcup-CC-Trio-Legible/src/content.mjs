export const brochure = Object.freeze({
  product: "VERSAFITCUP CC TRIO",
  line: "SISTEMA ACETABULAR NO CEMENTADO",
  document: Object.freeze({ reference: "99.16TRIO.11", revision: "03" }),
  contact: Object.freeze({
    address: Object.freeze(["Corrientes 781", "Resistencia, Chaco (3500)"]),
    instagram: "@chacoimplanteok",
  }),
  specifications: Object.freeze({
    variants: Object.freeze(["CC TRIO", "CC TRIO NO-HOLE"]),
    fixation: "PRESS-FIT ELÍPTICO",
    rimAngle: "5°",
    material: "ALEACIÓN DE TITANIO-VANADIO",
    coatings: Object.freeze(["TITANIO 100 μm", "HIDROXIAPATITA 90 μm"]),
    cupSizes: Object.freeze([42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64]),
    headSizes: Object.freeze([22, 28, 32, 36, 40]),
    screwDiameter: "6,5 mm",
    screwLengths: "20–45 mm",
    liners: Object.freeze(["CERÁMICA BIOLOX DELTA", "UHMWPE HIGHCROSS PLANO", "UHMWPE CON CEJA 10°"]),
  }),
  pages: Object.freeze([
    Object.freeze({
      number: "01 / 07",
      eyebrow: "SISTEMA DE CADERA",
      title: Object.freeze(["VERSAFITCUP", "CC TRIO"]),
      subtitle: "SISTEMA ACETABULAR NO CEMENTADO",
      statement: Object.freeze(["ESTABILIDAD PRIMARIA.", "FLEXIBILIDAD DE CONFIGURACIÓN."]),
    }),
    Object.freeze({
      number: "02 / 07",
      eyebrow: "01 - CONFIGURACIONES",
      title: Object.freeze(["Dos cotilos.", "Una geometría común."]),
      intro: Object.freeze([
        "CC Trio y CC Trio No-Hole comparten material, recubrimientos",
        "y acoplamiento del liner; cambia la estrategia de fijación.",
      ]),
      shells: Object.freeze([
        Object.freeze({
          key: "orificios",
          badge: "CC TRIO",
          title: "CON ORIFICIOS",
          copy: Object.freeze(["Orificios laterales para", "fijación suplementaria."]),
        }),
        Object.freeze({
          key: "noHole",
          badge: "NO-HOLE",
          title: "SIN ORIFICIOS",
          copy: Object.freeze(["Misma geometría exterior", "en configuración No-Hole."]),
        }),
      ]),
      screw: Object.freeze({
        title: "FIJACIÓN CON TORNILLOS",
        copy: Object.freeze(["Aleación de titanio · Ø 6,5 mm", "Longitudes disponibles: 20–45 mm"]),
      }),
    }),
    Object.freeze({
      number: "03 / 07",
      eyebrow: "02 - ESTABILIDAD",
      title: Object.freeze(["Press-fit elíptico.", "Contacto ecuatorial."]),
      intro: Object.freeze([
        "La geometría combina aplanamiento polar, ajuste ecuatorial",
        "y macroestructuras circulares para la estabilidad primaria.",
      ]),
      surface: Object.freeze({
        badge: "SUPERFICIE",
        title: "DOBLE RECUBRIMIENTO",
        copy: Object.freeze(["Titanio 100 μm", "Hidroxiapatita 90 μm"]),
      }),
      technical: Object.freeze([
        Object.freeze({ badge: "PRESS-FIT", title: "FORMA ELÍPTICA", copy: Object.freeze(["Ajuste ecuatorial", "y aplanamiento polar."]) }),
        Object.freeze({ badge: "BORDE", title: "ELEVACIÓN DE 5°", copy: Object.freeze(["Geometría superior", "visible en el corte."]) }),
      ]),
      facts: Object.freeze(["Ø 0,7 mm", "+30–40 %", "Ti + HA"]),
      factLabels: Object.freeze(["MACROESTRUCTURAS", "CONTACTO IMPLANTE-HUESO", "RECUBRIMIENTOS"]),
    }),
    Object.freeze({
      number: "04 / 07",
      eyebrow: "03 - LINERS",
      title: Object.freeze(["Tres opciones.", "Una interfaz de bloqueo."]),
      intro: Object.freeze([
        "La plataforma admite liners cerámicos y de polietileno",
        "para adaptar el par de fricción y la geometría articular.",
      ]),
      liners: Object.freeze([
        Object.freeze({ key: "ceramic", badge: "CERÁMICA", title: "BIOLOX DELTA", copy: Object.freeze(["Liner cerámico", "de color rosa."]) }),
        Object.freeze({ key: "highcross", badge: "UHMWPE", title: "HIGHCROSS PLANO", copy: Object.freeze(["Polietileno reticulado", "en versión plana."]) }),
        Object.freeze({ key: "elevated", badge: "10°", title: "LINER CON CEJA", copy: Object.freeze(["Opción elevada", "de polietileno."]) }),
      ]),
    }),
    Object.freeze({
      number: "05 / 07",
      eyebrow: "04 - ACOPLAMIENTO",
      title: Object.freeze(["Bloqueo multidentado.", "Compatibilidad ampliada."]),
      intro: Object.freeze([
        "La corona multidentada limita la rotación y el micromovimiento",
        "del liner dentro del cotilo.",
      ]),
      cards: Object.freeze([
        Object.freeze({ key: "locking", badge: "BLOQUEO", title: "CORONA MULTIDENTADA", copy: Object.freeze(["Detalle de la interfaz", "cotilo-liner."]) }),
        Object.freeze({ key: "section", badge: "CORTE", title: "COPA + LINER", copy: Object.freeze(["Lectura de la geometría", "interna del sistema."]) }),
        Object.freeze({ key: "heads", badge: "CABEZA", title: "DIÁMETROS GRANDES", copy: Object.freeze(["36 mm desde cotilo 50", "40 mm desde cotilo 56."]) }),
      ]),
    }),
    Object.freeze({
      number: "06 / 07",
      eyebrow: "05 - GAMA",
      title: Object.freeze(["Rango amplio.", "Lectura directa."]),
      intro: Object.freeze([
        "Una síntesis comercial de las combinaciones principales.",
        "La tabla completa permanece en la ficha técnica descargable.",
      ]),
      range: Object.freeze([
        Object.freeze({ value: "42–64 mm", label: "TAMAÑOS DE COTILO", copy: Object.freeze(["Doce diámetros", "en pasos de 2 mm."]) }),
        Object.freeze({ value: "22–40 mm", label: "CABEZA FEMORAL", copy: Object.freeze(["Cinco diámetros", "según cotilo y liner."]) }),
        Object.freeze({ value: "Ti + HA", label: "RECUBRIMIENTOS", copy: Object.freeze(["Titanio 100 μm", "HA 90 μm."]) }),
        Object.freeze({ value: "6,5 mm", label: "TORNILLOS", copy: Object.freeze(["Longitudes", "de 20 a 45 mm."]) }),
      ]),
    }),
    Object.freeze({
      number: "07 / 07",
      eyebrow: "VERSAFITCUP CC TRIO",
      title: Object.freeze(["Estabilidad.", "Flexibilidad articular."]),
      benefits: Object.freeze([
        Object.freeze({ title: "DOS COTILOS", copy: Object.freeze(["Con orificios", "y No-Hole."]) }),
        Object.freeze({ title: "PRESS-FIT", copy: Object.freeze(["Geometría elíptica", "y borde de 5°."]) }),
        Object.freeze({ title: "TRES LINERS", copy: Object.freeze(["Cerámica, plano", "y ceja de 10°."]) }),
      ]),
      ctaTitle: "Consultá la ficha técnica completa",
      ctaSubtitle: "VersaFitcup CC Trio · Ref. 99.16TRIO.11 · REV. 03",
      ctaAction: "Descargá la ficha técnica completa",
    }),
  ]),
});
