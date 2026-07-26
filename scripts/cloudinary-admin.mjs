const SEARCH_PATH = "/resources/search";
const CONFIG_PATH = "/config?settings=true";
const MAX_SEARCH_PAGES = 1_000;

function requireCredential(value, name) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} es obligatorio.`);
  }

  return value.trim();
}

function redactSecret(message, apiSecret) {
  return String(message).split(apiSecret).join("[REDACTED]");
}

async function parseJsonResponse(response, apiSecret) {
  try {
    return await response.json();
  } catch {
    throw new Error(
      redactSecret(
        `Cloudinary devolvió JSON inválido (HTTP ${response.status}).`,
        apiSecret,
      ),
    );
  }
}

function cloudinaryErrorMessage(payload) {
  if (
    payload?.error &&
    typeof payload.error === "object" &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  if (typeof payload?.error === "string") {
    return payload.error;
  }

  return "Cloudinary rechazó la solicitud.";
}

export function createCloudinaryAdminClient({
  cloudName,
  apiKey,
  apiSecret,
  fetchImpl = globalThis.fetch,
}) {
  const safeCloudName = requireCredential(cloudName, "cloudName");
  const safeApiKey = requireCredential(apiKey, "apiKey");
  const safeApiSecret = requireCredential(apiSecret, "apiSecret");

  if (typeof fetchImpl !== "function") {
    throw new Error("fetchImpl debe ser una función.");
  }

  const baseUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(safeCloudName)}`;
  const authorization = `Basic ${Buffer.from(
    `${safeApiKey}:${safeApiSecret}`,
  ).toString("base64")}`;

  async function request(path, { method, body } = {}) {
    const headers = {
      Accept: "application/json",
      Authorization: authorization,
    };
    const init = {
      method,
      headers,
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    let response;
    try {
      response = await fetchImpl(`${baseUrl}${path}`, init);
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "error de red desconocido";
      throw new Error(
        `No se pudo consultar Cloudinary: ${redactSecret(detail, safeApiSecret)}.`,
      );
    }

    const payload = await parseJsonResponse(response, safeApiSecret);
    if (!response.ok) {
      const detail = redactSecret(
        cloudinaryErrorMessage(payload),
        safeApiSecret,
      );
      throw new Error(`Cloudinary respondió HTTP ${response.status}: ${detail}`);
    }

    return payload;
  }

  async function searchResources({ expression }) {
    if (typeof expression !== "string" || expression.trim().length === 0) {
      throw new Error("expression es obligatoria.");
    }

    const baseBody = {
      expression: expression.trim(),
      with_field: ["context"],
      max_results: 500,
      sort_by: [{ created_at: "desc" }],
    };
    const resources = [];
    const seenCursors = new Set();
    let nextCursor;

    for (let page = 1; page <= MAX_SEARCH_PAGES; page += 1) {
      const body =
        nextCursor === undefined
          ? baseBody
          : { ...baseBody, next_cursor: nextCursor };
      const payload = await request(SEARCH_PATH, {
        method: "POST",
        body,
      });

      if (!Array.isArray(payload?.resources)) {
        throw new Error(
          "Cloudinary devolvió una lista de recursos inválida.",
        );
      }
      resources.push(...payload.resources);

      if (payload.next_cursor === undefined || payload.next_cursor === null) {
        return resources;
      }
      if (
        typeof payload.next_cursor !== "string" ||
        payload.next_cursor.length === 0
      ) {
        throw new Error("Cloudinary devolvió un next_cursor inválido.");
      }
      if (seenCursors.has(payload.next_cursor)) {
        throw new Error(
          `Cloudinary devolvió un cursor repetido: ${payload.next_cursor}.`,
        );
      }

      seenCursors.add(payload.next_cursor);
      nextCursor = payload.next_cursor;
    }

    throw new Error(
      `La búsqueda superó el límite preventivo de ${MAX_SEARCH_PAGES} páginas.`,
    );
  }

  async function getFolderMode() {
    const payload = await request(CONFIG_PATH, { method: "GET" });
    const folderMode = payload?.settings?.folder_mode;

    if (folderMode !== "dynamic" && folderMode !== "fixed") {
      throw new Error("Cloudinary devolvió un folder_mode inválido.");
    }

    return folderMode;
  }

  return {
    searchResources,
    getFolderMode,
  };
}
