# Test Plan: ADMINPORTAL-106530 — Verify Edit Identity Number

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106530 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106530](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106530) — Verify Edit Identity Number |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application for the candidate ADO calls "Everything F" — this record was renamed by [ADMINPORTAL-106529](./verify-edit-last-name.md), so the Applications table now lists it as **"Edit Last Name F"** |

## Objective
> Validate that a Recruiter can edit a candidate application's Personal Details, specifically clearing and updating the Identity Number field, and that the change persists after Save + refresh, including in the Applications index table.
>
> **⚠️ STATEFUL — requires confirmation before running:** TC-11 clicks Save for real, permanently changing the shared candidate's Identity Number to a new value. This is the same shared QA fixture that [ADMINPORTAL-106529](./verify-edit-last-name.md) already renamed once. TC-01 through TC-10 only navigate and fill the field in the DOM without saving, so they are safe to repeat.
>
> **Discrepancy notes:**
> - ADO step 7 references the candidate by their **original** name, "Everything F" — but that name no longer exists after ADMINPORTAL-106529's real Save; the candidate is now listed as "Edit Last Name F". This spec targets the current name.
> - ADO step 7's expected result ("pre-screened status") does not match reality: the application opens with status badge **"AWAITING PRE-SCREENING"** (same discrepancy documented in ADMINPORTAL-106529/106547).
> - ADO steps 9–12 call the field "ID Number", but the actual on-screen label is **"Identity Number"**. This spec uses the actual label.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F"

## Test Cases

### TC-01 — Login as Kwena (ADO #106530 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106530 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106530 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106530 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106530 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target candidate's Application (ADO #106530 step 7, corrected name)

- **Expected result (actual, corrected):** Application opens successfully with status badge "AWAITING PRE-SCREENING" (not "pre-screened" as ADO states)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"

---

### TC-07 — Click "Edit Personal Details" (ADO #106530 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Identity Number field is now an editable input, and a "Save" button is visible

---

### TC-08 — Click inside the Identity Number field (ADO #106530 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Identity Number field is focused and editable

---

### TC-09 — Clear the Identity Number field (ADO #106530 step 10)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Identity Number field is empty

---

### TC-10 — Enter a different valid 13-digit Identity Number (ADO #106530 step 11)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Identity Number field contains the new 13-digit value

---

### TC-11 — Click on Save (ADO #106530 step 12) — ⚠️ REAL, PERSISTENT EDIT

- **Expected result:** Record saves successfully; the updated Identity Number is displayed, and it also updates in the Applications index table
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + page reload, the Personal Details panel shows the new Identity Number
  - [x] ASSERT (BLOCKING) the new Identity Number is also visible in the Job Posting's Applications index table

---

## Teardown
- No automated teardown. TC-11 performs a real, persistent change to the shared candidate application's Identity Number.
