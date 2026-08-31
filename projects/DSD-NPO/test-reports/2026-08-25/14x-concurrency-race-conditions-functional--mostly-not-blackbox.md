# Report: NPO-14X-F — Concurrency & race conditions (functional)

**Date:** 2026-08-25 15:55 UTC
**Plan:** test-plans/cross-cutting/14x-concurrency-race-conditions-functional.md
**Execution Mode:** ai-repair (harness build + API verification)
**Result:** NOT EXECUTED (suite) — 0 of 8 verdictable by black-box means: 1 BLOCKED on a safe test NPO (harness proven ready), 7 NOT EXECUTED (backend-only timing, feature absent, or needing owned records in specific states + permission to fire concurrent mutations on shared QA). **No coverage gain — and that is the honest finding about this suite: it is a code-level concurrency register, not a black-box UI suite.** Building the one runnable harness surfaced a **real High bug** in the Link-Existing-NPO flow.
**Duration:** ~500s
**Cases:** TC-14X-001, 002, 003, 004, 005, 006, 007, 008
**Environment:** QA · public + admin portals · accounts A (15944) / B (15945) · admin `mpenduloizwelinuk@gmail.com`

## Summary
| Total | Verdicted | Blocked | Not executed |
|---|---|---|---|
| 8 | 0 | 1 | 7 |

| Case | Verdict | Why |
|---|---|---|
| TC-14X-001 two-admin doc-verification race | ⬜ NOT EXECUTED | needs an owned app at a decision point + two admin identities; double-transition unsafe on shared QA |
| TC-14X-002 submitter-resubmit vs admin decision | ⬜ NOT EXECUTED | needs a paired submitter-app + admin in decidable state |
| TC-14X-003 two users link same NPO | ⛔ BLOCKED | **harness proven ready**; blocked on a safe linkable test NPO |
| TC-14X-004 PersonIdVerifier lock | ⬜ NOT EXECUTED | internal lock, no UI trigger |
| TC-14X-005 two-admin investigator assign | ⬜ NOT EXECUTED | needs an assignable investigation case + two admins |
| TC-14X-006 OB confirmation race | ⬜ NOT EXECUTED | needs pending OB link + admin edit |
| TC-14X-007 bulk reallocation upload | ⬜ NOT EXECUTED | **feature absent** — registry-confirmed |
| TC-14X-008 BackgroundJob vs transaction | ⬜ NOT EXECUTED | backend timing, no client-alignable trigger |

## The honest headline
This suite cannot be "run" as UI regression. Every case is `Src:Code` with a code anchor
(`PersonIdVerifier.cs:48-49`, `ApplicationManager.cs:278-283`), testing a database-level concurrency guard. A
black-box tester reaches at most a proxy of a few, and only where an application already sits in the exact state a
race needs — with permission to fire two conflicting **mutations** at a shared QA environment. Neither condition holds
for us on the records we own. Rather than manufacture a fake pass, the suite is reported as it is: **1 blocked, 7 not
executable by our means**, each with the specific reason, and handed to Thabiso as a candidate for a unit/integration
suite instead.

## TC-14X-003 — the one runnable case, and what it produced

This is the only true concurrency test we could approach: two owned accounts (A, B) linking the **same** NPO at the
same instant. The harness was fully built and proven:

- Both accounts authenticate (A userId 15944, B userId 15945). 🔑 `TokenAuth/Authenticate` needs the header
  **`sha-frontend-application: public-portal`** or it 401s on valid credentials.
- The link flow was traced: modal `dsd-link-existing-npo v13` → `GET /api/services/dsdnpo/Organisations/GetNPOByNpoNumber`.
- 🔑 That lookup endpoint **correctly requires authentication** (401 anonymous). This sharpens yesterday's Class B
  finding: the anonymous-read gap is the **`/api/dynamic/` CRUD layer specifically**, not the whole API — the
  service-layer endpoints under `/api/services/` do enforce auth.

**Why it is BLOCKED, not run:** completing the race means both A and B firing the link-confirm at one NPO — and
linking claims **Authorised Admin** over that organisation. A and B are office bearers of no NPO, and there is no
designated test NPO both may legitimately link. Firing it at a real org would hijack it. Per the plan's safety rule,
the harness is recorded as ready and the case is blocked on a **safe test NPO from Thabiso** — not forced.

## 🔴 What building that harness found — a High bug in Link-Existing-NPO

Resolving an NPO by number to set up the race, the lookup **returned HTTP 500 for 7 of 12 sampled real NPOs**:

```
500  "No row with the given identifier exists[Shesha.Domain.Person#<GUID>]"
```

The NPO is found; the failure is a **missing linked `Person` record** that the code loads eagerly and throws on.
Roughly **58%** of sampled NPOs cannot be looked up — so a user entering their own valid NPO number has a
better-than-even chance of a 500 in the onboarding flow. A non-existent number also 500s (`"Npo Not Found"`), though
the UI catches that one and shows a friendly *"NPO Number Not Found!"*.

Verified reproducible, format-checked (the exact `###-###-NPO` register format is what triggers it), and auth-correct
(500 occurs with a valid token; the endpoint 401s anonymously). Filed as
`bugs/2026-08-25-link-existing-npo-lookup-500-on-orphaned-person.md`. The orphaned-`Person` reference may be fallout
from the same rename/migration behind today's `Npo.AnnualCompliance` alias bug — worth checking together.

## Cases handed to Thabiso as code/integration items
- **004** (PersonIdVerifier lock) and **008** (BackgroundJob vs in-flight transaction) are pure backend timing with
  code anchors — they belong in a unit/integration suite; a UI tester cannot align them.
- **007** (bulk reallocation Excel upload) — **no such screen exists.** The form registry (8 294 forms) has zero
  `reallocat*` matches; the only upload forms are `add-content-file` and `form-import-json`. Either the feature is
  unbuilt or the case is stale.
- **001/002/005/006** need an application/case/OB-confirmation sitting in the precise pre-race state, plus two
  identities and the freedom to fire conflicting writes on shared QA. Achievable only with seeded records on a
  disposable environment.

## Open questions for Thabiso
1. Can you provide a **test NPO number** that A and B are entitled to link? That single input unblocks TC-14X-003 —
   the only black-box-runnable case in the suite.
2. Should **14X be re-homed as a unit/integration suite?** As written it is not black-box-executable; reporting it
   against a UI plan will always read as "not run".
3. The **Link-Existing-NPO 500** (bug filed) breaks a core flow for the majority of NPOs — is the orphaned-`Person`
   data gap known, and is it the same migration issue as the `Npo.AnnualCompliance` alias?

## Evidence
- `14x-concurrency-evidence.json` — harness proof, the 12-NPO lookup tally, per-case verdicts with reasons.
