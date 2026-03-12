#!/usr/bin/env tsx
/**
 * Generate logo variations for The Gathering Place using Nano Banana Pro (Gemini 3 Pro Image).
 *
 * Requires: GOOGLE_AI_STUDIO_API_KEY in .env.local
 * Get yours free at: https://ai.google.dev
 *
 * Usage:
 *   ./node_modules/.bin/tsx scripts/generate-gathering-place-logos.ts              # all 30
 *   ./node_modules/.bin/tsx scripts/generate-gathering-place-logos.ts --id 2       # concept #2 only
 *   ./node_modules/.bin/tsx scripts/generate-gathering-place-logos.ts --range 11-30 # v2 batch
 *   ./node_modules/.bin/tsx scripts/generate-gathering-place-logos.ts --id 2 --id 7 # specific picks
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

// Load env from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(rootDir, ".env.local") });

// ─── Output folder ────────────────────────────────────────────────────────────

const OUTPUT_DIR = path.join(rootDir, "content/brand/gathering-place/logos");

// ─── Logo concepts ───────────────────────────────────────────────────────────
//
// Each concept has:
//   - id: 1–10 (used with --id flag)
//   - name: short name for the file
//   - description: the concept in plain language
//   - prompt: the full Imagen 3 prompt
//
// Base prompt context:
//   "A professional luxury logo mark for The Gathering Place, a private creative
//    membership club. Warm gold (#c4922a) on deep charcoal (#0c0a08) background.
//    Style: modern editorial luxury, minimal, clean vector quality."

const BASE = `A professional luxury logo mark for "The Gathering Place", a private creative membership club for speakers, coaches, and writers. Warm gold color on a very dark charcoal background. Style: modern editorial luxury, minimal, clean, vector-like quality. No human faces, no photography, no text in the image.`;

const CONCEPTS = [
  {
    id: 1,
    name: "the-ember",
    description: "A single luminous ember — one glowing point of gold warmth in darkness.",
    prompt: `${BASE} A single glowing golden circle with a soft warm radial light glow, like an ember or a distant sun, centered on a very dark near-black charcoal background. The glow fades gently outward into darkness. Ultra-minimal, just one luminous circle. Clean vector quality.`,
  },
  {
    id: 2,
    name: "the-hearthstone",
    description: "Three overlapping geometric arcs forming both a flame and three people leaning in.",
    prompt: `${BASE} An abstract geometric logo mark composed of three smooth overlapping curved arcs arranged symmetrically, their bases meeting at a shared point at the bottom, their tops curving outward — simultaneously suggesting a stylized flame and three people leaning toward each other in conversation. Warm gold arcs on deep charcoal. Modern, geometric, clean.`,
  },
  {
    id: 3,
    name: "the-threshold",
    description: "A single continuous gold line forming a graceful open Roman arch — the doorway into something new.",
    prompt: `${BASE} A single continuous thin gold line forming a graceful open Roman arch, tall and proportioned, on a deep charcoal background. No fill inside the arch — just the clean outline of a doorway framing empty space. Even stroke weight throughout, precise and minimal. Ultra-clean line art logo.`,
  },
  {
    id: 4,
    name: "convergence",
    description: "Five thin gold lines radiating inward from different edges, all converging to a single bright center point.",
    prompt: `${BASE} Abstract geometric logo mark: five thin gold lines originating from different points on the outer perimeter of the composition — corners and edges — each converging inward to meet at a single bright luminous gold dot at the exact center. Precise, radiating, purposeful. Warm gold on deep charcoal. Minimal and geometric.`,
  },
  {
    id: 5,
    name: "the-anchor-chair",
    description: "A solid gold wingback chair silhouette in side profile — the 'Am I Crazy' chair.",
    prompt: `${BASE} A solid warm gold silhouette of an elegant wingback armchair seen from the side, with refined proportions: tall wingback, tapered legs, generous seat cushion. The entire chair is a single filled gold shape — no interior detail, pure silhouette. Dark charcoal background. Iconic, clean, luxury brand mark.`,
  },
  {
    id: 6,
    name: "the-incomplete-ring",
    description: "A near-perfect circle of gold dots with a deliberate gap — founding cohort still forming.",
    prompt: `${BASE} Logo mark: a ring of small evenly-spaced gold circular dots arranged in a circle, with a deliberate intentional gap of two to three missing dots at the top. Nine or ten dots present, two or three absent. The gap is designed, not accidental. Deep charcoal background, warm gold dots, perfect spacing. Minimal, geometric, circular badge.`,
  },
  {
    id: 7,
    name: "the-interlocking-worlds",
    description: "Three circles overlapping in a Venn arrangement, the central intersection glowing brighter.",
    prompt: `${BASE} Abstract logo mark: three circles arranged in a triangular overlapping Venn diagram formation. Each circle is rendered as a thin gold outline only — no fill in the non-overlapping sections. The central zone where all three circles intersect is filled with bright warm gold. The overlapping pairwise zones are a slightly translucent medium gold. Deep charcoal background. Modern, conceptual, clean vector.`,
  },
  {
    id: 8,
    name: "the-endless-knot",
    description: "A modern geometric Celtic endless knot — one continuous line, no beginning, no end.",
    prompt: `${BASE} A geometric endless knot logo mark inspired by Celtic knotwork but rendered in clean modern angular linework — not rustic or decorative, but architectural and precise. A single continuous gold line that weaves over and under itself in a perfectly balanced symmetrical square arrangement, never beginning and never ending. Even stroke weight throughout. Warm gold on deep charcoal. Minimal, elegant, precise.`,
  },
  {
    id: 9,
    name: "the-lantern",
    description: "A stylized hexagonal hanging lantern with a warm glow at its center.",
    prompt: `${BASE} A stylized hanging lantern logo mark: a hexagonal cage structure made of thin clean gold lines, with a small hook at the top as if hanging. The light source at the center of the lantern is brighter gold, with a gentle warm radial glow visible through the cage lines. Deep charcoal background, warm gold lines, soft interior glow. Portrait orientation. Minimal illustrative mark, clean and elegant.`,
  },
  {
    id: 10,
    name: "tgp-monogram",
    description: "An interlocking T-G-P monogram with classical serif proportions — a membership seal.",
    prompt: `${BASE} An elegant interlocking typographic monogram of the capital letters T, G, and P. The T forms a strong central vertical backbone. The G curves gracefully around and through the T's crossbar. The P integrates at the base, its bowl aligning with the G's curve. Classical serif letterforms with hairline details at the terminals. Rendered in a single warm gold tone on deep charcoal. Refined, balanced, symmetrical monogram — like a signet ring or engraved membership mark.`,
  },

  // ─── Volume 2: Arc-based geometric concepts inspired by The Hearthstone ───────

  {
    id: 11,
    name: "the-embrace",
    description: "Two large arcs curving toward each other, nearly encircling a bright center dot — open arms around something precious.",
    prompt: `${BASE} Two large symmetrical curved arcs facing each other from opposite sides, concave inward, nearly encircling a small bright gold dot at center but with a deliberate gap at top, like open arms or parentheses embracing a precious point of light. Warm gold on deep charcoal. Minimal, geometric, balanced.`,
  },
  {
    id: 12,
    name: "the-vessel",
    description: "Two arcs meeting at a pointed base, opening upward — a chalice or cupped hands in offering.",
    prompt: `${BASE} Two symmetrical curved gold lines meeting at a pointed base and opening outward and upward, forming an elegant chalice or goblet outline shape. No fill inside — just the gold outlines on deep charcoal. Like a cup or cupped hands in offering. Clean line art, minimal, geometric.`,
  },
  {
    id: 13,
    name: "the-canopy",
    description: "A wide outer arc sheltering a smaller inner arc beneath it — like a tree canopy, or an arm around a shoulder.",
    prompt: `${BASE} Two concentric arcs, both opening upward — a larger outer arc spanning the full width, and a smaller inner arc centered beneath it — like a canopy and what shelters beneath it. Warm gold arcs on deep charcoal, the outer arc slightly brighter. Minimal, geometric, protecting.`,
  },
  {
    id: 14,
    name: "the-crescent",
    description: "Two arcs of different radii creating a precise gold crescent — a sliver of warmth visible through a door left ajar.",
    prompt: `${BASE} A geometric crescent shape formed by two arcs of slightly different radii sharing common endpoints, creating a clean golden sliver. The crescent is solid warm gold on very dark charcoal. Precise, minimal, like a geometric moon or a sliver of light through a door left ajar.`,
  },
  {
    id: 15,
    name: "the-double-flame",
    description: "Two arcs mirrored from a shared base point, tops spreading outward — two flames leaning apart, or open wings.",
    prompt: `${BASE} Two curved arcs mirrored symmetrically left and right from a shared base point (a small bright gold dot), their tops curving outward and away from each other — like two flames spreading, or open wings, or an open book. Warm gold arcs on deep charcoal. Symmetrical, expanding, elegant.`,
  },
  {
    id: 16,
    name: "the-horizon-rising",
    description: "A gold baseline with three arcs rising above it — three flames, or three people standing on shared ground.",
    prompt: `${BASE} A thin horizontal gold line (the baseline) with three identical half-circle arcs rising evenly above it — like three flames, three people, or three sails. All elements warm gold on deep charcoal. Clean, geometric, balanced, ascending.`,
  },
  {
    id: 17,
    name: "the-inverted-hearthstone",
    description: "The Hearthstone flipped — shared point at top, three arcs spreading downward like roots, or rain from a single cloud.",
    prompt: `${BASE} Three overlapping curved arcs arranged symmetrically, their tops meeting at a single bright shared point at the apex, their lower portions curving outward and downward — like roots spreading from a trunk, or light hanging from above, or three rivers from one source. Warm gold arcs on deep charcoal. Inverted flame aesthetic, grounding and spreading.`,
  },
  {
    id: 18,
    name: "the-leaf",
    description: "Two arcs of equal radius intersecting to create a perfect lens — a leaf, a flame, the shared space between two worlds.",
    prompt: `${BASE} Two curved arcs of equal radius intersecting to create a perfect vesica piscis lens shape — like a leaf or a flame. Just the two clean gold arcs on deep charcoal, no fill inside. The lens-shaped intersection is the focal point. Precise geometry, minimal, timeless.`,
  },
  {
    id: 19,
    name: "the-signet",
    description: "A circle formed by three overlapping arcs, each covering one-third — a membership seal, a ring in three parts.",
    prompt: `${BASE} A circular logo mark composed of three overlapping curved arcs that together complete a full circle, each arc covering one-third of the circumference. The three junction points are slightly emphasized. Warm gold on deep charcoal. Like a signet ring or wax seal divided into three membership sections. Clean, geometric, precise.`,
  },
  {
    id: 20,
    name: "the-seedling",
    description: "A single arc forming a curved stem with a teardrop leaf at its tip — one brave line, ultra-minimal.",
    prompt: `${BASE} A single continuous gold line forming a gentle curved stem that terminates at its top in a small teardrop or leaf shape — like a seedling emerging, or a candle flame on a thin stem. Ultra-minimal, one continuous line, warm gold on deep charcoal. Delicate but deliberate.`,
  },
  {
    id: 21,
    name: "the-gateway",
    description: "Two vertical arcs facing each other — the gap between them is the passage, the doorway, the invitation.",
    prompt: `${BASE} Two vertical curved arcs facing each other — concave inward — creating an open gateway shape between them. The space between the arcs is the passage. Both arcs are warm gold on deep charcoal. Like pillars of a gate, or two people facing each other, or a parenthesis surrounding empty space.`,
  },
  {
    id: 22,
    name: "the-ripple",
    description: "Three half-circle arcs radiating from one center point — ripples from a stone dropped in still water.",
    prompt: `${BASE} Three concentric half-circle arcs all sharing the same center point at the bottom of the composition, each one progressively larger — like ripples in water or sound waves radiating outward. Only the upper half-circles are shown. Warm gold arcs on deep charcoal. Radiating, expanding, calm.`,
  },
  {
    id: 23,
    name: "the-orbit",
    description: "A bright central dot with a sweeping elliptical arc around it — an incomplete orbit, always returning.",
    prompt: `${BASE} A small bright gold dot at center with a single elliptical arc sweeping around it, the arc stopping before completing a full circuit — a deliberate gap. The arc suggests motion, orbit, return. Warm gold on deep charcoal. Minimal, dynamic, like a planet's path or a comet's approach.`,
  },
  {
    id: 24,
    name: "the-parenthesis",
    description: "Two arcs far apart, wide dark space between them — the mark IS the space they hold.",
    prompt: `${BASE} Two matching curved arcs positioned far apart on opposite sides of the composition, both concave and facing inward — like a wide pair of parentheses. The large dark charcoal space between them is deliberately prominent. Warm gold arcs on deep charcoal. The space between is the subject.`,
  },
  {
    id: 25,
    name: "the-triad-point",
    description: "Three arcs meeting at a single bright central point at 120° — three people touching hands at center.",
    prompt: `${BASE} Three curved arcs meeting at a single bright central point, extending outward at 120-degree angles — like a peace symbol without the circle, or three people touching hands at center. Each arc curves gently. The central meeting point is brighter gold. Warm gold on deep charcoal. Triadic, balanced, convergent.`,
  },
  {
    id: 26,
    name: "the-waxing-stack",
    description: "Three crescents of increasing size, nested concentrically — moon phases, building toward fullness.",
    prompt: `${BASE} Three crescent shapes of increasing size, concentrically stacked and slightly offset — each one a phase of waxing toward fullness — the smallest nested inside the medium, the medium nested inside the largest. Warm gold crescents on deep charcoal. Like moon phases or accumulated growth.`,
  },
  {
    id: 27,
    name: "the-comet-arc",
    description: "A single arc thicker at its leading edge, tapering to nothing — a comet, the moment before arrival.",
    prompt: `${BASE} A single sweeping arc that is thicker and brighter gold at its leading end and tapers to a fine point at its trailing end — like a comet, a brushstroke, or a conductor's arc at the peak of a stroke. Warm gold on deep charcoal. Suggests motion, direction, the moment before arrival.`,
  },
  {
    id: 28,
    name: "the-three-notes",
    description: "Three small arc shapes staggered diagonally — like musical notes floating, or three ideas hanging in the air.",
    prompt: `${BASE} Three small identical curved arc shapes (like musical note heads without stems), staggered diagonally from lower-left to upper-right, ascending. Like three musical notes or three ideas floating in air. Warm gold on deep charcoal. Light, playful, yet refined. Minimal and floating.`,
  },
  {
    id: 29,
    name: "the-triskelion",
    description: "Three arcs rotating from a shared center — a modern geometric triskelion, perpetual return.",
    prompt: `${BASE} Three identical curved arcs radiating from a shared central point and sweeping clockwise — like a modern geometric triskelion or triple spiral. Each arm is a single clean curve of equal weight. Warm gold on deep charcoal. Rotating, dynamic, suggesting perpetual return and renewal.`,
  },
  {
    id: 30,
    name: "the-aperture",
    description: "Six thin arcs in a circular aperture pattern — a camera iris opening, focus, letting only the right things in.",
    prompt: `${BASE} Six thin curved gold arcs arranged in a circular aperture or iris pattern — each arc overlapping slightly, inner ends meeting at center, outer ends at circumference. Like a camera aperture or eye iris. Warm gold on deep charcoal. Precise, geometric, suggesting focus and curated openness.`,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function generateLogo(concept: (typeof CONCEPTS)[0], ai: GoogleGenAI, index: number, total: number) {
  console.log(`\n[${index}/${total}] #${concept.id} ${concept.name}`);
  console.log(`  → ${concept.description}`);

  const result = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: concept.prompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  // Extract the image part from the response
  const parts = result.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: { inlineData?: { data?: string } }) => p.inlineData?.data);
  const imageBytes = imagePart?.inlineData?.data;

  if (!imageBytes) {
    console.error(`  ✗ No image returned for concept ${concept.id}. The prompt may have been filtered.`);
    console.error(`  → Try adjusting the prompt or running again.`);
    return false;
  }

  const filename = `${String(concept.id).padStart(2, "0")}-${concept.name}.png`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  const buffer = Buffer.from(imageBytes, "base64");
  fs.writeFileSync(outputPath, buffer);

  console.log(`  ✓ Saved → content/brand/gathering-place/logos/${filename}`);
  return true;
}

async function main() {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    console.error("\n✗ Missing GOOGLE_AI_STUDIO_API_KEY in .env.local");
    console.error("  Get yours free at: https://ai.google.dev");
    process.exit(1);
  }

  // Parse --id and --range flags
  const args = process.argv.slice(2);
  const requestedIds: number[] = [];
  let rangeMin = 0, rangeMax = 0;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--id" && args[i + 1]) {
      requestedIds.push(parseInt(args[i + 1], 10));
    }
    if (args[i] === "--range" && args[i + 1]) {
      const [a, b] = args[i + 1].split("-").map(Number);
      rangeMin = a; rangeMax = b;
    }
  }

  const concepts = requestedIds.length > 0
    ? CONCEPTS.filter((c) => requestedIds.includes(c.id))
    : rangeMin > 0
    ? CONCEPTS.filter((c) => c.id >= rangeMin && c.id <= rangeMax)
    : CONCEPTS;

  if (concepts.length === 0) {
    console.error(`✗ No matching concept IDs. Valid IDs are 1–30.`);
    process.exit(1);
  }

  console.log(`\nGenerating ${concepts.length} logo${concepts.length === 1 ? "" : "s"} for The Gathering Place`);
  console.log(`Output: content/brand/gathering-place/logos/`);
  console.log(`Model: gemini-3-pro-image-preview (Nano Banana Pro)`);

  const ai = new GoogleGenAI({ apiKey });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let success = 0;
  for (let i = 0; i < concepts.length; i++) {
    const concept = concepts[i];
    try {
      const ok = await generateLogo(concept, ai, i + 1, concepts.length);
      if (ok) success++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ Error generating concept ${concept.id}: ${message}`);
    }
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`Done. ${success}/${concepts.length} logos generated.`);
  if (success > 0) {
    console.log(`Open: content/brand/gathering-place/logos/`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
