import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

let headerShrinkModule;
try {
  headerShrinkModule = await import("../src/scripts/header-shrink.mjs");
} catch {
  headerShrinkModule = {};
}

test("interpolates the desktop header continuously across the first 140 scroll pixels", () => {
  assert.equal(
    typeof headerShrinkModule.computeHeaderVisualState,
    "function",
    "computeHeaderVisualState should expose the progressive header contract",
  );

  const input = {
    isHome: true,
    reducedMotion: false,
    rootFontSize: 16,
    viewportHeight: 1000,
    viewportWidth: 1440,
  };
  const top = headerShrinkModule.computeHeaderVisualState({ ...input, scrollY: 0 });
  const middle = headerShrinkModule.computeHeaderVisualState({ ...input, scrollY: 70 });
  const collapsed = headerShrinkModule.computeHeaderVisualState({
    ...input,
    scrollY: 140,
  });

  assert.deepEqual(
    {
      headerHeight: top.headerHeight,
      logoSize: top.logoSize,
      shrink: top.shrink,
    },
    { headerHeight: 150, logoSize: 100, shrink: 0 },
  );
  assert.deepEqual(
    {
      headerHeight: middle.headerHeight,
      logoSize: middle.logoSize,
      shrink: middle.shrink,
    },
    { headerHeight: 111, logoSize: 72, shrink: 0.5 },
  );
  assert.deepEqual(
    {
      headerHeight: collapsed.headerHeight,
      logoSize: collapsed.logoSize,
      shrink: collapsed.shrink,
    },
    { headerHeight: 72, logoSize: 44, shrink: 1 },
  );
});

test("snaps between expanded and collapsed states when reduced motion is enabled", () => {
  const input = {
    isHome: true,
    reducedMotion: true,
    rootFontSize: 16,
    viewportHeight: 1000,
    viewportWidth: 1440,
  };

  assert.equal(
    headerShrinkModule.computeHeaderVisualState({ ...input, scrollY: 59 }).shrink,
    0,
  );
  assert.equal(
    headerShrinkModule.computeHeaderVisualState({ ...input, scrollY: 60 }).shrink,
    1,
  );
});

test("uses the compact expanded dimensions below the desktop breakpoint", () => {
  const top = headerShrinkModule.computeHeaderVisualState({
    isHome: true,
    reducedMotion: false,
    rootFontSize: 16,
    scrollY: 0,
    viewportHeight: 844,
    viewportWidth: 390,
  });

  assert.deepEqual(
    {
      headerHeight: top.headerHeight,
      logoSize: top.logoSize,
      subtitleSize: top.subtitleSize,
      titleSize: top.titleSize,
    },
    {
      headerHeight: 88,
      logoSize: 52,
      subtitleSize: 10.88,
      titleSize: 19.2,
    },
  );
});

test("interpolates the header atmosphere together with its dimensions", () => {
  const middle = headerShrinkModule.computeHeaderVisualState({
    isHome: true,
    reducedMotion: false,
    rootFontSize: 16,
    scrollY: 70,
    viewportHeight: 1000,
    viewportWidth: 1440,
  });

  assert.deepEqual(
    {
      backgroundAlpha: middle.backgroundAlpha,
      blur: middle.blur,
      borderAlpha: middle.borderAlpha,
      logoGlowAlpha: middle.logoGlowAlpha,
      logoGlowSize: middle.logoGlowSize,
      shadowAlpha: middle.shadowAlpha,
      subtitleSize: middle.subtitleSize,
      titleSize: middle.titleSize,
    },
    {
      backgroundAlpha: 0.47,
      blur: 9,
      borderAlpha: 0.09,
      logoGlowAlpha: 0.525,
      logoGlowSize: 10,
      shadowAlpha: 0.375,
      subtitleSize: 12.7,
      titleSize: 23.4,
    },
  );
});

test("wires the computed state through valid CSS variables without collapsing the open menu", async () => {
  const headerSource = await readFile(
    new URL("../src/components/Header.astro", import.meta.url),
    "utf8",
  );
  const globalCss = await readFile(
    new URL("../src/styles/global.css", import.meta.url),
    "utf8",
  );

  assert.match(
    headerSource,
    /import\s*{\s*computeHeaderVisualState\s*}\s*from\s*"\.\.\/scripts\/header-shrink\.mjs"/,
  );
  assert.match(headerSource, /const visualState = computeHeaderVisualState\(/);
  assert.match(
    headerSource,
    /header\.style\.setProperty\("--header-height",\s*`\$\{visualState\.headerHeight\}px`\)/,
  );
  assert.doesNotMatch(headerSource, /if\s*\(isHomeHeader\s*&&\s*!menuOpen\)/);
  assert.match(
    globalCss,
    /\.site-header-inner\s*{[\s\S]*height:\s*var\(--header-height\)/,
  );
  assert.doesNotMatch(globalCss, /calc\([^;]*\*/);
  assert.equal(
    (globalCss.match(/{/g) ?? []).length,
    (globalCss.match(/}/g) ?? []).length,
    "global.css should keep balanced rule braces",
  );
});
