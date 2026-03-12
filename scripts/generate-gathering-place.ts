#!/usr/bin/env tsx
/**
 * Generate Gathering Place collateral PDFs for Drew Dudley.
 *
 * Usage:
 *   npx tsx scripts/generate-gathering-place.ts            # all docs, both themes
 *   npx tsx scripts/generate-gathering-place.ts --dark     # dark theme only
 *   npx tsx scripts/generate-gathering-place.ts --light    # light theme only
 *   npx tsx scripts/generate-gathering-place.ts --prospectus --light
 *   npx tsx scripts/generate-gathering-place.ts --teaser
 *   npx tsx scripts/generate-gathering-place.ts --welcome
 */

import {
  generateProspectus,
  generateTeaser,
  generateWelcomePackage,
  type GpTheme,
} from "../packages/core/src/services/gathering-place-service.js";

const args = process.argv.slice(2);

const runProspectus = args.includes("--prospectus") || !args.some((a) => ["--prospectus", "--teaser", "--welcome"].includes(a));
const runTeaser = args.includes("--teaser") || !args.some((a) => ["--prospectus", "--teaser", "--welcome"].includes(a));
const runWelcome = args.includes("--welcome") || !args.some((a) => ["--prospectus", "--teaser", "--welcome"].includes(a));

const darkOnly = args.includes("--dark");
const lightOnly = args.includes("--light");

const themes: GpTheme[] = darkOnly ? ["dark"] : lightOnly ? ["light"] : ["dark", "light"];

console.log("\nThe Gathering Place — Collateral Generator");
console.log(`Themes: ${themes.join(", ")}\n`);

async function run() {
  for (const theme of themes) {
    const label = theme === "light" ? "(light)" : "(dark) ";

    if (runProspectus) {
      process.stdout.write(`  Membership Prospectus ${label}... `);
      const result = await generateProspectus(theme);
      console.log("done");
      console.log(`    → ${result.pdfPath}`);
    }

    if (runTeaser) {
      process.stdout.write(`  One-Page Teaser       ${label}... `);
      const result = await generateTeaser(theme);
      console.log("done");
      console.log(`    → ${result.pdfPath}`);
    }

    if (runWelcome) {
      process.stdout.write(`  Member Welcome Pack   ${label}... `);
      const result = await generateWelcomePackage(theme);
      console.log("done");
      console.log(`    → ${result.pdfPath}`);
    }
  }

  console.log("\nAll done.\n");
}

run().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
