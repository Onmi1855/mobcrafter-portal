// scripts/lib/render-template.mjs
// Pure helpers to render a single public submission into a fully server-rendered
// /u/<uuid>/index.html. No guessing: all values come from the public API item.
// Every value inserted into HTML is escaped. JSON-LD and embedded JSON are
// serialized safely (with < escaping to prevent </script> breakout).

export const SITE = "https://mobcrafter.net";

// ---- Label maps (must match u/index.html) ----
const HUB_FILE_AVAILABILITY_LABELS = {
  json: "JSON",
  schem: "SCHEM",
  both: "JSON + SCHEM",
  zip: "ZIP",
  external: "External",
};
const HUB_ACCESS_TYPE_LABELS = {
  free: "Free",
  creator_supported: "Creator Supported",
  patreon_linked: "Patreon-linked",
  external: "External Access",
  free_sample_supported: "Free Sample",
};
const HUB_CREATION_METHOD_LABELS = {
  hand_built: "Hand Built",
  ai_assisted: "AI Assisted",
  imported: "Imported",
  remixed: "Remixed",
  starter_variant: "Starter Variant",
};
const HUB_CONTENT_TYPE_LABELS = {
  mobcrafter_unit_json: "MobCrafter Unit",
  schematic: "Schematic",
  schematic_unit_set: "Schematic + Unit Set",
  unit_pack: "Unit Pack",
  world_map: "World / Map",
  creator_asset: "Creator Asset",
  guide_workflow: "Guide / Workflow",
  external_release: "External Release",
};

const hubLabel = (map, value, fallback) => {
  const key = String(value || "").trim().toLowerCase();
  return map[key] || fallback;
};
export const fileAvailabilityLabel = (v) => hubLabel(HUB_FILE_AVAILABILITY_LABELS, v, "JSON");
export const accessTypeLabel = (v) => hubLabel(HUB_ACCESS_TYPE_LABELS, v, "Free");
export const creationMethodLabel = (v) => hubLabel(HUB_CREATION_METHOD_LABELS, v, "Hand Built");
export const contentTypeLabel = (v) => hubLabel(HUB_CONTENT_TYPE_LABELS, v, "MobCrafter Unit");

// ---- Escaping ----
export function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Safe JSON for embedding inside a <script> tag.
function safeJsonForScript(obj) {
  return JSON.stringify(obj)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

export function normalizeTags(t) {
  if (!t) return [];
  if (Array.isArray(t)) return t.map((x) => String(x).trim()).filter(Boolean);
  return String(t).split(/[\s,]+/).map((x) => x.trim()).filter(Boolean);
}

export function trimText(value, maxLen) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, Math.max(0, maxLen - 1)).trimEnd() + "\u2026";
}

// UUID v1-v5 validation (expected id format).
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isUuid(s) {
  return UUID_RE.test(String(s || "").trim());
}

// ---- Content builders (must match u/index.html behavior) ----
export function buildHowToLines(item, files = []) {
  const fileAvailability = String(item.file_availability || "json").trim().toLowerCase() || "json";
  const accessType = String(item.access_type || "free").trim().toLowerCase() || "free";
  const unitId = String(item.unit_id || "").trim();
  const lines = [];

  if (fileAvailability === "external") {
    lines.push("Open the external release link to access the creator-provided files.");
  } else if (fileAvailability === "schem") {
    lines.push("Download the schematic from the included files list.");
    lines.push("Import it with your preferred schematic workflow or use it as a build reference.");
  } else if (fileAvailability === "zip") {
    lines.push("Download the included ZIP or pack from the files list.");
    lines.push("Unpack it and follow the creator notes for any world, asset, or extra-file instructions.");
  } else {
    lines.push("Download the MobCrafter JSON file.");
    lines.push(`The filename and JSON id/unitId should match. Example: ${unitId || "your-unit"}.json`);
    lines.push("Place the JSON into: config/mob_crafter/units/");
    lines.push("Load or summon the unit in-game.");
  }

  if (fileAvailability === "both" || files.some((f) => String(f.file_kind || "").trim().toLowerCase() === "schem")) {
    lines.push("Use the included schematic if you want to rebuild or inspect the structure outside the summon workflow.");
  }
  if (files.some((f) => ["zip", "world", "asset"].includes(String(f.file_kind || "").trim().toLowerCase()))) {
    lines.push("Check the included files list for packs, worlds, or creator assets that accompany this release.");
  }
  if (accessType !== "free") {
    lines.push("Review the creator support links before downloading any off-site or supporter-only extras.");
  }
  return lines;
}

export function buildRequirementLines(item, requiredMods = []) {
  const fileAvailability = String(item.file_availability || "json").trim().toLowerCase() || "json";
  const lines = ["Minecraft Forge 1.20.1 with MobCrafter installed."];
  if (requiredMods.length) {
    lines.push(`Additional block mods detected from the JSON: ${requiredMods.join(", ")}.`);
  } else {
    lines.push("Install any dependency mods mentioned by the creator before loading the release.");
  }
  if (fileAvailability === "schem" || fileAvailability === "both") {
    lines.push("A schematic-compatible workflow is required if you want to rebuild the design from the included files.");
  }
  if (fileAvailability === "external") {
    lines.push("Some files are hosted off-site, so availability and install steps depend on the creator\u2019s external page.");
  }
  return lines;
}

// Included files list (matches renderIncludedList).
function buildIncludedEntries(item, files = []) {
  const entries = [];
  const id = item.id;
  const fa = String(item.file_availability || "json").trim().toLowerCase() || "json";
  if (fa === "json" || fa === "both") {
    entries.push({ text: "MobCrafter JSON unit file", href: `/api/public/submissions/${id}/download` });
  }
  if (fa === "external" && item.external_url) {
    entries.push({ text: "External release page", href: String(item.external_url) });
  }
  for (const file of (files || []).slice(0, 8)) {
    const kind = String(file.file_kind || "file").trim().toUpperCase();
    const label = String(file.label || file.original_name || file.name || kind).trim();
    const rawHref = String(file.download_path || file.external_url || "").trim();
    const href = rawHref && /^https?:\/\//i.test(rawHref) ? rawHref : rawHref || "";
    entries.push({ text: `${kind}: ${label}`, href: href || null });
  }
  if (!entries.length) entries.push({ text: "No included files listed yet.", href: null });
  return entries;
}

// Primary download action (matches setPrimaryAction, first branches).
function buildPrimaryAction(item, files = []) {
  const id = item.id;
  const fa = String(item.file_availability || "json").trim().toLowerCase() || "json";
  if (fa === "external" && item.external_url) {
    return { label: "Open External Release", href: String(item.external_url), external: true };
  }
  if (fa === "json" || fa === "both") {
    return { label: "Download JSON", href: `/api/public/submissions/${id}/download`, download: true };
  }
  const preferred = (files || []).find((f) => {
    const k = String(f.file_kind || "").trim().toLowerCase();
    return k === "schem" || k === "zip" || k === "world" || k === "asset";
  }) || (files || [])[0];
  if (preferred && preferred.download_path) {
    const kind = String(preferred.file_kind || "file").trim().toUpperCase();
    const href = String(preferred.download_path);
    const isAbs = /^https?:\/\//i.test(href);
    return { label: `Download ${kind}`, href, external: isAbs, download: !isAbs };
  }
  return { label: "See Included Files", href: "#includedList" };
}

function badgeChips(item) {
  const chips = [];
  chips.push(contentTypeLabel(item.content_type));
  chips.push(fileAvailabilityLabel(item.file_availability));
  chips.push(accessTypeLabel(item.access_type));
  chips.push(creationMethodLabel(item.creation_method));
  if (item.is_official_starter) chips.push("Official Starter");
  return chips;
}

function li(text, href) {
  if (href) {
    const ext = /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<li><a href="${escapeHtml(href)}"${ext}>${escapeHtml(text)}</a></li>`;
  }
  return `<li>${escapeHtml(text)}</li>`;
}

function kvRow(k, v) {
  return `<div class="k">${escapeHtml(k)}</div><div>${escapeHtml(v ?? "")}</div>`;
}

const FALLBACK_DESC =
  "This MobCrafter release includes a downloadable creation for Minecraft. Check the included files and dependency information before downloading.";

// Render the full HTML document for one public submission.
export function renderSubmissionPage(item, files = []) {
  const id = item.id;
  const title = String(item.title || item.name || "Untitled").trim();
  const author = String(item.author_name || "unknown").trim();
  const description = String(item.description || "").trim();
  const descForBody = description || FALLBACK_DESC;
  const metaDescription = trimText(description, 160) || `View this MobCrafter Hub release: ${title}`;
  const canonicalPath = `/u/${id}`;
  const canonicalUrl = `${SITE}${canonicalPath}`;
  const ogImage = `${SITE}/api/public/submissions/${id}/og-image`;
  const tags = normalizeTags(item.tags);
  const sub = `${contentTypeLabel(item.content_type)} \u2022 ${fileAvailabilityLabel(item.file_availability)} \u2022 by ${author}`;
  const chips = badgeChips(item);
  const included = buildIncludedEntries(item, files);
  const howTo = buildHowToLines(item, files);
  const requirements = buildRequirementLines(item, []);
  const primary = buildPrimaryAction(item, files);
  const created = String(item.created_at || "");
  const updated = String(item.updated_at || item.created_at || "");
  const supportUrl = String(item.support_url || "").trim();

  const jsonLd = safeJsonForScript({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description: descForBody,
    image: ogImage,
    author: { "@type": "Person", name: author },
    dateCreated: created || undefined,
    dateModified: updated || undefined,
    url: canonicalUrl,
  });

  const prerenderJson = safeJsonForScript(item);

  const kv = [
    kvRow("Created", created),
    kvRow("Updated", updated),
    kvRow("Downloads", item.download_count ?? 0),
    kvRow("Views", item.view_count ?? 0),
    kvRow("Format", fileAvailabilityLabel(item.file_availability)),
    kvRow("Content type", contentTypeLabel(item.content_type)),
    kvRow("Access", accessTypeLabel(item.access_type)),
    kvRow("Creation method", creationMethodLabel(item.creation_method)),
    kvRow("mod_version", item.mod_version || "Forge"),
    kvRow("submission_no", item.submission_no ?? ""),
    kvRow("unit_id", item.unit_id ?? ""),
    kvRow("Author", author),
  ].join("");

  const primaryAttrs = [
    `id="downloadBtn"`,
    `class="btn primary"`,
    `href="${escapeHtml(primary.href)}"`,
    primary.download ? "download" : "",
    primary.external ? 'target="_blank" rel="noopener noreferrer"' : "",
  ].filter(Boolean).join(" ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1227105355658053"
     crossorigin="anonymous"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MobCrafter Hub | ${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(metaDescription)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" id="canonicalLink" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" id="ogUrl" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(metaDescription)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(metaDescription)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  <link rel="image_src" href="${escapeHtml(ogImage)}" />
  <script type="application/ld+json" id="ldJson">${jsonLd}</script>
  <script src="/assets/ads-config.v1.js" defer></script>
  <script src="/assets/ads.v1.js" defer></script>
  <link rel="stylesheet" href="/assets/ui-icons.v1.css?v=20260524a" />
  <link rel="stylesheet" href="/assets/u-detail.v1.css" />
</head>
<body>
<header>
  <a href="/" class="brand">MobCrafter Hub</a>
  <p>Public creation page</p>
</header>

<img id="ogImageHidden" alt="" style="display:none;" src="${escapeHtml(ogImage)}" />

<main>
  <div class="wrap">
    <section class="card">
      <div data-ad-slot-key="unit_top"></div>

      <h1 class="title" id="title">${escapeHtml(title)}</h1>
      <div class="muted" id="sub">${escapeHtml(sub)}</div>
      <div class="tags" id="heroBadges">${chips.map((c) => `<span class="tag heroBadge">${escapeHtml(c)}</span>`).join("")}</div>

      <div style="margin-top:12px; border:1px solid rgba(148,163,184,.25); border-radius:14px; overflow:hidden; background:#fff;">
        <img id="heroImg" alt="${escapeHtml(title)}" src="${escapeHtml(ogImage)}" style="width:100%; height:auto; display:block; aspect-ratio:1200/630; object-fit:contain; background:#fff;" loading="eager" decoding="async" />
      </div>

      <div id="screensGallery" class="screensGallery" style="display:none;"></div>

      <div class="tags" id="tags">${tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>

      <div class="actions">
        <a ${primaryAttrs}><span class="ui-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="/assets/ui-icons.v1.svg#download"></use></svg></span><span>${escapeHtml(primary.label)}</span></a>
        <a id="schemDownloadBtn" class="btn" href="#" style="display:none;"><span class="ui-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="/assets/ui-icons.v1.svg#download"></use></svg></span><span>Download Schematic</span></a>
        <a id="zipDownloadBtn" class="btn" href="#" style="display:none;"><span class="ui-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="/assets/ui-icons.v1.svg#download"></use></svg></span><span>Download ZIP</span></a>
        <a class="btn" href="https://www.curseforge.com/minecraft/mc-mods/mobcrafter" target="_blank" rel="noopener noreferrer"><span class="ui-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="/assets/ui-icons.v1.svg#external"></use></svg></span><span>Get MobCrafter</span></a>
        <a id="supportBtn" class="btn" href="${escapeHtml(supportUrl || "#")}" target="_blank" rel="noopener noreferrer" style="${supportUrl ? "" : "display:none;"}"><span class="ui-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="/assets/ui-icons.v1.svg#support"></use></svg></span><span>Support creator</span></a>
        <button id="copyBtn" class="btn" type="button"><span class="ui-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="/assets/ui-icons.v1.svg#copy"></use></svg></span><span>Copy instructions</span></button>
      </div>

      <section class="aboutSection" id="aboutSection" aria-label="About this creation">
        <h2 class="aboutHeading">About this creation</h2>
        <p id="aboutBody" class="aboutBody">${escapeHtml(descForBody)}</p>
      </section>

      <div class="summaryGrid">
        <section class="infoBox">
          <h3>What\u2019s included</h3>
          <ul class="infoList" id="includedList">${included.map((e) => li(e.text, e.href)).join("")}</ul>
        </section>
        <section class="infoBox">
          <h3>How to use</h3>
          <ol class="orderedList" id="useList">${howTo.map((t) => li(t)).join("")}</ol>
        </section>
        <section class="infoBox">
          <h3>Requirements</h3>
          <ul class="infoList" id="requirementsList">${requirements.map((t) => li(t)).join("")}</ul>
        </section>
      </div>

      <div id="preview3dBox" class="preview3dBox" style="display:none;">
        <div class="preview3dHeader">
          <span class="label">3D Preview</span>
          <a id="preview3dNewTab" class="btn" href="#" target="_blank" rel="noopener noreferrer" style="font-size:12px; padding:6px 10px;"><span class="ui-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="/assets/ui-icons.v1.svg#preview"></use></svg></span><span>Open in new tab</span></a>
        </div>
        <div id="preview3dLazy" class="preview3dLazy">
          <p>Preview is available for MobCrafter JSON creations.<br>Large creations may take a moment to load.</p>
          <div class="preview3dLazyActions">
            <button id="preview3dLoadBtn" class="btn primary" type="button">Load 3D Preview</button>
          </div>
        </div>
      </div>
      <div id="preview3dNoJsonBox" class="preview3dNoJson" style="display:none;">No MobCrafter JSON included \u2014 this release contains schematic / build data only. 3D preview is not available.</div>

      <details class="techBox">
        <summary>Technical details</summary>
        <div class="kv" id="kv">${kv}</div>
      </details>

      <details id="jsonDetails">
        <summary>JSON preview</summary>
        <pre id="jsonPreview">...</pre>
      </details>

      <section class="commentsBox" aria-label="comments">
        <div class="commentsHead">
          <div class="ttl">Comments</div>
          <div class="commentHint" id="commentsState">Loading\u2026</div>
        </div>
        <div class="commentsBody">
          <div id="commentsLoginHint" class="commentHint" style="display:none;"></div>
          <div class="commentForm" id="commentForm" style="display:none;">
            <textarea id="commentBody" maxlength="1000" placeholder="Write a comment (max 1000 chars)"></textarea>
            <div class="commentActions">
              <button id="commentSend" class="btn primary" type="button">Send</button>
              <span class="commentHint" id="commentPostMsg"></span>
            </div>
          </div>
          <div class="commentList" id="commentList"></div>
          <div class="commentPager" id="commentPager" style="display:none;">
            <button class="btn" id="commentPrev" type="button">Prev</button>
            <button class="btn" id="commentNext" type="button">Next</button>
            <span class="commentHint" id="commentPageInfo"></span>
          </div>
        </div>
      </section>

      <details>
        <summary>How to use in-game (copy/paste)</summary>
        <pre id="howto"></pre>
      </details>

      <div class="divider"></div>

      <div class="editor" id="editor">
        <div style="font-weight:800;">Edit (owner/admin)</div>
        <div class="muted" id="whoamiLine" style="margin-top:6px;"></div>
        <div class="row">
          <div class="muted">Title</div>
          <input id="editTitle" type="text" maxlength="80" placeholder="title" />
        </div>
        <div class="row">
          <div class="muted">Description</div>
          <input id="editDesc" type="text" maxlength="2000" placeholder="description" />
        </div>
        <div class="row">
          <div class="muted">Tags</div>
          <input id="editTags" type="text" maxlength="300" placeholder="tag1 tag2 tag3" />
        </div>
        <div class="editorActions">
          <button id="saveMetaBtn" class="btn primary" type="button">Save meta</button>
        </div>
        <div class="divider"></div>
        <div style="font-weight:800;">Replace JSON</div>
        <div class="note">Note: JSON pasted here will have <b>unitId/id forcibly overwritten</b> on the server (fixed behavior).</div>
        <textarea id="editJson" spellcheck="false" placeholder="{ ... }"></textarea>
        <div class="editorActions">
          <button id="loadJsonBtn" class="btn" type="button">Load current JSON</button>
          <button id="saveJsonBtn" class="btn primary" type="button">Save JSON</button>
        </div>
        <div class="divider"></div>
        <div style="font-weight:800; color:var(--danger);">Delete (soft delete)</div>
        <div class="note">This hides the unit from list/details/download. It does not physically delete the R2 file.</div>
        <div class="editorActions">
          <button id="deleteBtn" class="btn danger" type="button">Delete</button>
        </div>
        <div id="editorMsg"></div>
      </div>

      <div id="msg"></div>
    </section>

    <aside class="card">
      <section class="sideSection">
        <h3>Creator</h3>
        <div class="muted" id="creatorSummary" style="font-size:13px; line-height:1.7;">Loading creator snapshot...</div>
        <div class="sideStats" id="creatorStats"></div>
        <div class="sideActions" id="creatorActions"></div>
      </section>
      <div class="divider"></div>
      <section class="sideSection">
        <h3>More by this creator</h3>
        <div class="miniList" id="moreByList"></div>
      </section>
      <section class="sideSection">
        <h3>Related creations</h3>
        <div class="miniList" id="relatedList"></div>
      </section>
      <section class="sideSection">
        <h3>Quick help</h3>
        <div class="muted" style="font-size:13px; line-height:1.6;">
          Downloaded JSON files are loaded from <code>config/mob_crafter/units/</code>. If a release uses blocks from other mods, those mods must be installed as required dependencies.
          <br /><br />
          Note: images shown here are previews, not bundled content.
        </div>
      </section>
    </aside>
  </div>
</main>

<script>window.__PRERENDER_ITEM__ = ${prerenderJson};</script>
<script src="/assets/ui-icons.v1.js?v=20260524a"></script>
<script src="/assets/u-detail.v1.js" defer></script>
</body>
</html>
`;
}
