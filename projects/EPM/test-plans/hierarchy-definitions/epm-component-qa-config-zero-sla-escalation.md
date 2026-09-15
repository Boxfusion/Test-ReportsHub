# EPM — Component QA Config — zero-day SLA escalation

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *08 · EPM · Component QA Config — Service Level Agreement per Quality Assurance level*
**Environment:** API only — `https://pd-epm-api-qa-wf.shesha.app` (pure REST test, no UI navigation)
**Login:** admin.PrincessH / 123qwe (administrator, bearer token via UI login)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108830 — Edge — Zero-day SLA triggers an immediate escalation reminder

**ADO ID:** 108830 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; edge
**Coverage dimension:** Edge

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 0 (precondition) | A `ComponentQAConfig` row exists with `slaDays = 0` for a QA level. | Row exists. |
| 1 | Trigger the item to enter the corresponding QA level. | The reminder scheduler fires immediately (zero-day SLA = due now). |
| 2 | Verify the notification queue. | A notification record with the configured reminder type appears. |
| 3 | Confirm the audit trail. | An `EpmAuditedEntityEvent` row captures the escalation event. |

### Confirmed live 2026-08-18 — no escalation mechanism fires at all

No UI surface exists for any of this — see [[epm-component-qa-config-no-ui]]. "Entering a QA level" is
represented by the `QAReviewStep` entity; completing one level's step creates the next level's step
with `dueDate` computed from that level's `ComponentQAConfig.slaDays`. Simulated entry into a zero-SLA
level by creating a `QAReviewStep` with `dueDate = now` (immediately due) directly. After a 10s wait,
`NotificationMessage` (Shesha's real notification-queue entity) total stayed unchanged — it has 0 rows
tenant-wide despite 394 live `QAReviewStep` rows, several genuinely overdue right now. `EpmAuditedEntityEvent`
rows for the report also stayed unchanged — that entity is real and active (538 rows tenant-wide) but only
for actioner receive/open/submit actions, never for SLA/escalation events. See
[[epm-qa-config-zero-sla-no-escalation]] for full detail.

### Unique inputs
| Field | Value |
|---|---|
| Target KPI | "Number of disaster awareness sessions conducted" (`d6cc6bf9-...`) |
| Responsible Person | "Stage 2 Chief Director" (`d3480a89-...`) |
| Component Progress Report | existing report for this KPI, no `QAReviewStep`s yet (`0da675be-...`) |

### Notes
- **Pure API test** — no UI navigation; no dedicated AppService/UI trigger exists for "enter a QA
  level" either, so this simulates it the same way live data represents it.
- **Writes then deletes** the disposable `ComponentQAConfig` row and `QAReviewStep` via API `Delete` in
  a `finally` block, regardless of pass/fail.
