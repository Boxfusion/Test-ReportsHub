# Bug: Agent create silently fails (no error shown) when mobile number is a duplicate

**Project:** PD-Dispatch (PD-Dispatcher V2 Admin Portal, QA)
**Found:** 2026-07-13 (Admin, live via Playwright MCP)
**Area:** Administrative Functions → Agents (`agent-roles-table`, form `create-agent-roles`)
**Severity:** Medium (silent data-integrity/UX failure)
**Status:** Open — candidate for team

## Summary
When creating an Agent whose **Mobile Number already belongs to another user**, the server rejects the request (HTTP 400 with a clear validation message), but the UI shows **no error** and **closes the create dialog as if the save succeeded**. No agent is created.

## Steps to reproduce
1. Log in as Admin → Dispatch → Management → Agents (`/dynamic/Boxfusion.Dispatcher/agent-roles-table`).
2. **Add New** → fill all required fields (Name, Surname, Email, Username, Roles, Dispatch Area, Password/Verify) and set **Mobile Number** to a value already used by another agent (e.g. `0818400598`).
3. Click **Ok**.

## Actual
- The dialog closes with no message. It looks like the agent was created.
- Grid count does **not** increase; the agent is absent (confirmed after reload).
- Network: `POST /api/v1/AgentsRoleAppointmentActions/RegisterAgent` → **400**
  - Response: `{"success":false,"error":{"message":"Your request is not valid!","details":"The specified mobile number is already in use by another user.","validationErrors":[{"message":"The specified mobile number is already in use by another user."}]}}`
- Console error at the moment of failure:
  - `Failed to execute action 'shesha.common:Show Dialog', error: undefined`
  - (followed by React error #419)
- Root cause of the *silence*: the form's on-error action ("Show Dialog") itself throws, so the 400 validation message is never surfaced; the dialog closes regardless.

## Expected
- The validation error ("The specified mobile number is already in use by another user.") should be displayed to the user (toast or inline), and the create dialog should **remain open** so the value can be corrected — matching the behaviour of inline required-field validation.

## Evidence
- Reproduced twice (two different username/email, same duplicate mobile `0818400598`) → both 400.
- Creating with a **unique** mobile (`0818400713`) → `RegisterAgent` **200**, agent persisted (grid 10 → 11). So the happy path is fine; only duplicate-mobile error handling is broken.

## Notes
- Implies Agent mobile numbers are enforced **unique** server-side (reasonable), but the client swallows the error.
- Not to be confused with the known Incident-Types blank-details issue.
