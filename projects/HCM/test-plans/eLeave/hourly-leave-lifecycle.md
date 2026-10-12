# Test Plan: ELEAVE-HOURLY-LIFECYCLE — Hourly Leave: parking, accumulation, approval and cancellation

> **Status:** Draft — needs ADO acceptance-criteria review (see Traceability)
> **Owner:** QA
> **Last Updated:** 2026-10-08
> **Estimated Duration:** 800s
> **Regression:** **Not yet.** Run on demand. As GOV005 (8-hour day) the flow runs end to end; bug [#117805](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/117805) only affects GOV003's "7 hours 1 minute" day. Each full run still charges GOV005 1 day of Annual Leave and leaves Ref D Hourly Parked (see Teardown). The application form is covered by [hourly-leave-form.md](hourly-leave-form.md)

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | GOV005 / 123qwe (applicant, Andrew Smith, PERSAL No `GOV00500`), GOV012 / 123qwe (recommender), GOV022 / 123qwe (approver), admin / P@ssw0rd (Leave Balances). GOV005 is used only by this plan, so parked hourly leave it leaves behind doesn't affect other plans |
| ADO Feature | [#100661 — Hourly leave](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/100661) and its child items |
| ADO Enhancements | [#114297](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/114297) · [#115574](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/115574) · [#114301](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/114301) · [#114309](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/114309) · [#114295](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/114295) |

## Objective
> Validate hourly leave from submission to balance deduction. The recommender recommends each hourly request, which then becomes **Hourly Parked**. When the parked hours add up to a full working day, the system creates a **1-day accumulated leave**. The approver approves that full day, and the balance is charged **one whole day**. Cancelling an hourly leave, and declining that cancellation, are also covered.

## How hourly leave works (as implemented)
| Rule | Behaviour |
|------|-----------|
| Fields | **Date**, **Start Time**, **End Time**. Times are whole hours only (picker 00–23, no minutes) |
| One per date | The overlap check uses the **date only**, so a second leave on the same date is rejected even at different hours |
| Reservation | The first hourly request of an accumulation reserves **1 whole day** of balance; later ones reserve nothing more |
| Workflow | Hourly request: New → Recommend Leave → **Hourly Parked** (no Approve step). Accumulated full day: → **Approve Leave** (skips Recommend) |
| Accumulation | When parked hours reach a full working day, a 1-day accumulated leave is created and each contributing hourly leave becomes **Accumulated** |
| Credits | Always deducted in **whole days**, never fractions |
| Cancellation | A leave application can be cancelled **only once**. If that cancellation is declined, the leave returns to the status it had before (e.g. **Hourly Parked**), and a second cancellation is refused |

## Traceability
The ADO work items couldn't be read in this session (no Azure DevOps access). This plan is built from the code on `main` and the live QA app. The mapping below is **provisional**: confirm each item's acceptance criteria and adjust before marking the plan Ready.

| Area | Test cases | Likely source |
|------|-----------|---------------|
| In-progress hourly leave counted toward the full day; credits deducted in full days | TC-02, TC-05, TC-08 | enhancement (commit b85a1442) |
| Hourly Parked status, no approval step for hourly requests | TC-03 | #100661 children |
| One leave per date | TC-04 | #100661 children |
| Accumulated status, accumulated full-day leave | TC-06, TC-07 | #100661 children (commit ce224b46) · bug [#117805](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/117805) |
| Declined cancellation restores Hourly Parked | TC-10 | enhancement (commit 88014035) |
| Hourly leave fixes | all | enhancement (commit 371491b7) |

## Test Data
| Item | Value |
|------|-------|
| Category / Sub-Category | `Annual Leaves` / `Annual Leaves` (allows hourly leave) |
| Address | `265 West Avenue` |
| Dates D1, D2, D3, D4 | Four **different** future weekdays in the current leave year, not public holidays and with no existing GOV005 leave. Pick at random and retry on "There are overlaps with existing leave requests" |
| Work day (GOV005's calendar on QA) | 08:00–16:00 with a 1-hour lunch around 12:00. **EXTRACT** the full-day length from the app (the "to reach a full day (…)" note); don't hard-code it |

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] GOV005, GOV012 and GOV022 can log in (password `123qwe`)
- [ ] GOV005 has GOV012 as recommender and GOV022 as approver (shown as "Your leave will be routed as follows" on the form)
- [ ] GOV005 has at least **1 day** of Annual Leaves available. A new accumulation needs one full day
- [ ] GOV005's outstanding hourly leave (`{prior}`, read in TC-02) plus 2 hours is less than a full working day, otherwise B can't be submitted in TC-05
- [ ] `NotRecommendButProceed` is off (the standard Not Recommended path)

> Test cases run **in order** and share data (D1–D4, Ref Nos). A failed `(BLOCKING)` assertion stops the run.

## Test Cases

### TC-01 — Login as Applicant

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
  2. SNAPSHOT — confirm the Username and Password fields and the Sign In button are visible
  3. TYPE Username field with `GOV005`
  4. TYPE Password field with `123qwe`
  5. CLICK the Sign In button
  6. WAIT for the home page to load
- **Expected result:** The applicant is logged in
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the **Workflows** menu item is visible

---

### TC-02 — Applicant submits hourly leave A (2 hours)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to Leave Management › **My Leave Balances** and EXTRACT the Annual Leaves balance (`B0`) and the "+N reserved but not approved/synchronized" value (`R0`)
  2. CLICK Workflows › **My Items** › **Create New** › **New Leave Application**
  3. SELECT Category `Annual Leaves`, Sub-Category `Annual Leaves`, CLICK **Hours**
  4. TYPE Date with D1, SELECT Start Time `09`, End Time `11`
  5. ASSERT "Great! You have selected to take 2 hours off" is shown. If the form shows "Note: You have applied for **{prior}** of leave before…", EXTRACT `{prior}` (outstanding hourly leave from earlier runs); otherwise `{prior}` is 0
  6. TYPE Address with `265 West Avenue`, CLICK the certification checkbox, CLICK **Submit**
  7. CLICK **Don't Delegate** on the Delegate pop-up
  8. EXTRACT the Ref No (`LA…`) of the new SaGov Leave Application in My Items (**Ref A**)
  9. NAVIGATE to **My Leave Balances**
- **Expected result:** The hourly leave is submitted, routed to the recommender, and 1 day is reserved
- **Assertions:**
  - [x] ASSERT (BLOCKING) My Items lists Ref A as an **In Progress** SaGov Leave Application whose name mentions **2 hours** of Annual Leaves on D1
  - [x] ASSERT If `{prior}` is 0, the Annual Leaves balance drops by **1 day** from `B0` (one whole day reserved for the new accumulation) and the reserved figure goes up by 1 from `R0`. If `{prior}` is more than 0, the day was already reserved, so the balance and reserved figure are unchanged

---

### TC-03 — Recommender recommends hourly leave A, which is parked (no approval step)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to /login and log in as `GOV012` / `123qwe`
  2. NAVIGATE to Workflows › **Inbox**
  3. SNAPSHOT — confirm the row with **Ref A** and Action Required **Recommend Leave**
  4. CLICK the magnifying-glass icon on that row
  5. ASSERT the "Recommend Leave: …" view shows **Duration Type** = Hours, and the Start / End show D1 **09:00** / **11:00**
  6. CLICK the acknowledgement checkbox, CLICK **Recommend**
  7. Log in as `GOV022` / `123qwe` and open Workflows › **Inbox**
  8. Log in as `GOV005` / `123qwe` and open Workflows › **My Items**
- **Expected result:** Recommending an hourly leave parks it; the approver gets nothing
- **Assertions:**
  - [x] ASSERT (BLOCKING) After step 6, "Successfully Submitted" is shown and the user is back on Incoming Items
  - [x] ASSERT (BLOCKING) GOV022's Inbox has **no** Approve Leave item for Ref A
  - [x] ASSERT (BLOCKING) In GOV005's My Items, Ref A has status **Hourly Parked**

---

### TC-04 — A second leave on the same date is rejected

- **Type:** Negative
- **Steps:**
  1. As GOV005, open a New Leave Application (Annual Leaves, **Hours**)
  2. TYPE Date with **D1**, SELECT Start Time `13`, End Time `15` (no time clash with A)
  3. Complete Address and the checkbox, CLICK **Submit**
- **Expected result:** The overlap check works on the date, so the request is rejected
- **Assertions:**
  - [x] ASSERT (BLOCKING) "There are overlaps with existing leave requests" is shown and no Delegate pop-up appears

---

### TC-05 — Remaining hours: note, limit and hourly leave B

- **Type:** Happy path + negative
- **Steps:**
  1. As GOV005, open a New Leave Application (Annual Leaves, **Hours**), TYPE Date with **D2**
  2. EXTRACT from the note "Note: You have applied for **{before}** of leave before. You have **{remaining}** left to reach a full day (**{full}**)."
  3. SELECT a Start/End **longer than `{remaining}`** but inside the work day (e.g. `08`–`15` when 5 hours remain), complete Address and the checkbox, CLICK **Submit**
  4. SELECT a Start/End that equals **exactly `{remaining}`** (e.g. `08`–`14` = 5 hours with lunch excluded)
  5. CLICK **Submit**, then **Don't Delegate**
  6. EXTRACT the Ref No of the new application (**Ref B**)
  7. Open **My Items** and NOTE whether a **1 day** Annual Leaves application on **D2** already exists (informational)
- **Expected result:** The form counts A toward the full day and caps B at the remaining hours
- **Assertions:**
  - [x] ASSERT (BLOCKING) In step 2, `{before}` is `{prior}` + **2 hours** and `{before}` + `{remaining}` = `{full}` (the full working day, e.g. 7 hours)
  - [x] ASSERT (BLOCKING) In step 3, "Leave duration should not be more than {remaining}." is shown and nothing is submitted
  - [x] ASSERT (BLOCKING) After step 5, Ref B is listed **In Progress** in My Items
  - [x] ASSERT The Annual Leaves balance is unchanged from after TC-02: no second day is reserved
  - [x] NOTE (informational, never fails) Open **My Items**: if a **1 day** Annual Leaves application on **D2** already exists, record that accumulation fired on Ref B's submission rather than its recommendation. Seen on 2026-10-08 (LA2026/13974); the plan expects it only after TC-06 step 1

---

### TC-06 — Recommending B completes a full day; an accumulated leave is created

- **Type:** Happy path
- **Steps:**
  1. Log in as `GOV012`, open **Inbox**, open the **Recommend Leave** item for **Ref B**, tick the checkbox, CLICK **Recommend**
  2. Log in as `GOV005`, open **My Items**. WAIT (refresh, up to ~3 minutes) for the SaGov Leave Application for **1 day** of Annual Leaves on **D2** (Ref B's date), e.g. `from Mon 30 Nov 26 to Mon 30 Nov 26`. It is created by a background job. Identify it by the date, not as "new since TC-05": it can already exist before step 1
  3. EXTRACT its Ref No (**Ref ACC**) and open it
- **Expected result:** A + B make a full day, so the system creates a 1-day accumulated leave and closes the hourly ones
- **Assertions:**
  - [x] ASSERT (BLOCKING) After step 1, "Successfully Submitted" is shown
  - [x] ASSERT (BLOCKING) A **1 day** Annual Leaves application on D2 (Ref ACC) is listed In Progress in GOV005's My Items
  - [x] ASSERT (BLOCKING) Ref A and Ref B both have status **Accumulated**
  - [x] ASSERT The Ref ACC details show "Note: This leave was generated from accumulated hourly leaves taken earlier. See details below." and a grid listing Ref A and Ref B with **Num Work Minutes** `120` and `{remaining}` in minutes
  - [x] ASSERT The **Cancel Leave** button is not available on Ref A / Ref B (status Accumulated)

---

### TC-07 — Approver approves the accumulated full day

- **Type:** Happy path
- **Steps:**
  1. Log in as `GOV022`, open **Inbox**
  2. SNAPSHOT — confirm the row with **Ref ACC** and Action Required **Approve Leave** (no Recommend step before it)
  3. CLICK the magnifying-glass icon, ASSERT the accumulated-leave note and the grid with Ref A and Ref B are shown
  4. CLICK the acknowledgement checkbox, CLICK **Approve with Full Pay**
- **Expected result:** The full day is approved
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Successfully Submitted" is shown and the user is back on Incoming Items
  - [x] ASSERT In GOV005's My Items, Ref ACC moves past In Progress to an approved / PERSAL status (e.g. Generate PERSAL input)

---

### TC-08 — Balance is charged exactly one whole day

- **Type:** Happy path
- **Steps:**
  1. As GOV005, NAVIGATE to **My Leave Balances**
  2. As `admin` / `P@ssw0rd`, NAVIGATE to SaGov Leave Management › **Leave Balances**, open the magnifying glass on GOV005's current-cycle **Annual Leaves** row, and look at **Charges**
- **Expected result:** 7 hours of hourly leave cost exactly 1 day; no fractions
- **Assertions:**
  - [x] ASSERT (BLOCKING) In total, exactly **1** whole day is charged, never a fraction. If `{prior}` was 0, the balance is `B0` − 1 and reserved is back to `R0`. If `{prior}` was more than 0, the balance is `B0` and reserved is `R0` − 1
  - [x] ASSERT Charges has exactly **one** row for this accumulation: on **Ref A** (the hourly request that reserved the day), with **Days Count 1**, **Minutes Count** = the full working day in minutes (480 on an 08:00–16:00 day) and Charge Status **Approved**. There is no separate charge row for Ref B or Ref ACC

---

### TC-09 — Cancelling a parked hourly leave releases its hours

- **Type:** Happy path
- **Steps:**
  1. As GOV005, submit hourly leave **C** on **D3**, `09`–`10` (1 hour), Don't Delegate. EXTRACT **Ref C**
  2. As GOV012, recommend Ref C. ASSERT that in GOV005's My Items Ref C is **Hourly Parked**
  3. As GOV005, open Ref C from My Items, CLICK **Cancel Leave**, TYPE comments `Cancel hourly leave - regression test`, CLICK **OK**
  4. As GOV012, open the **Recommends Cancellation** item for Ref C's cancellation (`LC:…`), CLICK **Recommend Cancellation**
  5. As GOV005, open a New Leave Application (Annual Leaves, **Hours**) on D4, then close it without submitting
- **Expected result:** The parked hours are given back once the cancellation is recommended
- **Assertions:**
  - [x] ASSERT (BLOCKING) After step 3, "Successfully cancelled the leave" is shown and a SaGov Leave Cancellation for Ref C is listed In Progress
  - [x] ASSERT (BLOCKING) After step 4, "Successfully Submitted" is shown, and the cancellation shows **Cancellation Completed** with Ref C **Cancelled**
  - [x] ASSERT In step 5, no "Note: You have applied for … before" note is shown, because C's hour was released, and the 1 day reserved for C's accumulation is back on the balance

---

### TC-10 — Declining the cancellation puts the hourly leave back to Hourly Parked; it can't be cancelled again

- **Type:** Happy path + negative
- **Steps:**
  1. As GOV005, submit hourly leave **D** on **D4**, `09`–`10`, Don't Delegate. EXTRACT **Ref D**
  2. As GOV012, recommend Ref D (it becomes **Hourly Parked**)
  3. As GOV005, CLICK **Cancel Leave** on Ref D, TYPE comments `Cancel hourly leave - decline test`, CLICK **OK**
  4. As GOV012, open the **Recommends Cancellation** item for Ref D, CLICK **Decline Cancellation**, TYPE comments `Decline hourly cancellation - regression test`, CLICK **OK**
  5. As GOV005, open **My Items**
  6. As GOV005, open Ref D, CLICK **Cancel Leave**, TYPE comments `Second cancellation - should be refused`, CLICK **OK**
  7. As GOV005, open **My Items**
- **Expected result:** A declined cancellation restores the hourly leave to its previous status. Because a leave can be cancelled only once, a second cancellation is refused and the leave stays as it was
- **Assertions:**
  - [x] ASSERT (BLOCKING) After step 4, "Successfully Submitted" is shown
  - [x] ASSERT (BLOCKING) After step 5, Ref D has status **Hourly Parked** again (not In Progress, Cancelled or Approved), and its cancellation has status **Declined**
  - [x] ASSERT (BLOCKING) In step 6, the second cancellation is refused: either **Cancel Leave** is not offered, or clicking OK shows an error (currently "Failed to cancel leave") and "Successfully cancelled the leave" is not shown
  - [x] ASSERT (BLOCKING) After step 7, no new SaGov Leave Cancellation for Ref D is listed (only the Declined one), and Ref D is still **Hourly Parked**

---

## Teardown
- Ref A, Ref B and Ref ACC stay as real approved leave for GOV005 on D1/D2. Pick fresh dates every run.
- TC-09 cancels its own hourly leave C.
- TC-10 **leaves Ref D (1 hour) as Hourly Parked**: a leave can be cancelled only once, and D's single cancellation was declined. D counts toward GOV005's next accumulation and is picked up as `{prior}` in TC-02 of the next run.
- A run that stops between TC-02 and TC-06 also leaves Ref A (and Ref B, if submitted) Hourly Parked, which adds to `{prior}` next time. If `{prior}` + 2 hours ever reaches a full day, clear GOV005's parked hourly leave before the next run.

## Notes — possible defects found in the code (check during the first run)
- **Double counting at recommendation:** the code may count the hourly leave being recommended twice toward the full day, so a single half-day request could create an accumulated leave on its own. TC-03 catches this if A (2 hours) creates an accumulated leave by itself.
- **Charges "Minutes Count":** the first hourly request's charge row is expected to show Days Count 1 and **Minutes Count 0**; it never shows minutes.
- **Minimum days rule:** on a leave type with a minimum number of days, an hourly request may wrongly fail with "You should select at least {n} days for this type of leave".
- **One-step approver:** if the recommender and the approver are the same person, a recommended hourly leave may have no next step in the workflow. Not covered here, because GOV012 ≠ GOV022.
- **Two duration formats:** the same leave can show "6 hours 30 minutes" (subject / hint) in one place and "6.5 hours" (Duration column) in another.
