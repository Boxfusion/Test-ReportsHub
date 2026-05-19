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

## Regenerating manually

```bash
node scripts/build-all.js
```

Or per project:

```bash
node scripts/build-project-dashboard.js --project=dep
node scripts/build-landing.js
```
