import assert from "node:assert/strict";
import test from "node:test";

import { createCloudinaryAdminClient } from "./cloudinary-admin.mjs";

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

const credentials = {
  cloudName: "demo",
  apiKey: "viewer-key",
  apiSecret: "viewer-secret",
};

test("searchResources uses only POST /resources/search with a fixed JSON contract", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return jsonResponse({
      resources: [{ asset_id: "asset-1" }],
    });
  };
  const client = createCloudinaryAdminClient({
    ...credentials,
    fetchImpl,
  });

  const resources = await client.searchResources({
    expression: "status=active",
  });

  assert.deepEqual(resources, [{ asset_id: "asset-1" }]);
  assert.deepEqual(Object.keys(client).sort(), [
    "getFolderMode",
    "searchResources",
  ]);
  assert.equal(
    calls[0].url,
    "https://api.cloudinary.com/v1_1/demo/resources/search",
  );
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers.Accept, "application/json");
  assert.equal(calls[0].init.headers["Content-Type"], "application/json");
  assert.equal(
    calls[0].init.headers.Authorization,
    `Basic ${Buffer.from("viewer-key:viewer-secret").toString("base64")}`,
  );
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    expression: "status=active",
    with_field: ["context"],
    max_results: 500,
    sort_by: [{ created_at: "desc" }],
  });
});

test("searchResources preserves the search body and only adds next_cursor", async () => {
  const bodies = [];
  const fetchImpl = async (_url, init) => {
    const body = JSON.parse(init.body);
    bodies.push(body);

    if (bodies.length === 1) {
      return jsonResponse({
        resources: [{ asset_id: "first" }],
        next_cursor: "cursor-2",
      });
    }

    return jsonResponse({
      resources: [{ asset_id: "second" }],
    });
  };
  const client = createCloudinaryAdminClient({
    ...credentials,
    fetchImpl,
  });

  const resources = await client.searchResources({
    expression: "folder=stand",
  });

  assert.deepEqual(
    resources.map(({ asset_id: assetId }) => assetId),
    ["first", "second"],
  );
  assert.deepEqual(bodies[1], {
    ...bodies[0],
    next_cursor: "cursor-2",
  });
});

test("searchResources rejects repeated cursors", async () => {
  let calls = 0;
  const client = createCloudinaryAdminClient({
    ...credentials,
    fetchImpl: async () => {
      calls += 1;
      return jsonResponse({
        resources: [],
        next_cursor: "same-cursor",
      });
    },
  });

  await assert.rejects(
    () => client.searchResources({ expression: "status=active" }),
    /cursor repetido/,
  );
  assert.equal(calls, 2);
});

test("searchResources rejects malformed successful responses", async () => {
  const invalidJsonClient = createCloudinaryAdminClient({
    ...credentials,
    fetchImpl: async () =>
      new Response("not-json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  await assert.rejects(
    () => invalidJsonClient.searchResources({ expression: "status=active" }),
    /JSON inválido/,
  );

  const invalidShapeClient = createCloudinaryAdminClient({
    ...credentials,
    fetchImpl: async () => jsonResponse({ resources: null }),
  });
  await assert.rejects(
    () => invalidShapeClient.searchResources({ expression: "status=active" }),
    /lista de recursos inválida/,
  );
});

test("searchResources reports HTTP errors without exposing the API secret", async () => {
  for (const status of [401, 403, 429, 500]) {
    const client = createCloudinaryAdminClient({
      ...credentials,
      fetchImpl: async () =>
        jsonResponse(
          {
            error: {
              message: `Access denied for ${credentials.apiSecret}`,
            },
          },
          { status },
        ),
    });

    await assert.rejects(
      () => client.searchResources({ expression: "status=active" }),
      (error) => {
        assert.match(error.message, new RegExp(`HTTP ${status}`));
        assert.match(error.message, /Access denied/);
        assert.equal(error.message.includes(credentials.apiSecret), false);
        return true;
      },
    );
  }
});

test("searchResources redacts the secret from network errors", async () => {
  const client = createCloudinaryAdminClient({
    ...credentials,
    fetchImpl: async () => {
      throw new Error(`socket failed ${credentials.apiSecret}`);
    },
  });

  await assert.rejects(
    () => client.searchResources({ expression: "status=active" }),
    (error) => {
      assert.match(error.message, /socket failed/);
      assert.equal(error.message.includes(credentials.apiSecret), false);
      return true;
    },
  );
});

test("getFolderMode is an optional GET to config settings", async () => {
  const calls = [];
  const client = createCloudinaryAdminClient({
    ...credentials,
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return jsonResponse({
        settings: {
          folder_mode: "fixed",
        },
      });
    },
  });

  assert.equal(await client.getFolderMode(), "fixed");
  assert.equal(
    calls[0].url,
    "https://api.cloudinary.com/v1_1/demo/config?settings=true",
  );
  assert.equal(calls[0].init.method, "GET");
  assert.equal("body" in calls[0].init, false);
});

test("searchResources stops after the preventive page limit", async () => {
  let calls = 0;
  const client = createCloudinaryAdminClient({
    ...credentials,
    fetchImpl: async () => {
      calls += 1;
      return jsonResponse({
        resources: [],
        next_cursor: `cursor-${calls}`,
      });
    },
  });

  await assert.rejects(
    () => client.searchResources({ expression: "status=active" }),
    /límite preventivo de 1000 páginas/,
  );
  assert.equal(calls, 1_000);
});

test("getFolderMode rejects an unknown config value", async () => {
  const client = createCloudinaryAdminClient({
    ...credentials,
    fetchImpl: async () =>
      jsonResponse({
        settings: {
          folder_mode: "legacy",
        },
      }),
  });

  await assert.rejects(() => client.getFolderMode(), /folder_mode inválido/);
});

test("client validates credentials and search expressions before calling fetch", async () => {
  assert.throws(
    () =>
      createCloudinaryAdminClient({
        ...credentials,
        apiSecret: "",
        fetchImpl: async () => jsonResponse({ resources: [] }),
      }),
    /apiSecret es obligatorio/,
  );

  const client = createCloudinaryAdminClient({
    ...credentials,
    fetchImpl: async () => {
      throw new Error("fetch should not run");
    },
  });
  await assert.rejects(
    () => client.searchResources({ expression: "" }),
    /expression es obligatoria/,
  );
});
