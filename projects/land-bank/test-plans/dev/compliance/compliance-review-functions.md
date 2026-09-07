# Test Plan: DEV-COMP-1.1 — Compliance Route Functions (Dev)

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-24
> **Estimated Duration:** 2m

## Metadata
| Field | Value |
|-------|-------|
| App | Land Bank CRM (Admin Portal) |
| Environment | Dev (`DEV_APP_URL`, `TEST_ENV=dev`) |
| Login As | **COMPLIANCE** role (`DEV_COMPLIANCE_USERNAME` / `DEV_COMPLIANCE_PASSWORD`) |
| Screens under test | Dashboard (Compliance), Opportunities - Compliance, Opportunity detail → Compliance tab, Cases |

## Objective
> Exercise every function exposed on the Dev compliance route, signed in as the COMPLIANCE role
> rather than as Admin — the role the screens are built for. Covers the compliance dashboard's
> tiles/filters/actions, the compliance opportunities grid's toolbar functions, the Compliance tab
> on an opportunity, and the Cases listing the role lands on.

## Preconditions
- [ ] Dev site reachable at `DEV_APP_URL`
- [ ] `DEV_COMPLIANCE_USERNAME` / `DEV_COMPLIANCE_PASSWORD` in the gitignored `.env`
- [ ] The compliance user has at least one opportunity visible on Opportunities - Compliance

> **Note (2026-08-24, recorded live against Dev as `andiswaN`):**
>
> **The COMPLIANCE role does not land on the user dashboard.** Sign-in redirects to
> **Cases** (`/dynamic/LandBank.Crm/lbService-requests`), not `/dynamic/user-dashboard`. Any
> compliance plan that waits for the Admin landing route will hang.
>
> **The role sees a restricted 4-item menu:** Dashboard (Compliance)
> (`/dynamic/compliance-dashboard`), Opportunities - Compliance, Cases, Create Questionnaire.
> There is no Leads/Opportunities/Inbox for this role.
>
> **Grids are ARIA-role tables, not `<table>` tags.** `document.querySelectorAll('table')` returns
> 0 while `[role="table"]` returns 1 with 12 `[role="columnheader"]` children. Assert with
> `getByRole('table')` / `getByRole('columnheader')`; a CSS `table`/`.ant-table` locator finds nothing.
>
> **The dashboard `h1` is a time-of-day greeting** — "Good morning, Andiswa". Never assert that
> literal: it changes through the day and embeds the user's first name. Assert the stable `h3`
> section headings and the stat-tile labels instead.
>
> Volumes at recording time (Dev): Cases **176 items**, Opportunities - Compliance **685 items**,
> compliance dashboard **Open Cases 139 / Pending Decisions 139**. Counts are asserted as
> "greater than zero", never as fixed numbers.
>
> Landmarks captured:
> | Screen | Route | Landmarks |
> |---|---|---|
> | Dashboard (Compliance) | `/dynamic/compliance-dashboard` | `h1` greeting; `h3` **Team Cases**, **Team Workload**, **Decisions This Week**, **Team Activity**; tiles *Open Cases*, *Assigned Today*, *Pending Decisions*, *Closed This Week*; buttons **Refresh**, **Export**, **Received today**, **Date Received**, **Decision**, `Open case LA-…`; **FILTER BY Status** options *New*, *In progress*, *Signed off*, *Closed (blocked)* |
> | Opportunities - Compliance | `/dynamic/LandBank.Crm/LBOpportunity-table-Compliance` | `h4` **All Opportunities**; `role=table` + 12 columnheaders; toolbar search / filter / reload / column-chooser icons; **Export**; pager "1-10 of 685 items" |
> | Opportunity detail | `/dynamic/LandBank.Crm/LBOpportunity-details?id=…` | Tabs incl. **Compliance**; inner tabs *Client Info / Loan Info / Farms / Compliance*; **Edit**, **Audit Log** |
> | Compliance tab | (same page) | **Compliance Overview**; *Entity Verifications* with "Entity Compliance Status: Completed"; **Signatories** and **Directors** verification lists showing per-party review state (*Awaiting Review*, *MATCH*); **Add Signatory** / **Add Director** actions |
> | Cases | `/dynamic/LandBank.Crm/lbService-requests` | `h4` **All Cases**; columns incl. *Compliance Decision*, *Assigned To*, *Priority* |

## Test Cases

### TC-01 — Compliance user signs in and lands on Cases
- **Type:** Happy path
- **Steps:**
  - NAVIGATE to `/login`
  - SNAPSHOT — confirm the login form is rendered
  - TYPE the Username field with the compliance username (from `.env`)
  - TYPE the Password field with the compliance password (from `.env`)
  - CLICK **Sign In**
  - WAIT for the app to redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`
  - [x] ASSERT the landing route is the **Cases** listing, not the user dashboard
  - [x] ASSERT the **All Cases** heading is displayed

---

### TC-02 — The compliance role sees only its own menu items
- **Type:** Authorisation
- **Depends on:** TC-01
- **Steps:**
  - SNAPSHOT — capture the side menu
- **Assertions:**
  - [x] ASSERT **Dashboard (Compliance)** is present in the menu
  - [x] ASSERT **Opportunities - Compliance** is present in the menu
  - [x] ASSERT **Cases** is present in the menu
  - [x] ASSERT **Leads** is NOT present (Admin-only for this role)

---

### TC-03 — Compliance dashboard renders its sections and stat tiles
- **Type:** Happy path
- **Depends on:** TC-01
- **Steps:**
  - CLICK **Dashboard (Compliance)** in the side menu
  - WAIT for the dashboard to load
  - SNAPSHOT — confirm the sections and tiles
- **Assertions:**
  - [x] ASSERT the URL is `/dynamic/compliance-dashboard`
  - [x] ASSERT the **Team Cases**, **Team Workload**, **Decisions This Week** and **Team Activity** sections are displayed
  - [x] ASSERT the **Open Cases**, **Assigned Today**, **Pending Decisions** and **Closed This Week** tiles are displayed
  - [x] ASSERT the **Open Cases** tile shows a numeric value

---

### TC-04 — Compliance dashboard status filters are available
- **Type:** Function
- **Depends on:** TC-03
- **Steps:**
  - SNAPSHOT — locate the **FILTER BY Status** control
- **Assertions:**
  - [x] ASSERT the status filter offers **New**, **In progress**, **Signed off** and **Closed (blocked)**

> **FILTER BY Status is a native `<select>`, not a row of chips.** Its options are hidden while the
> select is closed, so this asserts each option *exists* rather than that it is visible — a
> visibility assertion here fails correctly and misleadingly.

---

### TC-05 — Compliance dashboard Refresh and Export actions
- **Type:** Function
- **Depends on:** TC-03
- **Steps:**
  - SNAPSHOT — locate the toolbar
  - CLICK **Refresh**
  - WAIT for the dashboard to settle
- **Assertions:**
  - [x] ASSERT the **Refresh** button is displayed and clickable
  - [x] ASSERT the **Export** button is displayed
  - [x] ASSERT the dashboard sections are still displayed after refreshing

---

### TC-06 — Compliance dashboard lists open cases
- **Type:** Function
- **Depends on:** TC-03
- **Assertions:**
  - [x] ASSERT at least one `Open case LA-…` action is displayed in Team Cases
  - [x] ASSERT the **Date Received** and **Decision** column controls are displayed

---

### TC-07 — Opportunities - Compliance grid renders
- **Type:** Happy path
- **Depends on:** TC-01
- **Steps:**
  - CLICK **Opportunities - Compliance** in the side menu
  - WAIT for the listing to load
  - SNAPSHOT — confirm heading, grid, columns
- **Assertions:**
  - [x] ASSERT (BLOCKING) the URL is `/dynamic/LandBank.Crm/LBOpportunity-table-Compliance`
  - [x] ASSERT the **All Opportunities** heading is displayed
  - [x] ASSERT the grid is displayed
  - [x] ASSERT the compliance columns *Application Status*, *Opportunity Owner* and *From Lead* are displayed
  - [x] ASSERT the grid holds at least one row

---

### TC-08 — Quick search filters the compliance grid
- **Type:** Function
- **Depends on:** TC-07
- **Steps:**
  - EXTRACT the total item count from the pager
  - TYPE a search term into the grid's quick-search box
  - WAIT for the grid to refresh
- **Assertions:**
  - [x] ASSERT the search box accepts input
  - [x] ASSERT the grid responds — the result count changes or the rows re-render without error

---

### TC-09 — Grid toolbar functions are available
- **Type:** Function
- **Depends on:** TC-07
- **Assertions:**
  - [x] ASSERT the **Export** button is displayed
  - [x] ASSERT the toolbar exposes the reload, filter and column-chooser controls

---

### TC-10 — Pagination moves through the compliance grid
- **Type:** Function
- **Depends on:** TC-07
- **Steps:**
  - SNAPSHOT — confirm the pager shows more than one page
  - CLICK the **Next Page** control
  - WAIT for the grid to refresh
- **Assertions:**
  - [x] ASSERT the pager advances to page 2
  - [x] ASSERT the grid still displays rows after paging

---

### TC-11 — Open an opportunity from the compliance grid
- **Type:** Happy path
- **Depends on:** TC-07
- **Steps:**
  - CLICK the view action on the first grid row
  - WAIT for the opportunity detail to load
- **Assertions:**
  - [x] ASSERT (BLOCKING) the URL is the opportunity detail route with an `id` parameter
  - [x] ASSERT the **Compliance** tab is displayed on the detail page

---

### TC-12 — Compliance tab shows entity and party verifications
- **Type:** Function — core compliance review
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE directly to a known **entity-type** opportunity (`LBOpportunity-details?id=4a01cda7-…`, BOXFUSION (PTY)LTD)
  - CLICK the **Compliance** tab
  - WAIT for the compliance panel to render
  - SNAPSHOT — confirm the verification sections
- **Assertions:**
  - [x] ASSERT the **Compliance Overview** section is displayed
  - [x] ASSERT the **Entity Verifications** section reports an entity compliance status
  - [x] ASSERT the **Signatories** and **Directors** verification lists are displayed
  - [x] ASSERT at least one party shows a review state (e.g. *Awaiting Review*)

> **The Add-party actions are not part of this screen.** *Add Signatory* / *Add Director* /
> *Add CEO & Managing Official* are present in the DOM while the Compliance tab is open, but hidden
> — they belong to the record's own **Directors** / **Signatories** / **CEO** tabs, which render
> without being displayed. They are maintenance actions on those tabs, not functions of the
> compliance review panel, so they are asserted nowhere in this plan.
>
> Two locator traps in this panel, both recorded the hard way:
> - The entity status label is **split across DOM nodes** — it renders as "Entity" +
>   "\n Compliance Status: Completed" — so no element contains "Entity Compliance Status"
>   contiguously. Match `Compliance Status:` instead.
> - "Signatories" and "Directors" each match **two** elements: the visible section label and a
>   hidden `<div role="tab">` in an inactive tab strip. An unfiltered text match picks the hidden
>   tab and reports "hidden" for a section that is plainly on screen; filter to visible.

> **Pinned to an entity-type opportunity on purpose.** Entity Verifications, Directors and
> Signatories only populate for entity applications. Following the grid's first row lands on
> whatever was created most recently — an individual application shows none of these sections, and
> this test failed against a page that was behaving correctly. TC-11 covers the generic
> open-from-grid path; this case needs deterministic content. If the pinned record is ever deleted
> from Dev, TC-12 fails on its first assertion with a clear message rather than misreporting.

---

### TC-13 — Cases listing exposes the compliance decision
- **Type:** Function
- **Depends on:** TC-01
- **Steps:**
  - CLICK **Cases** in the side menu
  - WAIT for the listing to load
- **Assertions:**
  - [x] ASSERT the URL is `/dynamic/LandBank.Crm/lbService-requests`
  - [x] ASSERT the **All Cases** heading is displayed
  - [x] ASSERT the *Compliance Decision*, *Assigned To* and *Priority* columns are displayed

## Out of scope
**Submitting a compliance decision.** Recording stopped short of changing any party's review state or
signing off an application — that mutates real Dev records and belongs in a plan with its own
test-data setup and teardown. Every assertion here is read-only apart from TC-05's Refresh, TC-08's
search box and TC-10's paging, none of which persist anything.
