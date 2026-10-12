# Bug: Hourly leave lifecycle — full day can never be reached; declined cancellation blocks re-cancel; Recommend view has no times

- **Plan**: `test-plans/HCM/eLeave/hourly-leave-lifecycle.md` (split from `hourly-leave.md` on 2026-10-07; TC numbers below are the **new** ones — old TC-05…TC-13 = new TC-02…TC-10)
- **Failing TCs**: `TC-03` (non-blocking), `TC-05`, `TC-06`, `TC-10 step 6` — found while recording the spec on QA (2026-10-07) and confirmed on the full run that day
- **Suspected category**: business-logic
- **Azure DevOps**: issue 1 → #117805, issue 2 → #117806, issue 5 → #117809 (all related to Feature #100661). Issues 3 and 4 are in [2026-10-07-hourly-leave-form.md](2026-10-07-hourly-leave-form.md)
- **Test data left on QA**: GOV003 has **7 hours Hourly Parked** — `LA2026/13780` (5 hours on Tue 24 Nov 2026) and `LA2026/13824` (2 hours on Thu 12 Nov 2026). Because of issue 1 no whole-hour request can top this up, so TC-02 fails on every run until the bug is fixed or the parked leaves are cleared.

## 6. Cancel Leave is still offered on Accumulated hourly leave (TC-06, non-blocking) — NEW, not yet raised in ADO
- **Plan applicant**: GOV005 (the plan moved from GOV003 to GOV005 on 2026-10-07)
- **Expected**: once an hourly leave is **Accumulated** into a full-day leave, its details view no longer offers **Cancel Leave**
- **Actual**: both contributing leaves still show **Cancel Leave** — `LA2026/13852` and `LA2026/13858` (accumulated into `LA2026/13860`), and again `LA2026/13862` and `LA2026/13868` (into `LA2026/13870`). Clicking it wasn't tried.
- **Suspected cause**: the Cancel Leave button's visibility rule doesn't exclude the Accumulated status.

## 1. Hourly leaves never add up to a full working day (blocks TC-05 to TC-08)
> **Update 2026-10-07:** specific to **GOV003's** work calendar. As GOV005 (8-hour day) A (2 h) + B (6 h) accumulated into a 1-day leave within a minute, and approval and charging worked (`LA2026/13860`, `LA2026/13870`). #117805 should be narrowed to GOV003's calendar / the "7 hours 1 minute" full-day calculation.

- **Step**: `TC-05 STEP 2` / `TC-06 STEP 2`
- **Expected**: A (2 hours) + B (the remaining hours) reach a full day, and a 1-day accumulated leave is created
- **Actual**: the form reports the full day as **"7 hours 1 minute"** ("You have applied for 2 hours of leave before. You have 5 hours 1 minute left to reach a full day (7 hours 1 minute)."). The time picker only offers whole hours, so the closest B is 08–14 = 5 hours. After B was recommended, A (`LA2026/13762`) and B (`LA2026/13780`) both stayed **Hourly Parked**, and no accumulated leave appeared in 2.5 minutes. 08–15 (6 hours) is rejected with "Leave duration should not be more than 5 hours 1 minute."
- **Re-confirmed 2026-10-07 (full run):** GOV003 already had 5 hours outstanding (`LA2026/13780`), and A (`LA2026/13824`, 2 hours on 12/11/2026) was recommended and parked. In TC-05, every 1-hour request is rejected with "Leave duration should not be more than 1 minute." (7 hours of a 7 h 1 min day used), so B can't be submitted and TC-06–TC-10 are blocked.
- **Also**: the admin Charges grid shows the reserving hourly charge as **Minutes Count 480** (8 hours), which doesn't match the 7 h 1 min full day either.
- **Suspected cause**: the work-day length is computed with an off-by-one (e.g. lunch 12:00–12:59 or an inclusive end minute), so whole-hour requests can never meet the threshold.

## 2. Re-cancelling after a declined cancellation fails (TC-10 step 6) — BY DESIGN
> **Update 2026-10-07:** confirmed by the product owner that a leave application can be cancelled only once; after a declined cancellation the leave returns to its previous status. The refusal is expected, and TC-10 now asserts it. ADO #117806 still needs triage on the ADO side (close as By Design, or keep open only for the generic "Failed to cancel leave" message / HTTP 500).

- **Expected**: after GOV012 declines the cancellation, GOV003 can cancel the Hourly Parked leave again
- **Actual**: "Failed to cancel leave" toast. `POST /api/services/SaGovLeave/SaGovLeaveCancellationWorkflow/CancelApplication` → **HTTP 500**: `"A cancellation request already exists for this application."` The existing cancellation (`LC:2026-21394`) has status **Declined**.
- **Suspected cause**: the "cancellation already exists" check doesn't exclude declined cancellations.

## 5. Display gaps (non-blocking)
- **TC-03**: the Recommend Leave view shows Start/End as dates only (`19/11/2026`); the plan expects `09:00` / `11:00`. The applicant's details view does show times (`24/11/2026 08:00`).
- The full-day hint part of #117809 is in the form bug log.

## Snapshot / screenshot
`test-results/artifacts/HCM-eLeave-hourly-leave-EL-02309-te-limit-and-hourly-leave-B-chromium/` (TC-05 "Leave duration should not be more than 1 minute.", from the last full run of the old `hourly-leave.spec.ts`)
