# EPM — Register New User with credentials and mobile number

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109504 — *03 · EPM · User Management — Register New User with credentials and mobile number, ready for Component Actioner and Sha Role appointment*
**Parent suite:** Phase 01 · EPM · Foundation · Reference Data
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** **Administration** › User Management → `/dynamic/shesha/users` → **Register New User**

> Mirrors a single ADO test case from suite 109504. **ADO is canonical.** Steps are transcribed verbatim
> from `Microsoft.VSTS.TCM.Steps`.
>
> Note the menu: this is the **platform-level `Administration`** (correctly spelt), *not* the Epm child
> submenu `Adminstration` used by suites 109505/109506. Both exist and both match a loose
> `/Administration/i` — the spec anchors on `/^Administration$/` to tell them apart.

## TC-109445 — Register New User with First Name, Last Name, Mobile, Email, Username, matching Passwords

**ADO ID:** 109445 · **Point:** 31263 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Positive
**Coverage dimension:** Positive

### Preconditions
- User list at `/dynamic/shesha/users`.
- Add button labelled **"Register New User"**.

### Steps

| # | Action | Expected |
|---|--------|----------|
| 1 | Click Register New User. Fill all 7 fields with unique values. | Modal **Create** button enabled. |
| 2 | Click **OK**. | Success toast. Row visible in user list. |
| 3 | Verify via **User Crud GetAll**. | User record persists. |

### The 7 fields (recorded live)
All seven are mandatory:

| # | Label | Type |
|---|---|---|
| 1 | First Name\* | text |
| 2 | Last Name\* | text |
| 3 | Mobile Number\* | text |
| 4 | Email Address\* | text |
| 5 | Username\* | text |
| 6 | Password\* | password |
| 7 | Password Confirmation\* | password |

> **Step 1 says "Create button enabled" but the modal's buttons are `Cancel` / `OK`** — there is no Create
> button on this form. Step 2's "Click OK" is the accurate one. The spec asserts the **OK** button is
> enabled and reports the discrepancy rather than silently matching either label.

> **Step 2's "Success toast" does not reliably render on this env** — confirmed 2026-08-12 (headed Chromium
> run: registration POST returned 200 and the user persisted, but no `.ant-message-notice` /
> `.ant-notification-notice` appeared within 90s). The spec now treats the toast as best-effort (logs it if
> present, does not fail if absent) and verifies success by **searching the new username in the user list's
> search bar** instead, per QA guidance.

### Unique inputs
Every run stamps a `TC445-<epoch>` token so the 7 values are unique. **Mobile number uniqueness is enforced
server-side** — that is the subject of sibling case TC-109447 — so the mobile is derived from the token and
never reused. Override the token with `TC445_TOKEN=<value>`.

| Field | Value |
|---|---|
| First Name | `TC445` |
| Last Name | `User<token6>` |
| Mobile Number | `06<8 digits from token>` |
| Email Address | `tc445.<token>@example.com` |
| Username | `tc445_<token>` |
| Password / Confirmation | matching, policy-compliant |

### API for step 3
`/api/dynamic/Shesha/User/Crud/GetAll` — returns 200 with `userName`, `emailAddress`, `isActive`,
`normalizedUserName`. Registration also creates a **Person**; `/api/dynamic/Shesha/Person/Crud/GetAll`
carries `firstName`, `lastName`, `mobileNumber1`, so the fields the User entity does not hold are verified
there as corroboration. (`/api/dynamic/Shesha/ShaUser/Crud/GetAll` 404s — not the right entity name.)

### Notes
- **Writes 1 user (plus its Person) per run** and there is no teardown — the ADO case specifies none.
- Readiness on this page needs care: the app shell renders `.ant-btn` elements before the users route has
  loaded, so a naive "any button visible" check passes far too early. Wait for the **URL** *and* the
  **Register New User** button.
