# WPA + Institute Zero-Loss Redesign Charter

Branch: `redesign/wpa-institute-zero-loss-v4-20260719`

## Non-negotiable rule

The redesign is an additive improvement of the current public WPA and WPA Institute pages. Existing content, functions, routes, modules, language access, legal notices and authorial identity must not disappear silently.

## Scope

This rule applies to:

- `index.html` — World Protocol Academy public homepage;
- `institute.html` — WPA Institute homepage;
- every section, anchor, link, form, script, stylesheet and dynamically injected module used by those pages;
- desktop, tablet, mobile and print behaviour;
- Macedonian, English and all connected language routes;
- accessibility, legal, development-status and institutional identity notices.

## Required migration statuses

Every existing item must be classified before production release:

- `KEEP` — preserved without functional change;
- `REDESIGN` — same content and function, improved presentation;
- `RELOCATE` — moved to a clearer place while remaining directly accessible;
- `LINK` — represented through an explicit route to its dedicated page;
- `CONSOLIDATE` — duplicates merged without losing unique content or behaviour;
- `ARCHIVE` — retained in the repository with a written reason and replacement path;
- `VERIFY` — not changed until its role and dependencies are confirmed.

## Shared design family

WPA and the Institute will use one coherent institutional family:

- EB Garamond or another verified Cyrillic Garamond for ceremonial and academic display typography;
- a highly readable sans-serif for body text, navigation, controls and mobile use;
- deep navy, ivory, white and restrained gold;
- strong contrast on every surface;
- consistent spacing, focus states, buttons and responsive rules.

They must remain distinct:

- WPA is the public, systemic, programme and professional platform;
- the Institute is the academic, research, analytical and laboratory environment.

## Icon doctrine

Icons are not removed by default. They are preserved when they communicate a stable function, route or tool. Decorative symbols may be visually softened only when they compete with institutional hierarchy. Every icon change must preserve the linked function, label, URL and accessibility meaning.

## Release gate

No merge to `main` until all of the following are true:

1. Existing sections and modules are inventoried for both pages.
2. Existing internal and external routes are compared against the redesigned versions.
3. Existing scripts and dynamically injected features are accounted for.
4. Legal, institutional and development-status notices remain visible.
5. Language access remains functional.
6. Desktop and mobile navigation preserve access to all current destinations.
7. A zero-loss comparison records no unexplained missing content or functionality.
8. The live pages are changed only after source, responsive, contrast and accessibility checks pass.

## Working principle

Preserve everything of value. Remove only duplication and technical conflict after explicit verification. Improve structure, beauty, clarity and practical use without reducing the WPA or Institute ecosystem.
