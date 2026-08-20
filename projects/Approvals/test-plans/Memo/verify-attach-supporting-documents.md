# Test Plan: Verify User Can Attach Supporting Documents

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-07
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | Ian / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#102655](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102655) — Verify user can attach supporting documents |

> **Note:** ADO specifies logging in "as Initiator (Craig)". This run uses the credentials supplied for this session (Ian / 123qwe) against the same login page instead.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) rather than toggling directly — clicking the control alone does not change the mode. The correct sequence is: click the control to open the popover, then click the "Latest" option inside it, then assert the control's own badge label changes from "Live" to "Latest".
>
> **Note:** This QA environment can sit on an "Initializing..." splash screen for well over the default 15s action timeout before the login form mounts — the login helper uses a generous timeout to tolerate this rather than treating it as a script failure.
>
> **Note:** ADO's field-population step lists Purpose, Background, Discussion, Financial Implications and Recommendation, but omits **Risks** — which [#102637](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102637) already established is also mandatory on this same Compose step. This plan populates Risks as well so Next genuinely navigates to Attachments.
>
> **Note:** ADO's step 15 describes picking a file via a native OS file-browser dialog. Native OS dialogs cannot be driven by Playwright (or any browser automation) — the standard and equivalent approach is to set the file directly on the underlying `<input type="file">` element via `setInputFiles()`, which triggers the same application-level file-selection behavior without needing to interact with the OS dialog. This plan follows the same convention already used in `projects/ITS/test-plans/BAS/register-and-upload-invoice.md`.
>
> **Note:** Reuses the proven Compose-step flow from [#102653](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102653) (Live/Latest switch, CC signatory selection via keyboard, per-tab population with retry, and the corrected "Back button appears" check for Next navigation) up through reaching the Attachments step.
>
> **Note:** There is no "Attach Supporting Documents" text label on the Attachments step — the square icon dropzone (an Ant Design Upload component) is the attach control, and its `<input type="file">` doesn't need a preceding click. After upload, the file name genuinely appears twice: an `.ant-upload-list-item-name` download link (only revealed on hover over the file row, so it isn't visible by default) and a size-annotated label (e.g. "supporting-document.pdf (41 B)") that's visible unconditionally — the spec asserts on the latter.
>
> **Note:** This is the longest flow scripted so far in this suite — a confirmed passing run took as long as 182s. The spec sets this test's timeout to 300s for real margin rather than the 180s used on #102653 (which itself sits close to a good chunk of that on a slow day).

## Objective
> Validate that on the Attachments step of the New Referrals Draft Memo wizard, the user can attach a supporting document and see it reflected in the attachments UI.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] User credentials are valid (Ian / 123qwe)
- [ ] The acting user has permission to create a new Referral memo
- [ ] At least one signatory is available for selection in the CC field

## Test Cases

### TC-01 — Verify user can attach supporting documents (ADO #102655)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login and log in with valid credentials
  2. CLICK the "Click to change view mode" control in the header to open the Live/Ready/Latest popover, then CLICK the "Latest" option in that popover
  3. CLICK the sidebar Toggle in the top-left corner
  4. CLICK the Workflows dropdown
  5. CLICK the My Items menu item
  6. CLICK the Create New button
  7. CLICK the New Referrals subtype
  8. SNAPSHOT — confirm the Draft Memo page is displayed
  9. CLICK the CC field and SELECT a signatory
  10. CLICK the Subject field and populate it with test input
  11. CLICK each of the Purpose, Background, Discussion, Financial Implications, Risks and Recommendation tabs individually and populate each with test input
  12. CLICK the Next button
  13. SNAPSHOT — confirm the Attachments step is displayed
  14. CLICK the "Attach Supporting Documents" option
  15. SELECT a file and attach it
- **Expected result:** The Attachments step is displayed after clicking Next; attaching a supporting document via the file input results in the selected document being displayed in the attachments UI.
- **Assertions:**
  - [x] ASSERT (BLOCKING) User successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Draft Memo page is displayed after selecting New Referrals
  - [x] ASSERT (BLOCKING) The selected signatory is displayed in the CC field
  - [x] ASSERT (BLOCKING) Each of the six content tabs individually accepts and retains its own populated input
  - [x] ASSERT (BLOCKING) Clicking Next navigates the wizard to the Attachments step (a "Back" button appears; Compose-only controls disappear)
  - [x] ASSERT (BLOCKING) The attached document's file name is displayed in the attachments UI after selection

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
