export const brochure = Object.freeze({
  product: "SISTEMA DE HOMBRO",
  category: "ANATÓMICO + REVERSO",
  manufacturer: "Medacta International",
  distributor: "CHACO IMPLANTES",
  document: Object.freeze({ reference: "99.81MSS.11", revision: "00" }),
  address: Object.freeze(["Corrientes 781", "Resistencia, Chaco (3500)"]),
  instagram: "@chacoimplanteok",
  email: "chacoimplantes@gmail.com",
  disclaimer: "Material destinado exclusivamente a profesionales de la salud",
  assets: Object.freeze({
    anatomicExploded: "anatomica-explotada.png",
    reverseExploded: "reversa-explotada.png",
    anatomicStemless: "anatomica-stemless.png",
    reverseStemless: "reversa-stemless.png",
    anatomicDetail: "anatomica-detalle.png",
    anatomicHead: "cabeza-anatomica.png",
    reverseAssembled: "reversa-armada.png",
    anatomicGlenoid: "glenoide-anatomico.png",
    reverseBaseplate: "baseplate-reversa.png",
    logoChaco: "logo-chaco.png",
    logoMedacta: "logo-medacta.png",
  }),
  pages: Object.freeze([
    Object.freeze({
      type: "cover",
      eyebrow: "PLATAFORMA MODULAR CONVERTIBLE",
      title: Object.freeze(["SISTEMA DE", "HOMBRO"]),
      subtitle: Object.freeze([
        "Configuración anatómica y reversa sobre una plataforma",
        "humeral coordinada.",
      ]),
      statement: "UNA PLATAFORMA HUMERAL. DOS CONFIGURACIONES ARTICULARES.",
      items: Object.freeze([
        Object.freeze({ asset: "anatomicExploded", label: "CONFIGURACIÓN ANATÓMICA" }),
        Object.freeze({ asset: "reverseExploded", label: "CONFIGURACIÓN REVERSA" }),
      ]),
    }),
    Object.freeze({
      type: "humeral",
      number: "02 / 06",
      section: "01 - PLATAFORMA HUMERAL",
      title: Object.freeze(["Plataforma humeral.", "Opciones que se adaptan."]),
      summary: Object.freeze([
        "El sistema reúne alternativas diafisarias y metafisarias",
        "para las configuraciones anatómica y reversa.",
      ]),
      items: Object.freeze([
        Object.freeze({ asset: "anatomicStemless", label: "ANATÓMICA STEMLESS" }),
        Object.freeze({ asset: "reverseStemless", label: "REVERSA STEMLESS" }),
      ]),
      facts: Object.freeze([
        Object.freeze({ label: "DIÁFISIS HUMERAL", value: "4 longitudes", copy: "Corta, estándar, larga y extra-larga." }),
        Object.freeze({ label: "RANGO DIAMETRAL", value: "6-16 mm", copy: "Once diámetros en incrementos de 1 mm." }),
        Object.freeze({ label: "METÁFISIS STEMLESS", value: "6 tamaños", copy: "Alternativa de fijación metafisaria." }),
        Object.freeze({
          label: "CONFIGURACIONES",
          value: "Anatómica + reversa",
          copy: Object.freeze(["Componentes coordinados", "sobre la plataforma."]),
        }),
      ]),
      note: Object.freeze([
        "MectaGrip en los vástagos proximales y 3D Metal",
        "en la alternativa stemless favorecen la fijación primaria.",
      ]),
    }),
    Object.freeze({
      type: "anatomic",
      number: "03 / 06",
      section: "02 - CONFIGURACIÓN ANATÓMICA",
      title: Object.freeze(["Reconstrucción anatómica.", "Ajuste coordinado."]),
      summary: Object.freeze([
        "La selección de glenoide, cabeza y metáfisis permite",
        "reproducir la geometría planificada para cada paciente.",
      ]),
      assets: Object.freeze({ detail: "anatomicDetail", head: "anatomicHead" }),
      facts: Object.freeze([
        Object.freeze({ label: "GLENOIDE ANATÓMICO", value: "10 tamaños · UHMWPE" }),
        Object.freeze({ label: "ÁNGULO METAFISARIO", value: "128° / 135° / 142°" }),
        Object.freeze({ label: "DOBLE EXCÉNTRICO", value: "Hasta 5 mm" }),
        Object.freeze({ label: "CABEZA HUMERAL", value: "10 tamaños · Opción SensiTiN" }),
      ]),
      note: Object.freeze([
        "La metáfisis anatómica puede retirarse para convertir",
        "la plataforma a una configuración reversa.",
      ]),
    }),
    Object.freeze({
      type: "reverse",
      number: "04 / 06",
      section: "03 - CONFIGURACIÓN REVERSA",
      title: Object.freeze(["Configuración reversa.", "Articulación adaptable."]),
      summary: Object.freeze([
        "La glenosfera, el liner y la metáfisis se combinan",
        "según la estabilidad y el rango de movimiento planificados.",
      ]),
      asset: "reverseAssembled",
      facts: Object.freeze([
        Object.freeze({ label: "GLENOSFERAS", value: "Ø32 / Ø36 / Ø39 / Ø42" }),
        Object.freeze({ label: "LATERALIZACIÓN", value: "+4 / +9 mm" }),
        Object.freeze({ label: "ÁNGULO DEL LINER", value: "145° / 155°" }),
        Object.freeze({ label: "DISEÑO HUMERAL", value: "SEMI-INLAY" }),
      ]),
      note: Object.freeze([
        "Las opciones de diámetro, lateralización y liner",
        "permiten coordinar la configuración glenohumeral.",
      ]),
    }),
    Object.freeze({
      type: "glenoid-comparison",
      number: "05 / 06",
      section: "04 - SOLUCIONES GLENOIDEAS",
      title: Object.freeze(["Dos soluciones glenoideas.", "Selección por configuración."]),
      summary: Object.freeze([
        "La interfaz anatómica es cementada; la reversa utiliza",
        "una placa base con alternativas de fijación central.",
      ]),
      columns: Object.freeze([
        Object.freeze({
          title: "ANATÓMICA",
          asset: "anatomicGlenoid",
          facts: Object.freeze([
            Object.freeze({ label: "MATERIAL", value: "UHMWPE" }),
            Object.freeze({ label: "RANGO", value: "10 tamaños" }),
            Object.freeze({ label: "FIJACIÓN", value: "Poste central + pernos" }),
          ]),
        }),
        Object.freeze({
          title: "REVERSA",
          asset: "reverseBaseplate",
          facts: Object.freeze([
            Object.freeze({ label: "BASE CON CLAVIJA", value: "Ø22 / Ø24,5 / Ø27" }),
            Object.freeze({ label: "POSTE CENTRAL", value: "15 / 25 / 35 mm" }),
            Object.freeze({ label: "ALTERNATIVA", value: "Base roscada Ø24,5 / Ø27" }),
          ]),
        }),
      ]),
    }),
    Object.freeze({
      type: "closing",
      eyebrow: "DOCUMENTACIÓN Y CONTACTO",
      title: Object.freeze(["Documentación técnica.", "Contacto profesional."]),
      summary: Object.freeze([
        "Accedé al folleto técnico completo y encontrá",
        "la referencia del documento junto a los canales de contacto.",
      ]),
      documentLine: Object.freeze([
        "Folleto Sistema de Hombro",
        "Ref. 99.81MSS.11 · REV. 00",
      ]),
    }),
  ]),
});
