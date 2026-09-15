# Bug: The Annual Compliance admin grid is bound to an entity that does not exist — it shows "No data" over 2 465 839 records

**Date:** 2026-08-25
**Severity:** 🔴 **High** (a core CRUDS lifecycle screen is unusable, and it fails silently — an administrator is shown "no records" where 2.4 million exist)
**Area:** Admin portal — `CRUDS → Annual Compliance` · `/dynamic/boxfusion.dsdnpo/annual-compliances` (`v15 LIVE`)
**Environment:** QA · admin portal · **view mode Latest (asserted in-run)**
**Found by:** attempting to reach a compliance record for suite 09 TC-09-004 (backend QA "Not Aligned")
**Related:** blocks the intended navigation path for suite 09; same "silent failure rendered as an empty result" pattern as the notification audit screens

## What happens

Open `CRUDS → Annual Compliance`. The page renders its toolbar (`Add`, `Export`) and its column headers —
`Date · Non Profit Organization · Financial Period Month · Financial Period Year · Status · Due Date` — followed by:

> **No Data**
> No data is available for this table

There is no error message, no toast, no spinner left running. It looks exactly like a table with nothing in it.

## What is actually happening

The grid is bound to the entity alias **`Npo.AnnualCompliance`**, which does not exist on the server. Both calls the
screen makes fail:

```
GET /api/services/app/Metadata/Get?container=Npo.AnnualCompliance
→ 404   {"error":{"code":404,"message":"Type `Npo.AnnualCompliance` not found"}}

GET /api/services/app/Entities/GetAll?entityType=Npo.AnnualCompliance
      &maxResultCount=10&skipCount=0&properties=creationTime nonProfitOrganisation …
→ 500   {"error":{"message":"An internal error occurred during your request!",
                   "details":"Entity with class name or alias 'Npo.AnnualCompliance' not found"}}
```

The metadata 404 also produces a client-side `Failed to fetch metadata of type "Npo.AnnualCompliance"` and a React
error #419 in the console.

The data itself is present and healthy under the correct entity:

```
GET /api/dynamic/boxfusion.dsdnpo/AnnualCompliance/Crud/GetAll?maxResultCount=200
→ 200   totalCount = 2 465 839
```

Records return with populated `nonProfitOrganisation`, `financialPeriodYear`, `complianceStatus`, `dueDate` — the very
columns the grid is trying to show.

## Why it matters

1. **It is silent.** The screen does not say "something went wrong"; it says there is nothing to see. An
   administrator has no reason to doubt it. This is the same failure mode already recorded on the notification audit
   screens, and it is the reason a DOM-only check would have passed this screen as "empty grid, working as intended".
2. **It removes the only navigation route into annual compliance records.** Suite 09's QA step is reachable in
   principle — the form `annual-compliance-quality-assure v19 LIVE` loads fine against a valid submission id — but
   there is no way to *find* a record through the UI to get there.
3. **The scale makes it conspicuous once known and invisible until then.** 2 465 839 records is the entire annual
   compliance history of the system.

## Verification performed before raising this

Per the standing rule that the harness and the data layer are ruled out before an application is blamed:

| Check | Result |
|---|---|
| Reproducible, or intermittent? | **Reproducible** — the same `Entities/GetAll` request was issued twice in the same session, 500 both times |
| Harness / selector problem? | No — the failures are server responses visible in the browser console on a plain page load, with no automation involved |
| Data missing? | No — the same data returns 200 with 2 465 839 rows on the correct route |
| Permissions? | No — the errors are "type not found", not 401/403, and the same session reads the entity successfully by its real name |

## Steps to reproduce

1. Sign in to the admin portal.
2. Set view mode to **Latest**.
3. Navigate to `/dynamic/boxfusion.dsdnpo/annual-compliances`.
4. Observe *"No data is available for this table"*.
5. Open the browser console — observe the `404` on `Metadata/Get` and the `500` on `Entities/GetAll`, both naming
   `Npo.AnnualCompliance`.
6. Compare against `/api/dynamic/boxfusion.dsdnpo/AnnualCompliance/Crud/GetAll` → `200`, `totalCount 2 465 839`.

## Expected

The grid lists annual compliance records. If the configured entity genuinely cannot be resolved, the screen should
surface the failure rather than render an empty-state message that asserts the opposite.

## Suggested fix

Repoint the `annual-compliances` grid at the entity the server actually exposes
(`boxfusion.dsdnpo.Domain…AnnualCompliance`) rather than the alias `Npo.AnnualCompliance`.

Worth checking whether other screens carry the same stale `Npo.*` alias — this looks like a rename that was not
followed through into the form configuration, and if so it will not be the only screen affected.
