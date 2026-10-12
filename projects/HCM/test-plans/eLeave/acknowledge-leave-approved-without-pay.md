# Test Plan: ELEAVE-ACK-WITHOUT-PAY — Acknowledge Leave Approved Without Pay

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-10-08
> **Estimated Duration:** 600s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | admin / P@ssw0rd (seeding also uses GOV003, GOV012, GOV022 — see Setup) |
| ADO Plan | [#116862](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=116862&suiteId=117284) — eLeave Regression Tests |
| ADO Suite | #117284 — Acknowledge leave without Pay |
| Known Issue | [ADO #117784](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/117784) — Submit can hang on "Submitting..." on QA |

## Objective
> Validate that HR (admin) can open a leave application that was **Approved without Pay** from **Workflows › Inbox**, choose how it is submitted to PERSAL (**Interface to PERSAL** with configured transactions, or **Process Manually**), capture HR comments, tick the acknowledgement declaration, and submit the application successfully.
>
> The plan is **self-seeding**: each acknowledgement TC first creates, recommends and approves-without-pay its own leave application, then acts on that exact Ref No. It does not depend on leftover Inbox data or on other plans having been run.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] Seeding credentials are valid: applicant GOV003 / 123qwe, recommender GOV012 / 123qwe, approver GOV022 / 123qwe
- [ ] GOV003 has Annual Leave balance remaining in the current calendar-year cycle (each run uses 2 days)
- [ ] GOV003's leave is routed to GOV012 (recommend) → GOV022 (approve) → admin (acknowledge without pay)

## Setup — Self-seeding (SEED)

`SEED` is a reusable routine, **not** a test case. TC-02 and TC-03 each run it once at the start, so each TC owns exactly one application and the two TCs are independent: a failure in one does not skip or affect the other.

A failure anywhere in SEED fails the TC at the `SEED-*` step. In the report this means **blocked by setup**, not a defect in the acknowledgement flow. Diagnose it with the matching upstream plan (`capture-new-leave-application`, `recommend-leave-application`, `Approve-Leave-Application-without-Pay`).

**SEED-A — Capture (as GOV003)**
1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login and log in as `GOV003` / `123qwe`
2. CLICK Workflows in the side menu, then CLICK **My Items**
3. CLICK **Create New**, then CLICK **New Leave Application**
4. SELECT Category `Annual Leaves` and Sub-Category `Annual Leaves`
5. CLICK the **Days** radio on the Duration field
6. TYPE Start Date and End Date with the same **future** weekday, picked at random between 7 days from today and the end of the current year. If "There are overlaps with existing leave requests" is shown, pick a new date (up to 5 attempts)
7. TYPE Address with `265 West Avenue`
8. CLICK the certification checkbox, then CLICK **Submit**
9. CLICK **Don't Delegate** on the Delegate pop-up
10. ASSERT (BLOCKING) the user is back on the My Items index view
11. EXTRACT the Ref No of the new application from the top **SaGov Leave Application** row on My Items, matching the leave dates entered in step 6. Save it as `SEED_REF`

**SEED-B — Recommend (as GOV012)**
1. Log out, then log in as `GOV012` / `123qwe`
2. CLICK Workflows, then CLICK **Inbox**
3. WAIT for the row containing `SEED_REF` with Action Required **Recommend Leave**. Reload the Inbox until it appears (up to 60s)
4. CLICK the view (magnifier) icon on that row
5. CLICK the acknowledgement checkbox, then CLICK **Recommend**
6. ASSERT (BLOCKING) "Successfully Submitted" is shown

**SEED-C — Approve without Pay (as GOV022)**
1. Log out, then log in as `GOV022` / `123qwe`
2. CLICK Workflows, then CLICK **Inbox**
3. WAIT for the row containing `SEED_REF` with Action Required **Approve Leave**. Reload the Inbox until it appears (up to 60s)
4. CLICK the view (magnifier) icon on that row
5. CLICK the acknowledgement checkbox, then CLICK **Approve without Pay**
6. TYPE the dialog comment with `Seeded for acknowledgement - automated test`, then CLICK **OK**
7. ASSERT (BLOCKING) "Successfully Submitted" is shown

**SEED-D — Hand over to admin**
1. Log out, then log in as `admin` / `P@ssw0rd`

## Test Cases

### TC-01 — Login as Admin

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
  2. SNAPSHOT — confirm the Welcome - SHESHA login page is displayed
  3. TYPE Username field with `admin`
  4. TYPE Password field with `P@ssw0rd`
  5. CLICK the Sign In button
  6. WAIT for the home page to load
- **Expected result:** The user is successfully logged into the system
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Workflows menu item is visible

---

### TC-02 — Acknowledge leave without pay and submit via Interface to PERSAL (ADO #117420)

*Setup: run SEED (A → D). This TC acts only on its own `SEED_REF`.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the Workflows menu item
  2. CLICK Workflows in the side menu, then CLICK **Inbox**
  3. ASSERT the user is redirected to the Incoming Items index view
  4. WAIT for the row containing `SEED_REF` with Action Required **Acknowledge leave without pay**. Reload the Inbox until it appears (up to 60s)
  5. ASSERT (BLOCKING) the `SEED_REF` row is listed with Action Required **Acknowledge leave without pay**
  6. CLICK the view (magnifier) icon on that row
  7. ASSERT the leave application details view is opened and shows Ref No `SEED_REF`
  8. SNAPSHOT — confirm the **Submit to PERSAL** drop-down field
  9. SELECT `Interface to PERSAL` in the **Submit to PERSAL** drop-down
  10. ASSERT the option is selected and the **Configure Transactions** checkbox is displayed
  11. CLICK the **Configure Transactions** checkbox
  12. ASSERT a new table with transactions is displayed
  13. TYPE the **HR Comments** field with `Interfaced to PERSAL - automated test`
  14. ASSERT the comments are captured
  15. CLICK the acknowledgement checkbox "I acknowledge that I have communicated with the applicant, and the leave can be processed."
  16. ASSERT the checkbox is checked
  17. CLICK the **Submit** button
- **Expected result:** The leave application is successfully submitted
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "Successfully Submitted" notification is shown (allow up to 90s; see Known Issue ADO #117784) and `SEED_REF` is no longer listed in the Inbox with Action Required **Acknowledge leave without pay**

---

### TC-03 — Acknowledge leave without pay and submit via Process Manually (ADO #117421)

*Setup: run SEED (A → D). This TC acts only on its own `SEED_REF`.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the Workflows menu item
  2. CLICK Workflows in the side menu, then CLICK **Inbox**
  3. ASSERT the user is redirected to the Incoming Items index view
  4. WAIT for the row containing `SEED_REF` with Action Required **Acknowledge leave without pay**. Reload the Inbox until it appears (up to 60s)
  5. ASSERT (BLOCKING) the `SEED_REF` row is listed with Action Required **Acknowledge leave without pay**
  6. CLICK the view (magnifier) icon on that row
  7. ASSERT the leave application details view is opened and shows Ref No `SEED_REF`
  8. SNAPSHOT — confirm the **Submit to PERSAL** drop-down field
  9. SELECT `Process Manually` in the **Submit to PERSAL** drop-down
  10. ASSERT the option is selected successfully
  11. TYPE the **HR Comments** field with `Processed manually - automated test`
  12. ASSERT the comments are captured
  13. CLICK the acknowledgement checkbox "I acknowledge that I have communicated with the applicant, and the leave can be processed."
  14. ASSERT the checkbox is checked
  15. CLICK the **Submit** button
- **Expected result:** The leave application is successfully submitted
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "Successfully Submitted" notification is shown (allow up to 90s; see Known Issue ADO #117784) and `SEED_REF` is no longer listed in the Inbox with Action Required **Acknowledge leave without pay**

---

## Execution Notes
- **Independent TCs.** TC-02 and TC-03 are not serial. Each seeds its own application, so either can run alone (`--grep "TC-03"`).
- **Timeout.** Each acknowledgement TC includes four logins and three workflow hops. Allow up to 8 minutes per TC.
- **Known issue.** If Submit stays on "Submitting..." past 90s, the TC fails. Attach the run to ADO #117784 rather than logging a new bug.

## Teardown
- Each run leaves two submitted, approved-without-pay Annual Leave applications on GOV003 (one day each, future-dated). Submitted applications are final; cancel them through the Leave Cancellation process if the dates or balance need to be reused.
