# Test Plan: ELEAVE-RECOMMEND — Recommend Leave Application

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-09-30
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | GOV012 / 123qwe (recommender) |
| ADO Plan | [#116862](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=116862&suiteId=116869) — eLeave Regression Tests |
| ADO Suite | #116869 — Recommendation › Recommend |

## Objective
> Validate that a recommender can open a submitted leave application from **Workflows › Inbox**, tick the review acknowledgement (which enables **Recommend**), and recommend the application so it routes to the approver.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Recommender credentials are valid (GOV012 / 123qwe)
- [ ] A leave application submitted by the **Application for Leave › for Myself** plan (`capture-new-leave-application.md`) is In Progress in GOV012's Inbox with Action Required **Recommend Leave**

## Test Cases

### TC-01 — Login as Recommender

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `GOV012`
  4. TYPE Password field with `123qwe`
  5. CLICK the Sign In button
  6. WAIT for the home page to load
- **Expected result:** User is successfully logged into the system
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Workflows menu item is visible

---

### TC-02 — Recommend a leave application (ADO #116919)

*Recommender recommends the leave application submitted in the Application for Leave test case.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the Workflows menu item
  2. CLICK Workflows in the side menu, then CLICK **Inbox**
  3. ASSERT the Incoming Items index view is displayed
  4. SNAPSHOT — confirm the top SaGov Leave Application row with Action Required **Recommend Leave**
  5. CLICK the magnifying glass (search) icon on that row
  6. ASSERT the system opens the item in detail view ("Recommend Leave: …" heading)
  7. ASSERT the **Recommend** button is disabled while the acknowledgement checkbox is unticked
  8. CLICK the acknowledgement checkbox ("I acknowledge that I have reviewed the leave application along with any accompanying supporting documents.")
  9. ASSERT the checkbox is checked and the **Recommend** button is enabled
  10. CLICK the **Recommend** button
- **Expected result:** Leave application is recommended and the user is redirected to the Incoming Items index view
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Successfully Submitted" is shown and the user is back on the Incoming Items (workflows-inbox) view
  - [ ] ASSERT The recommended application no longer appears in the recommender's Inbox

---

## Teardown
- The recommended application moves to the approver (GOV022) and is the input for the **Approve a leave application** plans.
