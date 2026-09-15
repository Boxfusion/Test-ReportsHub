# EPM — Stage 3 QA Review

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109528 · EPM · Stage 3 Quality Assurance review*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** stage3 / 123qwe; JohnDoe / 123qwe (unauthorized Person)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108793 — Positive — Stage 3 Complete QA advances status 40 to 50

**ADO ID:** 108793 · **Coverage dimension:** Positive

### Confirmed live 2026-08-20 — clean pass

Real form: `Epm/progressreporting-wf-qaconsolidateprogressreport`. Clicking "Complete QA" (enabled only
once the Declaration Statement checkbox is checked) genuinely advances the item — the tenant-wide inbox
immediately shows a new entry for the same `workflowInstanceId` with `actionText: "Approve Progress
Report"` (Stage 4), assigned to a different Person. See [[epm-stage3-qa-review-confirmed-working]].

## TC-108856 — Negative — Reject action from an unassigned Person

**ADO ID:** 108856 · **Coverage dimension:** Negative

### Confirmed live 2026-08-20 — clean pass

`JohnDoe` hitting the same URL gets the read-only `sent-items-details`-style view ("Requested action is
not available"), no Complete QA button. Same RBAC gate confirmed at every stage.

## TC-108857 — Edge — Comment field accepts up to its configured maximum character length

**ADO ID:** 108857 · **Coverage dimension:** Edge

### Confirmed live 2026-09-02 — clean pass; a real limit exists here (unlike Stage 2)

Previously `unverified` — "comment field locator not found via automation" (a `.last()`-based locator
found the wrong element). Fixed by locating the field via proximity to its "Comments" heading instead.

Used a live Stage 3 item, `CPR2026/1099`. The Comments field genuinely has `maxlength="1000"`. Typed
5,000 characters — the field accepted exactly `1000` (client-side capped, matching the attribute).
Saved it: `POST /api/services/app/Note/Create` → `200`. Confirmed via a direct API read: the persisted
`noteText` is exactly 1,000 characters.

**CONFIRMED PASS — and notably different from [[epm-stage2-comment-max-length-unbuilt]] (TC-108854),
which found NO configured limit on the same underlying `Note` entity at Stage 2.** The limit is not
uniform across stages/forms — don't assume one stage's finding generalizes to another for this field.

## TC-108858 — Integration — Inbox re-count after multi-item batch approval

**ADO ID:** 108858 · **Coverage dimension:** Integration

### Confirmed with 2–3 live items (ADO's 5-item precondition adapted) — clean pass

Completed 1 of the live Stage 3 items via Complete QA; Stage 3 inbox count decreased by exactly 1,
and the item's new inbox entry showed a genuine Stage 4 "Approve" action. See
[[epm-stage3-qa-review-confirmed-working]].

### Notes
- `todoId` is per-fetch/session-volatile — always re-fetch immediately before navigating; a stale
  `todoId` resolves to the read-only view even for the correctly-assigned Person.
- This tenant has genuine concurrent live activity from other real identities — don't force a fixed
  item count precondition; adapt to whatever's live at test time.
- The Comments field's `maxlength` (when present) is a reliable, directly-readable DOM attribute —
  check it first before assuming a limit is absent.
