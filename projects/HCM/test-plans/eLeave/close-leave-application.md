# Test Plan: ELEAVE-CLOSE — Close Leave Application

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-10-07
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | GOV003 / 123qwe (Leave applicant) |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86516) |
| ADO Suite | #86516 — eleave-wf-closeleaveapplication-dialogbox |

## Objective
> Validate the **Close Leave Application** dialog of eLeave — the OK action (closes the application and redirects to Home) and the Cancel action (dismisses the dialog and returns to the New Leave Application page).

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Leave applicant credentials are valid (GOV003 / 123qwe)
- [ ] GOV003 can open **My Items → Create New → New Leave Application** (each TC starts a fresh, unsaved draft — no seeded data needed)
- [ ] The draft page shows a **Close** button that opens the **Close Leave Application** dialog (`SaGov.Leave/sagov-wf-leave-application close dialog`)

## Test Cases

### TC-01 — Login as Leave Applicant (GOV003)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `GOV003`
  4. TYPE Password field with `123qwe`
  5. CLICK the Sign In button
  6. WAIT for the home page / workflow inbox to load
- **Expected result:** User is logged in and the eLeave workflow inbox is reachable
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the authenticated home page is visible

---

### TC-02 — System should close the leave application when 'Ok' button is clicked (ADO #86518)

*When a user clciks on the 'Ok' button, the system should close the leave application and redirect the user to the Home page*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to My Items (`/dynamic/SaGov.Leave/my_items2`)
  2. SNAPSHOT — confirm the Create New button
  3. CLICK the Create New button, then CLICK New Leave Application
  4. ASSERT the New Leave Application draft page is displayed (URL contains `sagov-leave-application-draft`)
  5. SNAPSHOT — confirm the Close button
  6. CLICK the Close button
  7. ASSERT the 'Close Leave Application' dialog is displayed with the message "You are about close the Leave Application, do you wish to proceed?"
  8. SNAPSHOT — confirm the 'OK' button in the dialog
  9. CLICK the 'OK' button
- **Expected result:** The leave application is closed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave application is closed — the 'Close Leave Application' dialog disappears and the user leaves the draft page

---

### TC-03 — System should redirect the user to the Home page when 'Ok' button is clicked (ADO #86519)

*When a user clciks on the 'Ok' button, the system should close the leave application and redirect the user to the Home page*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to My Items (`/dynamic/SaGov.Leave/my_items2`)
  2. SNAPSHOT — confirm the Create New button
  3. CLICK the Create New button, then CLICK New Leave Application
  4. ASSERT the New Leave Application draft page is displayed (URL contains `sagov-leave-application-draft`)
  5. SNAPSHOT — confirm the Close button
  6. CLICK the Close button
  7. ASSERT the 'Close Leave Application' dialog is displayed with the message "You are about close the Leave Application, do you wish to proceed?"
  8. SNAPSHOT — confirm the 'OK' button in the dialog
  9. CLICK the 'OK' button
- **Expected result:** The user is redirected to the Home page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is redirected to the Home page (URL no longer contains `sagov-leave-application-draft`)

---

### TC-04 — Clicking the 'Cancel' button should close the dialog (ADO #86521)

*When a user clicks on the 'Cancel' button, the system should close the dialog and display the 'New Leave Application' page*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to My Items (`/dynamic/SaGov.Leave/my_items2`)
  2. SNAPSHOT — confirm the Create New button
  3. CLICK the Create New button, then CLICK New Leave Application
  4. ASSERT the New Leave Application draft page is displayed (URL contains `sagov-leave-application-draft`)
  5. SNAPSHOT — confirm the Close button
  6. CLICK the Close button
  7. ASSERT the 'Close Leave Application' dialog is displayed with the message "You are about close the Leave Application, do you wish to proceed?"
  8. SNAPSHOT — confirm the 'Cancel' button in the dialog
  9. CLICK the 'Cancel' button
- **Expected result:** The dialog closes
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Close Leave Application' dialog is no longer visible

---

### TC-05 — Clicking the 'Cancel' button should display the 'New Leave Application' page (ADO #86522)

*When a user clicks on the 'Cancel' button, the system should close the dialog and display the 'New Leave Application' page*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to My Items (`/dynamic/SaGov.Leave/my_items2`)
  2. SNAPSHOT — confirm the Create New button
  3. CLICK the Create New button, then CLICK New Leave Application
  4. ASSERT the New Leave Application draft page is displayed (URL contains `sagov-leave-application-draft`)
  5. SNAPSHOT — confirm the Close button
  6. CLICK the Close button
  7. ASSERT the 'Close Leave Application' dialog is displayed with the message "You are about close the Leave Application, do you wish to proceed?"
  8. SNAPSHOT — confirm the 'Cancel' button in the dialog
  9. CLICK the 'Cancel' button
- **Expected result:** The 'New Leave Application' page is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'New Leave Application' draft page is still displayed (URL contains `sagov-leave-application-draft` and the Close button is visible)

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
