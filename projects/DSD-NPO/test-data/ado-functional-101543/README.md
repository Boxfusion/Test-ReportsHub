# ADO functional plan 101543 — raw pull of the 8 previously-unimported suites

Pulled **2026-08-25** by an authenticated browser session against the Azure DevOps REST API
(`dev.azure.com/boxfusion/Boxfusion Test Plans`). 37 test cases, every suite matching its expected count.

| File | Suite | Cases |
|---|---|---|
| `ado-suite-101889.json` | 06 OB Self-Confirmation | 6 |
| `ado-suite-101892.json` | 09 Annual Compliance backend/QA | 3 |
| `ado-suite-101901.json` | 14C Session / read-only / access control | 5 |
| `ado-suite-101903.json` | 14N Notifications & delivery | 3 |
| `ado-suite-101904.json` | 14R Integration retries (DHA/CIPC) | 2 |
| `ado-suite-101907.json` | 14U Audit trail & resubmission diff | 4 |
| `ado-suite-101908.json` | 14X Concurrency & race conditions | 8 |
| `ado-suite-102152.json` | 14Y POPIA (transport + logging) | 6 |

`titles.txt` is the decoded human-readable form (titles, tags, action/expected step pairs).
`ado-all-suites.json` is all eight combined.

## Why this is committed
Getting it required an **interactive sign-in** — the `ado` MCP server times out and the claude.ai Azure DevOps
connector is unauthenticated. Keeping the raw pull means the remaining plans can be authored later **without needing
that sign-in again**.

## 🔑 Two gotchas for anyone re-pulling
1. `GET /{org}/_apis/connectionData?api-version=7.1` returns **HTTP 400**. Drop `api-version` and it returns 200.
   Getting this wrong made an auth poller report "not signed in" for a fully signed-in session.
2. `Microsoft.VSTS.TCM.Steps` XML is **double HTML-escaped** — unescape twice before parsing.
