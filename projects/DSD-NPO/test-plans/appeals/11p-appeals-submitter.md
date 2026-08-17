# Test Plan: NPO-11P — Appeals: NPO Submitter (smoke)

> **Status:** Imported from Azure DevOps — ⛔ **blocked**, not yet executable
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 120s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101870) |
| ADO Suite | 101870 — *11P - Appeals - NPO Submitter* (2 cases) |

## Objective
> Verify that an applicant whose registration was refused can lodge an appeal from the denied application, and that a completed appeal submits with status Initiated and an acknowledgement letter.

## ⛔ Blocked — and awkwardly so
This suite needs an application in status **'Application Unsuccessful'**. Producing one legitimately means driving a registration all the way through and then having DSD **decline** it — so it is blocked behind both the address defect **and** the full admin assessment path in plan NPO-07.

**❓ Ask Thabiso whether a pre-denied application can be seeded on QA.** Otherwise this suite stays unreachable long after the address blocker clears, and the same applies to plan NPO-11A.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO cases; both state `Design`.

## Preconditions
- [ ] The signed-in user has an application in status **Application Unsuccessful**
- [ ] A supporting document is available to upload
- [ ] 🔑 View mode **Live → Latest**

## Test Cases

### TC-01 — Initiate an appeal of type 'Refusal to Register' from a denied application (ADO #101773 · TC-11-001)

*Priority 1 · Positive.*

- **Type:** Happy path (navigation)
- **Steps:**
  1. Open the **denied** application
  2. CLICK **Appeal**
  3. ASSERT (BLOCKING) the appeal form opens *(FDS Appeals 7)* with **organisation details prefilled**
  4. SELECT Nature = **'Refusal to Register'**
  5. ASSERT the field shows and the selection is accepted
- **Expected result:** *"Appeal form (FDS Appeals 7) opens with org details prefilled"* then *"Field shows; valid selection"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the appeal form opens from the denied application
  - [ ] ASSERT organisation details are prefilled
  - [ ] ASSERT Nature = *Refusal to Register* is selectable
- **📌 RECORD every Nature option offered.** Plan NPO-11A TC-01 filters appeals by **Type = Cancellation**, so at least two natures exist. Neither plan enumerates the full list.
- **⚠️** An admin-side appeal form observed on 2026-08-12 threw **`500 /api/StoredFile/FilesList`** (backing Supporting Documents) and **`400 …/DeregistrationAppeal/Crud/Get`**. If TC-02's upload fails, check those first — it may be the same fault rather than a new one.

---

### TC-02 — Submit an appeal with the required fields (ADO #101777 · TC-11-005)

*Priority 1 · Positive. Terminal case of the suite.*

- **Type:** Happy path (end-to-end completion)
- **Steps:**
  1. On the appeal form, SELECT the **nature** and the **mode**
  2. SELECT the **office bearer**
  3. Upload the supporting **documents**
  4. TYPE **name**, **surname** and **capacity**
  5. CLICK **Submit**
  6. API — capture the submit request and its response body, including any non-2xx
  7. ASSERT (BLOCKING) the appeal is recorded with status **Initiated** *(`RefListAppealStatus` = 6)*
  8. ASSERT an **acknowledgement letter** is sent
  9. Cross-check the appeal appears in `admin → All Appeals` (plan NPO-11A TC-01)
- **Expected result:** *"Appeal recorded with status Initiated (RefListAppealStatus=6); acknowledgement letter sent"*
- **Assertions:**
  - [ ] ASSERT the documents upload successfully
  - [ ] ASSERT (BLOCKING) the appeal is recorded with status exactly `Initiated`
  - [ ] ASSERT the acknowledgement letter is sent
  - [ ] ASSERT the appeal is retrievable on the admin side
- **📌** The case pins the reference-list value (`RefListAppealStatus=6`). Where the API response is visible, assert the **numeric value** as well as the displayed label — a label that reads right over a wrong underlying value is exactly the kind of defect this catches.
- 🔑 A closing form is not proof of a save.
- **📌** RECORD the **mode** options — the case names the field but not its values.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101773 | TC-11-001 | ⛔ needs a denied application |
| TC-02 | #101777 | TC-11-005 | ⛔ same |

**Not in this plan** (Functional suite 101896, 4 cases, to import later): TC-11-002 → 004, 006.
