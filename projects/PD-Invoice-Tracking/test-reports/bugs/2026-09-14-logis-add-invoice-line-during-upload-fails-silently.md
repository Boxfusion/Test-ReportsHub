# Bug: Adding an invoice line while its attachment is still uploading fails with "Create failed" and loses the row

**Logged:** 2026-09-14
**App:** Invoice Tracking (ITS) Admin Portal — https://pd-invoicetracking-adminportal-qa.shesha.app (QA, Shesha-hosted)
**Process:** LOGIS Request For Payment → *Register and Upload Invoice*
**Form:** `Shesha.SaGovInvoiceTracking/SAGovRequestForPayment-wf-RegisterScanandUploadInvoices-Create v22` (served **Live**)
**Account:** JohanV (Register Invoice actor)
**Severity:** Low–Medium — recoverable by retrying, but the failure is silent and non-actionable
**Status:** Open

## Summary

On the Invoices panel, the **Add (plus-circle)** control is clickable while the invoice attachment is
still uploading. Clicking it during that window fails with a **"Create failed"** tooltip: the row is not
added, the table stays on *No Data / Total Amount: R0*, and the message does not say why or what to do.

The filename renders in the Attachment cell as soon as the file is queued, so the row *looks* complete
before the upload has actually finished — which is what makes this easy to hit, by a human or a script.

## Steps to reproduce

1. Log in as **JohanV / 123qwe**.
2. Workflows → My Items → **Create New** → **LOGIS Request For Payment** (exact — not *DBE LOGIS*).
3. Pick any order via the **Order No** ellipsis, and set **Business Unit** (required; Submit stays
   disabled until it is set).
4. Fill the invoice line: Invoice Date = today, Service Delivery Date = today, Invoice No = unique,
   Invoice Amount = `100`.
5. Attach a PDF via the row's upload control, and **click Add (plus-circle) as soon as the filename
   appears**, without waiting for the rendered file size.

## Expected

Either the row is committed once the upload settles, or **Add is disabled / the click is queued** while
an attachment is in flight. If it must fail, the message should say the attachment is still uploading.

## Actual

A **"Create failed"** tooltip appears on the Add control. The row is not created — *No Data*,
**Total Amount: R0** — despite every field being populated and the attachment eventually completing.

## Evidence

Waiting for the attachment's rendered **size** (e.g. `pdf-test.pdf (20.6 kB)`) before clicking Add makes
the commit succeed every time. Verified by the automated run once that wait was added:

```
[chain] PAY4772/2026 — order OR-124706, invoice INV-LOGIS-1789377576647, business unit Johan VanWyk
✓ TC-02: Register and Upload Invoice — passed
```

Screenshots of the failing state:
`test-results/artifacts/projects-PD-Invoice-Tracki-68e25--Upload-Invoice-ADO-102215--chromium/test-failed-1.png`

## Correction to an earlier reading

This was first written up as *"overriding an order-supplied Business Unit breaks the invoice line"*,
because the failing runs had both an override and a too-early Add. **That causation was not
substantiated** — adding the upload wait fixed the commit without changing the override behaviour.
Whether overriding a pre-filled Business Unit is itself a problem remains **untested**: `logis.spec.ts`
currently skips orders that pre-fill the field, so no run has exercised an override with the upload wait
in place. Worth a deliberate check before drawing any conclusion about that field.
