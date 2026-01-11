(() => {
  // Adsterra banner loader (160x600) — safe, single-slot
  // - Avoids duplicate loads
  // - Does not throw even if blocked
  // - Renders inside an isolated iframe (prevents document.write issues)

  const HOST_SELECTOR = "[data-adsterra-banner-host]";
  const CONTAINER_SRC = "/assets/adsterra-container.v1.html?v=20260111h";

  const OPTIONS = {
    key: "2d5106258af9409063c547ff07cdce76",
    format: "iframe",
    height: 600,
    width: 160,
    params: {},
  };

  const hasDebugFlag = () => {
    try {
      return new URLSearchParams(window.location.search).get("addebug") === "1";
    } catch {
      return false;
    }
  };

  const buildContainerSrc = (attempt) => {
    const join = CONTAINER_SRC.includes("?") ? "&" : "?";
    const parts = [CONTAINER_SRC];
    if (hasDebugFlag()) parts.push(join + "debug=1");
    const join2 = parts.join("&");
    const sep = join2.includes("?") ? "&" : "?";
    return join2 + sep + "attempt=" + encodeURIComponent(String(attempt || 1));
  };

  const STRICT_SANDBOX =
    "allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox";
  // Fallback for providers that refuse opaque origins (sandbox without allow-same-origin).
  // Still blocks top navigation.
  const RELAXED_SANDBOX =
    "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox";

  const boot = () => {
    try {
      const hosts = Array.from(document.querySelectorAll(HOST_SELECTOR));
      if (hosts.length === 0) return;

      // One shared listener; per-frame state stored in a Map.
      const REGISTRY_KEY = "__mcAdsterraRegistry";
      const LISTENER_KEY = "__mcAdsterraListenerAdded";
      const registry = (window[REGISTRY_KEY] ||= new Map());

      if (!window[LISTENER_KEY]) {
        window[LISTENER_KEY] = true;
        window.addEventListener("message", (ev) => {
          try {
            const rec = registry.get(ev.source);
            if (!rec) return;
            const data = ev.data;
            if (!data || data.type !== "mc-adsterra") return;
            if (data.status === "filled") {
              rec.settled = true;
              if (rec.timer) {
                clearTimeout(rec.timer);
                rec.timer = null;
              }
            }
          } catch {
            // ignore
          }
        });
      }

      for (const host of hosts) {
        try {
          if (!host) continue;
          if (host.getAttribute("data-adsterra-mounted") === "1") continue;
          host.setAttribute("data-adsterra-mounted", "1");

          host.textContent = "";
          const frame = document.createElement("iframe");
          frame.width = String(OPTIONS.width);
          frame.height = String(OPTIONS.height);
          frame.style.border = "0";
          frame.style.overflow = "hidden";
          frame.loading = "lazy";
          frame.title = "advertisement";
          frame.referrerPolicy = "unsafe-url";
          frame.setAttribute("sandbox", STRICT_SANDBOX);
          frame.setAttribute("scrolling", "no");
          host.appendChild(frame);

          const rec = { frame, settled: false, attempt: 1, timer: null };
          registry.set(frame.contentWindow, rec);

          const loadAttempt = (sandboxValue) => {
            try {
              frame.setAttribute("sandbox", sandboxValue);
              frame.src = buildContainerSrc(rec.attempt);
            } catch {
              // ignore
            }
          };

          // Attempt 1: strict isolation.
          loadAttempt(STRICT_SANDBOX);

          // Attempt 2: relaxed sandbox (for providers that require non-opaque origin).
          rec.timer = setTimeout(() => {
            try {
              if (rec.settled) return;
              rec.attempt = 2;
              loadAttempt(RELAXED_SANDBOX);
            } catch {
              // ignore
            }
          }, 3000);
        } catch {
          // ignore single slot failures
        }
      }
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
