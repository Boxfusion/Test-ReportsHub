# Test Plan: ELEAVE-CAPTURE — Application for Leave: for Myself

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-09-30
> **Estimated Duration:** 150s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | GOV003 / 123qwe (applicant) |
| ADO Plan | [#116862](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=116862&suiteId=116866) — eLeave Regression Tests |
| ADO Suite | #116866 — Application for Leave › for Myself |

## Objective
> Validate that an applicant can capture and submit a leave application **for themselves** from **Workflows › My Items › Create New › New Leave Application** — category / sub-category selection, the Days duration, the leave-days hint, address capture, the certification checkbox, the backdated-comments pop-up (past start date) and the Delegate pop-up.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Applicant credentials are valid (GOV003 / 123qwe)
- [ ] GOV003 has an Annual Leaves balance and a recommender / approver in the organisational structure
- [ ] GOV003 has **no existing leave** on the chosen dates (overlapping leave blocks submission) — pick fresh dates per run

## Test Cases

### TC-01 — Login as Applicant

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `GOV003`
  4. TYPE Password field with `123qwe`
  5. CLICK the Sign In button
  6. WAIT for the home page to load
- **Expected result:** The user has successfully logged in to the system
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Workflows menu item is visible

---

### TC-02 — Submit a backdated leave application (ADO #116867)

*Applicant submits an Annual Leave application whose start date has already passed; the system asks for backdated comments before submitting.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the Workflows menu item
  2. CLICK Workflows in the side menu, then CLICK **My Items**
  3. ASSERT My Items index view is displayed
  4. SNAPSHOT — confirm the **Create New** button
  5. CLICK the **Create New** button
  6. ASSERT the system displays the selectable options in a drop-down list
  7. CLICK **New Leave Application**
  8. ASSERT the system directs the user to the new leave application page
  9. SELECT **Category** — choose `Annual Leaves`
  10. ASSERT leave category is selected
  11. SELECT **Sub-Category** — choose `Annual Leaves`
  12. ASSERT Sub-Category is selected and the **Duration** field is visible
  13. CLICK the **Days** radio on the Duration field
  14. ASSERT Days is selected and the Start Date / End Date fields are visible
  15. TYPE **Start Date** with a date that has passed (e.g. `16/09/2026`)
  16. TYPE **End Date** with the same or a later date
  17. ASSERT the hint shows how many days the user is taking ("You have selected to take N day(s) off") and the available days for the leave type
  18. TYPE **Address** with `265 West Avenue`
  19. CLICK the certification checkbox ("I hereby certify that I have acquainted myself of my available leave credits…")
  20. ASSERT the checkbox is checked
  21. CLICK the **Submit** button
  22. ASSERT the system displays the backdated pop-up ("Leave Application Comments" — "You are about to submit a backdated leave application")
  23. TYPE comments in the backdated pop-up
  24. CLICK **OK**
  25. ASSERT the comments are captured and the **Delegate** pop-up is displayed
  26. CLICK the **Don't Delegate** button
- **Expected result:** The system submits the leave application and redirects the user to the My Items index view
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Delegate pop-up closes and the user is on the My Items index view with the new application listed

---

### TC-03 — Submit a future dated leave application (ADO #116872)

*Applicant submits an Annual Leave application whose start date is in the future; no backdated pop-up is shown.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the Workflows menu item
  2. CLICK Workflows in the side menu, then CLICK **My Items**
  3. ASSERT My Items index view is displayed
  4. SNAPSHOT — confirm the **Create New** button
  5. CLICK the **Create New** button
  6. ASSERT the system displays the selectable options in a drop-down list
  7. CLICK **New Leave Application**
  8. ASSERT the system directs the user to the new leave application page
  9. SELECT **Category** — choose `Annual Leaves`
  10. ASSERT leave category is selected
  11. SELECT **Sub-Category** — choose `Annual Leaves`
  12. ASSERT Sub-Category is selected and the **Duration** field is visible
  13. CLICK the **Days** radio on the Duration field
  14. ASSERT Days is selected and the Start Date / End Date fields are visible
  15. TYPE **Start Date** with a date in the future (e.g. `21/10/2026`)
  16. TYPE **End Date** with the same or a later date
  17. ASSERT the hint shows how many days the user is taking and the available days for the leave type
  18. TYPE **Address** with `265 West Avenue`
  19. CLICK the certification checkbox
  20. ASSERT the checkbox is checked
  21. CLICK the **Submit** button
  22. ASSERT the system displays the **Delegate** pop-up (no backdated pop-up)
  23. CLICK the **Don't Delegate** button
- **Expected result:** The system submits the leave application and redirects the user to the My Items index view
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Delegate pop-up closes and the user is on the My Items index view with the new application listed

---

## Teardown
- Each run creates a real leave application for GOV003. Cancel it (or action it through the Recommend / Approve plans) so the dates can be reused.
