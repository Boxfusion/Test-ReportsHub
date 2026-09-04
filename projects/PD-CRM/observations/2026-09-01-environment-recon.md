# PD-CRM — Environment Recon (2026-09-01)

Reconnaissance pass over the PD-CRM QA environment ahead of authoring test plans. This is **not a test run** —
it lives in `observations/` deliberately so the dashboard does not count it as one.

## Environment

| Key | Value |
|---|---|
| App URL | https://pd-dep-adminportal-qa.shesha.app/login |
| Landing route after login | `/dynamic/Boxfusion.ServiceManagement/service-requests` (Cases list) |
| Credentials | `Admin` / `P@ssword1` — **verified working** |
| Branding | "LESEDI" |
| Logged-in user shown | Lebos Lebos |

The legacy `projects/dep/` credentials (`admin` / `123qwe`) and URL
(`linux-dep-adminportal-test.azurewebsites.net`) do **not** apply to this environment.

## Login form selectors (captured live)

| Element | Selector |
|---|---|
| Username | `input[placeholder="Username"]` |
| Password | `input[type="password"]` |
| Submit | `button:has-text("Sign In")` |

There is no `name`, `id`, or `aria-label` on the login inputs — placeholder is the only stable hook.

## Navigation map

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

`DashBoards`, `Reports`, `Administration` and `Configurations` are menu groups with no direct route captured.

## Create Case — `/dynamic/Boxfusion.ServiceManagement/service-requests`

Toolbar: `Create Case`, `Export` (plus global header controls: `Last Call`, `clear`, `link to case`, `Login`).
Clicking **Create Case** opens a **modal** (`.ant-modal-content`); the URL does not change.

Modal buttons: `Cancel`, `OK` (submit), `Close` (×).

| Field | Control | Required |
|---|---|---|
| *(unlabelled select — likely Customer/Contact lookup)* | `.ant-select` | no |
| First Name | text input | no |
| **Mobile Number** | text input | **yes** |
| **Email Address** | text input | **yes** |
| Last Name | text input | no |
| Preferred Contact Method | `.ant-select` | no |
| **Category** | `.ant-select` | **yes** |
| Longitude | `.ant-input-number-input` | no |
| Latitude | `.ant-input-number-input` | no |
| Description | textarea | no |
| **Address** | text input, placeholder `Search places` | **yes** |
| Can't Find Address | checkbox | no |

Note: **Address** is a Google-Places-style autocomplete (`Search places`) with a `Can't Find Address` escape
hatch — typing a raw string may not satisfy it. The `Can't Find Address` checkbox is the likely path for
deterministic automation; that needs confirming when the plan is authored.

## Create Contact — `/dynamic/Boxfusion.ServiceManagement/contacts-table`

Toolbar: `Create Contact`, `Export`. Clicking **Create Contact** opens a **modal**; URL does not change.

Modal buttons: `Cancel`, `Save` (submit — **not** `OK`, unlike Create Case), `Close` (×), `(press to upload)`.

| Field | Control | Required |
|---|---|---|
| **First Name** | text input | **yes** |
| **Last Name** | text input | **yes** |
| Job Title | text input | no |
| Description | textarea | no |
| Photo | `input[type=file]` | no |
| **Order Index** | text input | **yes** |
| Flags | `.ant-select` | no |
| Facility | `.ant-select` | no |

Note: **Order Index** being a mandatory free-text field on a contact form is unusual for a user-facing create
flow — worth querying with the BA, and worth a validation test case (non-numeric input).

## Customers — `/dynamic/Boxfusion.Dep/table-customers`

719 records. Columns: First Name, Last Name, Mobile Number, Email Address. Per-row view / edit / delete icons.

**Toolbar contains only `Export` — there is no Create button on this page.** Cases and Contacts both have one.

This is flagged as an open question rather than a defect: Customers may be intentionally read/edit-only here
(records arriving from the public portal or from case capture rather than being created by an admin). It needs
confirming against the Azure DevOps suite before any "create customer" case is written — note that the legacy
`projects/dep/test-plans/customers/create-customer.md` plan assumes a Create button exists, so that plan
cannot be carried over to PD-CRM as-is.

## Environment / tooling issues found

1. **`ComSpec` is misconfigured on this machine** — set to `C:\Program Files\nodejs\` (a directory) instead of
   `C:\Windows\System32\cmd.exe`. Every `npx …` call fails with
   `npm error enoent spawn C:\Program Files\nodejs\ ENOENT`. Workaround: override `$env:ComSpec` per-command,
   or invoke binaries directly through `node`. The hub's documented Allure step (`npx allure generate …`) is
   affected.
2. **No Playwright browsers were installed** — `~/AppData/Local/ms-playwright` was empty. Chromium has now been
   installed.
3. **The Playwright MCP server is not registered** in this workspace (`claude mcp list` returns no `playwright`
   entry), although `.claude/settings.local.json` allowlists all `mcp__playwright__*` tools. The documented
   `/CreateTest` flow records selectors live via that MCP server; until it is registered, selectors have to be
   captured by driving `playwright-core` from a Node script (as was done here).
