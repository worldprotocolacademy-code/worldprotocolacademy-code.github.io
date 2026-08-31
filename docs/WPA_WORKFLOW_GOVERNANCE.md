# WPA Workflow Governance

Machine-readable source: `/data/wpa-workflow-registry.json`.

- `ACTIVE_REQUIRED_CI`: normal protection/quality workflow.
- `ACTIVE_MANUAL_REVIEWED`: intentional manual, non-direct-push workflow.
- `MANUAL_PROTECTED_REVIEW_REQUIRED`: deployment/cutover workflow; verify current runbook, environment and rollback before dispatch.
- `SUPERSEDED_HISTORICAL`: evidence only; do not dispatch.
- `REVIEW_REQUIRED`: not part of the protected normal path until reviewed.

Historical workflow files are not automatically deleted because several preserve forensic/deployment evidence. Their presence does not grant operational authority.
