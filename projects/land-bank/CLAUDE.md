# CLAUDE.md — Hybrid Markdown + Playwright Testing (Land Bank CRM project)

> **Multi-project hub.** This file describes the **Land Bank CRM** project. Shared Playwright + Allure infrastructure (`package.json`, `playwright.config.ts`, `node_modules/`, `scripts/run-plan.js`) lives at the hub root one level up. Tests run from the hub root: `node scripts/run-plan.js projects/land-bank/test-plans/<folder>/<plan>.md`.

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
1. Read this file (`projects/land-bank/CLAUDE.md`) completely
2. Read [test-plans/RULES.md](test-plans/RULES.md) completely
3. Read the specific test plan file (`.md`)
4. Read the paired `.spec.ts` if it exists
5. Only then begin execution

## Application Under Test
| Key | Value |
|-----|-------|
| App | Land Bank CRM (Admin Portal) |
| Environment | Dev (active `TEST_ENV=dev`) |

## Environments
Site URLs are **not** stored here — only the registry of which env var holds each one. Real values live in the gitignored `.env` at the hub root.

| Environment | URL env var | Notes |
|---|---|---|
| Dev | `DEV_APP_URL` | Current target (`https://landbankcrm-adminportal-landbankcrmdev.shesha.app`) |

`playwright.config.ts` resolves `baseURL` from `APP_URL`, else `<TEST_ENV>_APP_URL` (e.g. `TEST_ENV=dev` → `DEV_APP_URL`). Specs use **relative** paths, so switching `TEST_ENV` re-points every test.

## Credentials
Credential **values are never committed** — they live in the gitignored `.env` at the hub root (see `.env.example`). This table is only the registry of roles and the env vars that carry them.

| Role | Username env var | Password env var | Notes |
|------|------------------|------------------|-------|
| ADMIN | `ADMIN_USERNAME` | `ADMIN_PASSWORD` | Admin portal super user |
| RM | `RM_USERNAME` | `RM_PASSWORD` | Relationship Manager — drives the Leads → Opportunity → Inbox → Opportunity flow |

Specs resolve these at run time via `credsFor(role)` / `loginAs(page, 'ADMIN')` / `loginAs(page, 'RM')`.

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

## Prerequisite — Java on PATH for Allure

`/RunTest` renders an Allure report on every run, and `npx allure generate` needs a JDK. On this machine
the JDK **is** installed via Homebrew (`brew list` → `openjdk`, OpenJDK 26) but Homebrew keeps it
**keg-only**: it is never symlinked into `/Library/Java/JavaVirtualMachines/`, which is the only place
the macOS `/usr/bin/java` stub and `/usr/libexec/java_home` look. The result is a misleading
*"Unable to locate a Java Runtime"* even though a working JDK is present at
`/opt/homebrew/opt/openjdk/bin/java`.

Either prefix the Allure command:
```bash
PATH="/opt/homebrew/opt/openjdk/bin:$PATH" npx allure generate projects/land-bank/allure-results \
  --clean --single-file -o projects/land-bank/allure-report
```
…or fix it once, so every shell picks it up:
```bash
sudo ln -sfn /opt/homebrew/opt/openjdk/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk.jdk
# or add to ~/.zshrc:  export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
```

> **Report size warning.** `--single-file` inlines every attachment. A run with many failures embeds
> each trace (~13 MB) and video, which produced a **157 MB** `allure-report/index.html` on
> 2026-08-20. `allure-report/` is **not** gitignored, so check the size before committing or running
> `/submit-test-results`. Consider gitignoring it, dropping `--single-file`, or trimming
> `trace`/`video` retention in `playwright.config.ts`.

## Core Constraints
- **Plans are markdown.** `.md` files in [test-plans/](test-plans/) are canonical.
- **Specs are derived.** Don't hand-edit `.spec.ts` outside of AI-repair flow.
- **No secrets in committed files.** URLs and credentials come from `.env` / CI secrets only.
- **Playwright-first.** Always try the script before falling back to AI.
- **AI repair patches only the failing step.**
- **Fail fast on blockers.** A failed `(BLOCKING)` assertion stops the test.
- **Always render the Allure report after a run.**
