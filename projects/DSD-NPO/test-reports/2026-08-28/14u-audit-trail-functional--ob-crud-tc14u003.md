# Report: NPO-14U-F — Office Bearer CRUD audit entries (TC-14U-003) — self-confirmation is never audited

**Date:** 2026-08-28 08:00 UTC
**Plan:** test-plans/cross-cutting/14u-audit-trail-functional.md
**Execution Mode:** ai-mcp
**Result:** FAILED — TC-14U-003, unblocked earlier today, is now verdicted **without any mutation**, using office bearers that already exist on our own records. Office-bearer **Create** is audited (actor + timestamp), but the **SelfConfirm** event is **not recorded at all**: Ryno Koen (`…eba499877cad`), a known-completed self-verification (`isVerified = true`), carries **only a "Created" audit entry**. The case's second assertion — that the SelfConfirm entry records the link source — fails vacuously, there being no such entry. Office-bearer auditing is effectively Create-only, in contrast to NpoApplication, which does log Updates with a diff.
**Duration:** ~600s
**Cases:** TC-14U-003 (#107426)
**Environment:** QA · admin/public API (audit reads) · view mode Latest
**Accounts used:** shared dev account · office bearers on our own NPOs (333-018 and APPL26-01570)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 1 | 0 | 1 | 0 | 0 |

Blocked since 2026-08-25; verdicted today. Coverage moves **217 → 218**.

---

### 🔴 TC-14U-003 — Office Bearer CRUD writes audit entries (#107426) — FAILED

The case asserts an audit entry exists for each of **Create / Update / SelfConfirm / Delete**, and that the
**SelfConfirm entry records the link source**. The audit trail is now readable (see the 08-28 14U store report),
and the office-bearer entity resolves as `Npo.NpoOfficeBearer`, filtered by `organisation` — both taken from the
profile page's **own** network request, not guessed.

**Specimens — all office bearers that already existed on our own NPOs:**

| OB | id | State | Audit trail |
|---|---|---|---|
| Ryno Koen (333-018) | `0ec0ec8c-…-eba499877cad` | **`isVerified = true`** — self-confirmed 2026-08-13/25 | **1 entry: `Created` only** |
| Johannes (no surname, APPL26-01570) | `ba53b470-…` | created 2026-08-27 | 1 entry: `Created` |
| Pieter van der Merwe (APPL26-01570) | `3ce45de1-…` | created 2026-08-27 | 1 entry: `Created` |

- **[PASS, thin] Create is audited.** Every office bearer carries a `Created` entry with **actor** and
  **timestamp** (e.g. Ryno Koen: *Created, by Mpendulo ntshangase, 2026-08-13 11:21*). But `extendedDescription`
  is **empty**, so there is **no OB reference and no field detail** beyond the entity id itself — short of the
  case's *"actor + timestamp + OB reference + action=Create."*
- **[FAIL] (the decisive one) SelfConfirm is not audited.** Ryno Koen's `isVerified` flag is **true** — the
  self-verification demonstrably happened (recorded in the 08-25 suite-06 work, and the resolver now returns
  *"Office bearer has already verified themselves"*). Yet the OB's audit trail has **exactly one entry, `Created`**.
  There is **no `SelfConfirm` event, and no `Update` event** for the flag change. The self-confirmation left **no
  trace** in the audit history.
- **[FAIL] The SelfConfirm entry cannot record a link source — because it does not exist.** The case's second,
  explicit assertion fails vacuously.
- **[Update / Delete] not separately exercised.** Both would require mutating an office bearer on shared QA. They
  were not performed. But the self-confirm *is* an update to the OB (`isVerified` false → true), and it produced no
  entry — so office-bearer updates are demonstrably **not** audited, which is the substance of step 2 regardless.

**🔑 The audit is applied inconsistently across entity types.** For contrast, the **NpoApplication**
(`6c02e52c-…`) audit trail holds `Created` + **two `Updated` entries, one carrying a real diff**
(*"`Application Status` was changed from 'Application In Progress' to 'OBFailed Compliance'"*). So the platform
*can* and *does* record field-level updates — for applications. Office bearers get **Create only**. Whatever
subscribes OBs to the audit pipeline is not wired for their updates or for the self-confirm workflow step.

**Verdict: FAILED.** Two of the case's assertions (SelfConfirm entry; SelfConfirm link source) fail outright, and
the Create entry is thinner than prescribed. No mutation was required to establish this — a known-confirmed record
with a Create-only trail is conclusive.

---

## Method notes
- The OB entity type (`Npo.NpoOfficeBearer`) and its `organisation` filter property were read from the **profile
  page's own** `Entities/GetAll` request, captured live — not guessed. An earlier attempt on the
  `boxfusion.dsdnpo.Domain.OfficeBearers.NpoOfficeBearer` dynamic-CRUD path 404'd; the audit endpoint accepts
  either type string and returns the same trail.
- Our test NPOs were located via `quickSearch=Nomfanelo_QA` (hand-built `filter` expressions returned 400 — the
  grids use `quickSearch`, so I did too).
- **Every call was a read. No office bearer was created, updated, self-confirmed or deleted in this run.**

## ❓ Question for Thabiso
Office-bearer **self-confirmation** and **updates** are not written to the entity audit trail, though application
updates are. Is the audit subscription meant to cover `NpoOfficeBearer` state changes? As it stands, a change to who
is verified on an NPO leaves no auditable record — relevant to POPIA accountability and to any later dispute about
who confirmed whom.
