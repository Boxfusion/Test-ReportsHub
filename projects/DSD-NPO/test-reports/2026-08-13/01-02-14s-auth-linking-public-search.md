# Report: NPO-01 · NPO-02 · NPO-14S — Authentication, NPO Linking, Public Search

**Date:** 2026-08-13 16:21 UTC
**Plan:** test-plans/auth/01-authentication-account-creation.md
**Spec:** test-plans/auth/01-authentication-account-creation.spec.ts
**Execution Mode:** ai-repair
**Result:** PARTIAL — 3 of 7 cases pass; sign-up is a different design, public search is unimplemented, and linking has an authorisation hole
**Duration:** 800s
**Cases:** TC-01-001, TC-01-009, TC-01-010 (suite 101858) · TC-02-001, TC-02-002, TC-02-007 (suite 101859) · TC-14-007 (suite 101880)
**Environment:** QA · public portal · signed-out then signed-in · view mode **Latest** (`v86 DRAFT` confirmed)

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 34 | 21 | 10 | 3 |

## Case results
| Case | ADO | Verdict |
|---|---|---|
| TC-01-001 Sign in with valid credentials | #101595 | ✅ **PASS** |
| TC-01-009 Create User Account screen | #101603 | 🔴 **FAIL** — screen does not exist |
| TC-01-010 Create account with SA ID / DHA | #101604 | ⛔ **NOT EXECUTABLE** — no ID Number field anywhere |
| TC-02-001 First-time user offered Register / Link | #101616 | ⚠️ **PARTIAL** — actions present, gating is wrong |
| TC-02-002 Link to an existing NPO | #101617 | ⚠️ **PARTIAL** — lookup works; Confirm is inert; **authorisation hole** |
| TC-02-007 Linked NPO appears and opens | #101622 | ✅ **PASS** |
| TC-14-007 Public NPO search by name/category | #101819 | 🔴 **FAIL** — no public search exists |

## ✅ TC-01-001 — Sign in (ADO #101595) — PASS
Signed in as `mpenduloizwelinuk@gmail.com` and landed on
`/dynamic/boxfusion.dsdnpo/npo-landing-view?id=<npoId>` showing NPO Details, status and actions.

🔑 **CORRECTION to the plan's "known deviation".** The plan warned that *"login lands on
`/dynamic/Shesha.Workflow/workflows-inbox`, not an NPO landing page"* and asked whether that is a routing defect.
**It is not — that was the ADMIN portal.** The **public** portal lands on the NPO landing view, exactly as
ADO #101595 prescribes (FDS Fig.8/Fig.9). **No defect; the plan note should be corrected.**

- [PASS] Sign-In page shows **Email address**, **Password**, **Forgot Password**
  (→ `/no-auth/boxfusion.dsdnpo/dsd-public-forgot-password`)
- [FAIL] The fourth prescribed control, a **Create User Account** button, is **absent**. The page instead reads
  *"Don't have an account?"* → **Register** → `/no-auth/boxfusion.dsdnpo/dsd-public-portal-send-otp`
- [PASS] **(BLOCKING)** Authentication succeeds and the logged-in landing page is displayed
- 📌 The submit button is labelled **Login**, not *Sign In*

### 🔴 New defect — a failed login is completely silent
`qa.tester0812@example.org` / `Boxfusion@2026` (the QA account recorded in the plan's preconditions) **does not
authenticate on the public portal**: `POST /api/TokenAuth/Authenticate` returned **401 twice**.

**The UI showed nothing** — no error message, no field highlight, no toast. The page simply stayed put. A user
given a wrong password gets no feedback at all and cannot tell a failed login from a slow one.
Bug: `test-reports/bugs/2026-08-13-failed-login-gives-no-feedback.md`
⚠️ **Also worth confirming:** is that QA account supposed to work on the public portal? The plan lists it as a
valid precondition, so either the credentials are stale or the account is admin-only.

## 🔴 TC-01-009 — Create User Account screen (ADO #101603) — FAIL
The case prescribes a **five-control** screen: *Email, ID Number, Password, Confirm Password, Complete Sign-up*.

**What exists instead** at `/no-auth/boxfusion.dsdnpo/dsd-public-portal-send-otp`:

> **Verify Mobile Number** — *"Please enter mobile number to verify."*
> A single **Mobile Number** field and a **Verify Number** button (disabled until filled).

**Not one of the five prescribed controls is present**, and there is **no ID Number field anywhere** in the
sign-up journey. This confirms — freshly and directly — the note already in `CLAUDE.md`.

## ⛔ TC-01-010 — Create account with a valid SA ID / DHA (ADO #101604) — NOT EXECUTABLE
The case's core assertion is that an SA ID number is captured at sign-up and passes DHA verification. **Sign-up
never asks for an SA ID**, so the DHA call under test cannot be triggered from this journey at all.

This is **not a failure of the application** so much as a **case that no longer matches the build**. It needs
rewriting against the mobile-OTP design, or the design needs to change back. **Decision required from Thabiso.**

- [SKIP] Not attempted. Beyond the missing field, the OTP leg is already blocked by
  `bugs/2026-08-12-otp-never-delivered-public-self-registration.md`, and every mobile number we hold is already
  taken on this environment. Running it would have consumed a real SMS for no coverage.

## ⚠️ TC-02-001 — First-time user offered Register / Link (ADO #101616) — PARTIAL
`/dynamic/boxfusion.dsdnpo/no-existing-npo-landing-page`

- [PASS] **(BLOCKING)** Both prescribed actions are present: **Register a new NPO** and **Link to an Existing NPO**
- 📌 A third action, **Enquiry**, is also offered — the case names only two. Almost certainly the case is older
  than the page; not raised as a defect.
- [FAIL] ⚠️ **The page is not gated on NPO linkage.** It states *"You are currently not linked to any NPOs.
  Please link your existing NPO number or register a new one"* — while the signed-in account **is linked to two
  NPOs**, both of which we used minutes later in TC-02-007. The message is unconditional, and the page is freely
  reachable by a fully linked user.
- [SKIP] The case's actual precondition — *a submitter not yet linked to any NPO* — could not be satisfied; we
  have no unlinked account. The structural assertion above was run instead, and the gating defect was found by
  that substitution.

## ⚠️ TC-02-002 — Link to an existing NPO (ADO #101617) — PARTIAL, and the important finding of this run

### 🔑 RETRACTION — the "blocked" finding of 2026-08-12 was wrong
The plan records this case as blocked because *"the submit button stayed disabled with no message"*. **That is
retracted.** The disabled button being watched is the **page's** *Link to an Existing NPO* button, sitting
**behind the modal**. The modal has its **own magnifier search button**, which is enabled and works.

I reproduced the same mistake this run — reading `submitDisabled: true` for a real, verified NPO number — and
only caught it by taking a screenshot. **The lookup was never broken.**
🔑 *Same root cause as three earlier retractions: concluding from the wrong control. Screenshot before
concluding a control is dead.*

### ✅ The lookup works and returns exactly what the case prescribes
Searching `333-018-NPO` returned:
> *"Npo number found please confirm details below and click "Confirm Link to NPO" button to complete the linking
> process"*

| Prescribed field | Returned |
|---|---|
| NPO Number | `333-018-NPO` |
| NPO Name | `Nomfanelo QA NPO 2026-08-13` |
| Authorised Person Name | `Mpendulo ntshangase` |
| Email | `mpendulosobethu@gmail.com` (+ Cell `0834964104`) |

**All four prescribed legacy fields display.** Step 1's expected result is satisfied.
Endpoint: `GET /api/services/dsdnpo/Organisations/GetNPOByNpoNumber?npoNumber=<n>` → 200.

### 🔴 `Confirm Link to NPO` is inert
Clicking it produced **no network request whatsoever**, no toast, no navigation, and the modal stayed open. The
button is enabled, visible and unobstructed (`elementFromPoint` resolves to its own child).

⚠️ **One caveat, stated honestly:** the NPO used was **already linked** to this account, so a silent no-op may be
intended. Even so, **zero feedback is a defect** — the user is told to click a button that does nothing.
Confirm was **not** re-tested against an unlinked NPO, for the reason below.

### 🔴🔑 Authorisation hole — anyone can claim a legacy NPO
Searching `000-333 NPO` — *The Southern Africa Portuguese Fund Raising Association*, an NPO **we have no
relationship with** — returned:

> *"Please note that authorized person info is blank, but you can proceed with linking."*
> Authorized Person Name: *(blank)* · Cell: *(blank)* · Email: *(blank)*
> **[ Confirm Link to NPO ]**

The app **explicitly invites the user to link to an NPO whose authorised-person details are empty**. Thabiso's
own drift note says the code matches via `GetMatchingNpoAsync` on **2-of-3 of name + mobile + email** — but with
all three blank on legacy records, **no match can be performed, and the UI proceeds anyway**.

This directly answers the plan's open question *"what stops someone linking to an NPO they have no authority
over?"* — **for legacy records with blank contact data, apparently nothing but knowing the NPO number.** NPO
numbers are sequential and publicly quoted.

⛔ **I deliberately did NOT click Confirm.** Doing so would attach a real third party's NPO to our test account —
an action on a record we do not own. **The exploit needs a developer to confirm against the code, or a
deliberate test on a legacy NPO DSD is willing to sacrifice.**
Bug: `test-reports/bugs/2026-08-13-link-existing-npo-authorisation-gap.md`

### 📌 Stale modal state
Closing and reopening the modal **retains the previous search result** — the prior NPO's name still displayed
with the number field gone. Only a full page reload clears it.

## ✅ TC-02-007 — Linked NPO appears and opens (ADO #101622) — PASS
🔑 **The linked-NPO list is not on a dashboard page** — it is the **`Organistions`** submenu under the header
user menu (*Organistions · My Profile · Logout*).

- [PASS] **(BLOCKING)** The list renders — **2 linked NPOs**: `Nomfanelo QA Test NPO 2026-08-13` and
  `Nomfanelo QA NPO 2026-08-13`
- [PASS] Clicking one opens its details — navigated to `npo-landing-view?id=8b2c57de-…` showing
  **Name · NPO Number `333-018-NPO` · Financial End Month March · NPO Status `REGISTERED`**
- [PASS] A registered NPO correctly exposes **Annual Reports · Post Registration · Voluntary Deregistration**,
  where the in-progress one offers only *Draft Application*. **Status-driven actions work.**
- [FAIL] ⚠️ **The header does not update on switch.** After switching to `Nomfanelo QA NPO 2026-08-13`, the header
  still displayed the **previous** NPO's name while the body showed the new one — two different NPOs named on
  screen at once.
- 📌 **`Organistions` is misspelled** (should be *Organisations*).

## 🔴 TC-14-007 — Public NPO search (ADO #101819) — FAIL
**There is no public NPO search in the UI.** The signed-out landing page offers only *Register an NPO ·
Visit Library · Whistleblowing · Contact Us · FAQs · Login* — **no search control and no search input anywhere**.
Guessed routes (`/npo-search`, `/public-npo-search`, `/npo-database`, …) render a genuine **404**.

### 🔑 The drift note is RESOLVED — and the answer is the opposite of what was feared
Thabiso's note warned the endpoints might be *"API-key gated, not pure anonymous-by-name search"*. The anonymous
lookup behind the whistleblowing form was called **directly with a bare `fetch` — no cookies, no Authorization
header, no API key**:

```
GET /api/services/dsdnpo/Organisations/GetNpoLookup?term=333-018   →  200
{ npoNumber: "333-018-NPO", name: "Nomfanelo QA NPO 2026-08-13",
  displayText: "333-018-NPO - Nomfanelo QA NPO 2026-08-13",
  physicalAddressText: "18 South Street, Zwartkop, Centurion, South Africa" }
```
**It is genuinely anonymous — not API-key gated.** The request the page itself makes carries only
`sha-frontend-application: public-portal`.

### But it fails the case on three counts
| Term | Result |
|---|---|
| `333-018` / `333-018-NPO` | ✅ 1 match |
| `333` | ✅ 10 matches (all **numbers** containing 333) |
| `Nomfanelo` | 🔴 **0** |
| `Nomfanelo QA NPO 2026-08-13` (exact full name) | 🔴 **0** |
| `Foundation` | 🔴 **0** — across a register of **361,068** NPOs |

1. 🔴 **It matches on NPO number only — never on name.** The case's BLOCKING assertion is *search by name*.
2. 🔴 **It returns no status.** Fields are `id · npoNumber · name · displayText · physicalAddressText`. The case
   requires *"status visible"*.
3. 🔴 **There is no category search** at all.

### ⚠️ POPIA note for suite 14Y
The anonymous endpoint returns **`physicalAddressText` — a full street address** — to a caller with no
authentication of any kind. Arguably acceptable for a public register, but it is **more than the case's
prescribed "name and status"**, and it is the sort of thing 14Y exists to rule on. **Flagging, not raising.**

## 🔴 Defects raised
1. **Failed login gives no feedback** — 401 with a silent UI *(High)* —
   `bugs/2026-08-13-failed-login-gives-no-feedback.md`
2. **Link to an existing NPO has no authorisation gate for legacy records** *(High — security)* —
   `bugs/2026-08-13-link-existing-npo-authorisation-gap.md`

## ❓ Questions for the test lead
1. 🔑 **Linking authorisation** — with authorised-person details blank on legacy NPOs, what prevents someone
   linking to an NPO they have no authority over? The UI actively encourages it.
2. 🔑 **Sign-up design** — the build is mobile-OTP with no SA ID. Do #101603 and #101604 get rewritten, or is the
   build wrong? This blocks the whole Functional SA-ID/DHA set too.
3. **Is there meant to be a public NPO search?** Nothing in the UI offers one, and the anonymous endpoint
   searches by number only and returns no status.
4. **Should `GetNpoLookup` expose a physical address anonymously?** (14Y)
5. **Does `qa.tester0812@example.org` work on the public portal?** It 401s there.
6. **Is `Confirm Link to NPO` meant to no-op when the NPO is already linked?** If so it still needs a message.
7. Typo: **`Organistions`** in the header menu.

## ▶ Next
Suites 01, 02 and 14S are now executed. Remaining smoke work: **10P / 10A Post Registration (6)** and
**13P / 13A Deregistration (6)** — both unblocked by `333-018-NPO`, and both now reachable via the
*Additional Actions* on its landing view, which this run confirmed. ⚠️ Run **10P before 13A**: deregistration
would consume the only registered NPO we control.
