# Test Plan: NPO-05 — Application Wizard, Tabs 5–8 (Admin/Ops, Control Structure, Documents, Declaration) (smoke)

> **Status:** Imported from Azure DevOps — ✅ **reachable** (unblocked 2026-08-13), not yet executed
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 420s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101862) |
| ADO Suite | 101862 — *05 - Application Wizard - Tabs 5-8* (10 cases — the largest smoke suite) |

## Objective
> Verify the back half of the registration wizard through to submission: Admin & Operations selections persist, the required document set varies by organisation type, uploads succeed, the Declaration auto-populates and is read-only where prescribed, and Submit creates the application with a reference number and acknowledgement notifications. Also covers wizard-wide behaviours — tab-tick navigation and draft survival across logout.

## ✅ Unblocked 2026-08-13 — and this is now the top priority in the project
These cases were believed blocked behind the address autocomplete defect. **That blocker is retracted** — the
wizard advances past Organisation Details when the mandatory fields are entered with **real keystrokes**. See
[03-wizard-org-details-objectives.md](03-wizard-org-details-objectives.md).

**TC-05 (Submit) is the gateway for most of the rest of this project.** Suites 06 through 13 all need a submitted
application to exist. It was unreachable; it is now simply *undone*. **Driving one application through to Submit
unblocks the majority of the remaining smoke coverage in a single run.**

▶ Resumable draft parked at Objectives: `APPL26-00793` (`id=525fb3ec-be80-428b-9e80-2bfa30525846`).

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO cases; all state `Design`.

✅ **Tab-count question RESOLVED 2026-08-13 — the ADO cases were right, there are 8 tabs.** The earlier 7-step
reading was taken before Organisation Details completed; **`Control Structure` appears once that step is
finished**, between *Admin & Operations* and *Documents*. The stepper is dynamic. Full order:
**Read This · Organisation Details · Objectives · Office Bearer · Admin & Operations · Control Structure ·
Documents · Declaration**. The note questioning the case set is withdrawn.

## Preconditions
- [ ] A draft application completed through Office Bearers with valid OBs
- [ ] A 2 MB test PDF available for the upload case
- [ ] The signed-in submitter has a **complete profile** (first and last name on file) — TC-06 asserts the name auto-populates
- [ ] 🔑 View mode **Live → Latest**

## 🔑 Automation note — document uploads
The Documents tab uses an **AntD Upload**. Injecting into the hidden file input does **not** bind to the component and produces a false "required" failure. Use `setInputFiles` on the visible control, or a real click. Evidence that must ship belongs under `test-reports/`, never `test-results/` (gitignored).

## Test Cases

### TC-01 — Admin/Operations multi-selections persist across Next/Back (ADO #101678 · TC-05-002)

*Priority 1 · Positive.*

- **Type:** Persistence
- **Steps:**
  1. Reach **Admin & Operations**
  2. SELECT **3** operations
  3. CLICK **Next**, then CLICK **Back**
  4. ASSERT (BLOCKING) the same 3 selections are still ticked
- **Expected result:** *"Same 3 selections still ticked"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) all 3 selections survive the Next/Back round trip
- **📌** Record *which* 3 were selected so the assertion checks identity, not just count.

---

### TC-02 — Required documents vary by organisation type (ADO #101682 · TC-05-006)

*Priority 1 · Positive. Needs three drafts, one per Legal Form.*

- **Type:** Conditional / business rule
- **Steps:**
  1. On a draft with Legal Form = **NPC**, open **Documents** → ASSERT NPC-specific slots are required *(e.g. MOI, Constitution)*
  2. On a **VA** draft → ASSERT VA-specific slots are required *(Constitution, Founding statement)*
  3. On a **Trust** draft → ASSERT Trust slots are required *(Letter of Authority, IT Reg)*
- **Expected result:** each organisation type presents its own required document slots, as listed above
- **Assertions:**
  - [ ] ASSERT the NPC document set
  - [ ] ASSERT the VA document set
  - [ ] ASSERT the Trust document set
- **⚠️ This case needs three separate drafts** to run properly, each with a different Legal Form. Budget for that — and per [[reuse-our-created-records]], resume drafts rather than creating fresh ones each run.
- **❓ Question for Thabiso:** are the document lists in the case exhaustive, or examples? The case says *"e.g."* for NPC, which makes a strict assertion unsafe. Ask for the authoritative list per type.

---

### TC-03 — Upload a PDF under 10 MB succeeds (ADO #101683 · TC-05-007)

*Priority 1 · Positive.*

- **Type:** Happy path (upload)
- **Steps:**
  1. On **Documents**, upload a **2 MB PDF** into the **Constitution** slot
  2. WAIT for the upload to complete
  3. ASSERT (BLOCKING) the upload succeeds
  4. ASSERT the file appears with its **name and size**
  5. ASSERT **download** and **remove** actions are available
- **Expected result:** *"Upload succeeds; file appears with name and size; download/remove available"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the upload succeeds
  - [ ] ASSERT name and size are displayed
  - [ ] ASSERT download and remove are offered
- **⚠️** A **`500 /api/StoredFile/FilesList`** was seen backing a Supporting Documents upload on the admin appeal form (2026-08-12). If uploads fail here, check whether it is the same endpoint before classifying.

---

### TC-04 — Declaration auto-populates Organisation Name and Date (ADO #101689 · TC-05-013)

*Priority 1 · Positive.*

- **Type:** Happy path (structural)
- **Steps:**
  1. Open the **Declaration** tab
  2. ASSERT (BLOCKING) **Organisation Name** (carried from Organisation Details) and **Application Date** (today) are auto-populated
  3. ASSERT both are **read-only** *(FDS 7.5.8 rules 1 & 4)*
- **Expected result:** *"Organisation Name (from Step 1) and Application Date (today) are auto-populated and read-only"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) both fields are populated
  - [ ] ASSERT both are read-only
- 🔑 **Test read-only by attempting an edit**, not by reading an attribute — a field can look read-only and still accept input.

---

### TC-05 — 🔑 Submit creates the application, sets status, sends acknowledgement (ADO #101692 · TC-05-016)

*Priority 1 · Positive. **The gateway case for the whole project.***

- **Type:** Happy path (end-to-end completion)
- **Steps:**
  1. On **Declaration**, TICK all declarations
  2. Fill **name** and **capacity**
  3. CLICK **Submit**
  4. API — capture the submit request **and its response body**, including any non-2xx
  5. ASSERT (BLOCKING) the wizard closes and a **success screen** is shown
  6. EXTRACT the **Application Reference Number** — record it; suites 06→13 depend on this application existing
  7. ASSERT the application status is set to **'Application In-Progress'** *(per `RefListApplicationStatus`)*
  8. ASSERT the chairperson receives an acknowledgement email/SMS
- **Expected result:** *"Wizard closes; success screen shown with Application Reference Number; application status set to 'Application In-Progress' (per RefListApplicationStatus); chairperson receives acknowledgement email/SMS"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) submission succeeds and a success screen is shown
  - [ ] ASSERT a Reference Number is returned
  - [ ] ASSERT the status is exactly `Application In-Progress`
  - [ ] ASSERT the chairperson acknowledgement is sent
- 🔑 **A closing wizard is not proof of a save.** Assert the application is **retrievable** afterwards — find it in `admin → CRUDS → All Applications` by its reference number. On this build, a rejected 400 save has already been shown to look identical to success.
- **📌** Use `0818400598` for the chairperson mobile so SMS delivery can be checked on the handset.

---

### TC-06 — Submitter Full Name auto-populates and is read-only (ADO #102156 · TC-05-026)

*Priority 1 · Positive · `Src:Code`. Needs a submitter with first and last name on file.*

- **Type:** Happy path (structural)
- **Steps:**
  1. On **Declaration**, inspect **Submitter Full Name**
  2. ASSERT it is populated with the logged-in user's **FirstName LastName**
  3. Attempt to type into it
  4. ASSERT (BLOCKING) it is **read-only** — no caret, no keyboard input accepted
  5. Complete the remaining declaration fields and Submit
  6. ASSERT the submission proceeds using the auto-populated name
- **Expected result:** *"The field is read-only; no edit is possible (no caret, no keyboard input accepted)"*
- **Assertions:**
  - [ ] ASSERT the name matches the signed-in user
  - [ ] ASSERT (BLOCKING) typing into it changes nothing
  - [ ] ASSERT submission succeeds with the auto-populated value

---

### TC-07 — Declaration Capacity is a dropdown; free text is not accepted (ADO #102157 · TC-05-027)

*Priority 1 · Positive · `Src:Code`.*

- **Type:** Validation
- **Steps:**
  1. CLICK the **Capacity** control
  2. ASSERT a dropdown of pre-defined Capacity values opens
  3. RECORD every option offered *(the case gives Chairperson, Secretary, Treasurer as examples)*
  4. Attempt to type a value **not** in the list
  5. ASSERT (BLOCKING) the value is rejected, or free-text typing is prevented entirely
  6. SELECT a listed value and Submit
  7. ASSERT the selected value is recorded and submission proceeds
- **Expected result:** *"The system rejects values not in the list (or the UI prevents free-text typing entirely)"*
- **Assertions:**
  - [ ] ASSERT the dropdown opens with pre-defined values
  - [ ] ASSERT (BLOCKING) a non-listed value is rejected
  - [ ] ASSERT a listed value is recorded on submit
- **❓ Question for Thabiso:** the case's precondition says *"Canonical Capacity reference list source confirmed with BA"* — has that happened? Without the canonical list, step 3 can only record what is offered, not verify it.

---

### TC-08 — Tab-tick navigation preserves data on the current tab (ADO #102158 · TC-05-028)

*Priority 2 · Positive · `Src:Code`.*

- **Type:** Persistence / navigation
- **Steps:**
  1. With Tabs 2–4 complete and **Tab 5 partially filled**, enter data in at least one Tab 5 field
  2. ASSERT the Tab 4 tick mark is visible in the stepper
  3. CLICK the **tick mark of Tab 3 (Objectives)** in the stepper
  4. ASSERT the wizard navigates to Tab 3 and its data is **intact**
  5. CLICK Tab 5 in the stepper to return
  6. ASSERT (BLOCKING) Tab 5's previously entered data is **intact — no data loss from tab jumping**
- **Expected result:** *"Tab 5's previously entered data is intact - no data loss from tab jumping"*
- **Assertions:**
  - [ ] ASSERT Tab 3 data survives the jump
  - [ ] ASSERT (BLOCKING) Tab 5 data survives the round trip
- **⚠️ High-risk case given what we already know.** Saved data on this wizard loads **asynchronously after the step renders**, and has been observed wiping values. That is exactly the failure mode this case hunts. Read values back **after the form settles**, not immediately on arrival, or a genuine pass will read as a failure — and vice versa.

---

### TC-09 — Draft survives logout and re-login (ADO #102159 · TC-05-029)

*Priority 1 · Positive · `Src:Code`.*

- **Type:** Persistence
- **Steps:**
  1. Fill the wizard up to **Tab 4** with **2 OBs** added
  2. ASSERT the draft auto-saves *(a draft-save indicator should confirm persistence)*
  3. **Log out** — ASSERT logout succeeds
  4. Log back in as the same submitter
  5. ASSERT the draft application is listed on the user's dashboard
  6. Open the draft
  7. ASSERT (BLOCKING) it opens **at Tab 4** with all previously entered data intact
- **Expected result:** *"The draft opens at Tab 4 with all previously entered data intact"*
- **Assertions:**
  - [ ] ASSERT the draft auto-saves
  - [ ] ASSERT the draft is listed after re-login
  - [ ] ASSERT (BLOCKING) it resumes at Tab 4 with data intact
- **✅ Partly corroborated already:** two drafts from 2026-08-12 **did** persist across sessions and are resumable by URL. What is untested is whether they are **listed on the dashboard** (step 5) and whether they **resume at the right tab** (step 7).

---

### TC-10 — Submitter and chairperson receive the acknowledgement email (ADO #101695 · TC-05-019)

*Priority 1 · Positive. Continuation of TC-05.*

- **Type:** Notification
- **Steps:**
  1. After a successful submit (TC-05), check the **submitter's** inbox and the **chairperson's** inbox
  2. ASSERT (BLOCKING) both receive an acknowledgement letter carrying the **APP Reference Number**
  3. ASSERT the acknowledgement lists the **office bearers**
  4. ASSERT the OBs separately receive their **self-confirmation** emails/SMS
- **Expected result:** *"Both receive an acknowledgement letter (email) with the APP Reference Number; OBs receive their self-confirmation emails/SMS separately"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) submitter and chairperson both receive the acknowledgement
  - [ ] ASSERT the reference number in the email matches the one from TC-05
  - [ ] ASSERT OB self-confirmation notifications are sent *(this is the trigger for plan NPO-06)*
- **❓ Question for Thabiso:** which mailboxes should QA use for the submitter, chairperson and OB addresses on QA? This case and NPO-06 are unrunnable without real, checkable inboxes. Use `0818400598` for any SMS leg so delivery can be verified on the handset.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101678 | TC-05-002 | ⛔ blocked |
| TC-02 | #101682 | TC-05-006 | ⛔ blocked · needs 3 drafts |
| TC-03 | #101683 | TC-05-007 | ⛔ blocked |
| TC-04 | #101689 | TC-05-013 | ⛔ blocked |
| TC-05 | #101692 | TC-05-016 | ⛔ blocked — **the gateway case** |
| TC-06 | #102156 | TC-05-026 | ⛔ blocked |
| TC-07 | #102157 | TC-05-027 | ⛔ blocked |
| TC-08 | #102158 | TC-05-028 | ⛔ blocked |
| TC-09 | #102159 | TC-05-029 | ⛔ blocked |
| TC-10 | #101695 | TC-05-019 | ⛔ blocked · needs checkable inboxes |

**Not in this plan** (Functional suite 101888, 23 cases, to import later): the rest of TC-05-001 → 025.
