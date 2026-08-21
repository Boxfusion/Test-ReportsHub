# DSD-NPO — Daily QA Report · 2026-08-20

**QA:** Nomfanelo Nhleko · **Environment:** QA
**Shareable version (Teams):** https://claude.ai/code/artifact/54c2538d-e8f2-4a38-ba3c-7cbec9aa86dd

## Progress
| Module | New scripts (today) | Overall functional progress |
|---|---|---|
| DSD-NPO | 5 functional test plans authored (13 dereg-admin, 15D, 15E2E, 15W, 15Y); 6 suites executed; **registration E2E restored** and the appeals path diagnosed end-to-end | **145 / 314 executed (~46%)** · 234 imported · smoke **66/70 verdicted** (see note) |

## Suites executed today
- **13** Voluntary deregistration (admin) — detail view passes; the insufficient-documents validation is broken by a missing workflow definition, which blocks the two cases behind it
- **15D** E&A portal sign-in / sign-up — sign-up and sign-in work; the mobile-OTP gate is bypassable, there is no email-verification step, and both sign-in timing and the sign-up mobile check leak whether an account exists
- **15E2E** E&A content lifecycle — both chains stop at their first content step; the two 08-18 blockers re-confirmed still open, with the District cause now pinned to a data-seeding gap
- **15W** E&A accessibility — the app-wide 14W violations recur here, plus E&A-specific keyboard, landmark and label failures
- **15Y** E&A POPIA / security — the public Enquiry form collects personal data with no consent capture; 3 of 4 cases sit outside the black-box remit and are recorded rather than run
- **Registration E2E** — full public registration completed and submitted, then processed on the admin side through OB Compliance and Document Verification to approval; the standing "registration is blocked" finding is **withdrawn**
- **Smoke re-verification** — 7 of the 13 recorded smoke failures re-run ahead of reporting; 1 is no longer a failure, 6 confirmed, 6 outstanding and setup-bound

## Correction to the coverage figure
Smoke has been reported as 68/70. Re-checking the evidence, **66 of 70 carry a recorded verdict** — two cases
(TC-03-004, TC-05-013) were listed in a run's case list but their assertions were never actually exercised, so they
were counted as covered. The two known outstanding cases are unchanged.

## Scope of these results
Everything above was executed against QA by hand across the public and admin portals, on the single broadly-privileged
shared account, so nothing here speaks to role-scoped behaviour. Not run today: the annual-compliance pair
(TC-08-007/011, which need a reporting period the product cannot create), TC-05-029, TC-10-006, TC-13-005 and
TC-14W-001 from the smoke re-verification list, the approve branch of deregistration, and anything behind an appeal.

Per-run detail and evidence are in `test-reports/2026-08-20/`; observations are in `observations/`, and the running
skipped/blocked register keeps the full 314 accounted for.
