(() => {
  // Adsterra banner loader (160x600) — safe, single-slot
  // - Avoids duplicate loads
  // - Does not throw even if blocked
  // - Renders inside an isolated iframe (prevents document.write issues)

  const HOST_SELECTOR = "[data-adsterra-banner-host]";
  const CONTAINER_SRC = "/assets/adsterra-container.v1.html?v=20260111e";

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
      // Some providers require a full referrer URL to validate placement.
      frame.referrerPolicy = "unsafe-url";
      // NOTE: Do NOT add allow-same-origin; we want isolation.
      frame.setAttribute(
        "sandbox",
        "allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      );
      frame.setAttribute("scrolling", "no");
      host.appendChild(frame);

      // Use a first-party HTML container so document.location/referrer look normal.
      // This improves compatibility with some providers that bail out on about:srcdoc.
      frame.src = CONTAINER_SRC;
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
