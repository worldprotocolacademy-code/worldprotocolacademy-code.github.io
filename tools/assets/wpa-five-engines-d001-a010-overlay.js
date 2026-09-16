/* =====================================================================
   WPA Five Engines — compatibility + canonical-sync loader
   Legacy filename retained to avoid changing the stable HTML include.

   REV7 already contains the D001/A010 entity-resolution corrections.
   This loader therefore does NOT rewrite dataset responses. It only
   preserves the existing social bridge and loads the P1 canonical-sync
   adapter that reads current Master List metrics from the canonical
   verification-status document.
   ===================================================================== */

(function () {
  "use strict";

  if (typeof document === "undefined") return;

  if (!document.getElementById("wpa-five-engines-canonical-sync")) {
    const sync = document.createElement("script");
    sync.id = "wpa-five-engines-canonical-sync";
    sync.src = "/tools/assets/wpa-five-engines-canonical-sync.js?v=20260916-1";
    sync.defer = true;
    document.head.appendChild(sync);
  }

  if (!document.getElementById("wpa-social-bridge-runtime")) {
    const social = document.createElement("script");
    social.id = "wpa-social-bridge-runtime";
    social.src = "/scripts/wpa-social-bridge.js?v=20260713-1";
    social.defer = true;
    document.head.appendChild(social);
  }
})();
