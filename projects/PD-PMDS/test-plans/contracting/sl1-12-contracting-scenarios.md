# PMDS SL 1-12 — Contracting: 2 positive + 3 negative scenarios

**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
(cycle id `7cf9054b-8c69-4313-ae5c-8039bf495c04`, 44 employees)
**App:** HCM Admin Portal, PMDS module — https://pd-hcm-adminportal-qa.shesha.app/
**Spec:** `sl1-12-contracting-scenarios.spec.ts` (derived — this plan is canonical)
**Helpers:** `pmds.ts`

## Purpose

Drive 5 SL 1-12 employees through the full Contracting stage, covering the scenario mix requested
for this run: **2 positive** (plain happy path) and **3 negative** (dispute variants), using the
same taxonomy this project already established for the SL 1-12 Mid-Year suite
(`test-reports/2026-08-11/sl1-12-midyear-assessments.md`):

| Scenario | Employee | Branch |
|---|---|---|
| Positive 1 | Simmy Mthalane | Draft → Submit → Sign → Verify → Generate PERSAL Input |
| Positive 2 | Tony Dayimane | Draft → Submit → Sign → Verify → Generate PERSAL Input |
| Negative 1 | Jabu Hadebe | Refer for Dispute → mediator **resolved** → Update with Outcomes → Verify |
| Negative 2 | Sanele Sithole | Refer for Dispute → mediator **not resolved** → tier-2 **resolved** → Update with Outcomes → Verify |
| Negative 3 | Adam Apple | Refer for Dispute → mediator **not resolved** → tier-2 **not resolved** → terminal, no downstream task |

Reporting chain for all five (the intern cohort): employee → supervisor **Lungile Nhleko**
(`LungileN`) → mediator **Babalwa M** (`BabalwaM`) → tier-2 escalation **Sampha Sampha**
(`Sampha`, Babalwa's own supervisor) → HR **Sales HR** (`SalesHR`).

## Roles and logins

| Role | Login | Password |
|---|---|---|
| Admin | `admin` | `P@ssw0rd` |
| Simmy Mthalane (Positive 1) | `Simmy` | `123qwe` |
| Tony Dayimane (Positive 2) | `TonyD` | `123qwe` |
| Jabu Hadebe (Negative 1) | `JabuH` | `123qwe` |
| Sanele Sithole (Negative 2) | `SaneleS` | `123qwe` |
| Adam Apple (Negative 3) | `adam` | `123qwe` |
| Supervisor | `LungileN` | `123qwe` |
| Mediator | `BabalwaM` | `123qwe` |
| Tier-2 escalation | `Sampha` | `123qwe` |
| HR | `SalesHR` | `123qwe` |

## Fixtures

- **Scoring:** 4 KRAs at 25% each (100% total), each tagged with a Batho Pele Principle. 4 Generic
  Assessment Factors ticked (SL 1-12 uses the 10-GAF list, ticked by row position — the grid is
  paged and unordered).
- **Workplan:** 2 key activities per KRA (8 total).
- **PDP:** 1 development area, commencing 30/09/2026.
- **Summary:** both attestation checkboxes ticked before Submit.
- **Mediation evidence (negative 2/3 "not resolved" branches):** `test-data/mediation-outcome.txt`.

## Test cases

### Admin — process opened

**TC-00 — Contracting is opened for the full population**
1. NAVIGATE and log in as `admin`
2. NAVIGATE to the SL 1-12 cycle details, click **Open process**
3. TYPE Submission Date to HR `31/08/2026`, Closing Date `30/09/2026`, select *Initiate the
   workflows immediately*, click **Open Process**
4. ASSERT after a hard refresh: Contracting reads **IN PROGRESS**, `44 Total / 0 Not Started / 44
   In progress` *(BLOCKING)*

### TC-01 — Positive 1: Simmy Mthalane, plain happy path
1. NAVIGATE and log in as `Simmy`
2. CLICK the **Initiate Performance Agreement** task (PA2026/6767)
3. TYPE the full agreement (4 KRAs @ 25%, 4 GAFs, 8 key activities, 1 PDP), tick both attestations
4. CLICK **Submit**; ASSERT the task leaves the employee's inbox
5. NAVIGATE and log in as `LungileN`; CLICK the Review task for Simmy; TYPE a review comment; CLICK
   **Sign**; ASSERT the task routes onward *(BLOCKING)*
6. NAVIGATE and log in as `SalesHR`; CLICK the Verify task for Simmy; tick the confirmation; CLICK
   **Verify**; ASSERT the task clears the HR inbox

### TC-02 — Positive 2: Tony Dayimane, plain happy path
Same steps as TC-01 for `TonyD` (PA2026/6755).

### TC-03 — Negative 1: Jabu Hadebe, resolved dispute
1. Draft and submit as `JabuH` (PA2026/6723)
2. As `LungileN`, CLICK **Refer for Dispute**, TYPE a reason, confirm **Yes**; ASSERT the task
   leaves the supervisor's inbox *(BLOCKING)*
3. As `BabalwaM`, open the **Mediator Review Disagreement** task; SELECT *"The disagreement has
   been resolved"*; TYPE a mediation note; CLICK **Submit**
4. As `JabuH`, open **Update Performance Agreement with Outcomes**; visit every tab; tick the
   confirmation; CLICK **Submit**
5. As `LungileN`, open **Review Updated Performance Agreement with Outcomes**; tick the
   confirmation; CLICK **Approve**
6. As `SalesHR`, tick the confirmation and CLICK **Verify**; ASSERT the HR inbox clears
   *(BLOCKING)*

### TC-04 — Negative 2: Sanele Sithole, escalated dispute resolved at tier 2
1. Draft and submit as `SaneleS` (PA2026/6765)
2. As `LungileN`, **Refer for Dispute** with a reason
3. As `BabalwaM`, open the mediator task; SELECT *"The disagreement has not been resolved"*;
   ASSERT the mandatory Comments and Attachments fields are revealed *(BLOCKING)*; TYPE the
   outcome comment, upload `test-data/mediation-outcome.txt`, CLICK **Submit**
4. As `Sampha`, ASSERT a **Mediator Supervisor Review Disagreement and attempts to resolve** task
   exists for Sanele *(BLOCKING)*; SELECT *"has been resolved"*; TYPE a note; CLICK **Approve**
5. As `SaneleS`, **Update Performance Agreement with Outcomes** → Submit
6. As `LungileN`, **Review Updated Performance Agreement with Outcomes** → Approve
7. As `SalesHR`, tick confirmation → **Verify**; ASSERT the HR inbox clears *(BLOCKING)*

### TC-05 — Negative 3: Adam Apple, escalated dispute unresolved at both tiers
1. Draft and submit as `adam` (PA2026/6709)
2. As `LungileN`, **Refer for Dispute** with a reason
3. As `BabalwaM`, SELECT *"has not been resolved"*; TYPE comment + attach
   `test-data/mediation-outcome.txt`; CLICK **Submit**
4. As `Sampha`, open the tier-2 task; SELECT *"has not been resolved"*; TYPE comment + attach the
   same fixture; CLICK **Approve**
5. ASSERT no downstream task exists for Adam in the employee's, supervisor's, or HR's inbox
   *(BLOCKING)* — the agreement parks terminal at *Under appeal / Dispute Unresolved*

### Admin — final recount

**TC-06 — The Contracting dashboard counts all 5 scenarios as completed**
1. NAVIGATE and log in as `admin`; reload the SL 1-12 cycle details
2. ASSERT `0 Not Started`, `39 In progress`, **`5 Completed`** *(BLOCKING)* — Adam's terminal
   *Dispute Unresolved* counts here (Contracting counts that terminal; Mid-Year does not, per
   `observations/2026-08-11-contracting-completed-tile-count.md`)

## Known issues this plan deliberately records

- Guard rails (KRA weight/GAF minimum, workplan key-activity minimum, attestations, HR
  confirmation) are enforced by disabling controls, not by messages — see
  `contracting-lifecycle.md`'s *Known issues* for the full write-up; not re-litigated per-TC here
  since this run's negative coverage is scenario-level (dispute outcomes), not field-validation.
- The GAF grid is paged and unordered — ticked by row position, not by name.
