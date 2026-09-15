# Test Plan: Verify Next Button Navigation (Attachments → Routing)

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-08
> **Estimated Duration:** 80s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | Ian / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#102661](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102661) — Verify next button navigation |

> **Note:** ADO specifies logging in "as Initiator (Craig)". This run uses the credentials supplied for this session (Ian / 123qwe) against the same login page instead.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) rather than toggling directly — clicking the control alone does not change the mode. The correct sequence is: click the control to open the popover, then click the "Latest" option inside it, then assert the control's own badge label changes from "Live" to "Latest".
>
> **Note:** This QA environment can sit on an "Initializing..." splash screen for well over the default 15s action timeout before the login form mounts — the login helper uses a generous timeout to tolerate this rather than treating it as a script failure.
>
> **Note:** ADO's field-population step lists Purpose, Background, Discussion, Financial Implications and Recommendation, but omits **Risks** — which [#102637](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102637) already established is also mandatory on this same Compose step. This plan populates Risks as well so Next genuinely navigates to Attachments.
>
> **Note:** ADO's steps do not include attaching a supporting document before clicking Next from the Attachments step, implying attachments are not mandatory to proceed to Routing. This plan follows ADO literally (no attachment) to specifically verify that.
>
> **Note:** This test is #102661, distinct from #102653 (also titled "Verify Next button navigation" in ADO, but for the Compose→Attachments transition). This one covers the Attachments→Routing transition specifically. Reuses the proven flow from [#102653](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102653) up through reaching the Attachments step.

## Objective
> Validate that clicking Next on the Attachments step (with no attachment required) navigates the wizard to the Routing step.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] User credentials are valid (Ian / 123qwe)
- [ ] The acting user has permission to create a new Referral memo

## Test Cases

### TC-01 — Verify next button navigation (ADO #102661)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login and log in with valid credentials
  2. CLICK the "Click to change view mode" control in the header to open the Live/Ready/Latest popover, then CLICK the "Latest" option in that popover
  3. CLICK the sidebar Toggle in the top-left corner
  4. CLICK the Workflows dropdown
  5. CLICK the My Items menu item
  6. CLICK the Create New button
  7. CLICK the New Referrals subtype
  8. CLICK the CC field and SELECT a signatory
  9. CLICK the Subject field and populate it with test input
  10. CLICK each of the Purpose, Background, Discussion, Financial Implications, Risks and Recommendation tabs individually and populate each with test input
  11. CLICK the Next button (Compose → Attachments)
  12. CLICK the Next button again (Attachments → Routing)
- **Expected result:** Clicking Next on the Attachments step navigates the wizard to the Routing step.
- **Assertions:**
  - [x] ASSERT (BLOCKING) User successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Clicking Next navigates the wizard from Compose to the Attachments step
  - [x] ASSERT (BLOCKING) Clicking Next again navigates the wizard from Attachments to the Routing step

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
