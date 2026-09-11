# PMDS SL 1-12 Performance Agreement — Contracting Happy Path ×2 (Simmy Mthalane, Jabu Hadebe)

**Date:** 2026-09-11
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Refs:** PA2026/7764 (Simmy Mthalane) · PA2026/7720 (Jabu Hadebe)
**Result:** PASSED — both agreements completed end-to-end to Generate PERSAL Input, no defects

## Context

First of 2 requested positive SL 1-12 Contracting workflows. Contracting was opened fresh this run
(Submission 2026-09-30 / Closing 2026-10-31, initiated immediately — 45 Total / 45 In progress).

Chain for both employees: employee Draft → supervisor **Lungile Nhleko** (`LungileN`) Sign → HR
**Sales HR** (`SalesHR`) Verify → Generate PERSAL Input.

## Steps executed (live, headed)

1. **Admin — Open Contracting process** for all three cycles (SL 1-12, DDG, CD/Director) in one pass.
2. **Simmy — Draft & Submit** (`Simmy`/`123qwe`, PA2026/7764). 4 KRAs @ 25% (Total 100%), 4 GAFs from
   her live list, 8 key activities (2 per KRA), 1 PDP. 2 attestations → **Submit**. Status Draft → Review.
3. **Jabu — Draft & Submit** (`JabuH`/`123qwe`, PA2026/7720). Same structure, GAF list differed from
   Simmy's (per-employee list, as previously observed) → **Submit**, status Review.
4. **Supervisor Sign ×2** (`LungileN`) — both review tasks signed, no mandatory comment. Status
   Review → HR Review for both.
5. **HR Verify ×2** (`SalesHR`) — Confirmation checkbox → **Verify**. Status HR Review → Generate
   PERSAL Input for both.
6. **Verification (admin).** Employee List: **Simmy PA2026/7764 = Generate PERSAL Input**,
   **Jabu PA2026/7720 = Generate PERSAL Input**.

## Observations / notes

- This run batched employee logins into isolated browser contexts within a single script to reduce
  wall-clock time; an early version of the batch used an overly broad inbox-row regex
  (`/Draft|Performance Agreement|Initiate/i`) which, for employees who are also supervisors elsewhere
  in the same cycle, could grab a colleague's pending Review task instead of the employee's own Draft
  task. Tightened to `/Initiate Performance Agreement/i` for the draft step — see the CD/Director and
  DDG reports for where this bit us and was corrected.
- No defects observed on this pair; both wizards completed on first-click Next/Submit throughout.

## Environment

- Employee default password `123qwe`; `SalesHR` is the Contracting HR-verify role for SL 1-12.
