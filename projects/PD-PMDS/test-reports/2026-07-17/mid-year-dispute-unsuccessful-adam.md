# PMDS SL 1-12 — Mid-Year Assessment UNSUCCESSFUL-resolution dispute (Adam Apple)

**Date:** 2026-07-17
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Mid Year Assessment** stage
**Employee:** Adam Apple (`adam`), **Ref PR2026/7339**
**Result:** PASSED (scenario driven end-to-end) — the dispute was **not resolved** at either mediation level; the assessment terminates at status **NOT REQUIRED** (not Completed).
**App:** HCM Admin Portal (PMDS module), https://pd-hcm-adminportal-qa.shesha.app/ (QA)

## Purpose
Complement the earlier **successful-resolution** dispute (Sanele) with an **unsuccessful resolution** — where the mediator selects "The disagreement has NOT been resolved" — to observe routing and the terminal state.

## Headline findings
- **Unsuccessful mediation requires a comment + attachment.** Selecting **"The disagreement has not been resolved"** reveals two required fields — **Comments\*** and **Attachments\*** — that gate Submit (the *resolved* option needs neither). Uploaded `mediation-outcome.txt` via the native file chooser.
- **An unresolved dispute ESCALATES up the hierarchy.** After the first mediator (`BabalwaM`) marked it unresolved, the same **"Review disagreement and attempt to resolve"** task escalated to the next-level authority **Tania Smith** (`Tester97`), status remaining **Under appeal**.
- **Terminal state = `NOT REQUIRED`.** When the top-of-line authority (Tania Smith) also marked it unresolved, the assessment closed with status **NOT REQUIRED** — it is **excluded from the Mid-Year "Completed" rollup** (contrast the successful-resolution path, which ends Completed / Awaiting PERSAL Sync).

## Steps executed (live, headed)
1. **Employee Self-Assessment** (`adam`): 4 KRAs, all 8 activities rated **3** + comment; page-level Employee Comments → **Submit** → Review.
2. **Supervisor Review — create disagreement** (`LungileN`): on **"Deliver value for money" / activity "Report on resource utilisation to the supervisor"** set **Supervisor Score = 2** vs Own = 3 → inline required **Agreed Score = 2** + **comment + attachment** (`mediation-outcome.txt`). Other activities/KRAs = 3. Page-level Supervisor Comments → **Refer for dispute** (comment-gated confirm) → routed to **BabalwaM**, status **Under appeal**.
3. **Mediator 1 — NOT resolved** (`BabalwaM`, `sagov-performancereview-mediatorreviewdisagreement`): selected **"The disagreement has not been resolved"** → required **Comments\* + Attachments\*** → Submit → **escalated to Tania Smith** (status still Under appeal).
4. **Mediator 2 (final authority) — NOT resolved** (`Tania Smith`/`Tester97`): same screen and required fields → **"not been resolved"** + comment + attachment → Submit → workflow closed at **NOT REQUIRED**.

## Gotcha observed (harness, non-app)
- After the supervisor saved the disputed KRA, the Rate-Key-Activities dialog for the *next* KRA hung on a loading spinner and the page's console errors climbed. A **page reload** cleared it; the disputed KRA data had persisted server-side. **However**, after the reload the parent form no longer recognised the disputed KRA as scored (Sign/Refer stayed disabled), so the KRA had to be **re-opened and Save clicked again** to re-commit it to the form state before "Refer for dispute" enabled. Worth watching — a save/rollup race on the supervisor screen (related to the known intermittent silent-drop).

## Dashboard reconciliation (end of batch)
- Mid Year Assessment: Total 41 · Not Started 37 · In progress 1 · **Completed 3** (Simmy, Sanele, Jabu). Adam is **not** in Completed — his assessment is **NOT REQUIRED**.

## Environment
- Employee/supervisor/mediator pwd `123qwe`. Supervisor = `LungileN`; mediator 1 = `BabalwaM`; final authority = **Tania Smith `Tester97`**. Mid-Year HR = `GOV005` / `EMP001234`.
- Workflow instance viewable at `/shesha/workflow?id=<instanceId>` (status badge next to the heading).
