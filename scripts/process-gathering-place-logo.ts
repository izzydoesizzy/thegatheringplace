#!/usr/bin/env tsx
/**
 * Remove background from Gathering Place logos and vectorize to SVG.
 *
 * The logos were AI-generated as gold marks on deep charcoal (#0c0a08).
 * This script:
 *   1. Strips the dark background → transparent PNG
 *   2. Traces the mark → clean SVG with gold fill (#c4922a)
 *
 * Usage:
 *   ./node_modules/.bin/tsx scripts/process-gathering-place-logo.ts
 *     → processes 02-the-hearthstone.png (default)
 *
 *   ./node_modules/.bin/tsx scripts/process-gathering-place-logo.ts --all
 *     → processes all 6 logos in favourites/
 *
 *   ./node_modules/.bin/tsx scripts/process-gathering-place-logo.ts --logo 11-the-embrace.png
 *     → processes a specific logo
 *
 * Output: content/brand/gathering-place/logos/processed/
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const FAVOURITES_DIR = path.join(rootDir, "content/brand/gathering-place/logos/favourites");
const OUTPUT_DIR = path.join(rootDir, "content/brand/gathering-place/logos/processed");

const GOLD = "#c4922a";

// Luminance thresholds:
//   Background charcoal (#0c0a08) ≈ luminance 10
//   Gold foreground (#c4922a)     ≈ luminance 143
//   50% blended edge pixel        ≈ luminance 80
// Pixels < TRANSPARENT_BELOW become fully transparent.
// Pixels in between get a smooth alpha blend (handles anti-aliased edges).
// Pixels > OPAQUE_ABOVE stay fully opaque.
// Higher values here = more aggressive background removal (less JPEG noise bleeding through).
const TRANSPARENT_BELOW = 55;
const OPAQUE_ABOVE = 100;

// ─── Step 1: Background removal → transparent PNG ─────────────────────────────

async function removeBackground(inputPath: string, outputPath: string): Promise<void> {
  const sharp = (await import("sharp")).default;

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  if (channels !== 4) throw new Error(`Expected 4 channels, got ${channels}`);

  const buf = Buffer.from(data);

  for (let i = 0; i < buf.length; i += 4) {
    const lum = 0.299 * buf[i] + 0.587 * buf[i + 1] + 0.114 * buf[i + 2];
    if (lum <= TRANSPARENT_BELOW) {
      buf[i + 3] = 0;
    } else if (lum < OPAQUE_ABOVE) {
      const t = (lum - TRANSPARENT_BELOW) / (OPAQUE_ABOVE - TRANSPARENT_BELOW);
      buf[i + 3] = Math.round(t * 255);
    }
    // else: leave alpha = 255 (fully opaque)
  }

  // Compute exact bounding box from alpha channel.
  // Use alpha > 50 so faint JPEG-noise semi-transparent pixels don't bloat the crop region.
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = buf[(y * width + x) * 4 + 3];
      if (alpha > 50) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Add a small padding so anti-aliased edges aren't clipped
  const PAD = 4;
  minX = Math.max(0, minX - PAD);
  minY = Math.max(0, minY - PAD);
  maxX = Math.min(width - 1, maxX + PAD);
  maxY = Math.min(height - 1, maxY + PAD);

  await sharp(buf, { raw: { width, height, channels: 4 } })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

// ─── Step 2: Vectorize → SVG ──────────────────────────────────────────────────
//
// Pipeline: transparent PNG → flatten to white bg → grayscale → threshold(200)
//
// After flatten(white): gold mark ≈ lum 143, background = 255 (white)
// After grayscale:       gold ≈ gray 143, background = gray 255
// After threshold(200):  143 < 200 → black (0), 255 > 200 → white (255)
// Result:                black mark on white background — exactly what potrace needs.

async function vectorize(transparentPngPath: string, svgPath: string): Promise<void> {
  const sharp = (await import("sharp")).default;
  const potrace = await import("potrace");

  const bitmapBuffer = await sharp(transparentPngPath)
    .flatten({ background: "#ffffff" })
    .grayscale()
    .threshold(200)
    .toBuffer();

  const meta = await sharp(bitmapBuffer).metadata();
  const width = meta.width ?? 512;
  const height = meta.height ?? 512;

  await new Promise<void>((resolve, reject) => {
    potrace.trace(
      bitmapBuffer,
      {
        color: GOLD,
        background: "transparent",
        optTolerance: 0.4,
        turdSize: 2,
        alphaMax: 1,
        optCurve: true,
      },
      (err: Error | null, svg: string) => {
        if (err) return reject(err);

        // Ensure viewBox is present
        let processed = svg;
        if (!processed.includes("viewBox")) {
          processed = processed.replace(/<svg /, `<svg viewBox="0 0 ${width} ${height}" `);
        }

        // Remove any background rect potrace may have added (we want transparent)
        processed = processed.replace(/<rect[^>]+fill="[^"]*"[^>]*\/>/g, "");

        fs.writeFileSync(svgPath, processed, "utf-8");
        resolve();
      }
    );
  });
}

// ─── Per-logo processor ───────────────────────────────────────────────────────

async function processLogo(filename: string): Promise<void> {
  const inputPath = path.join(FAVOURITES_DIR, filename);
  if (!fs.existsSync(inputPath)) {
    console.error(`  ✗ Not found: ${filename}`);
    return;
  }

  const baseName = path.basename(filename, path.extname(filename));
  const transparentPngPath = path.join(OUTPUT_DIR, `${baseName}-transparent.png`);
  const svgPath = path.join(OUTPUT_DIR, `${baseName}.svg`);

  console.log(`  ${baseName}`);

  process.stdout.write(`    → removing background...`);
  await removeBackground(inputPath, transparentPngPath);
  console.log(` ✓  ${path.basename(transparentPngPath)}`);

  process.stdout.write(`    → vectorizing...`);
  await vectorize(transparentPngPath, svgPath);
  console.log(` ✓  ${path.basename(svgPath)}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const allFlag = args.includes("--all");
  const logoIndex = args.indexOf("--logo");
  const specificLogo = logoIndex !== -1 ? args[logoIndex + 1] : null;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let logos: string[];
  if (allFlag) {
    logos = fs.readdirSync(FAVOURITES_DIR).filter((f) => /\.(png|jpg|jpeg)$/i.test(f)).sort();
  } else if (specificLogo) {
    logos = [specificLogo];
  } else {
    logos = ["02-the-hearthstone.png"];
  }

  console.log(`\nProcessing ${logos.length} logo${logos.length === 1 ? "" : "s"}...`);
  console.log(`Input:  content/brand/gathering-place/logos/favourites/`);
  console.log(`Output: content/brand/gathering-place/logos/processed/\n`);

  for (const logo of logos) {
    await processLogo(logo);
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`Done. Open: content/brand/gathering-place/logos/processed/`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
