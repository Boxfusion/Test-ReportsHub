# Annual Compliance — Submission (Portal), FUNCTIONAL suite 08

**Date:** 2026-08-17
**Plan:** test-plans/annual-compliance/08-annual-report-submission-functional.md
**Result:** FAILED — an above-threshold report needs no accounting officer, no practice number and no accounting-officer report; and a captured funder name is silently dropped
**Cases:** TC-08-006, TC-08-008, TC-08-010, TC-08-012, TC-08-013, TC-08-015, TC-08-016, TC-08-018, TC-08-021, TC-08-022, TC-08-023
**Assessed-not-executed:** TC-08-001, TC-08-002, TC-08-003, TC-08-004, TC-08-005, TC-08-019, TC-08-020
**Environment:** QA · public portal · view mode **Latest** · `boxfusion.dsdnpo/annual-compliance-create v22`
**Record:** NPO `333-019-NPO` · report **`ANN2363/17/08/2026`** (FY 2025), workflow `69215512-4d51-4a5b-94db-97b1c99e86df`

## Summary

| Cases in suite | Executed | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|---|
| 18 | 11 | 5 | 4 | 2 | 7 |

Two findings are worth a developer's time before anything else: **the R500 000 threshold collects no accounting-officer
information and does not require any**, and **the funding table silently discards the funder's name**. Both are on the
Financial Report step, both are silent, and both would survive to the assessor.

🔑 **Login note:** `qa.tester0812@example.org` is **rejected on the public portal** — the API returns 401 and the page
renders the internal message **"Forbidden frontend"**. Reproduced twice. Used the shared account instead. Worth asking
whether that account is meant to have public-portal access, and separately whether an internal guard name should ever
reach a user's screen.

## The precondition is a product gap, and it is now fully mapped

Nothing in the product creates the `AnnualCompliance` period row that every case in this suite depends on:

| Route | Result |
|---|---|
| `AnnualComplianceGeneratorJob` | 0 records created, register-wide (measured 3× this morning) |
| Admin → CRUDS → Annual Compliance → **Add** | 🔴 opens an **empty modal** — "Add New Record", zero fields, Cancel/OK only |
| A newly registered + approved NPO | no period row |

🔴 **The admin `Add` button is new information** and it closes the open question from 2026-08-13 ("is CRUDS → Annual
Compliance → Add a supported capture path?"). The answer is **no — it is not wired up at all.** So there is no
UI route, for staff or applicant, to create a reporting period.

⚠️ **I also checked the assessor side: a submitted annual report creates NO workflow task.** The inbox returns nothing
for `ANN2119` (submitted this morning, 07:23). That matters for TC-08-016 below and corroborates the 08-13
"TC-09-003 Quality Assure not found" finding.

The row was therefore inserted directly, as recorded in the precondition note. **Everything asserted below was then
driven entirely through the UI.**

## Step Results

### ✅ TC-08-006 — Cannot start a new report until the outstanding one is submitted (#101738) — PASSED
With `ANN2363` sitting at *Annual Reporting Initiated*, the Annual Reports page shows **neither `Initiate Report` nor
`Request Extension`**, and displays *"No annual report can be initiated at this time. A report may already be in
progress, or there may be no outstanding report due."* Before initiation both buttons were present and the message was
absent, so the guard is real and it toggles on the right condition.
📌 **Message gap:** the case prescribes *"Blocked with message to submit outstanding first."* The live message
**conflates two unrelated states** — "one is in progress" and "nothing is due" — so a user who has an overdue report
cannot tell it apart from a user with nothing to do, and is not told to go and submit it. Passing on behaviour, not on
wording.

### 🔴 TC-08-008 + TC-08-021 — Audit details required above the threshold (#101740, #101753) — FAILED
The build has **no `Audited` Yes/No control anywhere in the wizard** — confirmed by inventorying all 8 steps. Its
analogue is `Is Above Threshhold` on Financial Report, which on selecting **`R500 000+`** reveals exactly the fields the
cases are about: **Accounting officer name · Practice number · Account Officer Report**.

Run against that analogue, with `R500 000+` selected and a committed funding row of **R750 000**:
- all three fields left **completely empty**
- **`Next` is ENABLED** and the wizard proceeds
- **none of the three carries a `*`**, and no validation error appears

🔴 So an NPO declaring **three-quarters of a million rand** in funding can file its annual report with **no accounting
officer named, no practice number and no accounting-officer report attached**. Under the case's expectation
(*"Validation errors on auditing-firm fields"*) this fails. Evidence:
`evidence/a7-above-threshold-accounting-officer-not-required.png`.
▶ **This needs a rule from Thabiso before it is filed as a defect against the build**: the ADO cases describe an
*Audited Yes/No + auditing firm* design that does not exist here, so either the cases need rewriting against the
threshold design, or the threshold design is missing the enforcement. **The finding is the same either way** — above the
threshold, nothing is collected and nothing is required.
📌 Counted once as a single failure below, though it satisfies neither case.

### 🔴 Funder name is silently dropped from the committed funding row — NEW
Captured **Source Of Funding = Private · Name Of Funder = "QA Trust Foundation" · Funded Amount = 750000**, then
committed the row with the `plus-circle` control. The committed row lists **`Private | (blank) | 750000`** — the funder
name is **gone**, with no error and no indication anything was lost. Visible in the same screenshot above.
🔴 The whole point of the table is *who* funded the organisation. Filed as a bug.

### ✅ TC-08-010 — Employee counts must be non-negative integers (#101742) — PASSED
- `-5` → **"Number of females must be minimum 0"**, form item goes to `has-error`. ✅
  (`evidence/a1-employees-negative-min0-error.png`)
- `abc` → typed characters are *displayed* while typing but **discarded on blur**, reverting to the last committed
  value, and the error persists. The non-numeric value is not accepted. ✅
📌 Two caveats worth passing on: the message shown for `abc` is the **stale minimum-0 text**, not a "must be numeric"
message; and `aria-invalid` is **not set** on the input, so the error is visual only — the same accessibility gap that
failed TC-14W-001.

### 🔴 TC-08-023 — Non-negative integers per demographic field (#101755) — FAILED
- Valid values across all 20 counters → accepted. ✅
- `-1` → rejected (as TC-08-010). ✅
- **`3.5` → ACCEPTED with no error whatsoever.** 🔴 The case prescribes *"Error - must be integer"*. The field stores
  **three and a half people**. (`evidence/a2-employees-fractional-3point5-accepted.png`)
- **There is no auto-computed total** anywhere on the step, so the case's *"total auto-computed"* expectation is
  unmet — the 20 counters stand alone and nothing cross-checks them.
📌 The two demographic blocks are **"Number of Management/Executive Staff"** and **"Number of staff
Operations(Administration, Programme Staff, Support Staff)"**, with **identical field labels** in both and only a casing
difference (`Number of Indians` vs `Number Of Indians`). Nothing prevents a user filling the wrong block.
📌 Label spelling: **"Coloreds"** (US spelling) is used for a South African statutory demographic field.

### ✅ TC-08-015 — Funding totals must be numeric and non-negative (#101747) — PASSED
`-100` in **Funded Amount** → **"fundedAmount must be minimum 0"**. Non-numeric input behaves as on the employee
fields (discarded on blur).
🔴 **The message leaks the raw field name.** It reads `fundedAmount`, the camelCase code identifier, not the label
"Funded Amount" — and the employee fields on the previous step get this right ("Number of females must be minimum 0"),
so it is a per-field configuration miss, not a platform default.
(`evidence/a6-funded-amount-negative-raw-field-name.png`)

### ⚠️ TC-08-022 — Decimals supported, currency boundaries (#101754) — PARTIAL
- `1234.56` → **accepted, 2 decimals preserved**, no error. ✅
- `-100` → rejected. ✅
- `999999999999` → rejected with **"fundedAmount must be maximum 499999"**. The case allows *"either accepted or capped
  per business rule"*, and a bounded rejection satisfies that. ✅
- 🔴 **But the bound does not match its own label.** The band is labelled **`R0 - R499 000`** while the enforced maximum
  is **R499 999**, and **`499500` is accepted inside it with no error.**
  ▶ Most likely **the label is what is wrong**: the FDS threshold is R500 000, so a ceiling of R499 999 is the correct
  enforcement and the band should read *"R0 - R499 999"* or *"Below R500 000"*. Worth confirming, because if the label
  is right then the validation is wrong — and either way an NPO reading the screen is told the wrong boundary.
  Marked partial rather than failed because the numeric behaviour the case asks about is correct.

### 🔴 TC-08-016 — Funding over R500 000 triggers the QA path (#101748) — FAILED
Thabiso's drift note says *"R500 000 threshold NOT enforced (zero grep hits). Expect to FAIL."* **It fails, and the
reason is broader than the note suggests.**
`ANN2119` was submitted this morning with **`Is Above Threshhold = Yes`**, and **no QA/assessment task exists for it** —
the workflow inbox returns nothing for that ref. There is no queue for an above-threshold report to be flagged *into*.
📌 Verdicted on the already-submitted above-threshold report rather than by re-submitting `ANN2363`, since the
observation needed is the absence of a downstream task and that is already established. Stated so the basis is clear.
⚠️ `ANN2363` shows **`Is Above Threshhold = No`** in the list despite `R500 000+` being selected on screen — but I left
that step via the change-request link **without pressing `Next`**, so the step was almost certainly never saved. **Not
claimed as a persistence defect.** See the data-loss note below.

### ✅ TC-08-018 — Submit disabled if any step is incomplete (#101750) — PASSED
There is no way to reach Submit early: `Next` is disabled per step until that step validates, and **clicking step 8 in
the stepper does nothing** — the stepper is display-only (the same behaviour that made smoke TC-05-028 not executable).
📌 The case's second half — *"navigates back to the first incomplete step"* — **cannot occur and is not implemented**,
because the user can never get past an incomplete step to need it. Passing on the protection, not on the recovery.

### 🔴 TC-08-012 — 'Changes apply' opens a Change Request pop-up (#101744) — FAILED
The prescribed trigger does not exist: the Office Bearers step is a **read-only grid with zero selectors** (no
"There are changes to OBs" option). What exists instead is a **"Submit a Change Request instead?"** link, persistent on
every step.

Clicking it **does not open a pop-up**. It navigates straight out of the annual report and **immediately creates a new
Post Registration workflow draft** — `initiate-change-request`, DRAFT, 4 steps (*Post Registration Guideline · Post
Registration Details · Update · Declaration*).
- ✅ The **destination is right** — it does link to the Post Registration workflow, as the case intends.
- 🔴 There is **no pop-up and no confirmation**, so a single mis-click both abandons the report context and **creates a
  real change-request record**.
- 🔴 **Unsaved work on the current step is discarded silently** — this is how the `R500 000+` selection above was lost.

### ⚠️ TC-08-013 — Control Structure required only for international orgs (#101745) — PARTIAL
**The annual report wizard has no Control Structure step at all** — 8 steps, none of them control structure, for our
domestic NPO. The case's first assertion (*"for a non-international org the step is skipped or shown empty"*) is
therefore satisfied.
⛔ The second assertion — capturing structure type, sub-committees, affiliates, services and countries for an
international org — **cannot be tested**: `333-019-NPO` is domestic, and the step may simply not exist in this wizard.
▶ Needs an **international NPO with a report due** to settle. Note the registration wizard *does* have a conditional
Control Structure step, and it has its own defect (lost on draft resume), so the two wizards handle this differently.

## Not executed, and why

| TC | Reason |
|---|---|
| TC-08-001, TC-08-002 | require rolling the system clock to fire the reminder timers |
| TC-08-003, TC-08-004 | depend on 001/002 having fired (notice letter, then 30-day cancellation) |
| TC-08-005 | `Request Extension` **exists** and is visible in the due-but-not-initiated state, but the case's precondition (a notice letter received) is not reachable, and initiating the report removed the button |
| TC-08-019, TC-08-020 | direct API `POST`s — **excluded by the standing UI-only constraint**, not blocked by the build |

⚠️ **Four of these (001–004) may never be verifiable on QA.** Worth asking Thabiso whether the
`NineMonthsAfterFYE` / `ThirtyDaysAfterIncomplete` timers can be triggered on demand — otherwise a whole
reminder-and-cancellation chain that the FDS specifies goes untested indefinitely.

## Observations and questions for the test lead

1. **What is meant to create a newly registered NPO's first reporting period?** Still unanswered from this morning, and
   now stronger: the generator job creates nothing, and the admin `Add` form is an empty modal. On this build no NPO
   would ever be asked for an annual report.
2. **Above the R500 000 threshold, should the accounting officer details be mandatory?** The fields exist but are
   optional and unenforced. This is the single most consequential thing found today.
3. **Is `R0 - R499 000` or `R499 999` the intended band ceiling?** One of the label and the validation is wrong.
4. **Should an above-threshold annual report create an assessor task?** Today none is created for any annual report,
   which leaves TC-08-016 and smoke TC-09-003 both unverifiable against the intended design.
5. **Should the ADO cases be rewritten against the threshold design?** TC-08-008 and TC-08-021 describe an
   *Audited Yes/No + auditing firm* screen that this build does not have.
6. **Should `qa.tester0812@example.org` work on the public portal?** It is refused with an internal guard message.
7. Fractional people (`3.5`) are accepted in demographic counts, and no total is computed to catch it.

## Incidental notes

- The wizard header reads **"Created by: Mpendulo ntshangase 2 hours ago"** on a draft created seconds earlier — a
  timestamp or timezone offset issue.
- The red banner *"The total funded amount should be between the specified threshhold!"* stays on screen even when the
  amount is inside the selected band and `Next` is enabled — it is not a live validity indicator.
- Typos carried by this form: **"Threshhold"** (twice), **"Account Officer Report"** (should be *Accounting*),
  **"Vacational"**, **"Continuiing"** on the Admin and Operations sector list.
- Step 2 Organisation Details renders **Full Address / Province / District / Metro / Area Code twice**, with identical
  labels and no group heading to distinguish the two blocks.
- SA ID `8001015009087` renders **unmasked** on the Office Bearers step (admin masks it) — carries the existing 14Y
  POPIA observation into this wizard.
- 🔑 **Method note:** I concluded from the DOM that step 5 blocked `Next` with no feedback, and the screenshot showed a
  plain hint banner — *"Please ensure to add your Achievements for the financial year in order to continue"* — plus an
  Achievements list I had not seen. **The step communicates its requirement properly; my inventory missed a
  non-form-item widget.** Screenshot before calling anything a silent block.

## Bugs filed

- `test-reports/bugs/2026-08-17-above-threshold-annual-report-requires-no-accounting-officer.md`
- `test-reports/bugs/2026-08-17-funding-row-drops-funder-name-on-commit.md`
- `test-reports/bugs/2026-08-17-annual-compliance-admin-add-opens-empty-modal.md`
