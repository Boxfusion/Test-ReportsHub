# EPM — Stage 5 Verify

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109526 · EPM · Stage 5 Verify*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** stage5 / 123qwe; JohnDoe / 123qwe (unauthorized Person)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108795 — Positive — Complete KPI advances status 60 to 70

**ADO ID:** 108795 · **Coverage dimension:** Positive

### Confirmed live 2026-08-20 — clean pass

Real advance button is **"Complete KPI"** (not "Verify" as the case title implies). Clicking it after
the Declaration checkbox genuinely advances the item — inbox shows a new entry with
`actionText: "Finalise Captured Progress Report"` (Stage 6). See
[[epm-stage5-verify-confirmed-working]].

## TC-108862 — Negative — Reject action from an unassigned Person

**ADO ID:** 108862 · **Coverage dimension:** Negative

### Confirmed live 2026-08-20 — clean pass

Unauthorized Person correctly rejected with the read-only view. Same RBAC gate confirmed at every
stage.

## TC-108863 — Edge — Comment field accepts maximum character length

**ADO ID:** 108863 · **Coverage dimension:** Edge

### Confirmed live 2026-09-02 — UNBUILT: no maximum length configured

Previously blocked by data volume; by the time of this retest 3 live Stage 5 items existed
(`CPR2026/0892`, `CPR2026/1101`, `CPR2026/1099`) — plenty for this non-consuming Edge case regardless.

Used `CPR2026/0892`. The Comments field has **no `maxlength` attribute**. Typed 5,000 characters — all
5,000 accepted client-side. Saved: `POST /api/services/app/Note/Create` → `200`. Confirmed via a direct
API read: the persisted `noteText` is exactly 5,000 characters, no truncation.

**Same pattern as Stage 2 ([[epm-stage2-comment-max-length-unbuilt]]) and Stage 4
([[epm-stage4-comment-max-length-unbuilt]]) — NOT the same as Stage 3
([[epm-stage3-comment-max-length-confirmed]], `maxlength=1000`).** Three of four stages checked so far
have no limit at all; only Stage 3 does.

## TC-108864 — Integration — Inbox re-count after multi-item batch approval

**ADO ID:** 108864 · **Coverage dimension:** Integration

### Confirmed live 2026-09-02 — clean pass, no seeding needed

3 live Stage 5 items already existed (`CPR2026/0892`, `CPR2026/1101`, `CPR2026/1099`) — enough for a
genuine batch test with no need to seed from Stage 4, unlike [[epm-stage4-batch-recount-confirmed]].

Batch-approved 2 of the 3 in sequence (fresh `todoId` per item, Declaration checked, "Complete KPI"
clicked) — both returned `200`. Re-fetched the Stage 5 inbox: **exactly 1 item remained**
(`CPR2026/1099`, the untouched one). Recount is exact. **CONFIRMED PASS.**

### Notes
- `todoId` is per-fetch/session-volatile — always re-fetch immediately before navigating.
- The Comments field's `maxlength` (when present) is a directly-readable DOM attribute.
