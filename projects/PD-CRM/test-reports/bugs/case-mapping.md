# Bugs — Case Mapping (ADO suite 113658)

**Plan:** test-plans/case-management/case-mapping.md
**ADO:** Plan 112718 › PD-CRM (112719) › Case Management (112720) › Case Mapping (113658), cases #113659–#113666
**Environment:** QA — https://pd-dep-adminportal-qa.shesha.app
**Found:** 2026-09-04
**Build:** `Boxfusion.ServiceManagement/Spartial_Map v40` (Latest view mode)

This suite is **entirely read-only** — it creates, edits and deletes nothing.

## Final result — 7 passed, 1 failed

Run of 2026-09-04 (`test-reports/2026-09-04/case-mapping.md`, 3.9 min), in **Latest** view mode.

| ADO | Case | Verdict |
|---|---|---|
| #113659 | Logged cases displayed on the map | ✅ PASSED |
| #113660 | Filter by Channel | ✅ PASSED |
| #113661 | Filter by Status | ✅ PASSED |
| #113662 | Filter by Priority | ✅ PASSED |
| #113663 | Filter by Category and Case Type | 🔴 **FAILED — BUG-701** |
| #113664 | Filter by Reported Date | ✅ PASSED |
| #113665 | Multiple filters applied together | ✅ PASSED |
| #113666 | Case details on hover | ✅ PASSED |

**One defect, and the screen is otherwise sound.** Every filter sends a correct clause, the filters compose
properly when combined, and the pin popover carries all five fields #113666 requires. The single failure is
the Category → Case Type cascade.

---

## BUG-701 — [Application] Case Type options are not filtered by the selected Category

**Type:** Application defect — cascading filter not applied
**Severity:** Medium
**ADO:** fails #113663 step 4

**What happens.** ADO #113663 step 4 requires that selecting a Category means *"the Case Type options are
populated based on the selected Category"*. They are not. The Case Types dropdown offers the **identical
ten options** before and after a Category is chosen:

```
BEFORE (no Category):   Air Pollution Complaint · Area Power Failure · Burst Pipe ·
                        Complete Water Outage · Damaged Road Surface · Fire Hazard Inspection Request ·
                        Food Premises Hygiene Complaint · Landing Books · Low Water Pressure ·
                        Street Light Not Working
AFTER (Category = Electrical):   …byte-for-byte the same ten…
```

Those ten span several categories — *Air Pollution Complaint* is Environmental Health, *Burst Pipe* is
Water, *Damaged Road Surface* is Roads. With `Electrical` chosen, only electrical types should remain.

The whole option list is read from the dropdown, so this is not a locator artefact. The Category filter
*itself* works — it re-queries the map with `{"==":[{"var":"category"},1]}`.

**Root cause, confirmed 2026-09-04.** Choosing a Category *does* trigger a fresh case-type fetch — but the
request carries **no filter**:

```
GET Entities/GetAll?entityType=…CaseTypes.CaseType&properties=id name&quickSearch=&filter=&maxResultCount=10
                                                                                  ↑ empty
```

And the data fully supports filtering — `CaseType` carries a populated `category`:

| Category | Case types that should appear |
|---|---|
| Electrical (1) | Area Power Failure · Street Light Not Working |
| Water (2) | Low Water Pressure · Burst Pipe · Complete Water Outage |
| Roads (3) | Damaged Road Surface |
| Libraries (4) | Landing Books |
| EnvironmentalHealth (6) | Air Pollution Complaint · Food Premises Hygiene Complaint |
| Fire (7) | Fire Hazard Inspection Request |

So choosing `Electrical` should leave **2** options, not 10. The cascade is wired but omits the category
constraint from the query — **a code fault, not missing reference data.**

⚠️ **Latent second issue in the same request: `maxResultCount=10`.** There are exactly 10 case types today,
so the cap is invisible. Add an eleventh and it will silently never appear in this dropdown.

**Steps to reproduce**
1. Log in as `Admin`, switch view mode to **Latest**
2. Navigate to **Case Mapping**
3. Open **Case Types** and note the options; close it
4. Choose **Category = Electrical**
5. Open **Case Types** again — the list is unchanged

**Expected:** Case Type options are limited to the chosen Category.
**Actual:** every case type is offered regardless of Category.

**Consequence:** a user can select a Category/Case Type pair that cannot match anything (e.g. `Electrical`
+ `Burst Pipe`), and the map will simply show nothing with no explanation.

---

## BUG-702 — [Application] The pin popover misspells "Received"

**Type:** Application defect — cosmetic
**Severity:** Low
**ADO:** noted against #113666

The case information popover labels the received date **"Recieved"**:

```
REF008/09/09/2024: Prepaid Meter
Reference    REF008/09/09/2024
Status       Cancelled
Recieved     09/09/2024        ← "Received"
Address      Alberton, South Africa
Description  dgrfdfgd
```

ADO #113666 calls the field "Received Date". The spec accepts either spelling so the case is judged on the
data being present rather than the typo, and the misspelling is logged here instead.

---

## QUESTION-701 — [For the BA] The map only ever plots 100 cases

**Type:** Open question — *not* logged as a defect
**ADO:** touches #113659–#113665

The map fetches its pins with a hard cap:

```
GET Entities/GetAll?entityType=SM.Case&properties=id longitude latitude&maxResultCount=100&filter=…
```

Two consequences worth confirming as intended:

1. **The unfiltered map is not a superset of a filtered one.** Filtering by `Channel = Mobile App` took the
   pin count **56 → 86**, because a different hundred cases came back and more of them had coordinates.
   So "the map displays only cases with the selected X" cannot be judged by pin count, and a user cannot
   read pin counts as case volumes.
2. **With 1,600+ cases in the system, the map can never show more than 100.** Whether the map is meant to
   be a complete operational picture or an indicative sample is a product decision.

Because of point 1, every filter case asserts the **filter clause actually sent to the API** rather than
counting pins. Those clauses are correct in all cases tested:

| Filter | Clause sent |
|---|---|
| Channel | `{"==":[{"var":"reportedByChannel"},2]}` |
| Status | `{"==":[{"var":"status"},1]}` |
| Priority | `{"==":[{"var":"priority"},1]}` |
| Category | `{"==":[{"var":"category"},1]}` |
| Reported Date | `{"<=":["2026-09-06T00:00:00.000Z",{"var":"reportedDate"},"2026-09-21T00:00:00.000Z"]}` |
| All combined | all four clauses in one `and` — filters compose correctly |

---

## Observations — not defects

- **There is no "Apply" control.** #113660–#113664 each end with *"Apply the filter"*; selecting a value
  applies it immediately and re-queries the map. The cases describe a button that does not exist.
- **Filters compose correctly.** Applying Channel, then Status, then Priority, then Category leaves all
  four set and sends all four clauses together — none resets another (#113665 passes).

## Repairs made during authoring — spec faults, not application faults

Recorded so they are not later mistaken for build regressions:

| Symptom | Actual cause |
|---|---|
| "Hovering a pin shows nothing" | the popover is an **`.ant-popover`** raised only by a **real mouse move** — not a `.leaflet-popup`, `.ant-tooltip` or modal, and `hover({force:true})` does not raise it |
| "The Reported Date filter never applies" | it is a **range** picker; only the start was being set, so it stayed pending and cleared on blur |
| Date picker click never landed | the `.ant-picker-range` **container** is overlapped by the header — click its `input` |

Both of the first two looked like application defects and neither was. Checking before logging is the
#113356 lesson, and it applied twice more here.
