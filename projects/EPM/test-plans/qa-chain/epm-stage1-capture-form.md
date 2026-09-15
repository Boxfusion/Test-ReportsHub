# EPM — Stage 1 capture form

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109524 · EPM · Stage 1 Process Owner — KPI progress capture form load*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** admin.PrincessH / 123qwe (administrator); then stage1 / 123qwe

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**
> TC-108841 (Negative — unauthorized Person) already independently confirmed working — see
> [[epm-stage1-form-access-unauthorized-person]].

## TC-108788 — Positive — Open a KPI progress capture form from the inbox

**ADO ID:** 108788 · **Priority:** 1 · **Coverage dimension:** Positive

### Confirmed live 2026-08-31 — clean pass

Previously blocked (see [[epm-stage1-origination-permanently-blocked]]) because no live Stage 1 item
could ever be originated — root cause was [[epm-open-progress-report-inert]], reversed the same day.
Built a fresh disposable report, opened Q1 via the corrected interaction, signed in as `stage1`, found
the real inbox item via `WorkflowInboxItem/Crud/GetAll`, and navigated to
`/shesha/workflow-action?id=<workflowInstanceId>&todoid=<todoId>` (todoId is per-fetch volatile — must
be fetched in the same session immediately before navigating, per
[[epm-stage3-qa-review-confirmed-working]]). The real, editable capture form
(`Epm/progressreporting-wf-captureprogressreport`) loaded — not the read-only `sent-items-details`
view — with a genuine Submit button and content matching our specific KPI.

## TC-108842 — Edge — Correct Portfolio of Evidence Required flag shown

**ADO ID:** 108842 · **Priority:** 2 · **Coverage dimension:** Edge

### Confirmed live 2026-08-31 — pass (POE field is optional, not blocking, when poeRequired=false)

Set `poeRequired: false` on the KPI's Q1 `ComponentProgressReport` before opening. The "Portfolio Of
Evidence" upload section still renders (not hidden), but the disabled Submit button's own title text
cites only "Executive Summary" as missing — never Portfolio of Evidence — proving POE is not a
blocking/required field in this state. This satisfies the "optional" half of ADO's hidden-OR-optional
expectation. (The Submit-completion half of this case was not pursued to completion — filling the rich
Executive Summary field proved unreliable to target via a stable script locator, unrelated to the
case's actual POE claim.)

## TC-108843 — Integration — Correct field visibility for Quantitative vs Qualitative

**ADO ID:** 108843 · **Priority:** 2 · **Coverage dimension:** Integration

### Confirmed live 2026-08-31 — CONFIRMED DEFECT: zero type-conditional field visibility

Built two KPIs (one Quantitative, one Qualitative) in the same disposable report, opened Q1, and
compared their capture forms side by side. Both use the identical form definition
(`Epm/progressreporting-wf-captureprogressreport v25` — matching ADO's expectation that both KPI types
share one form definition, just under a slightly different literal route name than ADO's cited
`Epm/kpireporting-wf-captureprogressreport`). But the two forms are **byte-for-byte identical** in
every field shown: both render Quarter Target / Actual Target / Variance / Achievement Status
(Achieved/Not Achieved/In Progress) — there is no "Achievements" narrative field anywhere on the
Qualitative KPI's form, and the numeric "Actual Target" field appears on both. No type-conditional
field visibility exists at all — this is a genuine, confirmed gap, not a labeling mismatch.

### Unique inputs
| Field | Value |
|---|---|
| Template | "Standard Annual Performance Plan" (`77a75071-...`) |
| Period | "Financial Year 2026/27" (`8062531f-...`) |
| Quantitative KPI Type | `60e8340a-...` |
| Qualitative KPI Type | `91152ba4-...` |

### Notes
- **Interaction pattern:** uses the corrected hover-retry + raw-mouse-coordinate click for Open
  Progress Report — see [[epm-open-progress-report-inert]].
- `todoId` must be fetched fresh in the same session immediately before navigating to the
  `workflow-action` route.
- Both disposable reports are left Published with real live Stage 1 inbox items.
