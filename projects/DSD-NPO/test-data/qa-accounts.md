# DSD-NPO — QA test accounts

## Public-portal applicant accounts (created 2026-08-25)
Created for the **IDOR / BOLA cluster** — suite 14Z Class B (11 cases) needs two independent accounts so a resource
owned by A can be probed from B's session. Also unblocks suite 07 TC-07-020 (non-admin user).

| | Account A | Account B |
|---|---|---|
| Email / username | `npo.qa.applicant.a@example.org` | `npo.qa.applicant.b@example.org` |
| Password | `QaApplicant#2026` | `QaApplicant#2026` |
| Mobile | `0684078878` | `0999999999` |
| Name | NpoQaApplicant AlphaTest | NpoQaApplicant BravoTest |
| Person id | `96c5398f-fa25-4ffa-aa6d-2e5969209c42` | `82612bda-3419-4497-b583-56361b50e3ad` |
| Sign-in verified | ✅ lands on `Shesha.Workflow/workflows-inbox` | ✅ same |
| NPO owned | none yet — has `Register NPO` | none yet — has `Register NPO` |

Both were self-registered through the public portal with **no admin involvement**, and both were confirmed to sign in
afterwards (not merely "the form closed").

### ⚠️ Notes on the mobile numbers
- **`0684078878` is a real colleague's number (Reuben's).** He confirmed the OTP SMS **never arrived**. Consider
  swapping this to an unallocated number if the account is kept long-term, so nothing ever texts him.
- **`0999999999` is deliberately not an allocated South African mobile prefix** (SA mobiles are 06x/07x/08x), so no
  real subscriber can receive its SMS. **Prefer this pattern for any further test accounts.**
- `example.org` is RFC-2606 reserved, so the email addresses cannot reach anyone either.

### 🔑 How to complete sign-up when the SMS does not arrive
SMS delivery on QA is unreliable (credit) — but the OTP is readable, so it is not a blocker:
```
GET https://dsd-npo-api-qa.shesha.app/api/services/dsdnpo/npoOtpStressTesting/
      GetOtpByEmailAddressOrPhoneNumber?emailAddressOrPhoneNumber=<mobile>
→ 200, JSON containing the live 6-digit pin, sendTo, expiresOn
```
⚠️ That endpoint answers **anonymous** callers and is the CRITICAL finding in
`test-reports/bugs/2026-08-18-api-reachable-without-authentication.md` (via TC-01-021). Used here only to read the
OTP for numbers we control. **Never transcribe a pin value into a report.**

### The sign-up journey (3 steps, not 2)
1. `/no-auth/boxfusion.dsdnpo/dsd-public-portal-send-otp` — Mobile Number (`maxlength=10`, **exactly** 10 digits or
   `Verify Number` stays disabled) → *Verify Number* → *Send OTP*
2. Verification Code → *Verify* → redirects to `signUp-public-portal?default=<mobile>`
3. `signUp-public-portal` — **First Name · Last Name · Email Address** → *Next* → **Password · Confirm Password** →
   *Sign Up* → redirects to `/login`

🔑 **The three inputs on step 2 carry no label, placeholder or name attribute** and are not wrapped in
`.ant-form-item`. Fill them **positionally** in DOM order (First, Last, Email) and read each value back.

## Shared dev login (pre-existing)
`mpenduloizwelinuk@gmail.com` / `123qwe` — broadly privileged; almost certainly holds `Authorised Admin`
(5 290 holders). **Not suitable for access-control tests** — it opens every tribunal decision form, which is the
whole of 11A TC-06.

## Admin-portal staff accounts (created 2026-08-26)

Created to break the standing *"still to request from an administrator"* blocker. 🔑 **No administrator is needed** —
**Administration → User Management → `Register New User`** creates an internal user, and that user's detail page has an
**`Assign Role`** control offering **all 46 roles**. Both accounts below were created and role-assigned by QA in under
five minutes.

| | Account C | Account D |
|---|---|---|
| Username / email | `npo.qa.staff.c@example.org` | `npo.qa.clerk.d@example.org` |
| Password | `QaStaff#2026` | `QaClerk#2026` |
| Name | NpoQaStaff CharlieTest | NpoQaClerk DeltaTest |
| Mobile | `0999999998` | `0999999997` |
| Type | Internal | Internal |
| Person id | `780414a5-1d6f-4263-abae-aec803e69cfb` | `da68d81e-d7f6-489c-8ad7-b4d62115a2f2` |
| User id | 15946 | 15947 |
| Roles | `Annual Compliance Quality Assurer` + `Appeal Tribunal Member` | **`Dsd.Npo.Registry Clerk` only** |
| Holds `Authorised Admin`? | **No** | **No** |
| Purpose | suite 09, 11A tribunal cases | **the 11A TC-06 negative control** |

⚠️ **Keep account D on `Dsd.Npo.Registry Clerk` alone.** It is the only genuinely restricted, non-tribunal account we
hold, and it is what makes 11A TC-06 conclusive. Adding any role to it destroys that.
⚠️ **Do not give A or B any staff role.** They are the two *ordinary* users that suite 14Z Class B (IDOR/BOLA) depends
on; privileging either invalidates that suite.

### What the roles did and did not unblock
- ✅ **Navigation is genuinely role-scoped.** Account C sees only `Dashboards · Reports · All NPOs · Workflows` — no
  CRUDS, no Administration, no Configurations.
- ✅ **Route authorisation is real for some areas** — C gets a clean **403 "Sorry, you are not authorized to access
  this page"** on `user-management-table`.
- 🔴 **But not for the tribunal views.** Account **D**, holding only `Dsd.Npo.Registry Clerk`, renders
  `appeal-outcome` (the Upheld / Denied / Approve decision control) and `forward-arbitration-tribunal` with **no
  403**. That confirms 11A TC-06 with a properly scoped account, removing the caveat the 08-25 run had to carry.
- ⚠️ **RETRACTED — an earlier version of this file said the role does not unblock suite 09. That was wrong.**
  **Suite 09 is NOT blocked; its 3 cases are runnable.** The QA form must be opened via
  `/shesha/workflow-action?id=<workflowInstanceId>&todoid=<todoItemId>` → the **Quality Assurance** action — never by
  its own URL, which renders a dead, disabled form. Account C then gets a fully editable modal **identical to the
  privileged admin**, so the role makes no difference to reaching it.
  🔑 The earlier test also used a specimen at `Status = 3`; `Status` here is Shesha’s **WorkflowStatus**
  (1 Draft · 2 In Progress · **3 Completed**). Filter `status == 2` for a live specimen.
  ⚠️ **2026-08-27 — "the Workflows inbox renders empty for every account we hold" is NARROWED, and as written it is
  now wrong.** The **admin-portal** inbox is populated for the shared admin account: `Shesha.Workflow/workflows-inbox`
  rendered **1-10 of 2 476 items**, correctly listing our own APPL26-01570 at row 1 with `Action Required: Doc
  Verification`. Each row links to `/shesha/workflow-action?id=<instance>&todoid=<todo>`, so the todoid **is**
  obtainable through the UI without guessing.
  What survives: the **applicant-side** inboxes (accounts A/B on the public portal) render empty, and accounts C/D
  were not re-tested on 08-27. Re-scope the question to the applicant portal rather than dropping it.
  See `test-reports/audits/2026-08-26-reverification-of-three-uncertain-conclusions.md` and
  `test-reports/2026-08-27/07-triage-ob-compliance-doc-verification-functional--all-obs-non-compliant.md`.

## Suite-01 throwaway sign-ups (created 2026-08-26)

Created by driving the **public sign-up journey** (not User Management) because suites TC-01-015/016/017/018/019 test
that journey itself. All on **unallocated `09x` mobiles** and RFC-2606 `example.org` addresses, so nothing can reach a
real person.

| Account | Mobile | State | Why it exists |
|---|---|---|---|
| `npo.qa.policy.f@example.org` | `0999999989` | **created, then LOCKED** | TC-01-016 evidence — its password is literally **`password`** (8 chars, accepted). TC-01-019 then locked it at 5 failed attempts. |
| *(none — `NpoQaWhitespace EchoTest`)* | `0999999990` | **not created** | TC-01-018 — the padded email produced a 500; creation refused |
| *(none — `NpoQaDuplicate GolfTest`)* | `0999999988` | **not created** | TC-01-017 — blocked at the email step by *"Email Address Already Exist"* |

⚠️ **Do not reuse account F for anything needing sign-in** — it is locked, and its password is a deliberate
weak-password artefact.
🔑 **`0999999988` and `0999999990` are OTP-verified but unregistered**, so a future sign-up test can reuse either
without burning a fresh number.

### 🔑 The sign-up journey is THREE steps — and step 3 has two screens
The 08-18 inventory recorded two steps and wrongly concluded Password/Confirm were absent. Corrected:

| Step | Route | Fields |
|---|---|---|
| 1 | `…/dsd-public-portal-send-otp` | Mobile Number (`maxLength 10`) → *Verify Number* → *Send OTP* |
| 2 | same | Verification Code (`maxLength 6`, placeholder `OTP`) → *Verify* |
| 3a | `…/signUp-public-portal?default=<mobile>` | First Name (50) · Last Name (50) · Email Address (no maxLength) → **`Next`** |
| **3b** | same | **Password · Confirm Password** → *Sign Up* |

⚠️ **`Back` on step 3b does not navigate** — a mistyped email cannot be corrected; the whole journey (OTP included)
must be restarted.
🔑 Step 3a's three inputs sit in `.ant-form-item` wrappers but have **empty `<label>`s** — fill **positionally** in DOM
order and read each value back.
🔑 **Password policy actually enforced: minimum 6 characters, nothing else.** No complexity, no dictionary check, no
strength meter, and the rule is never shown to the user. `password` is a working credential.

## Still needed from an administrator
| Purpose | Role to assign | Cases | Holders that already exist |
|---|---|---|---|
| Tribunal member | `Appeal Tribunal Member` | 11A TC-01/02/03, makes TC-06 conclusive | 4 |
| Restricted staff (**no** `Authorised Admin`) | `Dsd.Npo.Registry Clerk` only | 11A TC-06 control | 6 |
| Annual compliance QA | `Annual Compliance Quality Assurer` | suite 09 (3) | 25 |
| Read-only user | ⚠️ **no "Read only" role exists** among the 46 | 14C TC-05 | 0 |

⛔ **Do not grant `Authorised Admin`, `System Administrator` or `Dsd.Npo.System Administrator1`** to any account meant
to be restricted — that is what makes the shared login see everything.

## 2026-08-27 — deletion / re-registration accounts (TC-01-022)

| | Account H (deleted) | Account I (re-registered on H's identifiers) |
|---|---|---|
| Email / username | `npo.qa.delete.h@example.org` | **same** — `npo.qa.delete.h@example.org` |
| Password | `QaDelete#2026` | `QaRerego#2026` |
| Mobile | `0999999982` | **same** — `0999999982` |
| Name | NpoQaDelete HotelTest | NpoQaRerego IndiaTest |
| Person id | `7c18ac90-e34a-462c-92ee-b315467020a9` | (new GUID, not captured) |
| State | ⛔ **DELETED** from User Management | ✅ live, **no NPO links** |

🔑 **The point of the pair:** deleting an account **frees its email and mobile for immediate re-registration**, with
no error and no reactivation flow. A live duplicate email *is* blocked (*"Email Address Already Exist"*, TC-01-017),
so the guard exists — deletion just releases the address silently. Recorded as an observation for the BA because
TC-01-022 is `L1-draft` with no agreed acceptance criterion.

⚠️ **Account H's Draft survives its owner: `APPL26-01572` (`8dd2fdde-7885-4fc1-a9cb-930d0368bed7`), `npo: null`.**
Do not read that null as "deletion orphaned the link" — H never completed Organisation Details, so it was very likely
null from creation.

### 🔑 Account deletion is a UI action — this retires a standing blocker
**Administration → User Management** → `/dynamic/boxfusion.dsdnpo/user-management-table` carries a **per-row delete
icon**. ⚠️ Module is `boxfusion.dsdnpo`, **not** `Shesha` — `/dynamic/Shesha/user-management-table` 404s.
🔴 **One click deletes, with no confirmation and no undo** — see
`test-reports/bugs/2026-08-27-user-deletion-has-no-confirmation-and-is-not-transactional.md`. Only ever aim it at a
throwaway you created.

### ⚠️ Accounts A and B are no longer unlinked
A picked up an NPO via *Invite to Organisation* (08-26 appeals work). **B now owns `APPL26-01570`**, which was
submitted E2E on 08-27 and then driven to **OB Failed Compliance** by TC-07-008. Both remain **unprivileged**, so
suite 14Z Class B is unaffected — but TC-02-008 needs a fresh sign-up to re-run.

### 🔑 Two session gotchas that cost time on 08-27
- **`localStorage.clear()` does not sign you out** of either portal — the token is not held there. An apparent
  "anonymous" probe can silently still be the shared dev account with full admin rights. Use the user-menu **Logout**.
- **`currentOrganisation` survives logout** and is used to build the dashboard URL, so a previous user's org id gets
  fed into the next session in the same browser. The server recovers correctly (it redirects to the empty state), but
  it will make you think you have found a cross-account leak. Clear it, or use a clean profile.
- 🔑 The bearer token **is** in `localStorage`, but as **base64-encoded JSON**, not a raw JWT:
  `JSON.parse(atob(localStorage.getItem('<random-looking key>'))).accessToken`. Scanning for a `xxx.yyy.zzz` string
  finds nothing.
