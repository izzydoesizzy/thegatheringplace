#!/usr/bin/env tsx
/**
 * Generate photorealistic 3D brand mockups for The Gathering Place.
 *
 * Uses Google Gemini 3 Pro (multimodal image generation) to produce
 * lifestyle/context shots of branded stationery items. Passes the actual
 * hearthstone logo as a reference image so the model renders it faithfully.
 *
 * Usage:
 *   ./node_modules/.bin/tsx scripts/generate-gathering-place-mockups.ts
 *
 * Output:
 *   content/brand/gathering-place/stationery/the-gathering-place-brand-mockups.pdf
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(rootDir, ".env.local") });

const LOGO_PATH = path.join(
  rootDir,
  "content/brand/gathering-place/logos/processed/hearthstone logo.png"
);
const OUTPUT_DIR = path.join(rootDir, "content/brand/gathering-place/stationery");
const OUTPUT_PDF = path.join(OUTPUT_DIR, "the-gathering-place-brand-mockups.pdf");
const MODEL = "gemini-3-pro-image-preview";

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const B = {
  gold: "#c4922a",
  charcoal: "#0c0a08",
  charcoalMid: "#1a1714",
  cream: "#f0ebe2",
  muted: "#9a8f82",
};

// ─── Mockup scenes ────────────────────────────────────────────────────────────

interface Scene {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
}

const SCENES: Scene[] = [
  {
    id: "01",
    title: "Business Card",
    subtitle: "In Hand",
    prompt:
      "Using this exact logo mark, generate a photorealistic premium brand mockup: " +
      "a matte dark charcoal black business card held between the thumbs and forefingers " +
      "of two hands, card perfectly centred in frame, the gold logo foil-stamped and " +
      "embossed in the centre of the card face, 'THE GATHERING PLACE' in small spaced " +
      "cream serif capitals below it. Warm amber candlelight from behind-left, shallow " +
      "depth of field, blurred dark mahogany interior background. Ultra-realistic, " +
      "luxury brand photography quality, 4:3 landscape orientation.",
  },
  {
    id: "02",
    title: "Business Cards",
    subtitle: "Desk Scene",
    prompt:
      "Using this exact logo mark, generate a photorealistic brand mockup: " +
      "three premium matte charcoal black business cards with this gold logo foil-stamped " +
      "on the front, fanned out on a dark polished marble surface. A closed rose-gold " +
      "MacBook Pro rests in the background, and a crystal whisky glass with a single " +
      "large ice cube sits to the right. Warm amber light from a leather-shaded desk " +
      "lamp, moody and intimate atmosphere. Ultra-realistic editorial photography, " +
      "luxury lifestyle, 16:9 landscape orientation.",
  },
  {
    id: "04",
    title: "Hardcover Notebook",
    subtitle: "Coffee Table",
    prompt:
      "Using this exact logo mark, generate a photorealistic brand mockup: " +
      "a closed A5 hardcover notebook sitting on a dark walnut coffee table. The " +
      "cover is deep charcoal black, and this gold logo is embossed and foil-stamped " +
      "in the centre, with 'THE GATHERING PLACE' in small debossed cream type below. " +
      "A cream linen couch is blurred softly in the background, warm flickering " +
      "fireplace light from the right side, a single dried botanical sprig rests " +
      "beside the notebook. Luxury lifestyle photography, ultra-realistic, 4:3 landscape.",
  },
  {
    id: "05",
    title: "Business Card",
    subtitle: "Marble Surface",
    prompt:
      "Using this exact logo mark, generate a photorealistic brand mockup: " +
      "top-down overhead flat-lay of a single matte charcoal black business card " +
      "with this gold foil logo centred on it, placed on dark grey-veined marble. " +
      "A few dried botanicals, a small amber glass perfume bottle, and a folded " +
      "charcoal linen napkin are arranged artfully around the card. Soft diffused " +
      "natural daylight, luxury editorial still-life, minimal negative space, " +
      "ultra-realistic, perfect square (1:1) composition.",
  },
  {
    id: "06",
    title: "Card Holder",
    subtitle: "Leather Wallet",
    prompt:
      "Using this exact logo mark, generate a photorealistic brand mockup: " +
      "a slim matte black full-grain leather card case held open in one hand, " +
      "a single matte charcoal business card with this gold logo being slid out " +
      "with the other hand's thumb. Warm amber backlight from a candle behind, " +
      "shallow depth of field, blurred dark upscale lounge setting with soft " +
      "candlelight bokeh. Intimate luxury photography, ultra-realistic, " +
      "portrait 3:4 orientation.",
  },
  {
    id: "08",
    title: "Stationery Flat Lay",
    subtitle: "Full Set",
    prompt:
      "Using this exact logo mark, generate a photorealistic brand mockup: " +
      "a clean overhead flat-lay on a dark charcoal linen surface showing a complete " +
      "branded stationery set: three matte charcoal black business cards with this " +
      "gold foil logo, one A4 cream letterhead sheet with this gold logo small at " +
      "the top, one dark charcoal sealed envelope, and a closed charcoal hardcover " +
      "notebook — all items bearing this same gold logo mark. Items artfully arranged " +
      "with generous breathing space, a single dried white flower placed between items. " +
      "Luxury brand presentation photography, overhead 90-degree view, " +
      "ultra-realistic, 4:3 landscape.",
  },
];

// ─── Image generation ─────────────────────────────────────────────────────────

async function generateImage(
  client: GoogleGenAI,
  logoB64: string,
  scene: Scene,
  tmpDir: string
): Promise<string | null> {
  const outPath = path.join(tmpDir, `${scene.id}.png`);
  if (fs.existsSync(outPath)) {
    process.stdout.write(` (cached)`);
    return outPath;
  }

  const response = await client.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/png", data: logoB64 } },
          { text: scene.prompt },
        ],
      },
    ],
    config: {
      responseModalities: ["IMAGE", "TEXT"],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      const buf = Buffer.from(part.inlineData.data!, "base64");
      fs.writeFileSync(outPath, buf);
      return outPath;
    }
  }
  return null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── PDF generation ───────────────────────────────────────────────────────────

function imgDataUrl(p: string): string {
  return `data:image/png;base64,${fs.readFileSync(p).toString("base64")}`;
}

function buildHtml(
  results: Array<{ scene: Scene; imgPath: string | null }>
): string {
  const ok = results.filter((r) => r.imgPath !== null);

  const slides = ok
    .map(
      ({ scene, imgPath }) => `
<div class="slide">
  <div class="photo" style="background-image:url('${imgDataUrl(imgPath!)}')"></div>
  <div class="caption">
    <span class="num">${scene.id}</span>
    <span class="sep">·</span>
    <span class="name">${scene.title}</span>
    <span class="dash">—</span>
    <span class="sub">${scene.subtitle}</span>
  </div>
</div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
body { background:${B.charcoal}; font-family:Georgia,"Times New Roman",serif; }

/* Cover */
.cover {
  width:297mm; height:210mm;
  background:${B.charcoal};
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  page-break-after:always;
  position:relative; overflow:hidden;
}
.cover::before {
  content:''; position:absolute;
  inset:12mm; border:0.5px solid #2a2420; pointer-events:none;
}
.cover-eyebrow {
  font-size:6.5px; letter-spacing:0.5em; text-transform:uppercase;
  color:#7a5918; margin-bottom:14mm;
}
.cover-title {
  font-size:46px; letter-spacing:0.08em; text-transform:uppercase;
  color:${B.cream}; font-weight:normal; line-height:1.15;
  text-align:center; margin-bottom:4mm;
}
.cover-rule {
  width:22mm; height:0.5px; background:${B.gold}; margin:0 auto 10mm;
}
.cover-count {
  font-size:7.5px; letter-spacing:0.3em; text-transform:uppercase;
  color:${B.muted}; text-align:center;
}

/* Slides */
.slide {
  width:297mm; height:210mm;
  background:${B.charcoal};
  display:flex; flex-direction:column;
  page-break-after:always; overflow:hidden;
}
.photo {
  flex:1;
  background-size:cover;
  background-position:center center;
  background-repeat:no-repeat;
}
.caption {
  height:13mm; flex-shrink:0;
  background:${B.charcoal};
  border-top:1px solid #1e1a16;
  display:flex; align-items:center;
  padding:0 14mm; gap:5px;
  font-size:7px; letter-spacing:0.22em; text-transform:uppercase;
}
.num  { color:${B.gold}; }
.sep  { color:#3a3028; }
.name { color:${B.cream}; }
.dash { color:#3a3028; }
.sub  { color:${B.muted}; }

@page { size:A4 landscape; margin:0; }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-eyebrow">Brand Mockups &middot; ${new Date().getFullYear()}</div>
  <div class="cover-title">The Gathering<br>Place</div>
  <div class="cover-rule"></div>
  <div class="cover-count">${ok.length} Scenes &nbsp;&middot;&nbsp; Identity in Context &nbsp;&middot;&nbsp; Confidential</div>
</div>

${slides}

</body>
</html>`;
}

async function renderPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_AI_STUDIO_API_KEY not set in .env.local");
    process.exit(1);
  }

  if (!fs.existsSync(LOGO_PATH)) {
    console.error(`Logo not found: ${LOGO_PATH}`);
    process.exit(1);
  }

  const client = new GoogleGenAI({ apiKey });
  const logoB64 = fs.readFileSync(LOGO_PATH).toString("base64");
  const tmpDir = process.env.CACHE_DIR
    ? process.env.CACHE_DIR
    : fs.mkdtempSync(path.join(os.tmpdir(), "tgp-mockups-"));

  console.log(`\nGenerating ${SCENES.length} brand mockups — The Gathering Place`);
  console.log(`Model : ${MODEL}`);
  console.log(`Logo  : content/brand/gathering-place/logos/processed/hearthstone logo.png`);
  console.log(`Output: content/brand/gathering-place/stationery/`);
  console.log(`Temp  : ${tmpDir}\n`);

  const results: Array<{ scene: Scene; imgPath: string | null }> = [];

  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    process.stdout.write(`  [${i + 1}/${SCENES.length}] ${scene.title} — ${scene.subtitle}... `);
    try {
      const imgPath = await generateImage(client, logoB64, scene, tmpDir);
      if (imgPath) {
        console.log(`✓`);
      } else {
        console.log(`✗  (no image in response)`);
      }
      results.push({ scene, imgPath });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`✗  ${msg.slice(0, 120)}`);
      results.push({ scene, imgPath: null });
    }

    // Rate limit pause between requests
    if (i < SCENES.length - 1) await sleep(4000);
  }

  const success = results.filter((r) => r.imgPath !== null).length;
  console.log(`\n${success}/${SCENES.length} images generated.`);

  if (success === 0) {
    console.error("No images generated — cannot build PDF.");
    process.exit(1);
  }

  // Clear stationery directory
  console.log(`\nClearing stationery directory...`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  for (const f of fs.readdirSync(OUTPUT_DIR)) {
    fs.rmSync(path.join(OUTPUT_DIR, f), { recursive: true, force: true });
  }

  // Build PDF
  console.log(`Building presentation PDF...`);
  const html = buildHtml(results);
  const pdf = await renderPdf(html);
  fs.writeFileSync(OUTPUT_PDF, pdf);

  const mb = (pdf.length / 1024 / 1024).toFixed(1);
  console.log(`\n✓  Done — ${mb} MB`);
  console.log(`   ${OUTPUT_PDF}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
