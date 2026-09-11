# 🟠 Medium-High — An office bearer saves with an empty mandatory surname, client and server both

**Raised:** 2026-08-27
**Found in:** NPO-04-F TC-17 (ADO #101673 · TC-04-019)
**Environment:** QA · public portal · registration wizard tab 4, `Add Office Bearer` dialog · passport variant (`Is RSA ID Number` unticked) · view mode Latest
**Specimen:** our own draft application **APPL26-01570** (`6c02e52c-6799-4180-8b5c-9b84a5884aa4`), Account B
**Severity:** 🟠 Medium-High — creates a `DsdPerson` with no surname; a statutory office-bearer record is incomplete and nothing flags it

## What happens

`Last Name*` on the Add Office Bearer dialog is marked required with a red asterisk and carries `maxLength 50`.
Completing every **other** mandatory field and leaving `Last Name` untouched, then pressing `Save`:

| Expected | Actual |
|---|---|
| Field error, save blocked | **Saves successfully** |

Specifically:

- **no** `.ant-form-item-explain-error` anywhere in the dialog
- the `Last Name` form item carries **no** error class
- the modal **closes**, as it does on a valid save
- `POST /api/dynamic/boxfusion.dsdnpo/DsdPerson/Crud/Create` → **200**
- `POST /api/dynamic/boxfusion.dsdnpo/NpoOfficeBearer/Crud/Create` → **200**
- the grid moves to `1-1 of 1 items` and the row's **Full Name reads `Johannes`** — first name only

This is not a swallowed client-side error. Both creates returned 200, so **the record was persisted server-side
without a surname**. A required field with a visible asterisk is enforced in neither layer.

## Reproduction

1. As a public applicant, start a registration and reach wizard **tab 4 — Office Bearer**.
2. `Add Office Bearer`. Leave `Is RSA ID Number` unticked (passport variant).
3. Fill every mandatory field **except `Last Name*`**: Nationality, Passport Number, Passport Expiry Date,
   Date Of Birth, First Name (s), Residential Address, Gender, Disability, Mobile Number, Email Address,
   Position of Office Bearer.
4. `Save`.
5. Observe: no error, dialog closes, row appears with only the first name.

## Why it matters

- **Statutory record.** An office bearer is *"a director, trustee or person holding executive position"*. A record
  identifying that person by first name alone is not a usable statutory record.
- **Downstream blanks.** If any letter, certificate or notification merges the office bearer's surname, this record
  will render a gap. The suite-14T work already showed merge fields resolving straight from entity data, so a null
  surname will surface in correspondence.
- **Identity verification.** Office-bearer DHA/CIPC verification keys off identity data. A person with no surname is
  a plausible source of unverifiable records — and `IdVerificationFailureReason` is already `null` on all 28 933
  office bearers (14R), so nothing would explain the failure.
- **It undermines the other validation on the same dialog.** Eleven fields *are* enforced; this one silently is not,
  which reads as a wiring omission rather than a deliberate rule.

## Scope — what is proven and what is not

**Proven:** `Last Name*` is unenforced on both client and API, on the passport variant of this dialog.

**Not tested:** whether the other `*` fields on the same dialog are similarly unenforced, and whether the **RSA ID
variant** (`Is RSA ID Number` ticked) behaves the same way. The eleven other fields were all populated in this run,
so their enforcement was never exercised. Worth one cheap follow-up pass — if the omission is per-field, this is one
bug; if the dialog's required-validation is broadly ineffective, it is a bigger one.

## Related, on the same dialog

The same dialog already carries `bugs/2026-08-17-office-bearer-saved-with-invalid-sa-id-checksum.md` — an SA ID
failing the Luhn check digit also saves without error. Both are missing-validation defects on the office-bearer
capture form, and they may share a cause.

## Cleanup note

The blank-surname `DsdPerson` created by this test still exists on APPL26-01570, which was subsequently **submitted**
(status APPLICATION IN PROGRESS). It is our own record, so it is safe to correct or remove — flagging it so it is not
mistaken for seed data if it shows up in triage.
