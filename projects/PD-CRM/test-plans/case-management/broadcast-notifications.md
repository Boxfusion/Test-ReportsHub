# Broadcast Notifications — ADO suite 113517

**Project:** PD-CRM (Lesedi Service Management / CRM Admin Portal)
**ADO:** plan 112718 → suite 113517, cases #113519–#113528 (10 cases, all state `Design`, priority 2)
**Screen:** `/dynamic/Boxfusion.Dep/broad-cast-notificationstableView` (list, form `v42`)
**Create form:** `Boxfusion.Dep/broadcast-create v63` — a modal, buttons **Close** and **Publish**
**Details:** `/dynamic/Boxfusion.Dep/broad-cast-detailsView?id=<guid>`

---

## 🛑 Safety rule — this suite SENDS REAL NOTIFICATIONS

Publishing a broadcast dispatches it. The Target field offers **Global**, **Organisation Unit** and
**Site**; `Global` reaches every user of the system. **Every broadcast this suite publishes MUST target
`Organisation Unit` → `Auto Testing Group`.**

This is enforced in code, not by convention. `publishGuarded()` reads back both select values immediately
before clicking Publish and **throws** unless they are exactly `Organisation Unit` and `Auto Testing Group`.
No test calls `Publish` by any other path. A mis-selected target fails the test instead of notifying the
municipality.

The `Organisation Unit` select is **hidden until Target is set to `Organisation Unit`** — a useful property:
if the target were wrong, the group select would not be fillable at all.

**Auto Testing Group membership (verified 2026-09-04):** 2 members, `Nomfanelo Nhleko` (`b7e4c431`,
user 28) and `Lungile Nhleko` (`1dc8e28b`, user 271) — both on the same handset. A published SMS/push
broadcast should therefore produce **two** deliveries.

### Message volume
**SMS** is enabled **only in TC-01 and TC-08**, the two cases whose ADO text requires it. Every other case
needs a broadcast to *exist*, not to reach a phone, so its fixture publishes **push-only** — the handset
stays quiet and a ten-case run does not fire a dozen SMS at a real number.

Fixtures cannot simply have *both* options off: **BUG-602 — with neither `Send Push` nor `Send Sms`
checked, Publish does nothing at all.** The modal stays open, no record is written and **no validation
message is displayed**. Proven 2026-09-04 with a controlled pair — both-off produced no record, push-only
published normally. This is what made the first full run fail at TC-02.

### Data isolation
Broadcasts are never edited, withdrawn or deleted from the 499 pre-existing records. TC-03, TC-04, TC-05,
TC-06 and TC-07 each **create their own fixture first** and act only on that. Fixture titles carry the
`QA-BC-<6-digit stamp>` prefix and `assertSafeTarget()` refuses to act on any row lacking it.

---

## Preconditions
- [ ] App reachable, `Admin` / `P@ssword1` authenticates
- [ ] View mode switched **Live → Latest** after login (`switchToLatest()`, throws if it fails)
- [ ] `Auto Testing Group` exists and is offered by the Organisation Unit select (confirmed: 17 groups)
- [ ] `Auto Testing Group` has ≥1 member, else a "sent" broadcast reaches nobody and delivery cannot be judged

---

## Deviations from the ADO text

The suite's own wording has four defects. Assertions follow the *observable* behaviour and each deviation is
reported rather than silently accommodated. Raised together as **BUG-601**.

1. **#113521 (Delete) steps 5–6 describe the wrong entity.** Step 5 expects *"The customer is successfully
   deleted from the Customers list"* and step 6 *"Search for the deleted customer"* — copy-pasted from the
   Customers suite (113324). Asserted against the **Broadcast Notifications** list instead.
2. **#113521 step 4 and step 5 contradict each other on button labels.** Step 4 promises a dialog with
   *"Cancel and OK"*; step 5 says *"Click **Yes**"*. Both cannot be true. The actual labels are asserted
   SOFT and reported, exactly as BUG-501 was handled for Customers.
3. **#113524's title is truncated** — *"erify Broadcast Notification Deletion Can Be Cancelled"*. Cosmetic,
   noted only.
4. **#113526 step 2 skips the create step.** It navigates to the list but expects *"The Add New Broadcast
   Notification form is displayed"*. The form only opens after **Create New Broadcast**, so that click is
   performed as part of step 2 and noted.
5. **#113525 step 2 has the same class of error** — navigating to the list is expected to display *"The
   Broadcast Details screen"*. Asserted against the list.

### Observed while authoring (not ADO defects)

- **The list renders the raw enum `OrganisationUnit`; the create form shows `Organisation Unit`.** Same
  value, two spellings on two screens. Cosmetic, but it means a list assertion must not use the form's
  label verbatim. Worth mentioning to the BA — every other Target value (`Global`, `Site`) is a single
  word, so the inconsistency only shows on this one.
- **List column order is `Message | Send Sms | Send Push | Title | Target | Valid From | Valid To |
  Withdrawal Date | Status`, preceded by the search and delete action cells.** Message comes *before*
  Title, which is the reverse of what the column headings suggest at a glance.
- **The create modal closes on `Escape`**, so a test that dismisses a dropdown that way destroys the form
  and then fails reading fields that no longer exist. Dropdowns are dismissed with `Tab` instead.
- **Row actions are search and delete only — there is no edit icon.** TC-04 therefore reaches the edit
  form via the details screen.

**Not verifiable from the portal:** whether a published broadcast is actually *delivered* to a handset. The
portal shows dispatch intent (`Send Sms` / `Send Push` columns), not delivery. TC-01 and TC-08 assert the
record state and report delivery as **NOT VERIFIED — confirm on the handset**, the same treatment
#112782 got in Case Lifecycle. This run is the first chance to learn whether Organisation-Unit targeting
resolves recipients at all.

---

## Test Cases

### TC-01 (#113519): Verify Broadcast Notification Can Be Created
- **Type:** Happy path / **MUTATES — publishes a real broadcast to Auto Testing Group (SMS + Push ON)**
- **Steps:**
  1. NAVIGATE to the portal, log in as `Admin`, switch to Latest
  2. NAVIGATE to Broadcast Notifications
  3. CLICK `Create New Broadcast` — the Add New Broadcast Notification modal opens
  4. TYPE a unique title `QA-BC-<stamp> Create`
  5. SELECT Target `Organisation Unit`, then Organisation Unit `Auto Testing Group`
  6. TYPE a message
  7. CHECK `Send Push` and `Send Sms`
  8. CLICK `Publish` — **via `publishGuarded()`**
- **Expected (ADO):** "The Broadcast Notification is successfully published and the notification is added to the Broadcast Notifications list."
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the create modal is displayed
  - [ ] ASSERT the Organisation Unit select is hidden before Target is chosen, and visible after
  - [ ] ASSERT (BLOCKING) Target reads `Organisation Unit` and the group reads `Auto Testing Group` before Publish
  - [ ] ASSERT the modal closes on publish
  - [ ] ASSERT (BLOCKING) the new title appears in the list
  - [ ] ASSERT its list row shows Target `Organisation Unit`, `Send Sms` = Yes, `Send Push` = Yes
  - [ ] REPORT delivery as NOT VERIFIED — confirm two messages on the handset

### TC-02 (#113520): Verify Broadcast Notification Details Can Be Viewed
- **Type:** Read-only (uses TC-01's broadcast, or creates a silent fixture if absent)
- **Steps:** 1–2 as TC-01, then locate the published broadcast, CLICK the row magnifying glass, review details
- **Expected (ADO):** "The notification details, including the configured title, target, message, delivery options, and any attachment, are displayed correctly"
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the row is found in the list
  - [ ] ASSERT the details route `broad-cast-detailsView?id=` opens
  - [ ] ASSERT the title, message and target shown match what was published
  - [ ] ASSERT the delivery options shown match what was published

### TC-03 (#113521): Verify Broadcast Notification Can Be Deleted
- **Type:** **DESTRUCTIVE — deletes its own fixture only**
- **Steps:** create a silent fixture `QA-BC-<stamp> Delete`, locate it, CLICK the row delete icon, confirm, search for it again
- **Expected (ADO):** *(states "customer" / "Customers list" — see Deviation 1)*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) `assertSafeTarget()` — the row title carries the `QA-BC-` prefix
  - [ ] ASSERT a confirmation dialog is displayed
  - [ ] ASSERT (SOFT) its wording/buttons match the ADO text — see Deviation 2
  - [ ] ASSERT (BLOCKING) after confirming, the fixture is absent from the Broadcast Notifications list
  - [ ] ASSERT the list total decreased by exactly 1

### TC-04 (#113522): Verify Broadcast Notification Can Be Edited
- **Type:** **MUTATES — edits its own fixture only**
- **Steps:** create a silent fixture `QA-BC-<stamp> Edit`, CLICK its edit affordance, update the title/message, save, re-open
- **Expected (ADO):** "The Broadcast Notification is successfully updated… The updated information is displayed correctly."
- **Assertions:**
  - [ ] ASSERT (BLOCKING) `assertSafeTarget()`
  - [ ] ASSERT the edit form opens **populated** with the existing values (ADO step 4)
  - [ ] ASSERT (BLOCKING) the updated value persists after save and re-open
  - [ ] ASSERT the target is still `Organisation Unit` / `Auto Testing Group` after the edit

### TC-05 (#113523): Verify Broadcast Notification Can Be Withdrawn
- **Type:** **MUTATES — withdraws its own fixture only**
- **Steps:** create a silent fixture `QA-BC-<stamp> Withdraw`, open its details, CLICK `Withdraw`, confirm `Yes`, review
- **Expected (ADO):** "The Withdrawal Date is populated and the notification reflects that it has been withdrawn."
- **Assertions:**
  - [ ] ASSERT (BLOCKING) `assertSafeTarget()`
  - [ ] ASSERT the Withdraw confirmation dialog is displayed with `No` / `Yes`
  - [ ] ASSERT (BLOCKING) after `Yes`, the Withdrawal Date is populated
  - [ ] ASSERT the record no longer reads `Active`

### TC-06 (#113524): Verify Broadcast Notification Deletion Can Be Cancelled
- **Type:** Non-destructive by design — proves Cancel does NOT delete
- **Steps:** create a silent fixture, CLICK its delete icon, CLICK `Cancel` on the dialog
- **Expected (ADO):** "The confirmation dialog closes and the Broadcast Notification is not deleted."
- **Assertions:**
  - [ ] ASSERT the confirmation dialog is displayed
  - [ ] ASSERT the dialog closes on Cancel
  - [ ] ASSERT (BLOCKING) the fixture is **still present** in the list
  - [ ] ASSERT the list total is unchanged

### TC-07 (#113525): Verify Broadcast Notification Withdrawal Can Be Cancelled
- **Type:** Non-destructive by design
- **Steps:** open the TC-06 fixture's details, CLICK `Withdraw`, CLICK `No`
- **Expected (ADO):** "The dialog closes and the Broadcast Notification is not withdrawn."
- **Assertions:**
  - [ ] ASSERT the Withdraw dialog is displayed with `No` / `Yes`
  - [ ] ASSERT the dialog closes on `No`
  - [ ] ASSERT (BLOCKING) the Withdrawal Date is still empty and the status is unchanged

### TC-08 (#113526): Verify Broadcast Notification Delivery Options Can Be Selected
- **Type:** Happy path / **MUTATES — publishes a real broadcast (SMS + Push ON)**
- **Steps:** open the create form (see Deviation 4), TYPE a title, SELECT the guarded target, CHECK `Send SMS`, CHECK `Send Push`, TYPE a message, PUBLISH
- **Expected (ADO):** "The Broadcast Notification is successfully published with the selected delivery options."
- **Assertions:**
  - [ ] ASSERT `Send Sms` reads checked after clicking it
  - [ ] ASSERT `Send Push` reads checked after clicking it
  - [ ] ASSERT (BLOCKING) the guarded target before Publish
  - [ ] ASSERT (BLOCKING) the published row shows `Send Sms` = Yes and `Send Push` = Yes
  - [ ] REPORT delivery as NOT VERIFIED — confirm on the handset

### TC-09 (#113527): Verify Broadcast Notifications Can Be Searched
- **Type:** Read-only
- **Steps:** TYPE a known title into the grid filter (`.sha-global-table-filter input`), execute, review
- **Expected (ADO):** "The Broadcast Notifications list is filtered according to the search criteria."
- **Assertions:**
  - [ ] ASSERT (BLOCKING) searching a known title narrows the list
  - [ ] ASSERT every returned row matches the search term
  - [ ] ASSERT a deliberate no-match term returns 0 rows
  - [ ] ASSERT clearing the search restores the original total

### TC-10 (#113528): Verify Broadcast Notifications Can Be Filtered
- **Type:** Read-only
- **Steps:** CLICK the filter icon — it opens an **inline right-hand sidebar**
  (`.sha-index-table-column-filters`), not a dropdown or modal — SELECT `Title` in the column picker
  (`.ant-select.columns-filter-selector`), TYPE a known value into `input[placeholder="Filter Title"]`,
  CLICK `Apply`, review, then `Clear`
- **Expected (ADO):** "Only Broadcast Notifications matching the selected criteria are displayed."
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the filter control opens
  - [ ] ASSERT applying a criterion changes the row set
  - [ ] ASSERT every visible row satisfies the criterion
  - [ ] If the control cannot be driven, report **BLOCKED** — never PASS on "a count exists"
