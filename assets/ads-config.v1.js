// MobCrafter Portal Ad configuration
// Default: OFF (for review safety). Turn ON only after AdSense approval.
//
// How to enable:
// 1) Set enabled: true
// 2) Fill client (ca-pub-XXXXXXXXXXXXXXX)
// 3) Fill slot IDs created in AdSense (ad units)
//
// Notes:
// - This config is only loaded on pages that support ads (index + unit detail pages).
// - Operation pages (submit/admin/404/etc) should not include this file.

window.MOBCRAFTER_ADS = {
  enabled: false,

  // Your AdSense publisher id (example: "ca-pub-123...")
  client: "",

  // Map of ad unit slot IDs (strings from AdSense UI)
  slots: {
    // index.html
    index_top: "",

    // u/index.html (public unit detail)
    unit_top: "",

    // unit.html (legacy detail page)
    unit_legacy_top: "",
  },
};
