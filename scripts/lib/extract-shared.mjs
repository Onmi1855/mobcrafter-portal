// scripts/lib/extract-shared.mjs
// Extract the inline <style> and the main inline <script> (the app IIFE) from
// u/index.html into shared external assets so prerendered pages reuse the exact
// same CSS/JS as the SPA. A single prerender branch is injected so load() uses
// embedded data (window.__PRERENDER_ITEM__) instead of a network fetch, and
// never blanks the server-rendered content.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function extractShared(portalRoot) {
  const srcPath = path.join(portalRoot, "u", "index.html");
  const html = await readFile(srcPath, "utf8");

  // --- CSS: first <style> ... </style> ---
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!styleMatch) throw new Error("extractShared: <style> block not found in u/index.html");
  const css = styleMatch[1].replace(/^\n/, "");

  // --- Main app script: <script>(() => { ... })();</script> ---
  const scriptMatch = html.match(/<script>\s*\(\(\) => \{[\s\S]*?\}\)\(\);\s*<\/script>/);
  if (!scriptMatch) throw new Error("extractShared: main app <script> IIFE not found in u/index.html");
  let js = scriptMatch[0].replace(/^<script>\s*/, "").replace(/\s*<\/script>$/, "");

  // --- Inject prerender branch (single, precise replacement) ---
  const needle = "const item = await fetchItemByKey(key);";
  if (!js.includes(needle)) {
    throw new Error("extractShared: could not find load() fetch line to inject prerender branch");
  }
  const injected =
    'const item = (window.__PRERENDER_ITEM__ && typeof window.__PRERENDER_ITEM__ === "object") ? window.__PRERENDER_ITEM__ : await fetchItemByKey(key);';
  js = js.replace(needle, injected);

  const header =
    "/* AUTO-GENERATED from u/index.html by scripts/prerender-submissions.mjs. Do not edit directly. */\n";

  const cssOut = path.join(portalRoot, "assets", "u-detail.v1.css");
  const jsOut = path.join(portalRoot, "assets", "u-detail.v1.js");
  await writeFile(cssOut, header + css, "utf8");
  await writeFile(jsOut, header + js + "\n", "utf8");

  return { cssOut, jsOut, cssBytes: css.length, jsBytes: js.length };
}
