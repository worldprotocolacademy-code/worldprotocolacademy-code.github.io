/**
 * WPA Audio Media Engine Architecture · v3.0
 * Production-safe TypeScript model.
 * No false production claims, no unauthorized voice cloning, no biometric processing in Phase 1.
 *
 * Reference scaffolding only — the shipped HTML does not import this file.
 */

export type WPAModulePhase = "ready" | "prototype" | "guarded" | "phase-2";
export type WPARoomMode = "class" | "workshop" | "webinar" | "institutional";

export interface WPAModule {
  id: string;
  title: string;
  phase: WPAModulePhase;
  consentRequired?: boolean;
  legalReviewRequired?: boolean;
}

export interface WPARoomPolicy {
  mode: WPARoomMode;
  minutes: number;
  attendees: number;
  hostCount: number;
  coHostCount: number;
  audienceDefault: "muted";
  activeSpeakerPolicy: "one_active_speaker";
  recordingConsentRequired: boolean;
  biometricAuth: "disabled_phase_1" | "phase_2_only";
}

export interface WPAContentPackage {
  title: string;
  type: "audiobook" | "lecture" | "short" | "scenario" | "course";
  language: "mk" | "en" | "multi";
  status: "draft" | "review" | "ready" | "published";
  disclosure: string;
}

export class WPAAudioMediaEngine {
  public readonly version = "3.0";

  // Canonical 10-module list — kept in sync with the HTML and core.js.
  public modules(): WPAModule[] {
    return [
      { id: "dashboard", title: "Dashboard", phase: "ready" },
      { id: "studio", title: "Audiobook Studio", phase: "ready" },
      { id: "voice", title: "Sande Voice Engine", phase: "guarded", consentRequired: true, legalReviewRequired: true },
      { id: "content", title: "Content Generator", phase: "ready" },
      { id: "viral", title: "Viral Media Studio", phase: "prototype" },
      { id: "protocol", title: "Protocol Scenario Lab", phase: "ready" },
      { id: "production", title: "Audio Production Lab", phase: "prototype" },
      { id: "room", title: "Live Video Rooms", phase: "prototype", consentRequired: true },
      { id: "delivery", title: "Delivery Center", phase: "ready" },
      { id: "monetization", title: "Monetization Engine", phase: "guarded", legalReviewRequired: true }
    ];
  }

  public roomPolicy(mode: WPARoomMode): WPARoomPolicy {
    const presets = {
      class: { minutes: 90, attendees: 100, hostCount: 1, coHostCount: 2 },
      workshop: { minutes: 120, attendees: 150, hostCount: 1, coHostCount: 4 },
      webinar: { minutes: 75, attendees: 500, hostCount: 1, coHostCount: 3 },
      institutional: { minutes: 60, attendees: 80, hostCount: 1, coHostCount: 3 }
    } as const;

    return {
      mode,
      ...presets[mode],
      audienceDefault: "muted",
      activeSpeakerPolicy: "one_active_speaker",
      recordingConsentRequired: true,
      biometricAuth: "disabled_phase_1"
    };
  }

  public createPackage(title: string, type: WPAContentPackage["type"], language: WPAContentPackage["language"]): WPAContentPackage {
    return {
      title,
      type,
      language,
      status: "draft",
      disclosure: "AI-assisted draft; requires human editorial review before publication."
    };
  }
}
