# EPM — Reporting Tree seeding — Build Tree action + Add Top Level Item

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *09 · EPM · Reporting Tree seeding — Build Tree action + Add Top Level Item / Add Child Item + KPI Weighting field*
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app` (API `https://pd-epm-api-qa-wf.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Manage Performance Reports → a report's details view → **Build Tree**

> This spec never had a paired canonical `.md` — this file backfills it from the spec's own ADO-derived
> comments and this session's live findings. **ADO is canonical.**

## TC-109455 — Positive — Build Tree action loads the tree builder with the add-node toolbar

**ADO ID:** 109455 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Positive
**Coverage dimension:** Positive

### Preconditions (ADO literal)
- A Performance Report exists at Planning status.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Open the Performance Report detail page via the row's search/view action. | Detail page loads. |
| 2 | Click the "Build Tree" link. | Tree builder opens with "Add Top Level Item" visible. |
| 3 | Add a Department node using the toolbar. | Node appears in the tree. |

### Mechanism (confirmed live)

The "Build Tree" control is a plain `.ant-btn`, not reliably matched by `getByRole('button')`
accessible-name matching, and a force-click doesn't always register on a freshly-navigated page — the
spec retries up to 5 times, waiting for navigation to `performance-report-planning-page` each time. The
"Add Top Level Item" flow (Department type → Ref No picker → Weight → Save) mirrors the mechanism already
proven correct elsewhere in this hierarchy-definitions folder.

### Stale reference found and fixed, 2026-08-28

The hardcoded `PERIOD_ID` (`'Financial Year 2026/27'`, id `8062531f-...`) is soft-deleted (see
`epm-performance-report-period-covered-stale` memory) — fixed the same way as the sibling suite-109507
specs, building a fresh disposable Financial Year + 4 Quarter period pair via API per run. Also added a
search-box step before locating the disposable report's row, since the "Manage Performance Reports" list
is paginated and not sorted newest-first.

### Notes
- **Writes then deletes** a disposable Financial Year period + 4 Quarter children, a disposable
  Performance Report, and the seeded Department Component per run — all cleaned up via API `Delete` in a
  `finally` block regardless of pass/fail.
- This case tests **"Add Top Level Item" only** — it does not exercise "Add Child Item" (that button has
  its own, separately-documented rendering defect — see `epm-add-child-item-dropdown-defect` memory —
  confirmed on other specs, not re-tested here since this case's own ADO steps only cover the top-level
  add flow).
