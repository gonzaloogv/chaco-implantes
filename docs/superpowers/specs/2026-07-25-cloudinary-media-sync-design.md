# Sincronización de medios desde Cloudinary

Fecha: 2026-07-25

Estado: aprobado

## Contexto

El sitio de Chaco Implantes usa Astro con salida estática. `src/data/site.ts` contiene las URLs de imágenes, categorías, galería y videos. La galería de eventos mantiene hoy más de cien URLs de Cloudinary escritas a mano, mientras que `videos` está vacío.

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

`scripts/cloudinary-folders.config.mjs` declarará las fuentes iniciales:

```js
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

Cada entrada aplicará también a sus subcarpetas. Si en el futuro una subcarpeta necesita otra categoría, una entrada más específica tendrá prioridad sobre la carpeta padre.

El sincronizador solo publicará carpetas configuradas. Podrá informar otras carpetas encontradas bajo `chaco-implantes`, pero no incorporará sus recursos.

### Consulta de solo lectura

El script usará `fetch` de Node y no agregará un SDK. Todas las solicitudes usarán el método `GET`.

Para entornos de Cloudinary con carpetas dinámicas:

1. `GET /folders/:folder` enumerará subcarpetas.
2. `GET /resources/by_asset_folder` obtendrá los recursos ubicados directamente en cada carpeta.
3. `next_cursor` permitirá recuperar todas las páginas, con hasta 500 recursos por solicitud.
4. La consulta pedirá `context=true` para recuperar textos disponibles.

El endpoint por carpeta devuelve imágenes y videos en una misma respuesta. El script ignorará recursos `raw` y reportará el total omitido.

La primera ejecución validará que la cuenta admita `resources/by_asset_folder`. Si la cuenta usa el modo legado de carpetas fijas, el comando terminará con una explicación y conservará el manifiesto anterior. Dar soporte al modo legado requeriría consultas por prefijo y por tipo de recurso, y no forma parte de este alcance.

### Credenciales

`.env.local` contendrá:

```dotenv
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

`.gitignore` excluirá `.env.local` y los patrones locales equivalentes. `.env.example` incluirá solo los nombres de las variables.

La API key debe tener permisos de visualización sobre las carpetas necesarias cuando la cuenta permita asignar roles por carpeta. Una key estándar con su secret puede tener permisos mayores aunque el script solo haga lecturas. El README explicará esta diferencia y recomendará una key exclusiva y restringida.

El script no imprimirá el secret, el encabezado de autorización ni la URL completa de una solicitud autenticada.

## Componentes

### `scripts/cloudinary-folders.config.mjs`

Mantendrá el mapa entre carpetas y categorías. Validará rutas únicas, categorías admitidas y entradas más específicas. No contendrá credenciales.

### `scripts/cloudinary-media.mjs`

Contendrá funciones pequeñas y comprobables para:

- Construir URLs autenticadas sin registrarlas.
- Paginar respuestas.
- Recorrer subcarpetas.
- Elegir el mapeo más específico.
- Normalizar títulos y textos alternativos.
- Crear URLs de entrega transformadas.
- Ordenar y eliminar duplicados.
- Validar el documento final.

Este módulo no escribirá archivos por su cuenta. El diseño permite probar la transformación de datos con respuestas simuladas.

### `scripts/sync-cloudinary.mjs`

Coordinará la ejecución:

1. Cargar variables desde `.env.local`.
2. Validar credenciales y configuración.
3. Obtener carpetas y recursos.
4. Normalizar el resultado.
5. Verificar que cada fuente obligatoria tenga recursos.
6. Escribir el manifiesto con reemplazo atómico.
7. Mostrar un resumen con cantidades por carpeta, categoría y tipo.

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

`site.ts` importará el manifiesto y adaptará sus colecciones a `GalleryItem` y `VideoItem`.

- Las imágenes de `stand` se incorporarán como `Eventos`.
- Las imágenes de `cajas` se incorporarán como `Instrumental`.
- Los videos de cada carpeta usarán la categoría correspondiente.
- La lista manual `eventGalleryImages` se eliminará cuando el manifiesto ya contenga la sincronización válida de `stand`.
- Las imágenes locales y las entradas editoriales existentes permanecerán.
- `supplierSystems` y las URLs de `brands` permanecerán sin cambios.

El adaptador eliminará duplicados por `assetId`. Si una entrada manual y una generada apuntan al mismo recurso sin compartir `assetId`, también comparará la ruta de entrega normalizada.

## Transformaciones de entrega

Las imágenes usarán los tamaños que la galería ya espera:

- Miniatura: `f_auto,q_auto,c_fill,g_auto,w_600,h_400`.
- Ampliación: `f_auto,q_auto,c_limit,w_1920`.

Los videos usarán una URL optimizada para reproducción compatible con el componente actual. El póster se generará desde el primer cuadro mediante una transformación de Cloudinary con dimensiones de miniatura.

La generación conservará la versión del recurso cuando Cloudinary la entregue. Esto evita mostrar una versión anterior desde caché después de reemplazar un archivo.

Los recursos con tipos de entrega privados o autenticados no pueden mostrarse mediante URLs públicas. El sincronizador los omitirá y mostrará una advertencia identificada por `assetId`, sin exponer información sensible.

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

El comando construirá y validará el documento en memoria. Luego escribirá un archivo temporal junto al destino y lo renombrará sobre el manifiesto anterior. Un error previo al reemplazo dejará intacta la última versión válida.

Una carpeta podrá admitir un estado vacío intencional mediante `allowEmpty: true` en su entrada de configuración. Esta opción evita agregar una bandera de línea de comandos y deja la decisión versionada.

## Pruebas

Las pruebas usarán `node:test` y respuestas simuladas, sin instalar otra dependencia ni consumir la Admin API.

Cubrirán:

- Mapeo exacto, herencia y prioridad de subcarpetas.
- Clasificación de imágenes, videos y recursos omitidos.
- Paginación con `next_cursor`.
- Detección de cursores repetidos.
- Prioridad de `context`, `display_name` y nombre de archivo.
- Preservación de UTF-8.
- URLs de miniatura, ampliación, reproducción y póster.
- Orden por fecha e identificador.
- Eliminación de duplicados.
- Rechazo de fuentes vacías.
- Escritura sin cambios cuando el manifiesto coincide.
- Conservación del manifiesto anterior ante un error.

La verificación del repositorio ejecutará:

```bash
npm run test:cloudinary
npm run check
npm run build
npm run test:smoke
```

Una comprobación manual ejecutará `npm run sync:cloudinary` con la key restringida y revisará el resumen antes de aceptar el manifiesto.

## Criterios de aceptación

- Una ejecución válida incorpora todos los recursos públicos de `stand`, `cajas` y sus subcarpetas.
- La Galería muestra las imágenes en las categorías aprobadas.
- Videos muestra los videos con título, póster y reproducción.
- Agregar o quitar un archivo en una carpeta configurada se refleja después de ejecutar la sincronización.
- El sitio compila sin credenciales cuando ya existe un manifiesto válido.
- El navegador y el build generado no contienen el API secret.
- El script no envía solicitudes de escritura a Cloudinary.
- `brands` conserva el manejo manual actual.
- Las verificaciones del repositorio finalizan sin errores.

## Referencias

- [Cloudinary Admin API](https://cloudinary.com/documentation/admin_api)
- [Listado de assets](https://cloudinary.com/documentation/list_assets)
- [Roles y permisos](https://cloudinary.com/documentation/dam_permissions_migration)
