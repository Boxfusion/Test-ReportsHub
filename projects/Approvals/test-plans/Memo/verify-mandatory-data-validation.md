# Test Plan: Verify User Cannot Proceed Without Mandatory Data

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-07
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | Ian / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#102637](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102637) — Verify user cannot proceed without mandatory data |

> **Note:** ADO specifies logging in "as Initiator (Craig)". This run uses the credentials supplied for this session (Ian / 123qwe) against the same login page instead.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) rather than toggling directly — clicking the control alone does not change the mode. An earlier version of this spec asserted on the popover's "Latest" option label being visible, which is a false positive (it's shown regardless of which mode is active). The fix clicks the "Latest" option itself and asserts the control's own label changes from "Live" to "Latest".
>
> **Note:** Live run shows the actual mandatory fields on the New Referrals Compose step are **Subject, Recommendation, Financial Implications, Risks, Background, Discussion** (per the app's own validation banner). This differs from ADO's expected-result text: 'Purpose' is listed there but is *not* actually mandatory (no red asterisk, no validation message), while 'Risks' and 'Discussion' *are* mandatory but aren't mentioned in ADO. Assertions below reflect the observed behavior — worth a correction in ADO.

## Objective
> Validate that when creating a new Referral memo, the system prevents the user from proceeding past the first step of the Draft Memo wizard until all mandatory fields (Subject, Recommendation, Background, Purpose, Financial Implications) are populated.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] User credentials are valid (Ian / 123qwe)
- [ ] The acting user has permission to create a new Referral memo

## Test Cases

### TC-01 — Verify user cannot proceed without mandatory data (ADO #102637)

- **Type:** Negative
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login and log in with valid credentials
  2. CLICK the "Click to change view mode" control in the header to open the Live/Ready/Latest popover, then CLICK the "Latest" option in that popover
  3. CLICK the sidebar Toggle in the top-left corner
  4. SNAPSHOT — confirm side menu items are displayed
  5. CLICK the Workflows dropdown
  6. SNAPSHOT — confirm Inbox, My Items, Sent Items and Drafts menu items are displayed
  7. CLICK the My Items menu item
  8. SNAPSHOT — confirm the My Items index table is displayed with Create New and Export buttons
  9. CLICK the Create New button
  10. SNAPSHOT — confirm memo types are displayed
  11. CLICK the New Referrals subtype
  12. SNAPSHOT — confirm the Draft Memo page is displayed
  13. CLICK the Next button without populating any fields
- **Expected result:** A validation summary banner ("Please correct the following and submit again:") is displayed listing 'Subject', 'Recommendation', 'Financial Implications', 'Risks', 'Background' and 'Discussion' as mandatory. The wizard does not proceed past the Compose step.
- **Assertions:**
  - [x] ASSERT (BLOCKING) User successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after clicking the view-mode control
  - [x] ASSERT Side menu items are displayed after clicking the Toggle
  - [x] ASSERT (BLOCKING) Inbox, My Items, Sent Items and Drafts menu items are displayed under Workflows
  - [x] ASSERT (BLOCKING) My Items index table is displayed with Create New and Export buttons
  - [x] ASSERT (BLOCKING) Memo types are displayed after clicking Create New
  - [x] ASSERT (BLOCKING) Draft Memo page is displayed after selecting New Referrals
  - [x] ASSERT (BLOCKING) Validation banner lists Subject, Recommendation, Financial Implications, Risks, Background and Discussion as mandatory after clicking Next with no data populated
  - [x] ASSERT (BLOCKING) The wizard remains on the Compose step (does not proceed to Attachments)

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
