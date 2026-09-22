# Journal Watch functional recovery — 22 September 2026

The published editorial queue was generated on 15 August, despite a healthy September WPA Watch refresh. Journal generation depended on a successful parent workflow; a feed PR merged after that parent failed did not trigger generation.

This change adds a main-branch feed-change trigger, retaining the existing success and approved manual triggers. A published upstream timestamp check prevents duplicate refresh PRs when both events arrive. It regenerates the queue from all 160 available upstream items, without inventing topics to fill disciplines.

Topic identities now depend on the source URL, not generation day or list position. Matching previous IDs are retained as migration aliases. Missing publication dates remain unknown. Source timestamps and human review boundaries are preserved.

The interface preserves loaded work when reload fails, displays the failure, handles clipboard rejection, reports storage failure, exports all loaded topics with local statuses and saved historical status entries as JSON, and downloads filtered editorial notes as text. Reload explicitly reads published data; it does not promise to collect sources from a static browser page.

Validation: `node --test tests/journal-watch-functional.cjs`; `python scripts/site_quality_check.py`; JavaScript syntax checks. Tests cover stable identity, legacy status migration, stale-source rejection, filtering, status persistence, export, clipboard denial and reload failure.

## Section-by-section working order

1. Journal Watch: this recovery. Shared authenticated editorial persistence and import remain future work; local statuses are not journal acceptance.
2. WPA Watch: unattended protected publication, source failures and freshness.
3. Academic Search Hub: real queries, source links, result verification and exports.
4. WPA Journal: submission, editorial decisions, article records and working document links.
5. Virtual Sande and connected analytical modules: live backend contracts and recoverable failures.
6. Remaining institute sections: inventory each public control, verify its real action and clearly mark dependencies that are not yet provisioned.

Each section requires an end-to-end user task, failure-path testing and a reviewed change. This list is a working order, not a claim that the remaining sections have been audited or activated.
