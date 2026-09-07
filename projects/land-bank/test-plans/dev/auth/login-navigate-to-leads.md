# Test Plan: AUTH-1.1 — Login and Navigate to Leads

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-30
> **Estimated Duration:** 30s

## Metadata
| Field | Value |
|-------|-------|
| App | Land Bank CRM (Admin Portal) |
| Environment | Dev (`DEV_APP_URL`, active `TEST_ENV=dev`) |
| Login As | Admin role (username/password resolved from `ADMIN_USERNAME` / `ADMIN_PASSWORD` in the gitignored `.env`) |
| Login page | `/login` |
| Landing page | Dashboard (User) — `/dynamic/user-dashboard` |
| Page under test | Side menu → **Leads** (`/dynamic/LandBank.Crm/LBLead-table`) |

## Objective
> Validate that an Admin can authenticate against the Land Bank CRM admin portal and reach the **Leads** listing from the left-hand side menu, and that the Leads grid renders on arrival.

## Preconditions
- [ ] App is reachable at the Dev URL (`DEV_APP_URL`)
- [ ] Valid Admin credentials are present in `.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`)
- [ ] The signed-in Admin has the **Leads** item visible in the side menu

> **Note (2026-07-30, recorded live):** The login form uses **placeholder-labelled** inputs (*Username*, *Password*) — there are no `<label for>` associations — plus two primary buttons, **Sign In** and **Sign in with Microsoft**; the Sign In locator must be matched **exactly** or it resolves to both. After sign-in the app lands on **Dashboard (User)** (`/dynamic/user-dashboard`), not a `/home` route. The side menu is an Ant Design menu whose `<li>` carries `role="menuitem"` but exposes **no accessible name** — the name lives on the nested anchor, so **Leads** resolves as `role=link`, not `role=menuitem`. The Leads page renders an `h4` heading **"All Leads"**, a single data grid (columns: *Date Created, Client Type, First Name, Last Name, Lead Status, Pre-Screening Outcome, Email Address, Mobile Number, Province, Lead Source*), and a **New Lead** button.

## Test Cases

### TC-01 — Log in to Land Bank CRM as an Admin
- **Type:** Happy path
- **Steps:**
  - NAVIGATE to `/login`
  - SNAPSHOT — confirm the login form (Username + Password fields, Sign In button) is rendered
  - TYPE the Username field with the admin username (from `.env`)
  - SNAPSHOT — confirm the Password field is rendered
  - TYPE the Password field with the admin password (from `.env`)
  - SNAPSHOT — confirm the **Sign In** button is enabled
  - CLICK **Sign In**
  - WAIT for the app to redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`
  - [x] ASSERT the authenticated shell is displayed — the side menu shows the **Leads** item

---

### TC-02 — Navigate to Leads from the side menu
- **Type:** Happy path
- **Depends on:** TC-01 (authenticated session)
- **Steps:**
  - SNAPSHOT — confirm the side menu is rendered and the **Leads** item is visible
  - CLICK the **Leads** item in the side menu
  - WAIT for the Leads listing to load
  - SNAPSHOT — confirm the Leads page heading, grid, and toolbar
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **All Leads** heading is displayed
  - [x] ASSERT the URL is the Leads listing route (`/dynamic/LandBank.Crm/LBLead-table`)
  - [x] ASSERT the Leads data grid is displayed
  - [x] ASSERT the **New Lead** toolbar button is displayed
