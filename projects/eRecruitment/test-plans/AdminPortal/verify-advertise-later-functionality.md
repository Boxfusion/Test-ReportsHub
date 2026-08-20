# Test Plan: ADMINPORTAL-104255 — Verify Advertise later functionality

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Moshadih / 123qwe (displays as "Moshadi Houvet" — the Job Advertiser role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #104255 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. Parent work item: #106702. |
| ADO Test Case | [#104255](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104255) — Verify Advertise later functionality |

## Objective
> Validate the full "Advertise" panel flow on a Job Posting's Advertise-stage details view: checking "Advertised Later" reveals a required Publication Date picker; picking a future date, checking "Internal Communications" (revealing a required Email Address field), populating that email, and checking "DHA Website" together enable the **Advertise** button; clicking it publishes the job posting for real.
>
> **⚠️ STATEFUL/DESTRUCTIVE, confirmed with requester before running:** TC-10 clicks Advertise for real, publishing whichever job posting is opened and consuming it from the shared QA Inbox. Only TC-10 performs the real submission — TC-05 through TC-09 fill in the Advertise panel's fields without ever clicking Advertise, so they are safe to repeat.
>
> **Discrepancy notes:**
> - ADO step 5's expected result text ("Close, View in PDF, Do not Authorise, and Authorise buttons displayed") is copy-pasted from the Authoriser flow and does not match this page, which only has **Close** and **View in PDF** (plus **Advertise**, once it appears — see next point).
> - ADO steps 7 and 8 each claim the **Advertise** button becomes enabled at that point (after just picking the Publication Date, and again after checking Internal Communications). Confirmed live 2026-08-05: this is not accurate — the Advertise button does not appear in the DOM at all until **all** of Publication Date, Email Address, and the DHA Website checkbox are complete (i.e. not until step 10). This spec only asserts the button's presence/enabled state at that point, not after steps 7/8.
> - ADO step 11's implied navigation (back to Inbox/"Incoming Items") does not match reality. Confirmed live 2026-08-05: clicking **Advertise** navigates to the **"My Items"** screen (`Shesha.Workflow/workflows-my-items`), not back to the Inbox. TC-10 asserts on the "My Items" heading, not "Incoming Items".

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Advertiser credentials are valid (Moshadih / 123qwe)
- [ ] At least one item with Action Required "Advertise Job Posting" exists in the Inbox

## Test Cases

### TC-01 — Login with Advertiser credentials

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #104255 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #104255 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Advertise Job Posting as action required (ADO #104255 step 5)

- **Expected result (actual, corrected):** The Job should open in details view with **Close** and **View in PDF** buttons displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close" and "View in PDF" buttons are visible

---

### TC-05 — Check the Advertised Later checkbox (ADO #104255 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) checkbox is checked and a required "Publication Date" field appears

---

### TC-06 — Select any future date from the date picker (ADO #104255 step 7)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Publication Date field shows the picked date

---

### TC-07 — Check the Internal Communications checkbox (ADO #104255 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) checkbox is checked and a required "Email Address" field appears

---

### TC-08 — Populate a valid email address (ADO #104255 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Email Address field contains the typed value

---

### TC-09 — Check the DHA Website checkbox (ADO #104255 step 10)

- **Assertions:**
  - [x] ASSERT (BLOCKING) checkbox is checked and the "Advertise" button is now visible and enabled

---

### TC-10 — Click on Advertise button (ADO #104255 step 11) — ⚠️ REAL PUBLISH

- **Expected result (actual, corrected):** The job post is published based on the selected Publication Date, and the system navigates to the "My Items" screen (not back to the Inbox)
- **Assertions:**
  - [x] ASSERT (BLOCKING) a success notification appears (best-effort — toast is transient)
  - [x] ASSERT (BLOCKING) the system navigates away from the Advertise Job Posting details view, landing on "My Items"

---

## Teardown
- No teardown required/possible — TC-10 performs a real, intentional publish of one job posting from the shared QA Inbox (confirmed with the requester before running). This is not reversible via the UI.
