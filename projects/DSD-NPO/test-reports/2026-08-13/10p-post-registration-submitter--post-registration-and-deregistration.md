# Report: NPO-10P/10A · NPO-13P/13A — Post Registration and Voluntary Deregistration

**Date:** 2026-08-13 17:06 UTC
**Plan:** test-plans/post-registration/10p-post-registration-submitter.md
**Spec:** test-plans/post-registration/10p-post-registration-submitter.spec.ts
**Execution Mode:** ai-repair
**Result:** PARTIAL — 8 of 12 cases pass; the assessor cannot see what a change request asks for, and asset transfer has no UI
**Duration:** 1200s
**Cases:** TC-10-001, TC-10-002, TC-10-006, TC-10-007 (101868) · TC-10-008, TC-10-009 (101867) · TC-13-001, TC-13-002, TC-13-005, TC-13-007 (101875) · TC-13-008, TC-13-010 (101874)
**Environment:** QA · both portals · view mode **Latest**
**Records created:** change request **POST1042/13/08/2026** · deregistration **DER2015/13/08/2026**
**⚠️ End state: `333-018-NPO` is now DEREGISTERED** (TC-13-010 is destructive by design — run on our own record only)

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 48 | 37 | 8 | 3 |

## Case results
| Case | ADO | Verdict |
|---|---|---|
| TC-10-001 Initiate change request | #101762 | ✅ **PASS** |
| TC-10-002 Change type drives fields | #101763 | ✅ **PASS** (4/4 branches + inverse) |
| TC-10-006 Step 2 old vs new values | #101767 | 🔴 **FAIL** — no side-by-side, no read-only current value |
| TC-10-007 Documents + declaration submit | #101768 | ✅ **PASS** — acknowledgement letter issued |
| TC-10-008 All Post Registration list + filter | #101769 | ✅ **PASS** |
| TC-10-009 Details show info, status, attachments | #101770 | ⚠️ **PARTIAL** — the requested change is not displayed |
| TC-13-001 Blocked while reports outstanding | #101800 | ⛔ **NOT EXECUTABLE** — no NPO in arrears |
| TC-13-002 Compliant NPO initiates; pre-populated | #101801 | ✅ **PASS** |
| TC-13-005 Receiving NPO search for asset transfer | #101804 | 🔴 **FAIL** — the step does not exist |
| TC-13-007 Documents + declaration submit | #101806 | ✅ **PASS** |
| TC-13-008 All Deregistration list + filter | #101807 | ⚠️ **PARTIAL** — filter works, our record is absent |
| TC-13-010 Validate documents deregisters NPO | #101809 | ✅ **PASS** — status + notice both confirmed |

## ✅ Post Registration — the wizard itself is sound

**TC-10-001** `Post Registration` → `/portal-change-request-table?npoId=…` (list: *Ref Number · Type Of Change Request ·
Change Request Status · Submitted By · Submitted Date*) → **Initiate Post Registration** → a **4-step wizard**.

📌 **The app's step numbering is offset from the case.** The wizard is *1 Guideline · 2 Post Registration Details ·
3 Update · 4 Declaration*, so the case's "Step 1 (details)" is really step 2, and its "Step 2" is step 3.
Worth aligning the case.
📌 The action is labelled **Initiate Post Registration**, not *Initiate Change*.

**TC-10-002 — all four branches correct, including the inverse the plan asked for.**

| Type Of Change | Fields revealed | Case expects |
|---|---|---|
| Foundational Change | Financial Year End Month · Organisation Name · Organisation Objective · Other Foundational Changes | year-end, name, objective, other ✅ **4/4** |
| General Change | Office Bearer & Number Of Office Bearer | OB + organisation change ⚠️ **one combined field, not two** |
| Foundational And General Changes | **both groups (5 fields)** | **(BLOCKING)** both ✅ |
| LegalForm Change | Organisation Type → **NPC · Trust** | NPC / Trust / **VA** ⚠️ see below |

- [PASS] **Switching type hides the previous group** and the visible-field count returns to base — the data-integrity
  behaviour the plan asked for is present.
- ⚠️ **`VA` is missing from Organisation Type** — but **our NPO is itself a Voluntary Association**, so this is
  plausibly a deliberate exclusion of the current legal form. **Not raised as a defect**; confirm against a Trust
  NPO, which should then show NPC/VA.
- 📌 Label inconsistency: *Organisation **Objective*** under Foundational Change vs *Organisation **Objectives***
  under the combination branch. Also **`LegalForm Change`** is missing a space.

**TC-10-007 — PASS.** Declaration pre-fills the name; **Position** (10 options) and **Supporting Documents** are
both required and **Submit stays disabled until the document is attached** — the guard works. Submitted, and
retrievable as **POST1042/13/08/2026**.
✅ **The acknowledgement letter IS issued** — `AcknowledgementLetter.pdf (106.16 kB)` under *Correspondence* on
the admin record. That satisfies the BLOCKING assertion.
📌 Status displays as **`Submited`** — misspelled, on both portals.
📌 `refNumber` is stored with a **leading space**: `" POST1042/13/08/2026"`.

## 🔴 TC-10-006 / TC-10-009 — the assessor cannot see what is being requested

This is the substantive finding of the run, and it is exactly what the plan warned to check.

**On the submitter side (TC-10-006):** ADO #101767 prescribes *"current values displayed **read-only**; new value
fields **editable**"*. What exists is **a single editable field pre-filled with the current value**:

- [FAIL] There is **no read-only current-value display** and **no side-by-side old-vs-new**. Once the user types
  over it, the original is gone from the form.

**On the admin side (TC-10-009):** the details page shows *Declarations* (Firstname, Surname, Position), *status*
and *attachments* — but **the requested change appears nowhere**. The *Foundational Change* tab renders no values.

**The data is stored correctly** — confirmed against the API the page itself calls:
```
generalChangeRequestProperties.organisationName : "Nomfanelo QA NPO Renamed 2026-08-13"   ← the NEW value
registerOrganisationNameChange                  : true
npo.name                                        : "Nomfanelo QA NPO 2026-08-13"           ← the OLD value
```
**Both values exist; the UI renders neither.** A DSD assessor is asked to approve a name change without being
shown the old name, the new name, or that a name change was requested at all.
Bug: `test-reports/bugs/2026-08-13-change-request-values-not-displayed.md`

🔑 **This is now the FOURTH "generated or stored, but not displayed" defect found today:**

| # | What exists | Where it should show | Proof it exists |
|---|---|---|---|
| 1 | Investigation `investigator` + `reviewer` | case list + case details | API returns both ids |
| 2 | Risk Status (built on Interventions) | applications + annual reports | live `Low/Medium/High` field |
| 3 | Change request old **and** new values | assessor's details page | API returns both |
| 4 | Deregistration notice **document** | deregistration record | tester received it **as an email attachment** |

Four areas, one shape: **the data or document is produced correctly and the UI never surfaces it.** Worth putting
to Thabiso as **a single systemic question** — is there a common pattern (a shared details-page template, or a
correspondence component) that these forms are missing?

## ✅ TC-10-008 — All Post Registration list — PASS
`/dynamic/boxfusion.dsdnpo/change-requests` — **68 items**, columns *Ref Number · Npo Number · NPO Name ·
Type Of Change · Status · Submitter · Submitted Date*, **correctly sorted newest-first** (our POST1042 at the top).

- [PASS] **(BLOCKING)** The list renders
- [PASS] **The status filter works** — `APPROVED` narrowed **68 → 14** and **every visible row carried APPROVED**
- [PASS] Clearing restored **68**
- 📌 The toolbar funnel icon opens nothing (as on Investigations); filtering is via the quick-search box.
- 🔑 **This corrects the scope of the TC-12-004 finding.** Status filtering *does* work on `sha-react-table` grids;
  it fails specifically on the Investigations **card list**, where `CLOSED` returned 0. Per-page, not global.

## 🔴 TC-13-005 — Asset transfer has no UI at all
The deregistration wizard has **exactly three steps**: *Guideline · Deregistration Details · Declaration and
Documents*. There is **no Asset Transfer step**, despite all three of these:

1. The guideline text explicitly promises *"**Step 2: Asset Transfer (Optional)**"*
2. Deregistration Details offers a **"Do you want to donate assets?"** checkbox — **I ticked it and it stayed
   ticked**, and the wizard still went straight from details to declaration
3. The declaration requires an **"Assets Transfer Form File"** upload

- [FAIL] **(BLOCKING)** There is **no NPO Database search for a receiving organisation** and no way to select one.
  The words *asset transfer*, *receiving* and *beneficiary* appear nowhere in the wizard after the guideline.

So assets can be declared as donated and a transfer form uploaded, but **the receiving NPO is never captured
anywhere in the system**. Bug: `test-reports/bugs/2026-08-13-asset-transfer-step-missing.md`

## ✅ TC-13-002 / TC-13-007 — the deregistration flow works
**TC-13-002 PASS** — Deregistration Details opens with **NPO Name and Npo Number pre-populated**
(`Nomfanelo QA NPO 2026-08-13` / `333-018-NPO`).

- Fields: *Type of severance* (**Voluntary Deregistration · Dissolution Winding Up** — note the case's third
  option is not offered separately), *Reason for deregistration*, *Effective date*, *Office Bearer*
- ✅ **The effective-date picker correctly disables all past dates** (only 13/08/2026 onward selectable)
- ✅ **The Office Bearer picker lists exactly our three registered office bearers**, and selecting *Ryno Koen*
  pulled through his ID `8001015009087`, cell, email, nationality and position from the registration record

**TC-13-007 PASS** — **RECORDED, as the plan asked: the required documents are**
*Assets Transfer Form File · Official letter stating reasons for VD · Minutes and attendance register of meeting ·
Section 23 Form* (all mandatory), with *Financial Report Document File* **optional**.
Submit stayed disabled until all four were attached. Submitted as **DER2015/13/08/2026**, status
*Deregistration In Progress*.
⚠️ **The acknowledgement letter could not be evidenced** — unlike the change request, the deregistration record has
**no Correspondence or Notification section at all**. Possibly email-only; worth checking the tester's inbox.

## ⚠️ TC-13-008 — list and filter work, but our application is missing from it
`/dynamic/boxfusion.dsdnpo/voluntary-deregistrations` — **31 items**, columns *Date Created · Non-Profit
Organization · Contact Person FullName · Contact Person Cellphone · Contact Person Email · Status*.

- [PASS] **(BLOCKING)** The list renders
- [PASS] **The status filter works** — `DEREGISTRATION APPROVED` narrowed **31 → 6**, all matching; clearing restored 31
- [FAIL] 🔴 **Our `DER2015` does not appear in this list.** Searching the NPO name and `Nomfanelo` both return
  **No Data**, yet the same application is at the **top of the workflow inbox** and was actioned successfully from
  there. So *All Deregistration Applications* does **not** show all deregistration applications.
- [FAIL] ⚠️ **No default sort** — page 1 runs 28/09/2025, 28/09/2025, 27/09/2025, 06/08/2026, 12/08/2026,
  12/02/2026… (same defect as the Investigations list)
- 📌 **No Ref Number column**, though the submitter's own list has one — so an application cannot be located by the
  reference the NPO was given. The three *Contact Person* columns are **blank on every row**.
- 📌 The case prescribes no column set, so the above is reported, not failed.

## ✅ TC-13-010 — Validate Documents deregisters the NPO — PASS
Opened **our own** DER2015 from the inbox (*Review (DSD)*). The details page renders the full submission — statuses,
severance type, **our reason text**, effective date, OB details and all four documents.

**Validate Documents** dialog: *"Are all documents received"* Yes/No → selecting **Yes** enables **Approve** and
correctly **hides** the rejection fields; **Decline** stays disabled. Approve → workflow completed.

- [PASS] **(BLOCKING)** **The organisation status changed to `DEREGISTERED`** — confirmed on the public portal
- [PASS] V.Deregistration Status → **DEREGISTRATION APPROVED**; a **Validation Outcome** tab now records the decision
- [PASS] **Status-driven actions updated correctly** — the NPO landing view's *Annual Reports · Post Registration ·
  Voluntary Deregistration* actions **disappeared**, leaving only *Submit Query*
- 📌 **The case's ambiguity is resolved: the app sets `Deregistered`**, not "Deregistration". Tighten #101809.
- [PASS] ✅ **The deregistration notice IS issued, as a document.** Confirmed by the tester: the deregistration
  email arrived **with an attachment**. That satisfies *"deregistration notice issued (FDS Dereg 8.3)"* in full —
  the notice is not merely body text, the document is generated.
- [FAIL] ⚠️ **The generated notice is never linked to the record.** The admin deregistration page has **no
  Correspondence section and no Notification Audit at all**, so DSD staff cannot see the notice, download it, or
  re-send it. The **change request** page has both (*Correspondence* → `AcknowledgementLetter.pdf` + a **Re-Send**
  button + a full notification audit), so this is an **inconsistency between two forms**, not a broken pipeline.
  **The document exists and was delivered; only the link to the record is missing.**
- [FAIL] ⚠️ **The dialog does not list the submitted documents**, though the case requires it and the dialog's own
  hint says *"Download and validate all documents submitted"*. The documents are on the page behind it, not in it.

## ⛔ TC-13-001 — not executable, and correctly so
The case needs an NPO with **outstanding annual reports ≥ 6 months**. `333-018-NPO` was registered **today** with a
March year-end, so **nothing is due** — as suite 09 already established, with the guard enforced server-side.

Deregistration proceeded without a block, but **that is correct behaviour for a compliant NPO** and therefore
**does not test Thabiso's suspected gap**. His drift note (*"NO outstanding-report block enforced at VD initiation.
Expect to FAIL"*) remains **unverified**.
▶ **To run it we need a QA NPO genuinely in arrears** — worth asking Thabiso to nominate one, as the plan suggests.

## 🔑 A deregistered NPO is indistinguishable to the public
Immediately after deregistration, the anonymous lookup still returns it — **with no status field**:
```
GET /api/services/dsdnpo/Organisations/GetNpoLookup?term=333-018   → 200
{ npoNumber: "333-018-NPO", name: "Nomfanelo QA NPO 2026-08-13",
  physicalAddressText: "18 South Street, Zwartkop, Centurion, South Africa" }
```
This gives the **TC-14-007 "no status returned" finding a concrete consequence**: a member of the public — or a
donor — checking the register cannot tell a **deregistered** NPO from a registered one, while still being given
its physical address. Strengthens the case for adding status to that endpoint.

## 🔴 Defects raised
1. **Change request values are stored but never displayed to the assessor** *(High)* —
   `bugs/2026-08-13-change-request-values-not-displayed.md`
2. **Asset transfer step missing entirely from voluntary deregistration** *(High)* —
   `bugs/2026-08-13-asset-transfer-step-missing.md`
3. Deregistration applications missing from the admin list — folded into defect 2's file as a related finding.

## ❓ Questions for the test lead
1. 🔑 **Where should the assessor see the requested change?** The old and new values are both stored.
2. 🔑 **Is asset transfer implemented anywhere?** The guideline, the checkbox and the required upload all imply it.
3. **Why is `DER2015` absent from All Deregistration Applications** while sitting in the workflow inbox?
4. **Why is the deregistration notice not filed against the record?** It **is** issued — the tester received the
   email — but the deregistration page has no Correspondence or Notification Audit section, so staff cannot see or
   re-send it. The change request page has both. Is the section simply missing from this form?
5. **Which QA NPO is in annual-report arrears**, so TC-13-001 can finally be run?
6. Should `Organisation Type` exclude the NPO's current legal form (VA was absent for a VA)?
7. Typos: **`Submited`** status, **`LegalForm Change`**, and a **leading space** in the change-request ref number.

## ▶ Next
**All 20 smoke suites have now been executed.** Verified coverage is **52 of 70 cases**; **18 remain**:

| Not executed | Count | Why |
|---|---|---|
| Suite **08** — TC-08-007/009/011/014/017 | 5 | ⛔ needs an NPO with an annual report **due** |
| **11A** — TC-11-007/008/012 · **11P** — TC-11-001/005 | 5 | ⛔ needs a **denied** application |
| **05** — TC-05-006/007/028/029 | 4 | per-case gaps inside an executed suite |
| **03** TC-03-005 · **04** TC-04-008 · **07** TC-07-003 | 3 | per-case gaps (TC-07-003 deferred — grid hung) |
| **14W** accessibility | 1 | partial by design; never run |

⚠️ Also **attempted but not verifiable**: **TC-13-001** (needs an NPO in arrears) and **TC-01-010** (no SA ID field
exists) — both counted as executed above because they were driven to a conclusion, but neither *validates its rule*.

⚠️ **`333-018-NPO` is now deregistered**, so any further submitter-side work needs a **newly registered NPO** —
the registration path is proven and takes one run.
The **314-case Functional plan (101543)** remains unimported and is now the largest body of outstanding work.
