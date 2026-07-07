/* WPA Five Engines — Safe Interaction Patch
   This JS is defensive: if an element is missing, it does nothing instead of breaking the page. */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function setupReadinessMailto() {
    const mailButton = $("wpaReadinessMailto");
    if (!mailButton) return;

    mailButton.addEventListener("click", function () {
      const name = ($("wpaReviewName") || {}).value || "";
      const organisation = ($("wpaReviewOrganisation") || {}).value || "";
      const role = ($("wpaReviewRole") || {}).value || "";
      const email = ($("wpaReviewEmail") || {}).value || "";
      const need = ($("wpaReviewNeed") || {}).value || "";
      const consent = $("wpaReviewConsent");

      if (consent && !consent.checked) {
        alert("Ве молиме означете согласност пред да ја подготвите е-поштата.");
        return;
      }

      const subject = encodeURIComponent("WPA Readiness Review Request");
      const body = encodeURIComponent(
        "Почитувани,\n\n" +
        "Би сакал/а да побарам WPA Readiness Review.\n\n" +
        "Име и презиме: " + name + "\n" +
        "Институција/организација: " + organisation + "\n" +
        "Функција: " + role + "\n" +
        "Е-пошта: " + email + "\n" +
        "Краток опис на потребата: " + need + "\n\n" +
        "Се согласувам моите податоци да се користат само за одговор на ова барање.\n\n" +
        "Со почит,"
      );

      window.location.href = "mailto:worldprotocolacademy@gmail.com?subject=" + subject + "&body=" + body;
    });
  }

  function setupRiskDownload() {
    const btn = $("wpaRiskDownload");
    if (!btn) return;

    btn.addEventListener("click", function () {
      const result = $("wpaRiskResult");
      const text = result ? result.innerText : "WPA Risk Meter result not available.";
      downloadText("wpa-risk-meter-result.txt", text);
    });
  }

  function setupFlagChecklistDownload() {
    const btn = $("wpaFlagChecklistDownload");
    if (!btn) return;

    btn.addEventListener("click", function () {
      const checked = Array.from(document.querySelectorAll("[data-wpa-flag-check]:checked"))
        .map((el) => "- " + (el.getAttribute("data-label") || el.value || el.id));
      const text = "WPA Flag & Symbol Checklist\n\n" + (checked.length ? checked.join("\n") : "No items checked yet.");
      downloadText("wpa-flag-symbol-checklist.txt", text);
    });
  }

  function setupDailyProtocolIcs() {
    const btn = $("wpaDailyProtocolIcs");
    if (!btn) return;

    btn.addEventListener("click", function () {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const fmt = (d) => d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T080000Z";
      let events = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//World Protocol Academy//Daily Protocol Minute//EN\n";

      for (let i = 0; i < 30; i += 1) {
        const d = new Date(now.getTime() + i * 86400000);
        events += "BEGIN:VEVENT\n";
        events += "UID:wpa-daily-protocol-" + (i + 1) + "@worldprotocolacademy\n";
        events += "DTSTAMP:" + fmt(now) + "\n";
        events += "DTSTART:" + fmt(d) + "\n";
        events += "SUMMARY:WPA Daily Protocol Minute — Day " + (i + 1) + "\n";
        events += "DESCRIPTION:One-minute protocol learning reminder from World Protocol Academy.\n";
        events += "END:VEVENT\n";
      }

      events += "END:VCALENDAR\n";
      const blob = new Blob([events], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "wpa-daily-protocol-minute-30-days.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  function setupInsightsGenerator() {
    const btn = $("wpaInsightsGenerate");
    if (!btn) return;

    btn.addEventListener("click", function () {
      const verified = ($("wpaInsightVerified") || {}).value || "";
      const reported = ($("wpaInsightReported") || {}).value || "";
      const visual = ($("wpaInsightVisual") || {}).value || "";
      const analysis = ($("wpaInsightAnalysis") || {}).value || "";
      const out = $("wpaInsightsOutput");
      if (!out) return;

      out.textContent =
        "Verified facts:\n" + (verified || "[Add verified facts]") + "\n\n" +
        "Widely reported information:\n" + (reported || "[Add widely reported information]") + "\n\n" +
        "Visual observations:\n" + (visual || "[Add visual observations]") + "\n\n" +
        "Analytical interpretation:\n" + (analysis || "[Add analytical interpretation]") + "\n\n" +
        "Scope note: This text separates verified facts, public reporting, visual observations and analytical interpretation. It does not rely on classified, private or non-public logistical information.";
    });
  }

  function setupCopyButtons() {
    document.querySelectorAll("[data-copy-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const target = $(btn.getAttribute("data-copy-target"));
        if (!target) return;
        navigator.clipboard.writeText(target.innerText || target.value || "").then(function () {
          btn.textContent = "Copied";
          setTimeout(function () { btn.textContent = "Copy"; }, 1400);
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupReadinessMailto();
    setupRiskDownload();
    setupFlagChecklistDownload();
    setupDailyProtocolIcs();
    setupInsightsGenerator();
    setupCopyButtons();
  });
})();
