# Report: BID-SCM — TC-33 BAC Cancel Tender (NEGATIVE, terminal)

**Date:** 2026-08-03
**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Cases:** TC-33
**Method:** driven live via Playwright MCP
**Environment:** QA — `https://pd-supplychainmanagement-adminportal-qa.shesha.app`
**Login:** MoshadiM / 123qwe (BAC adjudicator) · view mode **Latest**
**Forms:** `tender-wf-captureoutcomeofthebac-finalrecommendation v27` → dialog `tender-reason for disapproval v8`
**Tender:** **REF2026-2395** — CONSUMED, now terminal
**ADO:** **#60836** *Capture Outcome of the BAC*, steps **30–33** (the plan wrongly said "no ADO case")
**Result:** PARTIAL — ✅ the decision works · 🔴 **2 defects, both against ADO #60836** · ⚪ **2 of my earlier
claims withdrawn as contrary to the spec**

## Fixture change — REF2026-1122 was gone

The plan named **REF2026-1122** as the fixture. It is **no longer in MoshadiM's inbox** (10 items, all at
*Capture outcome from the BAC*, none of them 1122) — it has been actioned by someone since 2026-07-30. Its
current state was not verified.

Substituted **REF2026-2395** — *"TC-02 Automated Draft Tender run-mq0wplls - 90/10 Compulsory Hybrid"*, created
by Maand-awe, abandoned mid-chain since 10/06/2026, sitting at the right stage. Ours, stale, safe to consume.
Identity was confirmed on the page header (`Ref No: REF2026-2395`) **before** any action — the inbox uses a
div-based table, so the magnifier links had to be mapped positionally (10 links ↔ 10 rows), which is exactly the
kind of assumption worth verifying before an irreversible click.

## What Cancel Tender does

| Step | Result |
|---|---|
| Dialog | Opens `tender-reason for disapproval v8` — **the same form Disapprove and Bid-is-non-responsive use** |
| Reason mandatory? | ✅ **Yes** — no Submit button is rendered at all while the textarea is empty; it appears once text is entered |
| Commit | `POST /api/services/SupplyChainManagement/Tender/CaptureCancellationOutcome` → **200**, then `POST …/Process/UserTaskComplete` → **200** |
| Outcome | ✅ **Terminal.** Leaves the inbox, redirects to My Items, no onward task |
| Terminal status | 🔴 **`DECLINED`** |

## ✅ The documented expectation — ADO #60836 steps 30–33

**This TC is NOT "no ADO case" as the plan originally said.** ADO **#60836** (*Capture Outcome of the BAC*)
specifies Cancel Tender in four steps:

| ADO step | Expected result (verbatim) |
|---|---|
| 30 | "The system should display a **Cancel Tender dialog**" |
| 31 | "The submit button should be **inactive** until the reason has been captured" |
| 32 | "Reason for terminating tender should be **displayed**" |
| 33 | "The system should end the workflow and **mark the item as cancelled** and also sent a notification to the initiator **with disapproval message**" |

Steps 26–29 specify *Bid is non-responsive* on the same page, likewise ending "**mark the item as cancelled**".
**So the spec deliberately wants both decisions to land on "cancelled"** — it does *not* ask for distinct
statuses. That single fact reclassifies three of my findings, below.

## 🔴 Defect 1 — Cancel Tender does not mark the item as cancelled (VIOLATES ADO #60836 step 33)

| Decision | Terminal status observed | Spec |
|---|---|---|
| Disapprove (Review and Approve) | `DECLINED` | no ADO case |
| **Cancel Tender** (BAC) | 🔴 **`DECLINED`** | #60836 step 33 → **"mark the item as cancelled"** ❌ |
| Bid is non-responsive (BEC) | `CANCELLED` | #60835 step 16 → "mark the item as cancelled" ✅ |

**This is a genuine failure against a documented expectation:** the decision named *Cancel Tender* is the only
one of the three that does **not** reach a cancelled state — it lands on `DECLINED`, colliding with Disapprove.
Non-responsiveness, meanwhile, does exactly what its spec says.

Both cancellation-family decisions call the **same endpoint** (`CaptureCancellationOutcome`) yet land on
different statuses, so the status is selected downstream of a shared operation — a useful pointer for dev.

> ⚠️ **What I got wrong, twice.** My first framing was "non-responsiveness is *indistinguishable* from Cancel
> Tender" (TC-26). My second was "the statuses are *crossed* and should be distinguishable" (this report's first
> draft). **Both were my own procurement intuition, and the spec contradicts them** — ADO wants both marked
> cancelled, so being indistinguishable is the *intended* design. The only defensible defect here is the narrow
> one above: Cancel Tender misses the status its own test case requires.
>
> Whether the three outcomes *ought* to be separately identifiable is **not raised as an issue** — the test cases
> ask for the opposite, and nothing documents a requirement for distinct statuses.

## 🔴 Defect 2 — reason enforcement uses the wrong mechanism (VIOLATES #60836 steps 31/27, #60835 step 24)

The spec says, in three separate places: **"The submit button should be inactive until the reason has been
captured."**

The app **does not render a Submit button at all** while the textarea is empty — it appears only once text is
entered. The rule is enforced (nothing can commit without a reason ✅) but by the wrong means: an *absent*
control instead of a *disabled* one. A user sees no Submit and has nothing telling them why.

Low severity on its own, but it is the documented behaviour and it is wrong in the same "communicates nothing"
way as the rest of this module.

## ⚪ Observation (not a defect) — the mandatory reason is unretrievable afterwards

The reason is compulsory to submit, then **appears nowhere**. On the terminated tender's view: no "Reason"
label anywhere in the page text, no tab for it, and the 257-character reason typed at submission is absent.

Same defect already recorded for Disapprove (`2026-07-30-disapprove-hangs-metadata-404.md`) — now confirmed for
Cancel Tender too. **A termination that forces a justification and then discards it from the record is an
audit-trail hole**, and it compounds Defect 1: the status is wrong *and* the explanation is missing.

**Spec position:** #60836 step 32 requires only that the reason be *displayed* — which it is, in the dialog, as
typed. Nothing documents a requirement that it stay retrievable on the tender afterwards, so **this is recorded
as an observation and not raised as an issue.**

## ⚪ NOT a defect — "disapproval message" wording is what the spec asks for

The Cancel Tender dialog reads *"a notification will be sent to the Initiator with the **disapproval** message
attached"* and *"the reason for **declining** this tender"*. I had logged that as a copy defect.

**ADO #60836 step 33 says the same thing:** *"…and also sent a notification to the initiator **with disapproval
message**."* The app matches its test case, so **this is withdrawn as a defect.**

It is still odd English for a cancellation, and three decisions sharing `tender-reason for disapproval v8` is why
it reads that way — so it goes to the **BA copy review**, where the *test case* needs correcting alongside the
app. Not dev's bug.

## Latent controls — measured, retraction upheld

The 2026-07-30 claim that this page shows a "Hold In abeyance" button and a duplicated Cancel Tender was marked
*not reproducible*. Both controls **are in the DOM** — and both are **0 × 0 pixels**:

| Button | Size | Visible to a user? |
|---|---|---|
| Approve Recommendation / Send back for re-evaluation / Change Recommendation / Bid is Non-Responsive / Cancel Tender | 219 / 224 / 214 / 192 / 140 × 32 | ✅ yes — **5 visible decisions** |
| "Hold In abeyance pending further due dilligence" | **0 × 0** | ❌ no |
| Second "Cancel Tender" | **0 × 0** | ❌ no |

So the retraction stands — **a user sees exactly 5 decisions** — but the markup carries two dead controls. Note
the typo **"dilligence"** in the invisible one. This is the same pattern as TC-26's orphaned hidden *Motivation*
textarea, and it is why presence checks must be paired with `isVisible()` on this form family.

## Also reconfirmed

`GET /api/services/app/Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender` → **404** fires here
too, on a **fully successful** commit. Third independent confirmation that this stale-namespace 404 is a real
wart but **not** the cause of the old Disapprove hang.

## Test data

| Tender | State |
|---|---|
| **REF2026-2395** | 🔴 **CONSUMED — terminal, status `DECLINED`.** Was an abandoned June automated run |
| **REF2026-1122** | Left the BAC inbox before this test; state unverified. **Plan fixture note updated** |
