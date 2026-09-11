# Report: NPO-04-F — Registration Wizard, Office Bearers (functional) — surnames store unaltered, but a mandatory surname can be left blank

**Date:** 2026-08-27 10:11 UTC
**Plan:** test-plans/npo-registration/04-wizard-office-bearers-functional.md
**Execution Mode:** ai-mcp
**Result:** FAILED — both special-character surnames are accepted and stored **byte-for-byte unaltered** (`van der Merwe` keeps its spaces and lower-case particles; `O'Brien` keeps its apostrophe, with no escaping artefact). The blocking assertion fails: an **empty** `Last Name*` is **not refused**. The office bearer saved, both `DsdPerson/Crud/Create` and `NpoOfficeBearer/Crud/Create` returned 200, the dialog closed, and the record persists in the grid with no surname at all — with no validation message anywhere.
**Duration:** ~1500s
**Cases:** TC-17
**Environment:** QA · public portal · view mode Latest · our own draft application **APPL26-01570** (`6c02e52c-…`), passport variant of the OB dialog (`Is RSA ID Number` unticked)
**Accounts used:** `npo.qa.applicant.b@example.org` (Account B)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 1 | 0 | 1 | 0 | 0 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-17 OB Surname: special characters | #101673 | ❌ FAILED | Both names stored unaltered ✅, but the empty surname is accepted and persisted ❌ |

## Per-case detail

### TC-17 — OB Surname: special characters (#101673 · TC-04-019) — FAILED

Run in the order the plan specifies, on three separate office bearers of the same application. `Last Name*` carries
`maxLength 50` and is marked required with a red asterisk.

| Step | Surname entered | Expected | Actual | Result |
|---|---|---|---|---|
| 3 | *(empty)* | required error | **saved successfully, no error** | ❌ |
| 1 | `van der Merwe` | accepted | accepted, stored `Pieter van der Merwe` | ✅ |
| 2 | `O'Brien` | accepted (apostrophe allowed) | accepted, stored `Siobhan O'Brien` | ✅ |

**Assertion results**

| Assertion | Result |
|---|---|
| Both names accepted and stored **unaltered** | ✅ **PASS** |
| Empty refused | ❌ **FAIL** (blocking) |

### Step 3 in detail — the empty surname

Every other mandatory field on the dialog was completed (Nationality, Passport Number, Passport Expiry Date, Date Of
Birth, First Name, Residential Address, Gender, Disability, Mobile Number, Email Address, Position) and `Last Name`
was left untouched. On `Save`:

- no `.ant-form-item-explain-error` appeared anywhere in the dialog
- the `Last Name` form item carried no error class
- the modal **closed**
- `POST /api/dynamic/boxfusion.dsdnpo/DsdPerson/Crud/Create` → **200**
- `POST /api/dynamic/boxfusion.dsdnpo/NpoOfficeBearer/Crud/Create` → **200**
- the grid moved to **1-1 of 1 items** and the row's Full Name reads **`Johannes`** — first name only

So this is not a swallowed client error; the record was created server-side without a surname. A required field with
a visible red asterisk is enforced neither on the client nor on the API.

Bug filed: `bugs/2026-08-27-office-bearer-saves-with-empty-mandatory-surname.md`.

### Steps 1 and 2 in detail — the positive cases

Read back from the persisted grid rows, not from the input values:

```
Pieter van der Merwe   South Africa  QA7654321  25/08/2027  10/03/1982  Male    No  …  Secretary
Siobhan O'Brien        South Africa  QA1122334  28/08/2027  05/09/1988  Female  No  …  Treasurer
```

- `van der Merwe` — internal spaces preserved, no title-casing applied to `van`/`der`, no trimming of the particles.
- `O'Brien` — the apostrophe survives as a literal `'`. **No HTML entity, no backslash escape, no doubling.** The
  plan's 📌 note about the apostrophe being the natural partner to the XSS case (TC-03-022) is worth keeping open,
  but on the storage-and-redisplay path it is clean.

📌 **Still worth following through:** the plan flags the auto-generated constitution PDF as the place an unescaped
apostrophe usually surfaces. This application generated
`NpoQa Bravo Wizard Test 2026-08-27 - ApplicationNonMembershipConstitution.pdf` **before** `O'Brien` was added, so
the PDF was not re-checked against the apostrophe. That is a small, cheap follow-up: re-download the constitution for
APPL26-01570 and run `scripts/extract-pdf-text.js` over it to see how `O'Brien` renders in the generated document.
Not done in this run.

## 🔑 Automation notes — three gotchas, one new

1. **The number field accumulates.** `Office Bearer Term (Year(s))` took both a `fill('3')` and a
   `pressSequentially('3')` and ended up `33`. Same class as `dispatch-crud-append-accumulation`. Read the value
   back through the **spinbutton's accessible node**, not `document.querySelector('input.ant-input-number-input')` —
   that selector resolves to a different, hidden element and returned `""` while the real control held `33`.
2. **Synthetic clicks are unreliable, confirmed again.** A JS loop calling `btn.click()` four times on the date
   panel's decade-back control advanced it **once**. Real MCP clicks advanced it correctly every time. Consistent
   with `shesha-forms-use-real-clicks`.
3. **Date panels must be driven, never filled** — `antd-date-fields-never-set-programmatically` held: year button →
   decade back ×N → year → month → day title selector (`td[title="1982-03-10"]`) worked reliably for both
   `Date Of Birth` and `Passport Expiry Date`.

## Notes for the test lead

- The empty-surname acceptance is the substantive finding here and is not surname-specific in character — it is a
  mandatory-field enforcement gap. Worth asking whether other `*` fields on the same dialog are similarly
  unenforced; this run only proves it for `Last Name`.
- A person record (`DsdPerson`) now exists with a blank surname. If office-bearer identity verification or any
  letter/PDF merge keys off surname, that record is a plausible source of downstream blanks.
