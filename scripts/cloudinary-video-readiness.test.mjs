import assert from "node:assert/strict";
import test from "node:test";

import { ensureVideoSourcesReady } from "./cloudinary-video-readiness.mjs";

const video = {
  assetId: "video-asset",
  src: "https://res.cloudinary.com/demo/video/upload/video-asset.mp4",
};

function createResponse(status, { detail, onCancel } = {}) {
  return {
    status,
    headers: new Headers(
      detail === undefined ? undefined : { "X-Cld-Error": detail },
    ),
    body:
      onCancel === undefined
        ? null
        : {
            async cancel() {
              onCancel();
            },
          },
  };
}

for (const status of [200, 206]) {
  test(`ensureVideoSourcesReady accepts HTTP ${status}`, async () => {
    const requests = [];
    let cancellations = 0;

    await ensureVideoSourcesReady([video], {
      async fetchImpl(url, options) {
        requests.push({ url, options });
        return createResponse(status, {
          onCancel() {
            cancellations += 1;
          },
        });
      },
    });

    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, video.src);
    assert.equal(requests[0].options.method, "GET");
    assert.equal(
      new Headers(requests[0].options.headers).get("Range"),
      "bytes=0-0",
    );
    assert.ok(requests[0].options.signal instanceof AbortSignal);
    assert.equal(cancellations, 1);
  });
}

test("ensureVideoSourcesReady retries HTTP 423 after the configured delay", async () => {
  const statuses = [423, 206];
  const waits = [];
  let cancellations = 0;

  await ensureVideoSourcesReady([video], {
    async fetchImpl() {
      return createResponse(statuses.shift(), {
        onCancel() {
          cancellations += 1;
        },
      });
    },
    async sleep(milliseconds) {
      waits.push(milliseconds);
    },
    now: () => 0,
    retryDelayMs: 2_000,
  });

  assert.deepEqual(statuses, []);
  assert.deepEqual(waits, [2_000]);
  assert.equal(cancellations, 2);
});

test("ensureVideoSourcesReady reports unexpected HTTP status and Cloudinary detail", async () => {
  await assert.rejects(
    () =>
      ensureVideoSourcesReady([video], {
        fetchImpl: async () =>
          createResponse(500, {
            detail: "Derived resource generation failed",
          }),
      }),
    (error) => {
      assert.match(error.message, /video-asset/);
      assert.match(error.message, /HTTP 500/);
      assert.match(error.message, /Derived resource generation failed/);
      return true;
    },
  );
});

test("ensureVideoSourcesReady reports network errors with the assetId", async () => {
  await assert.rejects(
    () =>
      ensureVideoSourcesReady([video], {
        fetchImpl: async () => {
          throw new Error("socket closed");
        },
      }),
    (error) => {
      assert.match(error.message, /video-asset/);
      assert.match(error.message, /socket closed/);
      return true;
    },
  );
});

test("ensureVideoSourcesReady times out a video that remains locked", async () => {
  const timestamps = [100, 100, 111];
  let sleeps = 0;

  await assert.rejects(
    () =>
      ensureVideoSourcesReady([video], {
        fetchImpl: async () => createResponse(423),
        async sleep() {
          sleeps += 1;
        },
        now: () => timestamps.shift() ?? 111,
        timeoutMs: 10,
      }),
    (error) => {
      assert.match(error.message, /video-asset/);
      assert.match(error.message, /10 ms/);
      return true;
    },
  );
  assert.equal(sleeps, 0);
});

test("ensureVideoSourcesReady caps retry sleep at the remaining video deadline", async () => {
  let currentTime = 0;
  const waits = [];

  await assert.rejects(
    () =>
      ensureVideoSourcesReady([video], {
        fetchImpl: async () => createResponse(423),
        async sleep(milliseconds) {
          waits.push(milliseconds);
          currentTime += milliseconds;
        },
        now: () => currentTime,
        retryDelayMs: 2_000,
        timeoutMs: 10,
      }),
    (error) => {
      assert.match(error.message, /video-asset/);
      assert.match(error.message, /10 ms/);
      return true;
    },
  );

  assert.deepEqual(waits, [10]);
  assert.equal(currentTime, 10);
});

test("ensureVideoSourcesReady does not accept a ready response after the video deadline", async () => {
  const timestamps = [0, 0, 11];

  await assert.rejects(
    () =>
      ensureVideoSourcesReady([video], {
        fetchImpl: async () => createResponse(206),
        now: () => timestamps.shift() ?? 11,
        timeoutMs: 10,
      }),
    (error) => {
      assert.match(error.message, /video-asset/);
      assert.match(error.message, /10 ms/);
      return true;
    },
  );
});

test("ensureVideoSourcesReady caps a request at the remaining video deadline", async () => {
  let observedAbort = false;

  await assert.rejects(
    () =>
      ensureVideoSourcesReady([video], {
        timeoutMs: 20,
        requestTimeoutMs: 500,
        async fetchImpl(_url, { signal }) {
          await new Promise((_, reject) => {
            const onAbort = () => {
              observedAbort = true;
              clearTimeout(fallback);
              reject(signal.reason);
            };
            const fallback = setTimeout(() => {
              signal.removeEventListener("abort", onAbort);
              reject(new Error("video deadline signal did not abort"));
            }, 100);
            signal.addEventListener("abort", onAbort, { once: true });
          });
        },
      }),
    (error) => {
      assert.match(error.message, /video-asset/);
      assert.match(error.message, /20 ms/);
      return true;
    },
  );

  assert.equal(observedAbort, true);
});

test("ensureVideoSourcesReady applies a timeout signal to each request", async () => {
  let observedAbort = false;

  await assert.rejects(
    () =>
      ensureVideoSourcesReady([video], {
        requestTimeoutMs: 5,
        async fetchImpl(_url, { signal }) {
          await new Promise((_, reject) => {
            const fallback = setTimeout(
              () => reject(new Error("request signal did not abort")),
              100,
            );
            signal.addEventListener(
              "abort",
              () => {
                observedAbort = true;
                clearTimeout(fallback);
                reject(signal.reason);
              },
              { once: true },
            );
          });
        },
      }),
    /video-asset/,
  );

  assert.equal(observedAbort, true);
});

test("ensureVideoSourcesReady validates videos before making requests", async () => {
  let requests = 0;
  const options = {
    fetchImpl: async () => {
      requests += 1;
      return createResponse(206);
    },
  };

  await assert.rejects(
    () => ensureVideoSourcesReady(null, options),
    /videos debe ser un arreglo/,
  );

  for (const [videos, expectedMessage] of [
    [[{ src: video.src }], /videos\[0\]\.assetId es obligatorio/],
    [[{ assetId: "   ", src: video.src }], /assetId es obligatorio/],
    [[{ assetId: "invalid-src", src: "http://example.test/video.mp4" }], /src debe usar HTTPS/],
    [[{ assetId: "missing-src" }], /src debe usar HTTPS/],
  ]) {
    await assert.rejects(
      () => ensureVideoSourcesReady(videos, options),
      expectedMessage,
    );
  }

  assert.equal(requests, 0);
});

test("ensureVideoSourcesReady validates function overrides", async () => {
  for (const field of ["fetchImpl", "sleep", "now"]) {
    await assert.rejects(
      () => ensureVideoSourcesReady([], { [field]: null }),
      new RegExp(`${field} debe ser una función`),
    );
  }
});

test("ensureVideoSourcesReady validates positive integer options", async () => {
  for (const field of [
    "concurrency",
    "retryDelayMs",
    "timeoutMs",
    "requestTimeoutMs",
  ]) {
    for (const value of [0, -1, 1.5, "2"]) {
      await assert.rejects(
        () => ensureVideoSourcesReady([], { [field]: value }),
        new RegExp(`${field} debe ser un entero positivo`),
      );
    }
  }
});

test("ensureVideoSourcesReady bounds concurrent requests", async () => {
  const videos = Array.from({ length: 5 }, (_, index) => ({
    assetId: `video-${index}`,
    src: `https://example.test/video-${index}.mp4`,
  }));
  let releaseRequests;
  const requestGate = new Promise((resolve) => {
    releaseRequests = resolve;
  });
  let activeRequests = 0;
  let maximumActiveRequests = 0;
  let startedRequests = 0;

  const readiness = ensureVideoSourcesReady(videos, {
    concurrency: 2,
    async fetchImpl() {
      startedRequests += 1;
      activeRequests += 1;
      maximumActiveRequests = Math.max(
        maximumActiveRequests,
        activeRequests,
      );
      await requestGate;
      activeRequests -= 1;
      return createResponse(206);
    },
  });

  assert.equal(startedRequests, 2);
  assert.equal(maximumActiveRequests, 2);
  releaseRequests();
  await readiness;

  assert.equal(startedRequests, videos.length);
  assert.equal(maximumActiveRequests, 2);
});
