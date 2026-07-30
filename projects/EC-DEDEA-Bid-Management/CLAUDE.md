# CLAUDE.md — Hybrid Markdown + Playwright Testing (EC DEDEA Bid Management project)

> **Multi-project hub.** This file describes the **EC DEDEA Bid Management** project. Shared Playwright + Allure infrastructure (`package.json`, `playwright.config.ts`, `node_modules/`, `scripts/run-plan.js`) lives at the hub root two levels up. Tests run from the hub root: `node scripts/run-plan.js projects/EC-DEDEA-Bid-Management/test-plans/<folder>/<plan>.md`.

> **Sibling project.** [`projects/bid-management/`](../bid-management/) covers the **PD** Supply Chain Management site — the upstream/master build of the same Tender Process workflow. EC DEDEA is a separate client deployment on a different Shesha build, so behaviour can differ (see Known deltas below). Keep the two projects' reports apart.

This project uses **markdown plans as the source of truth** and **Playwright `.spec.ts` files as a derived runtime artefact**. Plans live in [test-plans/](test-plans/); each plan has a paired `.spec.ts` beside it that Playwright executes for speed. When a script step fails or hits a `TODO` marker, Claude falls back to AI-driven MCP browser execution, repairs the failing step in the spec, and re-runs.

> **The .md plan is canonical.** The .spec.ts is a generated, self-healing artefact. Edit the .md, not the spec — except for AI-repair patches, which Claude applies automatically.

## The skill chain

```
/test-setup   →   /CreateTest   →   /RunTest   →   /submit-test-results
                                         ↓
                                  /Run-test-remote   (optional, parallel branch)
```

## Mandatory Pre-Flight
Before executing ANY test plan:
1. Read this file (`projects/EC-DEDEA-Bid-Management/CLAUDE.md`) completely
2. Read [test-plans/RULES.md](test-plans/RULES.md) completely
3. Read the specific test plan file (`.md`)
4. Read the paired `.spec.ts` if it exists
5. Only then begin execution

## Application Under Test
| Key | Value |
|-----|-------|
| App | EC DEDEA SmartGov2 Admin Portal — Bid Management (Tender Process) |
| URL | https://ecdedea-smartgov2-adminportal-qa.shesha.app/ |
| Environment | QA |

## Credentials
Password `123qwe` for all users below. Switch view mode **Live → Latest** right after login for
every config-editing user.

| Stage / role | Username |
|---|---|
| Tender Initiation (Draft wizard) | Maanda-awe |
| Review & Approve Tender Details | MhlotiM |
| Publish / Consolidate / Verify Compliance / Goal Points / Appointment Letter / Order Details | TumisangM |
| BEC chair (invite, attendance, calibration, recommendation) | ThabisoM |
| BEC evaluators (functionality scores) | Cedrick, BokangN, BonoloB |
| Capture Outcome from BAC | MoshadiM |
| Approve Recommendation from BAC | ThulileM |

## Workflow (16 stages, verified 2026-07-27)
Tender Initiation → Review & Approve → Publish → Consolidate Responses → Verify Compliance →
Calculate Specific Goal Points → Invite BEC → Confirm Attendance & Open Evaluation →
Capture Functionality Scores → Begin Calibration → Monitor Calibration & Finalise Scoring →
Finalise Recommendation → Capture Outcome from BAC → Approve Recommendation from BAC →
Upload Appointment Letter → Capture Order Details → **Completed**.

Entry point for a new tender: **Create New → Tender Process**.

## Known deltas vs the PD site
- **Inverted "Not Recommended" flag appears FIXED here.** Rank-1 supplier correctly shows
  "Recommended" on the BAC / Approve / Appointment / Order pages, unlike the PD build.
- **Verify Compliance gotcha:** "Finalise Compliance" stays disabled until **every** document row's
  *Is Compliant?* checkbox is ticked — including non-mandatory Cert / Test DOC rows — on top of the
  5 checklist N/A answers, Compliant status, and the confirmation dialog.
- **The app auto-opens the next action** for the same user after several submits
  (Publish→Consolidate→Verify; Finalise Scoring→Finalise Recommendation;
  Appointment Letter→Capture Order Details) — the workflow-action URL stays put with a new `todoid`.
- Console shows ~10–40 non-fatal JS errors per page on this Shesha build; none block the flow.

## Azure DevOps
| Key | Value |
|-----|-------|
| Organization | boxfusion |
| Project | PD-SupplyChainManagement |

> ADO test plans for Bid Management are stale — defer to the live app and the user's instructions.

## Test Artifacts (per-project)

| Artifact | Path (within this project) |
|---|---|
| **JUnit XML** | `test-results/junit.xml` |
| **Allure raw** | `allure-results/*.json` |
| **Allure report** | `allure-report/index.html` (or `allure-report--<variant>/index.html`) |
| **Playwright JSON** | `test-results/results.json` |
| **Run report** | `test-reports/YYYY-MM-DD/<name>.md` |
| **Bug log** | `test-reports/bugs/<name>.md` |
| **Screenshots / traces / videos** | `test-results/artifacts/` |

## Core Constraints
- **Plans are markdown.** `.md` files in [test-plans/](test-plans/) are canonical.
- **Specs are derived.** Don't hand-edit `.spec.ts` outside of AI-repair flow.
- **Playwright-first.** Always try the script before falling back to AI.
- **AI repair patches only the failing step.**
- **Report front-matter must be unprefixed** (`**Date:**`, not `- **Date:**`) — the dashboard parser
  only reads `**Key:** value` at the start of a line, and bullet-prefixed metadata is silently dropped.
- **Always render the Allure report after a run.**
