# 🔴 High — A Registry-Clerk-only account reads the entire applications register by direct URL

**Raised:** 2026-08-27
**Found in:** NPO-07-F TC-13 (ADO #101730 · TC-07-020)
**Environment:** QA · admin portal · `boxfusion.dsdnpo/npoapplication` v28 (LIVE) · view mode Latest
**Specimen:** Account D `npo.qa.clerk.d@example.org`, holding **`Dsd.Npo.Registry Clerk` and nothing else** (no `Authorised Admin`, no `System Administrator`)
**Severity:** 🔴 High — a low-privilege internal role can enumerate 10 349 applications including third-party contact details

## What happens

Navigating directly to:

```
https://dsd-npo-adminportal-qa.shesha.app/dynamic/boxfusion.dsdnpo/npoapplication
```

as Account D returns the **All Applications** register in full. There is no 403, no redirect, no partial view.

```
All Applications          1-10 of 10349 items    1 2 3 ••• 1035    10 / page    Export
Application Ref | Organisation Name | Whatsapp Number | Email Address | Legal Form |
No. of Office Bearers | Application Status | Date Received
```

- **10 349** records, pageable across **1 035** pages
- an **`Export`** control is offered (not activated during testing — see below)
- internal application **GUIDs** and `Date Received` values are rendered

⚠️ **CORRECTION (same day, 11:20 UTC).** An earlier version of this bug said two columns expose applicant contact
details (`Email Address`, `Whatsapp Number`) and called it a POPIA exposure. **That is withdrawn.** Inspecting the
grid's own API response shows every row on this page returns `"npo": null`, and all seven columns other than
`Date Received` are projected through `npo { … }` — so they render **empty**. The headers exist; the values do not.
No contact data was ever displayed. The authorisation defect below is unaffected; only its severity changes.

Account D's own sidebar contains only **Dashboards · Reports · All NPOs · Workflows** — there is no CRUDS menu, so
nothing in the UI ever offers this page to that user. **The restriction is navigational only.**

## The gate that is missing is present elsewhere

This is not an absent mechanism, it is a per-page omission — which is what makes it fixable and worth reporting
precisely:

| Route | Account | Result |
|---|---|---|
| `user-management-table` | Account C (2 roles, no Authorised Admin) | ✅ clean 403 *"Sorry, you are not authorized to access this page"* |
| `npoapplication` | Account D (1 role, no Authorised Admin) | ❌ **renders in full** |
| `appeal-outcome`, `forward-arbitration-tribunal` | Account D | ❌ render (already filed via 11A TC-06) |

So route authorisation exists and works. It has simply not been applied to the CRUDS pages.

## What is *not* wrong — the perimeter holds

Stated explicitly so severity is not overestimated:

| Session | Result |
|---|---|
| Unauthenticated | Redirected to `/login?returnUrl=%2Fdynamic%2Fboxfusion.dsdnpo%2Fnpoapplication`, no data |
| Public-portal account (Account B) | Cannot authenticate to the admin portal — `POST /api/TokenAuth/Authenticate` → **403** |

The exposure is to **internal users of any of the ~46 roles**, not to the public internet. That is materially
different from the standing "the API answers anonymously" finding
(`bugs/2026-08-18-api-reachable-without-authentication.md`), which concerns a different endpoint.

## Why it matters

- **Statutory data at clerk level.** The register covers every NPO registration application in the country. A role
  named *Registry Clerk* plausibly has a legitimate need to see *some* applications — the defect is that it sees
  **all** of them, with no scoping to allocation, region, or case ownership.
- **Enumeration.** The register's total volume, per-application internal GUIDs and receipt dates are readable by a
  user the UI treats as unprivileged, and an `Export` control is offered. What an export actually contains was not
  tested. (The contact-detail claim is withdrawn — see the correction above.)
- **The menu is doing security work it cannot do.** Hiding a nav item is not access control. Any bookmark, shared
  link, browser history entry, or guessed route defeats it.

## Reproduction

1. Sign in to the **admin portal** as `npo.qa.clerk.d@example.org` (`Dsd.Npo.Registry Clerk` only).
2. Confirm the sidebar shows no **CRUDS** menu.
3. Navigate directly to `/dynamic/boxfusion.dsdnpo/npoapplication`.
4. Observe the register renders, pager reads `1-10 of 10349 items`.

⚠️ **Two traps when reproducing this** — both cost time during the run:

- `/dynamic/boxfusion.dsdnpo/all-applications` is **not** the route and returns a 404. The real route is
  `npoapplication`; the menu label is *"All Apllications"* (product typo). Read routes from the CRUDS flyout, which
  renders no anchors until clicked.
- **Clearing `localStorage` does not sign you out** — the token is not held there. An apparent "anonymous" test can
  silently still be the shared dev account with full admin rights. Use the user-menu **Logout**.

## Suggested next step before triage

Only `npoapplication` was tested. The other CRUDS routes are untested against Account D and would size the defect
in minutes:

```
annual-compliance · appeal-table · change-requests · investigation-table-view
allDeregistrationApplications-table · npos · npocase-spartial-map
```

## Question for the test lead

`Dsd.Npo.Registry Clerk` showed **6** holders on 2026-08-26. How widely are the low-privilege internal roles assigned
in production? If they are given out freely, this is a production data-exposure issue rather than a QA-environment
finding.

## Not done deliberately

The `Export` button was **not** clicked. Activating it would download a bulk file of third-party personal
information, and the pager plus rendered rows already prove the exposure. If triage wants the export scope confirmed,
that should be a decision taken knowingly rather than a side effect of testing.
