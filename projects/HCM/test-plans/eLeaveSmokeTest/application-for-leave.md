# Test Plan: ELEAVE-SMOKE-APPLY — Application for Leave

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-04
> **Estimated Duration:** 420s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | GOV003 / 123qwe (applicant — Thabo Musa Victor Mthembu) |
| ADO Plan | [#101528](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=101528&suiteId=101941) |
| ADO Suite | #101941 — Application for leave |

## Objective
> Smoke-test the **Application for Leave** journey of eLeave as the applicant — log in, reach My Items, open a new SaGov Leave Application, and populate the draft form **in this order: Category → Sub-Category → Duration → Start Date → End Date → Address → certification checkbox → Submit** (the form's natural reveal order on v76). Exercise the day-off confirmation, balance message and submission gating (certification checkbox, Delegate modal, required-field and date-order validation), then submit a real application that the **Recommend** and **Approve** smoke tests consume as a chain.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Applicant credentials are valid (GOV003 / 123qwe)
- [ ] To open a new application: Workflows → My Items → Create New → SaGov Leave Application
- [ ] The acting user has the role required to capture a new leave application
- [ ] Form version is **SaGov.Leave/sagov-leave-application v76** — Sub-Category appears after Category, the Duration (Days/Hours) radio after Sub-Category, and the certification checkbox + Submit after the dates are populated.

> **Chain note.** The seeded submit (TC-10/TC-11, run with `SEED_SUBMIT=1`) records the generated reference number to `.submitted-application.json` so `recommend-leave` and `approve-leave` act on the same application. A future-dated single working day is used (re-tried a week forward if the form reports an overlap with existing leave).

## Test Cases

### TC-01 — Create New Leave Application: login and reach My Items (ADO #101956)

*Log in to the system using valid credentials (GOV003 / 123qwe), then navigate to Workflows → My Items.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `GOV003`
  4. TYPE Password field with `123qwe`
  5. CLICK the Sign In button
  6. WAIT for the landing page to load
  7. CLICK Workflows in the navigation, then click on 'My Items'
  8. WAIT for the My Items page to load
- **Expected result:** The user is logged in and redirected to the landing page, then to the 'My Items' page.
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the My Items page is displayed

---

### TC-02 — My Items page loads with leave application list (ADO #101957)

*Verify that navigating to 'My Items' displays existing leave applications with all expected columns. Observe the list and scrollbar.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT Observe the My Items list and scrollbar
- **Expected result:** Scrollbar appears when items overflow the visible area.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave application list is displayed; a scrollbar appears when items overflow the visible area

---

### TC-03 — 'Create New' dropdown shows SaGov Leave Application option (ADO #101958)

*Verify the 'Create New' button opens a dropdown that includes the 'SaGov Leave Application' option. Inspect the dropdown items.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: the 'Create New' button
  2. CLICK the 'Create New' button
  3. SNAPSHOT Inspect the dropdown items
- **Expected result:** 'SaGov Leave Application' is listed as an option.
- **Assertions:**
  - [x] ASSERT (BLOCKING) 'SaGov Leave Application' is listed as an option in the Create New dropdown

---

### TC-04 — New leave application form opens on option selection (ADO #101959)

*Selecting 'SaGov Leave Application' from the dropdown navigates to a blank new leave form. Inspect form fields.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: the 'SaGov Leave Application' option
  2. CLICK the 'SaGov Leave Application' option
  3. SNAPSHOT Inspect form fields
- **Expected result:** Form displays: Category, Sub Category, Start Date, End Date, Address, and Telephone fields.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The new leave form opens displaying Category, Sub Category, Start Date, End Date, Address and Telephone fields

---

### TC-05 — Category and sub-category populate correctly (ADO #101960)

*Selecting 'Annual Leave' in Category opens a Sub Category dropdown that also accepts 'Annual Leave'.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: the Category field
  2. SELECT 'Annual Leave' in the Category field
  3. SNAPSHOT — confirm the Category field displays 'Annual Leave'
  4. CLICK the Sub Category field
  5. SNAPSHOT — confirm the sub-category dropdown list appears
  6. SELECT 'Annual Leave' from Sub Category
- **Expected result:** Category field displays 'Annual Leave'; the Sub Category dropdown appears and accepts 'Annual Leave' with no validation error.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Sub Category field displays 'Annual Leave' and no validation error is shown

---

### TC-06 — Same-day start and end date shows '1 day off' confirmation (ADO #101961)

*When start date equals end date the system should display a green confirmation indicating 1 day off.*

- **Type:** Happy path
- **Steps:**
  1. SELECT Category = Annual Leave, Sub-Category = Annual Leave, Duration = Days
  2. TYPE/SELECT set Start Date and End Date to the same future working day
  3. SNAPSHOT Observe the confirmation banner
- **Expected result:** Green message appears: 'Great!: You have selected to take 1 day off'.
- **Assertions:**
  - [x] ASSERT (BLOCKING) A green confirmation message 'You have selected to take 1 day off' is displayed (now surfaces on v76)

---

### TC-07 — Available leave balance message shown after date selection (ADO #101962)

*After selecting dates the system should display the remaining leave balance for the selected leave type. Observe the informational message box.*

- **Type:** Happy path
- **Steps:**
  1. With Category/Sub-Category/Duration and the dates set, SNAPSHOT Observe the informational message box
- **Expected result:** Message appears: 'Available days: Please note that you only have X day(s) (current leave cycle) left for this particular leave type'.
- **Assertions:**
  - [x] ASSERT (BLOCKING) An available-days message is displayed for the selected leave type (now surfaces on v76)

---

### TC-08 — Address and telephone fields accept valid input (ADO #101963)

*Address (textarea) and Telephone fields accept freeform text and phone numbers without errors.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: the Telephone field
  2. TYPE `+27761425983` in the Telephone field
  3. SNAPSHOT — confirm the value is displayed
- **Expected result:** Phone number is accepted and displayed in the field.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The phone number is accepted and displayed in the Telephone field

---

### TC-09 — Submit is blocked until the certification checkbox is ticked (ADO #101964)

*With all required fields populated but the 'I hereby certify …' checkbox un-ticked, Submit must stay disabled; ticking the checkbox enables it.*

- **Type:** Negative
- **Steps:**
  1. Fill Category, Sub-Category, Duration, Start Date, End Date and Address
  2. SNAPSHOT — confirm the 'Submit' button is disabled while the certification checkbox is un-ticked
  3. CLICK the 'I hereby certify …' checkbox and SNAPSHOT — confirm Submit becomes enabled
- **Expected result:** Submit is disabled until the certification checkbox is ticked; no Delegate modal appears while it is disabled.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Submit is disabled before the checkbox is ticked and enabled after; the Delegate modal does not appear

---

### TC-10 — Delegation modal appears on submit (ADO #101965)

*After completing the form (incl. the certification checkbox) and clicking Submit, a 'Delegate' modal should be displayed.*

> **SEEDED MUTATION (opt-in).** This test submits a **real** leave application to QA. The spec guards it behind `SEED_SUBMIT=1`; a normal run skips it. On v76 the fill order is **Category → Sub-Category → Duration → Start Date → End Date → Address → certification checkbox → Submit**; Submit enables only once every required field is populated and the certification checkbox is ticked.

- **Type:** Happy path
- **Steps:**
  1. Fill the form in order: Category = Annual Leave, Sub-Category = Annual Leave, Duration = Days, Start Date, End Date, Address
  2. CLICK the certification checkbox ('I hereby certify …')
  3. SNAPSHOT — confirm the 'Submit' button is now enabled
  4. CLICK the 'Submit' button
  5. SNAPSHOT Observe the modal
- **Expected result:** A modal dialog titled 'Delegate' appears with delegation options including a 'Don't Delegate' button.
- **Assertions:**
  - [x] ASSERT (BLOCKING) A 'Delegate' modal appears with a 'Don't Delegate' button

---

### TC-11 — 'Don't Delegate' closes modal and returns to My Items (ADO #101966)

*Clicking 'Don't Delegate' in the delegation modal dismisses it and navigates back to My Items.*

> **SEEDED MUTATION (opt-in).** Submits a real leave application to QA; guarded behind `SEED_SUBMIT=1` (skipped on a normal run). **This is the chain's source application** — its reference number is recorded so `recommend-leave` and `approve-leave` act on the same one.

- **Type:** Happy path
- **Steps:**
  1. Complete the form (order per TC-10) and click Submit so the Delegate modal appears
  2. CLICK the 'Don't Delegate' button in the Delegate modal
  3. SNAPSHOT Observe the page after the modal closes; record the submitted reference number
- **Expected result:** User is redirected to 'My Items' page. The newly submitted application appears in the list and its ref is recorded for the recommend/approve chain.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The modal closes and the user is returned to the My Items page

---

### TC-12 — Submit without required fields shows validation errors (ADO #101967)

*Submitting the form with empty required fields should display inline field-level validation errors.*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the target element for: the T&Cs checkbox and 'Submit' button
  2. CLICK tick the T&Cs checkbox and click 'Submit'
  3. SNAPSHOT Observe the validation messages
- **Expected result:** Each required empty field shows an inline error message. The Delegate modal does NOT appear.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Inline validation errors are shown on empty required fields and the Delegate modal does not appear

---

### TC-13 — End date before start date is rejected (ADO #101968)

*Setting end date earlier than start date should trigger a validation error and not show a negative day count.*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the target element for: the End Date field
  2. TYPE/SELECT set End Date to 03/06/2026 (before the start date)
  3. SNAPSHOT Observe the form state
- **Expected result:** An error message appears (e.g., 'End date cannot be before start date'). The day-off counter does not display a negative or zero value.
- **Assertions:**
  - [x] ASSERT (BLOCKING) A validation error appears and the day-off counter shows no negative/zero value

---

### TC-14 — Leave spanning a weekend counts only working days (ADO #101969)

*A date range spanning Saturday and Sunday should not count weekend days in the total day count. Observe the day-off confirmation message.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT Observe the day-off confirmation message
- **Expected result:** System shows '5 days' (not 7). Weekend days are excluded from the count.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The day-off count excludes weekend days (shows 5 days, not 7)

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
- Do not finalise submissions against live QA data unless explicitly running a seeded mutation pass.
