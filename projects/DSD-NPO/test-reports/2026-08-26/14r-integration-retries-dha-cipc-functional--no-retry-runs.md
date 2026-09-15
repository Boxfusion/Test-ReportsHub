# Report: NPO-14R-F — Integration retries DHA & CIPC (functional) — retry jobs are enabled, and nothing moves

**Date:** 2026-08-26 06:10 UTC
**Plan:** test-plans/cross-cutting/14r-integration-retries-dha-cipc-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — both cases fail. Across a **79.3 minute** observation window, **not one record in either cohort changed in any way**: nothing became verified, nothing gained a failure reason, and no `lastModificationTime` moved. ⚠️ **Correction (10:55 UTC): three DHA/CIPC retry jobs ARE registered and enabled — both drift notes are CONTRADICTED, not confirmed.** The verdicts stand; the reason is that enabled jobs produce no effect. See the correction section.
**Duration:** ~4800s (dominated by the mandatory observation window)
**Cases:** TC-01, TC-02
**Environment:** QA · admin portal · view mode Latest · 28 933 office bearers, 1 426 organisations carrying a CIPC number
**Accounts used:** `mpenduloizwelinuk@gmail.com`

## Summary
| Total attempted | Passed | Failed | Partial | Blocked |
|---|---|---|---|---|
| 2 | 0 | 2 | 0 | 0 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 Background DHA verification retry runs after 1 hour | #101817 | 🔴 FAILED | 62 unverified office bearers, **0 changed** in 79 minutes; 30 of them have **never** been modified since creation, some for 9 days |
| TC-02 Background CIPC verification retry runs after 1 hour | #101818 | 🔴 FAILED | 13 organisations with a CIPC number, **0 changed**; only **3 of 1 426** are verified register-wide |

## ⚠️ CORRECTION added 2026-08-26 10:55 UTC — the retry jobs DO exist, and are enabled

> **The verdicts below are unchanged — both cases still FAIL.** What changes is the *reason*, and it matters, because
> the original write-up concluded "no retry job exists" and confirmed Thabiso's drift notes. **That conclusion was
> wrong.** The scheduler registry was read later the same day (while working suite 09) and it names them explicitly.

| Job | Cron | Status | Description (verbatim) |
|---|---|---|---|
| **`IdUnverifiedOfficeBearersJob`** | **`0 * * * *` — hourly** | **1 (enabled)** | *(no description)* |
| **`VerifyUnverifiedOfficeBearersJob`** | **`*/5 * * * *` — every 5 min** | **1 (enabled)** | *"Every 5 minutes job to verify unverified office bearers with DHA API. **Processes up to 3 records per run**, checking that persons are alive and above 18 years old."* |
| **`VerifyUnverifiedDirectorsJob`** | **`0 */2 * * *` — every 2 hours** | **1 (enabled)** | *"Every 2 hours job to verify unverified **directors from NPC organizations** with DHA API. Processes all unverified records per run…"* |

**🔴 Both drift notes are therefore CONTRADICTED, not confirmed.**
- TC-01's note reads *"no 1-hour scheduled retry; DHA job halts on exception."* There **is** an hourly job
  (`IdUnverifiedOfficeBearersJob`, `0 * * * *`) **and** a five-minute one, both enabled.
- TC-02's note reads *"no 1-hour scheduled retry for CIPC; user re-submits manually."* There **is** a two-hourly
  directors job for NPC organisations, enabled.

**This makes the finding stronger, not weaker.** The correct statement is not *"no retry exists"* but:

> **Three DHA/CIPC retry jobs are registered and enabled, and across a 79-minute window not one of 75 pinned records
> moved.** At the advertised rate of the 5-minute job alone (3 records per run ≈ 36/hour) roughly 47 of the 62
> unverified office bearers should have been attempted in that window. None were — no verification, no failure
> reason, not even a `lastModificationTime` change.

So the defect is that **enabled jobs are not producing any effect**, which is a far more actionable thing for a
developer than a missing schedule. It also fits the register-wide numbers: `IdVerificationFailureReason` null on all
**28 933** office bearers, and only **3 of 1 426** organisations CIPC-verified.

⚠️ **Job execution history could not be read** to distinguish "not executing" from "executing and matching nothing" —
`ScheduledJobExecution` returns `"GetAllAsync is not implemented for entity of type
Shesha.Scheduler.Domain.ScheduledJobExecution"`. That is the one question a developer with log access can settle
immediately, and it should be asked alongside these results.

---

## Method
Neither case can be driven through a form — there is no user-facing "retry now" control — so both were executed as a
timed **observation window** (see the plan). Cohorts were pinned by **id** at T0 and re-read by the same ids at T2.

| | Value |
|---|---|
| **T0** | 2026-08-26 **04:49:31** UTC |
| **T2** | 2026-08-26 **06:08:49** UTC |
| **Window** | **79.3 minutes** — comfortably beyond the 1 hour both cases specify |

An intermediate read at T0+42min was taken and **deliberately not used to verdict** — it did not yet meet the
one-hour bar the cases state. The verdict below rests only on the 79-minute window.

## Test Cases

### TC-01 — Background DHA verification retry runs after 1 hour and updates OB status (#101817 · TC-14-005) — FAILED

**Precondition satisfied — DHA is up**, and this was tightened on 2026-08-26 12:10 UTC after an apparent tension in
the evidence (if the retry jobs move nothing, what verified the recent records?).

**Resolved: verification is stamped synchronously at creation, by a different path from the retry job.** Of 26 055
id-verified office bearers, **19 297 (74 %) have `lastModificationTime = null`** — so `IsIdVerified` was set at
insert and the row was never updated afterwards. Of the 54 verified since 2026-08-01, **34** are likewise untouched.

So the two statements are consistent and the precondition is stronger than first written: **DHA is reachable and the
synchronous create-time path works — it is the retry path that never revisits records which missed it.** That rules
out "DHA is down" as an explanation for the null result below.

**Cohort:** all 62 office bearers created since 2026-08-01 that are **not** id-verified. Pinned by id.

| Signal | T0 | T2 | Change |
|---|---|---|---|
| Cohort size | 62 | 62 | **0** |
| Members whose `lastModificationTime` moved | — | — | **0** |
| Members that became verified (left the cohort) | — | — | **0** |
| Members never modified since creation | 30 | 30 | **0** |

**🔴 The blocking assertion fails.** Nothing changed. A retry that ran would have to leave *some* trace — a flip to
verified, a failure reason, or at minimum a modification timestamp. None appeared.

The oldest untouched members make the point more sharply than the window alone: office bearers created
**2026-08-17** and **2026-08-21** still carry `lastModificationTime = null`. Given that an hourly job **and** a
five-minute job are both enabled (see the correction above), those records should have been attempted hundreds of
times over. Not one attempt left a trace.

**🔴 A second finding — a failed verification records nothing at all.**
`IdVerificationFailureReason` is a real field on `NpoOfficeBearer`, and it is **null on all 28 933 office bearers in
the register**. So an office bearer that DHA rejected is indistinguishable from one that was never attempted. That
alone would make a retry job unable to tell what needs retrying.

**🔴 Drift note CONTRADICTED — see the correction at the top.** The note reads *"no 1-hour scheduled retry; DHA job
halts on exception."* An hourly job (`IdUnverifiedOfficeBearersJob`) **and** a five-minute one
(`VerifyUnverifiedOfficeBearersJob`, 3 records/run) are both **registered and enabled**. The case still FAILS — but
because enabled jobs move nothing, not because none are scheduled.

---

### TC-02 — Background CIPC verification retry runs after 1 hour and updates application (#101818 · TC-14-006) — FAILED

**Cohort:** all 13 organisations created since 2026-06-01 that carry an `NPCRegistrationNo` but are **not**
`IsCipcRegNumberVerified`. Pinned by id. Oldest member dates 2026-08-06 — 20 days old at T0.

| Signal | T0 | T2 | Change |
|---|---|---|---|
| Cohort size | 13 | 13 | **0** |
| Members whose `lastModificationTime` moved | — | — | **0** |
| Members that became CIPC-verified | — | — | **0** |
| Members that gained directors (`NumberOfOfficeBearers`) | — | — | **0** |

**🔴 Both halves of the expected result fail.** Nothing was retried and no directors were populated.

**The register-wide figure is the strongest evidence here:**

| Measure | Count |
|---|---|
| Organisations carrying an `NPCRegistrationNo` | **1 426** |
| Organisations with `IsCipcRegNumberVerified = true` | **3** |

Three. If a scheduled retry existed in any form, 1 423 organisations have been sitting unverified long enough for it
to have run thousands of times.

**🔴 Drift note CONTRADICTED — see the correction at the top.** `VerifyUnverifiedDirectorsJob` runs every 2 hours
over *"unverified directors from NPC organizations"* and is **enabled**. The case still FAILS — nothing moved.

**📌 On "directors are populated from CIPC".** There is **no `Director` entity** among the 448 in the registry.
Directors arrive as `NpoOfficeBearer` rows, and `NpoApplication.DirectorsVerified` is the assessor's manual checklist
tick — it pairs with `DirectorsVerifiedComment` exactly like `OrganisationNameVerified` — **not** an integration
result. `NumberOfOfficeBearers` was therefore used as the observable, and it did not move on any cohort member.

## 🔑 The build knows how to do this — for a different integration

The same `NpoOrganisation` entity carries a complete verification record for **Nispis**:

| Nispis | DHA | CIPC |
|---|---|---|
| `NispisVerificationStatus` | — | — |
| `NispisVerificationMessage` | — | — |
| **`NispisVerificationTimestamp`** | — | — |
| `NispisVerifiedBy` | — | — |

DHA has only a boolean plus an always-null failure reason; CIPC has only a boolean. **Neither carries an attempt
timestamp or a retry counter**, so even if a job were added there is nowhere to record that an attempt happened or
when. That is worth fixing alongside the job itself, and the Nispis triplet is the pattern to copy.

⚠️ Stated carefully: the absent bookkeeping is **not** what these cases were verdicted on. The verdict rests on the
T0→T2 diff over 75 pinned records. The schema observation explains *why* a retry would be hard to build correctly and
is offered as supporting context.

## Questions for Thabiso
- Is the 1-hour retry specified anywhere beyond FDS 6.1 rules 2b(ii) and 2c(i)? Nothing in the QA build schedules it,
  and both cases are tagged `Drift-Risk` precisely because the code review already suspected this.
- Should a failed DHA verification record a **reason**? The field exists and is null on all 28 933 records.
- Should DHA and CIPC gain an attempt timestamp, as Nispis has?
- **1 426 organisations carry a CIPC number and 3 are verified.** Is CIPC verification wired up at all on QA, or is
  this an environment gap rather than a product defect? That distinction changes the severity.

## Coverage against ADO
| ADO case | Local | Verdict |
|---|---|---|
| #101817 TC-14-005 | TC-01 | 🔴 FAILED |
| #101818 TC-14-006 | TC-02 | 🔴 FAILED |
