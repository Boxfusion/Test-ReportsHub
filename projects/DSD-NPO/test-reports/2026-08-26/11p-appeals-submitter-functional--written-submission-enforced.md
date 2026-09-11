# Report: NPO-11P-F — Appeals: NPO Submitter (functional) — Written Submission proven enforced

**Date:** 2026-08-26 05:12 UTC
**Plan:** test-plans/appeals/11p-appeals-submitter-functional.md
**Execution Mode:** ai-repair
**Result:** PARTIAL — TC-03 moves from PARTIAL to **PASSED**, tested properly on a real appeal now that the suite's precondition exists. The other three remain blocked, but each now has a precise, dated reason rather than *"not constructible"*.
**Duration:** ~600s
**Cases:** TC-01, TC-02, TC-03, TC-04
**Environment:** QA · public portal · Live mode · NPO `Test Unsuccessful 03` (OrganisationStatus 9) · appeal `APPEAL1447/26/08/2026`
**Accounts used:** `npo.qa.applicant.a@example.org`

## Summary
| Total attempted | Passed | Failed | Partial | Blocked |
|---|---|---|---|---|
| 4 | 1 | 0 | 0 | 3 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 Refusal appeal within 30 days | #101774 | ⛔ BLOCKED | Now blocked only by **the calendar** — our refusal dates 05/08/2026, so the out-of-window branch opens ~**04/09/2026** |
| TC-02 Cancellation appeal not time-bound | #101775 | ⛔ BLOCKED | Re-confirmed today: **zero** organisations at status 7 (Cancelled), out of 36 517 at status 6 |
| TC-03 'Written Submission' reveals the submission text field | #101776 | ✅ PASSED | Field appears **and is genuinely enforced** — proven by toggling, not by reading an asterisk |
| TC-04 Compulsory Registration excluded | #101778 | ⛔ BLOCKED | Nothing in any drivable flow flags an organisation *Compulsory Register* |

## Test Cases

### TC-03 — 'Written Submission' mode reveals the submission text field (#101776 · TC-11-004) — PASSED

Run on `npo-appeal-application v35 LIVE` for appeal `APPEAL1447`.

**Assertion 1 — the text area appears on selecting Written: PASSES.**
Before selecting a mode, two textareas exist in the DOM at zero height. Selecting **Written Submission** reveals:

| Field | Label | Visible | Marked required |
|---|---|---|---|
| Written submission | `Written Submission *` | ✅ height 53.6px | ✅ |
| Oral submission | `Oral Submission` | ✗ height 0 | ✗ |

So the pair is mutually exclusive and mode-driven, as the case describes.

**Assertion 2 — it is actually enforced, not merely marked: PASSES.**
The plan is explicit that *"required"* must be tested by attempting to submit, not by reading an asterisk. It also
warns this build has produced four unmarked-mandatory findings. So the field was isolated — **every other required
field was filled and held constant** (Mode, Office Bearer, Declaration Name, Surname, Capacity), and only the
Written Submission was varied:

| Written Submission | Submit button |
|---|---|
| empty | **disabled** |
| `"QA test written submission…"` | **enabled** |
| cleared again | **disabled** |
| retyped | **enabled** |

Toggled twice, in both directions. The gate is real and attributable to this field alone.

⚠️ **The first reading of this was wrong and is corrected here.** Submit was disabled with the Written Submission
*filled*, which initially looked like the field doing nothing. The cause was the unfilled **Submitting Office
Bearer** — an unrelated required field. Only after selecting the office bearer did the isolation become valid. A
disabled Submit is not evidence about a particular field until every other required field is satisfied.

**🔴 Drift note — CONFIRMED.** Thabiso's note reads *"Code enum says 'Oral' not 'Verbal' as in FDS — cosmetic but
ensure UI label matches."* The UI renders **`Oral`** and **`Written Submission`** under *Preferred Representation
Mode*. The FDS wording *Verbal* appears nowhere. Cosmetic drift, confirmed by execution.

The stored value is `modeOfAppeal = 2` for Written Submission, and the text is persisted to the appeal's
**`Description`** field — there is no dedicated `writtenSubmission` column on `DeregistrationAppeal`. It renders
correctly on the admin side under a *Written Submission* heading, so the mapping works; it is only worth knowing
that the two names differ.

---

### TC-01 — Refusal appeal must be submitted within 30 days of refusal (#101774 · TC-11-002) — BLOCKED

No longer blocked on *"a refusal notice on an NPO we own"* — we own one. It is blocked purely on elapsed time:
`Test Unsuccessful 03` carries failed application **APPL26-00139** dated **05/08/2026**, which is **21 days** old.
The out-of-window branch this case tests becomes reachable on about **2026-09-13** (or **04/09/2026** counting from
the application date — see the caveat below).

⚠️ **A prerequisite for running it at all:** `SubmissionDate` on an appeal is stamped at **creation**, not at
submission (see the smoke report). If the 30-day window is measured off that field, the window itself is being
measured from the wrong instant, and this case would need to assert the window boundary rather than assume it.

**🔴 Drift note (unchanged):** *"no explicit 30-day window check found for refusal appeals"* — expected to fail when
the date arrives. Nothing observed today contradicts it: the form opened with no reference to a window.

---

### TC-02 — Appeal of Cancellation is not time-bound (#101775 · TC-11-003) — BLOCKED

Re-confirmed against the register today:

| OrganisationStatus | Count |
|---|---|
| 6 Deregistered | 36 517 |
| **7 Cancelled** | **0** |
| 9 Not Registered | 3 |

Status 7 has never been set on any organisation. `Cancellation Of Registration` exists as nature value 2 and renders
on the form, but is **disabled** for our status-9 NPO. Unblocking needs an organisation seeded at status 7.

---

### TC-04 — Appeals do not apply to Compulsory Registration cases (#101778 · TC-11-006) — BLOCKED

Unchanged. Nothing in the registration wizard, the NPO record or the admin NPO view captures a *Compulsory Register*
flag, so the precondition cannot be built on QA. Still an open question for Thabiso.

## Coverage against ADO
| ADO case | Local | Verdict |
|---|---|---|
| #101774 TC-11-002 | TC-01 | ⛔ BLOCKED — calendar, until ~2026-09-13 |
| #101775 TC-11-003 | TC-02 | ⛔ BLOCKED — no status-7 organisation exists |
| #101776 TC-11-004 | TC-03 | ✅ PASSED |
| #101778 TC-11-006 | TC-04 | ⛔ BLOCKED — flag not capturable |
