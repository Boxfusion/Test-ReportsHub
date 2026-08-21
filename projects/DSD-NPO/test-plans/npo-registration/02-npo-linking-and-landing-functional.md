# Test Plan: NPO-02-F — NPO Linking & Landing (functional)

> **Status:** Imported from Azure DevOps 2026-08-18 — public portal. Builds on the smoke run's linking finding (lookup works, **Confirm was inert**, authorisation hole). Several cases depend on Confirm actually working.
> **Owner:** QA
> **Last Updated:** 2026-08-18
> **Estimated Duration:** 900s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101885) |
| ADO Suite | 101885 — *02 - NPO Linking & Landing* (6 cases here; 3 more owned by smoke) |

## Objective
> Verify the "Link to an existing NPO" journey beyond the happy path: the security-questions branch for mismatched
> legacy details, the granted-admin outcome, the mismatch/cancel/change-request branch, unknown-number handling, the
> empty-state dashboard, and the no-duplicate-link rule.

## No overlap with the smoke plan
Smoke plan `02-npo-linking-and-landing.md` owns **TC-02-001/002/007** (executed 2026-08-13). This functional plan owns
the other 6 — nothing shared.

## 🔑 Starting knowledge from the smoke run (re-confirm)
- **TC-02-002 (smoke):** the NPO lookup returns results, but **`Confirm` was inert** and there was an **authorisation
  hole** in linking. Several cases below (003/004/005/009) need Confirm to actually progress — if it is still inert
  they are **blocked at that step**, which is itself the finding.
- All 6 are `Src:FDS`; **4 carry `Drift-Risk`** (003/004/005). State `Design`.

## Preconditions
- [ ] Public portal reachable; signed in.
- [ ] The linking entry point (first-time user offered Register / **Link to existing NPO**).
- [ ] For TC-02-008 (empty state): a user with **no linked NPO** — our shared account already has linked NPOs, so this
      likely needs a clean account we do not have → expect NOT EXECUTABLE.
- [ ] A real NPO number to link against (for 003/004/009). Our own **`333-019-NPO`** exists; note the account may
      already be linked to it.

## Test Cases

### TC-01 — Link with mismatched details → security questions (ADO #101618 · TC-02-003)
*P2 · Negative · Src:FDS · `Drift-Risk`.*
- **Steps:** 1. Search an NPO number whose legacy contact differs from the current user → 2. Click **Confirm Link**
- **Expected result:** *"Legacy details displayed for confirmation"* → *"Security Questions dialog appears (FDS 7.3.2)"*
- **Assertions:** [ ] legacy details shown · [ ] (BLOCKING) a Security Questions dialog appears on Confirm
- **⚠️** Directly exposed to the smoke "Confirm inert" finding — if Confirm does nothing, record that (the dialog never
  appears) rather than a vague fail.

### TC-02 — Security answers match → Authorised Admin (ADO #101619 · TC-02-004)
*P2 · Positive · Src:FDS · `Drift-Risk`.*
- **Steps:** 1. Answer all security questions correctly and submit
- **Expected result:** *"Link granted; user set as Authorised Admin; NPO Dashboard displayed"*
- **Assertions:** [ ] link granted · [ ] role = Authorised Admin · [ ] dashboard shown
- **🔑 Chains off TC-01** — only reachable if the security dialog appears. Depends on the Confirm step working.

### TC-03 — Security answers mismatch → cancel / Change Request (ADO #101620 · TC-02-005)
*P2 · Negative · Src:FDS · `Drift-Risk`.*
- **Steps:** 1. Answer one or more security questions incorrectly and submit
- **Expected result:** *"Error displayed; options to Cancel or proceed to Change Request form"*
- **Assertions:** [ ] an error shows · [ ] Cancel offered · [ ] a Change Request route offered
- **🔑 Chains off TC-01.**

### TC-04 — Unknown NPO number → no result + alternate route (ADO #101621 · TC-02-006)
*P3 · Negative · Src:FDS.* ✅ **Cleanly runnable.**
- **Steps:** 1. Enter a non-existent NPO number, e.g. `999-999-NPO`
- **Expected result:** *"No legacy details returned; helper text/link with alternative routes displayed"*
- **Assertions:** [ ] no result returned · [ ] a helper message / alternate-route link is shown · [ ] RECORD its wording
- **📌** The most self-contained case — no Confirm dependency. Do this first.

### TC-05 — No linked NPO → empty-state dashboard (ADO #101623 · TC-02-008)
*P3 · Edge · Src:FDS.* ⚠️ **Likely NOT EXECUTABLE with our account.**
- **Steps:** 1. Sign in
- **Expected result:** *"Empty-state page (FDS Fig.9) with CTA to Register/Link"*
- **Assertions:** [ ] empty-state shown · [ ] Register/Link CTA present
- **⚠️** Our shared account already has linked NPOs, so it lands on a populated dashboard, not the empty state. Needs a
  **fresh account with no links** — record as not executable unless one is available.

### TC-06 — Cannot link the same NPO twice (ADO #101624 · TC-02-009)
*P2 · Edge · Src:FDS.*
- **Steps:** 1. Search an already-linked NPO and click **Confirm Link**
- **Expected result:** *"System informs the NPO is already linked; no duplicate link created"*
- **Assertions:** [ ] (BLOCKING) a duplicate link is refused · [ ] a message explains it is already linked
- **🔑** Needs Confirm to work; also needs an NPO already linked to our profile (e.g. `333-019-NPO` if linked).

## Coverage against ADO
| Plan case | ADO | TC id | P | Drift | Runnable? |
|---|---|---|---|---|---|
| TC-01 | #101618 | TC-02-003 | 2 | ⚠️ | ⚠️ depends on Confirm |
| TC-02 | #101619 | TC-02-004 | 2 | ⚠️ | ⚠️ chains off TC-01 |
| TC-03 | #101620 | TC-02-005 | 2 | ⚠️ | ⚠️ chains off TC-01 |
| TC-04 | #101621 | TC-02-006 | 3 | — | ✅ yes |
| TC-05 | #101623 | TC-02-008 | 3 | — | ⚠️ needs a clean account |
| TC-06 | #101624 | TC-02-009 | 2 | — | ⚠️ needs Confirm + a linked NPO |

**6 cases owned.** Smoke counterparts: TC-02-001/002/007.

## Suggested run order
1. **TC-04** (unknown number) — self-contained.
2. **TC-01** — drive the linking flow to Confirm; settle whether Confirm is still inert (governs 02/03/06).
3. **TC-06** — attempt to re-link an already-linked NPO.
4. **TC-02 / TC-03** — only if the security-questions dialog appears.
5. **TC-05** — record empty-state as not-executable unless a clean account exists.

---

## ✅ Executed 2026-08-18 — 1 pass · 1 partial · 1 N/A · 3 deferred
Report: `test-reports/2026-08-18/02-npo-linking-and-landing-functional--link-flow.md`

| Case | Verdict | Note |
|---|---|---|
| TC-01 (TC-02-003) | ⚪ DEFERRED | can't reach security-questions branch — we're already Primary Contact on our NPOs |
| TC-02 (TC-02-004) | ⚪ DEFERRED | chains off TC-01 |
| TC-03 (TC-02-005) | ⚪ DEFERRED | chains off TC-01 |
| TC-04 (TC-02-006) | ⚠️ PARTIAL | `999-999-NPO` → "Not Found!" but **no alternate-route link** |
| TC-05 (TC-02-008) | ⛔ NOT EXECUTABLE | our account has linked NPOs → never sees empty state |
| TC-06 (TC-02-009) | ✅ PASS | already-Primary-Contact → link refused, no duplicate |

🔑 **Smoke "Confirm inert" finding RESOLVED** — Confirm Link now processes (returned "already a Primary Contact").
▶ **To finish 01/02/03:** need an NPO our account neither owns nor is linked to, with mismatched legacy details.
