# Test Plan: NPO-14U-F — Audit trail & resubmission diff (functional)

> **Status:** Imported from Azure DevOps 2026-08-25
> **Owner:** QA
> **Last Updated:** 2026-08-25
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101907) |
| ADO Suite | 101907 — *14U - Audit trail & resubmission diff* (4 cases) |

## Objective
> Verify that every state transition, office-bearer change and document upload is written to an audit trail with
> actor, timestamp and before/after values — and that a resubmission can be diffed against the previous submission.

## Provenance
Imported from the ADO functional plan on 2026-08-25 via the browser + REST route. Expected results quoted verbatim.
Raw pull retained at `test-data/ado-functional-101543/ado-suite-101907.json`.

## ⛔ Correcting the record before this plan is run
On 2026-08-18 this suite was written off as *"unexecutable — all 6 entity-history routes 404"* (recorded against
TC-05-020). **Those six routes were guesses and the conclusion was wrong.** The audit screens exist:

| Route | State as at 2026-08-25 |
|---|---|
| `/dynamic/Shesha/entity-change-audit-log` | **400** — `"The value '' is invalid."` ← the screen this suite needs |
| `/dynamic/Shesha/logon-audit` and `/login-audit-table` | ✅ work — 60 451 records |
| `/dynamic/StarterTemplate/otp-audit-table` | renders 13 258 rows, **every cell blank** |
| `/dynamic/Shesha/scheduled-jobs-logs-view` | **404** — `ScheduledJobExecutionDto` not found |
| `boxfusion.dsdnpo/Audit-Trail` | present in the form registry |

So this suite is **blocked by a defect, not unexecutable by design**. See
`bugs/2026-08-25-audit-screens-otp-blank-and-entity-change-broken.md`. 🔑 Enumerate routes from the
`FormConfiguration` registry, never by guessing URLs.

## Preconditions
- [ ] Admin portal sign-in
- [ ] 🔑 View mode **Live → Latest**, asserted not assumed
- [ ] An application with at least one state transition (any of the 10 345 will do)

## Test Cases

### TC-01 — Audit trail captures who/when for every state transition (ADO #101815 · TC-14-003)

*Priority 2 · Positive · `Src:FDS` · `Drift-Risk` · Admin.*

- **Steps (ADO):** 1. Open audit trail for an application
- **Expected result (ADO):** *"Each transition includes actor, timestamp, from-state, to-state, comment"*
- **Assertions:**
  - [ ] (BLOCKING) ASSERT an audit trail can be opened for an application
  - [ ] ASSERT each entry carries actor · timestamp · from-state · to-state · comment

---

### TC-02 — Resubmission diff shows changed fields (ADO #101816 · TC-14-004)

*Priority 3 · Positive · `Src:FDS` · Admin.*

- **Steps (ADO):** 1. View resubmission diff on admin portal
- **Expected result (ADO):** *"Changed fields highlighted; original retained"*
- **Assertions:**
  - [ ] (BLOCKING) ASSERT a diff view exists for a resubmitted application
  - [ ] ASSERT changed fields are distinguishable and the original values are retained
- **📌** `Npo.Application` carries `numOfResubmissions`, so the count is tracked even if no diff view exists —
  worth recording separately from the view's absence.

---

### TC-03 — Office Bearer CRUD writes audit entries (ADO #107426 · TC-14U-003)

*Priority 2 · `Src:Code` · Both · `Coverage-Gap-Topup` · `L1-draft`.*

- **Steps and expected results (ADO), verbatim:**
  1. Admin creates an OB → *"Audit entry: actor + timestamp + OB reference + action=Create."*
  2. Admin updates OB position field → *"Audit entry: action=Update + diff of changed fields."*
  3. OB confirms self-verification via email link → *"Audit entry: action=SelfConfirm + link source."*
  4. Admin deletes / retracts OB → *"Audit entry: action=Delete or Retract + reason."*
- **Assertions:**
  - [ ] ASSERT an audit entry exists for each of Create / Update / SelfConfirm / Delete
  - [ ] ASSERT the `SelfConfirm` entry records the link source
- **🔑 Step 3 is already satisfied as a precondition.** An OB self-verification was completed on 2026-08-25 —
  `tempId eba499877cad` on `Nomfanelo_QA_NPO_2026-08-13` — so a `SelfConfirm` audit entry **should** exist for it.
  That makes this the cheapest of the four steps to check and the strongest evidence either way.

---

### TC-04 — Document upload + application state change written to audit (ADO #107427 · TC-14U-004)

*Priority 2 · `Src:Code` · Both · `Coverage-Gap-Topup` · `L1-draft`.*

- **Steps and expected results (ADO), verbatim:**
  1. User uploads Founding Documents on Wizard Tab 7 → *"Audit entry per file upload with file hash + user reference."*
  2. Admin transitions Application from Submitted to Under Review → *"Audit entry: state transition captured with
     before/after + actor."*
- **Assertions:**
  - [ ] ASSERT an audit entry per uploaded file, carrying a **file hash**
  - [ ] ASSERT the state transition entry carries before/after and the actor
- **📌** A file hash is a strong claim. Suite 05 TC-05-011 already proved uploads round-trip byte-identical
  (SHA-256 match), so the hash exists somewhere — the question is whether the *audit* records it.

## Coverage against ADO
| Plan TC | ADO id | ADO TC | Runnable |
|---|---|---|---|
| TC-01 | #101815 | TC-14-003 | 🔴 **FAILED 2026-08-25**, re-verified 08-28 — the screen sends empty params → 400. **Already counted; NOT blocked.** |
| TC-02 | #101816 | TC-14-004 | ✅ absence is verdictable |
| TC-03 | #107426 | TC-14U-003 | ⚪ **UNBLOCKED 2026-08-28**, not yet run — the audit store *is* readable; needs the OB→application filter property, taken from the grid's own request |
| TC-04 | #107427 | TC-14U-004 | ⚠️ **PARTIAL 2026-08-28** — state transition carries before/after + actor; the file-upload entry carries **no hash** |

> ⚠️ **This table is a planning aid, not a verdict source.** Read verdicts from `test-reports/`. A stale ⛔ on the
> TC-01 row above caused a case that had been FAILED since 08-25 to be re-run as though blocked on 08-28.
