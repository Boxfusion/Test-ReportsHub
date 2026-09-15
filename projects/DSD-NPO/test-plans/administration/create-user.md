# Test Plan: ADMIN-USER — Register a new user

> **Status:** Ready — TC-01 verified live 2026-08-12
> **Owner:** QA
> **Last Updated:** 2026-08-12
> **Estimated Duration:** 180s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso K** |
| ADO | No test cases exist for user management |

## Objective
> Validate that an administrator can register a new user under **Administration → User Management**, that the user is persisted and retrievable in the register, and that server-side validation failures are reported to the user.

## Preconditions
- [ ] Admin portal reachable and credentials valid
- [ ] 🔑 **View mode switched `Live` → `Latest`** immediately after login
- [ ] The signed-in user can see **Administration → User Management**

## Environment facts
- Register: **Administration → User Management** → `/dynamic/boxfusion.dsdnpo/user-management-table` (form `user-management-table v7`). Holds **8,774 users** as at 2026-08-12.
- ⚠️ **That URL 404s on direct navigation** — reach it through the menu, and never `page.reload()` on it.
- Create form: **`Register New User`** (form `dsdnpo-user-management-create-new`), an AntD **modal** whose actions are **Cancel** / **Ok**.
- Backed by `POST /api/services/app/UserManagement/Create`, followed by `Person/Crud/Update` and `User/Crud/Update`.
- Columns: Creation Time · User Name · First Name · Last Name · Email Address · Mobile Number · Type of User.
- Grids are `sha-react-table` (`[role=table]` / `[role=row]`), **not** AntD tables. Read totals from the *"1-10 of N items"* caption.

## Test data
| Field | Value |
|---|---|
| First / Last Name | `QA` / `Tester<DDMM>` |
| User Name | an **email address** — every existing user's username is one |
| Email Address | `qa.tester<DDMM>@example.org` |
| Mobile Number | **must be unique across all persons** — see TC-02. Do **not** use the hub's usual `0818400598`; it is already taken on this environment |
| Type | Internal · Office Bearer · Public Portal User |
| Password | `Boxfusion@2026` (accepted) |

## Test Cases

### TC-01 — Register a new user (happy path)

- **Type:** Happy path (create)
- **Steps:**
  1. NAVIGATE to the admin portal, sign in, switch view mode to **Latest**
  2. CLICK **Administration** → **User Management**; ASSERT the register renders and record the item count from the caption
  3. CLICK **Register New User**; ASSERT (BLOCKING) a modal titled **Register New User** opens with **Cancel** / **Ok**
  4. ASSERT all **8** fields are present and mandatory: First Name · Last Name · Mobile Number · Email Address · Type · User Name · Password · Password Confirmation
  5. TYPE First Name, Last Name, Mobile Number (**unique**), Email Address, User Name (an email), Password, Password Confirmation
  6. SELECT **Type** — ASSERT options are **Internal · Office Bearer · Public Portal User**
  7. ASSERT every mandatory field holds a value **before** submitting
  8. CLICK **Ok**
  9. ASSERT the modal closes
  10. Re-enter the register **via the menu** (not a reload — the URL 404s)
  11. ASSERT (BLOCKING) the new user appears in the register with the correct Username, names, Mobile Number and Type
  12. ASSERT the item count has increased by exactly 1
- **Expected result:** The user is persisted and immediately retrievable; the register count increases by one.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Register New User modal opens with Cancel / Ok
  - [x] ASSERT all 8 fields are mandatory
  - [x] ASSERT Type offers Internal / Office Bearer / Public Portal User
  - [x] ASSERT all mandatory fields hold values before submit
  - [x] ASSERT (BLOCKING) the new user is retrievable in the register
  - [x] ASSERT the item count increases by exactly 1
- ⚠️ **A closing modal is NOT proof of a save** — assert retrievability separately. On 2026-08-12 the modal closed identically on a rejected save; see TC-02.

---

### TC-02 — Duplicate mobile number is reported to the user

*The negative case that exposed a real defect.*

- **Type:** Negative / validation feedback
- **Steps:**
  1. Reach the **Register New User** modal as in TC-01
  2. Populate every mandatory field, using a **Mobile Number already held by another person** (e.g. `0818400598` on this environment)
  3. CLICK **Ok**
  4. ASSERT (BLOCKING) a validation message is displayed naming the problem
  5. ASSERT the modal stays open so the user can correct the field
  6. ASSERT no user is created and the register count is unchanged
- **Expected result:** The duplicate is rejected **and the reason is shown** — the API already returns *"Specified mobile number already used by another person"*.
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the validation message is visible to the user
  - [ ] ASSERT the modal remains open
  - [ ] ASSERT the register count is unchanged
- 🔴 **Currently FAILS.** `POST /api/services/app/UserManagement/Create` returns **400** with that exact message, and the UI **discards it, closes the modal and shows nothing** — indistinguishable from success. See `test-reports/bugs/2026-08-12-validation-errors-not-surfaced.md`.
