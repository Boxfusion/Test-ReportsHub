# Test Plan: SMOKE-HAPPY — Smoke Test Suite — Happy Path

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-05-29
> **Estimated Duration:** 240s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#77591](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/execute?planId=77591&suiteId=77594) |
| ADO Suite | #77594 — SMOKE-HAPPY - Smoke Test Suite - Happy Path |

## Objective
> Validate the end-to-end happy path of the SaGov PMDS Performance Agreement process — from Financial Year initiation through cycle creation, agreement contracting, supervisor review, HRM verification, PERSAL integration, and process closure — with no dispute raised at any stage.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] Financial Year FY2026/27 exists in the system
- [ ] At least one performance cycle is linked to FY2026/27 (e.g. "SL 1-12 Performance Agreement")
- [ ] Contracting stage for the cycle is In Progress

## Test Cases

### TC-01 — Login as Admin

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `admin`
  4. TYPE Password field with `P@ssw0rd`
  5. CLICK the Sign In button
  6. WAIT for dashboard to load
- **Expected result:** User is logged in and sees the admin dashboard with SaGov PMDS menu visible
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and SaGov PMDS menu is visible

---

### TC-02 — Step 1 - Financial Year Starts (ADO #77595)

*System triggers the start of a new financial year.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/dynamic/SaGov.Pmds/sagov-cycle-views
  2. WAIT for Financial Years page to load
  3. SNAPSHOT — confirm Financial Years page heading and FY entry are visible
- **Expected result:** New financial year is initiated in the system
- **Assertions:**
  - [x] ASSERT (BLOCKING) FY2026/27 label is visible on the Financial Years page

---

### TC-03 — Step 2 - Create Cycle and Send Notifications (ADO #77596)

*System/PMDS Coordinator creates a performance cycle; employees receive notification to start contracting.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/dynamic/SaGov.Pmds/sagov-cycle-views
  2. WAIT for Financial Years page to load
  3. SNAPSHOT — confirm at least one cycle link is visible under FY2026/27
- **Expected result:** Performance cycle is created and listed under the active financial year
- **Assertions:**
  - [x] ASSERT (BLOCKING) "SL 1-12 Performance Agreement" cycle link is visible under FY2026/27

---

### TC-04 — Step 3 - Open Performance Agreement Process (ADO #77597)

*Coordinator opens the performance agreement process so it is available to employees.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/dynamic/SaGov.Pmds/sagov-cycle-views
  2. WAIT for Financial Years page to load
  3. SNAPSHOT — confirm cycle links are visible
  4. CLICK the "SL 1-12 Performance Agreement" cycle link
  5. WAIT for cycle details page to load
  6. SNAPSHOT — confirm Manage Process tab with Contracting stage is visible
- **Expected result:** Performance agreement process is opened and the Contracting stage shows "In Progress"
- **Assertions:**
  - [x] ASSERT (BLOCKING) Contracting stage status shows "In Progress"

---

### TC-05 — Step 4 - Draft Performance Agreement (ADO #77598)

*Employee drafts their performance agreement and saves it.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to cycle details for "SL 1-12 Performance Agreement"
  2. WAIT for page to load
  3. SNAPSHOT — confirm Contracting stage statistics panel is visible
- **Expected result:** Performance agreements are in-progress for employees in the contracting stage
- **Assertions:**
  - [x] ASSERT (BLOCKING) Contracting "In progress" stat label is visible (count > 0)

---

### TC-06 — Step 5 - Review Performance Agreement (ADO #77599)

*Supervisor reviews the performance agreement.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to cycle details for "SL 1-12 Performance Agreement"
  2. WAIT for page to load
  3. SNAPSHOT — confirm Contracting stage is still active
- **Expected result:** Contracting stage remains In Progress while supervisor review is active
- **Assertions:**
  - [x] ASSERT (BLOCKING) Contracting stage shows "In Progress" status

---

### TC-07 — Step 6 - No Dispute Raised (ADO #77600)

*Verify no dispute is raised during review; process continues to verification.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to cycle details for "SL 1-12 Performance Agreement"
  2. WAIT for page to load
  3. SNAPSHOT — confirm Contracting section shows Close process button
- **Expected result:** No dispute flag set; "Close process" button is available indicating process can move forward
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close process" button is visible on the Contracting stage

---

### TC-08 — Step 7 - Verify Performance Agreement (ADO #77601)

*HRM verifies the performance agreement.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to cycle details for "SL 1-12 Performance Agreement"
  2. WAIT for page to load
  3. SNAPSHOT — confirm all three PMDS process stages are visible in the Manage Process tab
- **Expected result:** All three PMDS stages (Contracting, Mid Year Assessment, Annual Assessment) are visible
- **Assertions:**
  - [x] ASSERT Contracting stage heading is visible
  - [x] ASSERT Mid Year Assessment stage heading is visible
  - [x] ASSERT (BLOCKING) Annual Assessment stage heading is visible

---

### TC-09 — Step 8 - Interface to PERSAL (ADO #77602)

*System interfaces the approved agreement to the PERSAL system.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/dynamic/SaGov.Pmds/sagov-persal-input-file-import
  2. WAIT for PERSAL Input File Export page to load
  3. SNAPSHOT — confirm page heading and action buttons are visible
- **Expected result:** PERSAL Input File Export page loads with action buttons available
- **Assertions:**
  - [x] ASSERT "Generate and send to FTP" button is visible
  - [x] ASSERT (BLOCKING) page heading "PMDS: PERSAL Input file export" is visible

---

### TC-10 — Step 9 - End Performance Agreement Process (ADO #77603)

*System closes the performance agreement process.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to cycle details for "SL 1-12 Performance Agreement"
  2. WAIT for page to load
  3. SNAPSHOT — confirm Contracting stage shows Close process button
- **Expected result:** "Close process" button is accessible, indicating the process can be ended
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close process" button is visible on the Contracting stage

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
