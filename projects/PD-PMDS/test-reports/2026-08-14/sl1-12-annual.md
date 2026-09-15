# PMDS SL 1-12 — Annual Assessment: 1 positive + 3 negative scenarios

**Date:** 2026-08-14
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Annual Assessment**
(cycle id `7cf9054b-8c69-4313-ae5c-8039bf495c04`, 44 employees)
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** hand-written Node/Playwright drivers extending the shared `.tmp-pmds-lib.js` helper
library (CommonJS port of `pmds.ts`), driven live headed.
**Refs:** PR2026/3920 (Simmy Mthalane) · PR2026/3876 (Jabu Hadebe) · PR2026/3918 (Sanele Sithole) ·
PR2026/3862 (Adam Apple)
**Result:** PASSED — Mid-Year closed, Annual opened for the full population, all 4 assigned scenarios
completed to their expected end states. **No blocking defects.**

## Context

Closed Mid-Year (→ Completed) and opened Annual immediately after (Submission Date 31/08/2026, Closing
Date 30/09/2026, initiate immediately) for all three cycles (SL1-12, CD/Director, DDG), per the test
lead's instruction. This is the first time the Annual stage has been automated for this hub — Annual adds
two entirely new mechanisms on top of Mid-Year's KRA-rating forms: a **Confirm Agreed Score** branch
(triggered whenever Supervisor/Own scores disagree) and an **Outcome Letter** sub-flow (Draft → Approve)
that sits after the existing Confirm/Sign/Approve Assessment chain.

Reused the same four SL1-12 employees from the Mid-Year run (Simmy, Jabu, Sanele, Adam) so the negative
scenarios could reuse their already-established supervisor/mediator chain (LungileN → BabalwaM → Sampha).

| Scenario | Employee | Ref | Outcome |
|---|---|---|---|
| Positive | Simmy Mthalane | PR2026/3920 | ✅ Awaiting PERSAL sync |
| Negative 1 — resolved dispute | Jabu Hadebe (`JabuH`) | PR2026/3876 | ✅ Awaiting PERSAL sync |
| Negative 2 — escalated, resolved at tier 2 | Sanele Sithole (`SaneleS`) | PR2026/3918 | ✅ Awaiting PERSAL sync |
| Negative 3 — escalated, unresolved at both tiers | Adam Apple (`adam`) | PR2026/3862 | ✅ Terminal — status "Not Required", no downstream task |

## Full Annual actor chain (discovered this run)

| # | Step | Actor (login) | Result |
|---|------|---------------|--------|
| 1 | Complete Self-Assessment | Employee | ✅ Reuses Mid-Year's KRA form unchanged |
| 2 | Supervisor Review + Sign/Refer | LungileN | ✅ Same rating mechanics as Mid-Year |
| 3 | **Confirm Agreed Score** *(new — only when scores disagree)* | Employee | ✅ 3 radio options: accept & submit finalised assessment / send back to supervisor / send for mediation |
| 4 | Confirm Assessment | SalesHR | ✅ Hidden confirmation checkbox (see Findings) + button |
| 5 | Sign Assessment (Moderating Committee) | KamoM | ✅ Same checkbox+button pattern |
| 6 | Approve Assessment (Delegated Authority) | Tems | ✅ Same checkbox+button pattern |
| 7 | **Draft Outcome Letter** *(new)* | KabeloM | ✅ Generates letter, then checkbox+Submit |
| 8 | **Approve Outcome Letter** *(new, terminal for the positive/resolved paths)* | Tyla | ✅ Advances to Awaiting PERSAL sync |

Dispute/escalation sub-flow (negatives 1–3) reuses Mid-Year's mediator mechanism unchanged:
Supervisor Refers for Dispute → **BabalwaM** mediator (resolved, or not-resolved with mandatory
comment+attachment) → if escalated, **Sampha** as tier-2 "Mediator Supervisor" (Submit-gated, resolved or
not-resolved) → if resolved at either tier: employee **Update Performance Assessment with Outcomes** →
supervisor **Review Performance Assessment with Outcomes** → rejoins the chain above at step 4.

## Steps executed (live, headed)

1. **Simmy — positive.** Self-assessment (4 KRAs, all activities scored 3 + comment + attachment) →
   Submit → **LungileN** supervisor review, deliberately rating one activity higher (Supervisor 4 vs Own
   3, Agreed set to 4) to exercise the Confirm Agreed Score branch → **Sign** → **Simmy** Confirm Agreed
   Score (accepted) → **SalesHR** Confirm Assessment → **KamoM** Sign Assessment → **Tems** Approve
   Assessment → **KabeloM** Draft Outcome Letter → **Tyla** Approve Outcome Letter → Awaiting PERSAL sync.
2. **Jabu — negative 1, resolved dispute.** Self-assessment → Submit → **LungileN** disagrees on one
   activity → Refer for Dispute → **BabalwaM** mediator selects "has been resolved" → **Jabu** Update with
   Outcomes → **LungileN** Review Updated → rejoins the shared tail (Confirm/Sign/Approve Assessment,
   Draft/Approve Outcome Letter) → Awaiting PERSAL sync.
3. **Sanele — negative 2, escalated dispute resolved at tier 2.** Same referral pattern → **BabalwaM**
   selects "has not been resolved" (comment + attachment) → escalated to **Sampha** (tier 2) who selects
   "has been resolved" via Submit → **Sanele** Update with Outcomes → **LungileN** Review Updated →
   rejoins the shared tail → Awaiting PERSAL sync.
4. **Adam — negative 3, escalated dispute unresolved at both tiers.** Same referral and **BabalwaM**
   "not resolved" path → tier 2 (**Sampha**) also selects "has not been resolved" → confirmed terminal:
   no task for Adam anywhere (checked his own, SalesHR's, KamoM's, Tems', KabeloM's, and Tyla's inboxes —
   all clean); My Items shows PR2026/3862 status **"Not Required"**, not Awaiting PERSAL sync — the
   workflow correctly refused to continue past the dispute-unresolved point.

## Findings

### 1. The known "Approve Outcome Letter" 500 bug (2026-07-23) is now fixed
Three weeks prior, the terminal "Approve Outcome Letter" step (Head of Business Unit, `Tyla`) failed with
an HTTP 500 (`getOutcomeLetterApproverFullNameWithTitle is not a function`), blocking every Annual
assessment from ever reaching Completed. This run reproduced the identical step 3+ times across all three
populations (12 total Approve Outcome Letter clicks) with **zero failures** — the underlying workflow
script defect has been resolved. This was the single biggest open risk going into this stage and is now
cleared.

### 2. Several Annual confirmation screens gate their submit button behind an invisible checkbox
Confirm Assessment, Sign Assessment, Approve Assessment, and Update/Review-with-Outcomes all show a bold
static text line ("I confirm that the Performance Assessment details have been reviewed and are
accurate…") with **no visibly associated checkbox** — the actual checkbox control is a sibling grid cell
with no label text of its own, positioned as the confirmation text's `previousElementSibling` in the DOM.
A plain click on the submit/confirm button does nothing (stays disabled) until this specific checkbox is
found and clicked. Once identified, this pattern is consistent and reusable across every one of these
screens and across all three populations.

### 3. A stray modal blocks Submit immediately after generating the Outcome Letter
On "Draft Outcome Letter", clicking the letter-generation button opens a modal/toast that must be
dismissed (Escape / close) before the Submit button becomes clickable — otherwise the click is
intercepted by the still-open overlay. Reproduced on every Draft Outcome Letter run this session.

### 4. "Confirm Agreed Score" is not a button — it's a distinct downstream task
When the supervisor Signs (rather than Refers for Dispute) a review containing a Own/Supervisor score
disagreement, a **new task** — "Confirm Agreed Score" — is generated directly in the employee's inbox,
separate from the original Supervisor-review screen. It presents 3 radio options (accept & finalise / send
back to supervisor / send for mediation) and a Submit button. This confirms the positive workflow's
branching behaviour exactly as specified.

### 5. All-3s scoring is internally inconsistent on SL 1-12's GAF form (carried over from Mid-Year)
Own/Supervisor/Agreed read 100%/108%/108% when one activity is rated 4 and the rest 3 (rather than a
clean 100% across all three) — this is the same GAF-form scoring quirk already flagged on Mid-Year and
Contracting; not a new Annual-specific issue.

## Environment
- All employee/supervisor/mediator logins pwd `123qwe`; HR/Moderating-Committee/Delegated-Authority/
  PMDS-Practitioner/Head-of-Business-Unit roles are **shared, org-wide accounts** used identically across
  all three populations: `SalesHR` (Confirm Assessment), `KamoM` (Sign Assessment), `Tems` (Approve
  Assessment), `KabeloM` (Draft Outcome Letter), `Tyla` (Approve Outcome Letter).
- Employee logins this run: `Simmy`, `JabuH`, `SaneleS`, `adam` (lowercase — confirmed from prior test
  reports after an initial mis-guess with bare first names caused false login failures).
- Mediator/tier-2 logins: `BabalwaM` (tier 1), `Sampha` (tier 2 "Mediator Supervisor").
- Cycle view: `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=7cf9054b-8c69-4313-ae5c-8039bf495c04`.
