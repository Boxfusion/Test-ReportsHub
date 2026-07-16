# CLAUDE.md — Hybrid Markdown + Playwright Testing (DHA Invoice Tracking project)

> **Multi-project hub.** This file describes the **DHA SmartGov Invoice Tracking (ITS)** project. Shared Playwright + Allure infrastructure (`package.json`, `playwright.config.ts`, `node_modules/`, `scripts/run-plan.js`) lives at the hub root one level up. Tests run from the hub root: `node scripts/run-plan.js projects/DHA-Invoice-Tracking/test-plans/<folder>/<plan>.md`.

> **Same ITS workflows as PD.** DHA is a separate SmartGov deployment for the Department of Home Affairs. The Invoice Tracking process definitions (BAS / LOGIS Request For Payment) are the same as the PD-Invoice-Tracking project — the plans were seeded from PD. Only the App URL, credentials, and role assignees differ. Confirmed live 2026-07-16: identical form schema, supplier picker, invoice grid, and submit routing.

This project uses **markdown plans as the source of truth** and **Playwright `.spec.ts` files as a derived runtime artefact**. Plans live in [test-plans/](test-plans/); each plan has a paired `.spec.ts` beside it that Playwright executes for speed. When a script step fails or hits a `TODO` marker, Claude falls back to AI-driven MCP browser execution, repairs the failing step in the spec, and re-runs.

> **The .md plan is canonical.** The .spec.ts is a generated, self-healing artefact. Edit the .md, not the spec — except for AI-repair patches, which Claude applies automatically.

## Mandatory Pre-Flight
Before executing ANY test plan:
1. Read this file (`projects/DHA-Invoice-Tracking/CLAUDE.md`) completely
2. Read [test-plans/RULES.md](test-plans/RULES.md) completely
3. Read the specific test plan file (`.md`)
4. Read the paired `.spec.ts` if it exists
5. Only then begin execution

## Application Under Test
| Key | Value |
|-----|-------|
| App | DHA SmartGov Invoice Tracking (ITS) Admin Portal |
| URL | https://dha-smartgov-adminportal-qa.shesha.app/ |
| Environment | QA |

## Credentials
| Role | Username | Password |
|------|----------|----------|
| System Administrator (initiator / BAS Report & Payment Stub imports) | Admin | DHA@Admin_2026#xP4! |

> **Downstream role logins TBC.** As in PD, the BAS/LOGIS chain is multi-role (Invoice Capturer → Branch Finance Admin → Responsible Person → Certifier → Voucher Preparer → Verifier → Authoriser → Payments → Filing). Only the `Admin` (System Administrator) account is confirmed. `Admin` is NOT a Branch Finance Admin — after Register & Upload, the item routes out of Admin's inbox. Record each downstream role login here as it is confirmed live.

### Assignees discovered live (2026-07-16, PAY3092/2026)
| Step / role | Candidate assignees (from workflow tooltip) | Login |
|---|---|---|
| Assign Branch Finance Admin to Assign Certifier | Thabiso Maake, Susanna Maria Erasmus, Hester Johanna Paulina Harding, Tshianeo Moirah Maboya | TBC |

## Notes from first live run (2026-07-16)
- Login lands on `workflows-inbox`. Switch view mode Live → **Latest** right after login (header toggle).
- Sidebar flyout submenus (Workflows → Incoming Items / My Items / Sent / Drafts) intercept pointer events; hover a top-right toolbar button to dismiss the flyout before clicking `Create New`.
- Create New (My Items page) → **BAS Request For Payment** opens the Register & Upload form and assigns the Ref No immediately (PAY####/2026).
- Supplier picker = "Select Item" modal (340k+ suppliers); **double-click** a row to select.
- Invoice grid row: Invoice Date, Service Delivery Date, Invoice No, Invoice Amount, Invoice Attachment (upload) → commit row with the **plus-circle** button; Total Amount then sums.
- Submit redirects to My Items and routes the item to "Assign Branch Finance Admin to Assign Certifier".

## Azure DevOps
| Key | Value |
|-----|-------|
| Organization | boxfusion |
| Project | PD-Shesha 3 Migration |
| Test Plan | #102133 — ITS Automation Test Cases (shared with PD) |

## Test Artifacts (per-project)
| Artifact | Path (within this project) |
|---|---|
| **Allure raw** | `allure-results/*.json` |
| **Allure report** | `allure-report/index.html` |
| **Run report** | `test-reports/YYYY-MM-DD/<name>.md` |
| **Bug log** | `test-reports/bugs/<name>.md` |

## Core Constraints
- **Plans are markdown.** `.md` files in [test-plans/](test-plans/) are canonical.
- **Specs are derived.** Don't hand-edit `.spec.ts` outside of AI-repair flow.
- **Playwright-first.** Always try the script before falling back to AI.
- **Always create our own invoice**, never action one we didn't create.
- **Fail fast on blockers.** A failed `(BLOCKING)` assertion stops the test.
- **Close the browser after finishing.**
