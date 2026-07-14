// scripts/prerender-submissions.mjs
// Static prerender of every PUBLIC submission into /u/<uuid>/index.html so that
// crawlers (and no-JS clients) get a fully server-rendered 200 page with the
// real title, author, description, image, tags, files, and Download link.
//
// Data source: the PUBLIC API only (/api/public/*), which enforces
// approved=1 AND is_published=1. Unpublished submissions are therefore
// impossible to fetch and never generated.
//
// Safety:
//  - Every value is HTML-escaped in the template; embedded JSON/JSON-LD is
//    serialized with < > escaping.
//  - UUID format is validated before writing a directory.
//  - Stale /u/<uuid>/ directories are removed before regeneration.
//  - Any fetch failure, count mismatch, or write error => process.exit(1),
//    so a broken run never deploys stale/partial output.

import { readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractShared } from "./lib/extract-shared.mjs";
import {
  renderSubmissionPage,
  isUuid,
  UUID_RE,
  escapeHtml,
  SITE,
} from "./lib/render-template.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORTAL_ROOT = path.resolve(__dirname, "..");
const U_DIR = path.join(PORTAL_ROOT, "u");
const SITEMAP_PATH = path.join(PORTAL_ROOT, "sitemap.xml");
const API_BASE = process.env.PRERENDER_API_BASE || SITE;

const STATIC_PAGES = [
  "/",
  "/creators/",
  "/submit.html",
  "/about.html",
  "/mobcrafter.html",
  "/how-to-use.html",
  "/upload-guide.html",
  "/creator-support.html",
  "/guidelines.html",
  "/ai-guidelines.html",
  "/privacy.html",
  "/terms.html",
  "/dmca.html",
  "/contact.html",
];

function fail(msg) {
  console.error(`\n[prerender] FATAL: ${msg}`);
  process.exit(1);
}

async function fetchJson(url, { allow404 = false } = {}) {
  let res;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch (e) {
    throw new Error(`network error for ${url}: ${e?.message || e}`);
  }
  if (res.status === 404 && allow404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`non-JSON response for ${url}`);
  }
}

// Fetch the full public list (API caps at 50/page; paginate defensively).
async function fetchPublicList() {
  const items = [];
  const seen = new Set();
  for (let page = 1; page <= 20; page++) {
    const data = await fetchJson(`${API_BASE}/api/public/submissions?limit=100&page=${page}`);
    const pageItems = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    if (!pageItems.length) break;
    let added = 0;
    for (const it of pageItems) {
      const id = String(it?.id || "").trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      items.push(it);
      added++;
    }
    if (pageItems.length < 50 || added === 0) break;
  }
  return items;
}

// Remove every existing prerendered creation page (flat u/<uuid>.html files and
// any legacy u/<uuid>/ directories). Non-UUID entries (index.html, other files)
// are preserved.
async function cleanUuidPages() {
  let entries;
  try {
    entries = await readdir(U_DIR, { withFileTypes: true });
  } catch (e) {
    throw new Error(`cannot read ${U_DIR}: ${e?.message || e}`);
  }
  let removed = 0;
  for (const ent of entries) {
    if (ent.isDirectory() && UUID_RE.test(ent.name)) {
      await rm(path.join(U_DIR, ent.name), { recursive: true, force: true });
      removed++;
    } else if (ent.isFile()) {
      const m = ent.name.match(/^([0-9a-f-]+)\.html$/i);
      if (m && UUID_RE.test(m[1])) {
        await rm(path.join(U_DIR, ent.name), { force: true });
        removed++;
      }
    }
  }
  return removed;
}

function xmlEscape(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildSitemap(publicItems) {
  const urls = [];
  for (const p of STATIC_PAGES) {
    urls.push(`  <url><loc>${xmlEscape(SITE + p)}</loc></url>`);
  }
  for (const it of publicItems) {
    const loc = `${SITE}/u/${it.id}`;
    const lastmodRaw = String(it.updated_at || it.created_at || "").trim();
    let lastmod = "";
    if (lastmodRaw) {
      const d = new Date(lastmodRaw);
      if (!Number.isNaN(d.getTime())) lastmod = d.toISOString().slice(0, 10);
    }
    urls.push(
      `  <url><loc>${xmlEscape(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`
    );
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

async function main() {
  console.log(`[prerender] API base: ${API_BASE}`);

  // 1) Extract shared CSS/JS from u/index.html (single source of truth).
  const shared = await extractShared(PORTAL_ROOT);
  console.log(`[prerender] shared assets written: u-detail.v1.css (${shared.cssBytes}B), u-detail.v1.js (${shared.jsBytes}B)`);

  // 2) Fetch the public submission set.
  let list = await fetchPublicList();
  const publicCount = list.length;
  if (publicCount === 0) fail("public list returned 0 items (refusing to wipe pages)");
  console.log(`[prerender] public submissions from API: ${publicCount}`);

  // Test-only: PRERENDER_LIMIT restricts generation for a single-item smoke test.
  // It intentionally SKIPS the count check and stale cleanup so it never
  // touches the real deployment set.
  const LIMIT = Number.parseInt(process.env.PRERENDER_LIMIT || "", 10);
  const isLimited = Number.isFinite(LIMIT) && LIMIT > 0;
  if (isLimited) {
    list = list.slice(0, LIMIT);
    console.log(`[prerender] TEST MODE: limiting to ${list.length} item(s) (no cleanup, no count check, no sitemap)`);
  }

  // 3) Fetch authoritative per-item meta + files (fail-fast).
  const items = [];
  for (const listItem of list) {
    const id = String(listItem?.id || "").trim();
    if (!isUuid(id)) fail(`invalid UUID from API: ${JSON.stringify(id)}`);

    const meta = await fetchJson(`${API_BASE}/api/public/submissions/${id}`);
    if (!meta || meta.error) fail(`meta fetch failed for ${id}: ${meta?.error || "empty"}`);

    let files = [];
    const filesData = await fetchJson(`${API_BASE}/api/public/submissions/${id}/files`, { allow404: true });
    if (filesData && Array.isArray(filesData.items)) files = filesData.items;

    items.push({ item: meta, files });
  }

  // 4) Clean stale pages, then generate current set (flat u/<uuid>.html files).
  const removed = isLimited ? 0 : await cleanUuidPages();
  if (!isLimited) console.log(`[prerender] removed ${removed} existing creation page(s)`);

  let written = 0;
  for (const { item, files } of items) {
    const id = item.id;
    if (!isUuid(id)) fail(`refusing to write non-UUID id: ${JSON.stringify(id)}`);
    const html = renderSubmissionPage(item, files);
    if (item.title && !html.includes(escapeHtml(String(item.title).trim()))) {
      fail(`rendered HTML missing title for ${id}`);
    }
    await writeFile(path.join(U_DIR, `${id}.html`), html, "utf8");
    written++;
  }
  console.log(`[prerender] wrote ${written} creation page(s)`);

  // 5) Verify counts match exactly.
  if (!isLimited && written !== publicCount) {
    fail(`generated count (${written}) != public count (${publicCount})`);
  }

  // 6) Verify no non-public UUID dir remains (defense-in-depth).
  const publicIds = new Set(items.map((x) => x.item.id));
  if (!isLimited) {
    const after = await readdir(U_DIR, { withFileTypes: true });
    for (const ent of after) {
      if (ent.isDirectory() && UUID_RE.test(ent.name) && !publicIds.has(ent.name)) {
        fail(`stale non-public page remains: /u/${ent.name}`);
      }
    }
  }

  // 7) Write sitemap.
  if (isLimited) {
    console.log(`\n[prerender] TEST MODE DONE. generated=${written} (sitemap/cleanup skipped)`);
    return;
  }
  const sitemap = buildSitemap(items.map((x) => x.item));
  await writeFile(SITEMAP_PATH, sitemap, "utf8");
  const sitemapCreations = items.length;
  console.log(`[prerender] sitemap.xml updated: ${STATIC_PAGES.length} static + ${sitemapCreations} creations`);

  console.log(`\n[prerender] DONE. public=${publicCount} generated=${written} sitemap_creations=${sitemapCreations}`);
}

main().catch((e) => fail(e?.message || String(e)));
