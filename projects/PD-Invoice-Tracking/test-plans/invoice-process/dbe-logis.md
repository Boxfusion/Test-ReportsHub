# DBE LOGIS — Invoice Tracking Process

> **Source:** Azure DevOps test plan #102133 "ITS Automation Test Cases".
> **App:** Invoice Tracking (ITS) Admin Portal — https://pd-invoicetracking-adminportal-qa.shesha.app/login (QA, DBE tenant)
> **Process:** **DBE LOGIS Request For Payment** — select it EXACTLY; `LOGIS Request For Payment` sits
> directly below it on the same Create New menu and is a *different* process (see `logis.md`).

This plan covers the **DBE LOGIS Request For Payment** lifecycle. Like LOGIS it is **order-driven**, but
its step names and actors differ, and its register form carries two extra fields — **End-user** (the
LOGIS `Business Unit` equivalent) and **LOGIS Capturer** — plus a **Park Invoice** action alongside
Submit.

**Step → actor** (supplied by the user 2026-09-14; all passwords `123qwe`):

| Step | Actor |
|---|---|
| Register Invoice | JohanV |
| Match to Order and Verify | JohanV |
| Review Invoice Rejection | JohanV |
| Resolve End User related queries | JohanV |
| Resolve Supplier related queries | *Invoice Capturer* (role name given — username unconfirmed) |
| End User Confirm Delivery | ThabisoM |
| Reroute to correct end-user | JohanV |
| Supervisor Confirm Delivery | LeratoM |
| Capture and Link Invoice on LOGIS | ThabisoM |
| Pre-Authorise Payment | FatimaP |
| Authorise Payment | FatimaP |
| Attach Payment Stub | Admin |

> **Actor ≠ nominee.** As on the other processes, the person named on a form is who the step is being
> assigned *to*, not necessarily who actions it. The table above is the login to use.

> **Register form fields decide downstream routing:** **End-user** picks who does *End User Confirm
> Delivery*; **LOGIS Capturer** picks who does *Capture and Link Invoice on LOGIS*. Both should be set
> to accounts we hold credentials for, or the chain stalls on an inbox we cannot open.

---

## TC-01 — Login (JohanV)
**Estimated duration:** 15s
1. NAVIGATE https://pd-invoicetracking-adminportal-qa.shesha.app/login
2. TYPE Username field with `JohanV`
3. TYPE Password field with `123qwe`
4. CLICK Sign In button
   - ASSERT (BLOCKING) the Homepage is displayed after sign-in

> JohanV is **not** an admin — he has no `Live | Ready | Latest` view-mode control at all, so a run as
> JohanV exercises the **published (Live)** form versions. Do not call `switchToLatest()` for him.

---

## TC-02 — Register Scan and Upload Invoice
**Role:** Invoice Capturer (JohanV). **Estimated duration:** 150s
1. NAVIGATE {APP_URL}/dynamic/Shesha.Workflow/workflows-my-items
2. CLICK Create New button
   - ASSERT the process list shows DBE LOGIS Request For Payment / LOGIS Request For Payment / Order Uploading / Request For Payment
3. CLICK **DBE LOGIS Request For Payment** (EXACT match)
   - ASSERT the **Register Scan and Upload Invoice** page is displayed
   - ASSERT Date Received is auto-populated with today's date
4. CLICK the ellipsis on the Order No field
   - ASSERT the "Select Item" order picker opens (columns: Order No, Ordered Date, Order Amount, Order Type, End User, Order Description)
5. DOUBLE-CLICK an order to select it
   - ASSERT Order No is populated and Supplier Details / Order Details / Supporting Documents load
   - **End-user** auto-fills from the order's End User when that maps to a portal user, else stays blank
6. SELECT **End-user** = the account that must do *End User Confirm Delivery* (ThabisoM)
7. SELECT **LOGIS Capturer** = the account that must do *Capture and Link Invoice on LOGIS* (ThabisoM)
8. CLICK the Add icon on the Invoices panel with the row empty
   - ASSERT mandatory fields highlight as required
9. CLICK the Cancel icon
   - ASSERT the validation errors are cleared
10. SELECT Invoice Date — a current-or-past date
11. SELECT Service Delivery Date — a current-or-past date
12. TYPE Invoice No. with a unique value
    - ASSERT the populated invoice number is displayed
    - ⚠️ The Invoices row's first two textboxes are date pickers (placeholder "Select date"); Invoice No is the first **plain** input
13. TYPE Invoice Amount
14. CLICK the invoice attachment upload control and attach a file
    - ⚠️ WAIT for the upload to COMPLETE (the rendered file SIZE appears), not just for the filename — committing the row mid-upload fails with "Create failed" and silently loses the row
15. CLICK the Add (plus-circle) icon
    - ASSERT the invoice row is added and Total Amount reflects the invoice amount
16. CLICK Submit
    - ASSERT (BLOCKING) the item leaves the register step and is routed to **Match to Order and Verify**

> **Park Invoice branch (separate run):** this process also offers **Park Invoice** alongside Submit —
> not present on plain LOGIS. Its behaviour is **not yet recorded**.

---

## TC-03 — Match to Order and Verify
**Role:** JohanV. **Precondition:** item at Match to Order and Verify. **Estimated duration:** 60s

*Not yet recorded — steps to be captured live.*

---

## TC-04 — End User Confirm Delivery
**Role:** ThabisoM (whoever was set as **End-user** at registration). **Precondition:** item at End User Confirm Delivery.

*Not yet recorded.*

---

## TC-05 — Supervisor Confirm Delivery
**Role:** LeratoM. **Precondition:** item at Supervisor Confirm Delivery.

*Not yet recorded.*

---

## TC-06 — Capture and Link Invoice on LOGIS
**Role:** ThabisoM (whoever was set as **LOGIS Capturer** at registration).

*Not yet recorded.*

---

## TC-07 — Pre-Authorise Payment
**Role:** FatimaP.

*Not yet recorded.*

---

## TC-08 — Authorise Payment
**Role:** FatimaP.

*Not yet recorded.*

---

## TC-09 — Attach Payment Stub
**Role:** Admin. Completes by **file import**, not a form action — see `logis.md` TC-15 and
`projects/DHA-Invoice-Tracking/scripts/make-payment-stub.js` (LOGIS matches the stub on **Purchase
Order Number**).

*Not yet recorded for this process.*

---

## Branches (each a separate run, none yet recorded)

- **Review Invoice Rejection** (JohanV)
- **Resolve End User related queries** (JohanV)
- **Resolve Supplier related queries** (*Invoice Capturer* — username unconfirmed)
- **Reroute to correct end-user** (JohanV)
