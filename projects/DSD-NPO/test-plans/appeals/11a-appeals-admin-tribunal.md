# Test Plan: NPO-11A — Appeals: Admin / Chairperson / Tribunal (smoke)

> **Status:** Imported from Azure DevOps — **partially reachable** (TC-01 runnable now)
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 150s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101869) |
| ADO Suite | 101869 — *11A - Appeals - Admin / Chairperson / Tribunal* (3 cases) |

## Objective
> Verify the DSD-staff side of an appeal: listing and filtering all appeals, sending one to the chairperson for case preparation, and recording a tribunal outcome of Upheld.

## Reachability
**TC-01 is runnable now** — `CRUDS → Appeals` exists on the admin portal. TC-02 and TC-03 are **state-changing** and must run against **our own** appeal (plan NPO-11P), which is blocked.

⚠️ **Do not send another tester's appeal to a chairperson.** TC-02 emails a real person and moves the case's status.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO cases; all state `Design`.

## Preconditions
- [ ] Admin portal signed in; view mode **Live → Latest**
- [ ] TC-01: at least one appeal of each type submitted
- [ ] TC-02: **our own** appeal in status *Initiated*
- [ ] TC-03: a refusal-to-register appeal in status *TribunalAssigned*

## Test Cases

### TC-01 — Admin sees all appeals and can filter by type (ADO #101779 · TC-11-007)

*Priority 1 · Positive.* ✅ **Runnable now.**

- **Type:** Happy path (structural)
- **Steps:**
  1. NAVIGATE to **CRUDS → Appeals** (*All Appeals*, FDS Appeals 8.1)
  2. WAIT for the grid — `sha-react-table`, so use `[role=table]` / `[role=row]`
  3. ASSERT (BLOCKING) the list is shown
  4. RECORD the unfiltered row count and **every appeal type present**
  5. Apply filter **Type = Cancellation**
  6. ASSERT only Cancellation appeals are shown
  7. Clear the filter → ASSERT the original count returns
- **Expected result:** *"List shown"* then *"Only Cancellation appeals shown"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the appeals list renders
  - [ ] ASSERT the Type filter narrows to Cancellation
  - [ ] ASSERT every visible row is of that type
  - [ ] ASSERT clearing restores the original count
- **📌** This case confirms **Cancellation** is an appeal type alongside *Refusal to Register* (from plan NPO-11P). Record the full list of types while here — neither plan enumerates them.

---

### TC-02 — Send to Chairperson emails the appeal and moves it to Case Preparation (ADO #101780 · TC-11-008)

*Priority 1 · Positive.* ⛔ Needs our own appeal in status *Initiated*.

- **Type:** Happy path (workflow action)
- **Steps:**
  1. Open **our** appeal
  2. CLICK **Send to Chairperson**
  3. TYPE the chairperson's email
  4. CLICK **Submit**
  5. ASSERT (BLOCKING) the chairperson receives the appeal by email
  6. ASSERT the status becomes **CasePreparation** *(`RefList` = 1)*
- **Expected result:** *"Chairperson receives the appeal via email; status = CasePreparation (RefList=1)"*
- **Assertions:**
  - [ ] ASSERT the Send to Chairperson dialog accepts an email address
  - [ ] ASSERT (BLOCKING) the status becomes `CasePreparation`
  - [ ] ASSERT the chairperson email is delivered
- **📌** Assert the underlying **`RefList=1`** as well as the displayed label where the API response is visible.
- **❓ Question for Thabiso:** the chairperson email is **typed in free-form** at this step rather than resolved from a role or the NPO record. Is that intended? A typo silently sends an appeal to the wrong recipient, and there is no case covering it.
- **📌** Use a mailbox QA can actually read, and `0818400598` for any SMS leg.

---

### TC-03 — Tribunal records an Upheld outcome for a refusal-to-register appeal (ADO #101784 · TC-11-012)

*Priority 1 · Positive.* ⛔ Needs an appeal in status *TribunalAssigned*.

- **Type:** Happy path (decision)
- **Steps:**
  1. Open a **refusal-to-register** appeal in status **TribunalAssigned**
  2. Record outcome = **Upheld**, attaching a supporting document
  3. ASSERT (BLOCKING) the status becomes **Upheld** *(`RefList` = 4)*
  4. ASSERT the user is then allowed to **update documents and complete the application process** *(FDS Appeals 6.2 rule 14b)*
- **Expected result:** *"Status=Upheld (RefList=4); user is allowed to update docs and complete application process per FDS Appeals 6.2 rule 14b"*
- **Assertions:**
  - [ ] ASSERT the outcome can be recorded with a supporting document
  - [ ] ASSERT (BLOCKING) the status is exactly `Upheld` (`RefList=4`)
  - [ ] ASSERT the applicant regains the ability to update documents and continue the application
- **📌 The second assertion is the substantive one.** A status change is easy; *reopening the refused application so the applicant can finish it* is the actual business outcome, and it crosses back to the public portal to verify.
- **❓ Question for Thabiso:** how does an appeal reach **TribunalAssigned**? The smoke suite jumps from *CasePreparation* (TC-02) straight to a tribunal decision, with the assignment step covered in neither plan. We cannot construct this state without knowing it.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101779 | TC-11-007 | ✅ yes |
| TC-02 | #101780 | TC-11-008 | ⛔ needs our own appeal |
| TC-03 | #101784 | TC-11-012 | ⛔ needs a TribunalAssigned appeal |

**Not in this plan** (Functional suite 101895, 7 cases, to import later): TC-11-006, 009 → 011, 013+.
