# Test Plan: NPO-12A — Investigations: Admin / Backend (smoke)

> **Status:** Imported from Azure DevOps — **partially reachable** (TC-01 runnable now)
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101871) |
| ADO Suite | 101871 — *12A - Investigations - Admin / Backend* (2 cases) |

## Objective
> Verify that DSD staff can list and filter investigation cases by status, and assign a validated in-mandate case to an investigator who is then notified.

## Reachability
**TC-01 is runnable now** — `CRUDS → Investigation` exists on the admin portal. **TC-02 is state-changing** and should run against **our own** case, which plan NPO-12P can create today (that suite is unblocked).

🔑 **NPO-12P → NPO-12A is the one complete lifecycle we can drive end to end right now**: submit an anonymous complaint on the public portal, then triage and assign it on the admin portal. Worth prioritising while registration is blocked.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO cases; both state `Design`.

## Preconditions
- [ ] Admin portal signed in; view mode **Live → Latest**
- [ ] TC-01: multiple cases exist
- [ ] TC-02: a **validated, in-mandate** case — ideally the one we created via plan NPO-12P
- [ ] At least one user exists who can be selected as an investigator

## Test Cases

### TC-01 — Investigations list is filterable by case status (ADO #101792 · TC-12-004)

*Priority 1 · Positive.* ✅ **Runnable now.**

- **Type:** Happy path (structural)
- **Steps:**
  1. NAVIGATE to **CRUDS → Investigation** (*All Investigations*)
  2. WAIT for the grid — `sha-react-table`, so use `[role=table]` / `[role=row]`
  3. ASSERT (BLOCKING) the list is shown *(FDS Inv 8.1)*
  4. RECORD the unfiltered row count and every **case status** present
  5. Apply a **status** filter → ASSERT only matching cases are shown
  6. Clear it → ASSERT the original count returns
- **Expected result:** *"List shown; status filter works (FDS Inv 8.1)"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the investigations list renders
  - [ ] ASSERT the status filter narrows the list
  - [ ] ASSERT every visible row carries the filtered status
  - [ ] ASSERT clearing restores the original count
- **📌** RECORD the column set and the available statuses — the case prescribes neither, so this is reporting rather than assertion. The status list matters for TC-02, which needs a *validated, within-mandate* case.

---

### TC-02 — A valid in-mandate case can be assigned to an investigator (ADO #101794 · TC-12-006)

*Priority 1 · Positive.* ⚠️ State-changing — use **our own** case from plan NPO-12P.

- **Type:** Happy path (workflow action)
- **Steps:**
  1. Open a **validated case within the DSD mandate** — preferably the one we submitted anonymously
  2. CLICK **Assign Investigator**
  3. SELECT an investigator
  4. CLICK **Submit**
  5. ASSERT (BLOCKING) the case is assigned to that investigator
  6. ASSERT the investigator is **notified** *(FDS Inv 8.3)*
  7. ASSERT the assignment is visible on re-opening the case
- **Expected result:** *"Case assigned; investigator notified (FDS Inv 8.3)"*
- **Assertions:**
  - [ ] ASSERT the Assign Investigator dialog opens and lists selectable investigators
  - [ ] ASSERT (BLOCKING) the case shows the assigned investigator after submit
  - [ ] ASSERT the investigator notification is sent
- **❓ Questions for Thabiso:**
  1. **How does a case become "validated" and "within mandate"?** The precondition assumes both, but neither plan contains the case that performs that triage. Without it we cannot construct the state legitimately.
  2. **Who appears in the investigator picker** — a role, a team, or every user? If it is every user, that is worth raising.
- **📌** Use `0818400598` for any SMS leg of the notification.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101792 | TC-12-004 | ✅ yes |
| TC-02 | #101794 | TC-12-006 | ⚠️ needs a validated in-mandate case (create via NPO-12P) |

**Not in this plan** (Functional suite 101897, 6 cases, to import later): TC-12-002, 003, 005, 007+.
