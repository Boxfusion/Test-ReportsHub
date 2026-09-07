# Allow editing of Directors & Signatories details via the existing dialog on Close Corporation leads

**Type:** User Story (New Feature)
**Area:** Phase 2 — Leads
**Tags:** Phase2; Leads; UX

## Description

The Directors & Signatories table on a Close Corporation lead currently only supports adding and (where available) deleting a signatory record — there is no way to edit an existing row's details. Every field a director/signatory needs corrected (e.g. a mistyped email address or phone number) requires removing the record and re-adding it from scratch via the "Add" dialog.

This matters because CC leads require Director/Signatory OTP verification before "Initiate Pre-Screening"/conversion to an Opportunity becomes available (this gate does not apply to Private Company or Trust leads). If the contact detail the OTP is sent to is wrong, the user is currently stuck: they cannot correct the detail and retry, and (as observed during manual testing on Phase 2) may not even be able to delete and re-add cleanly, leaving the lead permanently stuck in "New" status.

As a Relationship Manager, I want to reopen a Director/Signatory's existing dialog in edit mode from the table, so that I can correct a mistake without deleting the record and can successfully complete OTP verification and convert the lead.

## How it should work

- Each row in the Directors & Signatories table gets an edit icon/action.
- Clicking the edit icon reopens the same dialog used to add a signatory, but in edit mode: pre-populated with that row's existing values (full name, ID/registration number, email, phone number, and any other captured fields).
- The user changes the relevant field(s) in the dialog and clicks Save/Update to persist the change against the existing record — it does not create a new row or require a delete-then-add.
- Clicking Cancel/closing the dialog discards changes and leaves the table row's original values intact.
- If the signatory had already gone through (or started) OTP verification, changing the email/phone in the edit dialog invalidates any previously sent/pending OTP and re-enables the "send OTP" action so a fresh code goes to the corrected contact detail.
- Field-level validation in the edit dialog matches validation on add (e.g. valid email format, valid SA phone number format, required fields can't be cleared).
- Only permitted roles (RM / whoever can currently add a signatory) can edit; this should not open up editing to roles that currently can't touch the table.

## Acceptance Criteria

1. **Edit control is visible**
   Given a Close Corporation lead with at least one existing Director/Signatory record
   When the user opens the Directors & Signatories table
   Then an edit icon/action is visible on each row.

2. **Edit icon opens the same dialog, pre-populated**
   Given the user clicks the edit icon on a signatory row
   When the dialog opens
   Then it is the same dialog used to add a signatory, now in edit mode, with every field pre-populated with that row's current values.

3. **Saving the dialog updates the same record**
   Given the edit dialog is open with one or more fields changed (e.g. email and/or phone number)
   When the user clicks Save/Update
   Then the dialog closes, the table row reflects the new values, the record's identity/ID is unchanged, and no duplicate row is created.

4. **Cancel discards changes**
   Given the edit dialog is open and the user has changed a field
   When the user clicks Cancel or closes the dialog without saving
   Then the dialog closes and the table row still shows the original, unmodified values.

5. **Validation is enforced in the edit dialog**
   Given the edit dialog is open
   When the user enters an invalid email format, an invalid phone format, or clears a required field and attempts to save
   Then save is blocked and a validation message is shown, matching the validation rules used when adding a signatory.

6. **Editing a verified/pending contact detail resets OTP state**
   Given a signatory whose OTP was already sent (verified or still pending)
   When the user changes that signatory's email or phone in the edit dialog and saves
   Then the previous OTP is invalidated and the "send OTP" action becomes available again for the updated contact detail.

7. **Corrected detail unblocks conversion**
   Given a CC lead was previously blocked at OTP verification due to a bad contact detail
   When the user corrects the detail via the edit dialog, sends a new OTP, and enters the correct code
   Then OTP verification succeeds and "Initiate Pre-Screening"/conversion becomes available, without needing to delete and re-add the signatory.

8. **Permissions unchanged**
   Given a user role that currently cannot add/manage signatories
   When they view the Directors & Signatories table
   Then no edit icon is shown to them.
