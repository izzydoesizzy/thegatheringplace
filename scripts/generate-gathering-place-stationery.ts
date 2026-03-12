#!/usr/bin/env tsx
/**
 * Generate stationery mockups for The Gathering Place.
 *
 * Produces PDF mockups of branded stationery items using a logo placeholder.
 * Once a logo is chosen, swap the placeholder for the real logo and re-run.
 *
 * Usage:
 *   ./node_modules/.bin/tsx scripts/generate-gathering-place-stationery.ts           # all items
 *   ./node_modules/.bin/tsx scripts/generate-gathering-place-stationery.ts --letterhead
 *   ./node_modules/.bin/tsx scripts/generate-gathering-place-stationery.ts --cards
 *   ./node_modules/.bin/tsx scripts/generate-gathering-place-stationery.ts --membership
 *   ./node_modules/.bin/tsx scripts/generate-gathering-place-stationery.ts --notepaper
 *   ./node_modules/.bin/tsx scripts/generate-gathering-place-stationery.ts --envelope
 *   ./node_modules/.bin/tsx scripts/generate-gathering-place-stationery.ts --welcome-cover
 *
 * Output: content/brand/gathering-place/stationery/
 *
 * To use a real logo: set LOGO_PATH to the logo PNG file path.
 *   LOGO_PATH=content/brand/gathering-place/logos/02-the-hearthstone.png \
 *     ./node_modules/.bin/tsx scripts/generate-gathering-place-stationery.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(rootDir, ".env.local") });

const OUTPUT_DIR = path.join(rootDir, "content/brand/gathering-place/stationery");

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const BRAND = {
  gold: "#c4922a",
  goldLight: "#d4a84a",
  goldDim: "#9a6f1e",
  charcoal: "#0c0a08",
  charcoalMid: "#1a1714",
  charcoalLight: "#2a2420",
  cream: "#f0ebe2",
  muted: "#9a8f82",
  mutedDark: "#6b615a",
};

// ─── Logo placeholder ─────────────────────────────────────────────────────────

function logoBlock(size: number = 60, logoPath?: string): string {
  if (logoPath && fs.existsSync(path.join(rootDir, logoPath))) {
    const data = fs.readFileSync(path.join(rootDir, logoPath));
    const b64 = data.toString("base64");
    return `<img src="data:image/png;base64,${b64}" style="width:${size}px;height:${size}px;object-fit:contain;" />`;
  }
  return `
    <div style="
      width:${size}px;height:${size}px;
      border:1.5px solid ${BRAND.gold};
      border-radius:4px;
      display:flex;align-items:center;justify-content:center;
      color:${BRAND.goldDim};font-size:9px;letter-spacing:0.08em;
      font-family:Georgia,serif;
    ">[LOGO]</div>`;
}

// ─── Shared CSS ───────────────────────────────────────────────────────────────

const BASE_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
`;

// ─── 1. A4 Letterhead ─────────────────────────────────────────────────────────

function buildLetterhead(logoPath?: string): string {
  const logo = logoBlock(52, logoPath);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_CSS}
@page { size: A4; margin: 0; }
body { width: 210mm; min-height: 297mm; background: ${BRAND.charcoal}; color: ${BRAND.cream}; }

.page { width: 210mm; min-height: 297mm; position: relative; padding: 0; }

.header {
  padding: 18mm 20mm 0;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 0.5px solid ${BRAND.charcoalLight};
  padding-bottom: 7mm;
}
.header-left { display: flex; align-items: center; gap: 14px; }
.wordmark { color: ${BRAND.cream}; }
.wordmark-main { font-size: 17px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: normal; display: block; }
.wordmark-sub { font-size: 8px; letter-spacing: 0.35em; text-transform: uppercase; color: ${BRAND.muted}; display: block; margin-top: 3px; }
.header-right { text-align: right; font-size: 8px; letter-spacing: 0.08em; color: ${BRAND.mutedDark}; line-height: 1.8; }

.gold-rule { height: 1px; background: linear-gradient(to right, transparent, ${BRAND.gold}, transparent); margin: 0 20mm; }

.body-area { padding: 16mm 20mm 0; min-height: 200mm; }
.date-line { font-size: 9px; letter-spacing: 0.12em; color: ${BRAND.muted}; margin-bottom: 10mm; }
.salutation { font-size: 12px; color: ${BRAND.cream}; margin-bottom: 6mm; }
.body-text { font-size: 10px; line-height: 1.9; color: ${BRAND.muted}; max-width: 155mm; }
.body-text p { margin-bottom: 5mm; }

.footer {
  position: absolute; bottom: 15mm; left: 20mm; right: 20mm;
  border-top: 0.5px solid ${BRAND.charcoalLight};
  padding-top: 5mm;
  display: flex; justify-content: space-between; align-items: center;
}
.footer-text { font-size: 7px; letter-spacing: 0.1em; color: ${BRAND.mutedDark}; }
.footer-accent { width: 20px; height: 1px; background: ${BRAND.gold}; }
</style></head><body>
<div class="page">
  <div class="header">
    <div class="header-left">
      ${logo}
      <div class="wordmark">
        <span class="wordmark-main">The Gathering Place</span>
        <span class="wordmark-sub">A Private Creative Membership</span>
      </div>
    </div>
    <div class="header-right">
      Toronto · The Kawarthas · Barbados<br>
      drew@dayoneleadership.com<br>
      thegatheringplace.ca
    </div>
  </div>

  <div class="gold-rule" style="margin-top:5mm;"></div>

  <div class="body-area">
    <div class="date-line">March 2026</div>
    <div class="salutation">Dear [Name],</div>
    <div class="body-text">
      <p>Thank you for your interest in The Gathering Place. This letter is to confirm your membership and welcome you into the founding cohort — eight to twelve people with whom I've had conversations long enough to know that what we'd make together is worth protecting.</p>
      <p>Your membership begins [date]. I look forward to seeing you at the space in [location]. There are no check-ins, no schedules to follow. Show up as you are.</p>
      <p>The only thing I'll ask: pause before you answer. One beat of reflection changes everything.</p>
      <p>With gratitude,</p>
    </div>

    <div style="margin-top:14mm;">
      <div style="font-size:12px;color:${BRAND.cream};font-style:italic;">Drew Dudley</div>
      <div style="font-size:8px;letter-spacing:0.12em;color:${BRAND.muted};margin-top:3px;">Founder, The Gathering Place</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-text">The Gathering Place · Private Membership · Founded 2026</div>
    <div class="footer-accent"></div>
    <div class="footer-text">thegatheringplace.ca</div>
  </div>
</div>
</body></html>`;
}

// ─── 2. Business Cards (front + back, 3.5" × 2") ─────────────────────────────

function buildBusinessCards(logoPath?: string): string {
  const logo = logoBlock(36, logoPath);
  const cardW = "89mm";
  const cardH = "51mm";
  const cardStyle = `width:${cardW};height:${cardH};border-radius:3px;overflow:hidden;display:inline-block;margin:8mm;vertical-align:top;`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_CSS}
@page { size: A4 landscape; margin: 0; }
body { background: #111; display: flex; align-items: center; justify-content: center; min-height: 210mm; flex-wrap: wrap; padding: 10mm; gap: 0; }

.card-front {
  ${cardStyle}
  background: ${BRAND.charcoal};
  position: relative;
  padding: 7mm 8mm;
  display: flex; flex-direction: column; justify-content: space-between;
}
.card-front .logo-row { display: flex; align-items: center; gap: 9px; }
.card-front .name { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: ${BRAND.cream}; margin-top: auto; }
.card-front .title { font-size: 7px; letter-spacing: 0.2em; text-transform: uppercase; color: ${BRAND.muted}; margin-top: 2px; }
.card-front .contact { font-size: 6.5px; letter-spacing: 0.08em; color: ${BRAND.mutedDark}; line-height: 1.7; }
.card-front-rule { height: 0.5px; background: ${BRAND.charcoalLight}; margin: 3mm 0; }
.card-front .gold-accent { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(to right, transparent, ${BRAND.gold}, transparent); }

.card-back {
  ${cardStyle}
  background: ${BRAND.charcoalMid};
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 5mm;
}
.card-back .mark-large { opacity: 0.9; }
.card-back .tagline { font-size: 7px; letter-spacing: 0.28em; text-transform: uppercase; color: ${BRAND.muted}; text-align: center; }
.card-back .url { font-size: 7px; letter-spacing: 0.15em; color: ${BRAND.gold}; text-align: center; }
</style></head><body>

<div class="card-front">
  <div class="logo-row">
    ${logo}
    <span style="font-size:8px;letter-spacing:0.22em;text-transform:uppercase;color:${BRAND.cream};">The Gathering Place</span>
  </div>
  <div>
    <div class="card-front-rule"></div>
    <div class="name">Drew Dudley</div>
    <div class="title">Founder · Day One Leadership</div>
    <div class="card-front-rule"></div>
    <div class="contact">
      drew@dayoneleadership.com<br>
      thegatheringplace.ca
    </div>
  </div>
  <div class="gold-accent"></div>
</div>

<div class="card-back">
  <div class="mark-large">${logoBlock(44, logoPath)}</div>
  <div class="tagline">A Private Creative Membership</div>
  <div class="url">thegatheringplace.ca</div>
</div>

</body></html>`;
}

// ─── 3. Membership Card (credit card size, 85.6mm × 54mm) ───────────────────

function buildMembershipCard(logoPath?: string): string {
  const logo = logoBlock(32, logoPath);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_CSS}
@page { size: 85.6mm 54mm; margin: 0; }
body { width: 85.6mm; height: 54mm; background: ${BRAND.charcoal}; overflow: hidden; }

.card { width: 85.6mm; height: 54mm; position: relative; padding: 5.5mm 6mm; display: flex; flex-direction: column; justify-content: space-between; }

.top-row { display: flex; align-items: center; justify-content: space-between; }
.wordmark { font-size: 6.5px; letter-spacing: 0.22em; text-transform: uppercase; color: ${BRAND.cream}; }
.wordmark-sub { font-size: 5px; letter-spacing: 0.18em; color: ${BRAND.muted}; display: block; margin-top: 1.5px; }

.mid { }
.member-label { font-size: 5px; letter-spacing: 0.3em; text-transform: uppercase; color: ${BRAND.muted}; }
.member-name { font-size: 10px; letter-spacing: 0.08em; color: ${BRAND.cream}; margin-top: 2px; }

.bottom-row { display: flex; align-items: flex-end; justify-content: space-between; }
.member-since { font-size: 5.5px; letter-spacing: 0.12em; color: ${BRAND.mutedDark}; line-height: 1.6; }
.member-id { font-size: 8px; letter-spacing: 0.3em; color: ${BRAND.gold}; font-family: 'Courier New', monospace; }

.edge-gold { position: absolute; bottom: 0; left: 0; right: 0; height: 1.5px; background: linear-gradient(to right, transparent, ${BRAND.gold}, transparent); }
.edge-gold-top { position: absolute; top: 0; left: 0; right: 0; height: 1.5px; background: linear-gradient(to right, transparent, ${BRAND.gold}44, transparent); }

.bg-pattern {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(ellipse at 85% 15%, ${BRAND.gold}08 0%, transparent 60%);
  pointer-events: none;
}
</style></head><body>
<div class="card">
  <div class="bg-pattern"></div>
  <div class="edge-gold-top"></div>

  <div class="top-row">
    <div>
      <div class="wordmark">The Gathering Place</div>
      <span class="wordmark-sub">Founding Member</span>
    </div>
    ${logo}
  </div>

  <div class="mid"></div>

  <div class="bottom-row">
    <div class="member-since">
      <div class="member-label">Member</div>
      <div class="member-name">[Member Name]</div>
      <div style="font-size:5px;color:${BRAND.mutedDark};margin-top:1px;letter-spacing:0.1em;">Since March 2026</div>
    </div>
    <div class="member-id">TGP·001</div>
  </div>

  <div class="edge-gold"></div>
</div>
</body></html>`;
}

// ─── 4. Notepaper (A5, half-sheet) ───────────────────────────────────────────

function buildNotepaper(logoPath?: string): string {
  const logo = logoBlock(36, logoPath);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_CSS}
@page { size: A5; margin: 0; }
body { width: 148mm; height: 210mm; background: ${BRAND.charcoal}; }

.page { width: 148mm; height: 210mm; position: relative; }

.header { padding: 12mm 14mm 0; display: flex; align-items: center; gap: 10px; padding-bottom: 5mm; border-bottom: 0.5px solid ${BRAND.charcoalLight}; }
.wordmark { font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: ${BRAND.cream}; display: block; }
.wordmark-sub { font-size: 6px; letter-spacing: 0.2em; color: ${BRAND.muted}; display: block; margin-top: 2px; }

.lines-area { padding: 8mm 14mm; }
.line { height: 0.5px; background: ${BRAND.charcoalLight}; margin-bottom: 9mm; }

.footer { position: absolute; bottom: 10mm; left: 14mm; right: 14mm; display: flex; justify-content: space-between; align-items: center; }
.footer-text { font-size: 6px; letter-spacing: 0.15em; color: ${BRAND.mutedDark}; }
.footer-dot { width: 3px; height: 3px; border-radius: 50%; background: ${BRAND.gold}; }
</style></head><body>
<div class="page">
  <div class="header">
    ${logo}
    <div>
      <span class="wordmark">The Gathering Place</span>
      <span class="wordmark-sub">A Private Creative Membership</span>
    </div>
  </div>

  <div class="lines-area">
    ${Array(17).fill('<div class="line"></div>').join('\n    ')}
  </div>

  <div class="footer">
    <div class="footer-text">thegatheringplace.ca</div>
    <div class="footer-dot"></div>
    <div class="footer-text">Toronto · The Kawarthas · Barbados</div>
  </div>
</div>
</body></html>`;
}

// ─── 5. DL Envelope ───────────────────────────────────────────────────────────

function buildEnvelope(logoPath?: string): string {
  const logo = logoBlock(28, logoPath);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_CSS}
@page { size: 220mm 110mm; margin: 0; }
body { width: 220mm; height: 110mm; background: ${BRAND.charcoal}; }

.envelope { width: 220mm; height: 110mm; position: relative; }

.return-address {
  position: absolute; top: 12mm; left: 14mm;
  display: flex; align-items: center; gap: 8px;
}
.return-text { font-size: 7px; letter-spacing: 0.14em; color: ${BRAND.muted}; line-height: 1.7; }
.return-name { font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; color: ${BRAND.cream}; display: block; margin-bottom: 1px; }

.seal {
  position: absolute;
  bottom: 10mm; left: 50%; transform: translateX(-50%);
  text-align: center;
}
.seal-line { height: 0.5px; width: 60mm; background: linear-gradient(to right, transparent, ${BRAND.gold}44, transparent); margin: 0 auto 4mm; }

.to-address {
  position: absolute; bottom: 22mm; right: 18mm;
  text-align: right; font-size: 8.5px; letter-spacing: 0.08em; color: ${BRAND.cream}; line-height: 1.9;
}

.left-rule { position: absolute; top: 0; bottom: 0; left: 55mm; width: 0.5px; background: ${BRAND.charcoalLight}; }
</style></head><body>
<div class="envelope">
  <div class="left-rule"></div>

  <div class="return-address">
    ${logo}
    <div class="return-text">
      <span class="return-name">The Gathering Place</span>
      Toronto, Ontario<br>
      thegatheringplace.ca
    </div>
  </div>

  <div class="seal">
    <div class="seal-line"></div>
  </div>

  <div class="to-address">
    [Recipient Name]<br>
    [Address Line 1]<br>
    [City, Province Postal Code]
  </div>
</div>
</body></html>`;
}

// ─── 6. Welcome Package Cover (A4) ───────────────────────────────────────────

function buildWelcomeCover(logoPath?: string): string {
  const logo = logoBlock(80, logoPath);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_CSS}
@page { size: A4; margin: 0; }
body { width: 210mm; height: 297mm; background: ${BRAND.charcoal}; }

.cover {
  width: 210mm; height: 297mm;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  position: relative;
  background: radial-gradient(ellipse at 50% 45%, ${BRAND.gold}0a 0%, transparent 65%);
}

.top-rule { position: absolute; top: 22mm; left: 22mm; right: 22mm; height: 0.5px; background: linear-gradient(to right, transparent, ${BRAND.gold}55, transparent); }
.bottom-rule { position: absolute; bottom: 22mm; left: 22mm; right: 22mm; height: 0.5px; background: linear-gradient(to right, transparent, ${BRAND.gold}55, transparent); }

.logo-wrap { margin-bottom: 10mm; }

.title { font-size: 28px; letter-spacing: 0.2em; text-transform: uppercase; color: ${BRAND.cream}; font-weight: normal; line-height: 1.3; margin-bottom: 4mm; }
.title-sub { font-size: 9px; letter-spacing: 0.4em; text-transform: uppercase; color: ${BRAND.gold}; margin-bottom: 12mm; }
.gold-divider { width: 30mm; height: 0.5px; background: ${BRAND.gold}; margin: 0 auto 12mm; }
.welcome-text { font-size: 10px; letter-spacing: 0.06em; color: ${BRAND.muted}; line-height: 1.9; max-width: 120mm; font-style: italic; }
.member-name { font-size: 13px; letter-spacing: 0.18em; color: ${BRAND.cream}; margin-top: 10mm; }
.member-label { font-size: 7px; letter-spacing: 0.3em; text-transform: uppercase; color: ${BRAND.mutedDark}; margin-top: 3mm; }

.corner { position: absolute; width: 8mm; height: 8mm; }
.tl { top: 14mm; left: 14mm; border-top: 1px solid ${BRAND.gold}44; border-left: 1px solid ${BRAND.gold}44; }
.tr { top: 14mm; right: 14mm; border-top: 1px solid ${BRAND.gold}44; border-right: 1px solid ${BRAND.gold}44; }
.bl { bottom: 14mm; left: 14mm; border-bottom: 1px solid ${BRAND.gold}44; border-left: 1px solid ${BRAND.gold}44; }
.br { bottom: 14mm; right: 14mm; border-bottom: 1px solid ${BRAND.gold}44; border-right: 1px solid ${BRAND.gold}44; }
</style></head><body>
<div class="cover">
  <div class="top-rule"></div>
  <div class="bottom-rule"></div>
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>

  <div class="logo-wrap">${logo}</div>

  <div class="title">The Gathering<br>Place</div>
  <div class="title-sub">A Private Creative Membership</div>
  <div class="gold-divider"></div>

  <div class="welcome-text">
    "What would it look like to spend a year sitting around a fire<br>
    with people I find genuinely interesting —<br>
    and just let it be that?"
  </div>

  <div class="member-name">[Member Name]</div>
  <div class="member-label">Welcome Package · Founding Member</div>
</div>
</body></html>`;
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function generatePdf(html: string, outputPath: string): Promise<void> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load", timeout: 120000 });
  const pdfBuffer = await page.pdf({ printBackground: true, preferCSSPageSize: true });
  await browser.close();

  fs.writeFileSync(outputPath, pdfBuffer);
}

async function main() {
  const args = process.argv.slice(2);
  const logoPath = process.env.LOGO_PATH ?? "content/brand/gathering-place/logos/processed/hearthstone logo.png";

  const runAll = args.length === 0;
  const run = (flag: string) => runAll || args.includes(flag);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const items: Array<{ name: string; flag: string; html: () => string }> = [
    { name: "letterhead", flag: "--letterhead", html: () => buildLetterhead(logoPath) },
    { name: "business-cards", flag: "--cards", html: () => buildBusinessCards(logoPath) },
    { name: "membership-card", flag: "--membership", html: () => buildMembershipCard(logoPath) },
    { name: "notepaper", flag: "--notepaper", html: () => buildNotepaper(logoPath) },
    { name: "envelope", flag: "--envelope", html: () => buildEnvelope(logoPath) },
    { name: "welcome-cover", flag: "--welcome-cover", html: () => buildWelcomeCover(logoPath) },
  ];

  const toRun = items.filter((item) => run(item.flag));

  if (toRun.length === 0) {
    console.error("✗ No items matched. Use --letterhead, --cards, --membership, --notepaper, --envelope, --welcome-cover");
    process.exit(1);
  }

  const logoNote = logoPath ? `Logo: ${logoPath}` : `Logo: placeholder (set LOGO_PATH=... to use a real logo)`;
  console.log(`\nGenerating ${toRun.length} stationery item${toRun.length === 1 ? "" : "s"} for The Gathering Place`);
  console.log(`${logoNote}`);
  console.log(`Output: content/brand/gathering-place/stationery/\n`);

  let success = 0;
  for (const item of toRun) {
    const outputPath = path.join(OUTPUT_DIR, `${item.name}.pdf`);
    // Also write the HTML source for inspection
    const htmlPath = path.join(OUTPUT_DIR, `${item.name}.html`);
    try {
      process.stdout.write(`  Generating ${item.name}...`);
      const html = item.html();
      fs.writeFileSync(htmlPath, html);
      await generatePdf(html, outputPath);
      console.log(` ✓ ${item.name}.pdf`);
      success++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(` ✗ Failed: ${message}`);
      console.log(`    → HTML saved to ${item.name}.html for manual inspection`);
    }
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`Done. ${success}/${toRun.length} items generated.`);
  if (success > 0) {
    console.log(`Open: content/brand/gathering-place/stationery/`);
  }
  console.log(`\nOnce you pick a logo, run:`);
  console.log(`  LOGO_PATH=content/brand/gathering-place/logos/favourites/02-the-hearthstone.png \\`);
  console.log(`  ./node_modules/.bin/tsx scripts/generate-gathering-place-stationery.ts`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
