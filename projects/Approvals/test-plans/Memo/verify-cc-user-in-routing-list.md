# Test Plan: Validate System Can Submit When CC'd User Is Also a Routing Signatory

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-08
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | Ian / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#102664](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102664) — Validate if the system can proceed to submit the submission if the CC'd user is part of the routing/signatories list |

> **Note:** ADO specifies logging in "as initiator". This run uses the credentials supplied for this session (Ian / 123qwe) against the same login page instead.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) rather than toggling directly — clicking the control alone does not change the mode. The correct sequence is: click the control to open the popover, then click the "Latest" option inside it, then assert the control's own badge label changes from "Live" to "Latest".
>
> **Note:** This QA environment can sit on an "Initializing..." splash screen for well over the default 15s action timeout before the login form mounts — the login helper uses a generous timeout to tolerate this rather than treating it as a script failure.
>
> **Note:** ADO's field-population step lists Purpose, Background, Discussion, Financial Implications and Recommendation, but omits **Risks** — which [#102637](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102637) already established is also mandatory on this same Compose step. This plan populates Risks as well so Next genuinely navigates past Compose.
>
> **Note (likely copy-paste error in ADO):** ADO steps 10–12 say to select "Admire" as the routing signatory, but their expected-result text says "**Ian** should be displayed ... Ian should be added to the Memo routing table" — inconsistent with the action just described and with the test's own title (which is specifically about the *same* CC'd person, Admire, also being added as a routing signatory). This plan treats "Admire" as correct throughout, consistent with the CC selection and the test's stated purpose.
>
> **Note:** Reuses the proven flow from [#102653](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102653)/[#102661](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102661) (Live/Latest switch, per-tab population, and the genuine-navigation checks for Compose→Attachments→Routing) up through reaching the Routing step, with the CC signatory explicitly selected as "Admire" rather than an arbitrary first option.

## Objective
> Validate that when the same person is both CC'd on the memo (Compose step) and added as an approver/signatory on the Routing step, the system still allows the memo to be submitted successfully rather than blocking on the overlap.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] User credentials are valid (Ian / 123qwe)
- [ ] The acting user has permission to create a new Referral memo
- [ ] "Admire" (Admire Chindenga) is available for selection as both a CC signatory and a routing approver

## Test Cases

### TC-01 — Validate system can submit when CC'd user is also a routing signatory (ADO #102664)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login and log in with valid credentials
  2. CLICK the "Click to change view mode" control in the header to open the Live/Ready/Latest popover, then CLICK the "Latest" option in that popover
  3. CLICK the sidebar Toggle in the top-left corner
  4. CLICK the Workflows dropdown
  5. CLICK the My Items menu item
  6. CLICK the Create New button
  7. CLICK the New Referrals subtype
  8. POPULATE all mandatory fields, adding "Admire" under the CC field
  9. ACTION the memo through Next (Compose → Attachments) and Next (Attachments → Routing) until the Routing step is displayed
  10. CLICK the Select Signatory dropdown
  11. SELECT "Admire" as a signatory
  12. CLICK the Add button
  13. CLICK the Submit button
- **Expected result:** All mandatory fields are populated and Admire is added as the CC signatory. The Routing step is reached. The signatory dropdown lists Admire, selecting Admire displays it, and clicking Add adds Admire to the routing table. Clicking Submit routes the memo to the Confirmation step without being blocked by Admire being both CC'd and a routing signatory.
- **Assertions:**
  - [x] ASSERT (BLOCKING) User successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Admire is displayed as the CC signatory on the Compose step
  - [x] ASSERT (BLOCKING) The Routing step is reached (Submit button and Select Approver control are visible, Next button is gone)
  - [x] ASSERT (BLOCKING) The signatory dropdown lists Admire and selecting it displays Admire
  - [x] ASSERT (BLOCKING) Clicking Add adds Admire to the routing table
  - [x] ASSERT (BLOCKING) Clicking Submit routes the memo to the Confirmation step

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
