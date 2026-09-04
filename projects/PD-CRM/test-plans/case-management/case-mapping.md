# Case Mapping — ADO suite 113658

**Project:** PD-CRM (Lesedi Service Management / CRM Admin Portal)
**ADO:** plan 112718 › suite 113658, cases #113659–#113666 (8 cases, all state `Design`, priority 2)
**Screen:** `/dynamic/Boxfusion.ServiceManagement/Spartial_Map` (form `Spartial_Map v40`)
**Map engine:** **Leaflet** — pins are real DOM (`.leaflet-marker-icon`), not a canvas, so they can be
addressed directly. 56 pins on an unfiltered load.

This suite is **entirely read-only.** It creates, edits and deletes nothing; it only reads the map and
drives its filters.

---

## How the screen actually works (captured live 2026-09-04)

**Filters — five `.ant-select` controls plus a date picker, in this order.** Their captions are rendered as
**plain text, not `<label>`**, so they cannot be addressed by label (the `customer-details-v1` trap again).
They are addressed positionally and each one's identity is **verified by its own options** before use:

| # | Filter | Options |
|---|---|---|
| 0 | Channel | Mobile App, Call Centre, Web, Walkin, Telephone, SMS, Email, Post, In Facility Tablets, Whatsapp |
| 1 | Status | New, In Progress, Closed, Cancelled, Merged, Assigned, Pick Up |
| 2 | Priority | High, Medium, Low, Urgent |
| 3 | Category | Electrical, Water, Roads, Libraries, StormWater, EnvironmentalHealth, Fire, PublicSafety, WasteManagement, Clinics |
| 4 | Case Types | 10 types spanning every category |
| — | Reported Date | `.ant-picker` |

**The map data call is the ground truth for "the filter was applied":**

```
GET /api/services/app/Entities/GetAll?entityType=SM.Case
      &properties=id longitude latitude&maxResultCount=100&filter=<json-logic>
```

Choosing `Channel = Mobile App` re-issues it as
`filter={"and":[{"==":[{"var":"reportedByChannel"},1]}]}`. Every filter case therefore asserts **the
outgoing request's filter clause**, which is precise, rather than eyeballing pin counts (see below).

**A pin's case information is an `.ant-popover`, shown on hover.** It carries Reference, Status,
Recieved *(sic)*, Address, Description and a Close button. It responds to a **real mouse move** onto the
pin's centre — `hover({force:true})` does not raise it, and the popover is **not** a `.leaflet-popup`,
`.ant-tooltip` or modal. Looking for those three is why a first pass wrongly concluded "hover shows
nothing".

---

## Deviations from the ADO text

1. **There is no "Apply" control.** #113660–#113664 each end with *"Apply the filter"*, and #113665 implies
   one. Selecting a value applies it immediately and re-queries the map. The Apply steps are satisfied by
   the selection itself and reported as such — not a defect, but the cases describe a button that does not
   exist.
2. **"The map refreshes and displays only cases with the selected X" is not directly assertable**, because
   the map fetches **at most 100 cases** (`maxResultCount=100`) and only those with coordinates become
   pins. Filtering to `Mobile App` took the pin count **56 → 86**: the unfiltered view is *not* a superset
   of a filtered one, so "fewer pins" is an invalid expectation. Each case instead asserts that the
   correct filter clause was sent and that the map re-rendered. Raised as **QUESTION-701** — the 100-case
   cap is a real limitation of the screen and the BA should confirm it is intended.

---

## Preconditions
- [ ] App reachable, `Admin` / `P@ssword1` authenticates
- [ ] View mode switched **Live → Latest** after login (`switchToLatest()`, throws if it fails)
- [ ] The map renders at least one pin (confirmed: 56 unfiltered)

---

## Test Cases

### TC-01 (#113659): Verify Logged Cases Are Displayed on the Map
- **Type:** Read-only
- **Steps:** log in → navigate to Case Mapping → review the map → select a case pin
- **Expected (ADO):** "Cases with valid locations are displayed as pins on the map… The selected case is highlighted and its case information is displayed"
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the Case Mapping screen renders the Leaflet map
  - [ ] ASSERT (BLOCKING) at least one `.leaflet-marker-icon` pin is displayed
  - [ ] ASSERT the map issued its case query with `properties=id longitude latitude`
  - [ ] ASSERT selecting a pin displays that case's information popover

### TC-02 (#113660): Verify Cases Can Be Filtered by Channel
- **Type:** Read-only
- **Steps:** open the Channel filter → select a Channel → (applies immediately, Deviation 1)
- **Assertions:**
  - [ ] ASSERT the control offers the Channel options (identity guard)
  - [ ] ASSERT the selected Channel is displayed in the control
  - [ ] ASSERT (BLOCKING) the map re-queried with a `reportedByChannel` filter clause
  - [ ] ASSERT the map still renders after the refresh

### TC-03 (#113661): Verify Cases Can Be Filtered by Status
- **Type:** Read-only — as TC-02, for Status
- **Assertions:**
  - [ ] ASSERT the control offers the Status options (identity guard)
  - [ ] ASSERT the selected Status is displayed
  - [ ] ASSERT (BLOCKING) the map re-queried with a status filter clause

### TC-04 (#113662): Verify Cases Can Be Filtered by Priority
- **Type:** Read-only — as TC-02, for Priority
- **Assertions:**
  - [ ] ASSERT the control offers High/Medium/Low/Urgent (identity guard)
  - [ ] ASSERT the selected Priority is displayed
  - [ ] ASSERT (BLOCKING) the map re-queried with a priority filter clause

### TC-05 (#113663): Verify Cases Can Be Filtered by Category and Case Type
- **Type:** Read-only
- **Expected (ADO) step 4:** "The selected Category is applied **and the Case Type options are populated based on the selected Category**"
- **Assertions:**
  - [ ] ASSERT the Category control offers the category options
  - [ ] ASSERT the selected Category is displayed
  - [ ] ASSERT (BLOCKING) **the Case Types options narrow to the chosen Category** — recon on 2026-09-04
        found the identical 10 options before and after choosing `Electrical`, so this is expected to
        **fail as a defect (BUG-701)**, not as a script fault
  - [ ] ASSERT a Case Type can still be selected and applied

### TC-06 (#113664): Verify Cases Can Be Filtered by Reported Date
- **Type:** Read-only
- **Steps:** open the Reported Date picker → specify the **start** date + `OK` → specify the **end** date
  + `OK` → the completed range applies immediately
- **Note:** it is a **range** picker (`.ant-picker-range`, two inputs, with a time panel). Setting only the
  start leaves it pending: no query is issued and the value clears on blur — which looks like "the date
  filter does nothing" but is not. Click the picker's **input**, not its container (the container's centre
  is overlapped by the header). A complete range issues
  `filter={"and":[{"<=":["…",{"var":"reportedDate"},"…"]}]}`.
- **Assertions:**
  - [ ] ASSERT the date picker is displayed
  - [ ] ASSERT both the start and end dates are shown in the control
  - [ ] ASSERT (BLOCKING) the map re-queried with a `reportedDate` filter clause

### TC-07 (#113665): Verify Multiple Case Mapping Filters Can Be Applied
- **Type:** Read-only
- **Steps:** select Channel, then Status, then Priority, then Category + Case Type, then a date
- **Assertions:**
  - [ ] ASSERT each selection is displayed in its own control after the next is made (none resets another)
  - [ ] ASSERT (BLOCKING) the final map query carries **all** the applied clauses together
  - [ ] ASSERT the map still renders

### TC-08 (#113666): Verify Case Details Are Displayed When a Case Location Is Hovered Over or Selected
- **Type:** Read-only
- **Steps:** hover a case location icon → review the dialog
- **Expected (ADO):** "The dialog displays the correct Reference, Status, Received Date, Address, and Description"
- **Assertions:**
  - [ ] ASSERT (BLOCKING) hovering a pin displays the case information popover
  - [ ] ASSERT it shows a `REF…` Reference
  - [ ] ASSERT it shows Status, Received date, Address and Description
  - [ ] ASSERT the popover's reference matches a real case
  - [ ] NOTE the label is misspelled **"Recieved"** — logged as BUG-702 (cosmetic)
