# PD-Dispatch — Administrative Functions Full CRUD (post-outage)

**Date:** 2026-07-13 (Mon)
**App:** PD-Dispatcher V2 Admin Portal (QA) — https://pd-dispatcher-v2-adminportal-qa.shesha.app
**Driver:** Live via Playwright MCP (headed), as **Admin**
**Scope:** Full create + edit CRUD on every admin entity after the outage (follow-up to the read-only smoke). All records use QA naming and reference our own QA records where possible.

---

## Summary

**11 of 12 entities: create + edit both green.** Incident Types is create-only (view-only by design). One real defect surfaced on **Agents** (silent create failure on duplicate mobile) — logged below; the agent was then created successfully with a unique mobile.

| # | Entity | Create | Edit | Record (QA) |
|---|---|---|---|---|
| 1 | Site Types | ✅ | ✅ | QA CRUD Test Clinic 0713 → …EDITED |
| 2 | Vehicle Types | ✅ | ✅ | QA CRUD Vehicle Type 0713 → …EDITED |
| 3 | Stations | ✅ | ✅ | QA CRUD Station 0713 → …EDITED |
| 4 | Points of Interest | ✅ | ✅ | QA CRUD POI 0713 → …EDITED |
| 5 | Devices | ✅ | ✅ | QA CRUD Device 0713 (Model → …EDITED) |
| 6 | Shifts | ✅ | ✅ | QA CRUD Shift 0713 (08:00–17:00) → …EDITED |
| 7 | Resources | ✅ | ✅ | QACRUD Resource0713 → QACRUDEdited |
| 8 | Crews | ✅ | ✅ | QACRUD-0713 → QACRUD-0713-EDITED |
| 9 | Vehicles | ✅ | ✅ | QA-CRUD-0713 (Capacity 4 → 6) |
| 10 | Agents | ✅ (see bug) | ✅ | QACRUD Agent0713 → Agent0713-EDITED |
| 11 | Shift Assignments | ✅ | ✅ | QA-TEST-001 / QACRUD-0713-EDITED crew, 13/07 → 14/07 |
| 12 | Incident Types | ✅ | — (view-only) | QA CRUD Incident Type 0713 (P3-Green) |

Reference chaining worked end-to-end: our new **Resource** was assignable to our new **Crew**, which was assignable (with its member as **Crew Leader**) to a new **Shift Assignment** — all our own QA records.

---

## Bug found — Agents: silent create failure on duplicate mobile number

**Severity:** Medium (data-integrity / UX — user believes a create succeeded when it failed)

**What happens:** Creating an Agent whose Mobile Number already exists on another user fails server-side, but the UI gives **no error** and closes the dialog as if it saved. The record is not created (grid count unchanged).

**Evidence (captured live):**
- `POST /api/v1/AgentsRoleAppointmentActions/RegisterAgent` → **HTTP 400**
- Response body: `"The specified mobile number is already in use by another user."`
- Console: `Failed to execute action 'shesha.common:Show Dialog', error: undefined` — the error-dialog handler itself throws, so the validation message never reaches the user; the create dialog just closes.

**Impact:** An admin creating an agent with a reused mobile number sees the dialog close (apparent success) but no agent is created, and no reason is shown. Reproduced twice (mobile 0818400598, already used by prior agents).

**Expected:** The validation error ("mobile number already in use") should be shown to the user and the dialog should stay open, as it does for inline required-field validation.

**Workaround / confirfmation:** Re-created with a **unique** mobile (0818400713) → `RegisterAgent` returned **200**, agent persisted (grid 10 → 11). So the create path works; only the duplicate-mobile error handling is broken.

**Note on mobile numbers:** Agent mobile numbers must be **unique** — this is why the standing "use 0818400598 everywhere" rule can't apply to a second agent. (This CRUD run is not an SMS test, so a unique number was used for the agent only.)

---

## Other observations

- **Vehicle Types** — the two checkboxes **Check List Required On Shift Start / End** are **required to be ticked**; leaving them unticked blocks save with "This field is required" (they are true booleans, not optional flags).
- **Detail/edit forms are field subsets** — several entities' edit views expose fewer fields than the create dialog (e.g. Vehicle Types edit has no Description). Edits were made on an available field (usually Name) and saved successfully.
- **POI Site Type reference** — our brand-new Site Type ("QA CRUD Test Clinic 0713") did not appear in the POI **Site Type** reference dropdown (reference list not refreshed/cached), so a valid seed value ("Primary Healthcare Clinic") was used for that one reference field. The POI record itself is ours.
- **Grid refresh lag** — several grids (notably Agents) don't refresh their count immediately after a create; a reload confirms the new record. Consistent with prior notes.
- **Method** — dialog/form creates driven with real MCP clicks for AntD selects (synthetic events toggle them shut) and native-setter fills for text; edits reached via each entity's `…-details?id=<guid>&mode=edit` URL. Search-by-grid then edit-link extraction used to locate each new record.

## Records created (for cleanup reference)

Site Type, Vehicle Type, Station, POI, Device, Shift, Resource, Crew, Vehicle, Agent, Shift Assignment, Incident Type — all prefixed **QA CRUD / QACRUD** dated 0713.
