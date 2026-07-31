# BUG: "Disapprove" at Review and Approve Tender Details hangs forever — reason-for-disapproval form can't load (Metadata 404)

| Field | Value |
|---|---|
| **Logged** | 2026-07-30 |
| **Project** | PD Bid Management (`projects/bid-management`) |
| **App / Env** | Supply Chain Management Admin Portal — **QA** (`https://pd-supplychainmanagement-adminportal-qa.shesha.app`) |
| **Severity** | **Blocker** — the decision is completely unusable; there is no workaround |
| **⚠️ SCOPE WIDENED 2026-07-30** | The same broken form also kills **"Bid is non-responsive"** at *BEC: Finalise recommendation* — see below |
| **Priority** | High — it is one of only three decisions on this stage, and the demo is the week of 2026-08-03 |
| **Reproducibility** | **3 / 3** — twice on REF2026-1106, once on REF2026-1110 (two independent tenders) |
| **Stage / Form** | Review and Approve Tender Details — `Shesha.SupplyChainManagement/tender-wf-review-and-approve-details v27` |
| **Role** | Reviewer — **MhlotiM / 123qwe** |
| **Found by** | Negative-path testing (plan TC-20), live via Playwright MCP |
| **Evidence** | The network trace and console output quoted below (a screenshot was attempted but not retained — `test-results/` is gitignored, so don't look for one in the repo) |

## Summary

On the **Review and Approve Tender Details** stage, clicking **Disapprove** puts the button into a
**loading spinner that never resolves**. No dialog opens, no validation message appears, no workflow request
is ever sent, and the tender is left exactly where it was. The reviewer has no way to disapprove a tender.

The cause is a **broken form configuration**, not a data problem: the Disapprove action loads the form
`Shesha.SupplyChainManagement/tender-reason for disapproval`, whose model container is configured as the
entity type **`Boxfusion.BidManagement.Domain.Tenders.Tender`** — which **does not exist in this build's
metadata**. The metadata lookup 404s, form initialisation throws, and the button is left spinning.

## Steps to reproduce

1. Sign in as the reviewer **MhlotiM / 123qwe** and switch the view mode to **Latest**.
2. Go to **Workflows → Inbox** and open a tender at **Review and Approve Tender Details**
   (e.g. REF2026-1106 or REF2026-1110, both parked there now).
3. Confirm the page offers three decisions: **Approve**, **Disapprove** and (in the footer) **Send Back**.
4. Click **Disapprove**.

## Expected

The reason-for-disapproval form opens (its configuration exists — `tender-reason for disapproval`), the
reviewer captures a reason, and the tender moves to whatever terminal/rework state Disapprove is meant to
produce.

## Actual

- The **Disapprove** button switches to a **loading spinner and stays there indefinitely** (observed >50 s).
- **No dialog, no toast, no validation message** — nothing tells the user anything went wrong.
- **No workflow API call is made.** The last requests are the form fetch and the failed metadata lookup;
  there is no POST of any kind.
- The tender is **unchanged** — still in MhlotiM's Inbox at *Review and Approve Tender Details*, same
  `todoid`, status still *Submitted*. Nothing is corrupted, but nothing happens either.
- **Approve** and **Send Back** on the same page are unaffected and work normally.

## Root cause evidence

Network trace on the click (authenticated, same session):

```
[GET] /api/services/Shesha/FormConfiguration/GetByName
        ?name=tender-reason%20for%20disapproval&module=Shesha.SupplyChainManagement   → 304 Not Modified
[GET] /api/services/app/Metadata/Get
        ?container=Boxfusion.BidManagement.Domain.Tenders.Tender                      → 404 Not Found
```

Console on the click:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
  …/api/services/app/Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender
Failed to fetch metadata of type "Boxfusion.BidManagement.Domain.Tenders.Tender"
  AxiosError: Request failed with status code 404
    at Bv.getMetadata → b7.applyFormSettingsAsync → b7.loadFormByIdAsync → b7.initByFormId
```

So: the **form exists** (304 = cached and valid) but the **entity type it is bound to does not**.
`applyFormSettingsAsync` throws inside form initialisation, so the dialog never renders — and because the
throw is swallowed, the button's loading state is never cleared.

**Where the correct type is visible:** on the very same page, the working requests bind to
**`Shesha.SupplyChainManagement.Domain.RfxWorkflow`** —
e.g. `/api/dynamic/Shesha.SupplyChainManagement/RfxWorkflow/Crud/Get?...` → **200**, and
`/api/StoredFile/EntityProperty?...&ownerType=Shesha.SupplyChainManagement.Domain.RfxWorkflow` → **200**.

`Boxfusion.BidManagement.Domain.Tenders.Tender` looks like a **pre-rename namespace left behind** in this
one form's settings.

## Suggested fix (for dev)

Repoint the `tender-reason for disapproval` form's model type from
`Boxfusion.BidManagement.Domain.Tenders.Tender` to the entity this build actually exposes
(`Shesha.SupplyChainManagement.Domain.RfxWorkflow`, per the working calls on the same page), then re-test
Disapprove end-to-end. Worth grepping the other form configurations for the same stale
`Boxfusion.BidManagement.Domain.*` namespace — if one form still carries it, others may too.

**Separate, smaller issue worth raising with it:** a form-initialisation failure should surface to the user
and reset the button, rather than leaving a permanent spinner with no message.

## ⚠️ Scope update 2026-07-30 — this breaks a SECOND decision on a different stage

While testing the below-minimum functionality scenario (`bugs/2026-07-30-no-qualifying-bid-has-no-working-outcome.md`),
**"Bid is non-responsive"** on *BEC: Finalise recommendation* was found to hang identically. Its network trace
is the same two requests:

```
[GET] /FormConfiguration/GetByName?name=tender-reason%20for%20disapproval&module=Shesha.SupplyChainManagement → 200
[GET] /Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender                                  → 404
```

So **one mis-bound form disables at least two decisions on two stages**:

| Stage | Decision | State |
|---|---|---|
| Review and Approve Tender Details (TC-02) | **Disapprove** | dead |
| BEC: Finalise recommendation (TC-12) | **Bid is non-responsive** | dead |

This raises the impact considerably: "Bid is non-responsive" is the **only correct outcome** when no bid
qualifies technically, so its failure leaves such a tender with no legitimate exit at all.

**Retest both decisions together once the form's entity binding is fixed.** Also worth grepping the form
configurations for a related malformed namespace seen on the same page:
`Boxfusion.BidManagement.Domain.Domain.TenderEvaluations.EvaluationPanelMember` (note the doubled `.Domain.`)
→ also **404**.

## Notes

- Unrelated pre-existing console error on this page **at load** (present before any click, on both tenders,
  and it does not block the happy path):
  `executeScriptSync error TypeError: Cannot read properties of undefined (reading 'isOnProcurementPlan')`.
  Flagged only so it is not mistaken for part of this defect.
- **Retest data is ready:** **REF2026-1106** and **REF2026-1110** are both parked at *Review and Approve
  Tender Details* in MhlotiM's Inbox, untouched, specifically so this can be re-verified once fixed.
- Because Disapprove never commits, **what the decision is supposed to do is still unknown** — terminal
  rejection vs a rework loop. Plan **TC-20** documents the case but its expected outcome cannot be
  confirmed until the form loads.
