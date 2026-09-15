# EPM — Mobile number uniqueness enforced at server — duplicate rejected

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109504 — *03 · EPM · User Management — Register New User with credentials and mobile number, ready for Component Actioner and Sha Role appointment*
**Parent suite:** Phase 01 · EPM · Foundation · Reference Data
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** **Administration** › User Management → `/dynamic/shesha/users` → **Register New User**

> Mirrors a single ADO test case from suite 109504. **ADO is canonical.** Steps are transcribed verbatim
> from `Microsoft.VSTS.TCM.Steps`.

## TC-109447 — Mobile number uniqueness enforced at server — duplicate rejected

**ADO ID:** 109447 · **Point:** 31265 · **Priority:** 2 · **Tags:** Edge; EPM-Redesign-2026-08-11
**Coverage dimension:** Edge

### Preconditions
- ADO literal: "A user exists with mobile `0821234567`." That literal mobile does not exist in QA at the
  time of writing (checked via `Person/Crud/GetAll`), and hardcoding it would make the case
  non-repeatable — the second run would fail *creating* the baseline user with a "mobile already in use"
  error before ever reaching step 2. Instead, the spec **creates its own baseline user with a token-unique
  mobile as a setup step**, then reuses that same mobile for step 2, preserving the case's intent
  (registering against a mobile that is already taken) without ADO's non-unique literal.

### Steps

| # | Action | Expected |
|---|--------|----------|
| 2 | Attempt to Register New User with the same mobile. | Server rejects with unique-constraint error. |
| 3 | Change the mobile and retry. | Save succeeds. |

> ADO's step numbering starts at 2 (step 1 is the implicit "open the modal and fill the other 6 fields"
> precondition).

### Unique inputs
Every run stamps a `TC447-<epoch>` token. Override with `TC447_TOKEN=<value>`.

| Field | Baseline user (setup) | Duplicate-mobile attempt (step 2) | Retry (step 3) |
|---|---|---|---|
| First Name | `TC447Base` | `TC447` | `TC447` |
| Last Name | `User<token6>` | `User<token6>` | `User<token6>` |
| Mobile Number | `06<8 digits from token>` | same as baseline | `07<8 digits from token>` (changed) |
| Email Address | `tc447base.<token>@example.com` | `tc447.<token>@example.com` | same as step 2 |
| Username | `tc447base_<token>` | `tc447_<token>` | same as step 2 |
| Password / Confirmation | matching, policy-compliant | matching, policy-compliant | unchanged from step 2 |

### Notes
- **Writes 2 users (plus their Persons) per run** — the baseline and the eventually-successful
  duplicate-mobile attempt (after its mobile is changed in step 3) — there is no teardown, mirroring
  TC-109445/109446.
- Success verification (step 3) and the baseline setup both reuse TC-109445's approach: the toast is
  best-effort only (logged, not blocking), verification is via the user list's search bar.
