# Bugs — Customers (ADO suite 113324)

**Plan:** test-plans/case-management/customers.md
**ADO:** Plan 112718 › PD-CRM (112719) › Case Management (112720) › Customers (113324), cases #113348–#113358
**Environment:** QA — https://pd-dep-adminportal-qa.shesha.app
**Found:** 2026-09-03
**Build:** `Boxfusion.Dep/table-customers v21`, `Boxfusion.Dep/customer-details-v1 v2`,
`Boxfusion.Dep/customer-casesLatest v12` (Latest view mode)

## Final result — 8 passed, 3 failed

Run of 2026-09-03 (`test-reports/2026-09-03/customers.md`, 7.3 min), in **Latest** view mode —
`switchToLatest()` is wired into the spec's `login()` and throws if the switch does not take.

| ADO | Case | Verdict |
|---|---|---|
| #113348 | Customers displayed in the list | ✅ PASSED |
| #113349 | Customer logged cases displayed | ✅ PASSED |
| #113350 | Case can be accessed from Logged Cases | 🔴 **FAILED — BUG-502** |
| #113351 | Customer interactions displayed | ✅ PASSED |
| #113352 | Customer details can be edited | ✅ PASSED |
| #113353 | Customer can be deleted | 🔴 **FAILED — BUG-501** (the deletion itself works) |
| #113354 | Customer deletion can be cancelled | 🔴 **FAILED — BUG-501** (the cancel itself works) |
| #113355 | Customers can be searched | ✅ PASSED |
| #113356 | Customers can be filtered | ✅ PASSED |
| #113357 | Customers can be exported | ✅ PASSED (file contents NOT VERIFIED) |
| #113358 | Search returns no results for invalid criteria | ✅ PASSED |

⚠️ **Reconciliation — the report on disk reads 7 passed / 4 failed.** In that pass **#113348 failed on an
environmental login timeout**, not on the build: `getByPlaceholder('Username')` never appeared on the login
page. It passed in the two preceding runs and again in an isolated re-run
(`customers--TC01-rerun.md`), so the true tally is **8 / 3**. The same blip hit Facilities twice the same
evening; `login()` now retries the navigation up to three times so it stops costing false failures.

**Only two defects, and neither breaks the screen's core job.** #113353 and #113354 fail *solely* on the
confirmation wording — the delete genuinely deleted (`rows matching "QAAuto188871" after delete: 0`) and the
cancel genuinely cancelled. Read the two failures as one cosmetic defect counted twice, plus one real
functional gap in #113350.

---

## BUG-502 — [Application] A case cannot be opened from a customer's Logged Cases tab

**Type:** Application defect — missing/hidden functionality
**Severity:** High
**Status:** Open
**Fails:** ADO #113350 (steps 6–7)

### Steps to reproduce
1. Customers → search a customer with a logged case (e.g. `QAAuto604351`)
2. Click the row's magnifying glass to open the customer details panel
3. Select the **Logged Cases** tab — the linked case card is displayed correctly
4. Click the case card

### Expected (per ADO #113350)
> "Select a case from the Logged Cases list… The selected case opens the All Service Request landing
> page… The selected case is displayed and can be accessed from the All Service Request landing page."

### Actual
**Nothing happens.** The card is inert and the URL never changes from
`/dynamic/Boxfusion.Dep/customer-details-v1?id=…`.

### Evidence — three independent checks, all agreeing
This was deliberately over-verified, because "element not found" on these Shesha forms usually means a
test fault rather than a defect. It is not one here:

1. **The card carries no affordance.** The Logged Cases pane contains **no `<a>` element at all**. Every
   element holding the case reference — from the innermost `<strong>` out through
   `.ant-form-item-control-input-content` — reports `cursor: auto` and `onclick: false`.
2. **Clicking changes nothing.** A forced click on the card leaves the URL identical and adds no
   selection marker to the datalist (`[class*="selected"]` returns only unrelated menu/icon elements).
3. **The `Open` button exists but is permanently hidden.** The datalist's toolbar does contain an
   `Open` button, but its form-item carries `ant-form-item-hidden`. The run log captures its state on
   either side of the click:
   ```
   "Open" button before click: [{"visible":false,"formItemHidden":true}]
   "Open" button after click:  [{"visible":false,"formItemHidden":true}]
   ```
   So the intended affordance was built and then hidden in the form configuration — this looks like a
   configuration regression rather than unimplemented work, which should make it cheap to fix.

### Why it matters
The Logged Cases tab presents itself as a navigation surface — it renders each case as a card with a
reference, status, priority and assignee. A user will click it. Nothing happens, with no feedback, so the
tab is read-only in practice while looking interactive.

### Workaround
The case remains reachable from the Cases list by its reference number. No data is lost or unreachable;
what is missing is the shortcut ADO prescribes.

### Recommendation
Check whether the `Open` toolbar button's visibility is bound to a condition (a selected-row rule that
never becomes true), or was hidden deliberately. Confirm with the BA whether the card itself is supposed
to be clickable, since that is what #113350 step 6 describes.

---

## BUG-501 — [Application] The delete confirmation does not match its specification

**Type:** Application defect (cosmetic)
**Severity:** Low
**Status:** Open
**Fails:** ADO #113353, #113354 — both cases, on this point alone

### Expected (quoted identically in both ADO cases)
```
Are you sure you want to delete this item?
```
> "…and **Cancel** and **OK** buttons."

### Actual
```
Delete User
are you sure you want to delete this user?
[ no ]  [ yes ]
```

### Three separate deltas
| # | Expected | Actual |
|---|---|---|
| 1 | the record is an *item* (it is a **Customer**) | the dialog calls it a **User**, and is titled `Delete User` |
| 2 | `Are you sure…` — sentence case | `are you sure…` — lowercase |
| 3 | `Cancel` / `OK` | `no` / `yes`, both lowercase |

Delta 1 is the one worth arguing: this screen manages **Customers**, and calling them *Users* invites a
genuine misread, since the portal also has real user accounts. Deltas 2 and 3 are inconsistent with the
rest of the application — the Contacts module's equivalent dialog uses `Cancel` / `OK`.

### Assessment
**The underlying behaviour is correct.** Confirming deletes the customer and it disappears from the list;
cancelling closes the dialog and leaves the customer in place. Both were verified. Only the copy is wrong,
so this is a string fix.

### 🔗 Raise this as one ticket with BUG-302 and BUG-202
This is now the **third** confirmation dialog in PD-CRM whose copy drifts from its specification, each
differently:

| Bug | Module | Renders |
|---|---|---|
| **BUG-501** | Customers | `Delete User / are you sure you want to delete this user?` + `no`/`yes` |
| **BUG-302** | Contacts | `Are you sure want to delete this item?` — the word *you* is missing |
| **BUG-202** | Case Lifecycle | `close case?` instead of `close the case?` |

Three tickets for three strings will be deprioritised individually. One ticket — "confirmation dialog copy
is inconsistent and ungrammatical across modules" — is a single sweep for a developer and much likelier to
get done.

---

## What the build gets RIGHT — do not raise these

Checked closely and correct:

- **Deletion works end to end.** The customer is removed and a subsequent search returns nothing.
- **Cancelling a deletion is safe** — the dialog closes and the customer is still listed.
- **Editing works,** including persistence: a phone change is written, shown on the details panel, and
  reflected in the Customers list row.
- **Search is genuinely filtered, not just re-ordered** — 785 → 1 on a customer name, and *every* returned
  row matches the term (asserted across all rows, not merely the first).
- **Unmatched search is handled properly** — zero rows and the pager reads `0 items found`.
- **The filter works** — `Filter by` offers `First Name`, `Last Name`, `Mobile Number`, `Email Address`,
  `Gender`; applying `First Name contains QAAuto` narrowed 785 → 37, and every returned row matched.
- **Interactions genuinely correspond to the customer's cases.** Asserted rather than assumed: the
  interaction's `Reference No` was matched against the references in the Logged Cases tab.

## Test-harness notes (not defects — recorded so they aren't re-raised)

- ⚠️ **`customer-details-v1` has NO `label` ↔ `input` association whatsoever.** The captions
  (`Customer Name`, `Phone Number`, `Email Address` …) are plain text, not `<label>` elements in the
  `ant-form-item`. The Facilities/Create-Case pattern `label[for="<id>"]` matches **nothing**. Fields are
  addressed **by their current value** instead — which doubles as the proof ADO #113352 step 4 wants
  ("the form is displayed with the existing information populated"). My first recon pass concluded the edit
  form had *no customer fields at all* and nearly filed it as a defect; it has thirteen.
- **The Customers list has no `.sha-crud-cell`**, unlike Facilities. Row actions are bare
  `anticon-search` / `anticon-edit` / `anticon-delete` icons.
- **There is no eye icon.** ADO's "View icon" is the magnifying glass (`anticon-search`), same as Facilities.
- **The details panel is a route, not a modal:** `/dynamic/Boxfusion.Dep/customer-details-v1?id=<guid>`.
- **The Filter control is a sidebar**, not a dropdown or popover: `Table Columns` → `Filter by`
  (`.columns-filter-selector`) → operator `Contains` → value box `placeholder="Filter <column>"` →
  `Apply`. An earlier version of TC-09 looked for a dropdown, found nothing, and **passed anyway** on
  assertions too weak to notice — it now asserts the list actually narrows.
- **#113352 is self-invalidating if it hardcodes its test data.** The case edits the same customer it
  selects deterministically, so each run changes the value the next run expects. It now reads the current
  phone from the row before editing, which makes the case idempotent.

## Test data

- **Anchor `QAAuto604351 Tester`** — has one logged case and one interaction; used read-only by
  #113348–#113351 so those cases stay reproducible. **Never mutated.**
- **Edited:** `QAAuto515671` — phone number changed by each #113352 run.
- **Deleted:** `QAAuto640484`, `QAAuto750890` (a retried run deleted two — a soft-failing case still
  triggers a retry, so #113353 now runs with `RETRIES=0`) and `QAAuto188871`.
- All targets are `QAAuto*` customers created by this project's own Case Creation runs. A guard,
  `assertSafeTarget()`, fails the case before any destructive step unless the target carries the `QAAuto`
  prefix and is not the anchor. **No real customer was edited or deleted at any point** — the list holds
  ~785, most of them genuine.
