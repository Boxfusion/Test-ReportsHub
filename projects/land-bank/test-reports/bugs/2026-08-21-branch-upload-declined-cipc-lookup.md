# BUG-LB-012 — A declined CIPC lookup wipes Entity Name and leaves it read-only, so a required field can never be filled

**Logged:** 2026-08-21
**Plan:** `projects/land-bank/test-plans/leads/branch-manual-document-upload.md`
**Affected TCs:** TC-08 (Trust), TC-09 (Partnership) — the two Process-B client types that are not CIPC-registered
**Suspected category:** `business-logic`
**Severity:** **Major** — **confirmed data loss.** The lead saves, but with no entity name at all, and the operator has no way to put it back.

## Confirmed: the wipe reaches the database

Read back off the Leads grid's own data request after a full plan run
(`GET /api/services/app/Entities/GetAll?entityType=LandBank.Crm.Domain.LBLead&…&properties=…organisation…`),
every Process-B lead captured in the same run, in the same way, differing only by client type:

| Client Type | `leadType` | CIPC lookup | Persisted `organisation` |
|---|---|---|---|
| NGO | 7 | `success:true` | `"BOXFUSION (PTY)LTD"` |
| Private Company | 10 | `success:true` | `"BOXFUSION (PTY)LTD"` |
| Co-Operative (Entity) | 4 | `success:true` | `"BOXFUSION (PTY)LTD"` |
| Listed Company (Entity) | 5 | `success:true` | `"BOXFUSION (PTY)LTD"` |
| **Trust** | 6 | `success:false` | **`null`** |
| **Partnership** | 8 | `success:false` | **`null`** |

An Entity Name *was typed* for Trust and Partnership before the commit, exactly as for the other
four. It is `null` on the saved record. This is **not** a display gap — contrast **BUG-LB-013**,
where the value persists correctly and is merely not rendered.

## Context — the app gets the *lookup* right

This is **not** a complaint about the CIPC lookup declining. That part is correct and well-implemented.
On the Landbank Branch lead-capture modal, clicking **Upload** fires
`POST /api/services/app/LBLead/PopulateFromCompanyRegistration`. For Trust and Partnership it answers
`200` with a deliberate, clearly-worded refusal:

```json
{
  "result": {
    "success": false,
    "message": "CIPC lookup is not available for Trust. This entity type is not registered with CIPC.",
    "leadId": "2b565b32-0948-4b8c-9ea3-2138b2a3e5bf",
    "isNewLead": true,
    "companyName": null,
    "tradeName": null,
    "previousBusinessName": null,
    "registrationNumber": null,
    "businessStatus": null
  }
}
```

The other five Process-B types (Close Corporation, Listed Company, Co-Operative, Private Company,
NGO) answer `"success":true` and auto-populate as expected.

## Step

`// STEP 9: CLICK **Upload**` — the commit, after all required fields are populated, the
*Upload Resolution and Consent?* toggle is ON, both documents are attached, and the Signatory ID
Number and Company Registration Number are typed.

## Expected

A declined lookup should be a **no-op on the form**: the operator's typed **Entity Name** should be
left intact (there is nothing from CIPC to overwrite it with), and the refusal message should be
surfaced so the operator knows why nothing auto-populated.

## Actual

Three distinct problems, all downstream of the `success:false` branch:

| # | Observed |
|---|---|
| 1 | **Entity Name is wiped.** The value typed before the commit is discarded even though the lookup returned `companyName: null`. |
| 2 | **Entity Name becomes unrecoverable.** After the commit the field re-renders as **read-only text with no `<input>` element at all** — `label[for="organisation"]`'s form item resolves, but `input.ant-input` inside it resolves to **0 elements**. The operator can see an empty *Entity Name* and cannot type into it. |
| 3 | **The refusal message is never shown.** No toast, no banner, no inline error. The API's clear explanation (*"…not registered with CIPC"*) is discarded by the client. |

Additionally, **Company Registration Number** is wiped too — but it stays an `<input>`, so it *can*
be re-typed. And **Save is enabled** across both now-empty required fields.

Verified live via MCP on 2026-08-21 (Trust), reading the form state straight after the Upload click:

```
net:            PUT /api/StoredFile -> 200
                PUT /api/StoredFile -> 200
                POST /api/services/app/LBLead/PopulateFromCompanyRegistration -> 200
organisation:   { hidden: false, text: "Entity Name" }          <- displayed, empty, no <input>
regNo:          { hidden: false, text: "Company Registration Number *", val: "" }
firstName:      { hidden: false, text: "First Name *", val: "" }
saveDisabled:   false
```

## Playwright error

The signature this produced before the plan was corrected (asserting CIPC populate for all seven
types, which was a **test defect** — see *Not a test defect* below):

```
TC-08: Trust — resolution + consent upload
Error: expect(locator).toContainText(expected) failed

Locator: .ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])
Expected substring: "BOXFUSION (PTY)LTD"
Received string:    "Entity Name"
```

And the signature of the genuine defect, from the attempt to re-enter the wiped name:

```
TimeoutError: locator.fill: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('.ant-modal-content')
      .locator('.ant-form-item:has(… label[for="organisation"])')
      .locator('input.ant-input')
```

## Snapshot / screenshot

```
projects/land-bank/test-results/artifacts/projects-land-bank-test-pl-44d44-—-resolution-consent-upload-chromium/
  {test-failed-1.png, trace.zip, video.webm, error-context.md}
```

## Suspected cause

The Upload commit handler looks like it applies the CIPC response unconditionally instead of
branching on `result.success`. Writing `companyName: null` and `registrationNumber: null` straight
onto the form explains the wipe, and the read-only re-render is consistent with the field being
switched into its "populated from CIPC, therefore not operator-editable" presentation — a mode it
should only enter when the lookup actually succeeded.

## Suggested fix

1. Branch on `result.success`. On `false`, leave the form fields exactly as the operator typed them.
2. Keep **Entity Name** editable whenever it was not populated from CIPC.
3. Surface `result.message` to the operator — it is already a well-worded, user-ready sentence.

## Related

- **BUG-LB-008** — Company Registration Number is required for Trust and Partnership even though
  they have no CIPC registration. Revised on 2026-08-21: the *lookup* handles these types correctly;
  what remains is that the form still forces a registration number to be typed before the Upload
  commit is offered.
- **BUG-LB-009** — Entity Name required/optional inconsistency across the Process-B client types.
- **BUG-LB-013** — on the *Online* channel Entity Name persists correctly but is never rendered on
  the lead record. Read the two together: that one is display-only, this one destroys the value.
- This is the **sixth** silent-failure defect in this project, alongside BUG-LB-001 (validation
  returned as HTTP 500 with no message), BUG-LB-005 (save blocked by an unrelated field error with
  no summary) and BUG-LB-006 (Finalise Verification Outcomes no-op). The pattern is worth raising
  with the team: **the app repeatedly has the right information server-side and discards it before
  the operator sees it.** Here the backend even wrote the explanation in plain English.

## Not a test defect

Two separate test defects were found and repaired in the same investigation, and are **not** part of
this bug:

1. The plan asserted a successful CIPC populate for **all seven** Process-B client types, having
   only been recorded against Close Corporation. Corrected: `Scenario` now carries a
   `cipcSupported` flag, and Trust/Partnership assert the documented refusal instead.
2. The repair then tried to re-type the wiped Entity Name, which is impossible — that attempt is
   what surfaced problem #2 above.
