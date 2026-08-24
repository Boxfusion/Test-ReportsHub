# Test Plan: NPO-08 — Annual Compliance: Report Submission (public portal) (smoke)

> **Status:** Imported from Azure DevOps — ⛔ **blocked**, not yet executable
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101865) |
| ADO Suite | 101865 — *08 - Annual Compliance - Submission (Portal)* (5 cases) |

## Objective
> Verify that a registered NPO can complete and submit its annual report through the public portal — organisation and tax details, programmes/employees/meetings, office-bearer confirmation, the finance report, and the declaration that submits it.

## ⛔ Blocked
Needs a **registered** NPO (not merely a submitted application) linked to the signed-in user. That requires the full registration journey — blocked at the address autocomplete defect — or a **linked legacy NPO** via plan NPO-02 TC-02, which is itself unconfirmed.

🔑 **Linking to an existing NPO is the cheaper route to unblocking this suite.** The register holds 361,068 migrated NPOs. If NPO-02 TC-02 can be made to work, suites 08, 10P, 11P and 13P all become reachable **without** waiting for the registration fix.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO cases; all state `Design`.

📌 **The smoke suite samples steps 1, 2, 3, 5 and 6 of the annual report.** Step 4 is not covered in smoke — it is in the Functional plan (suite 101891, 18 cases).

## Preconditions
- [ ] The signed-in user is linked to a **registered** NPO
- [ ] An annual report has been initiated for it
- [ ] 🔑 View mode **Live → Latest**
- [ ] Free text ≤100 characters

## Test Cases

### TC-01 — Step 1: org details auto-populate; tax number and auditing firm captured (ADO #101739 · TC-08-007)

*Priority 1 · Positive.*

- **Type:** Happy path
- **Steps:**
  1. Open the annual report at **Step 1**
  2. ASSERT (BLOCKING) organisation info is displayed and **read-only**
  3. TYPE the **Income Tax Number**
  4. SELECT **Audited = Yes**
  5. TYPE the **Auditing Firm** details
  6. CLICK **Next**
  7. ASSERT the data is saved and the wizard navigates to Step 2
- **Expected result:** *"Org info read-only and visible"* then *"Saved; navigation to Step 2"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) org info is present and read-only
  - [ ] ASSERT the captured values persist after Next
- 🔑 Test read-only by **attempting an edit**, not by reading an attribute.
- **📌** Selecting *Audited = Yes* is what reveals the auditing-firm fields — treat it as a conditional group and assert it appears.

---

### TC-02 — Step 2: programmes, employees and meetings captured (ADO #101741 · TC-08-009)

*Priority 1 · Positive.*

- **Type:** Happy path
- **Steps:**
  1. On **Step 2**, add an **Achievement** (service + objective for the financial year)
  2. Capture **employee counts and demographics**
  3. Add a **meeting record** with a description
  4. ASSERT (BLOCKING) all entries are saved and visible in the summary
- **Expected result:** *"All entries saved; visible in summary"*
- **Assertions:**
  - [ ] ASSERT the achievement is saved and listed
  - [ ] ASSERT employee counts and demographics are saved
  - [ ] ASSERT (BLOCKING) the meeting record appears in the summary
- **📌** Three separate sub-forms in one case. Assert each independently so a partial failure is legible in the report.

---

### TC-03 — Step 3: OB list visible; user confirms the OBs still apply (ADO #101743 · TC-08-011)

*Priority 1 · Positive.*

- **Type:** Happy path
- **Steps:**
  1. On **Step 3**, ASSERT the office-bearer list is displayed
  2. ASSERT it matches the OBs currently on record for the NPO
  3. TICK **'OBs still apply'**
  4. ASSERT (BLOCKING) the confirmation is accepted and the wizard can move to the next step
- **Expected result:** *"Accepted, can move to next step"*
- **Assertions:**
  - [ ] ASSERT the OB list renders and matches the NPO's record
  - [ ] ASSERT (BLOCKING) ticking the confirmation permits progress
- **❓ Question for Thabiso:** what happens when the OBs **do not** still apply? The smoke case only covers the affirmative. Is there a change path from here, or must the NPO raise a Post Registration change request instead?

---

### TC-04 — Step 5: finance report threshold and accounting officer (ADO #101746 · TC-08-014)

*Priority 1 · Positive.*

- **Type:** Happy path
- **Steps:**
  1. On **Step 5**, SELECT a **reporting threshold**
  2. Capture the **accounting officer** details
  3. Capture the **funding** details
  4. ASSERT (BLOCKING) all values are saved
- **Expected result:** *"All saved"*
- **Assertions:**
  - [ ] ASSERT the reporting threshold selection persists
  - [ ] ASSERT accounting officer details persist
  - [ ] ASSERT (BLOCKING) funding details persist
- **📌** RECORD the available reporting thresholds — the case does not enumerate them, and the threshold usually drives what financial reporting is required.

---

### TC-05 — Step 6: declaration captures chairperson details and submits (ADO #101749 · TC-08-017)

*Priority 1 · Positive. Terminal case of the suite.*

- **Type:** Happy path (end-to-end completion)
- **Steps:**
  1. On **Step 6**, TYPE the chairperson **full name** and **capacity**
  2. ASSERT the **date auto-populates**
  3. CLICK **Submit**
  4. API — capture the submit request **and its response body**, including any non-2xx
  5. ASSERT (BLOCKING) the annual report is submitted
  6. ASSERT an acknowledgement email/SMS is sent to the NPO
  7. Cross-check the submission is retrievable on the admin side (plan NPO-09 TC-01)
- **Expected result:** *"Annual report submitted; acknowledgement email/SMS sent to NPO"*
- **Assertions:**
  - [ ] ASSERT the date auto-populates
  - [ ] ASSERT (BLOCKING) submission succeeds
  - [ ] ASSERT the acknowledgement is delivered
  - [ ] ASSERT the report appears in the admin All Annual Reports view
- 🔑 **Assert retrievability separately.** A closing form is not proof of a save on this build.
- **📌** Use `0818400598` so the SMS leg can be checked on the handset.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101739 | TC-08-007 | ⛔ needs a registered NPO |
| TC-02 | #101741 | TC-08-009 | ⛔ same |
| TC-03 | #101743 | TC-08-011 | ⛔ same |
| TC-04 | #101746 | TC-08-014 | ⛔ same |
| TC-05 | #101749 | TC-08-017 | ⛔ same |

**Not in this plan** (Functional suite 101891, 18 cases, to import later): TC-08-001 → 006, 008, 010, 012, 013, 015, 016, 018+ — including Step 4, which smoke skips entirely.
