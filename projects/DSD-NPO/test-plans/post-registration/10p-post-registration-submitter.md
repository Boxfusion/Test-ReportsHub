# Test Plan: NPO-10P — Post Registration: Change Requests (submitter portal) (smoke)

> **Status:** Imported from Azure DevOps — ⛔ **blocked**, not yet executable
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 210s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101868) |
| ADO Suite | 101868 — *10P - Post Registration - Submitter Portal* (4 cases) |

## Objective
> Verify that an authorised user of a registered NPO can raise a change request — choosing a change type, capturing old-versus-new values, attaching supporting documents and submitting a declaration.

## ⛔ Blocked
Needs a **registered** NPO with the signed-in user marked **Authorised**. Same unblocking route as annual compliance: either fix registration, or get **NPO-02 TC-02 (link to an existing NPO)** working against one of the 361,068 migrated records.

**Also note the `Authorised` precondition specifically.** Even with a linked NPO, this suite needs the user to hold an authorised role on it — worth checking early, since role-scoped accounts are something we still have to create ourselves.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO cases; all state `Design`.

## Preconditions
- [ ] Registered NPO linked to the signed-in user
- [ ] The user is **Authorised** on that NPO
- [ ] 🔑 View mode **Live → Latest**

## Test Cases

### TC-01 — Authorised user initiates a Change Request (ADO #101762 · TC-10-001)

*Priority 1 · Positive.*

- **Type:** Happy path (navigation)
- **Steps:**
  1. Sign in and open the NPO
  2. CLICK **Post Registration**, then **Initiate Change**
  3. ASSERT (BLOCKING) Step 1 of the Post Registration form opens *(FDS Post-Reg Fig.3)*
- **Expected result:** *"Step 1 of Post Registration form opens (FDS Post-Reg Fig.3)"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) Step 1 opens
- **❓ Question for Thabiso:** what happens if the user is linked but **not** Authorised — is the action hidden, disabled, or does it error? The negative case is not in either plan, and it is the authorisation control for the whole flow.

---

### TC-02 — Change type selection drives the visible change fields (ADO #101763 · TC-10-002)

*Priority 1 · Positive. Four branches in one case.*

- **Type:** Conditional fields
- **Steps:**
  1. On Step 1, SELECT **Founding Document Changes** → ASSERT **Year-end**, **Name change**, **Objective** and **Other constitutional change** fields appear
  2. SELECT **General Details Changes** → ASSERT **OB** and **organisation change** fields appear
  3. SELECT **Combination** → ASSERT (BLOCKING) **both** founding and general sections appear
  4. SELECT **Legal Form Change** → ASSERT **NPC / Trust / VA** options appear
- **Expected result:** each change type reveals its own field group, as listed above
- **Assertions:**
  - [ ] ASSERT the Founding Document field group
  - [ ] ASSERT the General Details field group
  - [ ] ASSERT (BLOCKING) Combination shows both groups
  - [ ] ASSERT Legal Form Change offers NPC / Trust / VA
- **📌 Also assert the inverse** — that switching away **hides** the previous group and clears its values. The wizard's sibling case TC-03-032 prescribes exactly that behaviour for conditional fields on Organisation Details, so the same expectation is reasonable here. If values survive a change of type, that is a data-integrity finding worth raising.

---

### TC-03 — Step 2 captures old versus new values side by side (ADO #101767 · TC-10-006)

*Priority 1 · Positive.*

- **Type:** Happy path
- **Steps:**
  1. Open **Step 2**
  2. ASSERT the selected change type is shown
  3. ASSERT (BLOCKING) **current values are displayed read-only** and **new-value fields are editable**
  4. Capture the new values, CLICK **Next**
  5. ASSERT the changes are saved and the wizard navigates to Step 3
- **Expected result:** *"Selected change type shown; current values displayed read-only; new values fields editable"* then *"Changes saved; navigation to Step 3"*
- **Assertions:**
  - [ ] ASSERT the change type carries through from Step 1
  - [ ] ASSERT (BLOCKING) current values are read-only and new-value fields are editable
  - [ ] ASSERT the new values persist after Next
- 🔑 Test read-only by **attempting an edit** on a current-value field.
- **📌** Cross-check the "current values" against the NPO's actual record — this side-by-side is what the assessor will approve from, so a stale or wrong "old" value is a serious finding.

---

### TC-04 — Step 3 attaches documents and submits the declaration (ADO #101768 · TC-10-007)

*Priority 1 · Positive. Terminal case of the suite.*

- **Type:** Happy path (end-to-end completion)
- **Steps:**
  1. On **Step 3**, ASSERT the name is displayed
  2. Capture the **capacity**
  3. Upload the required documents *(AntD Upload — use `setInputFiles` on the visible control, never the hidden input)*
  4. CLICK **Submit**
  5. API — capture the submit request and its response body, including any non-2xx
  6. ASSERT (BLOCKING) an **acknowledgement letter** is issued
  7. Cross-check the change request appears in `admin → All Post Registration` (plan NPO-10A TC-01)
- **Expected result:** *"Acknowledgement letter issued"*
- **Assertions:**
  - [ ] ASSERT the documents upload successfully
  - [ ] ASSERT (BLOCKING) submission succeeds and an acknowledgement is issued
  - [ ] ASSERT the request is retrievable on the admin side
- 🔑 A closing form is not proof of a save — assert retrievability separately.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101762 | TC-10-001 | ⛔ needs a registered NPO + Authorised user |
| TC-02 | #101763 | TC-10-002 | ⛔ same |
| TC-03 | #101767 | TC-10-006 | ⛔ same |
| TC-04 | #101768 | TC-10-007 | ⛔ same |

**Not in this plan** (Functional suite 101894, 3 cases, to import later): TC-10-003 → 005.
