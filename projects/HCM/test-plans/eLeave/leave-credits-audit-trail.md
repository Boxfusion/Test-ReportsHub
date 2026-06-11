# Test Plan: ELEAVE-CREDITS-AUDIT — Leave Credits Audit Trail

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 45s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86647) |
| ADO Suite | #86647 — eleave-wf-leavebalancesadmimistration-viewaudit-details |

## Objective
> Validate the **Leave Credits Audit Trail** view of eLeave — the Export action that downloads the audit into an Excel sheet.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave credits audit entry exists on the Leave Credits Audit Trail
- [ ] The acting user has the role required to view the Leave Credits Audit Trail

## Test Cases

### TC-01 — Login as Admin

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `admin`
  4. TYPE Password field with `P@ssw0rd`
  5. CLICK the Sign In button
  6. WAIT for the home page / workflow inbox to load
- **Expected result:** User is logged in and the eLeave workflow inbox is reachable
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the authenticated home page is visible

---

### TC-02 — Export button downloads audit into an Excel sheet (ADO #86649)

*When a user clicks on the 'Export' button, the system should download the audit into an Excel sheet*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalancesadmimistration-viewaudit-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Export' button
  3. CLICK Click on the 'Export' button
- **Expected result:** The system downloads the audit into an Excel sheet
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system downloads the audit into an Excel sheet

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
