# Report: NPO-01-F — Authentication & Account Creation (functional) — re-registration after deletion is silently allowed

**Date:** 2026-08-27 11:16 UTC
**Plan:** test-plans/auth/01-authentication-account-creation-functional.md
**Execution Mode:** ai-mcp
**Result:** PARTIAL — the case was recorded *"NOT SCHEDULED — requires developer DB access"*, but **account deletion is available in the admin UI**, so four of its five steps ran black-box. The `(BLOCKING)` assertion **PASSES**: no `Crud/Get` is ever issued with a null id. The Dashboard **correctly** shows the empty state, and the re-registered person inherits **no** NPO links. The failure is the middle assertion: re-registration with the **same email and mobile** is neither blocked nor routed to reactivation — it silently creates a new account.
**Duration:** ~1200s
**Cases:** TC-19
**Environment:** QA · public + admin portal · view mode Latest
**Accounts used:** throwaway **Account H** `npo.qa.delete.h@example.org` / `0999999982` (created, given a Draft NPO, then deleted); re-registered as `NpoQaRerego IndiaTest` on the same email + mobile; `mpenduloizwelinuk@gmail.com` for the deletion

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 1 | 0 | 0 | 1 | 0 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-19 Re-register after account deletion | #107678 | ⚠️ PARTIAL | Blocking assertion passes; re-registration is silently allowed with no error and no reactivation route |

## ⚠️ Scope caveat that governs this whole report

The case is `L1-draft`. Thabiso's own note says it *"requires L3 validation"*, and the FDS entry reads
**"Scope gap — no FDS clause; BA to author acceptance criterion."** The expected behaviour is therefore **not yet
agreed**, so everything below is recorded as an **observation for the BA**, and **no defect is raised against the
re-registration behaviour itself**. The one bug filed from this run
(`bugs/2026-08-27-user-deletion-has-no-confirmation-and-is-not-transactional.md`) is a separate, plain safety issue
that does not depend on the unagreed criterion.

## 🔑 Why this ran at all — the "developer DB access" blocker was only half true

The ⛔ rested on needing a deletion. **Administration → User Management (`boxfusion.dsdnpo/user-management-table`)
offers a per-row delete icon** — 10 of them, one per row, across 8 790 users. So steps 1–4 are UI-runnable. Only
step 5 (querying `Core_OrganisationPersons` directly) genuinely needs DB access, and it is the only assertion left
unevidenced.

📌 The plan's own hint was right and worth repeating: *"Step 4 is testable on its own, right now, and costs nothing."*
Step 4 **is** the blocking assertion, and it needs no deletion at all.

## Precondition built

| Step | Result |
|---|---|
| Sign up Account H (`0999999982`, unallocated prefix; `example.org`) | ✅ created, sign-in verified |
| Give it a Draft NPO — POPIA → `Next` | ✅ Draft **APPL26-01572**, workflow `8dd2fdde-7885-4fc1-a9cb-930d0368bed7` |
| Delete Account H from User Management | ✅ deleted (Person id `7c18ac90-e34a-462c-92ee-b315467020a9`) |

## Per-case detail

### TC-19 — Re-register after account deletion (#107678 · TC-01-022) — PARTIAL

**Assertion results**

| Assertion | Result | Evidence |
|---|---|---|
| No orphaned NPO links survive | ✅ **PASS** | The re-registered person has **no** NPO links; the old Draft is not attached to it |
| Re-registration is blocked **or** routed to reactivation | ❌ **FAIL** | Neither. A new account was created silently |
| Dashboard shows empty state | ✅ **PASS** | Redirects to `no-existing-npo-landing-page`, correct copy |
| **(BLOCKING)** no `Crud/Get` with `id=null` | ✅ **PASS** | No `Crud/Get` was ever issued with a null/undefined id |

#### Step 2 — re-registration is silently allowed

Re-running the full sign-up journey with the **same mobile and the same email** as the deleted account:

| Point in journey | Expected (case) | Actual |
|---|---|---|
| Mobile `0999999982` → *Verify Number* | block or reactivation | ✅ *"Mobile Number Valid, Click Sent OTP"* — treated as free |
| OTP | — | issued and accepted normally |
| Email `npo.qa.delete.h@example.org` → *Next* | block or reactivation | advanced straight to the password step — **no** *"Email Address Already Exist"* |
| *Sign Up* | — | account created, redirected to `/login` |
| Sign in | — | ✅ works |

So the third branch the case explicitly warns against is what happens: sign-up **silently creates a new Person**. It
does not error, and there is no reactivation flow anywhere in the journey.

Worth contrasting with known behaviour: a duplicate email on a **live** account *is* caught — TC-01-017 (2026-08-26)
was blocked at the email step by *"Email Address Already Exist"*. So the guard exists; deletion simply frees the
address, with no trace shown to the next registrant.

#### Steps 3 and 4 — the Dashboard, and the blocking assertion

The new account's Dashboard link resolved to `no-existing-npo-landing-page`, rendering:

> Hi **NpoQaRerego**, Welcome to the DSD NPO Portal — What would you like to do?
> **You are currently not linked to any NPOs.** Please link your existing NPO number or register a new one.
> [ Register a new NPO ] or [ Link to an Existing NPO ]

Correct empty state, and **no inherited NPO**. 📌 This also partially corrects my TC-02-008 report from earlier today:
the empty-state page *is* routed to on this path, so the routing defect recorded there is specific to the
**post-login landing**, not to the dashboard link.

**The blocking assertion, tested directly.** Opening the dashboard with no resolvable NPO produces **no** `Crud/Get`
with a null id — the assertion as worded passes. But the client does issue three sibling calls with an undefined id,
each rejected, and **swallows all three**:

```
GET /api/services/dsdnpo/Organisations/GetOutstandingAction?npoId=undefined                → 400
GET /api/services/dsdnpo/AnnualComplianceActions/GetAnnualComplianceByNPO?npoId=undefined  → 400
GET /api/services/dsdnpo/AnnualComplianceActions/IsLatestSubmissionCompliant?npoId=undefined → 400
```

plus three `Entities/GetAll` calls filtered on `npo == ""`. The user sees no error; on a stale-id load the page even
renders a **blank NPO Details card** (`Name:`, `Application Ref.:`, `NPO Number:`, `Financial End Month:`,
`NPO Status:` all empty) above *"All Done! You're all caught up, there's no new actions."*

**For the BA:** the assertion's literal wording is satisfied while the behaviour it exists to prevent is present on
three neighbouring endpoints. If the intent is "the client never queries with an unresolved NPO id", the criterion
should name `npoId=` too, and this case currently fails that intent.

#### Step 5 — not evidenced

Querying `Core_OrganisationPersons` needs DB access. What *is* observable: the Draft application row survives its
owner's deletion —

```json
{ "id": "8dd2fdde-…", "applicationStatus": 1, "creationTime": "2026-08-27T11:09:38", "npo": null }
```

⚠️ **Do not read too much into the `npo: null` there.** Account H never completed Organisation Details, so that
draft's `npo` was almost certainly null from creation rather than nulled by the deletion. **This run does not show
that deleting a user orphans an NPO link**, and the tempting link to the 10 349 `npo: null` rows on All Applications
is *not* supported — those carry `applicationStatus: 0` (never started), ours carries `1`. Abandoned drafts is the
duller and better explanation.

## ⚠️ One alarm I raised and then disproved — worth recording as method

Immediately after re-registering, the Dashboard link resolved to
`npo-landing-view?id=be7125b8-…` — **Account B's NPO**. That looked like a cross-account data leak.

It was **my own harness contamination**: `localStorage.currentOrganisation` still held `be7125b8-…` from my earlier
Account B session in the same browser profile. The `Dashboard` href itself is clean (`/npo-landing-view`, no id), the
app **redirected** to the empty state, and no other user's data was ever displayed. Checking before writing is what
kept a false cross-tenant-leak claim out of this report.

Two real, smaller things do follow from it:
- **`currentOrganisation` survives logout** and is used to build the dashboard URL, so on a shared browser one user's
  org id is fed into the next user's session. The server recovered correctly, so this is stale-state hygiene, not a
  leak — but it is the same persistence that made an earlier "logout" (clearing `localStorage`) silently fail.
- ⚠️ **Retract a small inference from my TC-02-008 report:** I noted that the `Dashboard` nav item appears only for
  accounts with a linked NPO. It appeared here for an account with **no** links — driven by that stale value. It was
  a two-sample observation and should not be treated as a rule.

## 🔑 What the stale id did reveal — already-filed, re-confirmed

Chasing it down produced a genuine confirmation of an existing finding. Signed in as the brand-new `NpoQaRerego`
(no NPO links), reading another organisation's record by GUID succeeds:

```
GET /api/dynamic/boxfusion.dsdnpo/NpoOrganisation/Crud/Get?id=be7125b8-…
→ 200 { applicationRef: " APPL26-01570", name: "NpoQa Bravo Wizard Test 2026-08-27", status: 1 }
```

**No new bug filed** — the same endpoint answers a **completely anonymous** caller (no token) with the same 200 and
the same body, so this is subsumed by the existing CRITICAL
`bugs/2026-08-18-api-reachable-without-authentication.md`, and the 14Z Class B run already recorded
`boxfusion.dsdnpo/NpoOrganisation` as anonymously readable (320 595 records).

Two details worth adding to that bug:
1. It affects **read-by-id** (`Crud/Get?id=`), not only `Crud/GetAll` — so a single known GUID is enough.
2. The exposure is **per-endpoint, not blanket**: `Entities/GetAll?entityType=Npo.Application` correctly returns
   **401 "Current user did not login to the application"** anonymously. Whoever fixes this can use `Npo.Application`
   as the working reference.

## Records created / destroyed

| Record | State |
|---|---|
| Account H `npo.qa.delete.h@example.org` (Person `7c18ac90-…`) | **deleted** — deliberately, as the case requires |
| Draft **APPL26-01572** (`8dd2fdde-…`) | **orphaned** — survives its deleted owner, `npo: null`, status Draft |
| `npo.qa.delete.h@example.org` re-registered as `NpoQaRerego IndiaTest` / `QaRerego#2026` | live, no NPO links |

⚠️ The re-registered account and the orphaned draft are both left in place as evidence. Add them to
`test-data/qa-accounts.md` if either is to be reused.
