/**
 * World Protocol Academy — Student Desk Beta
 * Certificate Preview Generator Module
 *
 * Creates a visual certificate preview / print-ready mockup ONLY.
 * This is NOT an official certificate generator.
 *
 * CRITICAL DISCLAIMERS:
 * - Beta educational preview only.
 * - This is not an official certificate.
 * - This is not an accredited certificate.
 * - This is not a legal credential.
 * - This is not a formally issued World Protocol Academy certificate.
 * - No official certificate number is issued.
 * - No registry ID is generated.
 * - No accreditation claim is made.
 * - Preview ID is locally generated only (not verified externally).
 */

(function () {
  "use strict";

  var CertGen = {
    lang: "mk",
    form: null,
    preview: null,
  };

  window.CertGen = CertGen;

  // ============================================================
  // Initialize Certificate Generator
  // ============================================================
  CertGen.init = function (config) {
    CertGen.lang = (config && config.lang) || "mk";
    CertGen.form = document.querySelector("[data-cert-form]");
    CertGen.preview = document.querySelector("[data-cert-preview]");

    if (CertGen.form) {
      CertGen.form.addEventListener("submit", function (e) {
        e.preventDefault();
        CertGen.generatePreview();
      });
    }
  };

  // ============================================================
  // Generate Certificate Preview
  // ============================================================
  CertGen.generatePreview = function () {
    if (!CertGen.form || !CertGen.preview) return;

    var formData = new FormData(CertGen.form);
    var studentName = (formData.get("studentName") || "").trim();
    var moduleName = formData.get("moduleName") || "";
    var date = formData.get("completionDate") || new Date().toISOString().split("T")[0];
    var percentage = formData.get("resultPercentage") || "";

    if (!studentName) {
      CertGen.showError(
        CertGen.lang === "mk"
          ? "Ве молиме внесете го вашето име."
          : "Please enter your name."
      );
      return;
    }

    var previewId = typeof wpaGeneratePreviewId === "function"
      ? wpaGeneratePreviewId()
      : "WPA-PRV-XXXXXXXX";

    var formattedDate =
      typeof wpaFormatDate === "function"
        ? wpaFormatDate(date, CertGen.lang)
        : date;

    // Build preview HTML
    var isMK = CertGen.lang === "mk";

    var headerText = isMK
      ? "World Protocol Academy<br>Институт за протокол, дипломатија, јавна комуникација и безбедносни студии"
      : "World Protocol Academy<br>Institute for Protocol, Diplomacy, Public Communication &amp; Security Studies";

    var titleText = isMK
      ? "Едукативен преглед за учество"
      : "Educational Participation Preview";

    var previewLabel = isMK ? "— БЕТА ПРЕГЛЕД —" : "— BETA PREVIEW —";

    var bodyText = isMK
      ? "Овој едукативен преглед е генериран за"
      : "This educational preview records that";

    var bodyText2 = isMK
      ? "учествуваше во модулот"
      : "participated in the module";

    var dateLabel = isMK ? "на датум" : "on";

    var resultLabel = isMK
      ? "со резултат"
      : "with a result of";

    var founderText = isMK
      ? 'Основач: <strong>Assoc. Prof. Dr. Sande Smiljanov</strong>'
      : 'Founder: <strong>Assoc. Prof. Dr. Sande Smiljanov</strong>';

    var orcidText = "ORCID: <strong>0009-0008-3219-394X</strong>";

    var previewIdLabel = isMK ? "Преглед ID:" : "Preview ID:";

    var disclaimerText = isMK
      ? '<strong>Бета едукативен преглед.</strong> Ова не е официјална диплома, не е акредитирана потврда, не е правен креденцијал и не е формално издадена потврда од World Protocol Academy.'
      : '<strong>Beta educational preview only.</strong> This is not an official certificate, not an accredited certificate, not a legal credential, and not a formally issued World Protocol Academy certificate.';

    var printLabel = isMK ? "Печати преглед" : "Print Preview";

    var html =
      '<div class="wpa-cert-disclaimer">' +
      '<div class="wpa-callout-title">' +
      (isMK ? 'ВАЖНО' : 'IMPORTANT') +
      "</div>" +
      "<p>" +
      disclaimerText +
      "</p></div>" +
      '<div class="wpa-cert-preview">' +
      '<div class="wpa-cert-header">' +
      headerText +
      "</div>" +
      '<div style="font-size:0.75rem; color:var(--wpa-danger); letter-spacing:2px; margin-bottom:1rem;">' +
      previewLabel +
      "</div>" +
      '<div class="wpa-cert-title">' +
      titleText +
      "</div>" +
      '<div class="wpa-cert-body">' +
      "<p>" +
      bodyText +
      "</p>" +
      '<div class="wpa-cert-name">' +
      wpaEscapeHtml(studentName) +
      "</div>" +
      "<p>" +
      bodyText2 +
      "<br><strong>" +
      wpaEscapeHtml(moduleName) +
      "</strong><br>" +
      dateLabel +
      " " +
      wpaEscapeHtml(formattedDate) +
      "</p>";

    if (percentage) {
      html +=
        "<p>" +
        resultLabel +
        ' <strong style="font-size:1.3rem;">' +
        wpaEscapeHtml(percentage) +
        "%</strong></p>";
    }

    html +=
      '<div class="wpa-cert-seal">W</div>' +
      '<div class="wpa-cert-founder">' +
      founderText +
      "<br>" +
      orcidText +
      "</div>" +
      '<div style="margin-top:1.5rem; font-size:0.75rem; color:var(--wpa-text-muted);">' +
      previewIdLabel +
      " " +
      wpaEscapeHtml(previewId) +
      "</div>" +
      "</div></div>" +
      '<div class="wpa-mt-lg no-print wpa-text-center">' +
      '<button class="wpa-btn wpa-btn-primary" onclick="wpaPrint()">' +
      printLabel +
      "</button></div>";

    CertGen.preview.innerHTML = html;
    CertGen.preview.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ============================================================
  // Show Error
  // ============================================================
  CertGen.showError = function (message) {
    if (!CertGen.preview) return;
    CertGen.preview.innerHTML =
      '<div class="wpa-callout wpa-callout-danger">' +
      '<div class="wpa-callout-title">' +
      (CertGen.lang === "mk" ? "Грешка" : "Error") +
      "</div>" +
      "<p>" +
      wpaEscapeHtml(message) +
      "</p></div>";
  };

  // Auto-init if data attributes present
  document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector("[data-cert-form]")) {
      var lang = document.documentElement.lang || "mk";
      CertGen.init({ lang: lang });
    }
  });
})();
