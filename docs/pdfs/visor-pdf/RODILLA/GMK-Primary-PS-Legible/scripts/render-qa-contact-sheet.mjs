import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const thumbnails = [];

for (let page = 1; page <= 6; page += 1) {
  const pageNumber = String(page).padStart(2, "0");
  const inputPath = path.join(projectRoot, "output", `gmk-primary-ps-${pageNumber}.webp`);
  thumbnails.push(await sharp(inputPath).resize(260, 368, { fit: "fill" }).png().toBuffer());
}

const composite = thumbnails.map((input, index) => ({
  input,
  left: 44 + (index % 4) * 284,
  top: 32 + Math.floor(index / 4) * 400,
}));

const outputPath = path.join(projectRoot, "qa", "gmk-primary-ps-contact.webp");

await sharp({
  create: {
    width: 1200,
    height: 800,
    channels: 3,
    background: "#dce5f2",
  },
})
  .composite(composite)
  .webp({ quality: 90 })
  .toFile(outputPath);

console.log(outputPath);
