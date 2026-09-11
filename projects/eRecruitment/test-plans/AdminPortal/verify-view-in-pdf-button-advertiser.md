# Test Plan: ADMINPORTAL-104254 — Verify View in PDF button

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Moshadih / 123qwe (displays as "Moshadi Houvet" — the Job Advertiser role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #104254 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#104254](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104254) — Verify View in PDF button |

## Objective
> Validate that clicking the **View in PDF** button on a Job Posting's Advertise-stage details view triggers a real PDF download containing the job post's details.
>
> **Discrepancy note (same as the other Advertiser test cases in this project):** ADO step 5's expected result text ("Close, View in PDF, Do not Authorise, and Authorise buttons displayed") is copy-pasted from the Authoriser flow and does not match this page, which only has **Close** and **View in PDF**.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Advertiser credentials are valid (Moshadih / 123qwe)
- [ ] At least one item with Action Required "Advertise Job Posting" exists in the Inbox

## Test Cases

### TC-01 — Login with Advertiser credentials

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #104254 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #104254 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Advertise Job Posting as action required (ADO #104254 step 5)

- **Expected result (actual, corrected):** The Job should open in details view with **Close** and **View in PDF** buttons displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close" and "View in PDF" buttons are visible

---

### TC-05 — Click on View in PDF button at the bottom of the page (ADO #104254 step 6)

- **Steps:**
  1. CLICK the View in PDF button
- **Expected result:** System should automatically download the job post in PDF format, displaying all necessary job post details
- **Assertions:**
  - [x] ASSERT (BLOCKING) a download event fires with a `.pdf` filename
  - [x] ASSERT (BLOCKING) the downloaded file is a non-trivial size (i.e. not an empty/broken file)

---

## Teardown
- No teardown required. This spec is read-only with respect to application state — it only downloads a PDF (saved to a temp path and not otherwise persisted), never clicking Save/Do Not Authorise/Authorise.
