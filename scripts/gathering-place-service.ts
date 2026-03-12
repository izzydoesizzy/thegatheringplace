import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { getMonorepoRoot } from "../db/index.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GatheringPlaceLocation {
  id: string;
  name: string;
  region: string;
  period: string;
  status: "pilot" | "upcoming" | "future";
  notes: string;
}

export interface GatheringPlaceResult {
  pdfPath: string;
  markdownPath: string;
}

// ── Data Loading ──────────────────────────────────────────────────────────────

function loadLocations(): GatheringPlaceLocation[] {
  const p = join(getMonorepoRoot(), "content", "gathering-place", "locations.json");
  return JSON.parse(readFileSync(p, "utf-8")) as GatheringPlaceLocation[];
}

function loadPrinciples(): string {
  const p = join(getMonorepoRoot(), "content", "gathering-place", "principles.md");
  return readFileSync(p, "utf-8");
}

function loadBenefits(): string {
  const p = join(getMonorepoRoot(), "content", "gathering-place", "membership-benefits.md");
  return readFileSync(p, "utf-8");
}

function getOutputDir(): string {
  const dir = join(getMonorepoRoot(), "data", "clients", "drew-dudley", "deliverables", "reports");
  mkdirSync(dir, { recursive: true });
  return dir;
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const GP_CSS = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

@page {
  size: A4;
  margin: 0;
}

body {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 13px;
  line-height: 1.7;
  color: #f0ebe2;
  background: #0c0a08;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Cover Page ─────────────────────────────────────────────────────────────── */

.cover-page {
  background: #0c0a08;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 80px;
  page-break-after: always;
}

.cover-emblem {
  font-size: 11px;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: #c4922a;
  margin-bottom: 48px;
}

.cover-title {
  font-size: 42px;
  font-weight: normal;
  letter-spacing: 3px;
  color: #f0ebe2;
  margin-bottom: 16px;
  line-height: 1.2;
}

.cover-tagline {
  font-size: 16px;
  color: #9a8f82;
  font-style: italic;
  margin-bottom: 64px;
  max-width: 420px;
}

.cover-rule {
  width: 60px;
  height: 1px;
  background: #c4922a;
  margin: 0 auto 64px;
}

.cover-footer {
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #6b615a;
}

/* ── Page Header ────────────────────────────────────────────────────────────── */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 20px 0;
  margin-bottom: 32px;
  border-bottom: 1px solid #2a2420;
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #6b615a;
}

.page-header-brand {
  color: #c4922a;
}

/* ── Section Pages ──────────────────────────────────────────────────────────── */

.section-page {
  background: #0c0a08;
  padding: 48px 64px;
  min-height: 100vh;
  page-break-after: always;
}

.section-page:last-child {
  page-break-after: auto;
}

/* ── Typography ─────────────────────────────────────────────────────────────── */

h1 {
  font-size: 28px;
  font-weight: normal;
  letter-spacing: 2px;
  color: #f0ebe2;
  margin-bottom: 8px;
  line-height: 1.3;
}

h2 {
  font-size: 20px;
  font-weight: normal;
  letter-spacing: 1px;
  color: #f0ebe2;
  margin: 32px 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #2a2420;
}

h3 {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #c4922a;
  margin: 24px 0 8px;
}

p {
  margin: 10px 0;
  color: #d4cfc8;
}

strong {
  color: #f0ebe2;
  font-weight: 600;
}

em {
  color: #9a8f82;
  font-style: italic;
}

a {
  color: #c4922a;
  text-decoration: none;
}

ul, ol {
  padding-left: 20px;
  margin: 10px 0;
}

li {
  margin: 6px 0;
  color: #d4cfc8;
  page-break-inside: avoid;
}

blockquote {
  border-left: 2px solid #c4922a;
  margin: 24px 0;
  padding: 12px 24px;
  background: #12100d;
}

blockquote p {
  font-size: 15px;
  font-style: italic;
  color: #d4cfc8;
  line-height: 1.8;
  margin: 0;
}

hr {
  border: none;
  border-top: 1px solid #2a2420;
  margin: 28px 0;
}

/* ── Section Label ──────────────────────────────────────────────────────────── */

.section-label {
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #c4922a;
  margin-bottom: 12px;
}

.section-title {
  font-size: 26px;
  font-weight: normal;
  letter-spacing: 1px;
  color: #f0ebe2;
  margin-bottom: 32px;
  line-height: 1.3;
}

/* ── What It Is / What It Isn't contrast block ──────────────────────────────── */

.contrast-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  margin: 24px 0;
  border: 1px solid #2a2420;
}

.contrast-col {
  padding: 24px 28px;
}

.contrast-col:first-child {
  border-right: 1px solid #2a2420;
}

.contrast-col-label {
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.contrast-col-label.is {
  color: #c4922a;
}

.contrast-col-label.isnt {
  color: #6b615a;
}

.contrast-col ul {
  list-style: none;
  padding: 0;
}

.contrast-col ul li {
  padding: 8px 0;
  border-bottom: 1px solid #1a1714;
  font-size: 13px;
}

.contrast-col ul li:last-child {
  border-bottom: none;
}

.is-item {
  color: #d4cfc8;
}

.isnt-item {
  color: #6b615a;
  text-decoration: line-through;
  text-decoration-color: #3a3330;
}

/* ── Location Timeline ──────────────────────────────────────────────────────── */

.location-list {
  margin: 24px 0;
}

.location-item {
  display: flex;
  gap: 24px;
  margin-bottom: 28px;
  page-break-inside: avoid;
}

.location-period {
  flex: 0 0 160px;
  font-size: 11px;
  letter-spacing: 1px;
  color: #9a8f82;
  padding-top: 2px;
  font-style: italic;
}

.location-content {
  flex: 1;
  border-left: 2px solid #2a2420;
  padding-left: 20px;
}

.location-content.pilot {
  border-left-color: #c4922a;
}

.location-name {
  font-size: 15px;
  color: #f0ebe2;
  margin-bottom: 4px;
}

.location-region {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #6b615a;
  margin-bottom: 8px;
}

.location-note {
  font-size: 12px;
  color: #9a8f82;
  font-style: italic;
  line-height: 1.6;
}

/* ── Benefits Grid ──────────────────────────────────────────────────────────── */

.benefit-item {
  padding: 20px 0;
  border-bottom: 1px solid #1a1714;
  page-break-inside: avoid;
}

.benefit-item:last-child {
  border-bottom: none;
}

.benefit-name {
  font-size: 13px;
  font-weight: 600;
  color: #c4922a;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.benefit-desc {
  font-size: 12px;
  color: #9a8f82;
  line-height: 1.7;
}

/* ── Green Room Callout ─────────────────────────────────────────────────────── */

.green-room-block {
  border: 1px solid #3a3020;
  background: #0f0d0a;
  padding: 32px 36px;
  margin: 32px 0;
}

.green-room-label {
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #8fa88a;
  margin-bottom: 8px;
}

.green-room-title {
  font-size: 20px;
  color: #f0ebe2;
  margin-bottom: 16px;
}

.green-room-body {
  font-size: 13px;
  color: #9a8f82;
  line-height: 1.8;
}

/* ── Founding Cohort ────────────────────────────────────────────────────────── */

.pricing-block {
  background: #12100d;
  border: 1px solid #2a2420;
  padding: 32px 36px;
  margin: 32px 0;
  text-align: center;
}

.pricing-amount {
  font-size: 36px;
  color: #c4922a;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.pricing-period {
  font-size: 12px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #6b615a;
  margin-bottom: 24px;
}

.pricing-sub {
  font-size: 12px;
  color: #9a8f82;
  font-style: italic;
}

/* ── Checklist ──────────────────────────────────────────────────────────────── */

.checklist {
  list-style: none;
  padding: 0;
  margin: 20px 0;
}

.checklist li {
  padding: 12px 0 12px 28px;
  border-bottom: 1px solid #1a1714;
  position: relative;
  font-size: 13px;
  color: #d4cfc8;
}

.checklist li:last-child {
  border-bottom: none;
}

.checklist li::before {
  content: "—";
  position: absolute;
  left: 0;
  color: #c4922a;
}

/* ── CTA Block ──────────────────────────────────────────────────────────────── */

.cta-block {
  text-align: center;
  padding: 48px 32px;
  border: 1px solid #2a2420;
  margin: 32px 0;
}

.cta-heading {
  font-size: 22px;
  color: #f0ebe2;
  margin-bottom: 12px;
  font-weight: normal;
}

.cta-sub {
  font-size: 13px;
  color: #9a8f82;
  margin-bottom: 28px;
  font-style: italic;
}

.cta-email {
  font-size: 15px;
  color: #c4922a;
  letter-spacing: 1px;
}

/* ── Culture Principle ──────────────────────────────────────────────────────── */

.principle-item {
  padding: 20px 0;
  border-bottom: 1px solid #1a1714;
  page-break-inside: avoid;
}

.principle-item:last-child {
  border-bottom: none;
}

.principle-name {
  font-size: 14px;
  color: #f0ebe2;
  font-weight: 600;
  margin-bottom: 6px;
}

.principle-body {
  font-size: 12px;
  color: #9a8f82;
  line-height: 1.7;
}

/* ── Am I Crazy Block ───────────────────────────────────────────────────────── */

.am-i-crazy-block {
  background: #0f0d0a;
  border-left: 3px solid #c4922a;
  padding: 20px 24px;
  margin: 24px 0;
}

.am-i-crazy-label {
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #c4922a;
  margin-bottom: 8px;
}

.am-i-crazy-body {
  font-size: 13px;
  color: #9a8f82;
  line-height: 1.7;
}

/* ── Welcome Letter ─────────────────────────────────────────────────────────── */

.welcome-letter {
  max-width: 520px;
  margin: 0 auto;
}

.welcome-salutation {
  font-size: 16px;
  color: #f0ebe2;
  margin-bottom: 20px;
}

.welcome-body p {
  font-size: 14px;
  color: #d4cfc8;
  line-height: 1.9;
  margin-bottom: 16px;
}

.welcome-sign {
  margin-top: 40px;
  font-size: 13px;
  color: #9a8f82;
}

.welcome-name {
  font-size: 15px;
  color: #f0ebe2;
  margin-top: 8px;
}

/* ── Calendar Table ─────────────────────────────────────────────────────────── */

table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  font-size: 12px;
}

th {
  background: #12100d;
  color: #c4922a;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: normal;
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #2a2420;
}

td {
  padding: 12px 14px;
  border-bottom: 1px solid #1a1714;
  color: #d4cfc8;
  background: #0c0a08;
  vertical-align: top;
}

tr:last-child td {
  border-bottom: none;
}

/* ── Teaser-specific ────────────────────────────────────────────────────────── */

.teaser-hero {
  background: #0c0a08;
  padding: 48px 64px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  page-break-after: always;
}

.teaser-back {
  background: #0f0d0a;
  padding: 48px 64px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.teaser-locations-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin: 20px 0;
}

.teaser-location-pill {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #9a8f82;
  border: 1px solid #2a2420;
  padding: 6px 14px;
}
`;

// ── Light Theme CSS ───────────────────────────────────────────────────────────

const GP_CSS_LIGHT = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

@page {
  size: A4;
  margin: 0;
}

body {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 13px;
  line-height: 1.7;
  color: #1c1916;
  background: #fdfcfa;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Cover Page ─────────────────────────────────────────────────────────────── */

.cover-page {
  background: #1c1916;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 80px;
  page-break-after: always;
}

.cover-emblem {
  font-size: 11px;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: #c4922a;
  margin-bottom: 48px;
}

.cover-title {
  font-size: 42px;
  font-weight: normal;
  letter-spacing: 3px;
  color: #fdfcfa;
  margin-bottom: 16px;
  line-height: 1.2;
}

.cover-tagline {
  font-size: 16px;
  color: #9a8f82;
  font-style: italic;
  margin-bottom: 64px;
  max-width: 420px;
}

.cover-rule {
  width: 60px;
  height: 1px;
  background: #c4922a;
  margin: 0 auto 64px;
}

.cover-footer {
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #6b6158;
}

/* ── Page Header ────────────────────────────────────────────────────────────── */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 20px 0;
  margin-bottom: 32px;
  border-bottom: 1px solid #e0dbd4;
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #9a8f82;
}

.page-header-brand {
  color: #b8841f;
}

/* ── Section Pages ──────────────────────────────────────────────────────────── */

.section-page {
  background: #fdfcfa;
  padding: 48px 64px;
  min-height: 100vh;
  page-break-after: always;
}

.section-page:last-child {
  page-break-after: auto;
}

/* ── Typography ─────────────────────────────────────────────────────────────── */

h1 {
  font-size: 28px;
  font-weight: normal;
  letter-spacing: 2px;
  color: #1c1916;
  margin-bottom: 8px;
  line-height: 1.3;
}

h2 {
  font-size: 20px;
  font-weight: normal;
  letter-spacing: 1px;
  color: #1c1916;
  margin: 32px 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e0dbd4;
}

h3 {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #b8841f;
  margin: 24px 0 8px;
}

p {
  margin: 10px 0;
  color: #3a3530;
}

strong {
  color: #1c1916;
  font-weight: 600;
}

em {
  color: #6b6158;
  font-style: italic;
}

a {
  color: #b8841f;
  text-decoration: none;
}

ul, ol {
  padding-left: 20px;
  margin: 10px 0;
}

li {
  margin: 6px 0;
  color: #3a3530;
  page-break-inside: avoid;
}

blockquote {
  border-left: 2px solid #b8841f;
  margin: 24px 0;
  padding: 12px 24px;
  background: #f5f0e8;
}

blockquote p {
  font-size: 15px;
  font-style: italic;
  color: #4a4540;
  line-height: 1.8;
  margin: 0;
}

hr {
  border: none;
  border-top: 1px solid #e0dbd4;
  margin: 28px 0;
}

/* ── Section Label ──────────────────────────────────────────────────────────── */

.section-label {
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #b8841f;
  margin-bottom: 12px;
}

.section-title {
  font-size: 26px;
  font-weight: normal;
  letter-spacing: 1px;
  color: #1c1916;
  margin-bottom: 32px;
  line-height: 1.3;
}

/* ── What It Is contrast block ──────────────────────────────────────────────── */

.contrast-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  margin: 24px 0;
  border: 1px solid #e0dbd4;
}

.contrast-col {
  padding: 24px 28px;
}

.contrast-col:first-child {
  border-right: 1px solid #e0dbd4;
}

.contrast-col-label {
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.contrast-col-label.is {
  color: #b8841f;
}

.contrast-col-label.isnt {
  color: #b0a89e;
}

.contrast-col ul {
  list-style: none;
  padding: 0;
}

.contrast-col ul li {
  padding: 8px 0;
  border-bottom: 1px solid #f0ebe4;
  font-size: 13px;
}

.contrast-col ul li:last-child {
  border-bottom: none;
}

.is-item {
  color: #3a3530;
}

.isnt-item {
  color: #b0a89e;
  text-decoration: line-through;
  text-decoration-color: #d0cbc4;
}

/* ── Location Timeline ──────────────────────────────────────────────────────── */

.location-list {
  margin: 24px 0;
}

.location-item {
  display: flex;
  gap: 24px;
  margin-bottom: 28px;
  page-break-inside: avoid;
}

.location-period {
  flex: 0 0 160px;
  font-size: 11px;
  letter-spacing: 1px;
  color: #9a8f82;
  padding-top: 2px;
  font-style: italic;
}

.location-content {
  flex: 1;
  border-left: 2px solid #e0dbd4;
  padding-left: 20px;
}

.location-content.pilot {
  border-left-color: #b8841f;
}

.location-name {
  font-size: 15px;
  color: #1c1916;
  margin-bottom: 4px;
}

.location-region {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #9a8f82;
  margin-bottom: 8px;
}

.location-note {
  font-size: 12px;
  color: #6b6158;
  font-style: italic;
  line-height: 1.6;
}

/* ── Benefits ───────────────────────────────────────────────────────────────── */

.benefit-item {
  padding: 20px 0;
  border-bottom: 1px solid #f0ebe4;
  page-break-inside: avoid;
}

.benefit-item:last-child {
  border-bottom: none;
}

.benefit-name {
  font-size: 13px;
  font-weight: 600;
  color: #b8841f;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.benefit-desc {
  font-size: 12px;
  color: #6b6158;
  line-height: 1.7;
}

/* ── Green Room Callout ─────────────────────────────────────────────────────── */

.green-room-block {
  border: 1px solid #d8d0c4;
  background: #f5f0e8;
  padding: 32px 36px;
  margin: 32px 0;
}

.green-room-label {
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #7a9e7e;
  margin-bottom: 8px;
}

.green-room-title {
  font-size: 20px;
  color: #1c1916;
  margin-bottom: 16px;
}

.green-room-body {
  font-size: 13px;
  color: #6b6158;
  line-height: 1.8;
}

/* ── Founding Cohort ────────────────────────────────────────────────────────── */

.pricing-block {
  background: #f5f0e8;
  border: 1px solid #d8d0c4;
  padding: 32px 36px;
  margin: 32px 0;
  text-align: center;
}

.pricing-amount {
  font-size: 36px;
  color: #b8841f;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.pricing-period {
  font-size: 12px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #9a8f82;
  margin-bottom: 24px;
}

.pricing-sub {
  font-size: 12px;
  color: #6b6158;
  font-style: italic;
}

/* ── Checklist ──────────────────────────────────────────────────────────────── */

.checklist {
  list-style: none;
  padding: 0;
  margin: 20px 0;
}

.checklist li {
  padding: 12px 0 12px 28px;
  border-bottom: 1px solid #f0ebe4;
  position: relative;
  font-size: 13px;
  color: #3a3530;
}

.checklist li:last-child {
  border-bottom: none;
}

.checklist li::before {
  content: "—";
  position: absolute;
  left: 0;
  color: #b8841f;
}

/* ── CTA Block ──────────────────────────────────────────────────────────────── */

.cta-block {
  text-align: center;
  padding: 48px 32px;
  border: 1px solid #e0dbd4;
  margin: 32px 0;
}

.cta-heading {
  font-size: 22px;
  color: #1c1916;
  margin-bottom: 12px;
  font-weight: normal;
}

.cta-sub {
  font-size: 13px;
  color: #6b6158;
  margin-bottom: 28px;
  font-style: italic;
}

.cta-email {
  font-size: 15px;
  color: #b8841f;
  letter-spacing: 1px;
}

/* ── Culture Principle ──────────────────────────────────────────────────────── */

.principle-item {
  padding: 20px 0;
  border-bottom: 1px solid #f0ebe4;
  page-break-inside: avoid;
}

.principle-item:last-child {
  border-bottom: none;
}

.principle-name {
  font-size: 14px;
  color: #1c1916;
  font-weight: 600;
  margin-bottom: 6px;
}

.principle-body {
  font-size: 12px;
  color: #6b6158;
  line-height: 1.7;
}

/* ── Am I Crazy Block ───────────────────────────────────────────────────────── */

.am-i-crazy-block {
  background: #f5f0e8;
  border-left: 3px solid #b8841f;
  padding: 20px 24px;
  margin: 24px 0;
}

.am-i-crazy-label {
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #b8841f;
  margin-bottom: 8px;
}

.am-i-crazy-body {
  font-size: 13px;
  color: #6b6158;
  line-height: 1.7;
}

/* ── Welcome Letter ─────────────────────────────────────────────────────────── */

.welcome-letter {
  max-width: 520px;
  margin: 0 auto;
}

.welcome-salutation {
  font-size: 16px;
  color: #1c1916;
  margin-bottom: 20px;
}

.welcome-body p {
  font-size: 14px;
  color: #3a3530;
  line-height: 1.9;
  margin-bottom: 16px;
}

.welcome-sign {
  margin-top: 40px;
  font-size: 13px;
  color: #6b6158;
}

.welcome-name {
  font-size: 15px;
  color: #1c1916;
  margin-top: 8px;
}

/* ── Calendar Table ─────────────────────────────────────────────────────────── */

table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  font-size: 12px;
}

th {
  background: #f5f0e8;
  color: #b8841f;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: normal;
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #d8d0c4;
}

td {
  padding: 12px 14px;
  border-bottom: 1px solid #f0ebe4;
  color: #3a3530;
  background: #fdfcfa;
  vertical-align: top;
}

tr:last-child td {
  border-bottom: none;
}

/* ── Teaser-specific ────────────────────────────────────────────────────────── */

.teaser-hero {
  background: #fdfcfa;
  padding: 48px 64px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  page-break-after: always;
}

.teaser-back {
  background: #f5f0e8;
  padding: 48px 64px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.teaser-locations-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin: 20px 0;
}

.teaser-location-pill {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #6b6158;
  border: 1px solid #d8d0c4;
  padding: 6px 14px;
}
`;

// ── Module Builders ───────────────────────────────────────────────────────────

function coverPage(title: string, tagline: string, subtitle?: string): string {
  return `<div class="cover-page">
<div class="cover-emblem">The Gathering Place</div>
<div class="cover-title">${title}</div>
<div class="cover-tagline">${tagline}</div>
<div class="cover-rule"></div>
${subtitle ? `<div class="cover-footer">${subtitle}</div>` : ""}
</div>`;
}

function pageHeader(section: string): string {
  return `<div class="page-header">
<span class="page-header-brand">The Gathering Place</span>
<span>${section}</span>
</div>`;
}

function buildOriginSection(): string {
  return `<div class="section-page">
${pageHeader("The Origin")}

<div class="section-label">Where This Came From</div>
<div class="section-title">Twenty Years on Stage, and a Question He Kept Asking</div>

<p>Drew Dudley has given more than 1,000 speeches over twenty years. Fifteen years with the same company. A career built on showing up in rooms and being exactly what those rooms needed him to be.</p>

<p>At some point, the rooms started to feel the same.</p>

<blockquote><p>"I realized my brain hadn't said 'oh, that's interesting' about being on stage in a while."</p></blockquote>

<p>The realization wasn't that speaking was the wrong career. It was that he'd spent twenty years building a brand that was entirely dependent on him — on his presence, his energy, his willingness to show up and perform. And there was almost nowhere in that career where he could stop performing.</p>

<p>When he sat down to design what his ideal life actually looked like, the answer kept coming back to the same image: gathered around a fire with people he found genuinely interesting. No agenda. No performance pressure. Just people who could sit in a room together, go quiet when they needed to, and pick up a conversation at 2am if the energy was right.</p>

<p>The Gathering Place is that image turned into a business.</p>

<blockquote><p>"Can I create a place where people feel safer and freer to be their sort of weirder creative selves? Creatives who are business people can't be weird offstage. We have to be what they want — and then sometimes it's hard to separate the two. I want to build a place where you don't have to explain it."</p></blockquote>

</div>`;
}

function buildWhatItIsSection(): string {
  return `<div class="section-page">
${pageHeader("What It Is")}

<div class="section-label">A Private Creative Club</div>
<div class="section-title">Not a Conference. Not a Mastermind. Not an Event.</div>

<div class="contrast-grid">
<div class="contrast-col">
<div class="contrast-col-label is">What it is</div>
<ul>
<li class="is-item">A physical, membership-based space</li>
<li class="is-item">A rotating set of high-end properties</li>
<li class="is-item">A small, hand-picked community of creatives</li>
<li class="is-item">A place to think, work, and be around people who get it</li>
<li class="is-item">Unstructured enough that real things can happen</li>
<li class="is-item">Curated enough that nobody wastes anyone's time</li>
</ul>
</div>
<div class="contrast-col">
<div class="contrast-col-label isnt">What it isn't</div>
<ul>
<li class="isnt-item">A conference</li>
<li class="isnt-item">A mastermind group</li>
<li class="isnt-item">A co-working space</li>
<li class="isnt-item">An event series</li>
<li class="isnt-item">A structured curriculum</li>
<li class="isnt-item">A networking club</li>
</ul>
</div>
</div>

<p>The closest analogy Drew offered: "a year-long conference drop-in, entirely run by your energy."</p>

<p>Members are hand-picked. The founding cohort is people Drew has had 2.5-hour first calls with — the kind of people where you don't have to explain yourself. They already get it.</p>

<p>The Gathering Place is also a brand play. Drew has spent twenty years building the "Drew Dudley" brand — but that brand is dependent on his personal labor and presence. The Gathering Place is designed to be scalable. An organic community that can grow, be handed off, and outlast him.</p>

</div>`;
}

function buildCultureSection(): string {
  return `<div class="section-page">
${pageHeader("The Culture")}

<div class="section-label">How We Are Together</div>
<div class="section-title">Not Rules. A Culture.</div>

<p>Smart, excited, talky people are bad at listening to each other. These principles exist to slow the room down enough for something real to happen.</p>

<div class="principle-item">
<div class="principle-name">No performance required.</div>
<div class="principle-body">You don't have to be "on." Nobody here needs you to be impressive. Leave the stage persona at the door. That's the whole point.</div>
</div>

<div class="principle-item">
<div class="principle-name">Pause before answering.</div>
<div class="principle-body">A beat of reflection before speaking. It sounds small. It changes everything — you'll find yourself saying things you actually mean instead of things you've already rehearsed.</div>
</div>

<div class="principle-item">
<div class="principle-name">Ask more than you answer.</div>
<div class="principle-body">The most interesting people in any room are the ones who want to know more than they want to be known.</div>
</div>

<div class="principle-item">
<div class="principle-name">Don't speak for more than 90 seconds straight before 5pm.</div>
<div class="principle-body">A cultural nudge, not a rule. Talky people can fill every room. This slows things down enough for something unexpected to surface.</div>
</div>

<div class="am-i-crazy-block">
<div class="am-i-crazy-label">The "Am I Crazy" Room</div>
<div class="am-i-crazy-body">Every location has a designated space — a chair, a corner, a spot by the fire. If someone is in it, it means one thing: <em>I have an idea I want someone to hear.</em> You don't get to spew your ideas at people. But if you're in the chair, anyone can come sit across from you — and if you do, you're agreeing to listen first and react second. Nobody gets ambushed. Nobody wanders in by accident.</div>
</div>

<p>By the fire, none of the above applies. You can just be.</p>

</div>`;
}

function buildLocationsSection(locations: GatheringPlaceLocation[]): string {
  const locationItems = locations
    .map(
      (loc) => `
<div class="location-item">
<div class="location-period">${loc.period}</div>
<div class="location-content ${loc.status === "pilot" ? "pilot" : ""}">
<div class="location-name">${loc.name}</div>
<div class="location-region">${loc.region}</div>
<div class="location-note">${loc.notes}</div>
</div>
</div>`
    )
    .join("\n");

  return `<div class="section-page">
${pageHeader("Where We'll Be")}

<div class="section-label">2026 – 2027</div>
<div class="section-title">The Locations</div>

<p>The Gathering Place is a beta program. The first year is Drew proving the concept, stress-testing the model, and building the founding cohort. Locations rotate throughout the year — from a Toronto base to a cottage in the Kawarthas, a winter residency in Barbados, and eventually a permanent inner-circle home in Cape Breton overlooking the ocean.</p>

<div class="location-list">
${locationItems}
</div>

</div>`;
}

function buildBenefitsSection(): string {
  return `<div class="section-page">
${pageHeader("What Membership Includes")}

<div class="section-label">Your Membership</div>
<div class="section-title">What You Get</div>

<div class="benefit-item">
<div class="benefit-name">Physical Access to the Space</div>
<div class="benefit-desc">Stay at any of the rotating properties. Book a room, use it as an office, host client meetings in the space. Having access to a beautiful, distraction-free environment outside your home or office is worth the cost of membership for a lot of people on its own.</div>
</div>

<div class="benefit-item">
<div class="benefit-name">Professional Video Studio</div>
<div class="benefit-desc">An on-site, professionally managed studio is included at every location — lighting, sound, setup handled. Keynotes, presentations, social content, course material. No more booking studios in random cities or filming on your phone.</div>
</div>

<div class="benefit-item">
<div class="benefit-name">Social Media Production</div>
<div class="benefit-desc">Content creation is built into the studio partnership. Members who want finished social content — not just raw footage — have access to production support as part of their membership. Show up with ideas; leave with posts.</div>
</div>

<div class="benefit-item">
<div class="benefit-name">Run Your Own Retreats</div>
<div class="benefit-desc">Bring up to 3 guests for your own programs, workshops, or retreats — and charge those guests directly. If you run a $2,000/head retreat with 3 people, you've covered your monthly membership fee in a single visit. The space becomes a revenue tool.</div>
</div>

<div class="benefit-item">
<div class="benefit-name">Drew</div>
<div class="benefit-desc">He will be there. Not on a schedule. Not delivering a curriculum. But available for speaker coaching, idea-bouncing, and fire-side conversations with someone who's done 1,000 of these. You have to come to him. Members who do tend to get a lot out of it.</div>
</div>

<div class="benefit-item">
<div class="benefit-name">5 Questions on Camera Each Visit</div>
<div class="benefit-desc">Brief, thoughtful answers that become part of The Gathering Place's social content. Members know this going in — it's built into the culture, not a transaction. Everybody contributes a little to the thing that makes the room worth being in.</div>
</div>

</div>`;
}

function buildGreenRoomSection(): string {
  return `<div class="section-page">
${pageHeader("The Green Room")}

<div class="section-label">Sub-Brand</div>
<div class="section-title">The Green Room at The Gathering Place</div>

<p>The Gathering Place is open to speakers, coaches, writers, designers, and other creative professionals. But there is an inner track — built specifically for professional speakers.</p>

<div class="green-room-block">
<div class="green-room-label">The Green Room</div>
<div class="green-room-title">For Professional Speakers</div>
<div class="green-room-body">The Green Room is the beating heart of the club — the reason it exists. It carries the same visual identity as The Gathering Place, with a distinguishing mark, the way a military unit wears a badge on the parent insignia.<br><br>It is not publicly advertised. Drew's goal is for it to be so good it develops a waitlist purely by word of mouth.<br><br>The Green Room is for people who've stood on enough stages to know what the green room actually feels like — and who want a place that brings that feeling into the rest of their lives.</div>
</div>

<p>If The Gathering Place is for creatives who are done performing, The Green Room is for the people who built their whole career performing — and need the deepest version of the permission to stop.</p>

</div>`;
}

function buildFoundingCohortSection(): string {
  return `<div class="section-page">
${pageHeader("The Founding Cohort")}

<div class="section-label">Membership</div>
<div class="section-title">The Founding Cohort</div>

<p>The founding cohort is 8 to 12 people. Hand-picked. Drew is not filling seats — he's curating a room he wants to live in. If only 8 members join, the other 4 seats sit empty until the right person appears.</p>

<div class="pricing-block">
<div class="pricing-amount">$2,500</div>
<div class="pricing-period">per month · ~$30,000 / year</div>
<div class="pricing-sub">Terms are completely flexible. Drew has floated $500/month for the right person. He's building this to be extraordinary, not to maximize revenue in year one.</div>
</div>

<p>The pitch Drew makes to everyone: <em>"Could you generate $20,000–$25,000 in new business or revenue over the year if you had access to a world-class space, a professional studio, and a room full of people at this level?"</em></p>

<p>Most people he asks that question to say yes immediately.</p>

<p>Break-even is 6 members. The model is financially sustainable from there. Everything beyond that is investment back into the spaces, the studio, and the experience.</p>

<p>Drew's framing: <em>"It's like you put 12 people together and take $100,000 and put it into their careers. You want to see what I can do with that? Just watch."</em></p>

</div>`;
}

function buildIsThisForYouSection(): string {
  return `<div class="section-page">
${pageHeader("Is This For You?")}

<div class="section-label">Self-Selection</div>
<div class="section-title">Is This For You?</div>

<p>The Gathering Place is not for everyone. It doesn't need to be. It needs to be exactly right for a small number of people.</p>

<ul class="checklist">
<li>You're a speaker, coach, writer, designer, or other creative professional who has built something real — and you're ready to be around people at that level.</li>
<li>You spend a lot of energy showing up the way other people need you to show up. You're ready for a room where you don't have to.</li>
<li>You do your best thinking in conversation, not in isolation — and you're surrounded by people who can't quite keep up with you.</li>
<li>You've thought about running your own retreats, intensives, or programs but haven't had the space or infrastructure to do it properly.</li>
<li>You want to leave every visit with usable content — keynote footage, social content, something you can actually put to work.</li>
</ul>

<div class="cta-block">
<div class="cta-heading">Request an Invitation</div>
<div class="cta-sub">Membership is by invitation only. If this is landing with you, reach out directly.</div>
<div class="cta-email">drew@dayoneleadership.com</div>
</div>

</div>`;
}

// ── Welcome Package Sections ──────────────────────────────────────────────────

function buildWelcomeLetter(): string {
  return `<div class="section-page">
${pageHeader("Welcome")}

<div class="welcome-letter">
<div class="welcome-salutation">Welcome to The Gathering Place.</div>
<div class="welcome-body">

<p>You're in.</p>

<p>I know that sounds simple. But I've been thinking about this for a long time, and I don't say it lightly. You're not just a member of a club. You're part of the founding cohort — the people who will shape what this becomes before it becomes anything public. That matters to me.</p>

<p>Here's what I want you to know going in: there's no curriculum here. No weekly accountability check-in, no scorecards, no structured agenda. What there is: a space designed to make you better just by being in it. People who operate at a level where you won't want to waste their time. A studio to capture whatever you're building. And me, when you want me.</p>

<p>The rest of this welcome package covers the practical details — the location calendar, how the studio works, the culture principles, and how to reach me. Read it at your own pace.</p>

<p>The only thing I'll ask is this: show up. Not to perform. Just to be there. The room will do the rest.</p>

<p>I'll see you soon.</p>

</div>
<div class="welcome-sign">With genuine excitement,</div>
<div class="welcome-name">Drew Dudley</div>
</div>

</div>`;
}

function buildWhatsNextSection(): string {
  return `<div class="section-page">
${pageHeader("What's Next")}

<div class="section-label">You're In</div>
<div class="section-title">What Happens Now</div>

<h3>Your First Visit</h3>
<p>Your membership activates when you arrive at your first location. There's no formal onboarding, no intake process. The culture is simple enough that you'll understand it within the first hour of being there.</p>

<p>The one thing worth knowing before you arrive: come with something you're working on. Not to present it — just to have it in the room with you. The conversations that happen in this kind of environment tend to accelerate things that are already in motion.</p>

<h3>Booking Space</h3>
<p>Reach out to Drew directly to book your time at any of the properties. The model is intentionally informal — 3 to 5 people in the space at once is the ideal. No formal calendar system yet; a text or email works fine.</p>

<h3>Bringing Guests</h3>
<p>You can bring up to 3 guests for your own retreats or programs. You arrange the terms and pricing with your guests directly — the space is yours. Let Drew know in advance so the house is set up properly.</p>

<h3>The Studio</h3>
<p>The professional video studio is available at every location. You don't need to book in advance — just let Drew or the studio partner know what you're filming and when. If you're not sure what to film, that's a good conversation to have with Drew when you arrive.</p>

<h3>Your 5 Questions</h3>
<p>Each visit, you'll be asked 5 brief questions on camera for The Gathering Place's social content. These are short, thoughtful, unrehearsed — Drew's style. Don't prepare for them. Just answer them.</p>

<h3>Reaching Drew</h3>
<p>Email is best: <strong>drew@dayoneleadership.com</strong></p>
<p>He responds to everything. He just might take a day.</p>

</div>`;
}

function buildWelcomePrinciplesSection(): string {
  return `<div class="section-page">
${pageHeader("The Culture")}

<div class="section-label">How We Are Together</div>
<div class="section-title">The Principles</div>

<p>These aren't rules. They're the culture. The difference is that rules create compliance; culture creates belonging.</p>

<div class="principle-item">
<div class="principle-name">No performance required.</div>
<div class="principle-body">You don't have to be "on." Nobody here needs you to be impressive. Leave the stage persona at the door.</div>
</div>

<div class="principle-item">
<div class="principle-name">Pause before answering.</div>
<div class="principle-body">One beat of reflection before speaking. Drew has trained himself to do this for years and says it made him "so much smarter and clearer." Try it.</div>
</div>

<div class="principle-item">
<div class="principle-name">Ask more than you answer.</div>
<div class="principle-body">The most interesting people in any room are the ones who want to know more than they want to be known.</div>
</div>

<div class="principle-item">
<div class="principle-name">Don't speak for more than 90 seconds straight before 5pm.</div>
<div class="principle-body">A nudge, not a rule. Smart people can fill every room. This slows things down enough for something unexpected to surface.</div>
</div>

<div class="am-i-crazy-block">
<div class="am-i-crazy-label">The "Am I Crazy" Room / Chair</div>
<div class="am-i-crazy-body">Every location has a designated spot. If someone is in it, it means: <em>I have an idea I want someone to hear.</em> Sit across from them and you've agreed to listen first. You don't get to spew your ideas at anyone unless you're in the chair and they've chosen to come to you. Nobody gets ambushed. Nobody wanders in by accident.</div>
</div>

<p>Interaction signals outside your room tell people what kind of presence you're open to. Respect them. Use them. There's no social obligation to be social.</p>

<p><strong>By the fire, none of the above applies. You can just be.</strong></p>

</div>`;
}

function buildLocationCalendarSection(locations: GatheringPlaceLocation[]): string {
  const rows = locations
    .map(
      (loc) => `<tr>
<td><strong>${loc.period}</strong></td>
<td>${loc.name}</td>
<td>${loc.region}</td>
<td style="color:#9a8f82;font-style:italic;">${loc.notes}</td>
</tr>`
    )
    .join("\n");

  return `<div class="section-page">
${pageHeader("Location Calendar")}

<div class="section-label">2026 – 2027</div>
<div class="section-title">Where We'll Be</div>

<p>The calendar below covers the full founding year and the 2027 winter residency. Locations rotate — from the Toronto base to the Kawarthas cottage, a winter in Barbados, and eventually Cape Breton. Each location has a different energy. The rotation is intentional.</p>

<table>
<thead>
<tr>
<th>Period</th>
<th>Location</th>
<th>Region</th>
<th>Notes</th>
</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>

<p>To book time at a location, email Drew directly at <strong>drew@dayoneleadership.com</strong>. Dates and availability are managed informally — there's no booking portal. A quick message is all it takes.</p>

</div>`;
}

function buildStudioGuideSection(): string {
  return `<div class="section-page">
${pageHeader("The Studio")}

<div class="section-label">Professional Video Production</div>
<div class="section-title">The Studio</div>

<p>Every Gathering Place location includes access to a professionally managed video studio. This is not a corner with a ring light. It's proper lighting, sound, and setup — managed by a studio partner Drew has already arranged.</p>

<h3>What You Can Film</h3>

<ul>
<li><strong>Keynote recordings</strong> — Full presentations filmed properly for your portfolio or licensing reel</li>
<li><strong>Short-form social content</strong> — Reels, LinkedIn videos, thought leadership clips</li>
<li><strong>Course or program material</strong> — Evergreen content for any online program you're building</li>
<li><strong>Speaker demo content</strong> — New material for your speaker reel</li>
<li><strong>Client-facing content</strong> — Video proposals, introductions, follow-up messages</li>
</ul>

<h3>How It Works</h3>

<p>Let Drew or the studio partner know what you want to film and when. No formal booking system — an email or text the day before is fine. If you arrive without a plan, that's fine too; the best ideas usually come out of a conversation in the space.</p>

<p>Production support (editing, colour correction, export for social) is included in the studio partnership for basic social content. For more involved production work, Drew can connect you directly with the studio partner to discuss scope and timeline.</p>

<h3>What to Bring</h3>

<ul>
<li>A rough idea of what you want to say — even a few bullet points is enough</li>
<li>Your usual speaking wardrobe (the studio lighting works best with solid colours; avoid busy patterns)</li>
<li>Any props, slides, or visual assets you want to reference on camera</li>
</ul>

<p>Most members leave their first studio session surprised by how much they got done in a few hours. The setup removes all the friction — you just have to show up and talk.</p>

</div>`;
}

// ── Teaser Sections ───────────────────────────────────────────────────────────

function buildTeaserFront(locations: GatheringPlaceLocation[]): string {
  const locationPills = locations
    .filter((l) => l.status !== "future")
    .map((l) => `<div class="teaser-location-pill">${l.name}</div>`)
    .join("\n");

  return `<div class="teaser-hero">

<div>
<div class="cover-emblem" style="text-align:left;margin-bottom:40px;">The Gathering Place · Founded 2026</div>

<div class="section-label">A Private Creative Club</div>
<h1 style="font-size:36px;line-height:1.2;margin-bottom:16px;">A place for creatives<br>who are done performing.</h1>
<p style="font-size:16px;color:#9a8f82;font-style:italic;max-width:480px;margin-bottom:40px;">A rotating set of high-end properties. A professional video studio. A small, hand-picked community of speakers, coaches, writers, and designers who get it without needing an explanation.</p>

<div class="cover-rule" style="margin:0 0 40px;"></div>

<p style="font-size:13px;color:#d4cfc8;max-width:500px;">Not a conference. Not a mastermind. Not a co-working space. A place to think, work, create, and be around people who are operating at the level you want to be operating at.</p>
</div>

<div>
<div class="section-label" style="margin-bottom:12px;">Locations 2026 – 2027</div>
<div class="teaser-locations-row">
${locationPills}
</div>
</div>

</div>`;
}

function buildTeaserBack(): string {
  return `<div class="teaser-back">

<div>
<div class="page-header">
<span class="page-header-brand">The Gathering Place</span>
<span>Founding Cohort · 2026</span>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;">
<div>
<div class="section-label" style="margin-bottom:16px;">Is This For You?</div>

<ul class="checklist">
<li>You're a speaker, coach, writer, or designer who has built something real</li>
<li>You spend a lot of energy being what other people need you to be</li>
<li>Your best thinking happens in conversation with people who can keep up</li>
<li>You've thought about running your own retreats but haven't had the space</li>
<li>You want to leave every visit with usable video content</li>
</ul>
</div>

<div>
<div class="section-label" style="margin-bottom:16px;">The Founding Cohort</div>

<div style="margin-bottom:24px;">
<div class="pricing-amount" style="font-size:28px;">$2,500</div>
<div class="pricing-period">per month</div>
</div>

<p style="font-size:12px;color:#9a8f82;line-height:1.8;">Founding cohort: 8-12 members. Terms are completely flexible. The goal is the right room — not maximum revenue.</p>

<div class="green-room-block" style="margin-top:24px;padding:20px 24px;">
<div class="green-room-label">Also Available</div>
<p style="font-size:12px;color:#9a8f82;margin-top:4px;">The Green Room — an inner track specifically for professional speakers. Not publicly advertised.</p>
</div>
</div>
</div>
</div>

<div class="cta-block" style="margin-top:0;">
<div class="cta-heading">Request an Invitation</div>
<div class="cta-sub">Membership is invitation only. If this is landing with you, reach out directly.</div>
<div class="cta-email">drew@dayoneleadership.com</div>
</div>

</div>`;
}

// ── PDF Assemblers ────────────────────────────────────────────────────────────

function assembleProspectus(locations: GatheringPlaceLocation[]): string {
  return [
    coverPage(
      "The Gathering Place",
      "A place for creatives who are done performing.",
      "Founding Cohort · 2026 · Invitation Only"
    ),
    buildOriginSection(),
    buildWhatItIsSection(),
    buildCultureSection(),
    buildLocationsSection(locations),
    buildBenefitsSection(),
    buildGreenRoomSection(),
    buildFoundingCohortSection(),
    buildIsThisForYouSection(),
  ].join("\n\n");
}

function assembleTeaser(locations: GatheringPlaceLocation[]): string {
  return [buildTeaserFront(locations), buildTeaserBack()].join("\n\n");
}

function assembleWelcomePackage(locations: GatheringPlaceLocation[]): string {
  return [
    coverPage(
      "Welcome",
      "You're in.",
      "The Gathering Place · Member Welcome Package"
    ),
    buildWelcomeLetter(),
    buildWhatsNextSection(),
    buildWelcomePrinciplesSection(),
    buildLocationCalendarSection(locations),
    buildStudioGuideSection(),
  ].join("\n\n");
}

// ── Public API ────────────────────────────────────────────────────────────────

export type GpTheme = "dark" | "light";

export async function generateProspectus(theme: GpTheme = "dark"): Promise<GatheringPlaceResult> {
  const locations = loadLocations();
  const markdown = assembleProspectus(locations);
  const suffix = theme === "light" ? "-light" : "";

  const { mdToPdf } = await import("md-to-pdf");
  const pdf = await mdToPdf(
    { content: markdown },
    {
      css: theme === "light" ? GP_CSS_LIGHT : GP_CSS,
      document_title: "The Gathering Place — Membership Prospectus",
      pdf_options: {
        format: "A4",
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
        printBackground: true,
      },
      launch_options: { args: ["--no-sandbox"] },
    }
  );

  const outDir = getOutputDir();
  const pdfPath = join(outDir, `gathering-place-prospectus${suffix}.pdf`);
  const markdownPath = join(outDir, `gathering-place-prospectus${suffix}.md`);
  writeFileSync(pdfPath, pdf.content);
  writeFileSync(markdownPath, markdown);

  return { pdfPath, markdownPath };
}

export async function generateTeaser(theme: GpTheme = "dark"): Promise<GatheringPlaceResult> {
  const locations = loadLocations();
  const markdown = assembleTeaser(locations);
  const suffix = theme === "light" ? "-light" : "";

  const { mdToPdf } = await import("md-to-pdf");
  const pdf = await mdToPdf(
    { content: markdown },
    {
      css: theme === "light" ? GP_CSS_LIGHT : GP_CSS,
      document_title: "The Gathering Place — Overview",
      pdf_options: {
        format: "A4",
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
        printBackground: true,
      },
      launch_options: { args: ["--no-sandbox"] },
    }
  );

  const outDir = getOutputDir();
  const pdfPath = join(outDir, `gathering-place-teaser${suffix}.pdf`);
  const markdownPath = join(outDir, `gathering-place-teaser${suffix}.md`);
  writeFileSync(pdfPath, pdf.content);
  writeFileSync(markdownPath, markdown);

  return { pdfPath, markdownPath };
}

export async function generateWelcomePackage(theme: GpTheme = "dark"): Promise<GatheringPlaceResult> {
  const locations = loadLocations();
  const markdown = assembleWelcomePackage(locations);
  const suffix = theme === "light" ? "-light" : "";

  const { mdToPdf } = await import("md-to-pdf");
  const pdf = await mdToPdf(
    { content: markdown },
    {
      css: theme === "light" ? GP_CSS_LIGHT : GP_CSS,
      document_title: "The Gathering Place — Member Welcome Package",
      pdf_options: {
        format: "A4",
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
        printBackground: true,
      },
      launch_options: { args: ["--no-sandbox"] },
    }
  );

  const outDir = getOutputDir();
  const pdfPath = join(outDir, `gathering-place-welcome${suffix}.pdf`);
  const markdownPath = join(outDir, `gathering-place-welcome${suffix}.md`);
  writeFileSync(pdfPath, pdf.content);
  writeFileSync(markdownPath, markdown);

  return { pdfPath, markdownPath };
}
