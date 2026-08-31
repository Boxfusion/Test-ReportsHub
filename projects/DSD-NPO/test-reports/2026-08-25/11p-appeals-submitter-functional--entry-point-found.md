# Report: NPO-11P-F — Appeals: NPO Submitter (functional) — the entry point exists, and it is unreachable

**Date:** 2026-08-25 08:25 UTC
**Plan:** test-plans/appeals/11p-appeals-submitter-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — the blocking question open across **all 16 appeals cases** is answered: a submitter appeal journey **does exist** at `portal-appeals-table` → `Initiate Appeal`. It is **absent from the portal navigation**, its table is still **DRAFT**, and a submitter **never sees their own appeal** once created. 1 case partially verdicted, 3 still blocked — but now for precise, reportable reasons.
**Duration:** ~1800s
**Cases:** TC-01, TC-02, TC-03, TC-04
**Environment:** QA · public portal · **view mode Latest (asserted in-run)** · NPO context `Nomfanelo QA Test NPO 2026-08-13`
**Accounts used:** `mpenduloizwelinuk@gmail.com` (public portal)

## Summary
| Total attempted | Passed | Failed | Partial | Blocked |
|---|---|---|---|---|
| 4 | 0 | 0 | 1 | 3 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 Refusal appeal within 30 days | #101774 | ⛔ BLOCKED | Needs a refusal notice **older than 30 days** on an NPO we own — precondition not constructible today |
| TC-02 Cancellation appeal not time-bound | #101775 | ⛔ BLOCKED | Needs a **cancelled** NPO of our own; the register holds **zero** organisations at status 7 (Cancelled) |
| TC-03 'Written Submission' reveals the text field | #101776 | ⚠️ PARTIAL | Mode labels **recorded** — `Oral` / `Written Submission`, drift note confirmed. The reveal and enforcement assertions are blocked by a 500 |
| TC-04 Compulsory Registration excluded | #101778 | ⛔ BLOCKED | Nothing in any flow we can drive flags an organisation as *Compulsory Register* — the precondition does not exist on QA |

## 🔑 The answer to the question that blocked all 16 appeals cases
The plan recorded: *"Across all 16 appeals cases — 5 smoke + these 4 + 7 admin — **not one specifies how a submitter
reaches the appeal form**"*, and *"the Registration Application Unsuccessful email carries no appeal link, so that
alternative is closed too."*

**There is a submitter journey.** It was found by enumerating the form registry rather than the navigation:

| Route (public portal) | Version | What it is |
|---|---|---|
| `boxfusion.dsdnpo/portal-appeals-table` | v11 **DRAFT** | The submitter's Appeals list — carries the **`Initiate Appeal`** button. **This is the entry point.** |
| `boxfusion.dsdnpo/npo-appeal-application` | v35 LIVE | The appeal form itself — 18 fields, quotes *"Section 14(1) and 22(1) of the NPO Act"* |
| `boxfusion.dsdnpo/npo-appeal-application-details` | v9 LIVE | Read-only appeal view |
| `boxfusion.dsdnpo/appeal-portal-details` | v14 LIVE | Alternative read-only view |
| `boxfusion.dsdnpo/portal-appeal-records` | v14 LIVE | A second list — its grid **400s** and can never load |

**And it works** — clicking `Initiate Appeal` created a real appeal: **`APPEAL1445/25/08/2026`**, id
`4106f35f-ee6e-45b3-8357-a8931fc61d7b`, created 2026-08-25 08:08:35 UTC. The admin appeals total moved **30 → 31**.

### Why nobody could find it
1. **It is not in the portal navigation.** The signed-in submitter's entire nav is `Dashboard · Register NPO ·
   Education and Awareness · Contact Us · FAQs`, plus `View NPO Profile` and `Submit Query` on the dashboard.
   **Nothing anywhere says "Appeal".**
2. **`portal-appeals-table` is still at version `v11 DRAFT`** — unpublished. This run only reached it because the
   project rule puts the portal in **Latest** view mode. A real member of the public in **Live** mode would not get
   the form at all.

That is the whole explanation for a blocker that has stood since 2026-08-14, and it is a defect rather than a gap in
the test plan.

## 🔴 A submitter cannot see their own appeal
Bug: `../bugs/2026-08-25-submitter-cannot-reach-or-see-own-appeals.md`

After `APPEAL1445` was created, `portal-appeals-table` still reports **`0 items found`** with an empty grid — while
the admin side lists 31 appeals including ours. The same screen simultaneously displays:

> *"You already have an existing Appeal that is either in Draft or In Progress status."*

So the submitter is told they already have an appeal, shown none, and left with an **enabled** `Initiate Appeal`
button that will happily make another. Three mutually contradictory statements on one screen.

`portal-appeal-records`, the other list, fails differently — its grid request goes out with an **empty property list**
and is rejected:
```
GET /api/services/app/Entities/GetAll?entityType=Npo.DeregistrationAppeal&maxResultCount=10&skipCount=0&properties=&sorting=
→ 400
```

## Case detail

### TC-01 — Refusal appeal must be submitted within 30 days (#101774 · TC-11-002) — BLOCKED
The entry point is no longer the obstacle; the **precondition** is. The case needs a refusal notice **older than 30
days** belonging to an NPO we own. Our organisations are registered, not refused, and a refusal cannot be aged
artificially without clock control. Still blocked, but the reason has moved from *"no route exists"* to *"no aged
refusal exists"*, which is a schedulable problem.

### TC-02 — Appeal of Cancellation is not time-bound (#101775 · TC-11-003) — BLOCKED
Needs a **cancelled** NPO. The register holds **zero** organisations at status **7 (Cancelled)**; what exists is
**6 (Deregistered)**, 36 517 of them. Whether *Cancellation Of Registration* appeals are meant to key off status 6 or
7 is unresolved — and it is the same mismatch that made 11A TC-04's status assertion unobservable.
**❓ Worth putting to Thabiso as one question covering both cases.**

### TC-03 — 'Written Submission' mode reveals the submission text field (#101776 · TC-11-004) — PARTIAL
**Mode:** ai-repair · `npo-appeal-application` v35
- [PASS] **(record) The exact mode labels are `Oral` and `Written Submission`.** This answers smoke TC-11-005's open note *"RECORD the mode options"*
- [PASS] **The drift note is confirmed.** Thabiso's note reads *"code enum says 'Oral' not 'Verbal' as in FDS — cosmetic but ensure UI label matches."* The UI renders **`Oral`**, so the UI follows the code and the **FDS is the odd one out**. Cosmetic, but now settled rather than assumed
- [PASS] (record) `Nature of Appeal` offers `Refusal To Register` and `Cancellation Of Registration`
- [BLOCKED] (blocking) Whether a written-submission text area **appears** and is **enforced** — not testable:
  - Opened cold by URL, the form is **entirely read-only**: 4 of 4 radio options `ant-radio-wrapper-disabled`, 4 of 5 inputs disabled, **`Submit` disabled**
  - Reached properly via `Initiate Appeal`, the form loads against the new appeal but its data call fails: **`GET /api/services/dsdnpo/AppealActions/GetAppealInitialData?appealId=4106f35f-… → 500 "No Appeal or NPO found"`**, twice — for the appeal the click had just created. Only 2 of 4 radios became enabled
- 🔑 The plan says to test "required" by submitting, not by reading an asterisk. That could not be honoured: the form never reached a state where `Submit` was usable. Recorded as blocked rather than guessed from the markers
- 📌 The form declares 18 fields but ships **four separate labels reading `Name`** and **two reading `Position`**

### TC-04 — Appeals do not apply to Compulsory Registration cases (#101778 · TC-11-006) — BLOCKED
The plan's own open question stands: nothing in the registration wizard, the appeal form or the admin NPO record
captures a *Compulsory Register* flag. Neither radio group on the appeal form offers it, and `Nature of Appeal` has
only the two options above. **The precondition appears not to be constructible on QA at all**, so the drift note
(*"compulsory-registration block on appeals NOT enforced"*) can be neither confirmed nor refuted from the UI.
**❓ Direct question for Thabiso, as the plan already flagged.**

## Incidental findings
- **`appeal-portal-details` v14 ships design-time placeholders on a public-facing form** — five fields labelled
  `Text field2`, `Text field7`, `Text field8`, `Text field9`, `Text field10`.
- **Relative timestamps are two hours out.** The newly created appeal rendered as *"Created by: Mpendulo ntshangase
  **2 hours ago**"* seconds after creation. SAST is UTC+2 and the stored time was 08:08:35 UTC, so the UI is
  comparing a UTC timestamp against local time.
- **The UI shows `DRAFT` for a stored status of `3` (InComplete).** There is no `Draft` member in the appeal-status
  reference list at all — see 11A TC-07.

## What this unblocks
- **11A TC-01** (Send-to-Chairperson with an invalid email) becomes runnable as soon as `APPEAL1445` can be worked —
  we now own an appeal, which was the stated blocker.
- **11A TC-02 / TC-03** status assertions, and **TC-07**'s notification half, all become runnable on an appeal of our
  own rather than another tester's.
- ⛔ All of that is gated behind the `GetAppealInitialData` 500. **That single defect is now the critical path for the
  appeals module** — fixing it makes roughly six further cases executable.

## Method
- Routes discovered by listing the form registry (`FormConfiguration` — 8 294 forms) and filtering for `appeal`,
  rather than by navigating the portal, which does not expose them.
- Form state read declaratively: `ant-radio-wrapper-disabled`, `input.disabled`, `button.disabled`, so "read-only"
  is a measured fact rather than an inference from a failed click.
- One state change was made deliberately: `Initiate Appeal` on an NPO **we own**, recorded above with its reference
  and id. Nothing was submitted and no third party's record was touched.
