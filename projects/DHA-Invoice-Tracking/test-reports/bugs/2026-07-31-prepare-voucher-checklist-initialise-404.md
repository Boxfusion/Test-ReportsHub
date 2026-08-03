# Business Unit Response checklist never loads (`CheckList/Initialise` 404) on BAS *and* LOGIS; steps submit without it

> **Scope widened 2026-07-31 (same day):** originally logged against BAS *Prepare Voucher* only.
> The LOGIS regression run then hit the identical 404 on **LOGIS *Verify Invoice*** (which has **7**
> mandatory Yes/No questions rather than BAS's 4) — `PAY3326/2026`, form
> `SAGovRequestForPayment-wf-MatchtoOrderandVerifyInvoice-Details`. Same signature, same
> silently-submits behaviour. So this is **not one form** — it is the shared checklist component, and
> every step that depends on it has lost its mandatory questions. A knock-on effect: LOGIS
> *Pre-Authorise Payment*, which normally shows those 7 answers read-only, now shows none.
> Report: [../2026-07-31/logis-post-deployment-QA-PAY3326.md](../2026-07-31/logis-post-deployment-QA-PAY3326.md)

**Environment:** DHA SmartGov Invoice Tracking (ITS) — **QA** (https://dha-smartgov-adminportal-qa.shesha.app/), view mode **Latest**
**Found:** 2026-07-31, during the post-deployment BAS regression run
**Plan:** `test-plans/invoice-process/bas.md`
**Failing TC:** TC-07 — Prepare Voucher (ADO #102361)
**Ref No:** PAY3306/2026 (BAS, VANG GROUP / MAAA0868598, R1 500)
**Form:** `Shesha.SaGovInvoiceTracking/SAGovRequestForPayment-BAS-wf-PrepareVoucher-Details`
**Suspected category:** `business-logic` (missing/unseeded configuration data)

## Expected
Per `CLAUDE.md` and the plan (TC-07 steps 9–10), *Prepare Voucher* shows a **Business Unit Response
checklist of 4 Yes/No questions** which are **mandatory for every outcome** — including the query and
reject branches. Submitting without answering them should raise four inline
"Please select an option" errors.

## Actual
The checklist panel renders the placeholder **"Loading checklist items…" and never resolves**. Only the
4 Outcome radios appear. The supporting API call fails:

```
POST https://dha-smartgov-api-qa.shesha.app/api/services/Enterprise/CheckList/Initialise  => 404
```

A manual `GET` on the same route returns **405 Method Not Allowed**, which confirms the route itself is
registered — so the 404 is the *checklist definition* not being found, not a missing endpoint. This
looks like configuration/seed data that did not ship with the deployment.

**The step then submits anyway.** With only `Outcome = "Verification is complete"` selected, Submit was
enabled, posted successfully, and routed the invoice on to *Verify Voucher*. The four mandatory
Business Unit Response answers were **silently skipped and never captured**.

That is the substantive risk here: this is not a blocked step, it is a **control that has silently
stopped being enforced**. The invoice completed the whole chain to Paid + Filed
(`Process/Details` → `status: 3`, `subStatus: 12`) with no Business Unit Response recorded.

## Other server errors observed on the same step
Logged for completeness; neither blocked the chain:

```
GET  /api/services/app/ReferenceList/GetByName?module=Shesha.invoicetracking
       &name=Shesha.Invoicetracking.ConfirmServiceDeliveryStatus          => 404
GET  /api/StoredFile/FilesList?ownerId=<instanceId>&ownerType=...&filesCategory=  => 500  (repeats on
       every step of the chain, once per render; the empty `filesCategory` looks suspect)
```

The `ConfirmServiceDeliveryStatus` 404 fires on *Certify Invoice*, whose radios still rendered
correctly, so it appears cosmetic. The `FilesList` 500 recurs on **every** step in the chain and is
tied to the *Other Supporting Documents* panel, which stayed usable.

## Repro
1. Log in as `Admin`, switch view mode Live → **Latest**.
2. Register a BAS Request For Payment and carry it to *Prepare Voucher* (self-assign
   "Thabiso Maake" at each Finance-Unit hand-off; see CLAUDE.md).
3. Open *Prepare Voucher* as `ThabisoM`.
4. Observe the Business Unit Response panel stuck on "Loading checklist items…", and the 404 on
   `POST /api/services/Enterprise/CheckList/Initialise` in the network log.
5. Select `Outcome = Verification is complete` and click Submit → it succeeds and routes to
   *Verify Voucher* with no checklist answers captured.

## Suspected cause
The checklist definition referenced by the Prepare Voucher form is absent from the QA database after
the deployment (unseeded or renamed), so `CheckList/Initialise` cannot resolve it. Because the form
renders the checklist asynchronously and its validation is attached to the rendered items, an unloaded
checklist contributes **no** validators — hence mandatory questions degrade to no questions at all
rather than to a blocking error.

## Impact
- **High for data integrity / auditability:** BAS payments can be prepared and paid without the
  Business Unit Response being recorded. Any control or report relying on those four answers will be
  empty for invoices processed while this is broken.
- **Not a blocker for throughput:** the chain still completes end to end.
