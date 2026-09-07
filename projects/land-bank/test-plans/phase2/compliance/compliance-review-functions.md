# Test Plan: P2-COMP-1.1 — Compliance Route Functions (Phase 2)

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-24
> **Estimated Duration:** 2m

## Metadata
| Field | Value |
|-------|-------|
| App | Land Bank CRM (Admin Portal) — **Phase 2** |
| Environment | Phase2 (`PHASE2_APP_URL`, requires `TEST_ENV=phase2`) |
| Login As | **COMPLIANCE** role (`PHASE2_COMPLIANCE_USERNAME` / `PHASE2_COMPLIANCE_PASSWORD`) |
| Screens under test | Dashboard (Compliance), Opportunities - Compliance, Cases |

## Objective
> Exercise the Phase 2 compliance route as the COMPLIANCE role, mirroring the Dev plan
> (`dev/compliance/compliance-review-functions.md`) so the two environments can be compared
> case by case.

## Preconditions
- [ ] Phase 2 site reachable at `PHASE2_APP_URL`
- [ ] `TEST_ENV=phase2` for the run — **without it the run silently targets Dev**
- [ ] `PHASE2_COMPLIANCE_USERNAME` / `PHASE2_COMPLIANCE_PASSWORD` in the gitignored `.env`

> **Note (2026-08-24, recorded live against Phase 2 as `fatimasamuels`):**
>
> **The compliance menu is missing two items that Dev has.** On Phase 2 the COMPLIANCE role's side
> menu holds only **Cases**, **Users Test (To be removed)** and **Create Questionnaire**. Dev's
> compliance role additionally has **Dashboard (Compliance)** and **Opportunities - Compliance**.
>
> Both screens **exist and work** on Phase 2 and the compliance user is **authorised** for them —
> navigating directly renders the compliance dashboard fully and the compliance grid with 95
> opportunities, with no permission error. So this is a **menu configuration gap, not a permission
> problem**, and this plan reaches both screens by direct URL. TC-02 asserts the gap explicitly so
> it is recorded rather than silently worked around — **when the menu is fixed, TC-02 fails on
> purpose** and should be updated to the Dev form.
>
> Sign-in lands on **Cases**, as on Dev — not `/dynamic/user-dashboard`.
>
> Grids are ARIA-role tables (`[role="table"]`, 12 `[role="columnheader"]`), not `<table>` tags.
>
> The dashboard `h1` is a time-of-day greeting ("Good morning, Fatima") — never asserted.
>
> Volumes at recording time (Phase 2): Cases **31 items**, Opportunities - Compliance **95 items**,
> dashboard **Open Cases 31 / Pending Decisions 31**. Asserted as "greater than zero" only.
>
> **FILTER BY Status is a native `<select>`** — options are hidden while it is closed, so their
> existence is asserted, not their visibility.

## Test Cases

### TC-01 — Compliance user signs in and lands on Cases
- **Type:** Happy path
- **Steps:**
  - NAVIGATE to `/login`
  - SNAPSHOT — confirm the login form is rendered
  - TYPE the Username field with the Phase 2 compliance username (from `.env`)
  - TYPE the Password field with the Phase 2 compliance password (from `.env`)
  - CLICK **Sign In**
  - WAIT for the app to redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`
  - [x] ASSERT the landing route is the **Cases** listing
  - [x] ASSERT the **All Cases** heading is displayed

---

### TC-02 — The run is pointed at Phase 2, and the compliance menu gap is recorded
- **Type:** Guard rail + current-state
- **Depends on:** TC-01
- **Steps:**
  - EXTRACT the origin of the current page URL
  - SNAPSHOT — capture the side menu
- **Assertions:**
  - [x] ASSERT (BLOCKING) the page origin matches `PHASE2_APP_URL`
  - [x] ASSERT **Cases** and **Create Questionnaire** are present in the menu
  - [x] ASSERT **Dashboard (Compliance)** is absent from the menu (Phase 2 gap vs Dev)
  - [x] ASSERT **Opportunities - Compliance** is absent from the menu (Phase 2 gap vs Dev)

> The origin guard is the same one used by `phase2/auth/login-navigate-modules.md`: a default
> `TEST_ENV=dev` run would authenticate against Dev and pass everything below while never touching
> Phase 2 — and worse, on Dev the two "absent" assertions would fail, sending you hunting for a
> Phase 2 regression that does not exist.

---

### TC-03 — Compliance dashboard renders when reached directly
- **Type:** Happy path (direct URL — not menu-reachable on Phase 2)
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE directly to `/dynamic/compliance-dashboard`
  - WAIT for the dashboard to load
  - SNAPSHOT — confirm the sections and tiles
- **Assertions:**
  - [x] ASSERT the URL is `/dynamic/compliance-dashboard`
  - [x] ASSERT no permission or not-found error is shown — the compliance user is authorised
  - [x] ASSERT the **Team Cases**, **Team Workload**, **Decisions This Week** and **Team Activity** sections are displayed
  - [x] ASSERT the **Open Cases**, **Assigned Today**, **Pending Decisions** and **Closed This Week** tiles are displayed
  - [x] ASSERT the **Open Cases** tile shows a numeric value

---

### TC-04 — Compliance dashboard status filters are available
- **Type:** Function
- **Depends on:** TC-03
- **Assertions:**
  - [x] ASSERT the status filter offers **New**, **In progress**, **Signed off** and **Closed (blocked)**

---

### TC-05 — Compliance dashboard Refresh and Export actions
- **Type:** Function
- **Depends on:** TC-03
- **Steps:**
  - CLICK **Refresh**
  - WAIT for the dashboard to settle
- **Assertions:**
  - [x] ASSERT the **Refresh** button is displayed (matched exactly — a second "Refresh activity" control exists)
  - [x] ASSERT the **Export** button is displayed
  - [x] ASSERT the dashboard sections are still displayed after refreshing

---

### TC-06 — Opportunities - Compliance grid renders when reached directly
- **Type:** Happy path (direct URL — not menu-reachable on Phase 2)
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE directly to `/dynamic/LandBank.Crm/LBOpportunity-table-Compliance`
  - WAIT for the listing to load
  - SNAPSHOT — confirm heading, grid, columns
- **Assertions:**
  - [x] ASSERT (BLOCKING) the URL is the compliance opportunities route
  - [x] ASSERT the **All Opportunities** heading is displayed
  - [x] ASSERT no permission error is shown
  - [x] ASSERT the grid is displayed
  - [x] ASSERT the compliance columns *Application Status*, *Opportunity Owner* and *From Lead* are displayed
  - [x] ASSERT the grid holds at least one row

---

### TC-07 — Quick search filters the compliance grid
- **Type:** Function
- **Depends on:** TC-06
- **Steps:**
  - EXTRACT the total item count from the pager
  - TYPE a search term into the grid's quick-search box
  - WAIT for the grid to refresh
- **Assertions:**
  - [x] ASSERT the search box accepts input
  - [x] ASSERT the grid responds — the result set narrows or holds, without error

---

### TC-08 — Grid toolbar functions are available
- **Type:** Function
- **Depends on:** TC-06
- **Assertions:**
  - [x] ASSERT the **Export** button is displayed
  - [x] ASSERT the toolbar exposes the reload, filter and column-chooser controls

---

### TC-09 — Pagination moves through the compliance grid
- **Type:** Function
- **Depends on:** TC-06
- **Steps:**
  - CLICK the **Next Page** control
  - WAIT for the grid to refresh
- **Assertions:**
  - [x] ASSERT the pager advances to page 2
  - [x] ASSERT the grid still displays rows after paging

---

### TC-10 — Open an opportunity from the compliance grid
- **Type:** Happy path
- **Depends on:** TC-06
- **Steps:**
  - CLICK the view action on the first grid row
  - WAIT for the opportunity detail to load
- **Assertions:**
  - [x] ASSERT (BLOCKING) the URL is the opportunity detail route with an `id` parameter
  - [x] ASSERT the **Compliance** tab is displayed on the detail page

---

### TC-11 — Cases listing exposes the compliance decision
- **Type:** Function
- **Depends on:** TC-01
- **Assertions:**
  - [x] ASSERT the **All Cases** heading is displayed
  - [x] ASSERT the *Compliance Decision*, *Assigned To* and *Priority* columns are displayed

## Out of scope
**Submitting a compliance decision** — same reasoning as the Dev plan: it mutates real records and
needs its own test-data setup.

**The Compliance tab's verification content** (Entity Verifications / Signatories / Directors) is
covered on Dev only. The Dev plan pins a known entity-type opportunity to get deterministic
content; no equivalent Phase 2 record was identified during recording, and pinning an arbitrary
Phase 2 row would make the test data-dependent in exactly the way that failed on Dev. TC-10 here
confirms the Compliance tab is reachable; asserting its contents on Phase 2 needs a known entity
application first.
