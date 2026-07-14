# MobCrafter Portal (Cloudflare Pages)

Static site for MobCrafter Hub. Public creation detail pages are **prerendered**
so that crawlers and no-JS clients get fully server-rendered HTML.

## Prerender / build

```bash
npm run build      # === npm run prerender
```

`scripts/prerender-submissions.mjs` does all of the following in one run:

1. Extracts the shared `<style>` / `<script>` from `u/index.html` into
   `assets/u-detail.v1.css` and `assets/u-detail.v1.js` (single source of truth;
   a prerender branch is injected so the shared script uses embedded data and
   never blanks the server-rendered content).
2. Fetches every **public** submission from the public API
   (`/api/public/submissions`, which enforces `approved=1 AND is_published=1`).
3. Writes one fully server-rendered page per creation to `u/<uuid>.html`
   (title, author, full description, image, tags, files, canonical, OG,
   Twitter Card, JSON-LD, Download link). All values are HTML-escaped.
4. Regenerates `sitemap.xml` (static pages + every public `/u/<uuid>`).
5. Injects crawlable static creation links into `index.html` between the
   `STATIC_CREATIONS` markers (Official Starter ≤6 + newest ≤12). Those links
   are hidden once JS renders the live UI (via the `has-js` class), so there is
   no duplicate content for real users, but they are present in the raw HTML.

The build **fails (non-zero exit)** if the API errors, if generated count ≠
public count, or if a stale non-public page would remain. A broken run never
produces a deployable set.

### Data source override (local/testing)

```bash
PRERENDER_API_BASE=https://mobcrafter.net npm run build   # default
PRERENDER_LIMIT=1 npm run build                            # smoke test: 1 page, no cleanup/sitemap
```

## IMPORTANT: when you MUST re-run the build

D1 content is **not** live-rendered. After any of these, you must re-run
`npm run build` and commit/deploy the result, or the static pages and sitemap
will be stale:

- Publishing a new submission (`is_published` 0 → 1, or a new approved public row)
- Unpublishing a submission (`is_published` 1 → 0) — its `u/<uuid>.html` is
  removed and it drops out of the sitemap and homepage links
- Editing a public submission's title / description / tags / files

Current deploy model: **the generated files are committed to git**; Cloudflare
Pages deploys the committed static output. So the required workflow is:

```bash
npm run build
git add -A
git commit -m "content: re-prerender public creations"
git push
```

## Description audit (read-only)

```bash
node scripts/audit-descriptions.mjs
```

Reports exact-duplicate descriptions, template-only vs. creation-specific
classification, near-duplicate clusters, and enrichment candidates. It does
**not** modify D1.

## Future automation (proposal only — NOT implemented)

To avoid the manual rebuild step, a future option is a **Cloudflare Pages Deploy
Hook** triggered when D1 publish state changes:

1. Create a Deploy Hook URL in the Pages project (Settings → Builds & deployments).
2. Set the Pages build command to `npm run build` (Node ≥18) so Pages runs the
   prerender at deploy time (fetching from the live public API).
3. In the admin/publish flow (Worker), after a successful publish/unpublish,
   `fetch(DEPLOY_HOOK_URL, { method: "POST" })` to trigger a rebuild+deploy.

This is documented here only. **No Worker change has been made** — the current
model remains "run `npm run build` and commit".

## Files

- `scripts/prerender-submissions.mjs` — orchestrator (build entry)
- `scripts/lib/render-template.mjs` — per-page HTML + homepage static block (pure)
- `scripts/lib/extract-shared.mjs` — extracts shared CSS/JS from `u/index.html`
- `scripts/audit-descriptions.mjs` — read-only description audit
- `assets/u-detail.v1.{css,js}` — generated shared assets (do not edit by hand)
- `u/<uuid>.html` — generated public creation pages
- `u/index.html` — SPA fallback (unchanged; still served at `/u/`)
