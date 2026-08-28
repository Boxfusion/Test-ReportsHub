# BUG-LB-013 — Entity Name is a required capture field but is never displayed anywhere afterwards

**Logged:** 2026-08-21
**Plan:** `projects/land-bank/test-plans/leads/online-digital-channel-lead-capture.md`
**Affected TCs:** TC-04 (Close Corporation), TC-05 (Co-Operative), TC-06 (Listed Company) — every client type where Entity Name is mandatory. TC-13 proves the persistence side.
**Suspected category:** `business-logic` (UI rendering gap)
**Severity:** **Minor** — no data is lost; the value simply cannot be read back through the UI.

## Step

`// STEP 12: WAIT for the lead details page to load` — the post-save verification of an Online
Digital Channel lead for a client type where **Entity Name** (`organisation`) is a required field.

## Expected

A field that the form makes **mandatory** at capture should be visible on the saved record. The
operator should be able to read back the Entity Name they were forced to supply.

## Actual

**Entity Name appears nowhere after save.** Not on the lead details page, and not on the Leads grid.

The Leads grid's 12 columns, read off its `[role="columnheader"]` cells — no Entity Name among them:

```
(select) (actions) Date Created | Client Type | First Name | Last Name | Lead Status
Pre-Screening Outcome | Email Address | Mobile Number | Province | Lead Source
```

The full rendered text of `main` on `LandBank.Crm/LBLead-details v58` for a saved Close Corporation
lead — note there is no *Entity Name* label at all:

```
LandBank.Crm/LBLead-details v58  Live
OnlineCloseCorp, AutoQA
Lead Status New   Assessment   Lead Owner Kwanele Buthelezi   Province Gauteng
Region Central Region   Edit Disqualify Audit Log Initiate Pre-Screening
Details Tasks Notes
First Name AutoQA          Mobile Number 0820000602
Client Type Close Corporation (Entity)   Lead Channel Online Digital Channel
Description                              Reason Disqualified
Last Name OnlineCloseCorp                Email Address autoqa.online.closecorp@example.com
Province Gauteng                         Preferred Communication Email
Rejection Reason
```

**The value IS persisted.** The Leads grid's own data request selects `organisation` in its
`properties` list — it just renders no column for it. Read straight off that response
(`GET /api/services/app/Entities/GetAll?entityType=LandBank.Crm.Domain.LBLead&…&properties=…organisation…`):

```json
{
  "id": "22b1c132-a3c6-415b-b6be-d93ce9e6698a",
  "firstName": "AutoQA",
  "lastName": "OnlineCloseCorp",
  "organisation": "AutoQA Online Close Corp CC",
  "leadType": 2,
  "channel": 2,
  "leadStatus": 1
}
```

So this is purely a **rendering gap**, not data loss.

## Playwright error

The signature this produced while the plan still asserted the value was displayed:

```
TC-04: Close Corporation (Entity) — Entity Name required
Error: expect(locator).toContainText(expected) failed

Locator: locator('main')
Expected substring: "AutoQA Online Close Corp CC"
Received string:    " LandBank.Crm/LBLead-details v58LiveOnlineCloseCorp, AutoQALeadStatusNew…
                      …ProvinceGautengPreferred CommunicationEmailRejection Reason"
Timeout: 10000ms
```

## Snapshot / screenshot

```
projects/land-bank/test-results/artifacts/projects-land-bank-test-pl-*-entity-name-required-chromium/
  {test-failed-1.png, trace.zip, video.webm}
```

## Suspected cause

`LBLead-details v58` was laid out without an `organisation` field. The Details tab pairs fields in
two columns and the entity-only field looks to have simply been omitted when the form was built —
there is no hidden-by-class element for it either, so it was never placed rather than being
conditionally suppressed.

## Suggested fix

Add **Entity Name** to the Details tab of `LBLead-details`, shown for the entity client types (the
same condition the create form already uses to decide whether the field is required). Adding it as an
optional column on the Leads grid would help too, since the query already fetches it.

## Related

- **BUG-LB-009** — Entity Name is required for the three `(Entity)`-suffixed client types but
  optional for `Trust`, `NGO`, `Partnership` and `Private Company`.
- **BUG-LB-012** — on the *Branch* channel, a declined CIPC lookup does not merely fail to display
  Entity Name, it **wipes the persisted value**. The two are worth reading together: this bug is the
  benign display-only version, BUG-LB-012 is the data-losing one.
- **BUG-LB-011** — `idNumber` is never captured on the Online Digital Channel. Same theme: fields
  present in the data model that the Online channel forms do not surface.

## Not a test defect

The original assertion (`expect(main).toContainText(s.organisation)`) was a reasonable expectation
that turned out not to hold. The plan now asserts the observed behaviour — that the details page does
**not** show it — and TC-13 separately proves the value persists, so the plan will fail loudly if
either half of this changes.

Two authoring traps were hit and fixed while pinning this down, both worth remembering for this app:

1. **The lead details page renders `New`, not `NEW`**, and its read-only fields concatenate with no
   separators (`main`'s text reads `…LeadStatusNewAssessment…`). A `/\bNew\b/` regex therefore never
   matches — there are no word boundaries around the value. The plan now anchors on the label:
   `/Lead\s*Status\s*New/i`.
2. **The Leads grid is div-based** — there is no `<thead>`, and no real `<table>`; headers are
   `[role="columnheader"]` cells. `expect(page.locator('table thead')).not.toContainText('Entity Name')`
   **fails** on a zero-element locator rather than passing vacuously, which briefly looked like
   evidence that an Entity Name column existed. It does not.
