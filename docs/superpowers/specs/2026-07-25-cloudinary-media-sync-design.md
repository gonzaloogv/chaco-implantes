# Sincronización de medios desde Cloudinary

Fecha: 2026-07-25

Estado: aprobado

## Contexto

El sitio de Chaco Implantes usa Astro con salida estática. `src/data/site.ts` contiene las URLs de imágenes, categorías, galería y videos. La galería de eventos mantiene hoy 80 URLs de Cloudinary escritas a mano, mientras que `videos` está vacío.

Cloudinary organiza el material dentro de `chaco-implantes`. Entre sus subcarpetas se encuentran:

- `chaco-implantes/stand`, con material de eventos.
- `chaco-implantes/cajas`, con imágenes y videos de instrumental.
- `chaco-implantes/brands`, con cuatro logotipos que seguirán controlados manualmente.

Copiar cada URL al repositorio demora la carga de material nuevo y facilita errores. El proyecto necesita una sincronización de lectura que convierta el contenido de carpetas seleccionadas en datos estáticos para Astro.

## Objetivos

- Incorporar imágenes y videos desde carpetas configuradas de Cloudinary.
- Ejecutar la sincronización mediante `npm run sync:cloudinary`.
- Mantener las credenciales fuera del navegador, del manifiesto y de Git.
- Separar imágenes y videos según el `resource_type` informado por Cloudinary.
- Mapear una carpeta completa a una categoría sin configurar cada archivo.
- Reemplazar la lista manual de imágenes de eventos después de una primera sincronización válida.
- Mantener el sitio publicado independiente de la Admin API.
- Permitir que una carpeta configurada incluya sus subcarpetas.

## Fuera de alcance

- Subir, renombrar, mover, etiquetar o eliminar recursos en Cloudinary.
- Consultar la Admin API durante una visita al sitio.
- Sincronizar `chaco-implantes/brands`.
- Crear o eliminar proveedores a partir de archivos de imagen.
- Publicar carpetas que no figuren en la configuración.
- Cambiar el diseño visual de Galería o Videos.

## Decisiones

### Ejecución manual

La sincronización se ejecutará antes de publicar cuando cambie el contenido de Cloudinary:

```bash
npm run sync:cloudinary
```

El build no llamará a Cloudinary. Esta separación permite compilar y publicar el último manifiesto válido sin credenciales y sin depender de la disponibilidad o el límite de solicitudes de la Admin API.

### Configuración por carpeta

`scripts/cloudinary-folders.config.mjs` declarará el modo de carpetas y las
fuentes iniciales:

```js
export const cloudinaryFolderMode = "dynamic";

export const cloudinaryFolders = [
  {
    path: "chaco-implantes/stand",
    imageCategory: "Eventos",
    videoCategory: "Eventos",
  },
  {
    path: "chaco-implantes/cajas",
    imageCategory: "Instrumental",
    videoCategory: "Instrumental",
  },
];
```

`cloudinaryFolderMode` aceptará únicamente `dynamic` o `fixed`. Será una
decisión explícita y versionada; la sincronización no intentará adivinar ni
cambiar el modo durante una ejecución normal.

Cada entrada aplicará también a sus subcarpetas. Las rutas configuradas no
podrán solaparse, para evitar que un mismo recurso llegue desde dos búsquedas.
El sincronizador solo publicará recursos que pertenezcan a una fuente
configurada.

### Consulta de solo lectura

El script usará `fetch` de Node y no agregará un SDK. La operación principal
será una búsqueda de solo lectura mediante:

```http
POST /resources/search
Content-Type: application/json
Authorization: Basic ...
```

El uso de `POST` responde al contrato efectivo de la Search API y no modifica
recursos. El cliente tendrá una lista cerrada de operaciones: no expondrá un
método genérico para enviar solicitudes ni implementará endpoints de carga,
actualización o eliminación.

Se hará una búsqueda independiente para `stand` y otra para `cajas`. Cada
búsqueda combinará la carpeta exacta con sus subcarpetas, pedirá imágenes y
videos activos de tipo `upload`, incluirá `context`, solicitará hasta 500
resultados y continuará con `next_cursor` hasta completar el conjunto.

Para carpetas dinámicas se consultará `asset_folder`; para carpetas fijas se
consultará `folder`. Ambos campos se normalizarán a `sourceFolder` en el
manifiesto.

El comando admitirá `--verify-folder-mode` como diagnóstico opcional. Esa
bandera consultará `GET /config?settings=true` y comparará el valor remoto con
la configuración. No se ejecutará por defecto porque una API key de solo
visualización puede no tener permiso para leer la configuración del entorno.
Un error de Search o de esta comprobación será explícito: no activará un
recorrido alternativo de carpetas ni reemplazará el manifiesto.

### Credenciales

`.env.local` contendrá:

```dotenv
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

`.gitignore` excluirá `.env.local` y los patrones locales equivalentes. `.env.example` incluirá solo los nombres de las variables.

La API key debe ser una key no raíz con rol Viewer sobre las carpetas
necesarias cuando la cuenta permita asignar roles por carpeta. Una key raíz
con su secret conserva permisos completos aunque este script solo lea. El
README explicará la diferencia, recomendará una key exclusiva y no pedirá
ampliar permisos únicamente para usar la comprobación opcional de `/config`.

El script no imprimirá el secret, el encabezado de autorización ni la URL completa de una solicitud autenticada.

## Componentes

### `scripts/cloudinary-folders.config.mjs`

Mantendrá el modo y el mapa entre carpetas y categorías. Validará rutas
únicas, categorías admitidas y fuentes no solapadas. No contendrá credenciales.

### `scripts/cloudinary-media.mjs`

Contendrá funciones pequeñas y comprobables para:

- Construir expresiones Search para carpetas dinámicas o fijas.
- Normalizar títulos y textos alternativos.
- Crear URLs de entrega transformadas.
- Clasificar y filtrar recursos publicables.
- Ordenar y detectar duplicados.
- Validar el documento final.

Este módulo no escribirá archivos por su cuenta. El diseño permite probar la transformación de datos con respuestas simuladas.

### `scripts/cloudinary-admin.mjs`

Implementará únicamente las dos operaciones remotas permitidas:

- `POST /resources/search`, con paginación y cuerpo JSON.
- `GET /config?settings=true`, solo para la comprobación opcional del modo.

La paginación conservará la misma expresión y opciones en cada página y solo
agregará el `next_cursor` recibido. Rechazará cursores repetidos y respuestas
con forma inesperada.

### `scripts/sync-cloudinary.mjs`

Coordinará la ejecución:

1. Cargar variables desde `.env.local`.
2. Validar credenciales y configuración.
3. Comprobar opcionalmente el modo de carpetas.
4. Ejecutar y paginar una búsqueda por fuente.
5. Normalizar el resultado.
6. Verificar que cada fuente obligatoria tenga recursos.
7. Comparar el resultado con el manifiesto anterior.
8. Escribir el manifiesto con reemplazo atómico.
9. Mostrar un resumen con cantidades por carpeta, categoría, tipo y motivo de
   omisión.

El proyecto no agregará `dotenv`. El script leerá el archivo local con funciones de Node y respetará variables ya presentes en el entorno.

### `src/data/generated/cloudinary-media.json`

El manifiesto tendrá una versión de esquema y dos colecciones:

```json
{
  "schemaVersion": 1,
  "images": [],
  "videos": []
}
```

Cada imagen incluirá:

- `assetId`
- `sourceFolder`
- `publicId`
- `category`
- `createdAt`
- `title`
- `alt`
- `width`
- `height`
- `thumb`
- `full`

Cada video incluirá:

- `assetId`
- `sourceFolder`
- `publicId`
- `category`
- `createdAt`
- `title`
- `poster`
- `src`
- `width`
- `height`
- `duration`, cuando Cloudinary lo informe

El manifiesto no incluirá credenciales, respuestas completas de la API ni datos volátiles de la ejecución. El comando no reescribirá el archivo cuando el contenido normalizado no cambie.

### Integración con `src/data/site.ts`

`src/data/cloudinary-media-adapter.mjs` validará el snapshot durante el build,
rechazará identificadores duplicados y adaptará sus colecciones a
`GalleryItem` y `VideoItem`. `site.ts` combinará ese resultado con el contenido
editorial.

- Las imágenes de `stand` se incorporarán como `Eventos`.
- Las imágenes de `cajas` se incorporarán como `Instrumental`.
- Los videos de cada carpeta usarán la categoría correspondiente.
- La lista manual `eventGalleryImages` se eliminará cuando el manifiesto ya contenga la sincronización válida de `stand`.
- Las imágenes locales y las entradas editoriales existentes permanecerán.
- `supplierSystems` y las URLs de `brands` permanecerán sin cambios.

Mientras el manifiesto no tenga imágenes válidas de `stand`, el sitio
conservará las 80 imágenes manuales de eventos. En cuanto exista ese grupo
sincronizado, el adaptador usará únicamente las imágenes generadas para
`Eventos`, evitando duplicarlas. Este resguardo de contenido no es un fallback
de la API y no se activa ante errores del comando.

El generador rechazará cualquier `assetId` repetido antes de escribir el
manifiesto. El adaptador repetirá esa defensa para que un documento editado o
corrupto tampoco llegue al sitio.

## Transformaciones de entrega

Las imágenes usarán los tamaños que la galería ya espera:

- Miniatura: `f_auto,q_auto,c_fill,g_auto,w_600,h_400`.
- Ampliación: `f_auto,q_auto,c_limit,w_1920`.

Los videos usarán una URL optimizada para reproducción compatible con el componente actual. El póster se generará desde el primer cuadro mediante una transformación de Cloudinary con dimensiones de miniatura.

La generación conservará la versión del recurso cuando Cloudinary la entregue. Esto evita mostrar una versión anterior desde caché después de reemplazar un archivo.

Los recursos con tipos de entrega privados, `access_mode` autenticado o
`access_control` no pueden asumirse públicamente visibles. El sincronizador
revisará tanto el campo superior como el valor que Search expone dentro de
`context`, los omitirá y mostrará una advertencia identificada por `assetId`,
sin exponer información sensible.

La expresión `type=upload` ya excluye normalmente los tipos de entrega
`private` y `authenticated`. Estas comprobaciones se conservan como defensa
ante respuestas inesperadas, configuraciones heredadas y restricciones
adicionales expresadas mediante `access_mode` o `access_control`.

Cloudinary representa también audio mediante `resource_type=video`. Solo se
publicarán recursos con dimensiones visuales válidas y su entrega se
transcodificará a MP4; el audio se omitirá con un motivo explícito.

## Textos

El título y el texto alternativo seguirán esta prioridad:

1. Valores `title` y `alt` dentro del contexto de Cloudinary.
2. `display_name`.
3. Nombre final de `public_id`, sin sufijos técnicos, con guiones y guiones bajos convertidos a espacios.

El normalizador preservará caracteres Unicode y escribirá todos los archivos como UTF-8. Si ningún origen produce texto útil, el recurso no se publicará y el resumen indicará el motivo.

## Orden

Cada colección mostrará primero el recurso con `created_at` más reciente. `assetId` actuará como segundo criterio para que dos recursos con la misma fecha mantengan un orden estable.

Las entradas locales conservan su orden editorial actual. Los grupos sincronizados mantienen el orden calculado dentro de su categoría.

## Errores y escritura atómica

El sincronizador terminará con código distinto de cero si ocurre cualquiera de estas situaciones:

- Faltan variables obligatorias.
- Cloudinary rechaza la autenticación o los permisos.
- Una respuesta no cumple el esquema mínimo esperado.
- Una paginación repite cursores o supera un límite preventivo.
- Una fuente configurada devuelve cero recursos.
- El manifiesto final contiene identificadores duplicados incompatibles.
- El nuevo resultado elimina recursos que existían en el manifiesto anterior y
  no se pasó `--accept-removals`.

El comando construirá y validará el documento en memoria. Luego escribirá un archivo temporal junto al destino y lo renombrará sobre el manifiesto anterior. Un error previo al reemplazo dejará intacta la última versión válida.

Una carpeta podrá admitir un estado vacío intencional mediante `allowEmpty: true` en su entrada de configuración. Esta opción evita agregar una bandera de línea de comandos y deja la decisión versionada.

Las eliminaciones requieren una decisión distinta: el comando mostrará los
identificadores ausentes y exigirá una nueva ejecución con
`--accept-removals`. Así, una respuesta Search válida pero parcial no puede
borrar silenciosamente contenido del manifiesto.

## Pruebas

Las pruebas usarán `node:test` y respuestas simuladas, sin instalar otra dependencia ni consumir la Admin API.

Cubrirán:

- Expresiones Search para los modos `dynamic` y `fixed`.
- Una consulta independiente por fuente.
- Clasificación de imágenes, videos y recursos omitidos.
- Paginación con `next_cursor`.
- Detección de cursores repetidos.
- Conservación del cuerpo de búsqueda entre páginas.
- Prioridad de `context`, `display_name` y nombre de archivo.
- Preservación de UTF-8.
- URLs de miniatura, ampliación, reproducción y póster.
- Orden por fecha e identificador.
- Rechazo de identificadores duplicados.
- Omisión de recursos restringidos y audio.
- Rechazo de recursos devueltos fuera de la fuente consultada.
- Rechazo de fuentes vacías.
- Bloqueo y aceptación explícita de eliminaciones.
- Escritura sin cambios cuando el manifiesto coincide.
- Conservación del manifiesto anterior ante un error.
- Adaptación de un snapshot vacío y uno con imágenes y videos.

La verificación del repositorio ejecutará:

```bash
npm run test:cloudinary
npm run check
npm run build
npm run test:smoke
```

Una comprobación manual ejecutará `npm run sync:cloudinary` con la key
restringida y revisará el resumen. Si hay eliminaciones intencionales, repetirá
el comando con `--accept-removals`.

## Criterios de aceptación

- Una ejecución válida incorpora todos los recursos públicos de `stand`, `cajas` y sus subcarpetas.
- La Galería muestra las imágenes en las categorías aprobadas.
- Videos muestra los videos con título, póster y reproducción.
- Agregar o quitar un archivo en una carpeta configurada se refleja después de ejecutar la sincronización.
- El sitio compila sin credenciales cuando ya existe un manifiesto válido.
- El navegador y el build generado no contienen el API secret.
- El script solo usa `POST /resources/search` y, cuando se solicita,
  `GET /config?settings=true`; ninguna operación modifica recursos.
- Un fallo de Search termina explícitamente y conserva el manifiesto anterior,
  sin activar otro método de enumeración.
- `brands` conserva el manejo manual actual.
- Las verificaciones del repositorio finalizan sin errores.

## Referencias

- [Cloudinary Admin API](https://cloudinary.com/documentation/admin_api)
- [Cloudinary Search API](https://cloudinary.com/documentation/search_method)
- [Listado de assets](https://cloudinary.com/documentation/list_assets)
- [Roles y permisos](https://cloudinary.com/documentation/dam_permissions_migration)
