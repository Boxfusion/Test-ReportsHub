# EPM — Performance Report creation — Name whitespace trimming

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109507 — *08 · EPM · Performance Report creation — planning shell*
**Parent suite:** Phase 01 · EPM · Foundation · Reference Data
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app` (API `https://pd-epm-api-qa-wf.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **EPM Administration** › Manage Performance Reports → `/dynamic/Epm/perfomance-report-v2` → **+ Add**

> This suite's 4 test cases (TC-108780, TC-108817, TC-108818, TC-108819) were built and run this
> engagement as standalone specs without ever getting a paired canonical `.md` — this file backfills
> TC-108818's own documentation from its spec's ADO-derived comments and this session's live findings, the
> same way TC-108817's was backfilled. **ADO is canonical.**

## TC-108818 — Edge — Performance Report Name preserves leading and trailing whitespace (not trimmed)

**ADO ID:** 108818 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Edge
**Coverage dimension:** Edge

### Preconditions (ADO literal)
- Signed in as administrator. Performance Report create form loaded.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Enter Name with leading and trailing spaces (e.g. `"  Test Report  "`) and Save. | The form accepts the input; the save succeeds. |
| 2 | Verify the persisted Name. | The persisted Name is trimmed — no leading/trailing whitespace. |
| 3 | Attempt to create a second record with the same (trimmed) name. | Rejected — a uniqueness constraint fires against the trimmed name. |

### Confirmed genuine defect — Name is NOT trimmed server-side (confirmed live 2026-08-17)

`CreatePerformanceReport` persists the Name field **exactly as typed**, whitespace included — a save with
`"  Test Report <token>  "` persists literally as `"  Test Report <token>  "`, not the trimmed
`"Test Report <token>"` ADO's step 2 expects. Asserted per ADO's literal expectation (`expect.soft`, fails
by design) so this stays a visible red signal until the dev adds trimming, without blocking the rest of
the test.

### Step 3 reframed given step 2's own finding

ADO's step 3 assumes the persisted Name is already trimmed, then tests whether a *second* attempt (using
the trimmed string) collides with it. Since step 2 proved the server never trims, this spec instead
attempts to create a second record with the **same untrimmed** Name/Short Name — still a meaningful check:
an exact-string duplicate should collide regardless of whether trimming happens, so this confirms the
uniqueness constraint exists and fires (on both Name and Short Name, exact-match), even though it isn't
specifically "against the trimmed name" the way ADO's literal wording frames it.

### Stale reference found and fixed, 2026-08-28

Like TC-108817, this spec's hardcoded `PERIOD_NAME = 'Financial Year 2026/27'` no longer exists in QA at
all (see `epm-performance-report-period-covered-stale` memory) — fixed the same way, building a fresh
disposable Financial Year period (with one Quarter child) via direct API calls as setup, cleaned up in
`finally` alongside the disposable report(s).

### Unique inputs
| Field | Value |
|---|---|
| Untrimmed Name | `  Test Report <token6>  ` (2 leading + 2 trailing spaces) |
| Trimmed Name (expected) | `Test Report <token6>` |
| Short Name | `WS<token6>` |
| Period Covered | `TC108818 FY <token6>` (disposable, built by this run) |
| Template | `Standard Annual Performance Plan` (stable, non-disposable catalog template) |

### Notes
- **Writes then deletes 1 disposable Financial Year period, 1 disposable Quarter child period, and 1
  disposable Performance Report per run** — all cleaned up via API `Delete` in a `finally` block
  regardless of pass/fail. The second (rejected, duplicate-name) create attempt in step 3 never persists
  anything, so there is nothing to clean up for it specifically.
- Known nav flake (~1/3 of runs): the EPM Administration flyout occasionally lands on the workflows-inbox
  page instead of Manage Performance Reports — a plain re-run is the accepted fix, not a script bug (see
  `epm-performance-report-modal-and-nav-quirks` memory).
