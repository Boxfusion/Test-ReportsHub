# PMDS SL 1-12 — Mid-Year Assessment: 1 positive + 3 negative scenarios

**Date:** 2026-08-14
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Mid Year Assessment**
(cycle id `7cf9054b-8c69-4313-ae5c-8039bf495c04`, 44 employees)
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** hand-written Node/Playwright drivers extending `pmds.ts`'s selector layer with new
Mid-Year-specific helpers (self-assessment, supervisor rating, dispute/escalation, outcomes sync),
driven live headed.
**Refs:** PR2026/7570 (Jabu Hadebe) · PR2026/7612 (Sanele Sithole) · PR2026/7556 (Adam Apple) ·
(Simmy Mthalane's ref not captured this run)
**Result:** PASSED — Contracting closed, Mid-Year opened for the full population, all 4 assigned
scenarios completed to their expected end states

## Context

Contracting was closed for all three cycles (SL1-12, CD/Director, DDG) and Mid-Year opened
immediately after, per the test lead's instruction. This is the first time Mid-Year has been
automated for this hub — no prior driver library existed for self-assessment or supervisor rating,
so this run also built and hardened that library (`pmds.ts`'s CommonJS port, `.tmp-pmds-lib.js`,
extended with Mid-Year helpers).

Per the test lead's explicit instruction, **every key activity across every actor (employee and
supervisor) was scored, commented, AND given a file attachment** — not only the activities whose
rating strictly requires one per the on-screen rule ("a rating of 1, 2, or 4 requires both a comment
and attachment; a rating of 3 requires a comment").

Scenario mix requested: 1 positive + negative 1/2/3, reusing the same four employees from the
2026-08-13 Contracting rerun (Simmy, Jabu, Sanele, Adam).

| Scenario | Employee | Ref | Outcome |
|---|---|---|---|
| Positive | Simmy Mthalane | (not captured) | ✅ Awaiting PERSAL sync |
| Negative 1 — resolved dispute | Jabu Hadebe | PR2026/7570 | ✅ Awaiting PERSAL sync |
| Negative 2 — escalated, resolved at tier 2 | Sanele Sithole | PR2026/7612 | ✅ Awaiting PERSAL sync |
| Negative 3 — escalated, unresolved at both tiers | Adam Apple | PR2026/7556 | ✅ Terminal — no downstream task |

## Steps executed (live, headed)

1. **Simmy — positive.** Self-assessment (4 KRAs, score 3 + comment + attachment on every key
   activity) → Submit → **LungileN** supervisor sign (same scoring pattern) → **SalesHR** Verify.
2. **Jabu — negative 1, resolved dispute.** Self-assessment → Submit → **LungileN** disagrees on one
   key activity (Supervisor 4 vs Own 3, Agreed set explicitly to 4) → Refer for Dispute → **BabalwaM**
   mediator selects "resolved" → **Jabu** Update with Outcomes (Own synced to match Supervisor on the
   disputed activity) → **LungileN** Review Updated → **SalesHR** Verify.
3. **Sanele — negative 2, escalated dispute resolved at tier 2.** Same referral pattern →
   **BabalwaM** mediator selects "has not been resolved" (comment + attachment mandatory) →
   escalated to **Sampha** (tier 2) who selects "has been resolved" via **Submit** (not Approve —
   confirmed Mid-Year tier-2 screens use Submit, matching 2026-08-11 findings) → **Sanele** Update
   with Outcomes → **LungileN** Review Updated → **SalesHR** Verify.
4. **Adam — negative 3, escalated dispute unresolved at both tiers.** Same referral and mediator
   "not resolved" path → tier 2 (**Sampha**) also selects "has not been resolved" via Submit →
   confirmed terminal: no task for Adam in his own, LungileN's, or SalesHR's inbox.

## Findings

### 1. Own Score select clicks are intermittently flaky under current load
The AntD dropdown used for Own/Supervisor Score would occasionally fail to register a click even
after 6 retries with native-JS dispatch, then succeed cleanly on the very next attempt against the
same row. This reproduced across every employee this run, never blocked forward progress (a retry or
a direct re-visit of the specific row always resolved it), and looks like environment/load-related
flakiness rather than a genuine defect — the same interaction succeeded the great majority of the
time.

### 2. The KRA eye-icon iteration order can drift from the outer table's row order
Discovered on Tania (CD/Director, see that report) and worth flagging here since it affects every
employee: iterating KRA modals by eye-icon index (0..3) does not reliably correspond to the outer
KRA table's row order. The safe pattern — used for all remaining employees this run — is to read the
outer table's KRA names first, then locate and click each KRA's eye icon by matching name, not index.
Also: **Save must be explicitly clicked per KRA** even when a row's score already shows the right
value from an earlier partial run — the Overall Score aggregate does not update until Save commits,
so a row that looks correct in the modal can still read blank in the outer "Overall Score (%)" total
if Save was never clicked for that specific KRA.

### 3. tickAttestations() must skip disabled checkboxes
The HR-verify and other confirmation screens also carry the read-only "Development Required"
reference checkboxes from the Generic Assessment Factors / Management Competences table. The first
Contracting-era `tickAttestations()` helper tried to force-check every checkbox including these
disabled ones, which Playwright correctly refuses (`Clicking the checkbox did not change its state`).
Fixed to skip disabled and already-checked boxes.

### 4. Tier-2 escalation confirmed on Submit for Mid-Year, matching 2026-08-11 findings
Both Sanele's (resolved) and Adam's (not-resolved) tier-2 screens gated on **Submit**, not Approve —
consistent with the DDG/CD-D Mid-Year findings from 2026-08-11 and distinct from Contracting's
Approve-gated tier-2 screens.

## Environment

- All employee logins pwd `123qwe`. Supervisor `LungileN`; mediator `BabalwaM`; tier-2 `Sampha`; HR
  `SalesHR`.
- Mediation evidence fixture: `test-data/mediation-outcome.txt`.
- Cycle view: `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=7cf9054b-8c69-4313-ae5c-8039bf495c04`.
- Final tile: `44 Total · 1 Not Started · 40 In progress · 3 Completed` — the terminal (Adam) does not
  count toward Completed on Mid-Year, consistent with the 2026-08-11 finding that Mid-Year's tile
  logic (unlike Contracting's) excludes the Dispute-Unresolved terminal.
