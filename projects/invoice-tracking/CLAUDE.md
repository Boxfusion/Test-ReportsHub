# CLAUDE.md — Hybrid Markdown + Playwright Testing (Invoice Tracking project)

> **Multi-project hub.** This file describes the **Invoice Tracking (ITS)** project. Shared Playwright + Allure infrastructure (`package.json`, `playwright.config.ts`, `node_modules/`, `scripts/run-plan.js`) lives at the hub root one level up. Tests run from the hub root: `node scripts/run-plan.js projects/invoice-tracking/test-plans/<folder>/<plan>.md`.

This project uses **markdown plans as the source of truth** and **Playwright `.spec.ts` files as a derived runtime artefact**. Plans live in [test-plans/](test-plans/); each plan has a paired `.spec.ts` beside it that Playwright executes for speed. When a script step fails or hits a `TODO` marker, Claude falls back to AI-driven MCP browser execution, repairs the failing step in the spec, and re-runs.

> **The .md plan is canonical.** The .spec.ts is a generated, self-healing artefact. Edit the .md, not the spec — except for AI-repair patches, which Claude applies automatically.

## The skill chain

```
/test-setup   →   /CreateTest   →   /RunTest   →   /submit-test-results
                                         ↓
                                  /Run-test-remote   (optional, parallel branch)
```

## How It Works
0. **First time on a machine:** run `/test-setup` to install Node deps, Playwright browsers, verify Java/Allure, hub config, and (for CI) check `gh` CLI + GitHub secrets + Teams webhook. Idempotent.
1. `/CreateTest` writes BOTH `test-plans/<folder>/<name>.md` AND a paired `<name>.spec.ts`. Selectors are recorded live via Playwright MCP.
2. `/RunTest` runs Playwright first: `node ../../scripts/run-plan.js projects/invoice-tracking/test-plans/<folder>/<name>.md` (from hub root).
3. If the spec passes → write the markdown report from Playwright's JSON output.
4. If a step fails → AI fallback patches the failing line in the .spec.ts and re-runs.
5. If AI fallback fails twice → auto-classify (stale-plan vs business-logic) and either fix the plan or log a bug.
6. Regenerate the project dashboard (the hub's `scripts/build-project-dashboard.js --project=invoice-tracking`) and the per-project Allure report.
7. `/submit-test-results` publishes to the central hub (this **is** the hub — that step is a no-op here, just a `git push`).

## Mandatory Pre-Flight
Before executing ANY test plan:
1. Read this file (`projects/invoice-tracking/CLAUDE.md`) completely
2. Read [test-plans/RULES.md](test-plans/RULES.md) completely
3. Read the specific test plan file (`.md`)
4. Read the paired `.spec.ts` if it exists
5. Only then begin execution

## Application Under Test
| Key | Value |
|-----|-------|
| App | Invoice Tracking (ITS) Admin Portal |
| URL | https://pd-invtracking-adminportal-qa.azurewebsites.net/login |
| Environment | QA |

## Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin / Invoice Capturer / Verifier / Authoriser | ThulileM | 123qwe |
| Branch Finance Admin / Responsible Person / Voucher Preparer | TaniaSmith | 123qwe |
| System Administrator (BAS Report & Payment Stub imports) | Admin | 123qwe |
| Capture Filing (Gwen Simbeni) | GwenB | 123qwe |

> **Approval-chain note:** The BAS invoice flow is a multi-role chain (Register → Certify → Prepare/Verify/Authorise Voucher → Final Authorise Payment → Filing). Additional role logins (Branch Finance Admin, Certifier, Responsible Person, Verifier, Authoriser) are discovered live as steps hand off; record each new account here as it's confirmed.

### People assigned (not yet confirmed as logins)
| Step / role | Person | Login | Verified |
|---|---|---|---|
| Branch Finance Admin (TC-03) | **Tania Smith** | TBC (eLeave used `Tester97` for a "Tania Smith" — confirm before relying on it) | assigned 2026-06-18 |

> **Full BAS chain proven end-to-end (2026-06-18):** **PAY10051/2026** (Maake) was driven Register → … → Paid → **Filed** (complete). Both file-import steps work via in-place file edits (BAS report .xlsx via ZipArchive Update; Payment Stub fixed-width .txt). See `test-reports/2026-06-18/bas-FULL-CHAIN-COMPLETE-PAY10051.md` and memory `its-bas-report-field-mapping`.
> **Other seed:** **PAY9991/2026** (OMNI TECHNOLOGIES) is **Authorized** at **Attach Payment Stub** (its BAS report was imported by the user); can be finished via a Payment Stub import + Capture Filing if needed.

## Azure DevOps
| Key | Value |
|-----|-------|
| Organization | boxfusion |
| Project | PD-Shesha 3 Migration |
| Test Plan | [#102133 — ITS Automation Test Cases](https://dev.azure.com/boxfusion/PD-Shesha%203%20Migration/_testPlans/define?planId=102133&suiteId=102355) |
| Test Suite | #102355 — BAS |

## Test Artifacts (per-project)

| Artifact | Path (within this project) |
|---|---|
| **JUnit XML** | `test-results/junit.xml` |
| **Allure raw** | `allure-results/*.json` |
| **Allure report** | `allure-report/index.html` |
| **Playwright JSON** | `test-results/results.json` |
| **Run report** | `test-reports/YYYY-MM-DD/<name>.md` |
| **Bug log** | `test-reports/bugs/<name>.md` |
| **Screenshots / traces / videos** | `test-results/artifacts/` |

## Core Constraints
- **Plans are markdown.** `.md` files in [test-plans/](test-plans/) are canonical.
- **Specs are derived.** Don't hand-edit `.spec.ts` outside of AI-repair flow.
- **Playwright-first.** Always try the script before falling back to AI.
- **AI repair patches only the failing step.**
- **Always snapshot before AI repair edits.**
- **Fail fast on blockers.** A failed `(BLOCKING)` assertion stops the test.
- **Always render the Allure report after a run.**
