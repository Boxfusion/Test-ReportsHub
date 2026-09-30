# Test Plan: ELEAVE-NOT-RECOMMEND — Not Recommend Leave Application

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-09-30
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | GOV012 / 123qwe (recommender) — see note |
| ADO Plan | [#116862](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=116862&suiteId=116870) — eLeave Regression Tests |
| ADO Suite | #116870 — Recommendation › Not Recommended |

> **Note:** ADO #116922 step 1 logs in as `GOV003`, but GOV003 is the applicant and has no Recommend Leave items. This plan uses the recommender `GOV012`, as in the Recommend suite. Update the ADO test case if GOV003 is not intended.

## Objective
> Validate that a recommender can open a submitted leave application, tick the review acknowledgement, choose **Not Recommend**, capture the mandatory comments in the **Not Recommend** dialog and submit, returning to the Incoming Items view.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Recommender credentials are valid (GOV012 / 123qwe)
- [ ] A leave application submitted by the **Application for Leave › for Myself** plan is In Progress in GOV012's Inbox with Action Required **Recommend Leave**

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
- **Expected result:** The user is successfully logged in
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Workflows menu item is visible

---

### TC-02 — Not Recommending a leave application (ADO #116922)

*Recommender does not recommend the leave application submitted in the Application for Leave test case.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the Workflows menu item
  2. CLICK Workflows in the side menu, then CLICK **Inbox**
  3. SNAPSHOT — confirm the top SaGov Leave Application row with Action Required **Recommend Leave**
  4. CLICK the magnifying glass (search) icon on that row
  5. ASSERT the leave application is opened in detail view ("Recommend Leave: …" heading)
  6. CLICK the acknowledgement checkbox ("I acknowledge that I have reviewed the leave application along with any accompanying supporting documents.")
  7. ASSERT the checkbox is checked
  8. CLICK the **Not Recommend** button
  9. ASSERT the system displays the **Not Recommend** comments pop-up with **Ok** disabled
  10. TYPE comments in the pop-up with `Testing not recommended`
  11. CLICK **Ok**
- **Expected result:** The leave application is actioned and the system redirects the user to the Incoming Items index view
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Successfully Submitted" is shown and the user is back on the Incoming Items (workflows-inbox) view

---

## Teardown
- The not-recommended application is returned to the applicant (status "Not Recommended"); no further clean-up is required.
