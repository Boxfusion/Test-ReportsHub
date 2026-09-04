# CLAUDE.md — Hybrid Markdown + Playwright Testing (PD-CRM project)

> **Multi-project hub.** This file describes the **PD-CRM** project (Service Management / CRM Admin Portal). Shared Playwright + Allure infrastructure (`package.json`, `playwright.config.ts`, `node_modules/`, `scripts/run-plan.js`) lives at the hub root two levels up. Tests run from the hub root: `node scripts/run-plan.js projects/PD-CRM/test-plans/<folder>/<plan>.md`.
>
> **Relationship to the legacy `dep` project.** `projects/dep/` targets the same Azure DevOps project (PD-Dep) but points at the retired URL `linux-dep-adminportal-test.azurewebsites.net` with the old `admin / 123qwe` credentials. PD-CRM is the current QA environment. Treat `projects/dep/test-plans/` (customers, cases, calls, service-requests) as reference material only — re-author plans here against the live selectors, do not copy them blind.

This project uses **markdown plans as the source of truth** and **Playwright `.spec.ts` files as a derived runtime artefact**. Plans live in [test-plans/](test-plans/); each plan has a paired `.spec.ts` beside it that Playwright executes for speed. When a script step fails or hits a `TODO` marker, Claude falls back to AI-driven browser execution, repairs the failing step in the spec, and re-runs.

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
2. `/RunTest` runs Playwright first: `node scripts/run-plan.js projects/PD-CRM/test-plans/<folder>/<name>.md` (from hub root).
3. If the spec passes → write the markdown report from Playwright's JSON output.
4. If a step fails → AI fallback patches the failing line in the .spec.ts and re-runs.
5. If AI fallback fails twice → auto-classify (stale-plan vs business-logic) and either fix the plan or log a bug.
6. Regenerate the project dashboard (`node scripts/build-project-data.js --project=PD-CRM`) and the per-project Allure report.
7. `/submit-test-results` publishes to the central hub (this **is** the hub — that step is a no-op here, just a `git push`).

## Mandatory Pre-Flight
Before executing ANY test plan:
1. Read this file (`projects/PD-CRM/CLAUDE.md`) completely
2. Read [test-plans/RULES.md](test-plans/RULES.md) completely
3. Read the specific test plan file (`.md`)
4. Read the paired `.spec.ts` if it exists
5. Only then begin execution

## Application Under Test
| Key | Value |
|-----|-------|
| App | Service Management / CRM Admin Portal (Shesha) |
| URL | https://pd-dep-adminportal-qa.shesha.app/login |
| Landing page after login | `/dynamic/Boxfusion.ServiceManagement/service-requests` |
| Environment | QA |

## Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | Admin | P@ssword1 |

> Verified working on 2026-09-01. Note the capital `A` — this environment does **not** use the legacy `admin / 123qwe`.

## Azure DevOps
| Key | Value |
|-----|-------|
| Organization | boxfusion |
| Project | PD-Dep |
| Test Plan | 112718 |
| Plan URL | https://dev.azure.com/boxfusion/PD-Dep/_testPlans/define?planId=112718 |

### Suite tree (pulled 2026-09-01)
```
112719  PD-CRM
├── 112721  Authentication
│   ├── 112731  Admin Portal      ← 8 cases (#112734–#112741) ✅ imported
│   ├── 112732  CEP App
│   └── 112733  SmartField App
├── 112720  Case Management
│   ├── 112754  Case Creation
│   ├── 112755  Case Lifecycle
│   └── 112756  Contacts Directory
└── 112722  Field Service
```

All cases are state `Design`, priority 2. **Expected results are prescribed verbatim — quote the ADO step or
don't call it a bug.** Note that two cases in 112731 have defective expectations (see
`test-reports/bugs/admin-portal-authentication.md`, BUG-001 and BUG-004), so read them critically rather than
assuming the suite is correct.

### Reading the plans without the ADO MCP
The `claude.ai Azure DevOps (Boxfusion)` connector needs an interactive OAuth sign-in that has not been
completed on this machine. **Do not block on it** — drive a browser instead, the same method
`projects/DSD-NPO/CLAUDE.md` documents:

1. Launch a **headed persistent** Chromium context and navigate to the ADO plan URL.
2. Sign in through the Microsoft prompt (password + MFA) in the visible window.
3. Call the REST API with `fetch()` from inside the page. **Cookies authenticate automatically** because the
   page origin is `dev.azure.com` — no PAT, no `az login`.

```
GET  {org}/{project}/_apis/testplan/Plans/{planId}/suites?api-version=7.1
GET  {org}/{project}/_apis/testplan/Plans/{planId}/Suites/{suiteId}/TestCase?api-version=7.1
POST {org}/_apis/wit/workitemsbatch?api-version=7.1   body {ids:[…≤200], fields:[…]}
```

A persistent profile at `C:\Users\<user>\AppData\Local\claude-ado-profile` keeps the session, so the sign-in
is a **one-time** cost — later pulls run unattended. That directory holds live session cookies: it lives
outside the repo and must never be committed.

⚠️ `Microsoft.VSTS.TCM.Steps` is XML whose inner HTML is **double-escaped**. Parse the XML, then parse each
`parameterizedString`'s `textContent` *as HTML* — unescape before stripping tags, or `&lt;P&gt;` survives as a
literal `<P>`. WebFetch cannot do any of this; `dev.azure.com` 302s to sign-in.

## 🔑 Switch the view mode Live → Latest on EVERY run, right after login

The header view mode **defaults to `Live`**, which renders only the *published* version of each form
configuration. **`Latest` renders the latest versions irrespective of status — that is what we are
testing.** The app's own menu describes the three options:

| Option | Meaning |
|---|---|
| `Live` | Display only published versions of configuration items. It's a default view for regular users. |
| `Ready` | Display ready versions where available with fallback to live |
| `Latest` | Display latest versions of configuration items irrespectively of their status |

Use `switchToLatest()` from [test-plans/_helpers.ts](test-plans/_helpers.ts) — it is already wired into the
`login()` of every Case Management spec, and it **throws** rather than silently leaving the run on Live.

⚠️ **The control is an `.ant-dropdown-trigger` whose text is the current mode.** It is **NOT** the
`.ant-switch.sha-configurable-modeswitcher-switcher` next to it — that toggles the form *designer* (Edit
mode) and does **not** change which version is served. Confusing the two wasted a day: **every PD-CRM suite
run on 2026-09-02 (Authentication, Case Creation, Case Lifecycle, Contacts Directory) executed in Live
mode.** The same mistake had already been made and documented in `projects/DSD-NPO/CLAUDE.md` on
2026-08-12 — check the other projects' CLAUDE.md before assuming a control's purpose.

⚠️ **The mode resets to `Live` on every fresh login**, so it must be re-applied per test, not once per suite.

A form with no newer version still reads `vNN LIVE` in Latest mode — that is expected, not a failed switch.
Confirm the switch from the trigger's own text. Never open the form **designer** on this shared QA
environment; browsing it is how accidental configuration changes happen.

## Navigation map (captured live 2026-09-01)

| Menu item | Route |
|---|---|
| Cases | `/dynamic/Boxfusion.ServiceManagement/service-requests` |
| All Cases | `/dynamic/StarterTemplate/cases-table` |
| Events | `/dynamic/Boxfusion.ServiceManagement/event-table` |
| FAQ | `/dynamic/Boxfusion.ServiceManagement/new-faqs-table` |
| Contacts | `/dynamic/Boxfusion.ServiceManagement/contacts-table` |
| Facilities | `/dynamic/Boxfusion.Dep/facilities-table` |
| Customers | `/dynamic/Boxfusion.Dep/table-customers` |
| Broadcast Notification | `/dynamic/Boxfusion.Dep/broad-cast-notificationstableView` |
| Ambulance Requests | `/dynamic/Boxfusion.PatientEngagement/ambulance-requests-tableview` |
| Case Mapping | `/dynamic/Boxfusion.ServiceManagement/Spartial_Map` |
| Content Item Types | `/dynamic/boxfusion.content/content-item-types` |
| Manage Content Libraries | `/dynamic/boxfusion.content/manage-libraries-list` |
| Public Libraries | `/dynamic/boxfusion.content/public-libraries` |
| Chat Console | `/dynamic/shesha/chat` |
| Social Media | `/dynamic/boxfusion.content/content-folder-details` |

Login form selectors (captured live): username `input[placeholder="Username"]`, password `input[type="password"]`, submit `button:has-text("Sign In")`.

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

## Environment notes (this machine)
- **Always run headed.** Plan runs: set `HEADED=1` (read by `playwright.config.ts` at `use.headless`). Ad-hoc exploration scripts: `chromium.launch({ headless: false })`. Headless is for CI only.
- `ComSpec` is misconfigured to `C:\Program Files\nodejs\`, which breaks `npx`. Prefix commands with `$env:ComSpec="C:\Windows\System32\cmd.exe"` or invoke the CLI directly: `node node_modules\@playwright\test\cli.js …`.
- The Playwright **MCP server is not registered** in this workspace (`claude mcp list` shows none), so live selector recording via `mcp__playwright__*` is unavailable. Selectors here were captured by driving `playwright-core` from a Node script instead.
