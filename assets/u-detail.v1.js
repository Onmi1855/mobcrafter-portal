/* AUTO-GENERATED from u/index.html by scripts/prerender-submissions.mjs. Do not edit directly. */
(() => {
  // Optional: ?api=http://127.0.0.1:8788 to point API calls to a different origin (local dev)
  const API_ORIGIN = (() => {
    const v = String(new URLSearchParams(location.search).get("api") || "").trim();
    if (!v) return "";
    try {
      const u = new URL(v, location.href);
      return u.origin;
    } catch {
      return "";
    }
  })();
  const api = (path) => (API_ORIGIN ? (API_ORIGIN + path) : path);

  const API_LIST   = api("/api/public/submissions"); // approved list
  const API_JSON   = (id) => api(`/api/public/submissions/${id}/json`);      // no DL count
  const API_DL     = (id) => api(`/api/public/submissions/${id}/download`);  // increments DL count
  const API_PUBLIC_FILES = (id) => api(`/api/public/submissions/${encodeURIComponent(id)}/files`);
  const API_PUBLIC_CREATORS = api("/api/public/creators");
  const API_WHOAMI = api("/api/whoami");
  const API_OWNER_META = (id) => api(`/api/submissions/${id}`);          // PUT, DELETE
  const API_OWNER_JSON = (id) => api(`/api/submissions/${id}/json`);     // PUT

  const API_PUBLIC_META = (id) => api(`/api/public/submissions/${encodeURIComponent(id)}`);
  const API_PUBLIC_U = (no) => api(`/api/public/u/${encodeURIComponent(no)}`);

  // comments
  const COMMENTS_API = api("/api/comments");
  const COMMENTS_API_PUBLIC = api("/api/public/comments");

  const el = (id) => document.getElementById(id);

  const commentsStateEl = el("commentsState");
  const commentsLoginHintEl = el("commentsLoginHint");
  const commentFormEl = el("commentForm");
  const commentBodyEl = el("commentBody");
  const commentSendEl = el("commentSend");
  const commentPostMsgEl = el("commentPostMsg");
  const commentListEl = el("commentList");
  const commentPagerEl = el("commentPager");
  const commentPrevEl = el("commentPrev");
  const commentNextEl = el("commentNext");
  const commentPageInfoEl = el("commentPageInfo");
  const ogHiddenImg = el("ogImageHidden");
  const heroImgEl = el("heroImg");

  const canonicalLinkEl = el("canonicalLink");
  const ogUrlEl = el("ogUrl");
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
  let jsonCache = { id: null, text: "", obj: null, promise: null };

  function normEmail(v){
    const s = String(v || "").trim().toLowerCase();
    return (s && s.includes("@")) ? s : "";
  }

  function hubLabel(map, value, fallback){
    const key = String(value || "").trim().toLowerCase();
    return map[key] || fallback;
  }

  function fileAvailabilityLabel(value){
    return hubLabel(HUB_FILE_AVAILABILITY_LABELS, value, "JSON");
  }

  function accessTypeLabel(value){
    return hubLabel(HUB_ACCESS_TYPE_LABELS, value, "Free");
  }

  function creationMethodLabel(value){
    return hubLabel(HUB_CREATION_METHOD_LABELS, value, "Hand Built");
  }

  function contentTypeLabel(value){
    return hubLabel(HUB_CONTENT_TYPE_LABELS, value, "MobCrafter Unit");
  }

  function trimText(value, maxLen){
    const text = String(value || "").trim();
    if(!text) return "";
    if(text.length <= maxLen) return text;
    return text.slice(0, Math.max(0, maxLen - 1)).trimEnd() + "…";
  }

  function buildCanonicalPath(item){
    const no = item?.submission_no ?? item?.submissionNo ?? null;
    if(no != null && String(no).trim() !== "") return `/u/${encodeURIComponent(String(no))}`;
    return `/u/${encodeURIComponent(String(item?.id || ""))}`;
  }

  function buildLegacyPath(item){
    const no = item?.submission_no ?? item?.submissionNo ?? null;
    if(no != null && String(no).trim() !== "") return `/unit.html?id=${encodeURIComponent(String(no))}`;
    return `/unit.html?id=${encodeURIComponent(String(item?.id || ""))}`;
  }

  function renderTextList(targetId, items, { ordered=false } = {}){
    const node = el(targetId);
    if(!node) return;
    clearChildren(node);
    const arr = Array.isArray(items) ? items.filter(Boolean) : [];
    if(!arr.length){
      const li = document.createElement("li");
      li.textContent = "No details available yet.";
      node.appendChild(li);
      return;
    }
    for(const text of arr){
      const li = document.createElement("li");
      li.textContent = String(text);
      node.appendChild(li);
    }
  }

  function renderMiniList(targetId, items, { emptyText="Nothing to show yet.", metaBuilder=null, withThumb=false } = {}){
    const node = el(targetId);
    if(!node) return;
    clearChildren(node);
    const arr = Array.isArray(items) ? items : [];
    if(!arr.length){
      const hint = document.createElement("div");
      hint.className = "muted";
      hint.style.fontSize = "13px";
      hint.textContent = emptyText;
      node.appendChild(hint);
      return;
    }
    for(const item of arr){
      const a = document.createElement("a");
      a.className = "miniCard";
      a.href = buildCanonicalPath(item);
      if(withThumb && item.id){
        const img = document.createElement("img");
        img.className = "miniCardThumb";
        img.alt = String(item.title || item.name || "");
        img.loading = "lazy";
        img.decoding = "async";
        img.src = api(`/api/public/submissions/${encodeURIComponent(item.id)}/og-image`);
        a.appendChild(img);
      }
      const body = document.createElement("div");
      body.className = "miniCardBody";
      const title = document.createElement("div");
      title.className = "miniCardTitle";
      title.textContent = String(item.title || item.name || item.unit_id || "Untitled");
      const meta = document.createElement("div");
      meta.className = "miniCardMeta";
      meta.textContent = typeof metaBuilder === "function"
        ? String(metaBuilder(item) || "")
        : `${contentTypeLabel(item.content_type || item.contentType)} \u2022 DL ${Number(item.download_count || item.downloadCount || 0) || 0}`;
      body.appendChild(title);
      body.appendChild(meta);
      a.appendChild(body);
      node.appendChild(a);
    }
  }

  function setCommentsState(msg){
    if(!commentsStateEl) return;
    commentsStateEl.textContent = String(msg || "");
  }

  function setOgImageByKey(key){
    if (!key) return;
    const path = api(`/api/public/submissions/${encodeURIComponent(key)}/og-image`);
    const url = new URL(path, location.href).toString();
    const og = document.querySelector('meta[property="og:image"]');
    const ogs = document.querySelector('meta[property="og:image:secure_url"]');
    const tw = document.querySelector('meta[name="twitter:image"]');
    const ln = document.querySelector('link[rel="image_src"]');
    if (og) og.setAttribute("content", url);
    if (ogs) ogs.setAttribute("content", url);
    if (tw) tw.setAttribute("content", url);
    if (ln) ln.setAttribute("href", url);
    if (ogHiddenImg) ogHiddenImg.src = url;
    if (heroImgEl) heroImgEl.src = url;
    return url;
  }

  function setCanonical(path){
    const p = String(path || "").trim();
    if(!p) return;
    const safe = p.startsWith("/") ? p : ("/" + p);
    const href = new URL(safe, location.origin).toString();
    if (canonicalLinkEl) canonicalLinkEl.setAttribute("href", href);
    return href;
  }

  function setOgUrl(path){
    const p = String(path || "").trim();
    if(!p) return;
    const url = new URL(p.startsWith("/") ? p : ("/" + p), location.origin).toString();
    if (ogUrlEl) ogUrlEl.setAttribute("content", url);
    return url;
  }

  function setPageDescription(text){
    const meta = document.querySelector('meta[name="description"]');
    if(!meta) return;
    meta.setAttribute("content", String(text || "").trim());
  }

  function setStructuredData({ name, imageUrl } = {}){
    const el = document.getElementById("ldJson");
    if (!el) return;
    const data = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": name || "",
      "image": imageUrl || ""
    };
    el.textContent = JSON.stringify(data);
  }

  function clearChildren(node){
    while(node && node.firstChild) node.removeChild(node.firstChild);
  }

  function fmtWhen(iso){
    const s = String(iso || "").trim();
    if(!s) return "";
    try{
      const d = new Date(s);
      if(Number.isNaN(d.getTime())) return s;
      return d.toLocaleString();
    }catch{
      return s;
    }
  }

  async function commentsFetchList(submissionId, page, pageSize){
    const sp = new URLSearchParams();
    sp.set("submission_id", submissionId);
    sp.set("page", String(page));
    sp.set("page_size", String(pageSize));
    // /u/ page shows approved-only units, so comment list can always use public endpoint.
    const url = COMMENTS_API_PUBLIC + "?" + sp.toString();

    const r = await fetch(url, { cache:"no-store", credentials:"include" });
    const t = await r.text();
    let d = null;
    let parsed = false;
    try{ d = JSON.parse(t); parsed = true; }catch{ d = null; parsed = false; }
    if(!parsed && r.ok){
      d = { ok:false, error:"non_json_response" };
    }
    return { ok:(r.ok && parsed), status:r.status, data:d, raw:t };
  }

  async function commentsPost(submissionId, body){
    const r = await fetch(COMMENTS_API, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: { "Content-Type":"application/json", "Accept":"application/json" },
      body: JSON.stringify({ submission_id: submissionId, body })
    });
    const t = await r.text();
    let d = null;
    let parsed = false;
    try{ d = JSON.parse(t); parsed = true; }catch{ d = null; parsed = false; }
    if(!parsed && r.ok){
      d = { ok:false, error:"non_json_response" };
    }
    return { ok:(r.ok && parsed), status:r.status, data:d, raw:t };
  }

  async function commentsDelete(commentId){
    const r = await fetch(api(`/api/comments/${encodeURIComponent(commentId)}`), {
      method: "DELETE",
      cache: "no-store",
      credentials: "include",
      headers: { "Accept":"application/json" }
    });
    const t = await r.text();
    let d = null;
    let parsed = false;
    try{ d = JSON.parse(t); parsed = true; }catch{ d = null; parsed = false; }
    if(!parsed && r.ok){
      d = { ok:false, error:"non_json_response" };
    }
    return { ok:(r.ok && parsed), status:r.status, data:d, raw:t };
  }

  function renderComments(items, { canAdminDelete } = {}){
    if(!commentListEl) return;
    clearChildren(commentListEl);

    if(!Array.isArray(items) || items.length === 0){
      const hint = document.createElement("div");
      hint.className = "commentHint";
      hint.textContent = "No comments yet.";
      commentListEl.appendChild(hint);
      return;
    }

    for(const it of items){
      const wrap = document.createElement("div");
      wrap.className = "commentItem";

      const meta = document.createElement("div");
      meta.className = "commentMeta";

      const left = document.createElement("span");
      const who = String(it?.author_name || it?.authorName || "").trim();
      left.textContent = who ? who : "unknown";

      const right = document.createElement("span");
      right.textContent = fmtWhen(it?.created_at || it?.createdAt || "");

      meta.appendChild(left);
      meta.appendChild(right);

      const body = document.createElement("div");
      body.className = "commentBodyTxt";
      body.textContent = String(it?.body ?? "");

      wrap.appendChild(meta);
      wrap.appendChild(body);

      if(canAdminDelete && it && it.id){
        const actions = document.createElement("div");
        actions.className = "commentActions";
        const del = document.createElement("button");
        del.type = "button";
        del.className = "btn danger";
        del.textContent = "Delete";
        del.onclick = async () => {
          const ok = confirm("Delete this comment? (soft delete)");
          if(!ok) return;
          del.disabled = true;
          try{
            const rr = await commentsDelete(String(it.id));
            if(!rr.ok){
              alert("Delete failed: HTTP " + rr.status);
              return;
            }
            document.dispatchEvent(new CustomEvent("comments:refresh"));
          }finally{
            del.disabled = false;
          }
        };
        actions.appendChild(del);
        wrap.appendChild(actions);
      }

      commentListEl.appendChild(wrap);
    }
  }

  function setPager({ page, totalPages } = {}){
    if(!commentPagerEl) return;
    const p = Number(page || 1);
    const tp = Number(totalPages || 1);
    if(tp <= 1){
      commentPagerEl.style.display = "none";
      return;
    }
    commentPagerEl.style.display = "flex";
    if(commentPrevEl) commentPrevEl.disabled = (p <= 1);
    if(commentNextEl) commentNextEl.disabled = (p >= tp);
    if(commentPageInfoEl) commentPageInfoEl.textContent = `Page ${p} / ${tp}`;
  }

  function initComments(submissionId, { canPost, canAdminDelete } = {}){
    const pageSize = 20;
    let page = 1;
    let loading = false;

    if(commentFormEl) commentFormEl.style.display = canPost ? "block" : "none";
    if(commentsLoginHintEl){
      if(canPost){
        commentsLoginHintEl.style.display = "none";
        commentsLoginHintEl.textContent = "";
      }else{
        commentsLoginHintEl.style.display = "block";
        commentsLoginHintEl.textContent = "Log in to post comments.";
      }
    }

    async function refresh(){
      if(loading) return;
      loading = true;
      setCommentsState("Loading…");
      try{
        const rr = await commentsFetchList(submissionId, page, pageSize);
        if(!rr.ok){
          const base = rr.status === 401 ? "Login required." : rr.status === 403 ? "Forbidden." : "Failed to load.";
          const err = (rr.data && rr.data.error) ? String(rr.data.error) : "";
          const msg = err ? `${base} (${err})` : base;
          setCommentsState(msg);
          renderComments([], { canAdminDelete:false });
          setPager({ page:1, totalPages:1 });
          return;
        }
        const data = rr.data || {};
        const items = Array.isArray(data.items) ? data.items : [];
        const tp = Number(data.total_pages || 1);
        const p = Number(data.page || page);
        page = p || 1;

        setCommentsState(`${items.length} shown`);
        renderComments(items, { canAdminDelete: Boolean(canAdminDelete) });
        setPager({ page, totalPages: tp });
      }catch(e){
        setCommentsState("Failed to load. (network_error)");
        renderComments([], { canAdminDelete:false });
        setPager({ page:1, totalPages:1 });
      }finally{
        loading = false;
      }
    }

    if(commentPrevEl) commentPrevEl.onclick = () => { if(page > 1){ page -= 1; refresh(); } };
    if(commentNextEl) commentNextEl.onclick = () => { page += 1; refresh(); };

    if(commentSendEl){
      commentSendEl.onclick = async () => {
        if(!canPost) return;
        const text = String(commentBodyEl?.value ?? "").trim();
        if(!text){
          if(commentPostMsgEl) commentPostMsgEl.textContent = "Empty.";
          return;
        }
        if(text.length > 1000){
          if(commentPostMsgEl) commentPostMsgEl.textContent = "Too long.";
          return;
        }
        commentSendEl.disabled = true;
        if(commentPostMsgEl) commentPostMsgEl.textContent = "Sending…";
        try{
          const rr = await commentsPost(submissionId, text);
          if(!rr.ok){
            const base = rr.status === 429 ? "Too fast. Please wait." : rr.status === 401 ? "Login required." : rr.status === 403 ? "Forbidden." : "Post failed.";
            const err = (rr.data && rr.data.error) ? String(rr.data.error) : "";
            const msg = err ? `${base} (${err})` : base;
            if(commentPostMsgEl) commentPostMsgEl.textContent = msg;
            return;
          }
          if(commentBodyEl) commentBodyEl.value = "";
          if(commentPostMsgEl) commentPostMsgEl.textContent = "Posted.";
          page = 1;
          await refresh();
          setTimeout(()=>{ if(commentPostMsgEl) commentPostMsgEl.textContent = ""; }, 1200);
        }catch(e){
          if(commentPostMsgEl) commentPostMsgEl.textContent = "Post failed. (network_error)";
        }finally{
          commentSendEl.disabled = false;
        }
      };
    }

    document.addEventListener("comments:refresh", () => refresh());
    refresh();
  }

  function escapeHtml(s){
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#39;");
  }

  function iconLabel(iconName, text, { wrapperClass="ui-label", iconClass="ui-ico ui-ico-sm" } = {}){
    if(!iconName || !window.MobUi || typeof window.MobUi.label !== "function") return escapeHtml(text);
    return window.MobUi.label(iconName, text, { wrapperClass, iconClass });
  }

  function setActionText(node, iconName, text){
    if(!node) return;
    if(window.MobUi && typeof window.MobUi.set === "function"){
      window.MobUi.set(node, iconName, text, { wrapperClass: "ui-label", iconClass: "ui-ico ui-ico-sm" });
      return;
    }
    node.textContent = text;
  }

  function normalizeTags(t){
    if(!t) return [];
    if(Array.isArray(t)) return t.map(x=>String(x).trim()).filter(Boolean);
    return String(t).split(/[\s,]+/).map(x=>x.trim()).filter(Boolean);
  }

  function kvRow(k,v){
    return `<div class="k">${escapeHtml(k)}</div><div>${escapeHtml(v ?? "")}</div>`;
  }

  function appendStatChip(target, text, { official=false, iconName="" } = {}){
    if(!target || !text) return;
    const span = document.createElement("span");
    span.className = `tag heroBadge${official ? " official" : ""}`;
    if(official || iconName){
      span.innerHTML = iconLabel(iconName || "official", String(text), { wrapperClass: "ui-badge-label", iconClass: "ui-ico ui-ico-xs" });
    }else{
      span.textContent = String(text);
    }
    target.appendChild(span);
  }

  function fillHeroBadges(item){
    const node = el("heroBadges");
    if(!node) return;
    clearChildren(node);
    appendStatChip(node, contentTypeLabel(item.content_type || item.contentType), { iconName: "grid" });
    appendStatChip(node, fileAvailabilityLabel(item.file_availability || item.fileAvailability), { iconName: "file" });
    const accessRaw = String(item.access_type || item.accessType || "").trim().toLowerCase();
    appendStatChip(node, accessTypeLabel(item.access_type || item.accessType), { iconName: accessRaw && accessRaw !== "free" ? (accessRaw === "external" ? "external" : "support") : "" });
    appendStatChip(node, creationMethodLabel(item.creation_method || item.creationMethod));
    if(Boolean(item.is_official_starter || item.isOfficialStarter)) appendStatChip(node, "Official Starter", { official: true });
  }

  function getRequiredModsFromJson(j){
    try{
      if(!j || typeof j !== "object") return [];
      const mods = new Set();
      const add = (bid) => {
        const s = String(bid || "").trim();
        if(!s) return;
        const idx = s.indexOf(":");
        if(idx <= 0) return;
        const ns = s.slice(0, idx).trim().toLowerCase();
        if(!ns || ns === "minecraft" || ns === "mobcrafter") return;
        mods.add(ns);
      };

      const blocks = j.blocks;
      if(Array.isArray(blocks)){
        for(const b of blocks) add(b && (b.blockId || b.block_id || b.id || b.block));
      }else if(blocks && typeof blocks === "object"){
        const pal = blocks.palette;
        if(Array.isArray(pal)){
          for(const bid of pal) add(bid);
        }
      }
      return Array.from(mods).sort();
    }catch{
      return [];
    }
  }

  function buildHowToLines(item, files = []){
    const fileAvailability = String(item.file_availability || item.fileAvailability || "json").trim().toLowerCase() || "json";
    const accessType = String(item.access_type || item.accessType || "free").trim().toLowerCase() || "free";
    const unitId = String(item.unit_id || item.unitId || item.id || "").trim();
    const lines = [];

    if(fileAvailability === "external"){
      lines.push("Open the external release link to access the creator-provided files.");
    }else if(fileAvailability === "schem"){
      lines.push("Download the schematic from the included files list.");
      lines.push("Import it with your preferred schematic workflow or use it as a build reference.");
    }else if(fileAvailability === "zip"){
      lines.push("Download the included ZIP or pack from the files list.");
      lines.push("Unpack it and follow the creator notes for any world, asset, or extra-file instructions.");
    }else{
      lines.push("Download the MobCrafter JSON file.");
      lines.push(`The filename and JSON id/unitId should match. Example: ${unitId || "your-unit"}.json`);
      lines.push("Place the JSON into: config/mob_crafter/units/");
      lines.push("Load or summon the unit in-game.");
    }

    if(fileAvailability === "both" || files.some((file) => String(file.file_kind || "").trim().toLowerCase() === "schem")){
      lines.push("Use the included schematic if you want to rebuild or inspect the structure outside the summon workflow.");
    }

    if(files.some((file) => ["zip", "world", "asset"].includes(String(file.file_kind || "").trim().toLowerCase()))){
      lines.push("Check the included files list for packs, worlds, or creator assets that accompany this release.");
    }

    if(accessType !== "free"){
      lines.push("Review the creator support links before downloading any off-site or supporter-only extras.");
    }

    return lines;
  }

  function buildRequirementLines(item, requiredMods = []){
    const fileAvailability = String(item.file_availability || item.fileAvailability || "json").trim().toLowerCase() || "json";
    const lines = ["Minecraft Forge 1.20.1 with MobCrafter installed."];

    if(requiredMods.length){
      lines.push(`Additional block mods detected from the JSON: ${requiredMods.join(", ")}.`);
    }else{
      lines.push("Install any dependency mods mentioned by the creator before loading the release.");
    }

    if(fileAvailability === "schem" || fileAvailability === "both"){
      lines.push("A schematic-compatible workflow is required if you want to rebuild the design from the included files.");
    }

    if(fileAvailability === "external"){
      lines.push("Some files are hosted off-site, so availability and install steps depend on the creator’s external page.");
    }

    return lines;
  }

  function buildHowTo(item, files = []){
    return [
      "[How to use this MobCrafter Hub release]",
      ...buildHowToLines(item, files).map((line, index) => `${index + 1}) ${line}`),
      "",
      "Note: Hub keeps the legacy JSON compatibility behavior, including server-enforced unitId/id consistency when JSON is resaved."
    ].join("\n");
  }

  async function fetchPublicJsonOnce(id){
    const key = String(id || "").trim();
    if(!key) return { text: "", obj: null };
    if(jsonCache.id === key && jsonCache.promise) return jsonCache.promise;

    jsonCache.id = key;
    jsonCache.promise = fetch(API_JSON(key), { cache:"no-store" })
      .then(async (r) => {
        if(!r.ok) throw new Error("json HTTP " + r.status);
        const text = await r.text();
        let obj = null;
        try{ obj = JSON.parse(text); }catch{ obj = null; }
        jsonCache.text = text;
        jsonCache.obj = obj;
        return { text, obj };
      })
      .catch((error) => {
        jsonCache.text = "";
        jsonCache.obj = null;
        jsonCache.promise = null;
        throw error;
      });

    return jsonCache.promise;
  }

  async function fetchPublicFiles(id){
    const r = await fetch(API_PUBLIC_FILES(id), { cache:"no-store" });
    const t = await r.text();
    let d = null;
    try{ d = JSON.parse(t); }catch{ d = null; }
    if(!r.ok || !d || d.ok !== true) return [];
    return Array.isArray(d.items) ? d.items : [];
  }

  async function fetchCreatorProfile(item){
    const email = normEmail(item.author_email || item.authorEmail || "");
    const author = String(item.author_name || item.authorName || item.author || "").trim();
    if(!email && !author) return null;

    const sp = new URLSearchParams();
    if(email) sp.set("email", email);
    else sp.set("author", author);

    const r = await fetch(API_PUBLIC_CREATORS + "?" + sp.toString(), { cache:"no-store" });
    const t = await r.text();
    let d = null;
    try{ d = JSON.parse(t); }catch{ d = null; }
    if(!r.ok || !d || d.ok !== true) return null;
    return d;
  }

  function buildCreatorPageHref(item, profile = null){
    const email = normEmail(profile?.author_email || item.author_email || item.authorEmail || "");
    const author = String(profile?.author_name || item.author_name || item.authorName || item.author || "").trim();
    if(email) return `/creators/?email=${encodeURIComponent(email)}`;
    if(author) return `/creators/?author=${encodeURIComponent(author)}`;
    return "/creators/";
  }

  async function fetchRelatedItems(item){
    const tags = normalizeTags(item.tags).filter((tag) => !["featured", "starter", "vanilla", "beginner"].includes(String(tag || "").trim().toLowerCase()));
    const titleWord = String(item.title || item.name || "")
      .split(/\s+/)
      .map((part) => String(part || "").trim())
      .find((part) => part.length >= 4);
    const query = tags[0] || titleWord || String(item.author_name || item.authorName || "").trim();
    if(!query) return [];

    const sp = new URLSearchParams();
    sp.set("q", query);
    sp.set("page", "1");
    sp.set("page_size", "8");
    sp.set("sort", "dl");

    const r = await fetch(API_LIST + "?" + sp.toString(), { cache:"no-store" });
    const t = await r.text();
    let d = null;
    try{ d = JSON.parse(t); }catch{ d = null; }
    if(!r.ok || !d) return [];
    return (Array.isArray(d.items) ? d.items : []).filter((other) => String(other.id || "") !== String(item.id || "")).slice(0, 5);
  }

  function renderIncludedList(item, files = []){
    const node = el("includedList");
    if(!node) return;
    clearChildren(node);

    const addEntry = (text, href) => {
      const li = document.createElement("li");
      if(href){
        const a = document.createElement("a");
        a.href = href;
        if(/^https?:\/\//i.test(href)){
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
        a.textContent = text;
        li.appendChild(a);
      }else{
        li.textContent = text;
      }
      node.appendChild(li);
    };

    const fileAvailability = String(item.file_availability || item.fileAvailability || "json").trim().toLowerCase() || "json";
    if(fileAvailability === "json" || fileAvailability === "both"){
      addEntry("MobCrafter JSON unit file", API_DL(item.id));
    }
    if(fileAvailability === "external" && item.external_url){
      addEntry("External release page", String(item.external_url));
    }

    for(const file of (files || []).slice(0, 8)){
      const kind = String(file.file_kind || file.fileKind || "file").trim().toUpperCase();
      const label = String(file.label || file.original_name || file.name || kind).trim();
      const rawHref = String(file.download_path || file.external_url || "").trim();
      const href = rawHref && /^https?:\/\//i.test(rawHref) ? rawHref : (rawHref ? api(rawHref) : "");
      addEntry(`${kind}: ${label}`, href || null);
    }

    if(!node.childNodes.length) addEntry("No included files listed yet.");
  }

  function renderCreatorProfile(data, item){
    const summaryEl = el("creatorSummary");
    const statsEl = el("creatorStats");
    const actionsEl = el("creatorActions");
    if(statsEl) clearChildren(statsEl);
    if(actionsEl) clearChildren(actionsEl);

    if(!data || !data.profile){
      if(summaryEl) summaryEl.textContent = `Public creator snapshot is not available yet.`;
      if(actionsEl){
        const a = document.createElement("a");
        a.className = "btn";
        a.href = buildCreatorPageHref(item);
        a.innerHTML = iconLabel("users", "View creator page");
        actionsEl.appendChild(a);
      }
      renderMiniList("moreByList", [], { emptyText: "No other public creations from this creator yet." });
      return;
    }

    const profile = data.profile || {};
    if(summaryEl){
      summaryEl.textContent = `${profile.author_name || "unknown"} has ${Number(profile.creations_count || 0) || 0} public release(s), ${Number(profile.downloads_total || 0) || 0} download(s), and ${Number(profile.likes_total || 0) || 0} like(s) across Hub.`;
    }
    appendStatChip(statsEl, `${Number(profile.creations_count || 0) || 0} creations`, { iconName: "grid" });
    appendStatChip(statsEl, `${Number(profile.downloads_total || 0) || 0} downloads`, { iconName: "download" });
    appendStatChip(statsEl, `${Number(profile.likes_total || 0) || 0} likes`);
    if(Boolean(profile.is_official_starter)) appendStatChip(statsEl, "Official Starter", { official: true });

    if(actionsEl){
      const pageLink = document.createElement("a");
      pageLink.className = "btn";
      pageLink.href = buildCreatorPageHref(item, profile);
      pageLink.innerHTML = iconLabel("users", "View creator page");
      actionsEl.appendChild(pageLink);
    }

    const links = Array.isArray(data.links) ? data.links : [];
    const unique = [];
    const seen = new Set();
    for(const link of links){
      const href = String(link?.url || "").trim();
      if(!href || seen.has(href)) continue;
      seen.add(href);
      unique.push({ href, label: link?.kind === "support" ? "Support creator" : "Open external link" });
    }
    if(item.support_url && !seen.has(item.support_url)) unique.unshift({ href: String(item.support_url), label: "Support creator" });

    for(const link of unique.slice(0, 4)){
      const a = document.createElement("a");
      a.className = "btn";
      a.href = link.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.innerHTML = iconLabel(link.label === "Support creator" ? "support" : "external", link.label);
      actionsEl.appendChild(a);
    }

    const moreBy = (Array.isArray(data.items) ? data.items : []).filter((other) => String(other.id || "") !== String(item.id || "")).slice(0, 5);
    renderMiniList("moreByList", moreBy, { emptyText: "No other public creations from this creator yet.", withThumb: true });
  }

  function setPrimaryAction(item, files = []){
    const btn = el("downloadBtn");
    if(!btn) return;

    const fileAvailability = String(item.file_availability || item.fileAvailability || "json").trim().toLowerCase() || "json";
    const reset = () => {
      btn.removeAttribute("download");
      btn.removeAttribute("target");
      btn.removeAttribute("rel");
    };

    reset();

    if(fileAvailability === "external" && item.external_url){
      setActionText(btn, "external", "Open External Release");
      btn.href = String(item.external_url);
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
      return;
    }

    if(fileAvailability === "json" || fileAvailability === "both"){
      setActionText(btn, "download", "Download JSON");
      btn.href = API_DL(item.id);
      btn.setAttribute("download", "");
      return;
    }

    const preferred = (files || []).find((file) => {
      const kind = String(file.file_kind || file.fileKind || "").trim().toLowerCase();
      return kind === "schem" || kind === "zip" || kind === "world" || kind === "asset";
    }) || (files || [])[0];

    if(preferred && preferred.download_path){
      const kind = String(preferred.file_kind || preferred.fileKind || "file").trim().toUpperCase();
      const resolvedPath = /^https?:\/\//i.test(String(preferred.download_path)) ? String(preferred.download_path) : api(String(preferred.download_path));
      setActionText(btn, /^https?:\/\//i.test(resolvedPath) ? "external" : "download", `Download ${kind}`);
      btn.href = resolvedPath;
      if(/^https?:\/\//i.test(btn.href)){
        btn.target = "_blank";
        btn.rel = "noopener noreferrer";
      }
      return;
    }

    setActionText(btn, "file", "See Included Files");
    btn.href = "#includedList";
  }

  function getKeyFromUrl(){
    // 正規: /u/13 または /u/<uuid>
    let m = location.pathname.match(/^\/u\/([^\/?#]+)/);
    if (m) {
      const pathKey = decodeURIComponent(m[1]);
      if(pathKey && pathKey.toLowerCase() !== "index.html") return pathKey;
    }

    // 404ルーティング: /u/index.html?p=/u/13
    const p = decodeURIComponent(new URLSearchParams(location.search).get("p") || "").trim();
    m = p.match(/^\/u\/([^\/?#]+)/);
    if (m) return decodeURIComponent(m[1]);
    if(p && p !== "/u/" && p.toLowerCase() !== "/u/index.html") return p;

    return null;
  }

  async function fetchItemByKey(key){
    const k = String(key || "").trim();
    if(!k) return null;

    // numeric submission_no
    if(/^\d+$/.test(k)){
      const r = await fetch(API_PUBLIC_U(k), { cache:"no-store" });
      const t = await r.text();
      let d = null;
      try{ d = JSON.parse(t); }catch{ d = null; }
      if(!r.ok || !d || d.ok !== true) return null;
      return d.item || null;
    }

    // UUID
    const r = await fetch(API_PUBLIC_META(k), { cache:"no-store" });
    const t = await r.text();
    let d = null;
    try{ d = JSON.parse(t); }catch{ d = null; }
    if(!r.ok || !d) return null;
    return d;
  }

  async function apiJson(url, method, bodyObj){
    const r = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type":"application/json", "Accept":"application/json" },
      body: bodyObj ? JSON.stringify(bodyObj) : undefined
    });
    const text = await r.text();
    let data = null;
    try { data = JSON.parse(text); } catch { data = { raw:text }; }
    if(!r.ok){
      const err = new Error("HTTP " + r.status);
      err.status = r.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  function setMsg(html){
    el("msg").innerHTML = html || "";
  }

  function setEditorMsg(html){
    el("editorMsg").innerHTML = html || "";
  }

  function fillEditorFromItem(item){
    el("editTitle").value = item.title || "";
    el("editDesc").value  = item.description || "";
    el("editTags").value  = normalizeTags(item.tags).join(" ");
  }

  async function load(){
    const key = getKeyFromUrl();
    if(!key){
      setMsg(`<div class="err">Invalid URL. Please open the unit from the list.</div>`);
      return;
    }

    const ogUrl = setOgImageByKey(key);

    const item = (window.__PRERENDER_ITEM__ && typeof window.__PRERENDER_ITEM__ === "object") ? window.__PRERENDER_ITEM__ : await fetchItemByKey(key);

    if(!item){
      setMsg(`<div class="err">Unit not found.\n(It may be missing from the approved list or already deleted.)</div>`);
      return;
    }

    // canonical/seo
    const no = item.submission_no ?? item.submissionNo ?? null;
    const canonicalPath = buildCanonicalPath(item);
    setCanonical(canonicalPath);
    setOgUrl(canonicalPath);
    document.title = `MobCrafter Hub | ${String(item.title || item.name || "Creation").trim()}` + (no != null ? ` (#${no})` : "");
    setPageDescription(trimText(String(item.description || "").trim(), 160) || `View this MobCrafter Hub release: ${String(item.title || item.name || "Creation").trim()}`);

    // --- whoami (used for editor + comment posting permission) ---
    let who = { ok:true, email:null, is_admin:false };
    try{
      who = await apiJson(API_WHOAMI, "GET");
    }catch{
      who = { ok:false, email:null, is_admin:false };
    }

    // comments - use submission UUID
    try{
      initComments(String(item.id), { canPost: Boolean(who && who.email), canAdminDelete: Boolean(who && who.is_admin) });
    }catch{
      setCommentsState("Comments unavailable");
    }

    // 表示
    el("title").textContent = item.title || item.name || "Untitled";
    setStructuredData({ name: (item.title || item.name || "Untitled"), imageUrl: ogUrl });
    el("sub").textContent = `${contentTypeLabel(item.content_type || item.contentType)} • ${fileAvailabilityLabel(item.file_availability || item.fileAvailability)} • by ${item.author_name || item.authorName || "unknown"}`;
    fillHeroBadges(item);

    const tags = normalizeTags(item.tags);
    el("tags").innerHTML = tags.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("");

    const aboutBodyEl = el("aboutBody");
    if (aboutBodyEl) {
      const desc = String(item.description || "").trim();
      const FALLBACK = "This MobCrafter release includes a downloadable creation for Minecraft. Check the included files and dependency information before downloading.";
      aboutBodyEl.textContent = desc || FALLBACK;
    }

    el("kv").innerHTML = [
      kvRow("Created", item.created_at || ""),
      kvRow("Updated", item.updated_at || item.created_at || ""),
      kvRow("Downloads", item.download_count ?? 0),
      kvRow("Views", item.view_count ?? item.viewCount ?? 0),
      kvRow("Format", fileAvailabilityLabel(item.file_availability || item.fileAvailability)),
      kvRow("Content type", contentTypeLabel(item.content_type || item.contentType)),
      kvRow("Access", accessTypeLabel(item.access_type || item.accessType)),
      kvRow("Creation method", creationMethodLabel(item.creation_method || item.creationMethod)),
      kvRow("mod_version", item.mod_version || "Forge"),
      kvRow("submission_no", item.submission_no ?? ""),
      kvRow("unit_id", item.unit_id ?? ""),
      kvRow("Author", item.author_name || "unknown")
    ].join("");

    if(el("supportBtn")){
      const supportUrl = String(item.support_url || item.supportUrl || "").trim();
      if(supportUrl){
        el("supportBtn").style.display = "inline-flex";
        el("supportBtn").href = supportUrl;
        setActionText(el("supportBtn"), String(item.access_type || item.accessType || "") === "patreon_linked" ? "external" : "support", String(item.access_type || item.accessType || "") === "patreon_linked" ? "Open Patreon" : "Support creator");
      }else{
        el("supportBtn").style.display = "none";
      }
    }

    // 3D preview — lazy: show card, inject iframe only on "Load 3D Preview" click
    (() => {
      const fa = String(item.file_availability || item.fileAvailability || "").toLowerCase();
      const hasJsonFile = fa === "json" || fa === "both";
      const hasSchemOnly = fa === "schem";
      const legacyPath = buildLegacyPath(item);
      const apiParam = API_ORIGIN ? `&api=${encodeURIComponent(API_ORIGIN)}` : "";
      const fullSrc = legacyPath + "&embed=1" + apiParam;
      const box = el("preview3dBox");
      const newTab = el("preview3dNewTab");
      const noJsonBox = el("preview3dNoJsonBox");
      const lazyDiv = el("preview3dLazy");
      const loadBtn = el("preview3dLoadBtn");
      if (hasJsonFile) {
        if (newTab) newTab.href = legacyPath; // open-in-new-tab goes to full unit.html
        if (box) box.style.display = "block";
        if (loadBtn) {
          loadBtn.onclick = () => {
            if (el("preview3dFrame")) return; // already loaded
            const frame = document.createElement("iframe");
            frame.id = "preview3dFrame";
            frame.title = "3D Preview";
            frame.setAttribute("loading", "eager");
            frame.src = fullSrc;
            if (lazyDiv) lazyDiv.style.display = "none";
            if (box) box.appendChild(frame);
          };
        }
      } else if (hasSchemOnly) {
        if (noJsonBox) noJsonBox.style.display = "block";
      }
    })();

    let publicFiles = [];
    setPrimaryAction(item, publicFiles);
    renderIncludedList(item, publicFiles);
    renderTextList("useList", buildHowToLines(item, publicFiles), { ordered: true });
    renderTextList("requirementsList", buildRequirementLines(item, []));
    el("howto").textContent = buildHowTo(item, publicFiles);

    // Screenshot gallery — fetch all screens, show gallery strip when > 1
    void fetch(api(`/api/public/submissions/${encodeURIComponent(item.id)}/screens`), { cache: "no-store", credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const screens = Array.isArray(data && data.screens) ? data.screens : [];
        if (screens.length < 2) return;
        const gallery = el("screensGallery");
        if (!gallery) return;
        // Reverse to get upload order (API returns DESC); put thumb first
        const thumbId = item.thumb_screen_id;
        const sorted = [...screens].reverse();
        if (thumbId) {
          const ti = sorted.findIndex(s => s.id === thumbId);
          if (ti > 0) sorted.unshift(sorted.splice(ti, 1)[0]);
        }
        gallery.innerHTML = sorted.map((s, i) => {
          const src = api(`/api/public/screens/${encodeURIComponent(s.id)}`);
          const isThumb = s.id === thumbId || i === 0;
          return `<img src="${src}" alt="Screenshot ${i+1}" loading="lazy"
            class="ss-img${isThumb ? " ss-active" : ""}"
            title="${isThumb ? "Main thumbnail" : "Screenshot "+(i+1)}"
            onclick="document.getElementById('heroImg').src=this.src;
              this.closest('.screensGallery').querySelectorAll('img').forEach(function(e){e.classList.remove('ss-active')});
              this.classList.add('ss-active');" />`;
        }).join("");
        gallery.style.display = "flex";
      })
      .catch(() => {});

    if(el("creatorSummary")) el("creatorSummary").textContent = "Loading creator snapshot...";
    renderMiniList("moreByList", [], { emptyText: "Loading creator releases…" });
    renderMiniList("relatedList", [], { emptyText: "Looking for related creations..." });

    // JSONプレビュー（開いた時だけ描画、取得はキャッシュ）
    const jsonDetails = el("jsonDetails");
    const _faForJson = String(item.file_availability || item.fileAvailability || "").toLowerCase();
    if (_faForJson !== "json" && _faForJson !== "both") {
      if (jsonDetails) jsonDetails.style.display = "none";
    } else {
      let jsonLoaded = false;
      jsonDetails.addEventListener("toggle", async () => {
        if(!jsonDetails.open) return;
        if(jsonLoaded) return;
        jsonLoaded = true;
        try{
          const data = await fetchPublicJsonOnce(item.id);
          const MAX_JSON_PREVIEW = 50 * 1024;
          const text = data.text;
          el("jsonPreview").textContent = text.length > MAX_JSON_PREVIEW
            ? text.substring(0, MAX_JSON_PREVIEW) + '\n\n... [Large JSON (' + Math.round(text.length / 1024) + 'KB) — use Download JSON for the full file]'
            : text;
        }catch(e){
          el("jsonPreview").textContent = "JSON preview unavailable: " + String(e.message || e);
        }
      });
    }

    // copy howto
    el("copyBtn").onclick = async () => {
      try{
        await navigator.clipboard.writeText(buildHowTo(item, publicFiles));
        setMsg(`<div class="muted" style="margin-top:12px;">Copied.</div>`);
        setTimeout(()=> setMsg(""), 1500);
      }catch{
        setMsg(`<div class="err">Copy failed.</div>`);
      }
    };

    void fetchPublicFiles(item.id)
      .then((files) => {
        publicFiles = Array.isArray(files) ? files : [];
        setPrimaryAction(item, publicFiles);
        renderIncludedList(item, publicFiles);
        renderTextList("useList", buildHowToLines(item, publicFiles), { ordered: true });
        el("howto").textContent = buildHowTo(item, publicFiles);

        // SCHEM secondary download button — only show when JSON is also present
        // (SCHEM-only submissions already have primary "Download SCHEM" button)
        const schemFile = publicFiles.find(f => String(f.file_kind || "").toLowerCase() === "schem");
        const schemBtn = el("schemDownloadBtn");
        const _fa = String(item.file_availability || "").toLowerCase();
        if (schemFile && schemBtn && schemFile.download_path && _fa === "both") {
          schemBtn.href = api(schemFile.download_path);
          schemBtn.style.display = "inline-flex";
        }

        // ZIP secondary download button
        const zipFile = publicFiles.find(f => ["zip", "world"].includes(String(f.file_kind || "").toLowerCase()));
        const zipBtn = el("zipDownloadBtn");
        if (zipFile && zipBtn && zipFile.download_path) {
          zipBtn.href = api(zipFile.download_path);
          zipBtn.style.display = "inline-flex";
        }
      })
      .catch(() => {});

    void fetchPublicJsonOnce(item.id)
      .then((data) => {
        const requiredMods = getRequiredModsFromJson(data.obj);
        renderTextList("requirementsList", buildRequirementLines(item, requiredMods));
      })
      .catch(() => {});

    void fetchCreatorProfile(item)
      .then((data) => renderCreatorProfile(data, item))
      .catch(() => {
        if(el("creatorSummary")) el("creatorSummary").textContent = `Public creator snapshot is not available yet.`;
        renderMiniList("moreByList", [], { emptyText: "No other public creations from this creator yet." });
      });

    void fetchRelatedItems(item)
      .then((items) => renderMiniList("relatedList", items, { emptyText: "No related creations yet.", withThumb: true }))
      .catch(() => renderMiniList("relatedList", [], { emptyText: "No related creations yet." }));

    if(who && who.email){
      el("editor").style.display = "block";
      el("whoamiLine").textContent = `login: ${who.email}` + (who.is_admin ? " (admin)" : "");

      fillEditorFromItem(item);

      // 現在JSON読み込み
      el("loadJsonBtn").onclick = async () => {
        setEditorMsg(`<div class="muted" style="margin-top:10px;">Loading...</div>`);
        try{
          const r = await fetch(API_JSON(item.id), { cache:"no-store", credentials:"include" });
          if(!r.ok) throw new Error("json HTTP " + r.status);
          const text = await r.text();
          el("editJson").value = text;
          setEditorMsg(`<div class="okmsg">Loaded.</div>`);
          setTimeout(()=> setEditorMsg(""), 1200);
        }catch(e){
          setEditorMsg(`<div class="err">Fetch failed: ${escapeHtml(String(e.message || e))}</div>`);
        }
      };

      // メタ保存
      el("saveMetaBtn").onclick = async () => {
        const btn = el("saveMetaBtn");
        btn.disabled = true;
        setEditorMsg(`<div class="muted" style="margin-top:10px;">Saving...</div>`);
        try{
          const body = {
            title: el("editTitle").value || "",
            description: el("editDesc").value || "",
            tags: el("editTags").value || ""
          };
          await apiJson(API_OWNER_META(item.id), "PUT", body);
          setEditorMsg(`<div class="okmsg">Saved.</div>`);
          // 画面へ反映（軽量）
          item.title = body.title;
          item.description = body.description;
          item.tags = body.tags;
          el("title").textContent = item.title || "Untitled";
          el("tags").innerHTML = normalizeTags(item.tags).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("");
          // kvの説明は元UIに無いので更新しない（必要なら後で）
          setTimeout(()=> setEditorMsg(""), 1500);
        }catch(e){
          const hint = e.status === 403 ? "No permission (owner/admin only)." : "Save failed.";
          setEditorMsg(`<div class="err">${escapeHtml(hint)}\n${escapeHtml(JSON.stringify(e.data || {}, null, 2))}</div>`);
        }finally{
          btn.disabled = false;
        }
      };

      // JSON保存
      el("saveJsonBtn").onclick = async () => {
        const btn = el("saveJsonBtn");
        btn.disabled = true;
        setEditorMsg(`<div class="muted" style="margin-top:10px;">Saving...</div>`);
        try{
          const raw = el("editJson").value || "";
          let obj = null;
          try{ obj = JSON.parse(raw); }catch{ throw new Error("Invalid JSON format"); }
          await apiJson(API_OWNER_JSON(item.id), "PUT", { json: obj });
          setEditorMsg(`<div class="okmsg">Saved JSON (unitId is enforced server-side).</div>`);
          // プレビューも更新したい場合に備えてリセット
          el("jsonPreview").textContent = "...";
          setTimeout(()=> setEditorMsg(""), 1700);
        }catch(e){
          const hint = e.status === 403 ? "No permission (owner/admin only)." : (e.message || "Save failed");
          setEditorMsg(`<div class="err">${escapeHtml(String(hint))}</div>`);
        }finally{
          btn.disabled = false;
        }
      };

      // 削除
      el("deleteBtn").onclick = async () => {
        const ok = confirm("Delete (soft delete)?\nIt will be removed from list/details/download.\nContinue?");
        if(!ok) return;
        const btn = el("deleteBtn");
        btn.disabled = true;
        setEditorMsg(`<div class="muted" style="margin-top:10px;">Deleting...</div>`);
        try{
          await apiJson(API_OWNER_META(item.id), "DELETE");
          setEditorMsg(`<div class="okmsg">Deleted. Returning to home.</div>`);
          setTimeout(()=> location.href = "/", 900);
        }catch(e){
          const hint = e.status === 403 ? "No permission (owner/admin only)." : "Delete failed.";
          setEditorMsg(`<div class="err">${escapeHtml(hint)}\n${escapeHtml(JSON.stringify(e.data || {}, null, 2))}</div>`);
          btn.disabled = false;
        }
      };
    }
  }

  load().catch(e => {
    el("msg").innerHTML = `<div class="err">Failed to load:\n${escapeHtml(String(e.message || e))}</div>`;
  });
})();
