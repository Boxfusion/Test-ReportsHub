# PMDS SL 1-12 — Contracting Lifecycle (positive and negative)

**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal, PMDS module — https://pd-hcm-adminportal-qa.shesha.app/
**Spec:** `contracting-lifecycle.spec.ts` (derived — this plan is canonical)
**Helpers:** `pmds.ts` (selector layer, captured live 2026-08-02)

## Purpose

Cover the **whole Contracting stage** of the SL 1-12 Performance Agreement in one chain — every
branch the workflow can take, and the validation that guards each one:

| Branch | Outcome |
|---|---|
| Happy path | employee Draft → supervisor **Sign** → HR **Verify** → Generate PERSAL Input |
| Send back | supervisor **Send back** → employee re-submit → Sign → Verify → Generate PERSAL Input |
| Dispute resolved | supervisor **Refer for Dispute** → mediator **resolved** → employee **Update with Outcomes** → supervisor approve → HR Verify |
| Dispute unresolved | supervisor **Refer for Dispute** → mediator **not resolved** (comment + attachment) → parks at Under appeal |

Negative coverage sits on the guard rails rather than on invented bad data: the draft wizard
disables **Next**/**Submit** until each stage's business rules are met, and the reviewer actions
are gated by mandatory comments and confirmations.

## Roles and logins

| Role | Login | Password |
|---|---|---|
| Admin | `admin` | `P@ssw0rd` |
| Employee — happy path | `Simmy` (Simmy Mthalane) | `123qwe` |
| Employee — validation + send back | `SaneleS` (Sanele Sithole) | `123qwe` |
| Employee — dispute resolved | `JabuH` (Jabu Hadebe) | `123qwe` |
| Employee — dispute unresolved | `adam` (Adam Apple) | `123qwe` |
| Supervisor | `LungileN` (Lungile Nhleko) | `123qwe` |
| Mediator | `BabalwaM` (Babalwa M) | `123qwe` |
| HR | `SalesHR` (Sales HR) | `123qwe` |

Reporting line under test: interns → **Lungile Nhleko** → **Babalwa M** → Tania. The mediator is
defaulted to the supervisor's supervisor, so every draft must default to Babalwa M.

## Fixtures — the agreement each employee captures

- **Scoring:** 4 KRAs at 25% each (100% total), each tagged with a Batho Pele Principle —
  Service Standards / Access / Courtesy / Value for Money. 4 Generic Assessment Factors ticked.
- **Workplan:** 2 key activities per KRA (8 total), each with Target, Timeframe = Quarterly,
  Target Date 30/09/2026, Resource Required, Enabling Condition and Source of Evidence.
- **PDP:** 1 development area under *Areas of Development and Formal Training*, commencing 30/09/2026.
- **Summary:** both attestation checkboxes ticked before Submit.

## Test cases

### Admin

**TC-01 — Contracting stage is open with the full employee population in progress**
1. NAVIGATE to the portal and log in as `admin`
2. NAVIGATE to the SL 1-12 Performance Agreement FY2026/27 cycle details
3. ASSERT the Contracting stage reads **IN PROGRESS** *(BLOCKING)*
4. ASSERT Not Started is **0**
5. ASSERT In Progress + Completed equals Total

### Employee draft wizard — validation and submit (Sanele Sithole)

**TC-02 — Confirm Details defaults the supervisor and mediator from the reporting line**
1. ASSERT the wizard opens on **Confirm Details** *(BLOCKING)*
2. ASSERT Default Supervisor is **Lungile Nhleko**
3. ASSERT Default Mediator is **Babalwa M** (the supervisor's supervisor)
4. CLICK **Next** to advance to Scoring

**TC-03 — NEGATIVE: Next stays disabled while the KRA weights total less than 100%**
1. ASSERT **Next** is disabled with an empty KRA table *(BLOCKING)*
2. TYPE three KRAs at 25% each
3. ASSERT the running total reads **75**
4. ASSERT **Next** is still disabled — an under-weighted agreement must not proceed

**TC-04 — NEGATIVE: Next stays disabled at 100% until the minimum 4 GAFs are checked**
1. TYPE the fourth KRA so the total reaches 100%
2. ASSERT fewer than 4 GAFs are checked
3. ASSERT **Next** is disabled while the GAF minimum is unmet *(BLOCKING)*

**TC-05 — Scoring completes once 4 KRAs total 100% and 4 GAFs are checked**
1. CLICK 4 Generic Assessment Factors
2. ASSERT 4 GAFs are checked
3. ASSERT **Next** is now enabled *(BLOCKING)*
4. CLICK **Next** to advance to Workplan Agreement

**TC-06 — NEGATIVE: the workplan cannot be left with fewer than 2 key activities per KRA**
1. ASSERT the workplan renders one section per KRA (4)
2. TYPE a single key activity against the first KRA
3. CLICK **Next**
4. ASSERT the wizard stays on Workplan Agreement *(BLOCKING)*
5. RECORD whether the refusal is explained to the user — see *Known issues*

**TC-07 — Workplan advances once every KRA has 2 key activities**
1. TYPE key activities until each of the 4 KRAs has 2
2. ASSERT 8 key activities in total
3. CLICK **Next** to advance to the Personal Development Plan

**TC-08 — A development area can be added to the Personal Development Plan**
1. CLICK **Add PDP** and capture a development area
2. ASSERT the PDP row is listed
3. CLICK **Next** to reach the Completed Summary

**TC-09 — NEGATIVE: Submit is disabled until both attestations are confirmed**
1. ASSERT the summary exposes both attestation checkboxes
2. ASSERT **Submit** is disabled with neither ticked *(BLOCKING)*
3. CLICK the first attestation only
4. ASSERT **Submit** is still disabled with one of two ticked

**TC-10 — The employee submits the performance agreement for supervisor review**
1. CLICK both attestation checkboxes
2. ASSERT **Submit** is enabled *(BLOCKING)*
3. CLICK **Submit**
4. ASSERT the task has left the employee's inbox

### Supervisor send back and re-submit (Sanele Sithole)

**TC-11 — NEGATIVE: Refer for Dispute cannot be confirmed without a reason**
1. NAVIGATE and log in as `LungileN`
2. CLICK the **Review Performance Agreement** task for Sanele
3. ASSERT **Sign**, **Send back** and **Refer for Dispute** are all offered *(BLOCKING)*
4. CLICK **Refer for Dispute** to open the confirmation dialog
5. ASSERT **Yes** is disabled while no reason has been captured *(BLOCKING)*
6. TYPE a reason and ASSERT **Yes** becomes available
7. CLICK **No** — this agreement follows the send-back path instead

**TC-12 — The supervisor sends the agreement back to the employee**
1. CLICK **Send back**, choose the user task to return to, TYPE a comment, CLICK **OK**
2. ASSERT the task has left the supervisor's inbox

**TC-13 — The employee receives the returned agreement and re-submits it**
1. NAVIGATE and log in as `SaneleS`
2. ASSERT the returned agreement is back in the employee's inbox *(BLOCKING)*
3. CLICK the task, confirm the attestations and CLICK **Submit**
4. ASSERT the employee's inbox is clear again

**TC-14 — The supervisor signs the re-submitted agreement**
1. NAVIGATE and log in as `LungileN`
2. CLICK the Review task for Sanele
3. TYPE a review comment and CLICK **Sign**
4. ASSERT the task has left the supervisor's inbox *(BLOCKING)*

**TC-15 — NEGATIVE: HR cannot verify until the confirmation is ticked, then verification completes**
1. NAVIGATE and log in as `SalesHR`
2. CLICK the **Verify Performance Agreement** task for Sanele
3. ASSERT **Verify** is disabled before the confirmation checkbox is ticked *(BLOCKING)*
4. CLICK the confirmation checkbox and ASSERT **Verify** becomes available
5. CLICK **Verify**
6. ASSERT the task has cleared the HR inbox

### Happy path to Generate PERSAL Input (Simmy Mthalane)

**TC-16 — The employee drafts and submits the performance agreement**
1. NAVIGATE and log in as `Simmy`
2. CLICK the **Initiate Performance Agreement** task
3. ASSERT the reporting line defaults are correct
4. TYPE the full agreement (scoring, workplan, PDP) and CLICK **Submit**
5. ASSERT the task has left the employee's inbox *(BLOCKING)*

**TC-17 — The supervisor signs the agreement without changes**
1. NAVIGATE and log in as `LungileN`
2. CLICK the Review task for Simmy
3. TYPE a review comment and CLICK **Sign**
4. ASSERT the task has routed onwards *(BLOCKING)*

**TC-18 — HR verifies the agreement and it reaches Generate PERSAL Input**
1. NAVIGATE and log in as `SalesHR`
2. CLICK the Verify task for Simmy
3. CLICK the confirmation checkbox and CLICK **Verify**
4. ASSERT the task has cleared the HR inbox *(BLOCKING)*

### Dispute referred for mediation (Jabu Hadebe, Adam Apple)

**TC-19 — Jabu submits an agreement the supervisor will dispute**
1. NAVIGATE and log in as `JabuH`
2. CLICK the Initiate task and complete the draft
3. ASSERT the task has left the employee's inbox *(BLOCKING)*

**TC-20 — The supervisor refers Jabu's agreement for mediation**
1. NAVIGATE and log in as `LungileN`
2. CLICK the Review task for Jabu
3. CLICK **Refer for Dispute**, TYPE the reason and confirm
4. ASSERT the agreement has left the supervisor's inbox *(BLOCKING)*

**TC-21 — Adam submits and his agreement is also referred for mediation**
1. Complete and submit Adam's draft as `adam`
2. As `LungileN`, CLICK **Refer for Dispute** on Adam's agreement with a reason
3. ASSERT the agreement has left the supervisor's inbox *(BLOCKING)*

**TC-22 — Both disputes are routed to the mediator**
1. NAVIGATE and log in as `BabalwaM`
2. ASSERT the mediator holds a mediation task for each disputed agreement *(BLOCKING)*

### Dispute outcomes (mediator)

**TC-23 — The mediator records Jabu's disagreement as resolved**
1. CLICK the mediation task for Jabu
2. SELECT **The disagreement has been resolved**, TYPE the mediation outcome
3. CLICK **Submit**
4. ASSERT the agreement routes back to the employee as **Update Performance Agreement** *(BLOCKING)*

**TC-24 — The employee updates the agreement with the dispute outcome and it completes**
1. NAVIGATE and log in as `JabuH`
2. CLICK the **Update Performance Agreement** task and visit every tab so the data hydrates
3. CLICK the confirmation and CLICK **Submit**
4. As `LungileN`, approve the updated agreement
5. As `SalesHR`, CLICK the confirmation and CLICK **Verify**
6. ASSERT the resolved-dispute branch reaches Generate PERSAL Input *(BLOCKING)*

**TC-25 — NEGATIVE: an unresolved mediation requires both a comment and an attachment**
1. NAVIGATE and log in as `BabalwaM`
2. CLICK the mediation task for Adam
3. SELECT **The disagreement has not been resolved**
4. ASSERT the mandatory Comments and Attachments fields are revealed *(BLOCKING)*
5. TYPE the outcome comment, upload `test-data/mediation-outcome.txt` and CLICK **Submit**

**TC-26 — An unresolved dispute parks the agreement with no downstream task**
1. ASSERT the mediator has no remaining task for Adam *(BLOCKING)*
2. ASSERT the employee has no task
3. ASSERT HR has no task for that agreement

### Admin

**TC-27 — The Contracting dashboard counts the agreements driven to completion**
1. NAVIGATE and log in as `admin`
2. NAVIGATE to the cycle dashboard
3. ASSERT the Completed counter has increased and In Progress + Completed still equals Total *(BLOCKING)*

## Known issues this plan deliberately records

- **Workplan validation is silent.** With fewer than 2 key activities on a KRA, **Next** does
  nothing — no toast, no inline error, no banner. The block is correct; the absence of feedback is
  not. TC-06 asserts the block and records the (missing) message rather than failing on it.
- **Re-opening a stage resets completed employees to Not Started**
  (`test-reports/bugs/2026-07-16-reopen-process-resets-completed-status.md`). Do not re-open
  Contracting after a run — TC-01 verifies the stage is already open instead of opening it.
- The GAF grid is **paged and unordered** — the visible 10 factors differ between loads, so GAFs
  are ticked by row position, not by name.
- Draft-wizard **Next** transitions are slow and give no spinner; the helpers wait generously.
