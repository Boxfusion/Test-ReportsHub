# Test Plan: ADMINPORTAL-104257 — Verify Internal communications functionality

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 75s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Moshadih / 123qwe (displays as "Moshadi Houvet" — the Job Advertiser role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #104257 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#104257](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104257) — Verify Internal communications functionality |
| Target Job | Ref No **41** (Name: "Auto Job Posting 1") — user-specified for this run (run 1 used Ref No 40) |

## Objective
> Validate that checking "Internal Communications" on a Job Posting's Advertise-stage details view reveals a required Email Address field; that a valid email can be populated, enabling the **Advertise** button; and that clicking Advertise publishes the job and sends a job-posting notification to the provided email address.
>
> **⚠️ STATEFUL/DESTRUCTIVE — requires confirmation before running:** TC-07 clicks Advertise for real, publishing job posting Ref No 41 and consuming it from the shared QA Inbox. TC-01 through TC-06 fill in the panel's fields without ever clicking Advertise, so they are safe to repeat.
>
> **Discrepancy notes (consistent with other Advertiser test cases in this project):**
> - ADO step 5's expected result text ("Close, View in PDF, Do not Authorise, and Authorise buttons displayed") is copy-pasted from the Authoriser flow and does not match this page, which only has **Close** and **View in PDF** (plus **Advertise**, once enabled).
> - Confirmed live for #104255 (same Advertise panel): clicking **Advertise** navigates to the **"My Items"** screen, not back to the Inbox — this spec asserts on that same destination.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Advertiser credentials are valid (Moshadih / 123qwe)
- [ ] Job posting with Ref No "41" exists in the Inbox with Advertise Job Posting as action required

## Test Cases

### TC-01 — Login with Advertiser credentials

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #104257 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #104257 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open Job Ref No 41 with Advertise Job Posting as action required (ADO #104257 step 5)

- **Expected result (actual, corrected):** The Job should open in details view with **Close** and **View in PDF** buttons displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close" and "View in PDF" buttons are visible

---

### TC-05 — Check the Internal Communications checkbox (ADO #104257 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) checkbox is checked and a required "Email Address" field appears

---

### TC-06 — Populate a valid email address (ADO #104257 step 7)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Email Address field contains the typed value
  - [x] ASSERT (BLOCKING) "Advertise" button is visible and enabled

---

### TC-07 — Click on Advertise button (ADO #104257 step 8) — ⚠️ REAL PUBLISH

- **Expected result:** System should auto refresh and send a job posting notification to the provided email address
- **Assertions:**
  - [x] ASSERT (BLOCKING) the system navigates away from the Advertise Job Posting details view, landing on "My Items"

---

## Teardown
- No teardown required/possible — TC-07 performs a real, intentional publish of job posting Ref No 41 from the shared QA Inbox. This is not reversible via the UI.
