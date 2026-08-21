# CLAUDE.md — Hybrid Markdown + Playwright Testing (DSD NPO project)

> **Multi-project hub.** This file describes the **DSD NPO** project. Shared Playwright + Allure infrastructure (`package.json`, `playwright.config.ts`, `node_modules/`, `scripts/run-plan.js`) lives at the hub root two levels up. Tests run from the hub root: `node scripts/run-plan.js projects/DSD-NPO/test-plans/<folder>/<plan>.md`.
>
> **This module has TWO portals.** A public portal where an NPO registers itself, and an admin portal where DSD staff process it. Most end-to-end flows cross both, so a plan usually logs in twice. `meta.json` names the public portal as the project's `appUrl` because that is where the lifecycle starts.

This project uses **markdown plans as the source of truth** and **Playwright `.spec.ts` files as a derived runtime artefact**. Plans live in [test-plans/](test-plans/); each plan has a paired `.spec.ts` beside it that Playwright executes for speed. When a script step fails or hits a `TODO` marker, Claude falls back to AI-driven MCP browser execution, repairs the failing step in the spec, and re-runs.

> **The .md plan is canonical.** The .spec.ts is a generated, self-healing artefact. Edit the .md, not the spec — except for AI-repair patches, which Claude applies automatically.

## What the module is

The **Department of Social Development NPO registration and compliance portal** (South Africa), governed by the NPO Act and the GLAA amendments (**Act No. 22 of 2022**). An NPO registers itself on the public portal; DSD staff assess, register, and then police it from the admin portal.

The admin **CRUDS** menu is effectively the NPO lifecycle, and is the natural shape of the test scope:

| Lifecycle stage | Admin menu |
|---|---|
| Registration application | CRUDS → All Applications |
| Ongoing annual obligations | CRUDS → Annual Compliance |
| Disputing a decision | CRUDS → Appeals |
| Amending NPO details | CRUDS → Change Request |
| Non-compliance follow-up | CRUDS → Investigation |
| Exit | CRUDS → Voluntary Deregistration |

Supporting areas: Dashboards (Workflow, CRM, Interactions, Education & Awareness, Spatial Map), Reports, CRM (Case, Assigned Cases, Case Resolution, Case Management, Mobile), All NPOs, Workflows (Inbox / My Items / Sent / Drafts), Education and Awareness (Interventions, Content Libraries, Content Administration), Administration (User Management, Roles, NPO Auth Users, Audit Logs), Configurations.

## The skill chain

```
/test-setup   →   /CreateTest   →   /RunTest   →   /submit-test-results
                                         ↓
                                  /Run-test-remote   (optional, parallel branch)
```

## How It Works
0. **First time on a machine:** run `/test-setup` to install Node deps, Playwright browsers, verify Java/Allure, hub config, and (for CI) check `gh` CLI + GitHub secrets + Teams webhook. Idempotent.
1. `/CreateTest` writes BOTH `test-plans/<folder>/<name>.md` AND a paired `<name>.spec.ts`. Selectors are recorded live via Playwright MCP.
2. `/RunTest` runs Playwright first: `node scripts/run-plan.js projects/DSD-NPO/test-plans/<folder>/<name>.md` (from hub root).
3. If the spec passes → write the markdown report from Playwright's JSON output.
4. If a step fails → AI fallback patches the failing line in the .spec.ts and re-runs.
5. If AI fallback fails twice → auto-classify (stale-plan vs business-logic) and either fix the plan or log a bug.
6. Regenerate the project dashboard (the hub's `scripts/build-project-data.js --project=DSD-NPO`) and the per-project Allure report.
7. `/submit-test-results` publishes to the central hub (this **is** the hub — that step is a no-op here, just a `git push`).

## Mandatory Pre-Flight
Before executing ANY test plan:
1. Read this file (`projects/DSD-NPO/CLAUDE.md`) completely
2. Read [test-plans/RULES.md](test-plans/RULES.md) completely
3. Read the specific test plan file (`.md`)
4. Read the paired `.spec.ts` if it exists
5. Only then begin execution

## Application Under Test
| Key | Value | Environment |
|-----|-------|-------------|
| Public portal (NPO applicant) | https://dsd-npo-publicportal-1-qa.shesha.app/login | QA |
| Admin portal (DSD staff) | https://dsd-npo-adminportal-qa.shesha.app/login | QA |
| API | https://dsd-npo-api-qa.shesha.app | QA |

## Credentials
| Role | Username | Password |
|------|----------|----------|
| Shared / dev account | mpenduloizwelinuk@gmail.com | 123qwe |

> ⚠️ **This one account logs into BOTH portals**, and on the admin portal it exposes the full `Configurations` menu — so it is almost certainly the developer's broadly-privileged account, not a role-scoped test user. **Role-based testing is not meaningful until we have a DSD-staff account and an NPO-applicant account kept separate.** Thabiso K asked us to create our own users; whether the cross-portal admin access is intended is an open question for him.

## Ownership
| Key | Value |
|-----|-------|
| Lead tester | **Thabiso Kegakwile** — business rules and expected results come from him, and he authored the ADO cases |
| Stability | ⚠️ Thabiso warns the module is **unstable**; expect environment failures. Rule out the harness and the API layer before calling anything an app bug. |

## Azure DevOps
| Key | Value |
|-----|-------|
| Organization | boxfusion |
| Project | Boxfusion Test Plans |

| Plan | ID | Cases | Suites | Imported |
|---|---|---|---|---|
| [DSD-NPO — **Smoke** Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101541) | **101541** | 70 | 20 | ✅ all 70, 2026-08-13 |
| [DSD-NPO — **Functional** Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543) | **101543** | 314 | 36 | ⬜ not yet — "the missing functional stuff" |

🔑 **The two plans SPLIT one TC series — they are not duplicates.** TC-03-001/004/005/006/008/016 live in
*Smoke*; TC-03-002/003/007/009+ live in *Functional*. **Always search BOTH plans for a TC number** before
concluding a case does not exist.

**Case format.** Titles are `[TC-NN-NNN | Src:FDS|Code|Both | Public|Admin|Email-Link] <description>`, with
Preconditions, Portal, and a `Drift-Risk` tag wherever Thabiso's code review contradicts the FDS. Some carry code
anchors (`NpoPersonManger.cs:147-170 @ a198cfab`). **Expected results are prescribed verbatim** — quote the ADO
step or don't call it a bug.

⚠️ **Every case is state `Design`**, and the newest are tagged `L1-draft` ("requires L3 validation"). They are
authored but **not signed off**, so treat them as the best available spec while expecting churn. This supersedes
the older note that the module "has no official test cases yet".

### Reading the plans without the ADO MCP
The `ado` MCP tools are enumerated at session start, so a server that connects mid-session contributes nothing.
When they are missing, **do not ask for a restart** — drive the browser instead:
1. `browser_navigate` to the ADO URL → sign in through the Microsoft prompt (the user enters password + MFA).
2. Call the REST API from `browser_evaluate` with `fetch`. **Cookies authenticate automatically** because the page
   origin is `dev.azure.com` — no PAT, no `az login`.
```
GET  {org}/{project}/_apis/testplan/Plans/{planId}/suites?api-version=7.1
GET  {org}/{project}/_apis/testplan/Plans/{planId}/Suites/{suiteId}/TestCase?api-version=7.1
POST {org}/_apis/wit/workitemsbatch?api-version=7.1   body {ids:[…≤200], fields:[…]}
```
Pass `filename:` to `browser_evaluate` for anything large (the full pull was 661 KB) and move it out of the repo.
`Microsoft.VSTS.TCM.Steps` is XML whose inner HTML is **double-escaped** — unescape entities *before* stripping
tags, or `&lt;P&gt;` survives as a literal `<P>`. ⚠️ WebFetch cannot do this; `dev.azure.com` 302s to sign-in.

## Known breakage (observed 2026-08-12, first look)
| Symptom | Where |
|---|---|
| `404 /api/services/dsdnpo/NpoPerson/CurrentPersonLogin` | public portal |
| `404 /signalr-timeline/negotiate` — real-time timeline never connects | admin portal |
| `Failed to execute action 'shesha.common:Execute Script', error: undefined` | public portal |
| `workflows-inbox` renders with no columns and 0 rows | admin portal — **unconfirmed** whether empty inbox or fault |
| ✅ **RESOLVED** — "**Next** timed out" is a **DISABLED BUTTON**, not a hang. Assert `disabled` directly; a click timeout here means a mandatory field is unsatisfied | public registration wizard |
| ✅ **RETIRED 2026-08-20** — "address autocomplete renders no suggestions" was a harness error (I searched Google's `.pac-container`; this app uses its own **`div.suggestion`**), and the follow-up "lat/long blank blocks Next" was also wrong. **Registration is NOT blocked** — APPL26-01494 completed E2E. What remains: **lat/long are never populated** (display-only, no manual fallback) → Spatial Map has no coordinates. ADO #101632 / TC-03-008 needs re-verdicting | both portals |
| 🔴 **Unstarred mandatory fields silently disable Next / Save / Reject** — no star, no inline error, no `aria-invalid`, no persistent message. 3 instances found 2026-08-20 (**National (SA)** on Org Details; duplicate OB mobile; **Additional Reasons for rejection** in Doc Verification, whose radio renders pre-set + disabled so it looks answered). **When a forward button is disabled, do not assume it is the field you are looking at** | both portals |
| 🔴 **Any 13-digit SA ID typed into the OB form returns a real person's name/DOB/gender**; the on-screen mask is cosmetic — the unmasked name is in the DOM and in the saved grid. **POPIA. Never transcribe these values into reports** | public portal |
| 🔴 **Server validation errors are silently discarded** — a rejected 400 save looks identical to success | both portals |
| ⚠️ Sign-In has **no "Create User Account" button**; sign-up is a 3-step **mobile-OTP** flow (`Register` → Verify Mobile Number → name/email → password) with **no SA ID field anywhere**. ADO #101603/#101604 and the Functional SA-ID/DHA cases are not executable as written | public portal, recorded 2026-08-13 |
| ⚠️ **All Applications has no `Risk Status` column** — ADO #101712 prescribes it. Live columns: Application Ref · Organisation Name · Whatsapp Number · Email Address · Legal Form · No. of Office Bearers · Application Status · Date Received | admin portal |
| Empty `<title>` on both portals; nav reads "Spartial Map" and "All Apllications" | both — noted, not raised as defects |

## Automation notes specific to this project
- 🔑 **Switch the header view mode from `Live` to `Latest` immediately after login, on every run.** Both portals show
  the mode in the header and default to **Live**, which renders the *published* form version. Latest renders the
  latest configured version, which is what we are testing. Missed on the first DSD-NPO runs of 2026-08-12 — all of
  them unknowingly exercised `create-npo v60 LIVE`. The control is an `.ant-dropdown-trigger` reading `Live`; pick
  `Latest` from the menu that opens, then confirm via the header's form-version badge (it should show `DRAFT` where a
  newer version exists). Note that a form with no newer version stays `vNN LIVE` in Latest mode — that is expected,
  not a failed switch.
- **Both portals are Next.js SPAs.** Wait for real hydration before reading the DOM — while loading, the body contains `Initializing...` or raw `self.__next_f` flight data, and a fixed delay is not enough. Wait for `input[type=password]` on login pages.
- 🔑 **Hidden controls are mounted.** `button:has-text("Register a new NPO")` matched only invisible duplicates, so `.first()` never resolved. **Loop `.all()` and click the first element that `isVisible()`.**
- **Login lands on `/dynamic/Shesha.Workflow/workflows-inbox`**, not the NPO landing page. The landing page is behind the **Register NPO** nav link → `/dynamic/boxfusion.dsdnpo/no-existing-npo-landing-page`.
- Clicking **Next** on the POPIA page **creates a workflow instance** — the URL becomes `/shesha/workflow-action?id=<paId>&todoid=<todoId>`. Track that id; resume the draft rather than starting a fresh registration each run.
- The *Documents* step uses AntD Upload — injecting into the hidden file input does **not** bind. Use a real `setInputFiles` on the visible control or a real click.
- Keep automated free text **≤100 characters**. Long QA prose has caused silent 500s elsewhere in this hub.
- Use **0818400598** for any phone/SMS field so delivery can be checked on the handset.

## Test Artifacts (per-project)

| Artifact | Path (within this project) |
|---|---|
| **JUnit XML** | `test-results/junit.xml` |
| **Allure raw** | `allure-results/*.json` |
| **Allure report** | `allure-report/index.html` |
| **Playwright JSON** | `test-results/results.json` |
| **Run report** | `test-reports/YYYY-MM-DD/<name>.md` |
| **Bug log** | `test-reports/bugs/<name>.md` |
| **Non-run docs** (audits, consistency passes) | `test-reports/audits/` |

## Core Constraints
- **Plans are markdown.** `.md` files in [test-plans/](test-plans/) are canonical.
- **Specs are derived.** Don't hand-edit `.spec.ts` outside of AI-repair flow.
- **Playwright-first.** Always try the script before falling back to AI.
- **AI repair patches only the failing step.**
- **Always snapshot before AI repair edits.**
- **Fail fast on blockers.** A failed `(BLOCKING)` assertion stops the test.
- **Always render the Allure report after a run.**
- **Expected results come from the ADO test cases first, then Thabiso.** As of 2026-08-13 there ARE official cases — 384 of them across the two plans — and they prescribe expected results verbatim. Quote the ADO step, or log the finding as a **question for Thabiso** rather than a defect. Where the app and the case disagree, say which one needs changing; sometimes it is the case.

## Test plan map (smoke plan 101541 — all 20 suites imported)

| Plan | Suite | Cases | Runnable today? |
|---|---|---|---|
| `auth/01-authentication-account-creation` | 101858 | 3 | ✅ TC-01 · ⚠️ TC-02/03 diverge from the build |
| `npo-registration/02-npo-linking-and-landing` | 101859 | 3 | ✅ TC-01 · ⚠️ TC-02 needs a real NPO number |
| `npo-registration/03-wizard-org-details-objectives` | 101860 | 8 | ✅ TC-01→05 · 🔴 TC-06 is the blocker |
| `npo-registration/04-wizard-office-bearers` | 101861 | 3 | ⛔ blocked |
| `npo-registration/05-wizard-admin-docs-declaration` | 101862 | 10 | ⛔ blocked — **TC-05 is the gateway case** |
| `npo-registration/06-office-bearer-self-confirmation` | 101863 | 2 | ⛔ blocked + needs mailboxes |
| `application-processing/07-application-triage-and-verification` | 101864 | 7 | ✅ TC-01→04 |
| `annual-compliance/08-annual-report-submission` | 101865 | 5 | ⛔ needs a registered NPO |
| `annual-compliance/09-annual-report-backend-quality-assure` | 101866 | 3 | ✅ TC-01 |
| `post-registration/10a-post-registration-admin` | 101867 | 2 | ✅ both (read-only) |
| `post-registration/10p-post-registration-submitter` | 101868 | 4 | ⛔ needs a registered NPO |
| `appeals/11a-appeals-admin-tribunal` | 101869 | 3 | ✅ TC-01 |
| `appeals/11p-appeals-submitter` | 101870 | 2 | ⛔ needs a **denied** application |
| `investigations/12a-investigations-admin` | 101871 | 2 | ✅ TC-01 |
| `investigations/12p-investigations-public-submission` | 101872 | 1 | ✅ **yes — no login at all** |
| `deregistration/13a-voluntary-deregistration-admin` | 101874 | 2 | ✅ TC-01 · 🔴 TC-02 deregisters a live NPO |
| `deregistration/13p-voluntary-deregistration-submitter` | 101875 | 4 | ⛔ · 🔴 TC-01 expected to FAIL by design |
| `cross-cutting/14s-public-npo-search` | 101880 | 1 | ✅ **yes** |
| `cross-cutting/14w-accessibility-wcag` | 102150 | 1 | ⚠️ partial — run steps 1–2 and 5–6 |
| `education-awareness/15-education-awareness-smoke` | 107359 | 4 | ✅ **all four, incl. a create** |

Specs share `test-plans/_helpers.ts` (recorded selectors, login, Live→Latest, grid readers, the
`fill()`-doesn't-bind workaround, and the >=400 response-body capture). Fix a drifted selector **there**, once.

**Blocked suites are gated by env var** so they report `SKIPPED` rather than a wall of selector noise:
`DSD_REGISTRATION_UNBLOCKED` · `DSD_REGISTERED_NPO` · `DSD_DENIED_APPLICATION` · `DSD_OB_CONFIRM_LINK` ·
`DSD_OWN_DEREG_REF` · `DSD_NONCOMPLIANT_NPO` · `DSD_CIPC_NUMBER`.
