# BUG-LB-014 — "Does the client have a resolution?" is rendered twice on the Opportunity Client Info tab

**Logged:** 2026-08-21
**Plan:** `projects/land-bank/test-plans/leads/online-digital-channel-lead-capture.md`
**Affected TCs:** TC-12 (surfaced here; the field is shared, so `../opportunities/opportunity-loan-application-capture.md` is likely affected too)
**Suspected category:** `business-logic` (form definition duplication)
**Severity:** **Minor** — cosmetic and confusing, but both copies are read-only and agree, so no data risk.

## Step

`// SNAPSHOT: confirm the Opportunity's consent-related fields` — after a converted Online Digital
Channel lead is opened as an Opportunity and the **Client Info** tab is selected.

## Expected

`loanApplication_hasResolution` ("Does the client have a resolution?") renders **once** on the
Client Info tab.

## Actual

It renders **twice**, and both copies are live in the DOM at the same time:

| Instance | Tab panel | Section | State |
|---|---|---|---|
| 1 | `rc-tabs-2-panel-b075ee8af508474d9d1d08f59f` (`ant-tabs-tabpane-active`) | Entity Information | unchecked, `disabled` |
| 2 | `rc-tabs-2-panel-b075ee8af508474d9d1d08f59f` (**the same** active panel) | Entity Information | unchecked, `disabled` |

Both carry `label[for="loanApplication_hasResolution"]`, so `document.querySelectorAll` returns 2
labels within one active tab panel. This is **not** the usual Ant tabs artefact of an inactive panel
being retained in the DOM — both instances are inside the *same* active panel, under the same
**Entity Information** heading.

Verified live on `LBOpportunity-details?id=484b3af2-2586-48fa-b4ff-465a15e140ab` (the Opportunity
converted from the `OnlineCloseCorp` lead):

```json
[
  { "i": 0, "checked": false, "disabled": true, "nearestHeading": "Entity Information" },
  { "i": 1, "checked": false, "disabled": true, "nearestHeading": "Entity Information" }
]
```

## Playwright error

```
TC-12: An online-captured lead leaves its consent stage outstanding in the workflow
Error: expect(locator).not.toBeChecked() failed
Expected: not checked
Error: strict mode violation: locator('main')
  .locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="loanApplication_hasResolution"])')
  .locator('input[type="checkbox"]') resolved to 2 elements:
    1) <input disabled type="checkbox" class="ant-checkbox-input"/> aka getByLabel('', { exact: true }).nth(4)
    2) <input disabled type="checkbox" class="ant-checkbox-input"/> aka getByLabel('', { exact: true }).nth(5)
```

## Snapshot / screenshot

```
projects/land-bank/test-results/artifacts/projects-land-bank-test-pl-*-outstanding-in-the-workflow-chromium/
  {test-failed-1.png, trace.zip, video.webm}
```

## Suspected cause

The field looks to have been placed twice in the `LBOpportunity-details` form definition — most
likely once directly on the Client Info tab and once inside the Entity Information section, or the
same component pasted twice while the entity variant was being built. Both bind to the same
property, which is why they always agree.

## Suggested fix

Remove the duplicate placement from the `LBOpportunity-details` form definition. Worth grepping the
same form for other duplicated bindings while in there.

## Related

- **BUG-LB-013** / **BUG-LB-012** — the other two Entity-Name findings from the same session. Unrelated
  mechanically, but all three are `LBOpportunity-details` / `LBLead-details` form-definition issues.

## Not a test defect

The duplication is real and reproduces outside Playwright (confirmed by reading the DOM directly via
a browser session, above). The plan's assertion has been made count-agnostic — it now asserts *every*
instance is unchecked rather than assuming one — so TC-12 keeps passing once the duplicate is removed,
and the plan does not silently depend on the bug.

## How this was found — a silent skip hid it

TC-12 had **never executed**. It queried the Leads grid immediately after `page.goto` and, because
the grid loads asynchronously, `count()` returned 0 and the test called
`test.skip(true, 'No online-captured Close Corporation lead present — run TC-04 first.')` — even
though TC-04 runs immediately before it in the same sequential run and does create that lead. The
run reported "skipped" with a plausible-sounding reason on every single execution.

Fixed by waiting for `[role="row"].tr-body` to render, then **asserting** the lead exists instead of
skipping. Two further genuine faults in the never-run body were then exposed and fixed:

1. The conversion assertions expected `PASSED` / `CONVERTED`, but the detail page renders them
   word-cased and unseparated — `…LeadStatusConvertedAssessmentPassed…`. Now anchored on the labels:
   `/Lead\s*Status\s*Converted/i` and `/Assessment\s*Passed/i`.
2. This bug.

**Lesson for the suite: a conditional `test.skip` inside a test body is a liability.** It converts an
environment assumption into a permanent silent pass. Where a precondition is genuinely guaranteed by
an earlier TC in the same plan, assert it.
