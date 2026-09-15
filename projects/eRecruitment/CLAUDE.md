# CLAUDE.md — Hybrid Markdown + Playwright Testing (eRecruitment project)

> **Multi-project hub.** This file describes the **eRecruitment** project. Shared Playwright + Allure infrastructure (`package.json`, `playwright.config.ts`, `node_modules/`, `scripts/run-plan.js`) lives at the hub root one level up. Tests run from the hub root: `node scripts/run-plan.js projects/eRecruitment/test-plans/<folder>/<plan>.md`.

This project uses **markdown plans as the source of truth** and **Playwright `.spec.ts` files as a derived runtime artefact**. Plans live in [test-plans/](test-plans/); each plan has a paired `.spec.ts` beside it that Playwright executes for speed.

> **The .md plan is canonical.** The .spec.ts is a generated, self-healing artefact. Edit the .md, not the spec — except for AI-repair patches.

## Application Under Test
| Key | Value |
|-----|-------|
| App | eRecruitment Public Portal |
| URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Login URL | https://pd-recruitment-publicportal-1-qa.shesha.app/login |
| Environment | QA |

## Credentials
| Role | Username | Password |
|------|----------|----------|
| Applicant | Fred | Metaganemr%03 |

## Azure DevOps
| Key | Value |
|-----|-------|
| Organization | boxfusion |
| Project | pd-recruitment |
| Test Plan ID | 99437 |
| Test Suite ID | 104586 — Profile Details |

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
- **Fail fast on blockers.** A failed `(BLOCKING)` assertion stops the test.
