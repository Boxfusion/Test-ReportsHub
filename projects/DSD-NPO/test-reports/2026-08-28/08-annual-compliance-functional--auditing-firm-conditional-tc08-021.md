# Report: NPO-08-F — Annual compliance "Auditing Firm required when Audited = Yes" (TC-08-021) — the conditional does not exist in the form

**Date:** 2026-08-28 11:45 UTC
**Plan:** test-plans/annual-compliance/08-annual-report-submission-functional.md
**Execution Mode:** ai-mcp
**Result:** FAILED — the second "genuinely runnable" residual case is now actioned. The ADO case expects an **"Audited" Yes/No** control whose "Yes" makes **Auditing Firm Name / Contact** required. Driving a fresh annual-compliance submission end to end (all 8 steps) on our own registered NPO **333-022**, with total income set first to **R600 000** and then to **R5 000 000**, **no "Audited" toggle, no "Auditing Firm" field, and no "Accounting Officer" section appears anywhere in the form** — the only audit-related label is an *"Auditors fees"* expense line. The conditional the case tests is not implemented in the built submission wizard, so the required-when-audited rule cannot fire.
**Duration:** ~3000s
**Cases:** TC-08-021 (#101753)
**Environment:** QA · public portal · annual-compliance submission **ANN2500** on NPO **333-022** (`1b217af3-…`)
**Accounts used:** shared dev account

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 1 | 0 | 1 | 0 | 0 |

Coverage: **221 → 222**. Both residual "runnable" cases (this and TC-05-021) are now closed.

---

### 🔴 TC-08-021 — Auditing Firm fields required when 'Audited = Yes' (#101753) — FAILED

**ADO steps / expected:** *Audited = Yes*, leave Auditing Firm Name blank, Next → **required error** on Auditing
Firm Name; leave Auditing Firm Contact blank → required error; *Audited = No*, blank → accepted (fields hidden/not
required).

**What the build actually has.** The annual-compliance submission is an 8-step wizard: Guideline · Organisation
Details · Office Bearers · Admin & Operations · Achievements & Employees · Financial Report · Financial Statement ·
Declaration. Every step was completed and inspected:

- **No "Audited" control exists** on any step — a full-text search for *"Audited"* across the rendered form returns
  nothing; the string *"Auditing Firm"* and *"Accounting Officer"* likewise appear **nowhere**.
- The only audit-related field is **"Auditors fees"**, an expense line on the Financial Statement — not a
  Yes/No audit declaration and not tied to any Auditing-Firm requirement.
- **Revenue threshold ruled out.** The FDS ties audit/accounting-officer requirements to income thresholds
  (accounting-officer fields noted around R500 000). I set **Service Income = R600 000** (total income above the
  threshold) and re-checked — nothing appeared — then raised it to **R5 000 000** and re-checked the whole
  Financial Statement step again — still no Audited / Auditing-Firm / Accounting-Officer control. So the absence is
  not a threshold that simply wasn't met.

- **[FAIL] The required-when-audited enforcement cannot exist because the control it depends on is absent.** The
  case (tagged `Src:Both` — specified in both FDS and code) prescribes a conditional that the built form does not
  implement. This corroborates the standing observation that the annual form's accounting-officer / audit fields are
  *"optional and unenforced"* — here they are not merely unenforced but **not present at all** in the submission
  wizard.

**Verdict rationale.** Marked **FAILED** rather than not-executable: the case describes enforcement the FDS requires,
and the build omits it entirely — that is a defect in the form, not a case that fails to match an intentional
build choice. A reviewer can confirm in one pass by opening any annual submission and searching the Financial
Statement step for an "Audited" declaration.

---

## Precondition built (synthetic, our own registered NPO)
The editable annual form is only reachable by **initiating a report on a registered NPO that has none in progress**.
333-019 (our other registered NPO) was occupied, so **333-022 ("QA Unfinished NPO", registered)** was used — it had
no annual report, and *Initiate Report* opened the editable wizard (**ANN2500/28/08/2026**). Reaching the Financial
Statement step required completing the intermediate gates: an **Achievements** entry (the true gate on the
Achievements & Employees step — not the 27 demographic fields, which were a red herring), the demographic counts,
the funding answer, and three Financial-Report document uploads. All data is synthetic; **the report was left as an
unsubmitted draft** (never submitted).

## Method notes
- The absence was confirmed by full-text search of the rendered form on every step, at two income levels
  (R600 000 and R5 000 000), not by eyeballing one screen.
- The "Achievements list must have an entry" gate initially read as a silent-disabled-Next; the on-screen hint
  *"Please ensure to add your Achievements … in order to continue"* was the actual cause.
- Programmatic value-setting does not satisfy this form's validator (DOM populated, Next stays disabled) — every
  field was filled with real keystrokes.

## ❓ Question for Thabiso
The annual-compliance submission has **no "Audited" declaration and no "Auditing Firm" fields at all** (only an
"Auditors fees" expense line), at any income level. Was the audit/accounting-officer section (#101753, `Src:Both`)
descoped from the portal submission, or is it expected to appear above a revenue threshold? As built the
required-when-audited rule cannot be exercised.
