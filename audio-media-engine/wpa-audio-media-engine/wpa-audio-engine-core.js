/**
 * WPA Audio Media Engine Core · v3.0
 * Safe static core for GitHub Pages.
 * This is NOT biometric production, NFT minting or voice cloning.
 * It is a consent-first workflow and governance engine.
 *
 * NOTE: This module is reference scaffolding. The shipped UI
 * (audio-media-engine.html / tools/wpa-audio-media-engine/index.html)
 * is fully self-contained and does NOT import this file. Use it as the
 * canonical model when a backend or build step is added in Phase 2.
 */
export const WPA_AUDIO_ENGINE_VERSION = "3.0";

// Canonical 10-module list — kept in sync with the HTML tab/section set.
export const WPA_AUDIO_MODULES = [
  { id: "dashboard", title: "Dashboard", phase: "ready" },
  { id: "studio", title: "Audiobook Studio", phase: "ready" },
  { id: "voice", title: "Sande Voice Engine", phase: "guarded" },
  { id: "content", title: "Content Generator", phase: "ready" },
  { id: "viral", title: "Viral Media Studio", phase: "prototype" },
  { id: "protocol", title: "Protocol Scenario Lab", phase: "ready" },
  { id: "production", title: "Audio Production Lab", phase: "prototype" },
  { id: "room", title: "Live Video Rooms", phase: "prototype" },
  { id: "delivery", title: "Delivery Center", phase: "ready" },
  { id: "monetization", title: "Monetization Engine", phase: "guarded" }
];

// Audio production pipeline stages (matches the Audio Production Lab tracker).
export const WPA_PRODUCTION_STAGES = ["script", "record", "edit", "master", "review", "export"];

export function createRoomPolicy(mode = "class") {
  const presets = {
    class: { minutes: 90, attendees: 100, hosts: 1, cohosts: 2 },
    workshop: { minutes: 120, attendees: 150, hosts: 1, cohosts: 4 },
    webinar: { minutes: 75, attendees: 500, hosts: 1, cohosts: 3 },
    institutional: { minutes: 60, attendees: 80, hosts: 1, cohosts: 3 }
  };
  const selected = presets[mode] || presets.class;
  return {
    ...selected,
    audienceDefault: "muted",
    floorRule: "host grants one active speaker at a time",
    antiOverlap: true,
    consentRequiredForRecording: true,
    biometricAuth: "phase-2-only-with-legal-review",
    auditNote: "No real biometric processing in static GitHub Pages version."
  };
}

export function buildProtocolScenario(caseText) {
  return {
    caseText,
    breach: "interruption or unmanaged speaking floor",
    risks: ["loss of order", "institutional disrespect", "communication confusion"],
    correctResponse: "raise hand, host recognition, single active speaker, closing protocol note",
    lesson: "Room governance is protocol dignity in digital form."
  };
}

export function certificateRoadmap() {
  return {
    phase1: "ordinary web verification and PDF certificate integrity",
    phase2: "optional Web3 record only after legal, privacy and accreditation-language review",
    warning: "Do not describe NFT certificates as accredited or officially recognized unless independently verified."
  };
}
