# PMDS SL 1-12 — Contracting Happy Paths for Remaining Users (Thato Mali + Lungile Nhleko)

**Date:** 2026-07-22
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Refs:** Thato Mali **PA2026/6245**; Lungile Nhleko **PA2026/6237**
**Result:** PASSED — both positive happy-path chains completed end-to-end to Generate PERSAL Input.

## Purpose
Complete positive Contracting happy paths for the last two of our six test users, so all six are driven through the process today. Thato is an intern (standard chain); Lungile is a **manager** (different reporting chain + managerial KRAs/GAF).

## Thato Mali (intern) — PA2026/6245
1. **Draft & Submit** (`ThatoMali`/`123qwe`, Intern 3 SL3). Supervisor = Lungile Nhleko, Mediator = Babalwa M (defaulted). 4 KRAs @25% (Total 100%), 4 GAFs (Communication, Job Knowledge, Reliability, Initiative), 8 key activities, 1 PDP → Submit → **Draft → Review**.
2. **Supervisor Sign** (`LungileN`): comment + **Sign** → **Review → HR Review**.
3. **HR Verify** (`SalesHR`): Confirmation + **Verify** → **HR Review → Generate PERSAL Input**.

## Lungile Nhleko (manager) — PA2026/6237
- **Different chain confirmed on Confirm Details:** Supervisor = **Babalwa M** (Chief Director SL13), Mediator = **Tania Smith** (MEC SL13) — i.e. her supervisor's supervisor, one level up from the intern chain.
1. **Draft & Submit** (`LungileN`/`123qwe`, HOD SALES SL10): 4 managerial KRAs @25% (Lead sales operations / Manage & develop team / Manage budget & resources / Ensure courteous engagement, Total 100%); 4 GAFs including **Management Of Human Resources**; 8 key activities; 1 PDP (Advanced Project Management / Formal Course) → Submit → **Draft → Review** (to Babalwa M).
2. **Supervisor Sign** (`BabalwaM`): comment + **Sign** → **Review → HR Review**.
3. **HR Verify** (`SalesHR`): Confirmation + **Verify** → **HR Review → Generate PERSAL Input**.

## Verification
- Contracting Manage Process dashboard ended **41 Total / 0 Not Started / 35 In progress / 6 Completed** (was 4 Completed → now 6, adding Thato + Lungile).
- **All six of our test users are now concluded for Contracting:** Simmy (happy), Jabu (resolved dispute), Sanele (escalated dispute resolved), Adam (escalated dispute unresolved → Dispute Unresolved), Thato (happy), Lungile (happy, manager).

## Notes
- **Manager path uses the same Draft wizard structure** as interns (4 KRAs / GAFs / workplan / PDP); the only differences are the reporting chain (supervisor Babalwa M, mediator Tania Smith) and the availability/relevance of the managerial GAF "Management Of Human Resources". Supervisor Sign for a manager is done by the manager's own supervisor (Babalwa M).
- **Harness note (not an app issue):** on both drafts an occasional "Add" on a key-activity modal did not register, leaving a KRA with only 1 activity; the Workplan **"KRA … must have at least 2 Key Activities"** validation correctly blocked Next until the missing 2nd activity was added. Good validation behaviour; worth adding a per-KRA count check to the automation.
- Usual non-fatal `executeScriptSync` console noise + "Test" info banner present; none blocked completion.

## Environment
- All users pwd `123qwe`. Intern supervisor = `LungileN`; manager (Lungile) supervisor = `BabalwaM`; Contracting HR verify = `SalesHR`.
