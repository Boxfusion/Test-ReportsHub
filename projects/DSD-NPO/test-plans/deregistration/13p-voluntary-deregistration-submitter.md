# Test Plan: NPO-13P — Voluntary Deregistration: Submitter Portal (smoke)

> **Status:** Imported from Azure DevOps — ⛔ **blocked**, not yet executable
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 180s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101875) |
| ADO Suite | 101875 — *13P - Voluntary Deregistration - Submitter Portal* (4 cases) |

## Objective
> Verify that a compliant registered NPO can voluntarily deregister — that the flow is blocked while annual reports are outstanding, that a compliant NPO's details pre-populate, that a receiving NPO can be selected for asset transfer, and that the declaration submits with the required documents.

## ⛔ Blocked
Needs a **registered** NPO linked to the signed-in user, with a known annual-compliance status. Unblocking route is the same as annual compliance: fix registration, or get **NPO-02 TC-02 (link to an existing NPO)** working.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO cases; all state `Design`.

## 🔴 TC-01 is expected to FAIL — Thabiso says so in the case itself
The ADO drift note on TC-13-001 reads: *"Code: **NO outstanding-report block enforced at VD initiation. Expect to FAIL.**"*

That makes TC-01 the most valuable case in this suite: it is a **known-suspect control**, pre-flagged by the test lead from code review but never executed. An NPO that owes annual reports being able to walk away is a compliance-enforcement gap, not a UI defect. **Run it first, and report the result either way.**

## Preconditions
- [ ] TC-01: a registered NPO with **outstanding annual reports ≥ 6 months**
- [ ] TC-02→TC-04: a registered NPO whose annual compliance status is **Compliant**
- [ ] A second NPO available as the **receiving** organisation for asset transfer (the register holds 361,068 — pick a real one)
- [ ] Dissolution / voluntary deregistration documents available to upload
- [ ] 🔑 View mode **Live → Latest**

## Test Cases

### TC-01 — 🔴 Deregistration is blocked while annual reports are outstanding (ADO #101800 · TC-13-001)

*Priority 1 · **Negative** · the only negative case in the smoke suite.* ⚠️ **Expected to fail.**

- **Type:** Negative / business rule
- **Steps:**
  1. Sign in as a user of an NPO with **outstanding annual reports ≥ 6 months**
  2. Attempt to initiate **Voluntary Deregistration**
  3. ASSERT (BLOCKING) a **block screen** is displayed instructing the user to submit the outstanding annual reports first *(FDS Dereg 7 rule 1)*
- **Expected result:** *"Block screen displayed instructing user to submit outstanding annual reports first (FDS Dereg 7 rule 1)"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) initiation is blocked
  - [ ] ASSERT the block screen names the outstanding annual reports as the reason
- **🔴 If the flow proceeds instead**, that confirms Thabiso's code-review finding: the control is specified in the FDS but **not implemented**. Log it as a defect citing this case, and record the NPO's outstanding-report state as evidence.
- **📌** Establishing the precondition needs an NPO genuinely in arrears — ask Thabiso which QA record qualifies, rather than trying to manufacture one.

---

### TC-02 — A compliant NPO can initiate; details pre-populate (ADO #101801 · TC-13-002)

*Priority 1 · Positive.*

- **Type:** Happy path (navigation)
- **Steps:**
  1. Sign in as a user of an NPO whose annual compliance status is **Compliant**
  2. Initiate **Voluntary Deregistration**
  3. ASSERT (BLOCKING) **Step 1 (Deregistration Details)** opens with the **NPO name and number pre-populated**
- **Expected result:** *"Step 1 (Deregistration Details) opens with NPO name and number pre-populated"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) Step 1 opens for a compliant NPO
  - [ ] ASSERT the NPO name and number are pre-populated and match the NPO's record
- **📌** Together with TC-01 this is a paired control: compliant proceeds, non-compliant is blocked. Run both against **different** NPOs in the same session so the comparison is clean.

---

### TC-03 — Step 2: a receiving NPO can be searched and selected for asset transfer (ADO #101804 · TC-13-005)

*Priority 1 · Positive.*

- **Type:** Happy path (lookup)
- **Steps:**
  1. On **Step 2**, search the **NPO Database** for the receiving organisation
  2. ASSERT the search returns matches
  3. SELECT one
  4. ASSERT (BLOCKING) the **receiving NPO's details are displayed** *(FDS Dereg 7.1.2)*
- **Expected result:** *"Receiving NPO details are displayed (FDS Dereg 7.1.2)"*
- **Assertions:**
  - [ ] ASSERT the NPO Database search returns results
  - [ ] ASSERT (BLOCKING) selecting one displays its details
- 🔑 **This is a server-filtered SEARCH, not a rendered list.** Never conclude anything from what the picker happens to show before you have typed — that misreading has cost findings on other projects in this hub. Type a known NPO name or number and assert on the result.
- **❓ Question for Thabiso:** can assets be transferred to an NPO that is itself deregistered or non-compliant? The case does not constrain the receiving organisation at all.

---

### TC-04 — Step 3: required documents attached and declaration submitted (ADO #101806 · TC-13-007)

*Priority 1 · Positive. Terminal case of the suite.*

- **Type:** Happy path (end-to-end completion)
- **Steps:**
  1. On **Step 3**, TYPE **name**, **surname** and **capacity**
  2. Attach the required **dissolution / voluntary deregistration** documents *(AntD Upload — use `setInputFiles` on the visible control)*
  3. CLICK **Submit**
  4. API — capture the submit request and its response body, including any non-2xx
  5. ASSERT (BLOCKING) the application is submitted
  6. ASSERT an **acknowledgement letter** is issued to the NPO
  7. Cross-check it appears in `admin → All Deregistration Applications` (plan NPO-13A TC-01)
- **Expected result:** *"Application submitted; acknowledgement letter to NPO"*
- **Assertions:**
  - [ ] ASSERT the required documents are enforced before Submit
  - [ ] ASSERT (BLOCKING) submission succeeds
  - [ ] ASSERT the acknowledgement letter is issued
  - [ ] ASSERT the application is retrievable on the admin side
- 🔑 A closing form is not proof of a save.
- **📌** RECORD which documents are actually required — the case says *"required dissolution/voluntary docs"* without listing them.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101800 | TC-13-001 | ⛔ blocked — 🔴 **expected to fail when it runs** |
| TC-02 | #101801 | TC-13-002 | ⛔ needs a compliant registered NPO |
| TC-03 | #101804 | TC-13-005 | ⛔ same |
| TC-04 | #101806 | TC-13-007 | ⛔ same |

**Not in this plan** (Functional suite 101900, 3 cases, to import later): TC-13-003, 004, 006.
