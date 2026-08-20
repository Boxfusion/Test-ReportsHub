# Test Plan: ADMINPORTAL-103733 — Advertise Job posting comments

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Moshadih / 123qwe (displays as "Moshadi Houvet" — the Job **Advertiser** role, a distinct queue from the Job Authoriser (Mphoh) and Job Capturer (kamogelos) used elsewhere in this project) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #103733 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#103733](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/103733) — Advertise Job posting comments |

## Objective
> Validate that a Job Advertiser can add a note via the "Comments" panel on a Job Posting's details view (same Comments-panel behaviour as ADMINPORTAL-103725, but for the Advertiser's Inbox/queue instead of the Authoriser's): typing into the Comments textarea reveals an enabled Save button, and clicking Save persists the comment, displaying it below the Save button along with the advertiser's name, date, and time.
>
> **Discrepancy note:** ADO step 5's expected result text ("Close, View in PDF, Do not Authorise, and Authorise buttons displayed") is copy-pasted from the Authoriser flow's shared steps (e.g. ADMINPORTAL-102865, -103645, -103648) and does not match this page. Confirmed live 2026-08-05: the Advertiser's "Advertise Job Posting" details view only has **Close** and **View in PDF** buttons (plus **Save** in the Comments panel) — there is no Do Not Authorise/Authorise here, since this queue is about scheduling/publishing the advertisement (via an "Advertise" panel with Closing Date / Advertised Later / Internal Communications / DHA Website fields), not approving it. This spec asserts the actual buttons present.
>
> **STATEFUL (additive, non-destructive):** adds a real, permanent comment to whichever job posting is opened — it does not touch the Advertise panel's fields or submit the advertisement.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Advertiser credentials are valid (Moshadih / 123qwe)
- [ ] At least one item with Action Required "Advertise Job Posting" exists in the Inbox

## Test Cases

### TC-01 — Login as Moshadih

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #103733 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #103733 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Advertise Job Posting as action required (ADO #103733 step 5)

- **Expected result (actual, corrected):** The Job should open in details view with **Close** and **View in PDF** buttons displayed (see discrepancy note above re: the ADO text's incorrect Do Not Authorise/Authorise buttons)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close" and "View in PDF" buttons are visible

---

### TC-05 — Navigate to Comments panel and populate comments (ADO #103733 step 6)

- **Steps:**
  1. TYPE a comment into the Comments panel's textarea
- **Expected result:** Comments should be successfully populated in the text area and the Save button should be displayed (enabled) after comments are populated
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Comments textarea contains the typed text
  - [x] ASSERT (BLOCKING) the Save button is enabled (it is disabled while the textarea is empty)

---

### TC-06 — Click on Save button (ADO #103733 step 7)

- **Steps:**
  1. CLICK the Save button
- **Expected result:** The comment should be saved and displayed below the Save button along with the advertiser's name, date, and time
- **Assertions:**
  - [x] ASSERT (BLOCKING) the typed comment text is visible below the Save button
  - [x] ASSERT (BLOCKING) the advertiser's name ("Moshadi Houvet") is visible alongside the comment
  - [x] ASSERT (BLOCKING) a date/time stamp is visible alongside the comment

---

## Teardown
- No teardown required/possible — this adds a real, permanent comment to whichever job posting is opened. This is additive only (no data is overwritten or removed) and does not submit the advertisement.
