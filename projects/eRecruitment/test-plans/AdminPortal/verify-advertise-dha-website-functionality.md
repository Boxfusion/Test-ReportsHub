# Test Plan: ADMINPORTAL-104258 — Verify Advertise DHA Website functionality

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #104258 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#104258](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104258) — Verify Advertise DHA Website functionality |
| Target Job | Ref No "CheckingSendBack" preferred, falling back to the first available "Advertise Job Posting" row |

## Objective
> Validate that checking "DHA Website" on a Job Posting's Advertise-stage details view — with no other checkboxes checked — is sufficient on its own to enable the **Advertise** button, and that clicking Advertise publishes the job post to the public portal and redirects to "My Items".
>
> **⚠️ STATEFUL/DESTRUCTIVE — requires confirmation before running:** TC-06 clicks Advertise for real, publishing the targeted job posting and consuming it from the shared QA Inbox. TC-01 through TC-05 only check the DHA Website checkbox without ever clicking Advertise, so they are safe to repeat.
>
> **Confirmed live 2026-08-05 (no discrepancy this time):** checking DHA Website alone — without Advertised Later or Internal Communications — does enable the Advertise button directly, matching ADO step 6's expected result exactly.
>
> **Discrepancy note (consistent with other Advertiser test cases in this project):** ADO step 5's expected result text ("Close, View in PDF, Do not Authorise, and Authorise buttons displayed") is copy-pasted from the Authoriser flow and does not match this page, which only has **Close** and **View in PDF** (plus **Advertise**, once enabled).

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Advertiser credentials are valid (Moshadih / 123qwe)
- [ ] At least one item with Action Required "Advertise Job Posting" exists in the Inbox

## Test Cases

### TC-01 — Login with Advertiser credentials

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #104258 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #104258 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Advertise Job Posting as action required (ADO #104258 step 5)

- **Expected result (actual, corrected):** The Job should open in details view with **Close** and **View in PDF** buttons displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close" and "View in PDF" buttons are visible

---

### TC-05 — Check the DHA Website checkbox (ADO #104258 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) checkbox is checked and the "Advertise" button is now visible and enabled

---

### TC-06 — Click on the Advertise button (ADO #104258 step 7) — ⚠️ REAL PUBLISH

- **Expected result:** The system should display a success message and the job post should be successfully published to the public portal, redirecting to "My Items"
- **Assertions:**
  - [x] ASSERT (BLOCKING) a success notification appears (best-effort — toast is transient)
  - [x] ASSERT (BLOCKING) the system navigates away from the Advertise Job Posting details view, landing on "My Items"

---

## Teardown
- No teardown required/possible — TC-06 performs a real, intentional publish of the targeted job posting from the shared QA Inbox. This is not reversible via the UI.
