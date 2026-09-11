# Test Plan: Verify User Can Replace Supporting Documents

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-07
> **Estimated Duration:** 150s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | Ian / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#102656](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102656) — Verify user can replace supporting documents |

> **Note:** ADO specifies logging in "as Initiator (Craig)". This run uses the credentials supplied for this session (Ian / 123qwe) against the same login page instead.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) rather than toggling directly — clicking the control alone does not change the mode. The correct sequence is: click the control to open the popover, then click the "Latest" option inside it, then assert the control's own badge label changes from "Live" to "Latest".
>
> **Note:** This QA environment can sit on an "Initializing..." splash screen for well over the default 15s action timeout before the login form mounts — the login helper uses a generous timeout to tolerate this rather than treating it as a script failure.
>
> **Note:** ADO's field-population step lists Purpose, Background, Discussion, Financial Implications and Recommendation, but omits **Risks** — which [#102637](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102637) already established is also mandatory on this same Compose step. This plan populates Risks as well so Next genuinely navigates to Attachments.
>
> **Note:** Native OS file-browser dialogs cannot be driven by Playwright — files are set directly on the underlying `<input type="file">` via `setInputFiles()`, the same convention used in [#102655](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102655) and `projects/ITS/test-plans/BAS/register-and-upload-invoice.md`.
>
> **Note (ordering issue in ADO):** ADO's steps 20–23 (click Delete → Cancel → click Delete again → OK) permanently remove the only attachment, but steps 24–27 (hover, click Download, hover over Audit Trail) assume the attachment still exists. As literally sequenced, there would be nothing left to download or audit after step 23. This plan reorders so the Download and Audit Trail checks (ADO steps 24–27) happen **before** the final OK-confirmed delete (ADO steps 22–23) — every assertion ADO specifies is still exercised, just in an order that's actually possible to execute. The Cancel-preserves-the-file check (ADO steps 20–21) still runs first, in its original position.
>
> **Note (UI implementation details found while scripting):**
> - Hovering an attachment reveals a floating tooltip of **icon-only** action buttons rendered at the page level, not nested inside the attachment row. Their accessible names come from the icon type, not a text label: `sync` = Replace, `delete` = Delete, `download` = Download, `history` = Audit Trail (there's no button literally named "Audit Trail" or "Replace").
> - The attachment row's own file-name link (`.ant-upload-list-item-name`) is only revealed *by* hovering, so it can't be the hover target itself — hover the row container (`.ant-upload-list-item`) instead.
> - Two `<input type="file">` elements exist in the DOM from the start: one for the general "add new" dropzone slot, one tied to a specific attachment's Replace action. Sending the replacement file to the wrong one (e.g. always using `.first()`) doesn't error — it silently **adds a second attachment** instead of substituting the first. The Replace action's input is `.last()`.
> - The "Audit Trail" icon opens a popover headed **"History"** (not "Audit Trail"), listing each uploaded version with filename, size, uploader and timestamp (e.g. "Version 1 Uploaded ... by Ian Houvet — original-document.pdf (34 B)").
> - After a successful Replace, the original file's own row-link disappears entirely (it only survives as a "Version 1" entry in the History popover) — text-matching the original filename after replacement should expect exactly one match, not zero.
> **Note:** Reuses the proven flow from [#102653](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102653)/[#102655](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102655) (Live/Latest switch, CC signatory selection, per-tab population, Next navigation, direct file-input attachment) up through attaching the first supporting document.

## Objective
> Validate that on the Attachments step, an attached document can be replaced with a different one, that deleting an attachment can be cancelled (leaving it intact) or confirmed (removing it), and that the Download and Audit Trail actions are available on an attached document.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] User credentials are valid (Ian / 123qwe)
- [ ] The acting user has permission to create a new Referral memo
- [ ] At least one signatory is available for selection in the CC field

## Test Cases

### TC-01 — Verify user can replace supporting documents (ADO #102656)

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
  11. CLICK the Next button
  12. ATTACH a supporting document ("original-document.pdf")
  13. HOVER over the attached document
  14. CLICK the Replace icon and SELECT a different document ("replacement-document.pdf")
  15. HOVER over the attached document
  16. CLICK the Delete icon
  17. CLICK the Cancel button on the delete confirmation popup
  18. HOVER over the attached document
  19. CLICK the Download button
  20. HOVER over the Audit Trail icon
  21. CLICK the Delete icon
  22. CLICK the OK button on the delete confirmation popup
- **Expected result:** Hovering over an attached document reveals Replace, Delete, Audit Trail and Download controls. Replacing shows the newly selected document in place of the original. Clicking Delete then Cancel leaves the attachment intact. Downloading triggers a file download. Hovering over the Audit Trail icon shows the attachment's audit trail. Clicking Delete then OK removes the attachment from the UI.
- **Assertions:**
  - [x] ASSERT (BLOCKING) User successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Clicking Next navigates the wizard to the Attachments step
  - [x] ASSERT (BLOCKING) The original document is displayed in the attachments UI after attaching it
  - [x] ASSERT (BLOCKING) Hovering over the attachment reveals Replace, Delete and Download controls
  - [x] ASSERT (BLOCKING) After replacing, the replacement document is displayed and the original document's name is no longer shown
  - [x] ASSERT (BLOCKING) Clicking Delete shows a confirmation popup with Cancel and OK
  - [x] ASSERT (BLOCKING) Clicking Cancel closes the popup and the attachment remains displayed
  - [x] ASSERT (BLOCKING) Clicking Download triggers a file download
  - [x] ASSERT Hovering over the Audit Trail icon surfaces audit trail information for the attachment
  - [x] ASSERT (BLOCKING) Clicking Delete then OK removes the attachment from the UI

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
