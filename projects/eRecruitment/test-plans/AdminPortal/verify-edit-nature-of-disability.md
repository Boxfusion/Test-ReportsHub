# Test Plan: ADMINPORTAL-106536 — Verify Edit Nature of disability

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106536 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106536](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106536) — Verify Edit Nature of disability |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application for the candidate ADO calls "Everything F" — renamed by [ADMINPORTAL-106529](./verify-edit-last-name.md), so the Applications table now lists it as **"Edit Last Name F"** |

## Objective
> Validate that a Recruiter can edit a candidate application's Personal Details, specifically clearing and updating the "Nature Of Disability" text field, and that the change persists after Save + refresh.
>
> **⚠️ STATEFUL — requires confirmation before running:** TC-12 clicks Save for real, permanently changing the shared candidate's Nature Of Disability text to "Edit Disability" — and, as an unavoidable side effect (see discrepancy below), also flips **Has Disability from "No" to "Yes"**. This is the same shared QA fixture already modified by ADMINPORTAL-106529 through 106535. TC-01 through TC-11 only navigate and fill fields in the DOM without saving, so they are safe to repeat.
>
> **Discrepancy notes:**
> - ADO step 7 references the candidate by their **original** name, "Everything F" — no longer valid after ADMINPORTAL-106529's real Save; the candidate is now listed as "Edit Last Name F". This spec targets the current name.
> - ADO step 7's expected result ("pre-screened status") does not match reality: the application opens with status badge **"AWAITING PRE-SCREENING"**.
> - **Important, not just a wording issue:** ADO's steps 9-11 assume the "Nature Of Disability" field is directly present and editable, but confirmed live 2026-08-05: this field is **conditionally hidden** — it only renders once "Has Disability" is set to "Yes". The candidate's "Has Disability" is currently "No", so the field does not exist in the DOM at all until that radio button is changed. ADO's steps do not mention this prerequisite. This spec adds the required "select Has Disability = Yes" step (TC-09) before the field can be interacted with — meaning the real Save in this test changes **two** fields, not one.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F"

## Test Cases

### TC-01 — Login as Kwena (ADO #106536 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106536 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106536 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106536 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106536 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target candidate's Application (ADO #106536 step 7, corrected name)

- **Expected result (actual, corrected):** Application opens successfully with status badge "AWAITING PRE-SCREENING" (not "pre-screened" as ADO states)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"

---

### TC-07 — Click "Edit Personal Details" (ADO #106536 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details fields open in edit mode (Race dropdown editable, "Save" button visible)

---

### TC-08 — Confirm "Nature Of Disability" is not present while Has Disability is "No" (undocumented prerequisite, not an ADO step)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the "Nature Of Disability" field is not visible

---

### TC-09 — Select "Yes" for Has Disability (undocumented prerequisite, not an ADO step)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Nature Of Disability" field becomes visible, pre-filled with "Test disability note"

---

### TC-10 — Clear the Nature Of Disability text area (ADO #106536 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the field becomes cleared successfully

---

### TC-11 — Enter "Edit Disability" (ADO #106536 step 10)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the field contains "Edit Disability"

---

### TC-12 — Click on Save (ADO #106536 step 11) — ⚠️ REAL, PERSISTENT EDIT

- **Expected result:** Record saves successfully; the updated Nature Of Disability is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + page reload, the Personal Details panel shows Has Disability "Yes" and Nature Of Disability "Edit Disability"

---

## Teardown
- No automated teardown. TC-12 performs a real, persistent change to the shared candidate application's Has Disability and Nature Of Disability fields.
