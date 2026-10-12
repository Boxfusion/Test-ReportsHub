# Test Plan: ELEAVE-HOURLY-FORM — Hourly Leave: application form and validations

> **Status:** Draft — needs ADO acceptance-criteria review (see Traceability)
> **Owner:** QA
> **Last Updated:** 2026-10-08
> **Estimated Duration:** 180s
> **Regression:** Yes. This plan submits no leave and changes no data, so it can run any number of times. The leave lifecycle (parking, accumulation, approval, charges, cancellation) is in [hourly-leave-lifecycle.md](hourly-leave-lifecycle.md)

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | 12345678 / 123qwe (applicant). A dedicated user: the lifecycle plan's GOV003 builds up parked hourly leave that blocks this form's 2-hour requests |
| ADO Feature | [#100661 — Hourly leave](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/100661) and its child items |
| ADO Enhancements | [#114297](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/114297) · [#115574](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/115574) · [#114301](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/114301) · [#114309](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/114309) · [#114295](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/114295) |

## Objective
> Validate the hourly leave application form. Duration = **Hours** is offered only for leave types that allow it and swaps the date range for Date, Start Time and End Time. The form works out the working time, excluding lunch. Invalid hourly requests are rejected before anything is submitted.

## How hourly leave works (as implemented)
| Rule | Behaviour |
|------|-----------|
| Availability | Duration (Hours / Days) only shows for leave types with **"Allow to apply hourly leaves"** ticked |
| Fields | **Date**, **Start Time**, **End Time**. Times are whole hours only (picker 00–23, no minutes) |
| Weekend setting | A setting stops users applying for weekends. A request with no working hours in it (a weekend, a public holiday, or hours outside the work day) is rejected with "Please make sure that the hours entered are working hours. The selected period contains only weekends or public holidays." |
| Lunch only | A request that falls entirely within the lunch break is rejected with "The selected time falls entirely within the lunch break and contains no leave hours. Please select a period outside the lunch break." (commit d9b7001b, on QA since 2026-10-08) |
| Duration | Working time inside the work day minus the lunch overlap (e.g. 11:00–14:00 = **2 hours** on a 12:00–13:00 lunch). Shown as "X hours Y minutes" |
| Full working day | A request covering the whole work day (e.g. 08:00–16:00) is turned into a **Days** leave of 1 day |

## Traceability
The ADO work items couldn't be read in this session (no Azure DevOps access). This plan is built from the code on `main` and the live QA app. The mapping below is **provisional**: confirm each item's acceptance criteria and adjust before marking the plan Ready.

| Area | Test cases | Likely source |
|------|-----------|---------------|
| Capture hourly leave, validations | TC-02, TC-03, TC-04 | #100661 children |
| Hours **and minutes** display | TC-03 | enhancement (commit 95c5ba2c) |
| Work-day and **lunch** duration taken into account | TC-03, TC-04 | enhancement (commit 3820ee10) |
| Lunch-only request rejected with its own lunch-break message | TC-04 row e | [#117807](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/117807) (commit d9b7001b "lunch hour validation message") |
| Hourly leave fixes | all | enhancement (commit 371491b7) |

## Test Data
| Item | Value |
|------|-------|
| Category / Sub-Category | `Annual Leaves` / `Annual Leaves` (allows hourly leave) |
| Address | `265 West Avenue` |
| Date D1 | A future weekday in the current leave year, not a public holiday and with no existing 12345678 leave. Pick at random and retry on "There are overlaps with existing leave requests". Nothing is submitted on it |
| Work day (12345678's calendar on QA) | 08:00–16:00 with a 1-hour lunch around 12:00 |

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] 12345678 can log in (password `123qwe`)

> Test cases run **in order**: TC-04 reuses D1 from TC-03. A failed `(BLOCKING)` assertion stops the run.

## Test Cases

### TC-01 — Login as Applicant

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
  2. SNAPSHOT — confirm the Username and Password fields and the Sign In button are visible
  3. TYPE Username field with `12345678`
  4. TYPE Password field with `123qwe`
  5. CLICK the Sign In button
  6. WAIT for the home page to load
- **Expected result:** The applicant is logged in
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the **Workflows** menu item is visible

---

### TC-02 — Hourly option and fields on the leave application form

- **Type:** Happy path
- **Steps:**
  1. CLICK Workflows › **My Items**, CLICK **Create New** › **New Leave Application**
  2. ASSERT the new leave application form opens with **Myself** selected
  3. SELECT Category `Annual Leaves`, then Sub-Category `Annual Leaves`
  4. ASSERT the **Duration\*** field shows the options **Hours** and **Days**
  5. CLICK **Hours**
  6. CLICK the **Start Time** field
  7. CLICK **Days**, then CLICK **Hours** again
- **Expected result:** Choosing Hours swaps the date range for a single date with start and end times
- **Assertions:**
  - [x] ASSERT (BLOCKING) With **Hours** selected, **Date\*** ("Select date"), **Start Time\*** and **End Time\*** ("Select time") are shown, and **Start Date** / **End Date** are hidden
  - [x] ASSERT The Start Time picker lists whole hours only (`00`–`23`), with no minutes column, and the typed input is read-only
  - [x] ASSERT With **Days** selected, Start Date / End Date are shown and Date / Start Time / End Time are hidden
  - [x] ASSERT For a leave type without "Allow to apply hourly leaves" (pick one on QA when recording, e.g. a Sick sub-category), the **Duration** field is not shown

---

### TC-03 — Duration is calculated in hours and minutes, excluding lunch

- **Type:** Happy path
- **Steps:**
  1. On the form from TC-02 (Annual Leaves, **Hours**), TYPE Date with D1
  2. SELECT Start Time `09`, End Time `11`
  3. SELECT Start Time `11`, End Time `14` (spans lunch)
  4. SELECT Start Time `08`, End Time `16` (the whole work day)
- **Expected result:** The hint shows the working time; lunch isn't counted; a whole day becomes a 1-day leave
- **Assertions:**
  - [x] ASSERT (BLOCKING) After step 2, the alert reads **"Great! You have selected to take 2 hours off"** and "Available days: Please note that you only have … day(s) (current leave cycle) left for this particular leave type" is shown
  - [x] ASSERT (BLOCKING) After step 3, the alert reads **"Great! You have selected to take 2 hours off"** (the lunch hour is excluded)
  - [x] ASSERT After step 4, no "… hours off" alert is shown. The request is treated as a full day: the hint shows **1 day**, not hours

---

### TC-04 — Hourly validations block submission

- **Type:** Negative
- **Steps:** On the form (Annual Leaves, **Hours**, Address `265 West Avenue`, certification ticked), for each row below SELECT the values, CLICK **Submit**, and check the message. Nothing may be submitted.

  | # | Date | Start | End | Expected message |
  |---|------|-------|-----|------------------|
  | a | D1 | `14` | `10` | "End time must not be earlier than start time" |
  | b | D1 | `09` | `09` | "You have not selected leave duration." |
  | c | D1 | `06` | `08` | "Hourly leave must fall within your working hours (08:00 - 16:00)." and "Please make sure that the hours entered are working hours. The selected period contains only weekends or public holidays." |
  | d | D1 | `15` | `18` | "Hourly leave must fall within your working hours (08:00 - 16:00)." |
  | e | D1 | `12` | `13` | "The selected time falls entirely within the lunch break and contains no leave hours. Please select a period outside the lunch break." (see "Lunch only" above) |
  | f | next Saturday | `09` | `11` | "Please make sure that the hours entered are working hours. The selected period contains only weekends or public holidays." |
  | g | a weekday public holiday in the current cycle *(only if one exists on QA)* | `09` | `11` | "You cannot apply for hourly leave on a public holiday." |

- **Expected result:** Each invalid request is rejected with its message
- **Assertions:**
  - [x] ASSERT (BLOCKING) For each of rows a–f, the expected message is shown (inside "Please correct the errors and try again" where the app wraps it), and no "Great! … hours off" alert is shown
  - [x] ASSERT (BLOCKING) No Delegate pop-up appears and the user stays on the form, so no application is created
  - [x] ASSERT Row g, when run, shows the public-holiday message. Skip it and note "no weekday public holiday on QA" otherwise

---

## Teardown
- None. No application is submitted; the form is left without saving.

## Notes
- **Two duration formats:** the same leave can show "6 hours 30 minutes" (subject / hint) in one place and "6.5 hours" (Duration column) in another.
