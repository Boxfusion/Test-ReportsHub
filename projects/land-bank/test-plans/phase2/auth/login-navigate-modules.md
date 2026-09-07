# Test Plan: P2-AUTH-1.1 — Phase 2 Login and Module Navigation

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-24
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App | Land Bank CRM (Admin Portal) — **Phase 2** |
| Environment | Phase2 (`PHASE2_APP_URL`, requires `TEST_ENV=phase2`) |
| Login As | Admin role (`PHASE2_ADMIN_USERNAME` / `PHASE2_ADMIN_PASSWORD` in the gitignored `.env`) |
| Login page | `/login` |
| Landing page | Dashboard (User) — `/dynamic/user-dashboard` |
| Pages under test | Every side-menu module reachable on Phase 2 (see TC-03 … TC-09) |

## Objective
> Validate that an Admin can authenticate against the Phase 2 site and reach each module from
> the left-hand side menu, and that each destination renders its expected landmark. This is the
> **smoke baseline** for Phase 2 — it proves the environment, credentials, and routes are wired
> up before the deeper per-module flows are authored.

## Preconditions
- [ ] Phase 2 site reachable at `PHASE2_APP_URL`
- [ ] `TEST_ENV=phase2` for the run (or `APP_URL` set to the Phase 2 URL) — **without this the run
      silently targets Dev**, because `baseURL` comes from `<TEST_ENV>_APP_URL`
- [ ] `PHASE2_ADMIN_USERNAME` / `PHASE2_ADMIN_PASSWORD` present in `.env`
- [ ] Signed-in Admin sees the full side menu

> **Note (2026-08-24, recorded live against Phase 2):** The login form matches Dev —
> placeholder-labelled *Username* / *Password* inputs, no `<label for>`, and two primary buttons
> (**Sign In**, **Sign in with Microsoft**) so **Sign In** must be matched with `exact: true`.
> Post-login landing is `/dynamic/user-dashboard`.
>
> Side-menu items are Ant Design `<li role="menuitem">` with **no accessible name** — the name is on
> the nested anchor, so every module resolves as `role=link`, not `role=menuitem` (same as Dev).
> **"Opportunities" matches 2 links as a substring** (it is a prefix of "Opportunities - Compliance"),
> so it needs `exact: true`; all 8 targeted items resolve to exactly 1 link when matched exactly.
>
> Grids on this build are **plain `<table>` elements, not `.ant-table`** — a `.ant-table` locator
> finds nothing even after 15s. Assert on `role=table`.
>
> Landmarks captured per page:
> | Module | Route | Landmark observed |
> |---|---|---|
> | Dashboard (User) | `/dynamic/user-dashboard` | `h2` "My Dashboard" |
> | Dashboard (Management) | `/dynamic/management-dashboard` | `h2` "Management Dashboard", 2 grids |
> | Inbox | `/dynamic/Shesha.Workflow/workflows-inbox` | `h4` "Incoming Items" + `h4` "No Data" (empty) |
> | Leads | `/dynamic/LandBank.Crm/LBLead-table` | `h4` "All Leads", **New Lead** button, table, "1-10 of 26 items" |
> | Opportunities | `/dynamic/LandBank.Crm/LBOpportunity-table` | `h4` **view-selector** — "All Opportunities" (3 items) in a fresh session; see below |
> | Opportunities - Compliance | `/dynamic/LandBank.Crm/LBOpportunity-table-Compliance` | `h4` "All Opportunities", table, 11 rows |
> | Cases | `/dynamic/LandBank.Crm/lbService-requests` | `h4` "All Cases", 11 columns, 0 rows |
> | Create Questionnaire | `/dynamic/LandBank.Crm/landbank-questionnaire-table` | **Add** + **Export** buttons, single *Name* column, 0 rows |
>
> **Empty-state modules.** Inbox, Cases and Create Questionnaire held **no data** at recording time.
> Their assertions therefore check that the page's own landmark renders, and deliberately do **not**
> assert row counts — a row-count assertion here would encode today's empty database as the expected
> result and would start failing the moment real data lands.
>
> **The Opportunities heading is a stateful view selector — do not assert one view name.** The `h4`
> on the Opportunities listing is the label of a `table-view-selector` dropdown, not a static page
> title. It was first recorded as "Active Opportunities" showing "No Data", but that was the
> *recording session's own* selected view: a fresh browser context defaults to **"All Opportunities"
> with 3 items**, and asserting the literal "Active Opportunities" failed 3 runs out of 3. TC-06
> therefore accepts either known view label and leans on the URL plus the grid's columns, which do
> not shift with the selected view.
>
> Note the Opportunities and Opportunities - Compliance listings share the heading text
> "All Opportunities", so the heading alone cannot tell them apart — the URL assertion is what
> distinguishes them, which also proves the `exact: true` menu locator picked the right link.

## Test Cases

### TC-01 — Log in to the Phase 2 site as an Admin
- **Type:** Happy path
- **Steps:**
  - NAVIGATE to `/login`
  - SNAPSHOT — confirm the login form (Username + Password fields, Sign In button) is rendered
  - TYPE the Username field with the Phase 2 admin username (from `.env`)
  - TYPE the Password field with the Phase 2 admin password (from `.env`)
  - SNAPSHOT — confirm the **Sign In** button is enabled
  - CLICK **Sign In**
  - WAIT for the app to redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`
  - [x] ASSERT the landing route is `/dynamic/user-dashboard`
  - [x] ASSERT the authenticated shell is displayed — the side menu shows the **Leads** item

---

### TC-02 — The run is actually pointed at the Phase 2 site
- **Type:** Guard rail
- **Depends on:** TC-01
- **Steps:**
  - EXTRACT the origin of the current page URL
- **Assertions:**
  - [x] ASSERT (BLOCKING) the page origin matches `PHASE2_APP_URL`

> Guards the most likely silent failure for this plan: running it with the default `TEST_ENV=dev`
> would authenticate against Dev and pass every remaining assertion, reporting Phase 2 as green
> while never touching it.

---

### TC-03 — Navigate to Dashboard (Management)
- **Type:** Happy path
- **Depends on:** TC-01
- **Steps:**
  - SNAPSHOT — confirm the side menu is rendered
  - CLICK the **Dashboard (Management)** item in the side menu
  - WAIT for the management dashboard to load
- **Assertions:**
  - [x] ASSERT the URL is `/dynamic/management-dashboard`
  - [x] ASSERT the **Management Dashboard** heading is displayed

---

### TC-04 — Navigate to Inbox
- **Type:** Happy path
- **Depends on:** TC-01
- **Steps:**
  - CLICK the **Inbox** item in the side menu
  - WAIT for the inbox to load
- **Assertions:**
  - [x] ASSERT the URL is `/dynamic/Shesha.Workflow/workflows-inbox`
  - [x] ASSERT the **Incoming Items** heading is displayed

---

### TC-05 — Navigate to Leads and confirm the grid renders
- **Type:** Happy path
- **Depends on:** TC-01
- **Steps:**
  - CLICK the **Leads** item in the side menu
  - WAIT for the Leads listing to load
  - SNAPSHOT — confirm the heading, grid, and toolbar
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **All Leads** heading is displayed
  - [x] ASSERT the URL is `/dynamic/LandBank.Crm/LBLead-table`
  - [x] ASSERT the Leads data grid is displayed
  - [x] ASSERT the grid exposes the expected columns (*Date Created*, *Client Type*, *First Name*, *Last Name*, *Lead Status*)
  - [x] ASSERT the **New Lead** toolbar button is displayed

---

### TC-06 — Navigate to Opportunities
- **Type:** Happy path
- **Depends on:** TC-01
- **Steps:**
  - CLICK the **Opportunities** item in the side menu (match exactly — it is a prefix of "Opportunities - Compliance")
  - WAIT for the listing to load
- **Assertions:**
  - [x] ASSERT (BLOCKING) the URL is exactly `/dynamic/LandBank.Crm/LBOpportunity-table` (not the `-Compliance` route)
  - [x] ASSERT the view-selector heading shows a known Opportunities view (*All Opportunities* or *Active Opportunities*)
  - [x] ASSERT the opportunities grid is displayed
  - [x] ASSERT the grid exposes the expected columns (*Date Created*, *Account*, *Loan Amount*)

---

### TC-07 — Navigate to Opportunities - Compliance
- **Type:** Happy path — Phase 2 module
- **Depends on:** TC-01
- **Steps:**
  - CLICK the **Opportunities - Compliance** item in the side menu
  - WAIT for the listing to load
  - SNAPSHOT — confirm the heading and grid
- **Assertions:**
  - [x] ASSERT the URL is `/dynamic/LandBank.Crm/LBOpportunity-table-Compliance`
  - [x] ASSERT the **All Opportunities** heading is displayed
  - [x] ASSERT the compliance grid is displayed
  - [x] ASSERT the grid exposes the compliance-specific columns (*Application Status*, *Opportunity Owner*, *From Lead*)

---

### TC-08 — Navigate to Cases
- **Type:** Happy path — Phase 2 module
- **Depends on:** TC-01
- **Steps:**
  - CLICK the **Cases** item in the side menu
  - WAIT for the listing to load
- **Assertions:**
  - [x] ASSERT the URL is `/dynamic/LandBank.Crm/lbService-requests`
  - [x] ASSERT the **All Cases** heading is displayed
  - [x] ASSERT the grid exposes the case columns (*Compliance Decision*, *Assigned To*, *Priority*)

---

### TC-09 — Navigate to Create Questionnaire
- **Type:** Happy path — Phase 2 module
- **Depends on:** TC-01
- **Steps:**
  - CLICK the **Create Questionnaire** item in the side menu
  - WAIT for the listing to load
- **Assertions:**
  - [x] ASSERT the URL is `/dynamic/LandBank.Crm/landbank-questionnaire-table`
  - [x] ASSERT the **Add** toolbar button is displayed
  - [x] ASSERT the questionnaire grid exposes a *Name* column

## Out of scope
Creating records in any module. `Add` on Create Questionnaire and `New Lead` on Leads are asserted
as **present only** — exercising them belongs in per-module plans. Compliance decisioning on
*Opportunities - Compliance* needs the COMPLIANCE role (`PHASE2_COMPLIANCE_*`) and is not covered here.
