# Bugs — Case Lifecycle (ADO suite 112755)

**Plan:** test-plans/case-management/case-lifecycle.md
**ADO:** Plan 112718 › PD-CRM (112719) › Case Management (112720) › Case Lifecycle (112755), cases #112773–#112799
**Environment:** QA — https://pd-dep-adminportal-qa.shesha.app
**Found:** 2026-09-02
**Build:** `Boxfusion.ServiceManagement/case-request-details v10`, `TimeLine-item-picker v7`, `edit-reported-user v7`, `merge-case v26`, `StarterTemplate/assign-case v15`, `service-requests v55`

## Final result — 22 passed, 4 failed, 1 blocked (all 27 cases have a verdict)

Reconciled across three runs on 2026-09-02, after the harness faults found in the first run were fixed and
the `QA-AUTO` case pool was topped up (two Case Creation passes, ~14 fresh cases).

**All 4 failures are application defects, caused by 3 distinct bugs.** Every harness fault from the first
run is now fixed and verified passing.

| ADO | Case | Verdict | Bug |
|---|---|---|---|
| #112773 | Created case displayed in the Cases list | ✅ PASSED | |
| #112774 | Case details displayed correctly | ✅ PASSED | weaker than ADO, see plan deviation 8 |
| #112775 | Case searched using reference number | ✅ PASSED | |
| #112776 | Case assigned to an agent | ✅ PASSED | |
| #112777 | Case assigned to a group of agents | ✅ PASSED | |
| #112778 | Agent B picks up Agent A's case | ⏭️ **BLOCKED** | no second agent account |
| #112779 | Merge as Related Cases | ✅ PASSED | Link Type options and hint both match ADO |
| #112780 | Merge as Single Cases | 🔴 **FAILED** | **BUG-209** — child set to `Cancelled`, not `Closed` |
| #112781 | Related Case(s) panel for a merged case | ✅ PASSED | |
| #112782 | Notifications after Single Case merge | ✅ PASSED | delivery half NOT VERIFIED, BUG-204 |
| #112783 | Notifications after Related Case merge | ✅ PASSED | delivery half NOT VERIFIED, BUG-204 |
| #112784 | Case can be closed | ✅ PASSED | no closure Timeline entry, BUG-205 |
| #112785 | Closure cancelled when No is selected | ✅ PASSED | |
| #112786 | Closed case can be reopened | 🔴 **FAILED** | **BUG-203** — status becomes `NEW`, not `Open` |
| #112787 | Reopening cancelled when No is selected | ✅ PASSED | |
| #112788 | Case marked as In Progress | ✅ PASSED | |
| #112789 | Not marked as In Progress when No selected | ✅ PASSED | |
| #112790 | Email sent from Case Details | 🔴 **FAILED** | **BUG-206** — not recorded in the Timeline |
| #112791 | CC email address can be added | 🔴 **FAILED** | **BUG-206** |
| #112792 | Email attachment can be uploaded | ✅ PASSED | |
| #112793 | Email with CC recipient and attachment | ✅ PASSED | |
| #112794 | SMS sent from Case Details Timeline | 🔴 **FAILED** | **BUG-206** |
| #112795 | Case details edited and saved | ✅ PASSED | |
| #112796 | Category and Case Type updated | ✅ PASSED | |
| #112797 | Case Description updated | ✅ PASSED | |
| #112798 | Customer details updated | ✅ PASSED | |
| #112799 | Edit cancelled using Cancel Form Edit | ✅ PASSED | |

### The three defects share one root pattern

All three are the application **stating an outcome in its own UI text and then persisting something else**:

| The app says | The app does |
|---|---|
| `Are you sure you want to set this case to "Open" status` | sets `NEW` (BUG-203) |
| `the merged child case will be automatically closed` | sets `Cancelled` (BUG-209) |
| composer accepts Send | nothing recorded in the Timeline, no confirmation (BUG-206) |

Worth raising with the developers as one theme rather than three unrelated tickets — it looks like wrong
status constants and a missing journal write, not three independent faults.

### Run provenance

No single run covers all 27 — the first full run predated the fixes, and two later runs were interrupted
part-way. Verdicts above are taken from the most recent run that executed each case:

| Cases | Run | Report on disk |
|---|---|---|
| TC-01 – TC-10 | 3rd run — interrupted after TC-10 | **none** — killed before the report step |
| TC-11 – TC-21 | 4th run — interrupted after TC-21 | **none** — killed before the report step |
| TC-13, TC-22 – TC-27 | 5th run — completed | `2026-09-02/case-lifecycle--resume-tc13-22-27.md` |

⚠️ Only the 5th run produced a report file. `run-plan.js` writes the report *after* Playwright exits, so an
interrupted run leaves no report at all — the verdicts for TC-01–TC-21 above were read from the runner's
captured console output, not from a committed report. **The dashboard therefore under-represents this
suite**, showing only the superseded first run plus the 7-case 5th run. A single clean 27-case run (~1.5h)
is what would fix that, and is the recommended next step for this suite.

`2026-09-02/case-lifecycle.md` still holds the **first** run (14 passed / 12 failed) and is superseded by
this table. A single clean 27-case run would take ~1.5h and has not been done.

---

## Superseded: first run of 2026-09-02 — 14 passed, 12 failed, 1 skipped (1.4h)

Kept for the record. **Only 3 of those 12 failures were application defects.** The rest were faults in the
test harness or limits of the test data — all since fixed and verified — and are recorded here so the count
is not mistaken for 12 defects.

| ADO | Case | Verdict | Reason |
|---|---|---|---|
| #112773 | Created case displayed in the Cases list | ✅ PASSED | Row shows reference, status and submitter; opening it shows Case Details. |
| #112774 | Case details displayed correctly | ✅ PASSED | Details agree with the list row; no customer field blank. Weaker than ADO — see deviation 8 in the plan. |
| #112775 | Case searched using reference number | ✅ PASSED | Search narrowed to exactly the searched case. |
| #112776 | Case assigned to an agent | ✅ PASSED | Agent dropdown appears only after the radio; assignment shows against `Assigned To`. |
| #112777 | Case assigned to a group of agents | ✅ PASSED | Group dropdown appears only after the radio; assignment accepted. |
| #112778 | Agent B picks up Agent A's case | ⏭️ **BLOCKED** | No second agent account. Cannot be faked from the single `Admin` login. |
| #112779 | Merge as Related Cases | ⚠️ TEST FAULT | List search failed to apply (`still 1609 items`). Passed in isolation — the merge flow itself works, Link Type options and the hint both match ADO. See BUG-207. |
| #112780 | Merge as Single Cases | ⚠️ TEST FAULT | Exceeded the 300s per-test cap. Budget raised to 600s for the merge cases. |
| #112781 | Related Case(s) panel for a merged case | ✅ PASSED | Panel present and names the counterpart case. |
| #112782 | Notifications after Single Case merge | ⚠️ TEST FAULT | 300s cap. |
| #112783 | Notifications after Related Case merge | ⚠️ TEST FAULT | 300s cap. |
| #112784 | Case can be closed | ✅ PASSED | `In Progress` → `Closed`, persists a reload, `ReOpen` becomes available. |
| #112785 | Closure cancelled when No is selected | ⚠️ TEST DATA | Pool exhausted — no `QAAuto` case could be brought to `In Progress`; merges and closures had left them all terminal. See "Test data" below. |
| #112786 | Closed case can be reopened | 🔴 **FAILED** | **Application defect — BUG-203.** |
| #112787 | Reopening cancelled when No is selected | ✅ PASSED | Stays `Closed`, `ReOpen` still offered. |
| #112788 | Case marked as In Progress | ✅ PASSED | Transitions and persists; `Close` appears, `Mark In Progress` withdraws. |
| #112789 | Not marked as In Progress when No selected | ✅ PASSED | Status unchanged. |
| #112790 | Email sent from Case Details | 🔴 **FAILED** | Composer prefills and accepts Send, but nothing is recorded in the Timeline. **BUG-206.** |
| #112791 | CC email address can be added | 🔴 **FAILED** | `Cc` accepted; same Timeline failure. **BUG-206.** |
| #112792 | Email attachment can be uploaded | ✅ PASSED | Attachment attaches and is listed in the composer. (No Timeline assertion — see BUG-206.) |
| #112793 | Email with CC recipient and attachment | ✅ PASSED | All three shown together before sending. (No Timeline assertion.) |
| #112794 | SMS sent from Case Details Timeline | 🔴 **FAILED** | Mobile prefilled, message accepted, Send clicked — **no Timeline entry and no success feedback at all**. **BUG-206.** |
| #112795 | Case details edited and saved | ⚠️ TEST FAULT | The save works; the assertion did not reload first. See BUG-208. |
| #112796 | Category and Case Type updated | ✅ PASSED | Case Type options refresh to the new Category with no stale values. |
| #112797 | Case Description updated | ⚠️ TEST FAULT | Same as #112795. |
| #112798 | Customer details updated | ⚠️ TEST FAULT | Same as #112795. |
| #112799 | Edit cancelled using Cancel Form Edit | ✅ PASSED | Original value restored and persists. |

---

## BUG-203 — [Application] Reopening a closed case sets it to `NEW`, not `Open`

**Type:** Application defect
**Severity:** High
**Status:** Open
**Fails:** ADO #112786
**Confirmed:** 2026-09-02, observed three separate times (recon, and both full runs)

### Steps to reproduce
1. Open a case in `Closed` status → **ReOpen**
2. Read the confirmation dialog, then click **Yes**
3. Reload the Case Details screen and read the status in the header

### Expected (per ADO #112786 step 7)
> "The case status changes from Closed to **Open**"

The application's own dialog promises the same thing:

```
ReOpen Closed Case Or Cancelled Case
Are you sure you want to set this case to "Open" status: REF001/02/09/2026: Area Power Failure
```

### Actual
The case lands in **`NEW`**, not `Open`. Verified from the Case Details header after a hard reload, so this
is the persisted value and not a rendering lag.

### Why it matters
The dialog states the outcome and the app then does something else, so the UI is internally inconsistent.
More practically, `NEW` is indistinguishable from a case that has never been worked: a reopened case loses
the fact that it was previously handled and closed, and any queue, report or SLA rule that keys off `NEW`
will treat it as brand new. `Open` exists as a status elsewhere in the app's vocabulary — the closed-case
action set even offers an `Open` button — so this looks like the wrong status constant, not a missing one.

### Note
Everything else about the flow is correct: the dialog displays the case reference number as ADO requires,
the `No` path leaves the case `Closed` with `ReOpen` still available (#112787 passes), and `ReOpen` is
correctly withdrawn once the case has been reopened.

---

## BUG-209 — [Application] A Single Case merge sets the child to `Cancelled`, not `Closed`

**Type:** Application defect
**Severity:** Medium–High
**Status:** Open
**Fails:** ADO #112780 step 11
**Found:** 2026-09-02, on the re-run after the harness fixes (previously masked by a test timeout)

### Steps to reproduce
1. Select a case → **Merge**
2. Link Type `Parent Case`; Merge Type **`Single Case`**
3. Pick a parent case, click **Merge**
4. Open the child case and read its status from the Case Details header

### Expected (per ADO #112780 step 11)
> "The child case is displayed with its status set to **Closed**"

The application's own hint in the merge dialog promises exactly that:

```
Hint: This option will merge the selected cases into a single case, and the merged child case
will be automatically closed.
```

### Actual
The child case status is **`CANCELLED`**.

```
Error: child should be Closed by a single merge
Expected: "CLOSED"
Received: "CANCELLED"
```

### Why it matters
This is the **same class of fault as BUG-203**: the app states an outcome in its own UI text and then writes
a different status constant. `Cancelled` and `Closed` are not interchangeable — a cancelled case reads as
"this should never have been raised", whereas a case merged into a parent *was* legitimate and *was*
addressed, just not separately. Any resolution-rate metric, SLA calculation or report that distinguishes
closed from cancelled work will now misattribute every single-merged case.

That `Cancelled` is a real, distinct status is confirmed by the reopen dialog's own title,
`ReOpen Closed Case Or Cancelled Case`.

### Note
The Related Case merge (#112779) is correct — its child is flagged `Merged`, matching ADO, and TC-07 passes.
So the defect is specific to the Single Case path.

---

## BUG-206 — [Application] Emails and SMS sent from the Timeline panel are not recorded in the Timeline

**Type:** Application defect
**Severity:** Medium–High
**Status:** Open
**Fails:** ADO #112790 step 8, #112791, #112794 step 8
**Confirmed:** 2026-09-02 by a dedicated verification pass

### Steps to reproduce
1. Open any case → Case Details → **Send SMS** on the Timeline panel
2. The Mobile Number is prefilled correctly. Type a message — the textarea accepts it
3. Click **Send**
4. Watch for feedback, then reload the Case Details screen and re-read the Timeline

### Expected (per ADO #112794)
> "The SMS is sent successfully to the populated mobile number… **The SMS activity is recorded against the
> case**."

and per ADO #112790 step 8:

> "The sent email is recorded in the case Timeline with the relevant sender, message, and date/time
> information."

### Actual
- **No success feedback of any kind.** Polled `.ant-message-notice`, `.ant-notification-notice` and
  `[role=alert]` for 12 seconds after clicking Send — nothing. (By contrast, saving an edit *does* toast
  `Case updated Refreshing..`, so the app does use toasts elsewhere.)
- **The Timeline is unchanged**, both immediately and after a hard reload. It still contains only the
  original submission acknowledgement:
  `Hi SmsCheck35197 Nhleko, Kindly note that the case you have reported was successfully submitted…`
- No failing HTTP request accompanied the send (the only 4xx were two unrelated missing ace-editor theme
  chunks, `theme-idle_fingers.js` and `mode-html.js`).

The same pattern holds for email: the composer prefills the customer address, accepts a `Cc` and an
attachment, and accepts Send — but nothing is journalled.

### Why it matters
The Timeline is the case's audit trail. An agent who sends a customer an SMS or email has no record that
they did, no other agent can see it, and there is no evidence for a dispute. Combined with the absence of
any success confirmation, the agent cannot even tell whether the send happened.

### ⚠️ Unresolved: was the message actually delivered?
**This is the open question and it needs a human check.** The verification pass sent the SMS to a case whose
mobile number is a real handset, so if a message reading `VerifySMS24835 timeline check` arrived, then
**delivery works and only the journalling is broken** — a narrower, lower-severity defect. If nothing
arrived, the send is failing silently, which is considerably worse. Ask the handset owner before finalising
the severity. Case creation *does* dispatch SMS successfully
(`observations/2026-09-02-sms-notification-check.md`), so the transport is known to work.

---

## BUG-205 — [Application] Closing a case adds no Timeline entry, though ADO requires a closure notification

**Type:** Application defect — needs confirmation
**Severity:** Medium
**Status:** Open — likely the same root cause as BUG-206
**Fails:** ADO #112784 step 9, #112786 step 9

ADO #112784 step 9 requires *"A case closure notification is sent to the customer using the configured
Preferred Contact Method"*, and #112786 step 9 the equivalent on reopening. After driving a case
`In Progress` → `Closed`, the Timeline gained **no entry at all**.

Whether the notification is *dispatched* and merely not journalled cannot be told apart from the portal —
the same ambiguity as BUG-206, and quite possibly the same cause. Resolve BUG-206's delivery question first.

---

## BUG-201 — [Test case] ADO button labels do not match the application

**Type:** Test-case defect
**Severity:** Low
**Status:** Open — needs a BA decision

| ADO says | The application renders |
|---|---|
| "Mark as In Progress" (#112788, #112789) | **`Mark In Progress`** |
| "Pickup" (#112778) | **`Pick Up`** |

Tests were written against the real labels. Harmless to automation but it makes the cases misleading for
manual testers. Align one side.

---

## BUG-202 — [Application] The same action shows different confirmation wording depending on where it is invoked

**Type:** Application defect (cosmetic, but suggests duplicated implementations)
**Severity:** Low
**Status:** Open

| Action | From the Cases list | From Case Details | ADO prescribes |
|---|---|---|---|
| Mark In Progress | `Are you sure you want to set this case to "In Progress" status ?` | `Are you sure you want to set this case to "In Progress"?` | `Are you sure you want to set this case to 'In Progress' status?` |
| Close | `Are you sure that you want to close the case?` | `Are you sure that you want to close case?` | `Are you sure that you want to close the case?` |

Three observations:
1. The two entry points differ from **each other**, which implies the same action is implemented twice.
2. The Case Details variant of Close is **ungrammatical** — *"close case?"*, missing "the".
3. The list variant of Mark In Progress has a **stray space** before the question mark, and only it retains
   ADO's word "status".

Assertions match the substance rather than the punctuation, so the cases still pass — but a verbatim
assertion would fail on one entry point or the other whichever wording was chosen.

---

## BUG-207 — [Test/Application, unresolved] The Cases list search intermittently does not apply

**Type:** Unresolved — could be either
**Severity:** Low (test reliability)
**Status:** Open — needs a dedicated investigation

The list filter is unreliable. Symptoms seen across the day:
- Typing into `.sha-global-table-filter input.ant-input` **without focusing it first** never registers, and
  the list silently stays unfiltered. That part is understood and worked around (`click()` before `fill()`).
- Even when the term registers, the list briefly keeps serving the **previous, unfiltered page**, so reading
  rows on a fixed delay intermittently returns stale data. Worked around by polling until the pager total
  changes.
- **Still unexplained:** in the 2026-09-02 run, TC-07 searched `REF003/02/09/2026` and the pager stayed at
  `1609 items` for the full 45s poll — the filter never applied at all. The same test passed in isolation
  minutes earlier.

⚠️ This one twice produced a **false "search is broken" conclusion** before being understood. It is recorded
as unresolved rather than as an application defect, because the failure has not been reproduced
deterministically and the harness has been the cause every time so far.

---

## BUG-208 — [Test case, informational] Saving an edit leaves the screen in edit mode showing stale values

**Type:** Application behaviour worth confirming as intended
**Severity:** Low
**Status:** Open — informational

Clicking **Save** in edit mode toasts `Case updated Refreshing..` and the change **is** persisted (confirmed
by reload, and by reopening edit mode and reading the field back). But the screen **stays in edit mode and
keeps displaying the pre-edit values** until the page is manually refreshed — the toast says "Refreshing.."
and no refresh occurs.

This is not a data-loss bug, but it reads as one to a user: you save, and the screen tells you nothing
changed. Worth confirming with the BA whether the view is meant to exit edit mode and re-render on save.
Three test cases (#112795, #112797, #112798) failed against this before the reload was added.

---

## Test data

This suite claims subjects from the existing `QA-AUTO` case pool rather than creating cases. **The pool is
now largely exhausted**: merges consume two cases each and leave them `Merged`/`Closed`, closures leave
cases `Closed`, and none of those states can be returned to `NEW` through the UI. #112785 failed for exactly
this reason, reporting `No "QAAuto" case could be brought to IN PROGRESS. Confirmed statuses:
REF009=CLOSED, REF007=MERGED, …`.

Before the next run the pool needs topping up — either by running the Case Creation suite (each run adds
~7 `QA-AUTO` cases) or by widening `QA_POOL_SEARCH`. Widening it must not reach pre-existing records: the
whole safety property of this suite is that mutations only ever touch cases this project created.

## Not covered by this suite

- **The `Cancel` case action.** Every status exposes a `Cancel` button — a case action, not a dialog
  dismissal — and the ReOpen dialog is titled `ReOpen Closed Case Or Cancelled Case`, so a `Cancelled`
  status clearly exists. No case in 112755 covers cancelling a case or reopening a cancelled one.
- **`Add Notes`** on the Timeline panel (`Cancel` / `Add`). Not referenced by any ADO case, and given
  BUG-206 it is worth checking whether notes are journalled either.
- **`Turn On AI Assistant`** on Case Details. Not in ADO.
- **`Uploaded Media`** panel. Not in ADO.
- **Escalation.** Edit mode exposes an `Escalation` field (`for=escalation`); no case exercises it.

## Environment note

The telephony endpoint returns **HTTP 500 continuously** on both the Cases list and Case Details:

```
500 GET https://pd-dep-api-qa.shesha.app/api/services/Telephony/TelephonyAgentActions/GetAgent
console: Error fetching telephony agent
```

It repeats many times per page load. Nothing in this suite depends on it and no user-visible failure was
traced to it, but it is a server error firing on every page and the console noise makes real errors harder
to spot. Raised separately from the case-lifecycle defects.
