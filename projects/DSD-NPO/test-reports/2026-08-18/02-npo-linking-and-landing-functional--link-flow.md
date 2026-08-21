# Report: NPO-02-F — NPO Linking & Landing (functional) — link flow

**Date:** 2026-08-18 10:40 UTC
**Plan:** test-plans/npo-registration/02-npo-linking-and-landing-functional.md
**Execution Mode:** ai-repair
**Result:** PARTIAL — 1 passed, 1 partial, 1 not-executable, 3 deferred of 6; and the smoke "Confirm inert" finding is **resolved**
**Duration:** ~700s
**Cases:** TC-02-004, TC-02-005, TC-02-006, TC-02-008, TC-02-009 (+ TC-02-003 attempted)
**Environment:** QA · public portal · signed in as the shared account

## Summary
| Total | Passed | Partial | Not executable | Deferred |
|---|---|---|---|---|
| 6 | 1 | 1 | 1 | 3 |

| Case | Title | Verdict |
|---|---|---|
| TC-02-003 | Mismatch → security questions | ⚪ DEFERRED — can't reach the branch with our records |
| TC-02-004 | Security match → Authorised Admin | ⚪ DEFERRED — chains off 003 |
| TC-02-005 | Security mismatch → cancel/Change Request | ⚪ DEFERRED — chains off 003 |
| TC-02-006 | Unknown NPO number → no result + alt route | ⚠️ **PARTIAL** — "Not Found!" shown, but no alternate-route link |
| TC-02-008 | No linked NPO → empty-state dashboard | ⛔ NOT EXECUTABLE — our account has linked NPOs |
| TC-02-009 | Cannot link the same NPO twice | ✅ **PASS** |

## ✅ Smoke finding resolved — Confirm is no longer inert
The smoke run (TC-02-002) reported the NPO lookup worked but **`Confirm` was inert**. On this run, clicking
**"Confirm Link to NPO"** processed and returned a clear result (below). So the inert-Confirm behaviour **no longer
reproduces** — the linking flow now completes its action. (Worth Thabiso confirming a fix went in, same as the OB-wipe.)

## ✅ TC-02-009 — Cannot link the same NPO twice
Searched **`333-019-NPO`** (our own NPO) → legacy details displayed (Name, Authorized Person Name/Cell/Email),
**"Confirm Link to NPO"** enabled → clicked it → message: **"You are already a Primary Contact Person for Nomfanelo QA
Annual NPO 2026-08-17"**. No duplicate link created. Both assertions met. *Evidence: v19.*

## ⚠️ TC-02-006 — Unknown NPO number: PARTIAL
Searched **`999-999-NPO`** → the dialog showed **"Not Found!"**. The no-result half passes, but the case also expects
*"helper text/link with alternative routes"* (FDS: *"donot match click link for instructions"*) — **no such link or
helper text was shown**, only the bare "Not Found!". So the alternate-route guidance is missing. *Evidence: v18.*

## ⛔ TC-02-008 — Empty-state dashboard: NOT EXECUTABLE
Our shared account already has linked NPOs, so sign-in lands on the **populated** NPO landing view, never the
empty-state page (FDS Fig.9). Needs a **fresh account with no links** — which we do not have. Not executable with the
current account.
📌 Minor inconsistency noticed: the Register/Link landing (`no-existing-npo-landing-page`) states *"You are currently
not linked to any NPOs"* even though the dashboard shows a linked NPO for the same user. Worth a question.

## ⚪ TC-02-003 / 004 / 005 — deferred, and why
These need the **security-questions branch**, which only triggers when a user links an NPO whose legacy details differ
from theirs **and they are not already associated with it**. With `333-019-NPO` we are **already the Primary Contact**,
so Confirm short-circuits to "already linked" (TC-02-009) before any security questions appear — even though the stored
email (`mpendulosobethu@gmail.com`) differs from our login (`mpenduloizwelinuk@gmail.com`).
▶ **To execute:** an NPO number that our account **neither owns nor is linked to**, with legacy contact details that
mismatch — i.e. someone else's NPO, or a seeded record set up for this. Not available to us now.

## Observations for the test lead
1. **Confirm-Link is no longer inert** (smoke finding) — please confirm a fix landed.
2. **Unknown NPO number shows only "Not Found!"** with no alternate-route link (TC-02-006) — the FDS "click here for
   instructions" helper is missing.
3. **The Register/Link landing says "not linked to any NPOs"** for a user who has a linked NPO on the dashboard —
   inconsistency to clarify.
4. **The security-questions branch (TC-02-003/004/005) needs a third-party NPO** to test — can a seeded NPO (that our
   account isn't linked to, with known mismatched details) be provided? Same theme as the role-scoped-users gap.

## 📸 Evidence — `test-reports/2026-08-18/evidence/`
| File | Shows |
|---|---|
| `v18-link-unknown-npo-not-found-no-alt-route.png` | `999-999-NPO` → "Not Found!", no alternate-route link |
| `v19-link-already-primary-contact-refused.png` | `333-019-NPO` → "already a Primary Contact Person", no duplicate link |

## Method notes
- 🔑 The NPO lookup is a **search** (magnifier button beside the field), then a details panel + "Confirm Link to NPO".
- 🔑 Used our **own** NPO `333-019-NPO` for the duplicate-link check; no data was created (link refused).
- 🔑 The "already Primary Contact" short-circuit means our records can't reach the security-questions branch — a
  genuine third-party NPO is required.
