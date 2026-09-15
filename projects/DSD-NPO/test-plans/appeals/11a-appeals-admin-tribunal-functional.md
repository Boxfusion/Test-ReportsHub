# Test Plan: NPO-11A-F — Appeals: Admin / Chairperson / Tribunal (functional)

> **Status:** Imported from Azure DevOps 2026-08-17 — ⛔ mostly **blocked**; TC-06 is runnable
> **Owner:** QA
> **Last Updated:** 2026-08-17
> **Estimated Duration:** 420s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101895) |
| ADO Suite | 101895 — *11A - Appeals - Admin / Chairperson / Tribunal* (7 cases) |

## Objective
> Verify the admin-side appeal lifecycle after Initiated: send to chairperson, forward to the appeal board, tribunal notices, and the Upheld / Denied outcomes — including who is allowed to see tribunal views.

## 🔑 This suite answers the question the smoke plan could not
The smoke plan asked *"how does an appeal reach **TribunalAssigned**?"* — **TC-02 here is the answer**: the
chairperson opens the appeal and clicks **`Forward to Appeal Board`**, selecting board members. So the full chain is:

`Initiated (6)` → *Send to Chairperson* → `CasePreparation (1)` → *Forward to Appeal Board* → `TribunalAssigned (2)`
→ outcome → `Upheld (4)` or `Denied (5)`. Status `InComplete (3)` sits outside that chain — see TC-07.

**Consolidated `RefListAppealStatus`:** 1 CasePreparation · 2 TribunalAssigned · 3 InComplete · 4 Upheld ·
5 Denied · 6 Initiated.

## ⛔ Blocking dependencies
Everything except TC-06 needs an appeal **we own**, which needs a submitter entry point that does not appear to exist
(see plan `11p-appeals-submitter-functional.md`). TC-02 additionally needs a **chairperson** login and TC-03/04/05 a
**tribunal member** login — **we have neither**, only the shared broadly-privileged dev account.
**❓ Ask Thabiso for a chairperson and a tribunal-member account**, or confirm role-scoped testing is out of scope.

## Provenance
Imported from the ADO functional plan on 2026-08-17 via the browser + REST route. Expected results quoted verbatim.
All 7 cases state `Design`; **3 carry `Drift-Risk`**.

## Preconditions
- [ ] Admin portal signed in; view mode **Live → Latest**
- [ ] TC-01/02: our own appeal in status *Initiated*, dialog reachable
- [ ] TC-02: a **chairperson** account and chairperson view
- [ ] TC-03/04/05: a **tribunal member** account; appeal in *TribunalAssigned*
- [ ] TC-04: a **cancellation** appeal being upheld
- [ ] TC-05: a claim document to attach

## Test Cases

### TC-01 — Send-to-Chairperson with an invalid email format is blocked (ADO #101781 · TC-11-009)

*Priority 2 · Negative.*

- **Type:** Negative (validation)
- **Steps:**
  1. With the Send-to-Chairperson dialog open, TYPE chairperson email = **`invalid`** and submit
  2. ASSERT (BLOCKING) a **validation error** is shown
- **Expected result:** *"Validation error"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) submission is refused for a malformed address
  - [ ] ASSERT the error is **visible**, not console-only
- **📌** This is the negative counterpart to smoke TC-11-008, and it partly answers the question raised there — that
  the chairperson email is typed free-form. The case validates the **format** only; **nothing validates that the
  address belongs to the actual chairperson**, so a well-formed wrong address still sends the appeal astray.
  **❓ Keep that as the open question for Thabiso.**
- ⚠️ On this build a rejected save has twice looked identical to success (400s silently discarded), so assert the
  error text, not merely that the dialog stayed open.

---

### TC-02 — Forward to Appeal Board notifies the selected members (ADO #101782 · TC-11-010)

*Priority 2 · Positive · `Src:Both`.* 🔑 **This is the missing transition.**

- **Type:** Happy path (workflow action)
- **Steps:**
  1. As the **chairperson**, open the appeal
  2. CLICK **`Forward to Appeal Board`**
  3. SELECT **multiple** board members
  4. Add a **comment** and submit
  5. ASSERT (BLOCKING) **all selected members receive a notification**
  6. ASSERT the status becomes **TribunalAssigned** (`RefList = 2`)
- **Expected result:** *"All members receive notification; status moves to TribunalAssigned (RefList=2)"*
- **Assertions:**
  - [ ] ASSERT multiple board members can be selected
  - [ ] ASSERT (BLOCKING) the status becomes exactly `TribunalAssigned` (`RefList=2`)
  - [ ] ASSERT every selected member is notified — check each, not just one
- **📌** Executing this case is what unblocks **smoke TC-11-012** (tribunal Upheld outcome), which needs a
  *TribunalAssigned* appeal.
- **📌** Verify notifications via the `NotificationMessage` audit rather than the UI — status 1 = Sent, 8 = Failed.
  All QA **SMS** currently fails (Vodacom out of credit), so judge the email leg separately from the SMS leg.
- ⚠️ Board-member pickers on this platform are **searches that return `No data` until you type** — empty on open is
  not a defect. And scoping has looked wrong before: on investigations, *Appeal Chairperson* was selectable where
  the expected staff were not.

---

### TC-03 — Notice of Tribunal sent to the organisation for additional information (ADO #101783 · TC-11-011)

*Priority 2 · Positive.*

- **Type:** Happy path (notification)
- **Steps:**
  1. As a **tribunal member**, issue a **Notice of Tribunal**
  2. ASSERT (BLOCKING) the NPO **receives an email**
  3. ASSERT the appeal **stays in TribunalAssigned**
- **Expected result:** *"NPO receives email; appeal stays in TribunalAssigned"*
- **Assertions:**
  - [ ] ASSERT the notice is issued
  - [ ] ASSERT (BLOCKING) the email reaches the NPO
  - [ ] ASSERT the status does **not** move — this is a no-transition action
- **📌** Use a mailbox QA can actually read. On this project the tester's inbox has settled four questions the UI
  could not, so check the inbox before concluding a notification was not sent.

---

### TC-04 — Upheld outcome for a cancellation re-issues the certificate (ADO #101785 · TC-11-013)

*Priority 1 · Positive · `Src:Both`.*

- **Type:** Happy path (decision + downstream effect)
- **Steps:**
  1. On an upheld **cancellation** appeal, record outcome = **Upheld**
  2. ASSERT (BLOCKING) the **Certificate of Registration is re-issued**
  3. ASSERT the organisation status changes from **Cancelled → Registered** *(FDS Appeals 6.2 rule 14a)*
- **Expected result:** *"Certificate of Registration is re-issued; org status changes from Cancelled to Registered
  (FDS Appeals 6.2 rule 14a)"*
- **Assertions:**
  - [ ] ASSERT the outcome records as Upheld
  - [ ] ASSERT (BLOCKING) a **new certificate** is generated and retrievable
  - [ ] ASSERT `OrganisationStatus` moves 7 (Cancelled) → 4 (Registered)
- **📌 The certificate is the substantive assertion**, not the status flip. Registration certificates on this build
  are **QR-protected and the QR resolves** to an authentication page showing number/name/status/date — so verify the
  re-issued certificate's QR reflects the **restored** status, not the cancelled one.
- **📌** This is the *cancellation* twin of smoke TC-11-012, which covers *refusal to register* (where the effect is
  that the applicant may resume the application instead).

---

### TC-05 — Denied outcome requires comments and a claim document (ADO #101786 · TC-11-014)

*Priority 1 · Negative · `Drift-Risk`.*

- **Type:** Negative then positive (two-part)
- **Steps:**
  1. SELECT Outcome = **Denied**, leave **comments and attachment empty**, submit
  2. ASSERT (BLOCKING) validation — **both are required**
  3. Fill both, submit
  4. ASSERT the status becomes **Denied** (`RefList = 5`)
  5. ASSERT the NPO is **notified by email with the outcome and the claim document**
- **Expected result:** step 1 → *"Validation - both required"*; step 2 → *"Status=Denied (RefList=5); NPO notified by
  email with outcome and claim doc"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) an empty Denied submission is refused
  - [ ] ASSERT the status becomes exactly `Denied` (`RefList=5`)
  - [ ] ASSERT the email carries **both** the outcome and the claim document as an attachment
- **🔴 Drift note (Thabiso, from code):** *"mandatory attachment on Denied NOT enforced; verify front-end validation
  only."* **So part 1 is expected to fail server-side.** Test the front end *and* confirm whether a submission that
  bypasses the UI guard is accepted — but note the standing instruction not to manufacture state through the app's
  APIs, so limit this to what the UI allows.
- **📌** Deregistration notices on this build are generated and emailed but **never linked to the record**. Check
  whether the claim document is retrievable from the appeal afterwards, not just delivered.

---

### TC-06 — Non-tribunal user cannot access tribunal-only views (ADO #101787 · TC-11-015)

*Priority 1 · Negative · `Drift-Risk`.* ✅ **Runnable now — the only one in this suite.**

- **Type:** Negative (access control)
- **Steps:**
  1. Signed in as a **backend admin (not tribunal)**, navigate directly to the **tribunal view URL**
  2. ASSERT (BLOCKING) **access is denied**
- **Expected result:** *"Access denied"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the tribunal view does not render for a non-tribunal user
  - [ ] RECORD the tribunal view URL(s) discovered
- **🔴 Drift note (Thabiso, from code):** *"tribunal access via `[AbpAuthorize]` only; no granular tribunal-view
  restriction found."* **Expected to FAIL** — any authenticated admin will likely see it.
- **📌** Runnable because it needs no appeal of our own: it only needs a tribunal URL and a non-tribunal session. Our
  shared account is broadly privileged and already exposes the full `Configurations` menu, which makes it a fair
  proxy for "an admin who should not see this" — **but say so in the report**, because a genuinely role-scoped
  account would be the stronger test.
- **📌** First find the tribunal route. Sidebar flyouts need a **real** click (`page.locator(...).click()`), not a
  synthetic one, and the nav flyout overlays the toolbar on at least two pages.

---

### TC-07 — Appeal statuses 'InComplete' (3) and 'Initiated' (6) — are they reachable? (ADO #101788 · TC-11-016)

*Priority 3 · Edge · `Src:Code` · `Drift-Risk`.* 🔑 **Directly relevant to our current blocker.**

- **Type:** Investigation (drift verification)
- **Steps:**
  1. Try to drive an appeal to status **InComplete** through the UI flow
  2. ASSERT — if reachable, observe the notification behaviour
  3. Try to set status to **Initiated** through the UI
  4. ASSERT — same
- **Expected result:** *"If reachable, observe notification behaviour"* (both steps)
- **Assertions:**
  - [ ] RECORD whether each status is reachable through the UI at all
  - [ ] Where reachable, RECORD what notification fires
- **🔴🔑 Drift note (Thabiso, from code):** *"Code shows these enum values exist but **no wired service-task
  handlers** (`DaStatusUpdateAndNotificationServiceTask.cs:62-83`). **Likely dead states; verify and clean up.**"*
- **🔴 This contradicts smoke TC-11-005**, which asserts a submitted appeal *"is recorded with status **Initiated**
  (`RefListAppealStatus=6`)"*. One of the two is wrong: either `Initiated` is the real post-submission status and the
  drift note is stale, or `Initiated` is dead and the smoke case's expected result needs rewriting.
  **❓ This is a direct question for Thabiso, and it may explain why we cannot reach an Initiated appeal at all.**
- **📌** The live admin Appeals list (checked 2026-08-17) shows statuses **Upheld, Denied, In Complete and Case
  Preparation** across 26 records — *In Complete* **does** appear, and **no record is in *Initiated***. That is
  early evidence that `Initiated` is indeed dead and `InComplete` is not.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Drift-Risk | Reachable today |
|---|---|---|---|---|
| TC-01 | #101781 | TC-11-009 | — | ⛔ needs our own appeal |
| TC-02 | #101782 | TC-11-010 | — | ⛔ needs our appeal + a **chairperson** login |
| TC-03 | #101783 | TC-11-011 | — | ⛔ needs a **tribunal** login |
| TC-04 | #101785 | TC-11-013 | — | ⛔ needs a cancellation appeal at tribunal |
| TC-05 | #101786 | TC-11-014 | ⚠️ attachment not enforced | ⛔ needs a TribunalAssigned appeal |
| TC-06 | #101787 | TC-11-015 | ⚠️ no granular restriction | ✅ **yes** |
| TC-07 | #101788 | TC-11-016 | ⚠️ likely dead states | ⚠️ partly — list evidence already gathered |

**Smoke counterparts** (plan `11a-appeals-admin-tribunal.md`): TC-11-007, TC-11-008, TC-11-012.
