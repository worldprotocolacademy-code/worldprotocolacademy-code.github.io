/* =====================================================================
   WPA Five Engines — D001/A010 entity-resolution overlay
   Patch ID: 4F-REV3-PATCH-D001-A010
   Date: 2026-07-07

   Purpose:
   - Keep the published REV2 record count unchanged.
   - Apply the D001/A010 verification and entity-resolution clarification
     to the live Five Engines reference map.
   - Preserve audit visibility of A010; do not delete it.
   ===================================================================== */

(function () {
  "use strict";

  if (typeof window === "undefined" || typeof window.fetch !== "function") return;

  const originalFetch = window.fetch.bind(window);

  function shouldPatchResource(resource) {
    const url = typeof resource === "string" ? resource : (resource && resource.url) || "";
    return url.includes("institutions-master-rev2.json");
  }

  function applyD001A010Patch(data) {
    if (!data || !Array.isArray(data.institutions)) return data;

    data.note = "Records A005 and B008 remain reported cooperation-model observations. D001 — Protocol Academy of Macedonia is verified by primary source and retained as the canonical institutional entity. A010 — Protocol Academy of Kosovo is retained as an audit-visible child / branch / brand-presence record under D001 and is not counted as a separate independent institution pending the next full entity-resolution pass. C022/H027 (ICC) and G002/G022 (IAEA) each appear in two dataset contexts by design.";

    data.institutions = data.institutions.map((record) => {
      if (!record || !record.id) return record;

      if (record.id === "D001") {
        return {
          ...record,
          verification: "VERIFIED — primary source",
          notes: "Canonical institutional entity. Protocol Academy of Macedonia is verified by primary source. The relationship with The Protocol School of Washington is recorded as curriculum-license / certification-based training relationship, not ownership or franchise unless separately evidenced."
        };
      }

      if (record.id === "A010") {
        return {
          ...record,
          name: "Protocol Academy of Kosovo — audit-visible branch / brand-presence record under D001",
          type: "Audit-visible child / branch / brand-presence record under D001",
          relevance: "B",
          verification: "VERIFIED — primary source, branch/de facto presence of D001",
          has_website: false,
          notes: "Non-canonical child / branch / brand-presence record retained for audit visibility. It shall not be counted as a separate independent institution after the next full entity-resolution pass. D001 remains the canonical institutional entity."
        };
      }

      return record;
    });

    return data;
  }

  window.fetch = function patchedFetch(resource, options) {
    if (!shouldPatchResource(resource)) {
      return originalFetch(resource, options);
    }

    return originalFetch(resource, options).then((response) => {
      if (!response || !response.ok) return response;

      return response.clone().json().then((data) => {
        const patched = applyD001A010Patch(data);
        const headers = new Headers(response.headers);
        headers.set("content-type", "application/json; charset=utf-8");

        return new Response(JSON.stringify(patched, null, 2), {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      }).catch(() => response);
    });
  };
})();
