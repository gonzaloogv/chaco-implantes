import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { preview } from "astro";
import { chromium } from "playwright";

const root = fileURLToPath(new URL("../", import.meta.url));
const server = await preview({
  root,
  logLevel: "silent",
  server: {
    host: "127.0.0.1",
    port: 0,
  },
});

const browser = await chromium.launch();
const baseUrl = `http://127.0.0.1:${server.port}`;

const cases = [
  {
    name: "desktop",
    viewport: { width: 1440, height: 1000 },
    columns: { products: 3, suppliers: 4, media: 2 },
    equalRenderedHeight: true,
    sectionMinHeight: "576px",
  },
  {
    name: "tablet",
    viewport: { width: 768, height: 900 },
    columns: { products: 2, suppliers: 2, media: 2 },
    equalRenderedHeight: true,
    sectionMinHeight: "512px",
  },
  {
    name: "mobile",
    viewport: { width: 390, height: 844 },
    columns: { products: 1, suppliers: 2, media: 1 },
    equalRenderedHeight: false,
    sectionMinHeight: "480px",
  },
  {
    name: "minimum",
    viewport: { width: 320, height: 720 },
    columns: { products: 1, suppliers: 1, media: 1 },
    equalRenderedHeight: false,
    sectionMinHeight: "480px",
  },
];

function assertSameBandGeometry(metrics, name, equalRenderedHeight) {
  assert.equal(metrics.length, 3, `${name}: expected three accent bands`);
  const [first, ...rest] = metrics;

  for (const metric of rest) {
    assert.deepEqual(
      {
        width: metric.width,
        minHeight: metric.minHeight,
        padding: metric.padding,
        radius: metric.radius,
        backgroundImage: metric.backgroundImage,
        backgroundColor: metric.backgroundColor,
      },
      {
        width: first.width,
        minHeight: first.minHeight,
        padding: first.padding,
        radius: first.radius,
        backgroundImage: first.backgroundImage,
        backgroundColor: first.backgroundColor,
      },
      `${name}: accent bands should share computed geometry`,
    );

    if (equalRenderedHeight) {
      assert.equal(
        metric.height,
        first.height,
        `${name}: accent bands should share rendered height`,
      );
    }
  }
}

try {
  for (const testCase of cases) {
    const context = await browser.newContext({
      viewport: testCase.viewport,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.waitForFunction(() => {
      const header = document.querySelector("[data-site-header]");
      return (
        header instanceof HTMLElement &&
        header.style.getPropertyValue("--header-height") !== ""
      );
    });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    const overflowSources =
      overflow > 0
        ? await page.evaluate(() =>
            Array.from(document.querySelectorAll("body *"))
              .map((element) => {
                const rect = element.getBoundingClientRect();
                return {
                  element:
                    element instanceof HTMLElement
                      ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.className ? `.${String(element.className).trim().replace(/\s+/g, ".")}` : ""}`
                      : element.tagName.toLowerCase(),
                  left: Math.round(rect.left * 10) / 10,
                  right: Math.round(rect.right * 10) / 10,
                  width: Math.round(rect.width * 10) / 10,
                };
              })
              .filter(
                ({ left, right }) =>
                  left < -0.5 || right > window.innerWidth + 0.5,
              )
              .slice(0, 8),
          )
        : [];
    assert.ok(
      overflow <= 0,
      `${testCase.name}: horizontal overflow is ${overflow}px; sources: ${JSON.stringify(overflowSources)}`,
    );

    const metrics = await page
      .locator("[data-home-accent-band]")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            width: Math.round(rect.width * 10) / 10,
            height: Math.round(rect.height * 10) / 10,
            minHeight: style.minHeight,
            padding: style.padding,
            radius: style.borderRadius,
            backgroundImage: style.backgroundImage,
            backgroundColor: style.backgroundColor,
          };
        }),
      );
    assertSameBandGeometry(
      metrics,
      testCase.name,
      testCase.equalRenderedHeight,
    );

    const sectionMinHeights = await page
      .locator(
        [
          '[data-home-section="products"]',
          '[data-home-section="suppliers"]',
          '[data-home-section="congresses"]',
          '[data-home-section="multimedia"]',
        ].join(","),
      )
      .evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).minHeight),
      );
    assert.deepEqual(
      sectionMinHeights,
      Array(4).fill(testCase.sectionMinHeight),
      `${testCase.name}: clear sections should share one minimum height`,
    );

    for (const [section, expected] of Object.entries(testCase.columns)) {
      const actual = await page
        .locator(`.home-${section}-grid`)
        .evaluate((element) => {
          const columns = getComputedStyle(element).gridTemplateColumns;
          return columns.split(" ").filter(Boolean).length;
        });
      assert.equal(
        actual,
        expected,
        `${testCase.name}: ${section} grid column count`,
      );
    }

    const header = page.locator("[data-site-header]");
    const expandedHeight = await header.evaluate(
      (element) => element.getBoundingClientRect().height,
    );
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForFunction(
      (initialHeight) => {
        const element = document.querySelector("[data-site-header]");
        return (
          element instanceof HTMLElement &&
          window.scrollY >= 100 &&
          element.getBoundingClientRect().height < initialHeight - 1
        );
      },
      expandedHeight,
    );
    const collapsedHeight = await header.evaluate(
      (element) => element.getBoundingClientRect().height,
    );
    assert.ok(
      collapsedHeight < expandedHeight,
      `${testCase.name}: header should shrink after scrolling (${expandedHeight}px → ${collapsedHeight}px)`,
    );

    await context.close();
  }

  const reducedContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const transitionDuration = await reducedPage
    .locator("[data-hero-slide]")
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  const transitionMilliseconds = transitionDuration
    .split(",")
    .map((value) => value.trim())
    .map((value) =>
      value.endsWith("ms")
        ? Number.parseFloat(value)
        : Number.parseFloat(value) * 1000,
    );
  assert.ok(
    transitionMilliseconds.every((value) => value <= 0.01),
    `reduced motion transition should be <= 0.01ms, got ${transitionDuration}`,
  );
  await reducedContext.close();

  console.log("Home layout verification passed.");
} finally {
  await browser.close();
  await server.stop();
}
