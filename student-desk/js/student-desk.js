/**
 * World Protocol Academy — Student Desk Beta
 * Core JavaScript Module
 *
 * Responsibilities:
 * - Mobile menu toggle
 * - Breadcrumb generation
 * - Utility functions
 * - Placeholder content warnings
 *
 * Privacy: Zero data collection. No cookies. No analytics. No external calls.
 */

(function () {
  "use strict";

  // ============================================================
  // Mobile Menu Toggle
  // ============================================================
  function initMobileMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-header-nav]");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      const cfg = window.StudentDeskConfig || {};
      const labels = cfg.labels || {};
      toggle.textContent = isOpen
        ? (labels.closeMenu || "Затвори")
        : (labels.menu || "Мени");
    });
  }

  // ============================================================
  // Smooth Scroll for Anchor Links
  // ============================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // ============================================================
  // Print Helper
  // ============================================================
  window.wpaPrint = function () {
    window.print();
  };

  // ============================================================
  // Utility: Format Date (MK locale)
  // ============================================================
  window.wpaFormatDate = function (dateStr, lang) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    lang = lang || "mk";
    if (lang === "mk") {
      const months = [
        "јануари", "февруари", "март", "април", "мај", "јуни",
        "јули", "август", "септември", "октомври", "ноември", "декември",
      ];
      return d.getDate() + ". " + months[d.getMonth()] + " " + d.getFullYear();
    }
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ============================================================
  // Utility: Generate local preview ID (no server, no registry)
  // ============================================================
  window.wpaGeneratePreviewId = function () {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let id = "WPA-PRV-";
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  // ============================================================
  // Utility: Escape HTML (prevent XSS)
  // ============================================================
  window.wpaEscapeHtml = function (text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  // ============================================================
  // Initialize on DOM Ready
  // ============================================================
  function init() {
    initMobileMenu();
    initSmoothScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
