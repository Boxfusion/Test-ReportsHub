# Test Plan: NPO-13A — Voluntary Deregistration: Admin Processing (smoke)

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
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101874) |
| ADO Suite | 101874 — *13A - Voluntary Deregistration - Admin Processing* (2 cases) |

## Objective
> Verify that DSD staff can list and filter voluntary deregistration applications, and that validating all supporting documents deregisters the NPO and issues a deregistration notice.

## Reachability
**TC-01 is runnable now** — `CRUDS → Voluntary Deregistration` exists on the admin portal, and the workflow inbox already shows live deregistration items (e.g. `DER1519/12/08/2026 · Voluntary Deregistration · Review (DSD)` on NPO `333-010-NPO`).

**TC-02 must NOT be run against another tester's submission.** It **deregisters a real NPO** — the most destructive action in the entire smoke plan. Run it only against a deregistration application **we** created via plan NPO-13P.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO cases; both state `Design`.

## Preconditions
- [ ] Admin portal signed in; view mode **Live → Latest**
- [ ] TC-01: deregistration submissions exist
- [ ] TC-02: **our own** deregistration application, open and awaiting document validation

## Test Cases

### TC-01 — All Deregistration Applications listed with a status filter (ADO #101807 · TC-13-008)

*Priority 1 · Positive.* ✅ **Runnable now.**

- **Type:** Happy path (structural)
- **Steps:**
  1. NAVIGATE to **CRUDS → Voluntary Deregistration** (*All Deregistration Applications*)
  2. WAIT for the grid — `sha-react-table`, so use `[role=table]` / `[role=row]`
  3. ASSERT (BLOCKING) the list renders *(FDS Dereg 8.1)*
  4. RECORD the unfiltered row count and the statuses present
  5. Apply a **status** filter → ASSERT only matching rows are shown
  6. Clear it → ASSERT the original count returns
- **Expected result:** *"List with filter works (FDS Dereg 8.1)"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the list renders
  - [ ] ASSERT the status filter narrows the list
  - [ ] ASSERT every visible row carries the filtered status
  - [ ] ASSERT clearing restores the original count
- **📌** RECORD the column set — the case does not prescribe one.

---

### TC-02 — ⚠️ Validating all documents deregisters the NPO (ADO #101809 · TC-13-010)

*Priority 1 · Positive.* 🔴 **Destructive — our own record only.**

- **Type:** Happy path (decision)
- **Steps:**
  1. Open **our own** deregistration application
  2. CLICK **Validate Documents**
  3. ASSERT the dialog lists the submitted documents
  4. Confirm **all valid**, CLICK **Submit**
  5. ASSERT (BLOCKING) the organisation's status changes to **Deregistration / Deregistered**
  6. ASSERT a **deregistration notice** is issued *(FDS Dereg 8.3)*
  7. Cross-check the NPO's status on the public portal and in `admin → All NPOs`
- **Expected result:** *"Org status changes to Deregistration / Deregistered; deregistration notice issued (FDS Dereg 8.3)"*
- **Assertions:**
  - [ ] ASSERT the Validate Documents dialog lists the submitted documents
  - [ ] ASSERT (BLOCKING) the organisation status becomes `Deregistered`
  - [ ] ASSERT the deregistration notice is issued
  - [ ] ASSERT the change is reflected in the NPO register
- **🔴 This action deregisters a live NPO record.** Confirm the target is ours before submitting. The 2,470 workflow inbox items belong to other testers, and at least one live *Voluntary Deregistration · Review (DSD)* item is sitting there right now — do not action it.
- **📌 The expected status is ambiguous in the case itself** — *"Deregistration / Deregistered"* names two things. Record which one the app actually sets and ask Thabiso to tighten the case.
- **❓ Question for Thabiso:** what is the **negative** path? The case only covers *all documents valid*. If a document is rejected, does the application return to the NPO, and is there a resubmission route? Neither plan covers it.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101807 | TC-13-008 | ✅ yes |
| TC-02 | #101809 | TC-13-010 | ⛔ needs **our own** application — destructive |

**Not in this plan** (Functional suite 101899, 4 cases, to import later): TC-13-009, 011+.
