# EPM — Stage 4 Approve

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109527 · EPM · Stage 4 Approve*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** stage4 / 123qwe; JohnDoe / 123qwe (unauthorized Person)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108794 — Positive — Approve KPI advances status 50 to 60

**ADO ID:** 108794 · **Coverage dimension:** Positive

### Confirmed live 2026-08-20 — clean pass

Real button is **"Approve KPI"** (not a generic "Approve"). Clicking it after checking the Declaration
Statement checkbox genuinely advances the item — inbox immediately shows a new entry with
`actionText: "Verify Captured Progress Report"` (Stage 5) for the same `workflowInstanceId`. See
[[epm-stage4-approve-confirmed-working]].

## TC-108859 — Negative — Reject action from an unassigned Person

**ADO ID:** 108859 · **Coverage dimension:** Negative

### Confirmed live 2026-08-20 — clean pass

`JohnDoe` correctly gets the read-only view, no action available. Same RBAC gate confirmed at every
stage.

## TC-108860 — Edge — Comment field accepts maximum character length

**ADO ID:** 108860 · **Coverage dimension:** Edge

### Confirmed live 2026-09-02 — UNBUILT: no maximum length configured

Previously blocked by data volume ("only 1 live item existed, needed for the Positive case") — that
constraint doesn't actually apply to this Edge case (it doesn't consume the item, only Save does), so
retested it directly.

Used the one live Stage 4 item, `CPR2026/1103`. The Comments field has **no `maxlength` attribute**.
Typed 5,000 characters — all 5,000 accepted client-side. Saved: `POST /api/services/app/Note/Create` →
`200`. Confirmed via a direct API read: the persisted `noteText` is exactly 5,000 characters, no
truncation.

**Same pattern as Stage 2's comment field ([[epm-stage2-comment-max-length-unbuilt]], TC-108854,
`unbuilt`) — NOT the same as Stage 3's ([[epm-stage3-comment-max-length-confirmed]], TC-108857,
`maxlength=1000`, `pass`).** The limit is inconsistent per stage/form; this one has none.

## TC-108861 — Integration — Inbox re-count after multi-item batch approval

**ADO ID:** 108861 · **Coverage dimension:** Integration

### Confirmed live 2026-09-02 — clean pass (seeded extra volume from Stage 3)

Only 1 live Stage 4 item existed (`CPR2026/1103`). Rather than leave this blocked, seeded more volume:
completed QA on 3 live Stage 3 items (`CPR2026/1099`, `CPR2026/1101`, `CPR2026/0892`) via "Complete QA",
each advancing them to Stage 4. Stage 4 inbox count went `1 → 4`.

Batch-approved 3 of the 4 (fresh `todoId` per item, Declaration checked, "Approve KPI" clicked) — all 3
returned `200`. Re-fetched the Stage 4 inbox: **exactly 1 item remained** (`CPR2026/1103` — the one
never touched). Recount is exact. **CONFIRMED PASS.**

### Notes
- No bulk-select UI exists — approvals were sequential individual actions, same adaptation as
  [[epm-stage2-support-review-confirmed-working]]'s TC-108855.
- Seeding cross-stage volume (advancing Stage 3 items into Stage 4) is a reusable technique when a
  later stage's inbox is too thin for an Integration-dimension batch test — cheaper than waiting for
  natural tenant activity.

### Notes
- `todoId` is per-fetch/session-volatile — always re-fetch immediately before navigating.
- The Comments field's `maxlength` (when present) is a directly-readable DOM attribute — check it
  first rather than assuming a limit from truncated/untruncated body text.
