# Report: BAS — Invoice Tracking Process (post-deployment regression, QA)

**Date:** 2026-07-31 06:06 UTC
**Plan:** test-plans/invoice-process/bas.md
**Spec:** test-plans/invoice-process/bas.spec.ts
**Environment:** **QA** — https://dha-smartgov-adminportal-qa.shesha.app/ (view mode **Latest**)
**Execution Mode:** hybrid (playwright-script for TC-01→TC-02, AI/MCP-driven for TC-03→TC-14)
**Result:** PASSED (with 1 defect logged)
**Duration:** ~26 min wall clock for the completed chain
**Ref No:** **PAY3306/2026** — BAS, VANG GROUP (MAAA0868598), R1 500, invoice `DHA-INV-3306`

## Why this run happened
A deployment landed on DHA ITS QA. This is the post-deployment regression of the full BAS
Request-For-Payment chain.

## Outcome

**PAY3306/2026 completed all 11 workflow steps end to end → PAID + FILED.**
`Process/Details` → `status: 3` (Completed), `subStatus: 12` (Paid).

The application is healthy. Both initial spec failures were defects in **our test code**, not the app.
One genuine **application defect** was found (see Defects).

## Summary
| Total TCs | Passed | Failed | Skipped |
|-----------|--------|--------|---------|
| 11 executed (TC-01→TC-05, TC-07, TC-10→TC-14) | 11 | 0 | 3 (TC-06, TC-08, TC-09 — negative/query branches, not in scope) |

## Step Results

### TC-01 — Login (Admin)
**Mode:** playwright-script — **Duration:** 7.8s
- [PASS] Signed in; Workflows menu displayed
- [PASS] View mode switched Live → **Latest** (newly added to the spec this run)

### TC-02 — Register and Upload Invoice (ADO #102362)
**Mode:** ai-repair (patched the Invoice No selector, the commit assertion and the redirect assertion)
- [PASS] Ref No assigned on open: PAY3306/2026
- [PASS] Supplier picker → VANG GROUP / MAAA0868598 selected by double-click
- [PASS] Invoice row: 15/07/2026, 15/07/2026, `DHA-INV-3306`, 1500, `pdf-test.pdf`
- [PASS] Row committed via plus-circle; **Total Amount: R1500**; no "Create failed"
- [PASS] (BLOCKING) Submit routed on the **first attempt**, no 500 — landed on the read-only workflow
  view and the item routed to *Assign Branch Finance Admin To Assign Certifier* with the expected
  4 candidate assignees

### TC-03 — Assign Branch Finance Admin to Assign Certifier (ADO #102369)
**Mode:** ai/MCP — actioned as `ThabisoM`
- [PASS] Branch Finance Admin self-assigned "Thabiso Maake" (full-name search → single exact match)
- [PASS] (BLOCKING) Routed to *Assign Responsible Person to Certify Invoice*; next step opened in place
  (todoid changed) — the single-login self-assign technique still works

### TC-04 — Assign Responsible Person to Certify Invoices (ADO #102370)
**Mode:** ai/MCP — `ThabisoM`
- [PASS] Official self-assigned "Thabiso Maake"
- [PASS] (BLOCKING) Routed to *Certify Invoice*

### TC-05 — Certify Invoice (ADO #102372)
**Mode:** ai/MCP — `ThabisoM`
- [PASS] Selected "Goods and Service has been delivered satisfactory - Invoice should be paid"
- [PASS] Two Submit buttons rendered, one hidden (width 0) — the documented quirk still applies
- [PASS] (BLOCKING) Routed to *Prepare Voucher*

### TC-07 — Prepare Voucher (ADO #102361)
**Mode:** ai/MCP — `ThabisoM` — ⚠️ **DEFECT FOUND**
- [FAIL] The **Business Unit Response checklist never loads** — stuck on "Loading checklist items…";
  `POST /api/services/Enterprise/CheckList/Initialise` → **404**. The 4 mandatory Yes/No questions
  are absent. Bug:
  [test-reports/bugs/2026-07-31-prepare-voucher-checklist-initialise-404.md](../bugs/2026-07-31-prepare-voucher-checklist-initialise-404.md)
- [PASS] Outcome radios present (Verification is complete / supplier query / business query / Reject)
- [PASS] (BLOCKING) Selected "Verification is complete" → Submit **succeeded** and routed to
  *Verify Voucher* — i.e. the step is **not blocked**, the mandatory checklist is silently skipped

### TC-10 — Verify Voucher (ADO #102380)
**Mode:** ai/MCP — actioned as `H19234198` (TSHIANEO MOIRAH MABOYA)
- [PASS] Step is **not** available to `ThabisoM` here — assigned to Hester Harding / Tshianeo Maboya
- [PASS] Batch Number required (`BATCH-QA-3306`); Submit stayed disabled until it plus the confirm tick
- [PASS] (BLOCKING) Routed to *Authorise Invoice Voucher*

### TC-11 — Authorise Invoice Voucher (ADO #102383)
**Mode:** ai/MCP — `H19234198`
- [PASS] Approval confirmation ticked; Submit enabled
- [PASS] (BLOCKING) Routed to *Upload Captured Invoices Report From BAS*

### TC-12 — Upload Captured Invoices Report From BAS / Final Authorise Payment (ADO #102360)
**Mode:** ai/MCP — `Admin`
- [PASS] QA accepts the **Notepad `.txt`** BAS report format (not only `.xlsx`)
- [PASS] File built with `scripts/make-bas-text-report.js --payment 3306 --invoice DHA-INV-3306
  --supplier MAAA0868598 --amount 1500 --type SUNDRY`
- [PASS] (BLOCKING) One import completed **two** steps — *Upload Captured Invoices Report From BAS*
  (as KATLEGO CONSTANCE MALEPO NTSOANE) **and** *Final Authorise Payment* (as HLEKANEI ROSE MATHE)
- [PASS] Payment Number stamped as `00003306`, Capture/Authorise dates taken from the report

### TC-13 — Attach Payment Stub (ADO #102359)
**Mode:** ai/MCP — `Admin`
- [PASS] Stub built with `scripts/make-payment-stub.js --payment 00003306 --invoice DHA-INV-3306
  --amount 1500` (PO left `NOT APPLIC` for BAS), byte-length preserved (8766 = template)
- [PASS] (BLOCKING) Imported → invoice **Paid** (`subStatus: 12`), routed to *Capture Filing*
- [NOTE] *Attach Payment Stub* shows `status: 7` (programmatic) in `Process/Progress` — cosmetic, as
  previously documented

### TC-14 — Capture Filing (ADO #102358)
**Mode:** ai/MCP — actioned as `Mutshutshut` (Mutshutshu Tshithukhe)
- [PASS] Batch Number pre-populated read-only as `BATCH-QA-3306` (carried from Verify Voucher)
- [PASS] Box Number `BOX-QA-3306` and File Range `FILE-3306-3306` required and captured
- [PASS] (BLOCKING) Submitted → process **ended**, invoice **Paid + Filed**
  (`status: 3`, `subStatus: 12`)

## Defects

### 1. Prepare Voucher checklist never loads; mandatory questions silently skipped — **NEW**
`POST /api/services/Enterprise/CheckList/Initialise` → 404, so the 4 Business Unit Response questions
that are documented as mandatory for every outcome never render, and the step submits without them.
Not a throughput blocker; a **data-integrity / auditability** problem.
→ [bugs/2026-07-31-prepare-voucher-checklist-initialise-404.md](../bugs/2026-07-31-prepare-voucher-checklist-initialise-404.md)

### 2. `StoredFile/FilesList` 500 on every step — pre-existing, non-blocking
`GET /api/StoredFile/FilesList?ownerId=<instanceId>&ownerType=...&filesCategory=` returns **500** once
per render on every step of the chain (empty `filesCategory`). The *Other Supporting Documents* panel
remained usable throughout. Noted in the bug file above.

### 3. `ConfirmServiceDeliveryStatus` reference list 404 — cosmetic
`GET /api/services/app/ReferenceList/GetByName?module=Shesha.invoicetracking&name=Shesha.Invoicetracking.ConfirmServiceDeliveryStatus`
→ **404** on *Certify Invoice*. The outcome radios still rendered and the step worked.

## Test-code fixes made this run (not app defects)
1. **Invoice No selector was wrong.** The spec used
   `getByRole('row').getByRole('textbox').first()`, but the row's first textbox is the **Invoice Date**
   picker — the invoice number was typed into a date field, which silently reverted, leaving Invoice No
   empty ("This field is required" + "Create failed"), so Submit correctly stayed disabled. Now targets
   `[role=table] .ant-input-affix-wrapper input.ant-input`.
2. **The assertion that hid it.** The commit check asserted the attachment filename was visible, which
   is true in the *uncommitted* row too. Now asserts `Total Amount: R1500`, per plan step 32.
3. **`login()` race.** It returned after `networkidle`, which can resolve before the session token is
   persisted, so the next `goto` bounced back to `/login`. Now waits until the URL is off `/login`.
4. **Post-Submit redirect target changed.** Registration now lands on
   `/shesha/workflow?id=<instanceId>`, not `workflows-my-items`. Spec accepts either; plan step 35
   updated.
5. **Live → Latest was never being switched.** Added a `switchToLatest()` helper called after every
   login (the mode resets on each login), and made it an explicit plan step (TC-01 steps 9–10).

## Environment observations (post-deployment)
- Header is now **`Shesha/header v28`**; a new **"Live Mode / Switch to Edit mode"** switch sits beside
  the view-mode toggle.
- The view-mode toggle is `span.sha-config-item-mode-toggler` (an `ant-tag`, not a button) →
  dropdown of **Live / Ready / Latest**.
- View-mode availability is **permission-dependent, not simply admin-only**: `Admin` and `ThabisoM`
  both have the toggle; `H19234198` (Tshianeo) does **not** — her header shows only a `sha-status-tag`
  "LIVE" badge.
- `workflows-inbox` resolves to **v16** in Latest vs **v13** in Live, so Latest genuinely exercises
  different form versions on this build.
- BAS register form on QA is `…RegisterScanandUploadInvoices-Create` **v9** (no Order Line Items panel;
  that is a LOGIS/TEST-only thing).
- **Actor map differs from the older QA notes:** *Verify Voucher* and *Authorise Invoice Voucher* were
  **not** available to `ThabisoM` — they routed to Hester Harding / Tshianeo Maboya (`H19234198`).
  *Capture Filing* routed to `Mutshutshut`, not Susanna.

## Artifacts
- BAS report: `test-data/bas-text-report-PAY3306.txt`
- Payment stub: `test-data/payment-stub-PAY3306.txt`

## Not covered
- TC-06 / TC-08 / TC-09 — the reject and query branches. TC-08/TC-09 remain gated on a test account in
  the query-responder role (long-standing).
- LOGIS was not run this session.
- Orphans left on QA from the earlier aborted spec runs: PAY3302 (draft), PAY3310, PAY3314, PAY3318.
