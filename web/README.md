# The Gathering Place — Landing Page

This folder contains the source code for the landing page, built as a Next.js 15 App Router route.

The full running app lives inside `clearcareer-client-manager/packages/web/` — this folder is a copy of the route files for reference and portability.

## Files

- `page.tsx` — The full landing page (13 sections, all content, fire animation, real photos)
- `layout.tsx` — Minimal dark layout wrapper (sets bg color, metadata, prevents white flash)

## Tech Stack

- **Framework**: Next.js 15, App Router
- **Styling**: Tailwind CSS 3.4 (arbitrary values, inline style overrides)
- **Language**: TypeScript (client component — `"use client"` at top)
- **Fonts**: Inter via `next/font/google` (loaded in root layout)

## How to Run (inside clearcareer-client-manager)

```bash
cd clearcareer-client-manager
pnpm install
pnpm dev
# Navigate to http://localhost:3000/gathering-place
```

## Route Location

```
packages/web/src/app/gathering-place/
├── layout.tsx     # Dark wrapper, no dashboard nav
└── page.tsx       # Full landing page
```

## Hero Background

The hero uses a canvas-based fire simulation — a classic demoscene fire algorithm:
- Runs at 1/3 resolution, scaled up for natural softness
- Seeds bottom row with random heat values each frame
- Propagates heat upward with decay and random spread
- Color palette: transparent black → deep ember → amber gold → pale yellow-white
- Runs via `requestAnimationFrame`, cleaned up on unmount

## Images Used

All photos are free Unsplash CDN images, verified 200 OK:

| Section | Description | Unsplash ID |
|---|---|---|
| Drew Dudley portrait | His real photo from drewdudley.com | (direct URL from site) |
| Stage/speaker | Person in dramatic spotlight | `photo-1676063258992-1562bbecb583` |
| Grand library | Floor-to-ceiling shelves with ladder | `photo-1554906493-4812e307243d` |
| Condenser mic | Pro studio microphone, black bg | `photo-1485579149621-3123dd979885` |
| Forest Hill Toronto | Grand manor at dusk | `photo-1761767274100-b7bad43be8cf` |
| Toronto loft | Moody exposed-brick creative space | `photo-1700402889708-6090a296ad42` |
| Kawarthas | Wooden dock on Ontario lake | `photo-1629872874038-b1d600221640` |
| The Icon, Toronto | Dimly lit cocktail lounge, chandelier | `photo-1693520016313-e129d398a467` |
| Barbados | Tropical ocean-view villa | `photo-1762254794468-1fb6fa893f73` |
| Cape Breton | Dramatic Atlantic coastal cliffs | `photo-1755026420799-7d476a5d5ae8` |

## Drew's Photo Source

`https://www.drewdudley.com/wp-content/uploads/2021/10/Drew_Home_Page_2.jpg`

Note: This is sourced from Drew's own website. When real branded photography is produced, swap this URL.

## Form / CTA

The "Start the Conversation" button is a `mailto:` link — no backend required:
```
mailto:drew@dayoneleadership.com?subject=The%20Gathering%20Place%20%E2%80%94%20Expression%20of%20Interest
```

When the site goes live with real form handling, this should be replaced with a proper form submission (e.g., Resend, Formspree, or a custom API route).

## Color Palette

| Token | Value | Usage |
|---|---|---|
| Background | `#0c0a08` | Page base |
| Surface | `#161210` | Cards |
| Surface alt | `#111009` | Alternate sections |
| Border | `#2e2822` | Dividers, card outlines |
| Primary text | `#f0ebe2` | Headings |
| Muted text | `#9a8f82` | Body, secondary |
| Accent (amber) | `#c4922a` | CTAs, labels, highlights |
| Accent hover | `#d4a85a` | Button hover state |
| Ember | `#7c3d1a` | Fire tones, background sections |
