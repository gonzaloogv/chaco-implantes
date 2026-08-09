import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/pages/videos.astro", import.meta.url),
  "utf8",
);

test("renders synchronized video titles without presentation numbering", () => {
  assert.doesNotMatch(source, /Caja de instrumental N\.º/);
  assert.doesNotMatch(source, /GENERIC_VIDEO_TITLE|displayTitle/);
  assert.match(source, /title=\{video\.title\}/);
  assert.match(
    source,
    /<h3>\{video\.title\}<\/h3>/,
  );
});
