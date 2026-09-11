# Bug: An NPO cannot reach the appeal journey, and once an appeal exists the submitter never sees it

**Date:** 2026-08-25
**Severity:** 🔴 **High** (the appeal right in the NPO Act is unexercisable from the public portal)
**Area:** Public portal — `portal-appeals-table`, `portal-appeal-records`, `npo-appeal-application`, `AppealActions/GetAppealInitialData`
**Environment:** QA · **view mode Latest** (in Live mode the entry point does not render at all)
**Found by:** TC-11-002 / TC-11-004 (ADO #101774, #101776) while looking for the submitter's entry point to the appeal form
**Related:** explains the blocker recorded across all 16 appeals cases since 2026-08-14

## Summary
Sections 14(1) and 22(1) of the NPO Act give an organisation the right to appeal a refusal or a cancellation, and the
public portal has the forms to do it. In practice an organisation cannot use them:

1. **The entry point is not in the navigation.** Nothing in the portal links to appeals.
2. **The Appeals list is unpublished** — `portal-appeals-table` is at `v11 **DRAFT**`, so a real user in Live view
   mode does not get it.
3. **Once an appeal is created, the submitter's list still shows none of them.**
4. **The appeal form cannot be filled** — its data call 500s on the appeal that was just created.

## 1. No navigational route
Signed in on the public portal as an NPO user, the complete set of navigation and dashboard actions is:
```
Dashboard · Register NPO · Education and Awareness · Contact Us · FAQs
View NPO Profile · Submit Query · FAQ · Enquiry
```
**No item mentions "Appeal".** The tester has separately confirmed the *Registration Application Unsuccessful* email
carries no appeal link either, so there is no route in from mail.

The forms exist and are reachable only by typing the URL:

| Route | Version |
|---|---|
| `/dynamic/boxfusion.dsdnpo/portal-appeals-table` | v11 **DRAFT** ← the entry point, with `Initiate Appeal` |
| `/dynamic/boxfusion.dsdnpo/npo-appeal-application` | v35 LIVE |
| `/dynamic/boxfusion.dsdnpo/npo-appeal-application-details` | v9 LIVE |
| `/dynamic/boxfusion.dsdnpo/appeal-portal-details` | v14 LIVE |
| `/dynamic/boxfusion.dsdnpo/portal-appeal-records` | v14 LIVE |

## 2. Three contradictory statements on one screen
`portal-appeals-table` renders, simultaneously:
- `0 items found`, with an empty grid
- *"You already have an existing Appeal that is either in Draft or In Progress status."*
- an **enabled** `Initiate Appeal` button

The user is told they already have an appeal, shown none, and permitted to create another. Clicking the button does
create one, so the warning does not gate anything.

## 3. The submitter's own appeal never appears
`Initiate Appeal` created a real record:
```
Ref  APPEAL1445/25/08/2026
id   4106f35f-ee6e-45b3-8357-a8931fc61d7b
created 2026-08-25T08:08:35 UTC   ·   stored appealStatus = 3 (InComplete)
```
Confirmed independently — the admin appeals grid went from **30 to 31 items** and the record is retrievable by id.

**`portal-appeals-table` still reports `0 items found`.** So the appeal exists, DSD staff can see it, and the
organisation that lodged it cannot.

The second list fails in a different way — the grid asks for **no properties at all**:
```
GET /api/services/app/Entities/GetAll?entityType=Npo.DeregistrationAppeal
    &maxResultCount=10&skipCount=0&properties=&sorting=
→ 400
```

## 4. The appeal form cannot be completed
Opened cold by URL, `npo-appeal-application` is fully read-only — 4 of 4 radio options carry
`ant-radio-wrapper-disabled`, 4 of 5 inputs are disabled and **`Submit` is disabled**. That is arguably correct, since
there is no appeal in context.

Reached properly through `Initiate Appeal`, the form loads against the new appeal and the header shows
`Initial Appeal: DRAFT · Ref No: APPEAL1445/25/08/2026` — but its data call fails:
```
GET /api/services/dsdnpo/AppealActions/GetAppealInitialData?appealId=4106f35f-ee6e-45b3-8357-a8931fc61d7b
→ 500  {"error":{"message":"No Appeal or NPO found","details":"No Appeal or NPO found"}}
```
Twice, for the appeal the click had *just created*. Only 2 of 4 radio options became enabled, so the form still
cannot be filled in or submitted.

## Expected
- An organisation can reach its appeals from the portal navigation.
- The Appeals list shows that organisation's own appeals.
- The one-active-appeal rule is stated only when it is true, and gates the button when it applies.
- `Initiate Appeal` produces a form that loads and can be completed.

## Actual
- No navigational route; the list form is unpublished (`DRAFT`).
- The list shows `0 items found` regardless, including immediately after creating one.
- The one-active-appeal warning shows when no appeal is listed, and gates nothing.
- The form's initial-data call returns 500 for the appeal just created, leaving it unfillable.

## Impact
The appeal right cannot be exercised from the public portal. Every downstream appeals case is blocked behind it, on
both sides of the module — the tribunal cases in suite 11A can only be observed against appeals other testers created
by unknown means.

🔑 **`GetAppealInitialData` returning 500 is the critical path.** With that fixed and the list showing the
submitter's own records, roughly six further test cases across 11P and 11A become executable.

## Suggested fix
1. Add an Appeals entry to the public-portal navigation and **publish `portal-appeals-table`** past `DRAFT`.
2. Fix the submitter list's filter so it returns the signed-in organisation's appeals; give `portal-appeal-records` a
   real property list instead of `properties=`.
3. Make `GetAppealInitialData` resolve an appeal created seconds earlier — and return 404 rather than 500 when it
   genuinely cannot.
4. Derive the one-active-appeal message from the same query that populates the list, and disable the button when it
   is true.

## Note on test data
`APPEAL1445/25/08/2026` was created deliberately, on an NPO we own (`Nomfanelo QA Test NPO 2026-08-13`), to answer
whether the entry point functions. It is left in place because it is the precondition several appeals cases have been
waiting for. It can be removed once they are run.
