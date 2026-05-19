# Bug: Call Log section missing from case detail page

**Date logged:** 2026-05-14
**Logged by:** QA (automated run)
**Plan:** test-plans/cases/create-call-log-entry.md
**Failing TC / step:** TC-03, step 1 (`SNAPSHOT — confirm case detail page shows the Call Log section`)
**Severity:** High — feature is non-discoverable from the case detail page
**Environment:** QA — https://linux-dep-adminportal-test.azurewebsites.net/
**Case used:** REF015/13/05/2026 (id `8d723abd-d40f-4911-a839-14580fcc6c67`)
**Sample URL:** `/dynamic/Boxfusion.ServiceManagement/case-request-details?id=8d723abd-d40f-4911-a839-14580fcc6c67`

## Expected
The case detail page should expose a Call Log section that lets the agent record an interaction with channel + notes:
- A "Call Log" section/panel is visible.
- An "Add Call Log" button opens a form/dialog.
- The form contains at minimum: a **Channel** dropdown (including `Call Centre`) and a **Notes** field.
- Submitting the form persists a call log entry that appears in a per-case list.

## Actual
On `Boxfusion.ServiceManagement/case-request-details v140` (REF015/13/05/2026), only the following sections are present:
- **Timeline** — buttons: `Send Email`, `Send SMS`, `Add Notes` (no `Add Call Log`)
- **Uploaded Media** (collapsed)
- **Related Case(s)** (collapsed)
- **Case Overview** (Reported By, Priority, Category, Case Type, Description, Assigned To)
- **Customer Overview** (Customer Information)

As a sanity check, the `Add Notes` button was clicked. The form that appeared contains only:
- A single textbox
- `Cancel` and `Add` buttons

There is **no Channel selector**, **no Call Centre option**, and **no call-log list** on the case detail page.

## Snapshot evidence
- After login → All Cases: `.playwright-mcp/page-2026-05-14T08-11-46-002Z.yml`
- Case detail (REF015): `.playwright-mcp/page-2026-05-14T08-20-27-331Z.yml`
- Case detail after Add Notes click: `.playwright-mcp/page-2026-05-14T08-21-38-941Z.yml`                                                                                                                            

## Repro
1. Log in as `admin / 123qwe` at https://linux-dep-adminportal-test.azurewebsites.net/.
2. Navigate to `All Cases` (`/dynamic/StarterTemplate/cases-table`).
3. Click the search icon on any row (e.g. REF015/13/05/2026) to open the case detail.
4. Inspect the page — confirm absence of any "Call Log" section / "Add Call Log" button / Channel dropdown.

## Suspected cause
The call-log feature appears to be implemented only as a standalone "create a case from a call" form (see recent branch commits `[feat]- callLog forms`, `[feat]: added forms for creating a case on a call`, and the sibling test plan `test-plans/calls/create-call-log.md`). The case detail view does not yet host a Call Log subsystem, so call log entries cannot be associated with an existing case from the case detail screen. Either (a) the case-detail page is missing the section, or (b) the spec captured in `test-plans/cases/create-call-log-entry.md` describes a feature that was never planned to live on the case detail page.

## Recommendation
Product/Engineering to confirm whether call log entries are expected to be added to existing cases from the case detail page. If yes — add the Call Log section, button, and form. If no — close as "won't fix" and retire `test-plans/cases/create-call-log-entry.md`.
