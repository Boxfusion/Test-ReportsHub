# Test Plan: CRM-CASE — Create and resolve a CRM case

> **Status:** Draft — TC-01 observed live 2026-08-12; TC-02/TC-03 not yet reachable
> **Owner:** QA
> **Last Updated:** 2026-08-12
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso K** — expected results must be confirmed by him |
| ADO | No test cases exist for CRM (plan 101543 / suite 101884 unread) |

## Objective
> Validate the DSD-side CRM case lifecycle in the admin portal — capture a case, take ownership of it, record a resolution and close it — and confirm each transition is reflected in the Case register, Assigned Cases and the CRM Dashboard.

## Why this plan exists
The public NPO registration wizard is blocked (`test-reports/bugs/2026-08-12-address-autocomplete-renders-no-suggestions.md`), so the registration plan cannot progress. CRM is the one flow that is **self-contained**: it needs no registered NPO, and every record is one we create ourselves rather than someone else's seed data.

## Preconditions
- [ ] Admin portal reachable and credentials valid
- [ ] 🔑 **View mode switched from `Live` to `Latest` immediately after login** — see `CLAUDE.md`
- [ ] The signed-in user can see **CRM → Case** with the **Create Case**, **Pick Up** and **Close** actions

## Environment facts worth knowing
- The Case register is `/dynamic/boxfusion.dsdnpo/cases-table` (form `cases-table v21`), and **defaults to an "Assigned to Me" view** — a case that exists but is unassigned may not appear here. Check **Assigned Cases** (`assigned-cases v6`) and the **CRM Dashboard** (`/dashboards/reportedcases`) as well.
- The Case entity belongs to a **different module**: `Boxfusion.ServiceManagement` (`SM.Case`), not `boxfusion.dsdnpo`. The register is backed by `GET /api/dynamic/Boxfusion.ServiceManagement/Case/Crud/GetAll`.
- CRM Dashboard cards are scoped to a **selected period**, so a case dated outside it will not show.
- Grids are `sha-react-table` (`[role=table]` / `[role=row]`), **not** AntD tables.

## Test Cases

### TC-01 — Create a case

*Capture a new case from the Case register.*

- **Type:** Happy path (create)
- **Steps:**
  1. NAVIGATE to the admin portal and sign in; switch view mode to **Latest**
  2. NAVIGATE to **CRM → Case**; ASSERT the register renders and record the item count
  3. CLICK **Create Case**; ASSERT (BLOCKING) a modal titled **Create Case** opens — its actions are **Cancel** and **Ok**
     > ⚠️ **The modal's submit is `Ok`, not `Create Case`.** `Create Case` is the button that *opens* the modal; clicking it again merely re-opens it. A run that "submitted" via `Create Case` proves nothing.
  4. SELECT **Channel** — options: Mobile App · Call Centre · Web · Walkin · Telephone · SMS (+3 more)
  5. SELECT **Priority** — options: High · Medium · Low · Urgent
  6. SELECT **Category** — options: Application · Annual Compliance · Appeals · Voluntary Deregistration · Post Registration · Investigation (+1)
  7. SELECT **Case type** — options: Appeal outcome · Appeal Status · Application Outcome · Application Status · Auth Person Link · Compliance Outcome (+4)
  8. TYPE **First Name**, **Last Name**, **Mobile Number** (`0818400598`), **Email Address**, and a **Description** ≤100 chars
  9. ASSERT every field marked mandatory holds a value **before** submitting — Channel, Priority, First Name, Mobile Number, Email Address, Category, Case type
  10. CLICK **Ok**
  11. ASSERT (BLOCKING) the modal closes **and** no error message is raised
  12. ASSERT (BLOCKING) the case is **retrievable**: it appears in the Case register (clear the *Assigned to Me* filter or search the global filter for the description), **or** in Assigned Cases, **or** the CRM Dashboard count increases
- **Expected result:** A case is persisted with a reference number and is retrievable through at least one of the register, Assigned Cases or the dashboard.
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the Create Case modal opens with Cancel / Ok
  - [ ] ASSERT the four required selects offer the option sets above
  - [ ] ASSERT all 7 mandatory fields hold values before submit
  - [ ] ASSERT (BLOCKING) the modal closes with no error
  - [ ] ASSERT (BLOCKING) the case is retrievable afterwards
- ⚠️ **A closing modal is NOT proof of a save.** On 2026-08-12 the modal closed cleanly with no error and nothing was persisted. Always assert retrievability separately.

---

### TC-02 — Pick Up a case  *(not yet reachable)*

- **Type:** Happy path (ownership)
- **Steps:** 1. Select our case in the register · 2. CLICK **Pick Up** · 3. ASSERT it appears under **CRM → Assigned Cases** and its status advances
- **Expected result:** *To be defined.* Picking up assigns the case to the signed-in user and moves it into Assigned Cases.
- **Assertions:** [ ] ASSERT the case appears in Assigned Cases · [ ] ASSERT the status changes
- Blocked behind TC-01: with no case created, there is nothing to select.

---

### TC-03 — Resolve and Close  *(not yet reachable)*

- **Type:** Happy path (terminal)
- **Steps:** 1. Open our picked-up case · 2. RECORD the resolution fields offered under **CRM → Case Resolution** · 3. Capture a resolution · 4. CLICK **Close** · 5. ASSERT the case reaches a closed status and the CRM Dashboard *Cases by Status* reflects it
- **Expected result:** *To be defined.*
- **Assertions:** [ ] ASSERT a resolution can be recorded · [ ] ASSERT the case closes · [ ] ASSERT the dashboard count moves
- ❓ **For Thabiso:** what is the intended status progression, and is a resolution mandatory before Close?
