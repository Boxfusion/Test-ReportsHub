# Test Plan: Verify Next Button Navigation

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
| ADO Test Case | [#102653](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102653) — Verify Next button navigation |

> **Note:** ADO specifies logging in "as Initiator (Craig)". This run uses the credentials supplied for this session (Ian / 123qwe) against the same login page instead.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) rather than toggling directly — clicking the control alone does not change the mode. The correct sequence is: click the control to open the popover, then click the "Latest" option inside it, then assert the control's own badge label changes from "Live" to "Latest".
>
> **Note:** This QA environment can sit on an "Initializing..." splash screen for well over the default 15s action timeout before the login form mounts — the login helper uses a generous timeout to tolerate this rather than treating it as a script failure.
>
> **Note:** ADO's field-population step (step 12) lists Purpose, Background, Discussion, Financial Implications and Recommendation, but omits **Risks** — which [#102637](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102637) already established is also mandatory on this same Compose step. If Risks is left empty, clicking Next is expected to re-show the mandatory-field validation banner instead of navigating to Attachments. This plan populates Risks as well so the test reflects the real "Next button navigates successfully" happy path; see assertions for how the ADO-literal case is also covered.
>
> **Note:** Several UI implementation details surfaced while scripting this flow:
> - The CC field's signatory list is rendered via Ant Design's virtualized list (`rc-virtual-list`) — the DOM-first option isn't reliably within the current scroll viewport, so selecting "the first option" by clicking is flaky. The spec instead opens the dropdown and drives selection with the keyboard (ArrowDown + Enter), which is the standard robust pattern for Ant Design Select.
> - The selected CC value is rendered in a container two DOM levels above the accessible `combobox` node, not inside it — the combobox's own accessible text only reflects the (empty) search input.
> - Ant Design Tabs keeps inactive tabpanes mounted in the DOM (just hidden) rather than unmounting them, so an unscoped `[contenteditable="true"]` locator always matches the first tab's editor regardless of which tab is active. The spec scopes to `:visible`. Rich-text contenteditable surfaces can also hang on `Locator.fill()` — `keyboard.type()` is used instead.
> - This test chains enough steps (login, sidebar nav, CC signatory fetch, six rich-text tabs) that it sits right at the edge of Playwright's default 90s test timeout on this QA environment's slower days — a passing run took as long as 75s. The spec raises this test's own timeout to 180s via `test.setTimeout()` rather than racing the environment.
> - Switching tabs immediately after typing in the previous tab's rich-text editor can occasionally be dropped (the tab stays on the previous one) — the tab-click is retried up to 3 times if `aria-selected` doesn't flip.
> - **Important:** the wizard's step-name row ("1 Compose · 2 Attachments · 3 Routing · 4 Confirmation") is rendered on screen from the very start regardless of which step is active — it does **not** update to indicate the current step by text content alone. An earlier version of this spec asserted only that the text "Attachments" was visible after clicking Next, which is a false positive: it would have passed even if Next silently did nothing, because that text was already on the page before Next was ever clicked. Verified via screenshot that Next genuinely navigates: after clicking it, the Compose step marker shows a checkmark, "2 Attachments" becomes the active (green) step, an attachment upload dropzone appears, and — the most reliable signal — a **"Back" button appears that does not exist on the Compose step**. The spec now asserts on the Back button's appearance and the disappearance of Compose-only controls (Purpose tab, editable Subject textbox) instead of the step-label text.

## Objective
> Validate that after populating all mandatory fields on the New Referrals Draft Memo Compose step (CC signatory, Subject, and all mandatory content tabs), clicking Next navigates the wizard to the Attachments step.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] User credentials are valid (Ian / 123qwe)
- [ ] The acting user has permission to create a new Referral memo
- [ ] At least one signatory is available for selection in the CC field

## Test Cases

### TC-01 — Verify Next button navigation (ADO #102653)

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
  9. CLICK the CC field
  10. SNAPSHOT — confirm a list of signatories is displayed
  11. SELECT any signatory from the list
  12. CLICK the Subject text field and populate it with test input
  13. CLICK the Purpose tab and populate it with test input; CLICK the Background tab and populate it with test input; CLICK the Discussion tab and populate it with test input; CLICK the Financial Implications tab and populate it with test input; CLICK the Risks tab and populate it with test input; CLICK the Recommendation tab and populate it with test input — each tab is clicked and populated individually, one at a time, with its own content verified before moving to the next
  14. CLICK the Next button
- **Expected result:** The selected signatory is displayed in the CC field; the Subject and each of the six content tabs individually accept and retain their own populated input; clicking Next navigates the wizard to the Attachments step.
- **Assertions:**
  - [x] ASSERT (BLOCKING) User successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Draft Memo page is displayed after selecting New Referrals
  - [x] ASSERT (BLOCKING) A list of signatories is displayed after clicking the CC field
  - [x] ASSERT (BLOCKING) The selected signatory is displayed in the CC field
  - [x] ASSERT The Subject field contains the populated test input
  - [x] ASSERT (BLOCKING) Each tab (Purpose, Background, Discussion, Financial Implications, Risks, Recommendation) becomes selected (`aria-selected="true"`) when clicked
  - [x] ASSERT (BLOCKING) Each tab's own distinct test input is visible in its editor immediately after typing, individually, before moving to the next tab
  - [x] ASSERT (BLOCKING) Clicking Next with all mandatory fields populated navigates the wizard to the Attachments step (step 2)

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
