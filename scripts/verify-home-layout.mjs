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
  },
  {
    name: "laptop",
    viewport: { width: 1280, height: 800 },
  },
  {
    name: "tablet",
    viewport: { width: 768, height: 900 },
  },
  {
    name: "mobile",
    viewport: { width: 390, height: 844 },
  },
  {
    name: "minimum",
    viewport: { width: 320, height: 720 },
  },
];

async function findOverflowSources(page) {
  return page.evaluate(() =>
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
        ({ left, right }) => left < -0.5 || right > window.innerWidth + 0.5,
      )
      .slice(0, 8),
  );
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
    const overflowSources = overflow > 0 ? await findOverflowSources(page) : [];
    assert.ok(
      overflow <= 0,
      `${testCase.name}: horizontal overflow is ${overflow}px; sources: ${JSON.stringify(overflowSources)}`,
    );

    const clippedSections = await page
      .locator('[data-home-section]:not([data-home-section="hero"])')
      .evaluateAll((elements) =>
        elements
          .map((element) => ({
            section: element.getAttribute("data-home-section"),
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
          }))
          .filter(({ clientWidth, scrollWidth }) => scrollWidth > clientWidth + 1),
      );
    assert.deepEqual(
      clippedSections,
      [],
      `${testCase.name}: sections must not hide clipped horizontal content`,
    );

    const productCount = await page.locator("[data-catalog-card]").count();
    assert.equal(productCount, 6, `${testCase.name}: six product categories`);

    const supplierCount = await page
      .locator("[data-home-supplier-mark]")
      .count();
    assert.equal(supplierCount, 4, `${testCase.name}: four supplier marks`);

    const supportStepCount = await page
      .locator("[data-home-support-step]")
      .count();
    assert.equal(supportStepCount, 4, `${testCase.name}: four support steps`);

    const heroBox = await page.locator('[data-home-section="hero"]').boundingBox();
    const trustBox = await page.locator("[data-home-trust-strip]").boundingBox();
    assert.ok(heroBox && trustBox, `${testCase.name}: hero and trust strip render`);
    const heroBottom = heroBox.y + heroBox.height;
    assert.ok(
      trustBox.y < heroBottom && trustBox.y + trustBox.height > heroBottom,
      `${testCase.name}: trust strip bridges hero and body`,
    );

    const featuredBox = await page
      .locator("[data-home-product-featured]")
      .boundingBox();
    const secondaryBox = await page
      .locator("[data-home-product-secondary]")
      .first()
      .boundingBox();
    assert.ok(
      featuredBox && secondaryBox,
      `${testCase.name}: product hierarchy renders`,
    );

    if (testCase.viewport.width >= 1024) {
      assert.ok(
        featuredBox.width > secondaryBox.width,
        `${testCase.name}: featured product is wider than secondary products`,
      );
    }

    if (testCase.viewport.width <= 390) {
      assert.ok(
        Math.abs(featuredBox.width - secondaryBox.width) <= 1,
        `${testCase.name}: product cards share the mobile width`,
      );
    }

    const mediaCards = page.locator("[data-home-media-layout] > a");
    const mediaCardCount = await mediaCards.count();
    const hasVideoCard =
      (await page.locator('[data-home-media-card="videos"]').count()) === 1;
    assert.equal(
      mediaCardCount,
      hasVideoCard ? 2 : 1,
      `${testCase.name}: media layout reflects published content`,
    );

    if (hasVideoCard && testCase.viewport.width >= 1024) {
      const galleryBox = await mediaCards.nth(0).boundingBox();
      const videoBox = await mediaCards.nth(1).boundingBox();
      assert.ok(
        galleryBox && videoBox && galleryBox.width > videoBox.width,
        `${testCase.name}: gallery is wider than video`,
      );
    }

    const ctaBox = await page.locator("[data-home-final-cta]").boundingBox();
    const footerBox = await page.locator("[data-site-footer]").boundingBox();
    assert.ok(ctaBox && footerBox, `${testCase.name}: CTA and footer render`);
    assert.ok(
      ctaBox.y + ctaBox.height <= footerBox.y,
      `${testCase.name}: CTA does not overlap footer`,
    );

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
      `${testCase.name}: header shrinks after scrolling (${expandedHeight}px → ${collapsedHeight}px)`,
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

  console.log("Home editorial layout verification passed.");
} finally {
  await browser.close();
  await server.stop();
}
