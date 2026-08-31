# Report: NPO-07-F — Triage / OB Compliance / Doc Verification (functional) — a Registry Clerk reads the entire national applications register

**Date:** 2026-08-27 10:28 UTC
**Plan:** test-plans/application-processing/07-triage-ob-compliance-doc-verification-functional.md
**Execution Mode:** ai-mcp
**Result:** FAILED — the blocking assertion fails. An internal user holding **only `Dsd.Npo.Registry Clerk`** — no `Authorised Admin`, no `System Administrator` — opens **All Applications** by direct URL with **no 403** and is served the register of **10 349 applications**, with an `Export` control. Navigation *is* role-scoped (the account's own sidebar has no CRUDS menu), but route authorisation is not enforced. Anonymous access and public-portal accounts are correctly blocked.

> ### ⚠️ CORRECTION, same day (2026-08-27 11:20 UTC) — the data-exposure half of this report was overstated
> When TC-07-008 was run later the same day, the grid's own API response was inspected. **Every row on the default
> page returns `"npo": null`, and all seven columns other than `Date Received` are projected through `npo { … }` —
> so they render empty.** The `Email Address` and `Whatsapp Number` **column headers** exist; the **values do not**.
>
> **What this report originally claimed and now withdraws:** that a Registry Clerk can read applicant contact details,
> and that this is a POPIA exposure. **Not demonstrated.** No contact data was rendered at any point.
>
> **What survives unchanged** — and is still the failed blocking assertion: the route serves a **200 with no 403** to
> a role-scoped non-admin, exposing the register's existence, its **total count (10 349)**, `Date Received` values,
> internal application **GUIDs**, and an `Export` control that was never activated. The authorisation defect is real;
> the severity is lower than first written. The bug file carries the same correction.
**Duration:** ~600s
**Cases:** TC-13
**Environment:** QA · admin portal · view mode Latest
**Accounts used:** `npo.qa.clerk.d@example.org` (Account D — `Dsd.Npo.Registry Clerk` only), `npo.qa.applicant.b@example.org` (Account B — public applicant), and an unauthenticated session

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 1 | 0 | 1 | 0 | 0 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-13 Non-admin cannot access admin views | #101730 | ❌ FAILED | Registry-Clerk-only account reads all 10 349 applications by direct URL; no 403 |

## 🔑 This case was recorded "NOT EXECUTABLE — needs a non-admin user" — that dependency is gone

The plan's ⛔ was *"we hold only the broadly-privileged shared account, so a success proves nothing"*. Accounts C and D
were self-served on 2026-08-26 (`test-data/qa-accounts.md`). **Account D is the correct instrument for this case** —
it is the only genuinely restricted, non-tribunal internal account we hold, and it deliberately holds one role.

## ⚠️ Two method corrections made during the run

Both are worth recording because either one would have produced a wrong verdict.

1. **I first tested a guessed route and got a 404.** `/dynamic/boxfusion.dsdnpo/all-applications` does not exist.
   Per `dsd-npo-form-registry-is-the-route-list`, a 404 on a guessed route proves nothing. The **real** route was read
   out of the live CRUDS menu: **`/dynamic/boxfusion.dsdnpo/npoapplication`** (menu label *"All Apllications"* —
   the typo is the product's). The CRUDS submenu is a flyout and renders no `<a>` elements until clicked.
2. **Clearing `localStorage` does not log you out.** After clearing storage the session was still live as the shared
   dev account (`Mpendulo ntshangase`) with the full admin nav — the token is not in `localStorage`. The first
   "anonymous" probe was therefore not anonymous at all. Every result below was re-taken after an explicit
   **Logout** through the user menu.

## Per-case detail

### TC-13 — Non-admin cannot access admin views (#101730 · TC-07-020) — FAILED

Three privilege levels were tested against the real route.

| Session | Result at `/dynamic/boxfusion.dsdnpo/npoapplication` | Data exposed |
|---|---|---|
| **Unauthenticated** | Redirected to `/login?returnUrl=%2Fdynamic%2Fboxfusion.dsdnpo%2Fnpoapplication` | none — 0 rows |
| **Account B** (public applicant) | Cannot sign in to the admin portal at all — `POST /api/TokenAuth/Authenticate` → **403** | none |
| **Account D** (`Dsd.Npo.Registry Clerk` only) | ✅ Page renders. **No 403.** | **10 349 applications** |

**Assertion results**

| Assertion | Result |
|---|---|
| (BLOCKING) access denied | ❌ **FAIL** — no 403 for the internal non-admin |
| No data leaks | ❌ **FAIL** — full register served |

#### What Account D actually sees

Signed in as `NpoQaClerk DeltaTest`, the page renders `boxfusion.dsdnpo/npoapplication` v28:

```
All Applications          1-10 of 10349 items    1 2 3 ••• 1035    10 / page    Export
Application Ref | Organisation Name | Whatsapp Number | Email Address | Legal Form |
No. of Office Bearers | Application Status | Date Received
27/09/2025 13:06   17/09/2025 12:30   09/10/2025 10:55   29/09/2025 08:57   …
```

A working pager across **1 035 pages**, ten `Date Received` values, and an `Export` button. The `Export` control was
**not** activated.

⚠️ **Corrected:** the seven columns other than `Date Received` render **empty**, because every row on this page has
`"npo": null` and those columns are projected through `npo { … }` — see the correction box at the top and the
TC-07-008 report. So the exposure is the register's **existence, total count, GUIDs and Date Received values**, not
applicant contact details. `Email Address` / `Whatsapp Number` appear as headers only.

#### The shape of the defect: menu-level scoping without route-level enforcement

Account D's own sidebar contains only **Dashboards · Reports · All NPOs · Workflows** — no CRUDS, so nothing in the
UI offers this page. The gate is navigational only. Anyone who knows or guesses the route bypasses it.

This is the **same defect class already recorded for 11A TC-06** (tribunal decision forms render for Account D with
no 403). That finding is now shown to extend beyond the tribunal forms to the core applications register, which
means the earlier "narrow the wording — the tribunal forms specifically are not role-scoped" caveat should be
widened: **route authorisation is inconsistently applied across the admin portal.** It is genuinely enforced in some
places — Account C gets a clean 403 on `user-management-table` — which makes this a per-page omission rather than a
missing mechanism.

Bug filed: `bugs/2026-08-27-registry-clerk-reads-entire-applications-register-by-direct-url.md`.

## What the plan's ⚠️ note got right, and what it got wrong

The plan warns: *"the API answers anonymously … so any admin-view gating may be moot at the data layer regardless of
the UI"*. Half right, and the distinction matters:

- The **`npoOtpStressTesting` OTP endpoint** does answer anonymously — still true, still filed.
- But the **admin portal itself does not**. Unauthenticated route access redirects to login, and a public-portal
  credential is rejected at `TokenAuth/Authenticate` with a 403. The perimeter holds.

So the exposure is **not** "anyone on the internet". It is "any of the ~46 internal roles", which is a materially
different severity and should be stated that way to the developer rather than as a blanket data-layer claim.

## Notes for the test lead

- Severity question for Thabiso: how many holders do the low-privilege internal roles have? `Dsd.Npo.Registry Clerk`
  showed **6** holders on 2026-08-26. If low-privilege roles are widely assigned in production, this is a
  production-grade data exposure rather than a QA curiosity.
- 📌 Minor, separate: when Account B's admin-portal sign-in was rejected with a 403, **the UI displayed no error at
  all** — no alert, no toast, no field error. The user is simply left on `/login`. Same "client swallows the error"
  pattern as the `UserTaskSave` 403. Logged as an observation, not a bug.
- Only `npoapplication` was tested. The other seven CRUDS routes read from the same menu
  (`annual-compliance`, `appeal-table`, `change-requests`, `investigation-table-view`,
  `allDeregistrationApplications-table`, `npos`, `npocase-spartial-map`) are **untested against Account D** and are
  the obvious next sweep — cheap, and it would size the defect properly.
