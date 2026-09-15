# Test Plan: ADMINPORTAL-104252 — Verify Close button on Advertise Job Posting step

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 240s (TC-05 waits ~3 minutes for the reported/observed navigation delay before checking, matching the approach used for the Authoriser's equivalent test, ADMINPORTAL-103649)

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Moshadih / 123qwe (displays as "Moshadi Houvet" — the Job Advertiser role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #104252 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#104252](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104252) — Verify Close button on Advertise Job Posting step |

## Objective
> Validate that a Job Advertiser, opening any Job Posting awaiting their "Advertise Job Posting" action, sees Close and View in PDF buttons (see discrepancy note), and that clicking Close returns them to the Incoming Items (Inbox) page.
>
> **This is the Advertiser-role equivalent of ADMINPORTAL-103649**, which found the Authoriser's page-level Close button to be intermittently unreliable (navigated successfully in only ~1 of 6 attempts, with no clear timing pattern — see `test-reports/bugs/2026-08-04-authoriser-close-button-does-not-navigate.md`). A quick live check here on 2026-08-05 found the same symptom: no navigation even 10s after the click. This spec applies the same rigorous approach (a ~3 minute wait, content-based check for "Incoming Items" rather than a URL check) established for that investigation.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Advertiser credentials are valid (Moshadih / 123qwe)
- [ ] At least one item with Action Required "Advertise Job Posting" exists in the Inbox

## Test Cases

### TC-01 — Login with Advertiser credentials

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #104252 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #104252 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Advertise Job Posting as action required (ADO #104252 step 5)

- **Expected result (actual, corrected):** The Job should open in details view with **Close** and **View in PDF** buttons displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close" and "View in PDF" buttons are visible

---

### TC-05 — Click on Close button at the bottom of the page (ADO #104252 step 6)

- **Steps:**
  1. CLICK the Close button
  2. WAIT up to ~3 minutes for the system to finish navigating before checking (see objective note re: ADMINPORTAL-103649)
- **Expected result:** Job post page should close and user should be directed to Incoming Items
- **Assertions:**
  - [x] ASSERT (BLOCKING) the "Incoming Items" (Inbox) page heading is visible — checked by page content, not URL

---

## Teardown
- No teardown required. This spec is read-only — it never clicks Save/Do Not Authorise/Authorise, so it does not mutate the shared QA workflow state.
