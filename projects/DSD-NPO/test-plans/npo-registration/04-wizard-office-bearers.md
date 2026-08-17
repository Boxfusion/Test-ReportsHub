# Test Plan: NPO-04 — Application Wizard, Tab 4 (Office Bearers & Verification) (smoke)

> **Status:** Imported from Azure DevOps — ✅ **reachable** (unblocked 2026-08-13), not yet executed
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
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101861) |
| ADO Suite | 101861 — *04 - Application Wizard - Tab 4 (Office Bearers & Verification)* (3 cases) |

## Objective
> Verify the Office Bearer tab: adding an OB whose SA ID passes DHA verification, CIPC pre-population of directors when the Legal Form is NPC, and enforcement of the statutory minimum of three office bearers before the wizard advances.

## ✅ Unblocked 2026-08-13
These cases were believed blocked behind the address autocomplete defect. **That blocker is retracted** — the
wizard advances past Organisation Details once the mandatory fields are entered with **real keystrokes**
(`fill()` does not bind on this form). See
[03-wizard-org-details-objectives.md](03-wizard-org-details-objectives.md) and
`test-reports/2026-08-13/03-wizard-org-details-objectives--admin-initiated-registration-process.md`.

Reaching Tab 4 is now a matter of driving the wizard, not waiting on a fix. Selectors here are still
`// TODO[selector]:` markers — they were never recorded, because the tab had not been reached. AI-repair resolves
them on first run.

▶ **Resumable draft parked at Objectives:** `APPL26-00793` (`id=525fb3ec-be80-428b-9e80-2bfa30525846`,
`todoid=5c7c7c7e-454c-4973-8fc8-e4af53d70d31`), Legal Form **Voluntary Association**. Resume it rather than
creating another.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO cases; all state `Design`.

⚠️ **Tab numbering differs between ADO and the UI.** ADO TC-04-008 says *"Navigate to Step 3"* for what the UI stepper calls **Tab 4 — Office Bearer**.

## Preconditions
- [ ] Signed in on the public portal; view mode **Live → Latest**
- [ ] A draft application completed through Organisation Details and Objectives
- [ ] DHA integration up (TC-01)
- [ ] CIPC integration up and the draft's Legal Form = **NPC** with a valid CIPC number (TC-02)

## Test data
| Field | Value |
|---|---|
| Valid SA ID | `8001015009087` — the ADO case's own example |
| Position | `Chairperson` |
| Mobile | `0818400598` |
| Free text | ≤100 characters |

## Test Cases

### TC-01 — Add an Office Bearer with a valid SA ID; DHA verification succeeds (ADO #101655 · TC-04-001)

*Priority 1 · Positive. Needs Steps 1–2 complete and DHA up.*

- **Type:** Happy path (integration)
- **Steps:**
  1. Reach the **Office Bearer** tab
  2. SNAPSHOT
  3. CLICK **Add Office Bearer**
  4. ASSERT the OB form opens
  5. TYPE Name, Surname, SA ID `8001015009087`, Email, Phone
  6. SELECT Position = **Chairperson**
  7. CLICK **Save**
  8. API — capture the DHA verification call and its response body
  9. ASSERT (BLOCKING) the OB appears in the list with status **'ID Verified'**
- **Expected result:** *"DHA verification call runs; OB appears in list with status 'ID Verified'"*
- **Assertions:**
  - [ ] ASSERT the Add Office Bearer form opens
  - [ ] ASSERT (BLOCKING) the OB is listed with status `ID Verified`
  - [ ] ASSERT the DHA call returned 2xx
- **📌** The status string **`ID Verified`** is prescribed verbatim by the case. Assert the exact text — a near-match ("Verified", "ID verified") is a finding, not a pass.

---

### TC-02 — Legal Form NPC pre-populates the OB list from CIPC (ADO #101662 · TC-04-008)

*Priority 1 · Positive. Needs Legal Form = NPC with a valid CIPC number, and CIPC up.*

- **Type:** Happy path (integration)
- **Steps:**
  1. On a draft whose Legal Form is **NPC** with a valid CIPC registration number, navigate to the Office Bearer tab *(ADO: "Step 3")*
  2. WAIT for the CIPC lookup to settle
  3. ASSERT (BLOCKING) directors and NPC details are **pulled from CIPC and pre-populated** *(FDS 7.5.4 rule 2)*
  4. ASSERT the user can still **add OBs not in CIPC manually**
- **Expected result:** *"Directors and NPC details are pulled from CIPC and pre-populated (FDS 7.5.4 rule 2); user can add OBs not in CIPC manually"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the OB list is pre-populated from CIPC
  - [ ] ASSERT manual addition is still available alongside the CIPC rows
- **❓ Question for Thabiso:** which CIPC registration number should QA use on the QA environment to get a real pre-population result? Without a known-good number this case cannot be distinguished from "CIPC returned nothing".

---

### TC-03 — Minimum of three office bearers is enforced before Next (ADO #102155 · TC-04-023)

*Priority 1 · Negative · `Src:Code`. This is the substantive business rule in the suite.*

- **Type:** Negative / validation
- **Steps:**
  1. Reach the Office Bearer tab with **0** OBs added
  2. CLICK **Next** → ASSERT the validation error **'Minimum 3 office bearers required'**
  3. Add **1** OB, CLICK **Next** → ASSERT the same error
  4. Add a **2nd** OB, CLICK **Next** → ASSERT the same error
  5. Add a **3rd** OB, CLICK **Next**
  6. ASSERT (BLOCKING) the wizard advances to Tab 5 (**Admin & Operations**)
- **Expected result:** the exact string *"Minimum 3 office bearers required"* at 0, 1 and 2 OBs; advance to Tab 5 at 3
- **Assertions:**
  - [ ] ASSERT the error appears with 0 OBs
  - [ ] ASSERT the error appears with 1 OB
  - [ ] ASSERT the error appears with 2 OBs
  - [ ] ASSERT (BLOCKING) Next advances with 3 OBs
- **⚠️ Expect this case to expose the silent-validation defect.** The case prescribes a **visible validation error message**. Every other wizard step we have driven blocks with a **disabled `Next` and no message at all** (five instances found on 2026-08-12). If Next is merely disabled here with nothing shown, that **fails this case as written** — assert the message text, not just the fact that navigation was blocked.
- 🔑 **Assert the `disabled` property directly.** A click timeout on a disabled Next is not a hang.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101655 | TC-04-001 | ⛔ blocked |
| TC-02 | #101662 | TC-04-008 | ⛔ blocked · also needs a known-good CIPC number |
| TC-03 | #102155 | TC-04-023 | ⛔ blocked |

**Not in this plan** (Functional suite 101887, 21 cases, to import later): the rest of TC-04-002 → 022.
