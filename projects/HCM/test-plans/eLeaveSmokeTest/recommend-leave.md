# Test Plan: ELEAVE-SMOKE-RECOMMEND — Recommend Leave

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-04
> **Estimated Duration:** 450s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | GOV012 / 123qwe (recommender / supervisor) |
| ADO Plan | [#101528](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=101528&suiteId=101970) |
| ADO Suite | #101970 — Recommend Leave |

## Objective
> Smoke-test the **Recommend Leave** workflow step as the supervisor — log in, open the workflow Inbox, select **the application submitted by `application-for-leave`** (chain), review its detail and balance/taken-days summary, then exercise the Recommend action. Includes negative login, unauthenticated-access, and known console-error checks.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Recommender credentials are valid (GOV012 / 123qwe)
- [ ] The application submitted by `application-for-leave` (recorded ref) is routed to the recommender's Inbox; otherwise the first pending "Recommend Leave" row is used as a fallback
- [ ] The acting user has the role required to recommend a leave application

> **Chain note.** This suite reads the reference number recorded by `application-for-leave` (`.submitted-application.json`) and acts on that exact inbox row. **Verified live:** a *future-dated* leave (the chain's application) routes straight to the approver on Recommend with **no comment dialog**; the 'BackDated Leave' mandatory-comment dialog (TC-07/TC-10) applies only to *backdated* leave, so those cases skip when the recorded application is future-dated. TC-08 actually processes the recommendation and is gated behind `SEED_SUBMIT=1`.

> **Known issues recorded in ADO (verify, do not auto-pass):**
> - TC-13 — `Failed to execute action shesha.common:Show Dialog, error: null` surfaced silently with no user-facing error.
> - TC-08 — after clicking 'Ok' no status change was visible for the processed item; backend processing needs verification.
> - TC-02 — invalid-login failed silently with no visible error message.

## Test Cases

### TC-01 — Login with valid credentials redirects to home (ADO #101972)

*Enter valid username and password (GOV012 / 123qwe), then click 'Sign In'. A user with valid credentials should be authenticated and redirected away from the login page.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `GOV012`
  4. TYPE Password field with `123qwe`
  5. CLICK the Sign In button
  6. WAIT for the home/dashboard page to load
- **Expected result:** User is redirected to the application home/dashboard page.
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the home/dashboard page is visible

---

### TC-02 — Login with invalid credentials shows error and stays on login page (ADO #101973)

*Entering incorrect credentials should show a meaningful error and keep the user on the login page. Observe the page state.*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
  2. TYPE Username field with an invalid user
  3. TYPE Password field with an invalid password
  4. CLICK the Sign In button
  5. SNAPSHOT Observe the page state
- **Expected result:** An error message is shown and the user remains on the login page.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user remains on the login page; an error message should be shown (ADO note: bug observed — login failed silently with no visible error)

---

### TC-03 — Inbox loads with pending leave applications (ADO #101974)

*Navigating to the Inbox should display a table of workflow items assigned to the supervisor. Observe the table contents.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the workflow Inbox
  2. SNAPSHOT Observe the table contents
- **Expected result:** Table displays columns: Ref Number, Initiator, Process Name, Subject, Action, Received On, Overdue Date, Status.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Inbox table is displayed with the expected columns

---

### TC-04 — Selecting the submitted application opens its leave detail (ADO #101975)

*Clicking the submitted application's row (recorded ref, or the first Recommend Leave row as fallback) opens the leave application detail for review. Observe the form content.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: the submitted application's Inbox row
  2. CLICK the submitted application's Inbox row
  3. SNAPSHOT Observe the form content
- **Expected result:** Leave details shown: applicant name (Thabo Musa Victor Mthembu), leave type (Annual Leave), the submitted dates, available days and taken days messages.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave application detail opens showing applicant, leave type and dates

---

### TC-05 — Leave application detail shows leave balance and taken days summary (ADO #101976)

*When reviewing a leave application the supervisor should see the applicant's remaining balance and taken days text. Observe the summary messages on the form.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT Observe the summary messages on the form
- **Expected result:** 'Available days' message and 'Taken days' message are visible.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Both the 'Available days' and 'Taken days' summary messages are visible

---

### TC-06 — 'Recommend' action becomes available after acknowledgement (ADO #101977)

*The Recommend button is disabled until the 'l acknowledge …' checkbox is ticked. This case verifies the enablement non-destructively (it does not click Recommend, which would process the application).*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the 'Recommend' button is visible and disabled
  2. CLICK the 'l acknowledge …' checkbox
  3. SNAPSHOT — confirm the 'Recommend' button is now enabled
- **Expected result:** 'Recommend' button is visible and disabled until acknowledgement, then enabled. (Verified live: clicking it routes a future-dated leave straight to the approver with no dialog; a backdated leave opens the 'BackDated Leave' dialog — see TC-07/TC-08.)
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Recommend' button is disabled before acknowledgement and enabled after

---

### TC-07 — Backdated comment dialog accepts free text input (ADO #101978)

*Backdated-only: the 'BackDated Leave' comment textarea should accept and retain text. **Skipped when the chain application is future-dated** (future-dated Recommend processes directly with no dialog).*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: the comment textarea
  2. TYPE `Testing backdated Leave application` into the textarea
  3. SNAPSHOT Observe field state
- **Expected result:** Text is visible in the textarea, is retained, and no validation errors appear.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The typed comment is visible and retained in the textarea with no validation errors

---

### TC-08 — Recommend processes the submitted application and returns to the Inbox (ADO #101979)

> **SEEDED MUTATION (opt-in).** Processes the recommendation, routing the submitted application to the approver so the chain can continue. Guarded behind `SEED_SUBMIT=1` (skipped on a normal run).

*Acknowledge, click Recommend, and (for a backdated leave) enter the mandatory comment and click 'Ok'. A future-dated leave routes directly with no dialog.*

- **Type:** Happy path
- **Steps:**
  1. Open the submitted application, tick acknowledge, CLICK 'Recommend'
  2. If a 'BackDated Leave' dialog appears, enter a comment and CLICK 'Ok'
  3. SNAPSHOT Observe the page after returning to the Inbox
- **Expected result:** The recommendation is processed; the user returns to the Inbox and the submitted application is no longer listed (it has moved to the approver).
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is returned to the Inbox and the submitted application's ref is no longer listed

---

### TC-10 — Backdated leave enforces mandatory supervisor comment (ADO #101981)

*The leave type config has requireSupervisorCommentsForBackDatedLeave=true. The recommend comment field should be mandatory for backdated applications. **Skipped when the chain application is future-dated.***

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the target element for: the 'Recommend' button
  2. CLICK 'Recommend' without entering a comment
  3. SNAPSHOT Observe the error message
- **Expected result:** Validation blocks submission; the error indicates a comment is required for backdated leave.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Submission is blocked and an error indicates a comment is required for backdated leave

---

### TC-11 — Unauthenticated access to Inbox is blocked (ADO #101982)

*An unauthenticated user should not be able to access the Inbox or perform recommend actions.*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE attempt to open a leave application by direct URL while unauthenticated
  2. SNAPSHOT Observe the response
- **Expected result:** User is redirected to login or shown a 403/401 error.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The unauthenticated request is redirected to login or returns a 401/403

---

### TC-12 — Inbox renders rows for both SaGov and standard Leave Application types (ADO #101983)

*The inbox should correctly render rows for both 'SaGov Leave Application' and plain 'Leave Application' process types.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT Check that rows from both SaGov and standard Leave Application workflows are present
- **Expected result:** Rows for different process types display correctly with no rendering errors.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Rows for both SaGov and standard Leave Application process types render without errors

---

### TC-13 — Show Dialog action failure surfaces a user-facing error (ADO #101984)

*If the dialog fails to open, an appropriate error notification should be shown to the user and the form should not crash.*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT If the dialog fails to open, observe the UI state
- **Expected result:** An appropriate error notification is shown to the user. The form does not crash or freeze.
- **Assertions:**
  - [x] ASSERT (BLOCKING) A user-facing error notification is shown on dialog failure and the form does not crash (ADO note: bug confirmed — 'Failed to execute action shesha.common:Show Dialog, error: null' surfaced silently)

---

### TC-14 — Overdue items in Inbox are visually distinguished (ADO #101985)

*Inbox items with an overdueDate in the past should be visually highlighted or flagged as overdue.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT Identify items where overdueDate is earlier than today (e.g. 2026-04-22, 2026-05-13)
  2. SNAPSHOT Observe the visual treatment of those rows compared to non-overdue items
- **Expected result:** Overdue items show a distinct visual indicator such as a red badge or row highlight.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Overdue items are visually flagged distinctly from non-overdue items

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
- Do not finalise recommendations against live QA data unless explicitly running a seeded mutation pass.
