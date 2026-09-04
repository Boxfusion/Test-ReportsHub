# Bugs — Facilities (ADO suite 113290)

**Plan:** test-plans/case-management/facilities.md
**ADO:** Plan 112718 › PD-CRM (112719) › Case Management (112720) › Facilities (113290), cases #113291–#113298
**Environment:** QA — https://pd-dep-adminportal-qa.shesha.app
**Found:** 2026-09-03
**Build:** `Boxfusion.Dep/facilities-table v38` (Latest view mode)

## Final result — 5 passed, 3 failed

Single-pass run of 2026-09-03 17:21 UTC (`test-reports/2026-09-03/facilities.md`, 611.1s), in **Latest**
view mode — `switchToLatest()` is wired into the spec's `login()` and throws if the switch does not take.
Every failing case was **retried once and failed identically**, so none of these are flaky.

| ADO | Case | Verdict |
|---|---|---|
| #113291 | Site can be created | 🔴 **FAILED — BUG-401** (the Site *is* created; the Geo/GIS step is not) |
| #113292 | Site creation can be cancelled | ✅ PASSED |
| #113293 | Mandatory site fields validated | ✅ PASSED |
| #113294 | Site Type can be selected | ✅ PASSED |
| #113295 | Region can be selected | 🔴 **FAILED — BUG-402** |
| #113296 | Contact Number / Email accept valid formats | ✅ PASSED |
| #113297 | Contact Number / Email reject invalid formats | 🔴 **FAILED — BUG-401** (the validation itself passes) |
| #113298 | Site details can be viewed | ✅ PASSED |

**All three failures are the ADO-prescribed expectation, not a collapse of the case.** Each failing
assertion is `expect.soft`, so execution continued and the rest of every case was exercised and passed:
#113291 still created a Site that appeared in the list, #113295 still created a Site with the Region it was
given, and #113297's contact-number and email rejection all behaved correctly. The suite is therefore
reporting three specific, isolated defects rather than three broken screens.

⚠️ **Despite the suite name, ADO 113290 is entirely about the Add Site form.** It does not cover editing or
deleting a Site, list pagination or filtering, the toolbar **Export** action, or duplicate-name handling.
None of those are claimed as coverage.

---

## BUG-401 — [Application] The Geo/GIS address lookup is dead on the Add Site form (wrong Maps API key)

**Type:** Application defect — configuration
**Severity:** High
**Status:** Open
**Fails:** ADO #113291 (steps 5–6), #113297 (step 4)

### Steps to reproduce
1. Facilities → **Add Site**
2. Type any location into the **Address** field (placeholder `Search places`)
3. Wait for the Geo/GIS suggestions

### Expected (per ADO #113291)
> "TYPE a location in the Address search field… SELECT the required location from the returned Geo/GIS
> results" — with Latitude and Longitude autopopulating from the selection.

### Actual
**No suggestions are ever returned**, for any input. Latitude and Longitude never autopopulate.

### Root cause — identified, not guessed
The Add Site form loads Google Maps with API key `AIzaSyAQv3UvXzYNUlwB-0LCuS7toLdl_z1j2l8`, which is **not
authorised for this domain**. The browser console raises:

```
RefererNotAllowedMapError
  https://pd-dep-adminportal-qa.shesha.app/dynamic/Boxfusion.Dep/facilities-table
```

and **zero** `AutocompletionService.GetPredictionsJson` requests are made — the lookup never reaches Google
at all.

**The control comparison is the important part of this ticket:** the **Create Case** form in the same
application, on the same domain, loads a *different* key (`AIzaSyDEss2…Zqlnk`) and **its address lookup
works**. That isolates the fault to the Facilities form's key rather than to the environment, the network,
or Google-side quota. The fix is a referrer-authorisation (or key-replacement) change on the Facilities
form's key, not application code.

### Not a weak search term
The first run searched `Heidelberg` alone, which invited the objection that the term was too vague. The run
was repeated with a **full street address** — `1 Louw Street, Heidelberg, 1441, Gauteng, South Africa`, the
Lesedi Local Municipality civic address — and the result was identical:

```
geo lookup for "1 Louw Street, Heidelberg, 1441, Gauteng, South Africa": 0 suggestion(s)
```

recorded **four times** (#113291 and #113297, each on its first attempt and its retry). The empty result
cannot be attributed to the query.

### Why it matters
Address capture is the point of a Facilities register — a Site with no reliable coordinates is not much use
to a field-service dispatch. Right now Latitude and Longitude can only be entered by someone who already
knows them, which is not a task a normal user can perform.

### Test workaround in use
Latitude and Longitude are **separate required text inputs**, so the plan types them by hand and the
autopopulate assertions are made non-blocking. That keeps the rest of both cases executable; it is a harness
workaround and not a suggestion for users.

---

## BUG-402 — [Application] No valid Region exists in the Region dropdown

**Type:** Application defect — reference data
**Severity:** High
**Status:** Open
**Fails:** ADO #113295

### Steps to reproduce
1. Facilities → **Add Site**
2. Open the **Region** dropdown (`partOf`, a required field)

### Expected (per ADO #113295)
> "SELECT a valid region… The selected Region is displayed correctly against the Site."

### Actual
The dropdown offers exactly four entries, and **not one of them is a valid region**:

```
(Obsolete) Dassenhoek
(Obsolete) Merebank
(Obsolete) Welbedaght (SW)
1
```

Three are explicitly marked `(Obsolete)`; the fourth is named `1`.

### The downstream damage is visible in the product
This is not a cosmetic reference-data gap — it reaches the records users see. **Existing** Sites in the
Facilities list display real region names such as `Amanzimtoti (SS)`, but a Site created through the form
today can only be given one of the four above. A row created by this run reads:

```
QA-AUTO Site 693794 | Hospital | 1 | …
```

The Region column literally displays `1`. Because Region is mandatory, **every Site created through this
form is being given a junk region**, and there is no way for a user to avoid it.

### Recommendation
The valid regions clearly exist in the system — they are rendered against existing Sites. This looks like
the dropdown is bound to the wrong list, or filtered such that only obsolete entries survive. Worth
checking whether the `1` entry is real reference data or a stray test record that should be removed.

---

## BUG-403 — [Application] The Add Site form renders three Latitude fields and no matching Longitude

**Type:** Application defect
**Severity:** Low
**Status:** Open
**Affects:** the Add Site form generally; fails no case on its own

The form renders **three** fields labelled Latitude:

| Label | Bound to | Required |
|---|---|---|
| `Latitude` | `latitude` | no |
| `Latitude` | `latitude` | no |
| `Latitude *` | `address_latitude` | **yes** |

There is **no optional `Longitude` counterpart** to the two optional Latitude fields — only the required
`address_longitude`. So the form asks for latitude three times and longitude once.

Only `address_latitude` / `address_longitude` are populated by the plan; the orphan `latitude` field is
asserted to remain empty, so the duplication is documented rather than silently worked around. Users have no
way to tell which Latitude matters, and two of the three do nothing.

---

## What the build gets RIGHT — do not raise these

Recorded deliberately, because they were checked closely and are correct:

- **#113293 mandatory-field validation matches the ADO text verbatim**, including
  `Please enter a valid cellphone number` and `Please enter a valid email address`.
- **#113297's phone and email rejection all works** — a short value gives
  `Contact Number must be at least 10 characters`, and the form correctly refuses to create the Site while
  invalid values remain. That case fails *only* on the Geo/GIS step (BUG-401).
- **#113294's Site Type list is exactly** `Hospital`, `Clinics`, `District`, `Region`, and the selection is
  displayed correctly against the created Site.
- **#113298's details view renders all nine prescribed fields.**

## Test-harness notes (not defects — recorded so they aren't re-raised)

- **The Facilities list is a div grid**, not an HTML table: no `<table>`, `<tr>` or `<th>` in the DOM. Rows
  are `[role=row]` (index 0 is the header), action cells are `.sha-crud-cell`. The Cases-list locator
  `label.sha-datalist-component-item-checkbox` matches nothing here.
- **There is no eye/View icon anywhere on this screen** — only `anticon-edit`. ADO #113298 says "Click the
  View icon", so details are opened through the row edit affordance; the spec logs which one it used. Worth
  a wording correction on the ADO case rather than a build change.
- An earlier TC-04 failure was a **spec bug of mine, not a defect** — `chooseOption` was called on an
  ant-select value that was already selected, which resolves the option but renders it `aria-selected` and
  non-visible, so `click()` retried to timeout. The helper now no-ops when the select already shows the
  label, and #113294 passes.

## Test data

Sites created by this suite are named `QA-AUTO Site <stamp>`; this form has no Description field to tag
instead. Four cases create a Site (#113291, #113294, #113295, #113296), so each full run adds up to four
records to a list that already holds ~4,699. They remain in QA. **No pre-existing Site was edited or
deleted at any point** — #113298 is read-only.
