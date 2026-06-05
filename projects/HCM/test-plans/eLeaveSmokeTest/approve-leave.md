# Test Plan: ELEAVE-SMOKE-APPROVE — Approve Leave

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-04
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | GOV022 / 123qwe (approver) |
| ADO Plan | [#101528](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=101528&suiteId=101991) |
| ADO Suite | #101991 — Approve leave |

## Objective
> Smoke-test the **Approve Leave** workflow step as the approver — log in, open the workflow Inbox, select **the application submitted by `application-for-leave` and recommended by `recommend-leave`** (chain), review its detail and balance/taken-days summary, then exercise the 'Approve with Full Pay' action. Includes negative login and known console-error checks.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Approver credentials are valid (GOV022 / 123qwe)
- [ ] The application submitted by `application-for-leave` and recommended by `recommend-leave` (recorded ref) is routed to the approver's Inbox; otherwise the first pending "Approve Leave" row is used as a fallback
- [ ] The acting user has the role required to approve a leave application

> **Chain note.** This suite reads the reference number recorded by `application-for-leave` (`.submitted-application.json`) and acts on that exact inbox row. **Verified live:** a *future-dated* leave (the chain's application) processes on 'Approve with Full Pay' and returns to the Inbox with **no comment dialog**; the action buttons enable once the acknowledge checkbox is ticked (and any attachments are downloaded). TC-08 actually approves the leave and is gated behind `SEED_SUBMIT=1`.

> **Known issues recorded in ADO (verify, do not auto-pass):**
> - TC-02 — invalid-login failed silently with no visible error message.
> - TC-08 — after clicking 'Ok' no status change was visible for the processed item; backend processing needs verification.

## Test Cases

### TC-01 — Login with valid credentials redirects to home (ADO #102021)

*Enter valid username and password (GOV022 / 123qwe), then click 'Sign In'. A user with valid credentials should be authenticated and redirected away from the login page.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `GOV022`
  4. TYPE Password field with `123qwe`
  5. CLICK the Sign In button
  6. WAIT for the home/dashboard page to load
- **Expected result:** User is redirected to the application home/dashboard page.
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the home/dashboard page is visible

---

### TC-02 — Login with invalid credentials shows error and stays on login page (ADO #102022)

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

### TC-03 — Inbox loads with pending leave applications (ADO #102023)

*Navigating to the Inbox should display a table of workflow items assigned to the supervisor. Observe the table contents.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the workflow Inbox
  2. SNAPSHOT Observe the table contents
- **Expected result:** Table displays columns: Ref Number, Initiator, Process Name, Subject, Action, Received On, Overdue Date, Status.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Inbox table is displayed with the expected columns

---

### TC-04 — Selecting the submitted application opens its leave detail (ADO #102024)

*Clicking the submitted application's row (recorded ref, or the first Approve Leave row as fallback) opens the leave application detail for review. Observe the form content.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: the submitted application's Inbox row
  2. CLICK the submitted application's Inbox row
  3. SNAPSHOT Observe the form content
- **Expected result:** Leave details shown: applicant name (Thabo Musa Victor Mthembu), leave type (Annual Leave), the submitted dates, available days and taken days messages.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave application detail opens showing applicant, leave type and dates

---

### TC-05 — Leave application detail shows leave balance and taken days summary (ADO #102025)

*When reviewing a leave application the supervisor should see the applicant's remaining balance and taken days text. Observe the summary messages on the form.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT Observe the summary messages on the form
- **Expected result:** 'Available days' message and 'Taken days' message are visible.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Both the 'Available days' and 'Taken days' summary messages are visible

---

### TC-06 — 'Approve with Full Pay' action becomes available after acknowledgement (ADO #102026)

*The action buttons are disabled until the 'l acknowledge …' checkbox is ticked (and any supporting attachments are downloaded). This case verifies enablement non-destructively (it does not click Approve, which would process the application).*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the 'Approve with Full Pay' button is visible and disabled
  2. CLICK the 'l acknowledge …' checkbox
  3. SNAPSHOT — confirm the button is now enabled (or note it is attachment-gated for this item)
- **Expected result:** The 'Approve with Full Pay' button is visible and becomes enabled after acknowledgement. (Verified live: clicking it processes a future-dated leave with no dialog — see TC-08.)
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Approve with Full Pay' button is disabled before acknowledgement and enabled after (unless attachment-gated)

---

### TC-07 — Backdated comment dialog accepts free text input (ADO #102027)

*Backdated-only: the comment textarea should accept and retain text. **Skipped when the chain application is future-dated** (future-dated Approve processes directly with no dialog), and when the item is attachment-gated.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: the comment textarea
  2. TYPE `Testing backdated Leave application` into the textarea
  3. SNAPSHOT Observe field state
- **Expected result:** Text is visible in the textarea, is retained, and no validation errors appear.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The typed comment is visible and retained in the textarea with no validation errors

---

### TC-08 — Approve with Full Pay processes the submitted application and returns to the Inbox (ADO #102028)

> **SEEDED MUTATION (opt-in).** Approves the leave with full pay — the final step of the chain. Guarded behind `SEED_SUBMIT=1` (skipped on a normal run).

*Acknowledge, click 'Approve with Full Pay', and (for a backdated leave) enter the mandatory comment and click 'Ok'. A future-dated leave processes directly with no dialog.*

- **Type:** Happy path
- **Steps:**
  1. Open the submitted application, tick acknowledge, CLICK 'Approve with Full Pay'
  2. If a comment dialog appears, enter a comment and CLICK 'Ok'
  3. SNAPSHOT Observe the page after returning to the Inbox
- **Expected result:** The approval is processed; the user returns to the Inbox and the submitted application is no longer listed.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is returned to the Inbox and the submitted application's ref is no longer listed

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
- Do not finalise approvals against live QA data unless explicitly running a seeded mutation pass.
