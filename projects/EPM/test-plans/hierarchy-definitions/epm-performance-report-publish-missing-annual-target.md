# EPM — Performance Report Publish — missing Annual Target validation

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109520 · EPM · Publish Performance Report — validation gate and confirm dialog*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** admin.PrincessH / 123qwe (administrator)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108835 — Negative — Reject Publish when a KPI has no Annual Target

**ADO ID:** 108835 · **Priority:** 1 · **Coverage dimension:** Negative

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 0 (precondition) | A KPI has `finalIndicatorTarget` AND `finalIndicatorTargetText` both null (no Annual Target). | True. |
| 1 | Click Publish. | `ValidateReadyToPublishAsync` rejects it, citing the missing Annual Target. |
| 2 | Confirm status/audit. | Status remains Planning; no `ReportPublished` audit event. |
| 3 | Populate the Annual Target and retry. | Succeeds. |

### Confirmed live 2026-08-19 — this validation gate does not exist at all

See [[epm-publish-missing-annual-target-not-validated]]. Built a fresh disposable report (Department
root + Quantitative KPI child, correct Stage 1-5 actioners, Annual Target left null) and clicked the
real Publish button. Both runs: toast "Successfully published report.", status → 20 (Published)
immediately, a real `EpmAuditedEntityEvent` "was published" row written — no rejection of any kind.
Contrast: the "no reportable KPIs" and "no assigned Process Owner" gates in the same
`ValidateReadyToPublishAsync` method ARE genuinely enforced (see [[epm-publish-canberoot-not-validated]]
and [[epm-actionlevel-null-breaks-publish-process-owner-gate]]) — the Annual Target check specifically
is simply absent. Step 3 (populating Annual Target after the fact) works correctly, just decoupled from
any gate since the report was already wrongly published.

### Unique inputs
| Field | Value |
|---|---|
| Template | "Standard Annual Performance Plan" (`77a75071-...`) |
| Period | "Financial Year 2026/27" (`8062531f-...`) |

### Notes
- Builds a fresh, disposable report each run — no tree/actioner reuse from prior tests.
- Leaves the disposable report Published, per this engagement's convention for documented findings.
