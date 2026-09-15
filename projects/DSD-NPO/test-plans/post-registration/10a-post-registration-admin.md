# Test Plan: NPO-10A — Post Registration: Admin Processing (smoke)

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
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101867) |
| ADO Suite | 101867 — *10A - Post Registration - Admin Processing* (2 cases) |

## Objective
> Verify that DSD staff can list and filter submitted change requests, and open one to see the submitted information, its status and its attachments.

## Reachability
**TC-01 is runnable now** — `CRUDS → Change Request` exists on the admin portal. **TC-02 is read-only**, so it can run against any existing change request if one exists; it changes nothing.

Both cases here are **view-only** — this suite contains no decision or approval action at all. That is itself worth noting: the smoke plan covers *seeing* a change request but never *processing* one.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO cases; both state `Design`.

## Preconditions
- [ ] Admin portal signed in; view mode **Live → Latest**
- [ ] At least one submitted change request exists

## Test Cases

### TC-01 — All Post Registration applications listed and filterable (ADO #101769 · TC-10-008)

*Priority 1 · Positive.* ✅ **Runnable now.**

- **Type:** Happy path (structural)
- **Steps:**
  1. NAVIGATE to **CRUDS → Change Request** (the *All Post Registration* view)
  2. WAIT for the grid — `sha-react-table`, so use `[role=table]` / `[role=row]`
  3. ASSERT (BLOCKING) change requests are listed *(FDS Post-Reg 8.1)*
  4. RECORD the unfiltered row count from the grid caption
  5. Apply a **status** filter → ASSERT only matching items are shown
  6. Clear the filter → ASSERT the original count returns
- **Expected result:** *"Listed (FDS Post-Reg 8.1)"* then *"Only matching items shown"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the list renders
  - [ ] ASSERT the status filter narrows the list
  - [ ] ASSERT every visible row carries the filtered status
  - [ ] ASSERT clearing restores the original count
- **📌 RECORD the column set.** Unlike the equivalent cases in suites 07 and 09, this case does **not** prescribe columns — so record what is there and ask Thabiso whether it matches the FDS. An unprescribed expectation cannot be failed, only reported.

---

### TC-02 — Post Registration details show submitted info, status and attachments (ADO #101770 · TC-10-009)

*Priority 1 · Positive.* ⚠️ Read-only — safe to run against another tester's record.

- **Type:** Happy path (structural)
- **Steps:**
  1. CLICK a change request row
  2. ASSERT (BLOCKING) the details page shows the **submitted information**, its **status** and its **attachments** *(FDS Post-Reg 8.2)*
  3. Open an attachment → ASSERT it downloads
- **Expected result:** *"Submitted information, status and attachments visible (FDS Post-Reg 8.2)"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the details page opens
  - [ ] ASSERT submitted information, status and attachments are all present
  - [ ] ASSERT an attachment can be opened
- **📌** If our own change request from plan NPO-10P exists, assert the **old-versus-new values** carried through correctly from the submitter side. That is the substance of a change request and neither case checks it.

---

## ❓ Question for Thabiso — the approval step is missing

Both smoke cases are read-only, and the Functional plan's suite 101893 holds only **2** cases. So across **both** ADO plans there appears to be **no case covering the DSD decision on a change request** — approve, decline, send back. Every other lifecycle area has one (Document Verification in 07, Quality Assure in 09, Validate Documents in 13A).

Either the processing cases live somewhere we have not looked, or Post Registration is genuinely under-specified. Worth asking before we plan further coverage here.

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101769 | TC-10-008 | ✅ yes |
| TC-02 | #101770 | TC-10-009 | ⚠️ read-only, if any request exists |

**Not in this plan** (Functional suite 101893, 2 cases, to import later).
