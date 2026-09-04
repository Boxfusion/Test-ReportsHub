# Bugs — Contacts Directory (ADO suite 112756)

**Plan:** test-plans/case-management/contacts-directory.md
**ADO:** Plan 112718 › PD-CRM (112719) › Case Management (112720) › Contacts Directory (112756), cases #113275–#113288
**Environment:** QA — https://pd-dep-adminportal-qa.shesha.app
**Found:** 2026-09-02
**Build:** `Boxfusion.ServiceManagement/contacts-table v28`, `Boxfusion.Dep/create-contact v19`, `Boxfusion.ServiceManagement/contact-details2 v28`

## Final result — 9 passed, 1 failed, 4 blocked (Latest view mode)

Run of 2026-09-02 in **Latest** view mode. `switchToLatest()` is wired into the spec's `login()` and throws
if the switch does not take, so this run is confirmed against the latest form configurations rather than the
published ones.

| ADO | Case | Verdict |
|---|---|---|
| #113275 | Contact can be created | ✅ PASSED (Email/Mobile/Office not enterable — BUG-301) |
| #113276 | Contacts displayed in the directory | ✅ PASSED (no Mobile Number column — BUG-301) |
| #113277 | Contact can be searched | ✅ PASSED |
| #113278 | Contacts can be filtered | ✅ PASSED |
| #113279 | Contact details can be viewed | ✅ PASSED (no Email/Mobile/Office shown — BUG-301) |
| #113280 | Contact details can be edited | 🔴 **FAILED — BUG-303** (inline row edit; the details-screen route works) |
| #113281 | Contact can be deleted | ✅ PASSED (wording delta — BUG-302) |
| #113282 | Contact deletion can be cancelled | ✅ PASSED (wording delta — BUG-302) |
| #113283 | Contacts can be exported | ✅ PASSED (`Export.xlsx`, ~11 KB; file contents NOT VERIFIED) |
| #113284 | Mandatory contact fields validated | ✅ PASSED |
| #113285 | Phone/Office accept exactly 10 digits | ⏭️ **BLOCKED — BUG-301** |
| #113286 | Phone/Office reject invalid digit length | ⏭️ **BLOCKED — BUG-301** |
| #113287 | Email Address format validation | ⏭️ **BLOCKED — BUG-301** |
| #113288 | Invalid email address format rejected | ⏭️ **BLOCKED — BUG-301** |

### Live vs Latest — no verdict changed

The suite was first run in **Live** view mode by mistake (see `projects/PD-CRM/CLAUDE.md` — the view-mode
control is the `.ant-dropdown-trigger`, not the designer switch beside it). It was re-run in **Latest**:
Live gave 8 passed / 2 failed / 4 blocked, Latest gave the same verdicts with the same failure reasons.
The one improvement to 9 passed came from fixing a harness fault in TC-04, not from the mode.

The forms involved are the same version in both modes — `contacts-table v28`, `create-contact v19` — which
matches the documented behaviour that a form with no newer version stays `vNN LIVE` in Latest mode.

Three application defects. **Two of them block or fail ADO cases outright**, and one removes five cases'
worth of coverage from the suite.

---

## BUG-301 — [Application] The Contacts module has no UI for Email, Mobile Number or Office Number

**Type:** Application defect — missing functionality
**Severity:** High
**Status:** Open
**Blocks:** ADO #113285, #113286, #113287, #113288 — and partially #113275, #113276, #113279

### What is missing
The **Create New Contact** form renders a section heading `Contact Information` with **nothing beneath it**.
Its complete field list is:

`First Name*`, `Last Name*`, `Job Title`, `Description`, `Photo`, `Order Index*`, `Facility`
(plus a hidden `Flags`).

There is **no Email Address, no Mobile Number, no Office Number and no social media handle field.**

This was verified thoroughly before being raised — both collapsible panels were expanded, the modal body
was scrolled to force any lazy render, and every `label`, `input` and `textarea` was enumerated *including
hidden ones*. The fields do not exist.

Nor can they be supplied later:

| Screen | Exposes |
|---|---|
| Create New Contact | First/Last Name, Job Title, Description, Photo, Order Index, Facility |
| Contact details → Edit | Order Index, Job Title, Description, Facilities, Facebook / Instagram / LinkedIn / Twitter Handle |
| Inline row edit | Order Index, Job Title, Description, and the four social handles |

**Email, Mobile Number and Office Number appear on none of them.**

### Why it matters
The data plainly exists in the model and is in active use:
- The directory has an **Email Address column**, populated for real contacts.
- The directory has **Facebook / Insta / Twitter / Linked In Handle** columns.
- The details screen displays all four social handles.

So the system stores and displays contact information it gives no one any way to enter or correct. For a
*Contacts Directory* — whose entire purpose is reaching people — having no way to record a phone number or
an email address is a functional hole rather than a cosmetic one. Existing emails presumably arrived by
import or direct data entry, and cannot now be maintained through the portal.

There is also an asymmetry worth fixing in the same pass: the **social handles are editable after creation
but cannot be set at creation**, which is inconsistent on its own terms.

### Coverage lost
Four ADO cases cannot be executed at all, because the fields they exercise do not exist:

| ADO | Case |
|---|---|
| #113285 | Phone Number and Office Number accept exactly 10 digits |
| #113286 | Phone Number and Office Number reject invalid digit length |
| #113287 | Email Address format validation |
| #113288 | Invalid email address format is rejected |

They are reported **BLOCKED** (skipped with this reason) rather than failed, since there is nothing to
exercise. #113275 steps 9–10 are likewise not actionable, and #113276's expected "Mobile Number" column and
#113279's expected contact information are both absent.

### Ruled out: this is not an unpublished-draft artefact

The app renders **LIVE** (published) form configurations, so the obvious question is whether the fields
exist in a newer, unpublished version. Checked two independent ways on 2026-09-02 — they do not:

1. **Form-configuration API.** `GetByName?module=Boxfusion.Dep&name=create-contact&version=19` returns
   **401** (*"You are not authorized for this form"* — it exists, Admin cannot read its definition), while
   `version=20` returns **404** (*"form `Boxfusion.Dep\create-contact` not found"*). v19 is therefore the
   highest version that exists, and v19 is what the badge shows being served.
2. **Toggling the header mode switch.** `.sha-configurable-modeswitcher-switcher` flipped from
   `aria-checked=false` to `true`, followed by a reload. The form was byte-for-byte the same: still
   `create-contact v19 LIVE`, still 8 labels, **no fields gained**, Email/Mobile/Office still absent.
   The switch was restored to its original state afterwards.

⚠️ Caveat worth recording: that switch is the *Live Mode / Edit mode* designer toggle and the badge still
read `LIVE` after flipping it, so it does not appear to change which form **version** is served. If a
separate Live→Latest version selector exists (on the form badge's `edit` affordance, or under
Configurations), this should be re-confirmed against it. The form designer was deliberately not opened —
this is a shared QA environment and browsing a designer is how accidental configuration changes happen.

### Recommendation
Confirm with the BA whether these fields were dropped from the form by mistake or never built. Four test
cases are currently unrunnable and a fifth is partial, so the suite cannot be completed either way until
this is settled.

---

## BUG-303 — [Application] Inline row editing fails with HTTP 400, discards the change, and reports nothing

**Type:** Application defect
**Severity:** High
**Status:** Open
**Fails:** ADO #113280 (steps 3–7, the directory route)
**Confirmed:** 2026-09-02 by a dedicated verification pass

### Steps to reproduce
1. Open the Contacts Directory
2. Click the **Edit** icon on any contact row — the row switches to inline edit, and the row icons change
   from `search`/`edit`/`delete` to `search`/`save`/`close-circle`
3. Change the **Job Title** (the second input in the row)
4. Click the row **Save** icon
5. Reload the directory and look at the row again

### Expected (per ADO #113280)
> "The contact details are successfully updated… The updated information is displayed correctly… The
> updated information is retained and displayed correctly."

### Actual
- The request **fails**:
  ```
  400 PUT https://pd-dep-api-qa.shesha.app/api/dynamic/Boxfusion.Dep/DirectoryContact/Crud/Update
  ```
  (sent twice)
- **No error is shown to the user.** No toast, no field message, nothing.
- The row visually **collapses** to just `QAContact457406 Directory` — the Order Index, Job Title and
  Description columns render empty immediately after the failed save.
- After a reload the **original value is back**: `… 99 Before Edit A …`. The edit is silently lost.

Verified with the field mapping confirmed first, so this is not a case of typing into the wrong control:
the row's edit-mode inputs are `[0]` Order Index, `[1]` Job Title, `[2]` Description, `[3]`–`[6]` the social
handles, and index 1 held `Before Edit A` before the change and accepted `Inline40006` after it.

### Why it matters
A user edits a contact, sees no error, and believes the change saved. It did not. The collapsed row even
suggests something *did* happen. Silent data loss with a misleading UI is worse than an outright failure,
because nothing prompts the user to retry.

### Note
The **other** edit route in the same ADO case works: from the contact details screen, `Edit` →
`Save` persists correctly (that is #113280 steps 8–12, and it passes). So the defect is specific to the
inline row-edit path, and the details-screen path is a working workaround in the meantime.

⚠️ The 400 response body was not captured; it would identify which field the API is rejecting. Worth
getting from the dev team, since the payload for the inline path likely omits a field the endpoint requires.

---

## BUG-302 — [Application] The delete confirmation prompt is ungrammatical

**Type:** Application defect (cosmetic)
**Severity:** Low
**Status:** Open
**Affects:** ADO #113281, #113282

ADO quotes the prompt as:

```
Are you sure you want to delete this item?
```

The application renders:

```
Are you sure want to delete this item?
```

— missing the word **"you"**. `Cancel` and `OK` match ADO. Assertions were written to match the substance
rather than the exact string, so both cases still pass; a verbatim assertion would fail them.

This is the same family as **BUG-202** in Case Lifecycle, where the Close confirmation reads *"close case?"*
instead of *"close the case?"* depending on where it is invoked. Worth fixing the confirmation strings as a
set rather than one at a time.

---

## Observations (not defects)

- **`Order Index` is pre-populated with `0`** on a new contact form. ADO #113284 asks for it to be "left
  blank", which is impossible without clearing the default — the test clears it explicitly. Because it ships
  with a valid value, that field's mandatory validation would never fire in normal use, so the requirement
  is effectively unenforced. Worth confirming the default is intended.
- **Mandatory-field validation works correctly** for First Name, Last Name and Order Index once genuinely
  blank — `This field is required` against each, and the form stays open.
- **Export works.** `Export.xlsx`, 11,068 bytes. The file's record-by-record contents were not verified
  (that needs a spreadsheet reader), so that half of #113283 is reported NOT VERIFIED.
- **Search and filter both work.** Search narrows 66 → 1 on a name. The filter is a two-step control —
  `Filter by` chooses a *column* (`Name`, `Order Index`, `Job Title`, `Site`, `Email Address`,
  `Description`, `Flags`, and the social handles), then a value control appears for it — and filtering
  `Name` narrowed 69 → 1 correctly.
- **The row "magnifying glass"** ADO #113279 refers to is the icon whose accessible label is `search`; it
  opens `contact-details2`. No deviation.

## Not covered by this suite

- **The `sliders` toolbar icon** (column chooser) is untested; no ADO case refers to it.
- **The `Photo` upload** on the create form is never exercised by any ADO case, though the details screen
  shows existing contacts do have pictures.
- **The `Facility` / `Site` association** is only "selected where applicable" in #113275 — no case verifies
  filtering or grouping contacts by facility.
- **Contact uniqueness.** Nothing checks whether two contacts can share a name, or what `Order Index`
  collisions do to the directory ordering.

## Test data

Contacts created by this suite are named `QAContact<stamp> Directory`. TC-07 deletes its own; the others
remain and can be removed with the row Delete icon. **The directory holds 66 real contacts, several of them
actual colleagues — no pre-existing contact was edited or deleted at any point.**
