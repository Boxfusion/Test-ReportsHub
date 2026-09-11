# DSD-NPO — Weekly QA Report · week ending 2026-08-28

**QA:** Nomfanelo Nhleko · **Environment:** QA · **Period:** 2026-08-24 → 2026-08-28

## Progress
| Module | New scripts (this week) | Overall progress |
|---|---|---|
| DSD-NPO | Functional plan **fully imported — all 36 suites** (the last un-imported suites — 06, 09, 14C, 14N, 14R, 14S, 14U, 14X, 14Y, 14Z — were pulled and authored this week) | **Smoke plan 101541 — 70 / 70 cases · 100%** · **Functional plan 101543 — 220 / 314 cases verdicted · 70.1%** (up from 41% last week) |

### Functional outcomes — the 220 verdicted cases
| Outcome | Cases |
|---|---|
| ✅ Passed | **65** |
| 🔴 Failed | **98** |
| ⚠️ Partial | **57** |
| **Verdicted** | **220** |

Of the remaining 94 cases, **50 are recorded blocked / not-executed with a reason**, and the other **44 are now
fully attributed** (see below) — so **all 314 cases carry a recorded status**. The number above is the conservative
one: blocked, ADO-Closed, smoke-owned and out-of-black-box-remit cases are all excluded from the 220 numerator and
kept in the 314 denominator.

The failure count stays high by design — the functional plan is the negative-path and validation pass, written to
find where the build and the rules disagree; many of the 98 are validation that is advisory rather than enforcing,
or a documented gap awaiting the test lead's call.

## The week's headline: the plan is fully imported and fully accounted for
Two things closed this week that had been open since the module began.

1. **The ADO import is complete — 36 of 36 functional suites.** The last ten cross-cutting suites were pulled from
   Azure DevOps, authored as plans, and executed or dispositioned. There is nothing left to import.
2. **The 44 "unattributed" cases are no longer a black box.** An Azure DevOps sign-in let us pull all 314 case ids
   plus the 70 smoke case ids and reconcile them exactly. The 44 break down as: **3 ADO-Closed**, **9 smoke-owned
   duplicates** (already covered by the 70/70 smoke plan), **21 out of the black-box remit** (code-inspection,
   transport/logging, and direct-API cases that belong to dev/security), **5 calendar-blocked**, **2 not executable
   as written** (they need a DHA/ID field the build does not have), **1 not confirmable from the test environment**,
   and **1 blocked**. That leaves exactly **2 cases that are genuinely runnable black-box and not yet done**. In
   other words, the true untested-and-doable surface of the whole 314-case plan is two cases.

## What was executed this week
- **Appeals (11A / 11P)** unblocked and run — the submitter journey was completed end to end in Live mode after a
  standing "no route" reading was retired.
- **Annual-compliance backend (09)**, **office-bearer self-confirmation (06)**, **notifications (14N / 14T)**,
  **integration retries (14R)**, **audit trail (14U)**, **session/access control (14C)**, **security (14Z)**,
  **accessibility (14W)** and **POPIA (14Y)** cross-cutting suites executed or dispositioned.
- **Investigations (12)** — the public whistleblowing intake, recorded broken a week ago, was found **rebuilt** and
  driven end to end against our own QA NPO; the admin lifecycle (validate → assign → investigate → close) was mapped
  and traversed through validate and assignment.
- A running **coverage baseline script** keeps the 220 / 314 reproducible rather than carried forward, and a
  **skipped/blocked register** keeps all 314 accounted for.

## Scope of these results
Everything above was executed by hand against QA across the public and admin portals, chiefly on the shared
broadly-privileged account plus a small set of self-served role-scoped accounts created for the access-control and
appeals work. Two cases remain genuinely runnable but were not completed this week because each needs a specific
setup state built first — a wizard draft advanced to its Documents step (upload-allowlist case) and an editable
annual-compliance submission (the audited-firm conditional). The investigation *close* and *reviewer-feedback* steps
are role-gated to the assigned investigator and reviewer, so they need those role accounts to sign in and complete
them rather than the triage account. Per-run detail and evidence are in `test-reports/2026-08-24/` →
`test-reports/2026-08-28/`; the full reconciliation of the 314 is in
`test-reports/audits/2026-08-28-unattributed-44-reconciliation.md`; observations and open questions for the test
lead are in `observations/`.

## Open questions for the test lead (Thabiso)
A consolidated set is in `observations/2026-08-28-report-notes-and-questions.md`. The ones that most affect the
numbers and the risk picture:

- **Link-to-Existing-NPO has no identity verification** and discloses an NPO's authorized-person contact details to
  any authenticated requester by number — both an account-takeover vector and a POPIA disclosure. (Security item;
  bug filed with no real identifiers.)
- **Uploaded documents download with no authentication** by file id — the strongest instance of the standing
  unauthenticated-access finding.
- **A "Read only" role is not seeded** (the registry holds 46 roles, none matching), so the read-only access-control
  case tests a seed that was never shipped.
- **Office-bearer self-confirmation and updates are not written to the audit trail**, though application updates are.
- Whether the annual-compliance reminders, the OB-confirmation status transitions (13/16), and a seeded synthetic
  NPO for investigation filing can be arranged — each currently blocks a small cluster.

Nothing in this report speaks to the smoke plan, which closed at 70 / 70 on 21 August. The module should not be
described as stable on the strength of 70.1%: the failure count is high, and the wizard, notification, audit,
authorisation and NPO-linking areas each carry open defects that are with the test lead for disposition.
