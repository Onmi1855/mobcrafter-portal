// scripts/audit-descriptions.mjs
// READ-ONLY audit of public submission descriptions. Does NOT touch D1.
// Flags exact-duplicate and template-only descriptions, and lists original
// works whose descriptions could be enriched with creation-specific detail.
//
// Usage: node scripts/audit-descriptions.mjs

import { SITE } from "./lib/render-template.mjs";

const API_BASE = process.env.PRERENDER_API_BASE || SITE;

// Template signatures observed in the catalog (generic, non-creation-specific).
const TEMPLATE_SIGNATURES = [
  "A MobCrafter unit built from Minecraft blocks. This release",
  "A MobCrafter unit featuring a",
  "This MobCrafter release includes a downloadable creation",
];

function normalize(s) {
  return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

// Crude similarity: Jaccard over word bigrams.
function bigrams(s) {
  const words = normalize(s).split(" ").filter(Boolean);
  const set = new Set();
  for (let i = 0; i < words.length - 1; i++) set.add(words[i] + " " + words[i + 1]);
  return set;
}
function jaccard(a, b) {
  const A = bigrams(a), B = bigrams(b);
  if (!A.size && !B.size) return 1;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

async function fetchAll() {
  const items = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${API_BASE}/api/public/submissions?limit=100&page=${page}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const arr = Array.isArray(data?.items) ? data.items : [];
    if (!arr.length) break;
    items.push(...arr);
    if (arr.length < 50) break;
  }
  return items;
}

function templateScore(desc) {
  const d = normalize(desc);
  // How much of the description is generic template boilerplate.
  for (const sig of TEMPLATE_SIGNATURES) {
    if (d.startsWith(normalize(sig))) {
      // Heuristic: short + starts with template = mostly template.
      return d.length < 260 ? "TEMPLATE_ONLY" : "TEMPLATE_LEAD";
    }
  }
  return "CUSTOM";
}

const items = await fetchAll();
console.log(`Public submissions audited: ${items.length}\n`);

// 1) Exact duplicates.
const byNorm = new Map();
for (const it of items) {
  const key = normalize(it.description);
  if (!byNorm.has(key)) byNorm.set(key, []);
  byNorm.get(key).push(it.title);
}
const exactDups = [...byNorm.entries()].filter(([, t]) => t.length > 1);
console.log(`=== 1) EXACT-DUPLICATE descriptions: ${exactDups.length} group(s) ===`);
for (const [, titles] of exactDups) {
  console.log(`  [${titles.length}] ${titles.join(", ")}`);
}

// 2) Template-only / template-lead.
const templateOnly = items.filter((it) => templateScore(it.description) === "TEMPLATE_ONLY");
const templateLead = items.filter((it) => templateScore(it.description) === "TEMPLATE_LEAD");
const custom = items.filter((it) => templateScore(it.description) === "CUSTOM");
console.log(`\n=== 2) TEMPLATE classification ===`);
console.log(`  TEMPLATE_ONLY (short, generic): ${templateOnly.length}`);
templateOnly.forEach((it) => console.log(`    - ${it.title} (${(it.description || "").length} chars)`));
console.log(`  TEMPLATE_LEAD (generic opening, longer): ${templateLead.length}`);
console.log(`  CUSTOM (creation-specific): ${custom.length}`);

// 3) Near-duplicate clusters (Jaccard >= 0.6), excluding exact dups.
console.log(`\n=== 3) NEAR-DUPLICATE clusters (bigram Jaccard >= 0.6) ===`);
const seen = new Set();
let clusters = 0;
for (let i = 0; i < items.length; i++) {
  if (seen.has(i)) continue;
  const group = [items[i].title];
  for (let j = i + 1; j < items.length; j++) {
    if (seen.has(j)) continue;
    const sim = jaccard(items[i].description, items[j].description);
    if (sim >= 0.6) { group.push(items[j].title); seen.add(j); }
  }
  if (group.length > 1) { clusters++; console.log(`  [${group.length}] ${group.join(", ")}`); }
}
if (!clusters) console.log("  (none)");

// 4) Enrichment candidates: original works (custom desc) sorted by downloads.
console.log(`\n=== 4) ENRICHMENT CANDIDATES (original works, by downloads) ===`);
const candidates = custom
  .filter((it) => !/^unit_/.test(String(it.title || "")))
  .sort((a, b) => (Number(b.download_count) || 0) - (Number(a.download_count) || 0))
  .slice(0, 15);
candidates.forEach((it) => {
  console.log(`  - ${it.title}  (DL ${it.download_count || 0}, ${(it.description || "").length} chars, ${it.content_type})`);
});
