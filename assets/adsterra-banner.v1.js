(() => {
  // Adsterra banner loader (160x600) — safe, single-slot
  // - Avoids duplicate loads
  // - Does not throw even if blocked
  // - Renders inside an isolated iframe (prevents document.write issues)

  const HOST_SELECTOR = "[data-adsterra-banner-host]";
  const SCRIPT_SRC = "https://www.highperformanceformat.com/2d5106258af9409063c547ff07cdce76/invoke.js";

  const OPTIONS = {
    key: "2d5106258af9409063c547ff07cdce76",
    format: "iframe",
    height: 600,
    width: 160,
    params: {},
  };

  const boot = () => {
    try {
      const host = document.querySelector(HOST_SELECTOR);
      if (!host) return;
      if (host.getAttribute("data-adsterra-mounted") === "1") return;

      host.setAttribute("data-adsterra-mounted", "1");

      // Render inside an iframe so provider scripts that use document.write won't affect the main page.
      host.textContent = "";
      const frame = document.createElement("iframe");
      frame.width = String(OPTIONS.width);
      frame.height = String(OPTIONS.height);
      frame.style.border = "0";
      frame.style.overflow = "hidden";
      frame.loading = "lazy";
      frame.title = "advertisement";
      frame.referrerPolicy = "no-referrer-when-downgrade";
      // NOTE: Do NOT add allow-same-origin; we want isolation.
      // Use srcdoc so we don't need to access contentDocument (blocked by sandbox).
      frame.setAttribute(
        "sandbox",
        "allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      );
      frame.setAttribute("scrolling", "no");
      host.appendChild(frame);

      const optionsJson = JSON.stringify({
        key: OPTIONS.key,
        format: OPTIONS.format,
        height: OPTIONS.height,
        width: OPTIONS.width,
        params: OPTIONS.params,
      });

      frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0; padding:0; overflow:hidden;">
<script>var atOptions=${optionsJson};</script>
<script src="${SCRIPT_SRC}"></script>
</body></html>`;
    } catch {
      // never block page
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
