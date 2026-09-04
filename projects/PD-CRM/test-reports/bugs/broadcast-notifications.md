# Bugs — Broadcast Notifications (ADO suite 113517)

**Plan:** test-plans/case-management/broadcast-notifications.md
**ADO:** Plan 112718 › PD-CRM (112719) › Case Management (112720) › Broadcast Notifications (113517), cases #113519–#113528
**Environment:** QA — https://pd-dep-adminportal-qa.shesha.app
**Found:** 2026-09-04
**Build:** `Boxfusion.Dep/broad-cast-notificationstableView v42`, `Boxfusion.Dep/broadcast-create v63`,
`Boxfusion.Dep/broad-cast-detailsView` (Latest view mode)

## Final result — 9 passed, 1 failed

Run of 2026-09-04 (`test-reports/2026-09-04/broadcast-notifications.md`), in **Latest** view mode —
`switchToLatest()` is wired into the spec's `login()` and throws if the switch does not take.

| ADO | Case | Verdict |
|---|---|---|
| #113519 | Broadcast can be created | ✅ PASSED |
| #113520 | Broadcast details can be viewed | ✅ PASSED — **QUESTION-601 raised**, see below |
| #113521 | Broadcast can be deleted | 🔴 **FAILED — BUG-601** (the deletion itself works) |
| #113522 | Broadcast can be edited | ✅ PASSED |
| #113523 | Broadcast can be withdrawn | ✅ PASSED |
| #113524 | Deletion can be cancelled | ✅ PASSED |
| #113525 | Withdrawal can be cancelled | ✅ PASSED |
| #113526 | Delivery options can be selected | ✅ PASSED |
| #113527 | Broadcasts can be searched | ✅ PASSED |
| #113528 | Broadcasts can be filtered | ✅ PASSED |

**One failure, and it is a documentation fault.** #113521 fails *solely* on the confirmation wording — the
delete genuinely deleted (list total 514 → 513, and the row was absent on re-search afterwards).

**#113520 passes.** The details screen not naming the target audience was originally logged as a defect
(BUG-603) and has been **downgraded to QUESTION-601**: without the user story we cannot say whether showing
the target *type* alone satisfies the intent, and ADO step 5 names "target" — which the screen does show —
never "Organisation Unit". It goes to the BA as a question, not a bug.

**Three earlier runs are not counted here.** The first two failed at TC-02 and, because the describe was
`mode: 'serial'`, skipped the remaining eight cases — "1 failed, 8 did not run" hid eight verdicts behind
one defect. Serial was removed (each case builds its own fixture; `workers: 1` already forces sequential
execution). The third run's TC-03 and TC-10 failures were **spec faults, not application faults**, and are
recorded under "Repairs" below so they are not mistaken for build regressions later.

## Repairs made during authoring — spec faults, not application faults

| Symptom | Actual cause |
|---|---|
| Clicked a select that never becomes visible | `^Target` also matched the **hidden "Targeting Flag"** field, earlier in the DOM |
| Target read back as `""` after being set | `innerText()` returns empty for the element ant hides while a select holds focus — read `title`/`textContent` |
| The whole create form vanished mid-test | `Escape` (used to dismiss a dropdown) **closes the ant Modal**; dismiss with `Tab` instead |
| "…option-content intercepts pointer events" | ant keeps overlays mounted; wait for **zero** visible dropdowns, not one node |
| "The list stopped rendering rows" after a delete | the grid persists `quickSearch` in localStorage, so the deleted record's filter survived the navigation |
| "The filter options never appeared" | the filter opens an **inline right sidebar** (`.sha-index-table-column-filters`), not a dropdown/popover/modal |

The last two are the ones worth remembering: both looked like application defects and neither was. Checking
before logging is what the #113356 lesson was about.

---

> 🛑 **Every broadcast published while testing this suite was aimed at `Organisation Unit` →
> `Auto Testing Group` and nothing else.** `publishGuarded()` reads both select values back from the DOM
> immediately before clicking Publish and throws unless they match exactly; there is no other route to the
> Publish button in the spec. Verified after the fact against the API: of the broadcasts created by this
> suite, **zero** had a target other than `OrganisationUnit`, and every one carried
> `organisationUnitId = 1bb49896-f6c1-4d5e-be5c-b0b908f01d93` (Auto Testing Group).

---

## BUG-602 — [Application] A rejected Publish is swallowed — the 400 is never shown to the user

**Type:** Application defect — **frontend error handling**; the backend validation works
**Severity:** Medium (High as a usability matter — the user is given no reason for the failure)
**ADO:** affects #113519 and #113526; not described by any case

**What happens.** On the Add New Broadcast Notification form, with **Title**, **Target**, **Organisation
Unit** and **Message** all completed but **both `Send Push` and `Send Sms` left unchecked**, clicking
**Publish** appears to do nothing: the modal stays open and no record is written.

**Root cause, confirmed 2026-09-04.** The click *does* reach the server, which correctly rejects it:

```
POST /api/services/Inbox/Inbox/CreateBroadcastNotification   →  400
console: Failed to load resource: the server responded with a status of 400
console: Failed to execute action 'shesha.common:Execute Script', error: J…
```

So **at least one delivery option is genuinely required and the backend enforces it.** The defect is that
the **frontend discards the 400 without telling anyone.** The entire page text was diffed before and after
the click and the only change was the string `"16"` — no toast, no banner, no field-level error. The
failure is indistinguishable from a dead button.

**Compounding it: the delivery options are not marked required.** `Title*` and `Target*` both carry the
required marker; `Send Push` and `Send Sms` do not, so nothing on the form tells the user the rule exists
before or after they break it.

**The fix is in two places** — surface the server error, and mark the fields required (or default one on).

**The requirement itself proven by a controlled pair** (2026-09-04, both aimed at Auto Testing Group,
neither with SMS):

| Attempt | Send Push | Send Sms | Modal after Publish | Record created |
|---|---|---|---|---|
| A | unchecked | unchecked | **stays open** | **no** |
| B | checked | unchecked | closes | yes |

The only variable was the delivery options, so the requirement is real — it is simply never communicated.

**Steps to reproduce**
1. Log in as `Admin`, switch view mode to **Latest**
2. Navigate to **Broadcast Notification** → **Create New Broadcast**
3. Enter a Title; set Target = `Organisation Unit`; choose an Organisation Unit; enter a Message
4. Leave **both** `Send Push` and `Send Sms` unchecked
5. Click **Publish**

**Expected:** either the broadcast is published, or a validation message states that at least one delivery
option is required.
**Actual:** nothing happens and nothing is explained.

**Impact on testing.** This is what failed the first full run — TC-02's fixture was published with both
options off, and the suite could not proceed. Fixtures now publish **push-only**.

---

## QUESTION-601 — [For the BA] Should Broadcast Details name WHO the broadcast was sent to?

**Type:** Open question — *not* logged as a defect
**ADO:** #113520 passes; this is raised alongside it
**Screen:** `Boxfusion.Dep/broad-cast-detailsView v23`

> **Why this is a question and not a bug.** We do not have the user story. ADO #113520 step 5 requires the
> "configured title, **target**, message, delivery options and any attachment" to display correctly — and
> the screen *does* show a `Target` field, correctly reading `Organisation Unit`. On the create form
> `Target` and `Organisation Unit` are two separate fields, and ADO never names the second. So whether the
> audience *should* appear here is a design intent question, and the case is passed pending an answer.

**What we observed.** The Broadcast Details screen shows the target **type** but never the target
**audience**.
For a broadcast published to `Organisation Unit` → `Auto Testing Group`, the whole details body reads:

```
Broadcast Details · Edit · Withdraw
Title        QA-BC-250844 View
Target       Organisation Unit
Send Sms  Send Push  Attachments
Valid From   04/09/2026 05:37:47
Valid To ·  Withdrawal Date
Message      QA view check QA-BC-250844 View
```

`Auto Testing Group` appears **nowhere on the screen** — the entire page text was searched, not one
locator. The same gap applies to `Site`-targeted broadcasts: you learn it went to *a* site, never *which*.

**Why it matters.** After the fact there is no way to tell from the portal who received a given broadcast.
For a municipal notification tool that is an auditing gap, not a cosmetic one — and it is exactly the
information a tester or an administrator needs to confirm a broadcast went where it was meant to. We could
only confirm our own sends were correctly targeted by querying the API directly
(`organisationUnitId` on `FlattenedBroadcastNotification`), which an ordinary user cannot do.

**To see it**
1. Publish a broadcast with Target = `Organisation Unit` and any Organisation Unit selected
2. Open it from the list via the magnifying glass
3. Read the Details panel — the chosen Organisation Unit is not shown

### The questions for Moshadi

1. **Is the audience meant to be shown on Broadcast Details?** As it stands, once a broadcast is sent
   nobody can tell from the portal *who* received it. We could only confirm our own sends were correctly
   targeted by querying `organisationUnitId` through the API, which an ordinary administrator cannot do.
   If that is intended, fine — if not, it is an auditing gap worth a ticket.
2. **Same question for `Site`-targeted broadcasts** — you learn it went to *a* site, never which.
~~3. Are the delivery options meant to be readable on this screen?~~ **Answered — no question needed.**
   The delivery options **are** displayed correctly. They render as checkboxes, whose state does not appear
   in the page's text, which is why an early note wrongly called them blank. Verified 2026-09-04 against a
   push-only fixture: `Send Sms checked=false`, `Send Push checked=true` — exactly as published. Nothing to
   raise here.

Answer 1 as "yes, it should show" and this becomes a defect; answer "no" and it closes.

---

## BUG-601 — [Test cases] Four defects in the ADO suite text

**Type:** Test-case defect (documentation) — the same class as BUG-004 and BUG-501
**Severity:** Low, but #113521 is materially misleading

1. **#113521 (Delete) steps 5–6 describe the wrong entity.** Step 5 expects *"The customer is successfully
   deleted from the **Customers list**"* and step 6 says *"Search for the deleted **customer**"*. These are
   copy-pasted from the Customers suite (113324). The case is about broadcast notifications.
2. **#113521 steps 4 and 5 contradict each other, and neither matches the build.** Step 4 promises a
   dialog with **"Cancel and OK"**; step 5 instructs *"Click **Yes**"*. Both cannot describe the same
   dialog. The build actually renders:

   ```
   Delete Broadcast
   Are you sure you want to delete this item          [No]  [Yes]
   ```

   — so the buttons are **No / Yes** (matching step 5, not step 4) and the message has **no question
   mark**. Captured 2026-09-04. Asserted SOFT in the spec so the case still executes, exactly as BUG-501
   was handled for Customers. The Withdraw dialog, by contrast, matches its ADO text exactly:
   *"Withdraw Notification — Are you sure you want to withdraw the notification?"* with **No / Yes**.
3. **#113524's title is truncated** — *"**erify** Broadcast Notification Deletion Can Be Cancelled"*.
   Cosmetic.
4. **#113526 step 2 and #113525 step 2 expect a screen that a further click produces.** #113526 navigates
   to the list but expects *"The Add New Broadcast Notification form is displayed"* — that form only opens
   after **Create New Broadcast**. #113525 navigates to the list but expects *"The Broadcast Details screen
   is displayed"*. The missing clicks are performed and noted.

**Recommendation:** #113521 should be rewritten against broadcast notifications, and its dialog wording
reconciled with the build. The others are edits.

---

## Observations — not raised as defects

- **The list renders the raw enum `OrganisationUnit`; the create form shows `Organisation Unit`.** Same
  value, two spellings across two screens. Only visible on this Target value, since `Global` and `Site` are
  single words. Cosmetic, worth a word to the BA.
- **List column order is `Message | Send Sms | Send Push | Title | Target | Valid From | Valid To |
  Withdrawal Date | Status`** — Message precedes Title, which is not what the headings suggest at a glance.
- **Row actions are `search` and `delete` only — there is no edit icon**, so editing is reached through the
  details screen.
- **The create modal closes on `Escape`.** Not a defect, but it destroys an in-progress form; automation
  must dismiss dropdowns with `Tab`.
- **Delivery is not observable from the portal.** The list records dispatch *intent* (`Send Sms` /
  `Send Push` columns), not delivery. Delivery was therefore confirmed **out-of-band on the tester's
  handset**, on two separate sends (05:28/05:30 and 05:36 on 2026-09-04) — so Organisation-Unit targeting
  demonstrably resolves recipients, repeatably and not by chance. **This is the first proof that group
  targeting delivers at all**, and it closes the question that was blocking this suite.

  Still open: **how many messages arrive per send.** The group holds two members (`b7e4c431`, `1dc8e28b`)
  on the same number, so two would show both memberships resolving and one would suggest only the
  user-account-backed path does. Worth checking against a future send — the portal cannot answer it.
