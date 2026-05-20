# Test Reports Hub

Centralised test report dashboard for Boxfusion projects. Each project keeps its own dashboard under `projects/<name>/`, with a top-level landing page at `index.html` that links to them all.

## Layout

```
Test-ReportsHub/
├── index.html                  ← landing page (auto-generated; do not edit)
├── projects/
│   └── <project>/
│       ├── index.html          ← per-project dashboard (auto-generated)
│       ├── meta.json           ← project metadata (display name, app URL, env)
│       ├── test-plans/         ← mirrored plan .md + .spec.ts (read-only)
│       └── test-reports/
│           ├── YYYY-MM-DD/*.md ← daily run reports
│           └── bugs/*.md
└── scripts/
    ├── build-project-dashboard.js  ← regenerates one project's dashboard
    ├── build-landing.js            ← regenerates the top-level index.html
    └── build-all.js                ← runs both for every project
```

## How reports get here

Each project repo has a `scripts/sync-to-hub.js` (or equivalent) that:

1. Copies its local `test-plans/` and `test-reports/` into `projects/<name>/` here.
2. Runs `node scripts/build-all.js` to regenerate the dashboards.
3. Commits and pushes.

The hub is therefore append-only data plus generated HTML. Never hand-edit the dashboards or reports — fix the source project and re-sync.

## Per-project artifacts

Every `projects/<name>/` folder contains the same set of test artifacts, in the same layout. Standard formats (JUnit XML, Allure) sit alongside our custom markdown layer so any CI/DevOps tool can consume the results without bespoke parsing.

| Artifact | Standard | Path (in this hub) | Consumed by |
|---|---|---|---|
| **JUnit XML** | JUnit schema (`<testsuites><testsuite><testcase>`) | `projects/<name>/test-results/junit.xml` | Azure DevOps "Publish Test Results", GitHub Actions `dorny/test-reporter`, Jenkins, GitLab, any CI |
| **Allure report** | Allure single-file HTML | `projects/<name>/allure-report/index.html` | Humans — opens as in-page modal on the project dashboard |
| **Run report** | Custom markdown | `projects/<name>/test-reports/YYYY-MM-DD/<plan>.md` | Project dashboard, humans |
| **Bug log** | Custom markdown | `projects/<name>/test-reports/bugs/<plan>.md` | Project dashboard, devs |
| **Plan** | Custom markdown (canonical spec) | `projects/<name>/test-plans/<folder>/<plan>.md` | `create-test` / `run-test` skills, humans |
| **Spec** | TypeScript (`@playwright/test`) | `projects/<name>/test-plans/<folder>/<plan>.spec.ts` | Playwright |
| **Project metadata** | JSON | `projects/<name>/meta.json` | Landing page, project dashboard |
| **Project summary** | JSON | `projects/<name>/summary.json` | Landing page (auto-generated) |

Intermediate Playwright artifacts (`results.json`, `playwright-report/`, screenshots/traces) are kept local to each project repo and not synced — they're useful for the developer debugging a failure, but not for the central report view.

## Adding a new project

1. Create `projects/<name>/meta.json`:
   ```json
   {
     "displayName": "My Project",
     "appUrl": "https://...",
     "environment": "QA",
     "sourceRepo": "https://..."
   }
   ```
2. Create empty `projects/<name>/test-plans/` and `projects/<name>/test-reports/` folders (with a `.gitkeep` each).
3. Wire that project's CI / run-test skill to push into `projects/<name>/`.

## Re-running a test from the dashboard

Every row in the **Flows** table on each project dashboard has a `▶ Re-run` button. Clicking it:

1. Opens [.github/workflows/run-test.yml](.github/workflows/run-test.yml) in a new GitHub tab.
2. Shows a toast on the dashboard with the `project` + `plan` values to paste into the workflow inputs.
3. You click **Run workflow** on the GitHub tab. The workflow:
   - Checks out the hub
   - Installs Playwright + Chromium
   - Runs `projects/<project>/<plan>.spec.ts` against the project's test site
   - Writes JUnit XML + a markdown report into `projects/<project>/`
   - Rebuilds the dashboards
   - Commits the new report back to the hub repo
4. Refresh the dashboard ~1–2 minutes later — the flow row's status, sparkline, and timeline pick up the new run automatically.

The button is disabled (greyed) for plans that don't have a paired `.spec.ts` yet. Generate one with the project's `create-test` skill, sync, and the button will activate.

## Regenerating manually

```bash
node scripts/build-all.js
```

Or per project:

```bash
node scripts/build-project-dashboard.js --project=dep
node scripts/build-landing.js
```
