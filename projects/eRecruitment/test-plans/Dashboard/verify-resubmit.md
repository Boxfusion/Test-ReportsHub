# Test Plan: DASHBOARD-106394 — Verify Resubmit

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-30
> **Estimated Duration:** 2-3 min

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=106380) |
| ADO Suite | #106380 — Dashboard |
| ADO Test Case | [#106394](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106394) — Verify Resubmit |

## Objective
> Validate the "My Applications" resubmit flow — clicking Resubmit on a withdrawn application, re-uploading Z83 and CV, checking both consent checkboxes, and submitting the application again.

## ⚠️ Stateful test — target directly, self-adapt if needed
- **This test targets the specific application ADO assumes is ready ("Timer30Jul", withdrawn during test case #106381) directly**, and self-adapts: if it's currently in a submitted state (someone/something resubmitted it since), it withdraws it immediately beforehand, then proceeds straight into Resubmit.
- **Why this approach, and not scanning/creating fresh data:** confirmed live 2026-07-30 across many attempts — the shared QA "Fred" account has 19+ applications in unpredictable states due to concurrent modification by other testers/processes; a full scan for *any* eligible row, or applying fresh via the Jobs tab, each repeatedly lost the race against that concurrent activity (the same application was observed flipping between submitted and withdrawn within minutes, unprompted). Targeting the known application directly and minimizing the gap between checking its status and acting on it is what made this reliable — confirmed with a full clean pass in ~20 seconds.
- This exercises the exact same ADO steps 6-15 (Resubmit dialog, Z83/CV upload, checkboxes, Submit).

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] At least one job posting exists in the unfiltered Jobs listing

## Test Cases

### TC-01 — Login as Fred

- **Steps:**
  1. NAVIGATE to https://pd-recruitment-publicportal-1-qa.shesha.app/login
  2. TYPE Username field with `Fred`
  3. TYPE Password field with `Metaganemr%03`
  4. CLICK the Sign In button
  5. WAIT for the Dashboard to load
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Dashboard is visible

---

### TC-02 — Click on Dashboard menu item (ADO #106394 step 3)

- **Steps:**
  1. CLICK the Dashboard menu item
- **Assertions:**
  - [x] ASSERT (BLOCKING) Dashboard page is displayed

---

### TC-03 — Click on My Applications (ADO #106394 step 4)

- **Steps:**
  1. CLICK "My Applications"
- **Assertions:**
  - [x] ASSERT (BLOCKING) Applications table is visible

---

### TC-04 — Open the Timer30Jul application, withdrawing it first if needed (ADO #106394 step 5)

*This plan searches "My Applications" for "Timer30Jul" directly (the application withdrawn in test case #106381) and opens it. If it's currently in a submitted state (its status can drift due to concurrent account activity — see the .md's stateful-test note above), it withdraws it immediately beforehand so the flow can proceed.*

- **Steps:**
  1. Search "My Applications" for "Timer30Jul" and CLICK the magnifying-glass icon to open it
  2. If the Withdraw Application button is visible (i.e. currently submitted), withdraw it first (comment + Withdraw Application)
- **Expected result:** Application details view is shown with a Resubmit button at the bottom right
- **Assertions:**
  - [x] ASSERT (BLOCKING) Application details view is displayed
  - [x] ASSERT (BLOCKING) Resubmit button is visible

---

### TC-05 — Click Resubmit button (ADO #106394 step 6)

- **Steps:**
  1. CLICK the Resubmit button
- **Expected result:** Apply for a job dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Apply for a job dialog is visible

---

### TC-06 — Upload Z83 file (ADO #106394 steps 7-9)

*Note on observed behaviour vs. ADO wording: confirmed live 2026-07-30 — Z83's rendering in the Resubmit dialog depends on whether it already has a file from the application's original submission:*
- *Never filled in before (e.g. AuditTrail, TestingTimer, ICT40): renders a disabled, hidden placeholder (`ant-upload-select ant-upload-disabled`, `display:none`) — cannot be interacted with.*
- *Already has a file (e.g. CheckingSumm, filled in during test case #106368): renders the normal "already uploaded" state with Replace/Remove icons — clicking Replace re-uploads it.*
- *Empty and enabled (never touched before, no disabled flag): the normal dropzone accepts a direct upload.*

*This plan adapts to whichever state is actually present rather than assuming one fixed behavior.*

- **Steps:**
  1. CLICK the Z83 field to upload (or Replace, if a file is already attached)
  2. SELECT `blank document.pdf` (if the field is not disabled)
- **Expected result:** Z83 ends in a coherent state — either genuinely disabled, or showing `blank document.pdf` attached
- **Assertions:**
  - [x] ASSERT (BLOCKING) If disabled, the file input is disabled; otherwise `blank document.pdf` is shown attached

---

### TC-07 — Upload CV file (ADO #106394 steps 10-12)

- **Steps:**
  1. CLICK the CV field to upload
  2. SELECT `blank document.pdf`
- **Expected result:** File explorer closes and the selected file renders under the CV UI
- **Assertions:**
  - [x] ASSERT (BLOCKING) `blank document.pdf` is shown under the CV attachment UI

---

### TC-08 — Check both consent checkboxes (ADO #106394 steps 13-14)

- **Steps:**
  1. CHECK the "I confirm that all the information..." checkbox
  2. CHECK the "I hereby authorise the Department of Home Affairs..." checkbox
- **Expected result:** Both checkboxes are checked; Submit Application button becomes enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Both checkboxes are checked
  - [x] ASSERT (BLOCKING) Submit Application button is enabled

---

### TC-09 — Click Submit Application button (ADO #106394 step 15)

*Note: confirmed live 2026-07-30 — unlike a fresh Apply (test case #106368, which stays on the job's own details page showing "Continue Application"), a **Resubmit** navigates straight back to the Jobs listing page after submitting, matching ADO's literal expected result exactly.*

- **Steps:**
  1. CLICK the Submit Application button
- **Expected result:** Application resubmitted successfully; the system navigates to the Jobs listing page; the applied-for job post no longer appears in the listing
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system navigates to the Jobs listing page (URL contains `public-jobs`)
  - [x] ASSERT (BLOCKING) The applied-for job post is no longer present in the Jobs listing

---

## Teardown
- No teardown — this test intentionally resubmits one previously-withdrawn application per run (see warning above).
