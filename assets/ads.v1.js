(() => {
  const cfg = window.MOBCRAFTER_ADS;
  if (!cfg || !cfg.enabled) return;

  const client = String(cfg.client || "").trim();
  if (!client || !client.startsWith("ca-pub-")) {
    // Misconfigured: do not attempt to load ads
    return;
  }

  const getSlot = (key) => {
    const slots = (cfg && cfg.slots) ? cfg.slots : null;
    const v = slots ? slots[key] : "";
    return String(v || "").trim();
  };

  const ensureAdSenseScript = () => {
    if (document.querySelector('script[data-mobcrafter-adsense="1"]')) return;

    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-mobcrafter-adsense", "1");
    s.crossOrigin = "anonymous";
    s.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
      encodeURIComponent(client);
    document.head.appendChild(s);
  };

  const mountSlot = (host) => {
    const key = host.getAttribute("data-ad-slot-key") || "";
    const slot = getSlot(key);
    if (!slot) return;

    // Create ad element
    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", client);
    ins.setAttribute("data-ad-slot", slot);
    ins.setAttribute("data-ad-format", "auto");
    ins.setAttribute("data-full-width-responsive", "true");

    host.innerHTML = "";
    host.appendChild(ins);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {
      // If AdSense isn't ready yet, it will retry on next navigation/load.
    }
  };

  const boot = () => {
    ensureAdSenseScript();

    const nodes = document.querySelectorAll('[data-ad-slot-key]');
    for (const host of nodes) mountSlot(host);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
