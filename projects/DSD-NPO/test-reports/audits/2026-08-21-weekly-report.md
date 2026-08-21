# DSD-NPO — Weekly QA Report · week ending 2026-08-21

**QA:** Nomfanelo Nhleko · **Environment:** QA · **Period:** 2026-08-17 → 2026-08-21

**Shareable version (Teams):** https://claude.ai/code/artifact/962cac2e-6bcf-483b-a5e9-3bde9ef86e2e

## Progress
| Module | New scripts (this week) | Overall progress |
|---|---|---|
| DSD-NPO | **23 functional test plans authored** (187 cases imported from ADO plan 101543) | **Smoke plan 101541 — 70 / 70 cases · 100% complete** · **Functional plan 101543 — 145 / 314 cases executed · 46%** (21 of 36 suites) |

## The week's headline: the smoke plan is finished
Smoke closed at **70 of 70 cases verdicted — 100%**, from 66 (94%) at the start of the week. Three things got it
there:

1. **The 13 recorded smoke failures were all re-run before being reported.** This mattered — **two were withdrawn**
   (the investigations filter and the post-registration old/new values both now behave as the case prescribes), and
   **two more had the wrong root cause on file**. The deregistration asset-transfer step was recorded as "no UI at
   all"; it exists, but only under one severance type. The accessibility case was recorded as "errors are not
   announced"; they are announced, and what actually fails is focus handling.
2. **Two cases that had never truly been exercised were executed.** They were the reason coverage read 68/70 when it
   was 66/70 — both appeared in a run's case list without their assertions ever being run.
3. **The annual-compliance pair was found not to be blocked after all** and was executed, rather than being carried
   forward as blocked for a third week.

## Functional suites executed this week — 21 of 36 suites, 145 of 314 cases (46%)
Essentially the whole functional programme was imported and run inside this week: 187 of the plan's 314 cases are now
imported, and 145 of them carry a verdict.

- **Registration (01 · 02 · 03 · 04 · 05)** — sign-in and account creation, NPO linking, and all three wizard bands
  exercised in depth against their validation rules.
- **Application processing (07)** — DSD-side triage, office-bearer compliance and document verification, including a
  fresh application driven end to end.
- **Registration restored end-to-end** — a public application was completed and submitted, then processed on the
  admin side through to approval, producing a registered NPO. The standing *"registration is blocked"* finding was
  **withdrawn**, and a second application was driven to a refusal outcome to confirm both branches.
- **Annual compliance (08)** — reporting threshold and financial validation behaviour.
- **Post-registration (10)** and **Deregistration (13, submitter and admin)** — change-request and exit journeys.
- **Investigations (12)** — public intake and the admin queue.
- **Cross-cutting (14D documents/PDF · 14W accessibility · 14Z security probes)**.
- **Education & Awareness (15A · 15B · 15C · 15D · 15E · 15E2E · 15W · 15Y)** — eight suites covering interventions,
  the content library lifecycle, dashboards, portal sign-in, and the accessibility and POPIA passes.

## Scope of these results
Everything above was executed by hand against QA across the public and admin portals on the single broadly-privileged
shared account, so nothing here speaks to role-scoped behaviour. Not run this week: **appeals (11A / 11P)** — imported
but still blocked for want of an NPO in a refused state; **office-bearer self-confirmation (06)**, which needs real
checkable mailboxes; **annual-compliance backend (09)**; and ten cross-cutting suites that are not yet imported
(notification templates, audit trail, concurrency, integration retries, session/access control, public search and the
POPIA transport pass) — 62 cases in total.

Per-run detail and evidence are in `test-reports/2026-08-17/` → `test-reports/2026-08-21/`; observations are in
`observations/`, and the running skipped/blocked register keeps the full 314 accounted for.
