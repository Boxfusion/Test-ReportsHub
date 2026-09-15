# Report: NPO Annual Compliance 08 — Annual Report Submission (public portal)

**Date:** 2026-08-17 07:36 UTC
**Plan:** test-plans/annual-compliance/08-annual-report-submission.md
**Spec:** test-plans/annual-compliance/08-annual-report-submission.spec.ts
**Execution Mode:** ai-repair
**Result:** PARTIAL — report submitted end to end; 2 of 5 cases fail because prescribed controls are absent from the build
**Duration:** ~2400s
**Cases:** TC-08-007, TC-08-009, TC-08-011, TC-08-014, TC-08-017
**Environment:** QA · public portal · view mode **Latest** · forms `annual-compliance-create v22`, `create-annualComplianceAchievement v13`
**Application under test:** NPO `333-019-NPO` (`Nomfanelo QA Annual NPO 2026-08-17`) · annual report **ANN2119/17/08/2026**

## Summary
| Total Cases | Passed | Failed | Partial |
|-------------|--------|--------|---------|
| 5 | 2 | 2 | 1 |

**This suite was blocked since 2026-08-13 for want of an NPO with a report due. That precondition is now built and documented below — it is reusable.**

## How the precondition was manufactured

Suite 08 needs an NPO whose annual report is outstanding. Establishing it took four steps, and step 4 is the
important one because it is **not** something a tester can do through the UI.

1. **Registered a new NPO through the supported public journey** — *Register NPO → Register a new NPO → POPIA →
   Initiate Registration* → 7-step wizard → Submit. Application **APPL26-01143**. Financial year end set to
   **February** so that a year end (28 Feb 2026) would fall inside the NPO's registered life.
2. **Processed it on admin to REGISTERED** — Workflows → Inbox → *OB Compliance* (all OBs compliant = Yes) then
   *Verification* (refuse/reject = No, three verification questions = Yes) → **Approve**. Assigned **`333-019-NPO`**,
   `Shesha.Core.OrganisationStatus = 4` (Registered).
3. **Back-dated the registration date.** There is no registration-date field anywhere in the wizard —
   `dateRegistered` is stamped by the server at approval. It was set to **2024-06-01** via
   `PUT /api/dynamic/boxfusion.dsdnpo/NpoOrganisation/Crud/Update` with only `{id, dateRegistered}` in the body.
   A full 81-field before/after diff confirms **only `dateRegistered` and the audit stamp changed** — no collateral
   damage of the kind seen in the office-bearer wipe bug.
4. **Created the reporting-period record.** Back-dating alone changed nothing: the portal still said
   *"No annual report can be initiated at this time."* An `AnnualCompliance` row had to be created for the period
   (`financialPeriodEnding 2026-02-28`, `financialPeriodYear 2026`, `financialPeriodMonth 2`,
   `dueDate 2026-12-01`, `complianceStatus 1 = Expected Reports`). The moment that row existed, the portal replaced
   the blocking message with **Request Extension** and **Initiate Report**.

**Reference data decoded for reuse** (`Shesha.Core.OrganisationStatus`): 1 Application In Progress · 2 Application
Incomplete · 3 Application Failed · **4 Registered** · **5 Outstanding Report** · 6 Deregistered · 7 Cancelled ·
8 Appealed Npo · 9 Not Registered. (`AnnualComplianceStatus`): 1 Expected Reports · 2 Not Submitted Reports ·
3 Submitted Reports · 4 Queried Reports · 5 Failed Submission · 6 Organisation New.
**Due date convention:** for a February year end the due date is **1 December of the year end's year**, and the
period record is created just *after* the year end (a real 2019 record was stamped `creationTime 2019-03-02` for
`financialPeriodEnding 2019-02-28`).

## The live wizard does not match the ADO step numbering

The report wizard runs **8 steps**: 1 Annual Report Guideline · 2 Organisation Details · 3 Particulars of Office
Bearers · 4 Admin and Operations · 5 Achievements & Employees · 6 Financial Report · 7 Financial Statement ·
8 Declaration.

The ADO cases speak of "Step 1 / Step 2 / Step 3 / Step 5 / Step 6" and those do **not** line up — it is not a
uniform offset, because the build has a Guideline step in front and splits financials across two steps:

| ADO case says | Actually lives on |
|---|---|
| Step 1 — org details, tax, auditing firm | Step **2** Organisation Details (tax/audit controls absent) |
| Step 2 — programmes, employees, meetings | Step **5** Achievements & Employees |
| Step 3 — OB list, "OBs still apply" | Step **3** Particulars of Office Bearers |
| Step 5 — threshold, accounting officer, funding | Step **6** Financial Report |
| Step 6 — declaration, submit | Step **8** Declaration |

## Step Results

### TC-08-007 — Step 1: org details auto-populate; tax number and auditing firm captured (ADO #101739) — FAILED

- ✅ Organisation information is displayed and is **read-only** — and read-only is enforced *structurally*: the whole
  step renders as text with **no input elements at all**, so the assertion was tested by attempting an edit and
  finding nothing editable, not by reading an attribute.
- ✅ Values carried correctly from registration: Name, Trading Name, WhatsApp, Full Address, Cellphone, Email,
  Financial Y/End = February, Legal Form = Voluntary Association.
- 🔴 **The case's capture assertions have nowhere to execute.** There is no **Audited Yes/No** control and no
  **auditing firm** group anywhere in the wizard, and **Income Tax Number is display-only and empty** on this step.
  The nearest equivalent — *Accounting officer name* / *Practice number* / *Account Officer Report* — sits on step 6
  and appears only above the reporting threshold.
- 🔴 **Province, District Municipality, Metropolitan Municipality and Area Code all render blank here**, although
  they were derived and shown at registration (Gauteng / City of Tshwane Metropolitan Municipality / 0149). Same
  "captured but not displayed" shape already recorded on the admin application view.

### TC-08-009 — Step 2: programmes, employees and meetings captured (ADO #101741) — PASSED

- ✅ Achievement added (*Services Provided* + *Activities For The Year*), saved, and listed in the summary.
- ✅ All **20** employee demographic fields captured across two groups (Management/Executive and Operations), each
  split female/male/other-gender/non-SA/SA and Indian/Coloured/African/White/Asian.
- ✅ Meetings captured: AGM notes, 2 special general meetings, 4 board meetings, 1 other, each with comments.
- ✅ All three sub-forms asserted independently, all persisted (`NarrativeReport 8adcd978-8ad3-4740-87dd-2108cd64e907`).

### TC-08-011 — Step 3: OB list visible; user confirms the OBs still apply (ADO #101743) — FAILED

- ✅ The office-bearer list renders and **matches the NPO's record exactly** — Ryno Koen (Chairperson, SA ID),
  Thandi Mokoena (Secretary, passport), Sipho Ndlovu (Treasurer, passport), with nationality, passport numbers and
  expiry dates.
- 🔴 **There is no "OBs still apply" confirmation control** — zero checkboxes on the step. The prescribed
  *"tick 'OBs still apply' → confirmation is accepted"* cannot be performed, and **Next is enabled without any
  confirmation**, so nothing records that the submitter affirmed the OB list.
- 🔴 The SA ID number renders **unmasked** here (`8001015009087`), whereas the admin grid masks it (`800101*******`).

### TC-08-014 — Step 5: finance report threshold and accounting officer (ADO #101746) — PASSED

- ✅ **Reporting thresholds recorded** (the plan's open question): exactly two bands — **`R0 - R499 000`** and
  **`R500 000+`**, on a field labelled `Is Above Threshhold` (misspelled). Selecting `R500 000+` persists
  `isAboveThreshhold: true` and the portal grid shows *Is Above Threshhold = Yes*, so **the mapping is correct**.
- ✅ Accounting officer captured and persisted: `accountingOfficerName "Lindiwe Mahlangu CA(SA)"`,
  `accountingOfficerPracticeNumber "PR-2026-88431"`.
- ✅ Funding captured and persisted: `npoReceivedFunding: true`, one funder row (Government / National Development
  Agency / 750 000). Source Of Funding offers only **Government** and **Private**.
- ⚠️ **The first selection of `R500 000+` did not bind.** The conditional accounting-officer group did not render and
  the *lower* band's rule (`fundedAmount must be maximum 499999`) was still enforced against a 750 000 entry.
  Toggling to the other band and back rendered the group and applied the correct rule. Two attempts, reproducible.
- ⚠️ **Toggling the threshold silently discards an already-captured funding row** — the table dropped back to
  *"No Data"* with no warning.
- ⚠️ The threshold radio must be committed with the `plus-circle` button before Next enables; with the row filled but
  uncommitted, **Next is disabled with no message** — the same silent-disabled-Next pattern seen in registration.
- ⚠️ *Accounting officer name*, *Practice number* and *Account Officer Report* are **not marked required** even
  though they only appear above the threshold, where an accounting officer report is the statutory expectation.

### TC-08-017 — Step 6: declaration captures chairperson details and submits (ADO #101749) — PARTIAL

- ✅ **(BLOCKING) Submission succeeded.** `AnnualComplianceSubmission` **ANN2119/17/08/2026**,
  `submissionDate 2026-08-17T07:23:45`, `complianceStatus 3 = Submitted Reports`, `status 2`,
  `dateCompleted 2026-08-17`, linked `FinancialStatement` and `NarrativeReport`.
- ✅ **Retrievable** — asserted separately, as the plan requires. The portal grid now lists
  `ANN2119/17/08/2026 · Mpendulo ntshangase · Annual Reporting In Progress · Yes · February · 2026 ·
  17/08/2026 07:23`, and *Initiate Report* correctly reverts to the blocking message now that a report is in
  progress.
- 🔴 **No date field exists on the declaration step**, so *"ASSERT the date auto-populates"* has nothing to assert
  against.
- 🔴 **Chairperson details are not captured.** The step offers only *Name of submitter* (auto-populated read-only
  with the signed-in user, `Mpendulo ntshangase`) and *Position*. The case asks the submitter to **type the
  chairperson full name and capacity**; `declarationChairPersonName` and `declarationChairPersonCapacity` are both
  **empty** on the stored submission.
- ⬜ **Acknowledgement email/SMS not yet verified.** The organisation email and the chairperson's OB email are both
  the tester's address and the mobile is `0818400598`, so it is checkable — it just had not arrived at time of
  writing. This assertion is genuinely unverified, not passed.
- ⚠️ The grid label reads *Annual Reporting In Progress* while the stored `complianceStatus` is *3 = Submitted
  Reports* — two different words for the same state.

## Observations and questions for the test lead

1. 🔴🔑 **`AnnualComplianceGeneratorJob` creates nothing, for anybody.** Run three times on demand
   (`POST /api/services/Scheduler/ScheduledJob/StartJob`, job `de4e3273-ad1b-4a87-a74a-0eea3c62986f`), it completed
   successfully each time in under a second and logged *"Created 0 Annual Compliance record(s). Notifications sent:
   0, failed: 0."* — **for the whole register**, not just our NPO. It stayed at 0 with the year end set to the
   current month and with `lastReportingPeriodCreated` both null and back-dated. A reporting period had to be
   created by hand for suite 08 to run at all. **Question for Thabiso: what is meant to create a newly registered
   NPO's first reporting period, and is this job expected to be producing zero today?** If nothing creates it, no
   NPO registered on this build would ever be asked for an annual report.
2. **Two of the five cases fail on absent controls, not on broken behaviour** — the *Audited / auditing firm* group
   (TC-08-007) and the *"OBs still apply"* confirmation (TC-08-011). Both may be cases that need rewriting against
   the built wizard rather than build defects. **Which one changes?**
3. 🔴 **The `Assets` total on step 7 is wrong three different ways.** On screen it accumulates instead of assigning:
   with Non Current 400 000 + Current 320 000 it showed 720 000 correctly, but after editing the inputs it kept a
   constant **+720 000 offset** (verified across two independent perturbations — 200 000 + 100 000 displayed as
   1 020 000 instead of 300 000). The **stored** `assetsTotalAmount` is **20 000**, which is neither the displayed
   1 020 000 nor the correct 300 000 — it is the *Loan For Staff Amount*. A tester who corrects a figure submits an
   inflated total; the register stores a third number again.
4. **Other stored financial aggregates look inconsistent** — `totalIncomeAmount: 0` while `incomeSubtotal: 1320000`;
   `expensesSubtotal: 740000` while `totalExpenditureAmount: 1195000` (the latter is correct);
   `percentageSpentOnAdministration: 151.35` for administration of 45 000 against expenditure of 1 195 000 (3.8%).
   `incomeExpenditureDifference: 125000` **is** correct. **Are the `*Subtotal` and `*TotalAmount` pairs meant to hold
   different things, or is one of each pair dead?**
5. **Balance-sheet inputs land in oddly named columns** — *Current Assets* → `currentAssetsAccountReceipts`,
   *Equity* → `equityAndLiabilityNonCurrentOthers`. Possibly deliberate reuse of a wider schema; worth confirming
   before anyone reports off these columns.
6. **`Financial Period Year` is populated here** (2026) — the blank-year problem recorded on 2026-08-13 for the admin
   annual-compliance list did not reproduce on this record.
7. ⚠️ **Retracted mid-run:** an apparent inversion of the threshold labels, and an apparent 200 000 error in
   *Total expenditure*. The first was the non-binding first selection described under TC-08-014; the second was a
   mid-flight computation during rapid programmatic filling — re-tested by changing one input at a time, both totals
   are correct and reactive. Neither is a defect. Recorded so they are not re-raised.

## Artefacts

| Item | Value |
|---|---|
| NPO | `333-019-NPO` · `4be65ab5-c421-4b22-a275-0a26ccd802f6` |
| Registration application | `APPL26-01143` · `44a73f41-aed9-44aa-b7c7-f2e8fe758248` |
| Annual report submission | `ANN2119/17/08/2026` · `28f3a797-a844-43f9-8dfe-f1f68b44452f` |
| Reporting period (created) | `dddfbdf0-8451-4bd3-b1d2-50ea03892b20` |
| Financial statement | `857b57f7-9ede-419e-a40b-1016ef41fe01` |
| Narrative report | `8adcd978-8ad3-4740-87dd-2108cd64e907` |
| Office bearers | Ryno Koen (Chairperson) · Thandi Mokoena (Secretary) · Sipho Ndlovu (Treasurer) |
