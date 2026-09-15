# Report: NPO-REG — TC-10 Link to an Existing NPO

**Date:** 2026-08-12
**Plan:** test-plans/npo-registration/register-new-npo.md
**Cases:** TC-10
**Execution Mode:** ai-driven (Playwright via Node)
**Result:** BLOCKED — the submit control never enables for any NPO number format, with no validation message; and no valid NPO number could be sourced because the admin NPO register does not render
**Duration:** not instrumented

## Summary
| Total Assertions | Passed | Failed | Skipped |
|---|---|---|---|
| 4 | 2 | 2 | 0 |

Run on the developer's account (`mpenduloizwelinuk@gmail.com`). **No link was completed** — deliberately, because a
successful link destroys the *"account not linked to any NPOs"* precondition that TC-01 → TC-09 depend on.

## How the flow actually works
Not a separate page. **Link to an Existing NPO** is inline on `/dynamic/boxfusion.dsdnpo/no-existing-npo-landing-page`,
and the control is used **twice**:

| Stage | State |
|---|---|
| On arrival | **no** `NPO Number` input exists; button **enabled** |
| After the first click | **one** `NPO Number` input appears (placeholder `NPO Number`); the same button flips to **disabled** and becomes the submit control |
| After entering a number | button **stays disabled** |

## Step Results

### TC-10 — Link to an Existing NPO
**Mode:** ai-driven · **Result:** BLOCKED

- [PASS] The account still reports *"You are currently not linked to any NPOs. Please link your existing NPO number or register a new one."* — the precondition for the registration cases is intact
- [PASS] The Link control reveals an `NPO Number` field on first click
- [FAIL] (BLOCKING) The submit control **never enables**. Three formats were entered, each verified as present in the field via read-back:

  | Entered | Field value confirmed | Button |
  |---|---|---|
  | `999-999-NPO` | ✅ | 🔴 disabled |
  | `123456789` | ✅ | 🔴 disabled |
  | `999-999` | ✅ | 🔴 disabled |

  **No validation message was rendered in any case** — no field error, no toast, no alert.
- [FAIL] ~~A valid NPO number could not be sourced~~ — **retracted, see below.** The admin register holds 361,068 NPOs; the failure was a selector fault on my side, not an application one.

**Consequence:** the negative case in the plan (*"an unknown number is rejected and does not link"*) **could not be
executed**. Nothing was ever submitted, so rejection behaviour remains untested. The positive case is equally
untestable without a real NPO number.

## ⚠️ RETRACTED: "no valid NPO number could be obtained"
An earlier version of this report stated that admin → **All NPOs** rendered zero columns and zero rows, and
concluded that no NPO number could be sourced. **That was wrong, and the cause was my own selector.**

The admin grids are a **custom Shesha React table** — `sha-react-table` / `sha-table` / `sha-index-table-full`, using
`[role=table]` and `[role=row]` — **not** an AntD `.ant-table`. Every check for `.ant-table-thead .ant-table-cell`
therefore returned zero on perfectly healthy pages.

**What the NPO register actually contains:** `/dynamic/boxfusion.dsdnpo/npos` → *"1-10 of **361068** items"*, with
columns NPO Number · Application Ref Number · Status · Application Status · Name · Telephone · Cellphone · Email
Address · Legal Form · Enterprise Number · Financial Year End Date · Registered · No. Of Office Bearers · Primary
Contact · Physical Address.

The admin `workflows-inbox` is equally populated — *"1-10 of **2470** items"* (Ref No · Initiator · Type · Name ·
Action Required · Received Date · Period In Possession · Target Date · Status), e.g.
`DER1519/12/08/2026 · Welcome Galane · Voluntary Deregistration · Review (DSD)`, referencing NPO **`333-010-NPO`**.

**So the NPO number format is `NNN-NNN-NPO`** — the shape tried here (`999-999-NPO`) was correct; that particular
number simply does not exist among the 361,068 records.

## Interpretation — revised
With the register confirmed populated, the likeliest reading is that **the submit control is gated on live async
validation against a real NPO record**, and it stayed disabled because none of the three identifiers tried exists.
That would make the behaviour *correct but undiscoverable*, since nothing tells the user the number was not found.

**This is now testable and should be re-run**, using a real NPO number read from the admin register:
- **Positive:** a genuine NPO number should enable the control and link the account.
- **Negative:** a well-formed but non-existent number should be rejected **with a message** — the absence of any
  feedback is the part worth reporting either way.

⚠️ A successful link will destroy the *"account not linked to any NPOs"* precondition for TC-01 → TC-09 on this
account, so the positive case needs either a second applicant account or acceptance that the registration cases
move to a fresh user.

## Observations for Thabiso
1. **A third instance of the same anti-pattern today: a control disabled with no explanation.** The POPIA gate, the
   Organisation Details step, and now the Link submit all refuse to proceed and tell the user nothing. Consistent
   across the module, so likely a platform form pattern rather than three separate bugs — worth one decision about
   whether disabled-with-no-message is acceptable.
2. **What is the expected `NPO Number` format?** Three plausible shapes were rejected without feedback. A format
   hint on the field would remove the guesswork.
3. **Is a valid NPO number alone sufficient to link an account to an NPO?** If so, anyone knowing a published NPO
   number could attach themselves to that organisation. Worth confirming there is a second factor.
4. **Can we have a known-good NPO number** for QA, plus a working admin NPO list? Without one, TC-10 cannot be
   completed either way.

## Coverage status
| Case | Status |
|---|---|
| TC-01 POPIA gate | ✅ PASSED |
| TC-02 Wizard structure | ✅ PASSED |
| TC-03 Mandatory marking | ✅ PASSED (format validation **untested**) |
| TC-04 Organisation Details happy path | 🔴 BLOCKED — address autocomplete |
| TC-05 → TC-09 | ⬜ Unreachable behind TC-04 |
| TC-10 Link to an Existing NPO | 🔴 BLOCKED — submit never enables |

**Both public-portal entry points are now dead ends.** No further registration coverage is achievable until either
the address lookup is fixed or a valid NPO number is supplied.
