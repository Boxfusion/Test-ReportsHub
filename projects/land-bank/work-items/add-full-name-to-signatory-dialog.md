# Add Full Name field to the Director/Signatory dialog

**Type:** User Story (New Feature)
**Area:** Phase 2 — Leads (Close Corporation)
**Tags:** Phase2; Leads; UX

## Description

The Add Director/Signatory dialog (used when adding a signatory to a Close Corporation lead) does not currently capture the signatory's full name — only fields such as ID/registration number, email, and phone number are collected. As a result, the Directors & Signatories table has no reliable way to identify which person a row belongs to, and downstream documents/communications (e.g. OTP prompts, consent forms) can't reference the signatory by name.

As a Relationship Manager, I want to capture a signatory's Full Name when adding or editing a director/signatory, so that each record is identifiable by name in the table and in any generated documentation.

## How it should work

- A **Full Name** text field is added to the Add Director/Signatory dialog, positioned as the first field (above ID/registration number).
- Full Name is a required field — the dialog cannot be saved without it, consistent with the other mandatory fields (e.g. ID number, email).
- Basic validation applies: non-empty, reasonable max length, and no purely numeric/special-character-only input (matches whatever name validation pattern is already used elsewhere in the app, e.g. on the lead's primary applicant fields).
- The Directors & Signatories table gains a **Full Name** column, displaying the captured value for each row.
- Full Name is also pre-populated and editable in the edit dialog for an existing signatory (see companion story on dialog-based editing).
- Existing signatory records created before this change show a blank/"Not captured" value in the Full Name column until edited and updated.

## Acceptance Criteria

1. **Field is present and required on Add**
   Given the user opens the Add Director/Signatory dialog
   When they view the form
   Then a "Full Name" text field is present and marked as required.

2. **Cannot save without Full Name**
   Given the Add Director/Signatory dialog is open with all other required fields completed but Full Name left blank
   When the user attempts to save
   Then save is blocked and a validation message prompts for Full Name.

3. **Full Name is validated**
   Given the user enters an invalid value in Full Name (e.g. only numbers/symbols, or exceeds the max length)
   When they attempt to save
   Then save is blocked and a validation message is shown.

4. **Full Name persists and displays in the table**
   Given the user completes the dialog with a valid Full Name and saves
   When the Directors & Signatories table refreshes
   Then a new row appears showing the entered Full Name in a dedicated column.

5. **Full Name is editable via the edit dialog**
   Given an existing signatory record
   When the user opens it in edit mode
   Then the Full Name field is pre-populated with the current value and can be changed and saved, updating the same record.

6. **Existing records are unaffected**
   Given a signatory record created before this feature was added
   When the Directors & Signatories table is viewed
   Then the row still displays correctly, with Full Name shown as blank/"Not captured" until the record is next edited and saved.
