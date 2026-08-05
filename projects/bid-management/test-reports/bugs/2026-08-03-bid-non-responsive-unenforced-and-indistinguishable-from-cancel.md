# BUG: "Bid is non-responsive" commits with NO reason, bypasses the mandatory BEC Report, and lands on a status that belongs to a different decision

> **Filename note:** this file is named `…indistinguishable-from-cancel.md` from its original framing. **TC-33
> corrected that on 2026-08-03:** Cancel Tender produces `DECLINED`, not `CANCELLED`, so the two are *not*
> indistinguishable — the statuses are **crossed**. See Finding 1. The filename is kept so existing links hold.

| Field | Value |
|---|---|
| **Logged** | 2026-08-03 |
| **Project** | PD Bid Management (`projects/bid-management`) |
| **App / Env** | Supply Chain Management Admin Portal — **QA** (`https://pd-supplychainmanagement-adminportal-qa.shesha.app`) |
| **Severity** | **Medium** — Finding 1 **withdrawn** (the spec asks for `CANCELLED`); the live issue is **Finding 2**, a direct violation of ADO #60835 step 24: it commits with an **empty** reason where the spec requires Submit inactive until one is captured |
| **Stage / Form** | BEC: Finalise recommendation — `tender-wf-finaliserecommendation-details` · dialog `tender-reason for disapproval v8` ("Reason for Non-responsiveness") |
| **Role** | BEC Secretariat — **ThabisoM / 123qwe**, view mode **Latest** |
| **Tender** | **REF2026-0872** (80/20, purpose-built with `FUNC_SCORE_MODE=below` so no bid qualifies) |
| **Found by** | Negative-path testing, plan TC-26 — the first time this decision has been **committed** rather than inspected |
| **Reproducibility** | 1/1 (single committed run; the decision terminates the tender so each test consumes one) |

## Context — why this test finally happened

TC-26 previously recorded this decision as **"DEAD — permanent spinner, metadata 404"**. That was
[retracted on 2026-08-03](2026-07-30-disapprove-hangs-metadata-404.md): the dialog opens fine, and the earlier
hang was a transient whose cause was never identified. But the retraction was based on *inspecting* the dialog
without committing — so **whether the decision actually works had still never been tested.** This is that test.

**The headline is good news:** with every bidder below the functionality minimum, "Bid is non-responsive"
**does terminate the tender.** `POST Tender/CaptureCancellationOutcome` → 200, `POST Process/UserTaskComplete`
→ 200, item leaves the inbox. The procedurally correct outcome for a no-qualifying-bid tender is available and
functional. Three things about *how* are wrong.

## Setup

REF2026-0872 built TC-01 → TC-11 with all four evaluators scoring every supplier below the minimum of 60:

| Supplier | Scores (Thabitha / Nathi / Nelly / Maand-awe) | Average | Above Minimum |
|---|---|---|---|
| A & A Stationers | 48 / 50 / 52 / 51 | **50.25** | **No** |
| Telkom | 46 / 45 / 44 / 43 | **44.5** | **No** |
| BOXFUSION | 36 / 40 / 38 / 37 | **37.75** | **No** |

At the stage, as previously documented and re-confirmed: **Final Evaluation table = "No Data"**, **Recommended
Supplier = blank**. Both correct.

---

## ⚪ Finding 1 — WITHDRAWN: `CANCELLED` is exactly what the spec asks for

> **This finding claimed the outcome was a defect because non-responsiveness is "indistinguishable from Cancel
> Tender — both read `CANCELLED`". It is withdrawn. I checked the test case, and the spec asks for precisely
> this behaviour.**

**ADO #60835** (*BEC: Finalise Recommendation*) **step 16** — the very step this decision implements:

> "Click the **Submit** button on the Reason for Non-Responsive dialog → The system should end the workflow and
> **mark the item as cancelled**"

**ADO #60836** (*Capture Outcome of the BAC*) says the same for both its non-responsive (step 29) and its Cancel
Tender (step 33) decisions. **The spec deliberately routes all of them to "cancelled" and never asks for
separate terminal states.** So `CANCELLED` here is correct behaviour, and my audit-trail objection was arguing
against the documented design on the strength of my own procurement intuition.

**Not raised as an issue.** Whether these outcomes *ought* to be separately identifiable is not documented as a
requirement anywhere, and the test cases explicitly ask for the opposite. Closed, not escalated.

**What IS a real defect, found by driving Cancel Tender (TC-33, REF2026-2395):**

| Decision | Status observed | Spec | Verdict |
|---|---|---|---|
| Bid is non-responsive (BEC) | `CANCELLED` | #60835 step 16 → cancelled | ✅ correct |
| **Cancel Tender** (BAC) | **`DECLINED`** | #60836 step 33 → cancelled | 🔴 **violates the spec** |
| Disapprove (Review and Approve) | `DECLINED` | no ADO case | — |

So the decision named *Cancel Tender* is the only one that fails to reach a cancelled state. Both call the same
endpoint (`CaptureCancellationOutcome`) yet land on different statuses. **That** is the bug — see
`test-reports/2026-08-03/bid-supply-chain-management--tc-33-bac-cancel-tender.md`.

**Expected:** a distinct terminal status (e.g. `Non-Responsive`), or at minimum a recorded, readable
cancellation reason category that distinguishes the two paths.

## 🔴 Finding 2 — the reason is NOT enforced; it committed completely empty

The dialog says *"Please type in the reason for declining this tender on the input provided below:"* and warns
the request will be terminated. **The reason was left entirely empty and Submit committed anyway.**

This is **inconsistent with the Disapprove dialog, which uses the same form** (`tender-reason for
disapproval v8`): there, Submit is **not rendered at all** while the field is empty, and appears only once text
is entered. Verified both ways on 2026-08-03. Same form, two invocation contexts, opposite enforcement.

So a tender can be terminated as non-responsive with **no recorded justification whatsoever**.

### ✅✅ CONFIRMED MANUALLY by the test lead — 2026-08-03, REF2026-1128

**The strongest evidence in this bug.** The test lead opened REF2026-1128 at *BEC: Finalise recommendation*,
clicked *Bid is non-responsive*, and **submitted with the reason box empty**. The app accepted it and
**terminated the tender**: REF2026-1128 now reads **`CANCELLED`**, with **no reason recorded anywhere** on the
tender view.

Verbatim expectation — **ADO #60835 step 24**:

> "Under the Reason for Non-Responsiveness dialog → **The submit button should be inactive until the reason has
> been captured**"

The same sentence appears in **#60836 steps 27 and 31**. It is unambiguous, and the app does not do it.

**#60835 step 16 is satisfied** — *"end the workflow and mark the item as cancelled"*: it ended and it reads
`CANCELLED`. **The defect is solely the unenforced reason**, and the consequence is a tender terminated with no
justification on record.

**Confirmed on 2 of 2 tenders, both terminated with an empty reason:** REF2026-0872 (automated, 2026-08-03) and
REF2026-1128 (manual, test lead). Plus the enabled-Submit precondition observed directly on both.

> ⚠️ **A retracted mis-reading, for the record.** I initially reported that the empty-reason submit *"did not
> terminate the tender"*, based on REF2026-0901 still sitting in the inbox at `EVALUATION IN PROGRESS`. **0901 was
> never submitted** — it was the fresh chain I had built and handed over, and the test lead used 1128 instead. I
> read an untouched tender as a failed submit. **Confirm which record an observation belongs to before drawing a
> conclusion from it.**

### ✅ Re-verified 2026-08-03 on a second tender, non-destructively

Because several findings were withdrawn that day, this one was deliberately re-checked on a **different** tender
before being reported. On **REF2026-1128** (at *BEC: Finalise recommendation*), clicking *Bid is non-responsive*
opens the dialog titled **"Reason for Non-responsiveness"** (`tender-reason for disapproval v8`) with:

- `textarea.value` = `""` — empty
- **Submit rendered at 76 × 32 and `disabled: false`**

That alone is the violation: #60835 step 24 requires the button to be **inactive** until a reason is captured, and
it is active. **No submission was made** — the dialog was closed and REF2026-1128 left untouched at its stage, so
the fixture survives for TC-34.

**Confidence:** the unenforced-Submit precondition is confirmed on **2 of 2** tenders (REF2026-0872, REF2026-1128);
the empty *commit* was observed once, on REF2026-0872, which is now terminal.

> ✅ **This finding is now backed by the test case — it is the strongest item in this bug.** **ADO #60835
> step 24** states: *"Under the Reason for Non-Responsiveness dialog → **The submit button should be inactive
> until the reason has been captured**."* #60836 says the same at steps 27 and 31.
>
> The app not only fails to disable Submit — **it commits with the field empty**, which is a direct violation of
> a documented expectation, not a matter of interpretation. Given Finding 1 is withdrawn, **this is the finding
> to lead with.**

**Expected (per #60835 step 24):** Submit inactive until a reason is captured — and never committable while empty.
Note the wider deviation: even where the reason *is* enforced (Disapprove, Cancel Tender), the app **hides**
Submit rather than disabling it, which is also not what the spec describes.

## 🔴 Finding 3 — the mandatory BEC Report is bypassed by the dialog

On the page, **BEC Report is marked mandatory (`*`)** and the page's **Submit Recommendation stayed disabled**
throughout, because the BEC Report was never filled.

The **dialog's own Submit committed the entire decision regardless.** The mandatory field was never filled and
never enforced — the dialog's commit path goes around the page's validation entirely.

**Expected:** either the BEC Report is genuinely required before any decision commits, or it should not be
marked mandatory at this stage. As it stands the asterisk is misleading.

---

## Additional observations from the same run

1. **Copy defect (dialog):** the non-responsiveness dialog says *"A notification will be sent to the Initiator
   with the **disapproval** message attached"* — wrong word for this decision. Same family as the known
   `recommmendation` / `Commitee` typos. Likely a consequence of reusing the disapproval form.
2. **A request to the API root that redirects into Swagger.** During the commit the app issued:
   ```
   [GET] https://pd-supplychainmanagement-api-qa.shesha.app/?id=38b6da1e…&todoid=343f40e9…&properties=id → 302
   [GET] …/swagger                                                                                       → 301
   [GET] …/swagger/index.html                                                                            → 200
   ```
   i.e. a configured action with a **blank endpoint path**, so the query string was appended to the API root and
   the redirect chain landed on the Swagger UI. Harmless in effect but clearly a misconfiguration, and it means
   some intended call never happened.
3. **Both known stale-namespace 404s still fire on this page:**
   `Boxfusion.BidManagement.Domain.Tenders.Tender` and
   `Boxfusion.BidManagement.Domain.Domain.TenderEvaluations.EvaluationPanelMember` (doubled `.Domain.`).
4. **Negative relative time in the Inbox:** the row read *"**-119 minute(s) ago**"* for a tender created
   minutes earlier — a timezone/offset display bug. Note the manual tester already has a tender named
   "Testing timezone", so this is probably known.

## Suggested fixes (for dev)

1. Give technical non-responsiveness its **own terminal status**, or persist and surface a reason category so
   `CANCELLED` can be disambiguated. **Highest value of the three.**
2. Make the reason **mandatory** on the non-responsiveness invocation, matching Disapprove's enforcement.
3. Decide whether BEC Report is mandatory at this stage and enforce it consistently across **both** the page
   Submit and the dialog Submit — the dialog currently bypasses page validation.
4. Fix the dialog copy ("disapproval" → "non-responsiveness") and the blank-URL action.

## What this closes and what it leaves open

**Closes** the long-standing TC-26 question: a no-qualifying-bid tender **can** be closed out as
non-responsive, and it terminates. The "dead end" framing is fully retired.

**Still open in TC-26 — re-scoped 2026-08-03.** The Critical claim that *a non-bidder can be recommended and
AWARDED* when no bid qualifies is **WITHDRAWN: the module test lead ruled it is by design.** What remains from
that line of testing is two narrower defects in the *Recommend another Supplier* picker — every match listed
**×10**, and an **already-evaluated** bidder returning a raw silent **500** instead of a validation message.
See `2026-07-30-non-bidder-can-be-recommended-when-no-bid-qualifies.md` (note: the earlier cross-reference in
this doc had a typo in that filename).
