# Consistency pass: plan vs ADO test cases (suite #57473)

**Date:** 2026-08-03
**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Source:** ADO plan **#57472** / suite **#57473**, all cases' `Microsoft.VSTS.TCM.Steps` read via the Azure
DevOps MCP
**Scope:** every case in the suite (**18**) checked against every TC in the plan (**35** after this pass)
**Trigger:** the test lead's by-design ruling on the non-bidder award, then the question *"can we really say it's
a bug — what are the test cases saying?"*. Both exposed that findings were being classified without reading the
cases.

## Summary

| Outcome | Count |
|---|---|
| 🔴 Coverage gap — ADO case with **no TC** | **1** (+1 deliberately folded in) |
| 🔴 Documented expectations **never asserted** | **6** |
| ⚪ My findings **withdrawn** | **5** |
| ✅ Open questions **closed** by the spec | **2** |
| 🔴 App-vs-spec deviation **newly found** | **1** |
| Naming/typo mismatches for the copy review | **7** |

## 🔴 1. Coverage gap — a whole ADO case had no TC

**ADO #60824 "BEC Member: Calibrate Scores and Finalise Scoring"** → now **TC-35**.

The suite has 18 cases; the plan covered 16. The other missing one, **#57474 "LogIn to the system"**, is
deliberately folded into every TC's step 1 and needs no TC of its own.

**Why #60824 was missed:** TC-10/TC-11 cover the **Secretariat's** calibration tasks, so calibration looked done.
But **#60815** says Begin Calibration *"should send items to **both** BEC Secretariate to monitor calibration of
scores **and BEC Members to calibrate scores**"* — a **parallel branch never driven**. Every run to date has
passed *through* calibration without any member adjusting a score.

It is reached differently too: **BID Management → Evaluate Tenders → double-click**, not the Inbox. The case
documents **Edit My Score** → edit icon → Points Awarded + Comments become editable → Finalise Scoring.

> This also revises an answer I gave earlier today. Asked whether Calibrate Scores was done, I said the happy
> path was covered and only negatives were outstanding. **The BEC Member calibration branch is not covered at
> all** — and it is the half where scores actually change.

## 🔴 2. Documented expectations never asserted

| Case | Expected result (verbatim) | Where it now lives |
|---|---|---|
| #60813 step 16 | *"Create failed, Please add the attendees before you click add button"* | TC-07 |
| #60813 step 30 | *"Attendee/Evaluator already exist"* | TC-07 |
| #60813 step 24 | *"Are you sure, you want to delete this item"* | TC-07 |
| #60821 | *"Score must be maximum of 'Max Points'"*; Finalise Scoring hidden until all criteria scored | TC-29 |
| #60812 | Specific Goal Points *"equal or less than **10** … 90/10 … or **20** … 80/20"* | TC-06 |
| #57475 | Step-1c response-document row edit/save/cancel/delete/add; Next inactive with no response documents | TC-27 |

## ⚪ 3. Findings withdrawn — the spec contradicts them

1. **"Non-responsiveness is indistinguishable from a cancellation."** #60835 step 16 and #60836 steps 29/33 all
   say *"mark the item as cancelled"* — **the spec wants them identical.** Closed, not escalated.
2. **"The dialog's *disapproval message* wording is a copy defect."** #60836 step 33 uses that exact phrase.
3. **"The total-must-be-100 rule is undocumented."** #57475: *"should not allow user to proceed … without adding
   at least one evaluation criteria **that amount to 100 points**."* The rule is correct; only its invisible
   enforcement is a defect.
4. **"Next disabled with no message is a defect."** #57475: *"If a certain mandatory field is missed the next
   button will remain inactive."* The mechanism is documented; only the missing asterisks are a gap.

## ✅ 4. Open questions closed by the spec

1. **"A backup evaluator blocks calibration — needs a BA ruling."** **It is by design.** #60815 says it twice:
   *"If all evaluators have not evaluated all the suppliers → The Begin Calibration button should be
   **inactive/Hidden**"* and *"A user should **not** be able to begin calibration if all evaluators have not
   evaluated all suppliers."* Even the no-reason mechanism is documented. **Carried as an open item since
   2026-07-30 — now closed.**
2. **Only-compliant responses at Capture Pricing.** #60812 requires it, and TC-21 proved it happens. Consistent.

## 🔴 5. App-vs-spec deviation newly found

**Reason dialogs hide Submit instead of disabling it.** #60836 steps 27/31 and #60835 step 24 all say *"The submit
button should be **inactive** until the reason has been captured."* The app renders no Submit at all until text is
entered. Enforced, wrong mechanism — and at the BEC stage it does not enforce at all (commits empty), which is the
outright violation.

> ⚪ **A second "deviation" listed here was withdrawn the same day.** I had reported that the **Supporting
> Document** was not enforced despite #57475 calling it mandatory. **It is enforced** — Next stays disabled until
> the attachment is added (test lead). My network log agrees: two documents were already uploaded before I observed
> Next enable, so the without-attachment case was never tested. **When a button changes state, only the last thing
> changed is evidenced.** That makes five findings withdrawn today, four of them for the same root cause:
> asserting a rule without a control.

## ⚠️ 6. Unresolved conflict for the test lead

**#60835 step 19** (and #60836 step 20): *"New Recommended Supplier should be a dropdown list of **Suppliers that
reached the Capture Functionality Score step**. N.B The Supplier that is previously recommended should not be part
of this list."*

A non-respondent never reaches that step, so the case as written does not permit one in that list — **the
opposite of the by-design ruling.** Either the case is stale and must be updated, or the original finding stands.
Flagged in the bug doc; **no further testing of that behaviour until it is settled.**

## Naming and typo mismatches (copy review)

| Where | Case says | App says |
|---|---|---|
| Draft Tender Step 1 | "Evaluation **Framework**" | "Evaluation Criteria" |
| Criteria table | "**Points Awarded**" | "Max Points" |

ADO's own text needs a pass too: **"Moniter"** (#60822 title), **"Finilise"** (#60824), **"Maz point"**,
**"Onces"**, **"Technica Evaluatio"** (#57475), plus the ungrammatical prescribed strings *"already exist"* and
*"Are you sure, you want to delete this item"*. If dev matches those literally, the awkward copy ships.

## 🔴 7. "No ADO case" labels that were wrong

Six negative TCs were labelled *"no ADO case"* when the behaviour **is** documented — which is why their findings
were being judged on intuition:

| TC | Actually documented by |
|---|---|
| TC-17, TC-18 | **shared step #57552 "Send Back"** — *"The system should validate the comment textbox and **enforce** a user to populate the comment"*, and the user selects the step to send back to |
| TC-19 | no case of its own, but #57552 governs send-back behaviour (matches the observed mandatory Step + Comments on `re-evaluation-user-task-send-back v3`) |
| TC-22 | **#60836 steps 19–23** — incl. the picker scoping rule and *"flag the newly recommended supplier as recommended"* |
| TC-26 | **#60835** — the BEC's non-responsive decision (steps 14/23/24/16) |
| TC-27 | **#57475** (see above) |
| TC-29 | **#60821** |
| TC-33 | **#60836 steps 30–33** |

**One consequence worth flagging:** TC-22's defect (b) — *"the override overwrites the BEC's own Recommended
Supplier field"* — may be precisely what #60836 step 23 asks for (*"flag the newly recommended supplier as
recommended"*). **Withdrawn — not raised as an issue.** Defect (a), the silent no-advance, **does** violate
step 23 and stands.

Genuinely undocumented (and correctly labelled): TC-20, TC-21 (partly — #57553 covers the compliance path),
TC-23, TC-24, TC-25, TC-28, TC-30, TC-31, TC-32, TC-34.

## Net effect on the plan

- **TC-35 added** (ADO #60824).
- **TC-27** re-headed to cite #57475; six assertions re-based on the case; Defect 6 added.
- **TC-33** re-headed to cite #60836 steps 30–33; two claims withdrawn; one violation confirmed.
- **TC-29** now carries the prescribed score message and the Finalise-Scoring gating; calibration override moved
  to TC-35.
- **TC-06** now carries the Specific-Goal bound and the compliant-only rule.
- **TC-07** now carries the three prescribed messages.
- **TC-19**'s backup-evaluator finding **closed as by design**.
- **TC-01** step 13 restored to "mandatory" — and confirmed **enforced**, no deviation.
