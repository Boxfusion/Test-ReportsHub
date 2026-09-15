# EPM — Reject Register New User when the two Password fields do not match

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109504 — *03 · EPM · User Management — Register New User with credentials and mobile number, ready for Component Actioner and Sha Role appointment*
**Parent suite:** Phase 01 · EPM · Foundation · Reference Data
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** **Administration** › User Management → `/dynamic/shesha/users` → **Register New User**

> Mirrors a single ADO test case from suite 109504. **ADO is canonical.** Steps are transcribed verbatim
> from `Microsoft.VSTS.TCM.Steps`.

## TC-109446 — Reject Register New User when the two Password fields do not match

**ADO ID:** 109446 · **Point:** 31264 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Negative
**Coverage dimension:** Negative

### Preconditions
- Register New User modal open, with First Name, Last Name, Mobile Number, Email Address and Username
  already filled with unique values (mirrors TC-109445's precondition flow up to the password fields).

### Steps

| # | Action | Expected |
|---|--------|----------|
| 2 | Enter different values in Password and Password Confirmation. | Client-side validation rejects with "passwords must match". |
| 3 | Correct the confirmation. | Submit succeeds. |

> ADO's step numbering starts at 2 (step 1 is the implicit "open the modal and fill the other 5 fields"
> precondition, transcribed above).

### Unique inputs
Every run stamps a `TC446-<epoch>` token so field values are unique. Override with `TC446_TOKEN=<value>`.

| Field | Value |
|---|---|
| First Name | `TC446` |
| Last Name | `User<token6>` |
| Mobile Number | `06<8 digits from token>` |
| Email Address | `tc446.<token>@example.com` |
| Username | `tc446_<token>` |
| Password | `Test@<token6>` |
| Password Confirmation (step 2, wrong) | `Test@<token6>X` |
| Password Confirmation (step 3, corrected) | `Test@<token6>` (matches Password) |

### Notes
- **Writes 1 user (plus its Person) per run** once the confirmation is corrected in step 3 — there is no
  teardown, mirroring TC-109445.
- Success verification in step 3 reuses TC-109445's approach: the toast is best-effort only (logged, not
  blocking), verification is via the user list's search bar. See
  `epm-register-new-user.md`'s note on this for why.
