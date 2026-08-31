# WPA Repository Governance Lock

Status: repository-side controls implemented; GitHub server-side PR/status-check enforcement must also be enabled in the repository ruleset.

## Canonical mutation rule

`feature branch -> pull request -> required CI -> reviewed merge -> production verification`

No normal workflow may commit or push generated source directly to `main`.

## Required GitHub ruleset target for `main`

- Require a pull request before merging.
- Require status checks to pass before merging.
- Require the branch to be up to date before merging.
- Block force pushes and branch deletion.
- Do not permit routine bypass actors.
- Keep administrators under the normal rule except for a documented emergency-recovery procedure.

Required checks should include current canonical CI and WPA Production Functional Smoke. Path-scoped Virtual Sande smoke is required when its protected paths change.

## Tooling limitation recorded 2026-08-31

The connected GitHub tool used for this remediation can read the active ruleset but does not expose a ruleset/branch-protection write action. Server-side require-PR/status-check enforcement therefore remains an administrative repository setting that must be confirmed separately after this PR.
