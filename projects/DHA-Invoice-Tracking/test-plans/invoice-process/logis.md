# LOGIS — Invoice Tracking Process

> **Source:** Azure DevOps test plan #102133 "ITS Automation Test Cases", suite #102170 "LOGIS".
> **App:** Invoice Tracking (ITS) Admin Portal — https://pd-invtracking-adminportal-qa.azurewebsites.net/login (QA)
> **Login:** ThulileM / 123qwe (see CLAUDE.md). Role accounts confirmed for BAS reused here.

This plan covers the **LOGIS Request for Payment** invoice lifecycle. Unlike BAS, LOGIS is **order-driven**: registration links the invoice to a confirmed **Order** (supplier/business-unit auto-populate), and the **Payment Number is captured manually** at the *Capture and Link Invoice on LOGIS* step (not assigned by the BAS-report import). Downstream TCs each assume the invoice from TC-02 has been routed to that step — they are not independently runnable until the preceding step completes.

**Happy path:** Register & Upload → Certify (delivered satisfactory) → Approve Invoice (delivered satisfactory) → Assign Responsible Official → Verify Invoice (Verification Complete) → Capture & Link Invoice on LOGIS (payment no + payment proceeds Yes) → Pre-Authorise Payment → Verify Voucher → Final Authorise Payment (BAS report import) → Attach Payment Stub → Capture Filing.

---

## TC-01 — Login (ThulileM)
**Estimated duration:** 15s
1. NAVIGATE https://pd-invtracking-adminportal-qa.azurewebsites.net/login
2. SNAPSHOT — locate the Username field
3. TYPE Username field with `ThulileM`
4. SNAPSHOT — locate the Password field
5. TYPE Password field with `123qwe`
6. SNAPSHOT — locate the Sign In button
7. CLICK Sign In button
8. WAIT for the Homepage to load
   - ASSERT (BLOCKING) the Homepage is displayed after sign-in

---

## TC-02 — Register and Upload Invoice (ADO #102215)
**Role:** Invoice Capturer. **Estimated duration:** 120s
1. NAVIGATE {APP_URL}/dynamic/Shesha.Workflow/workflows-my-items (sidebar flyout collapses under automation)
2. SNAPSHOT — locate the Create New button
3. CLICK Create New button
   - ASSERT the process list shows BAS / LOGIS Request for Payment
4. SNAPSHOT — locate "Request For Payment" (LOGIS)
5. CLICK Request For Payment (LOGIS) workflow
   - ASSERT the Register and Upload Invoice page is displayed
   - ASSERT Date Received auto-populated with today; future dates not selectable
6. SNAPSHOT — locate the Order No ellipsis
7. CLICK the ellipsis on the Order No field
   - ASSERT a list of confirmed **open** orders is displayed (fully-invoiced orders excluded)
8. SNAPSHOT — locate an order in the list
9. CLICK an order from the list
   - ASSERT the order populates Order No, and auto-fills Supplier Name (read-only), Business Unit (End-User), Email, Order Description
   - ASSERT Supplier Details, Order Details and Supporting Documents are displayed
10. SNAPSHOT — locate the Invoices panel Add icon
11. CLICK the Add icon on the Invoices panel
    - ASSERT mandatory fields highlight red with "this field is required"
12. SNAPSHOT — locate the Cancel icon
13. CLICK the Cancel icon
    - ASSERT validation errors are cleared
14. SNAPSHOT — locate the Invoice Date field
15. CLICK the Invoice Date field; SELECT a current-or-past date
    - ASSERT the selected invoice date is displayed (no future dates)
16. SNAPSHOT — locate the Invoice No. field
17. TYPE Invoice No. with a unique value
18. CLICK the invoice attachment upload control and attach an invoice file
    - ASSERT the invoice attachment is attached
19. SNAPSHOT — locate the Add icon (commit invoice row)
20. CLICK the Add icon
    - ASSERT the invoice row is added and the Order Line Item panel appears below the invoices table
21. SNAPSHOT — locate an order line item
22. SELECT the Order Line Item to invoice
    - ASSERT the Submit button is enabled (over-committing the line amount enforces a motivation attachment)
23. CLICK the supporting-documents upload control and attach a supporting document
24. SNAPSHOT — locate the Submit button
25. CLICK Submit button
    - ASSERT a confirmation dialog "Submit Invoice with Order Line Items" is displayed
26. SNAPSHOT — locate the YES option
27. CLICK YES
    - ASSERT (BLOCKING) the system redirects to the homepage and the item is routed to "Certify Invoice"

---

## TC-03 — Certify Invoice (ADO #102216)
**Role:** Business Unit / Certifier. **Precondition:** item at Certify Invoice. **Estimated duration:** 60s
1. CLICK Invoice Attachment link → ASSERT the invoice attachment downloads
2. SNAPSHOT — locate the Invoice attachment Audit icon
3. CLICK the Invoice attachment Audit icon → ASSERT the audit history is displayed
4. SNAPSHOT — locate the Business Unit Response options
5. CLICK "Goods and Service has been delivered satisfactory - Invoice should be Paid"
   - ASSERT the Submit button is active
6. SNAPSHOT — locate the Submit button
7. CLICK Submit button
   - ASSERT (BLOCKING) routed to "Approve Invoice" (org structure routes to the correct approver)

> **Branches (separate runs):** "I am the wrong person to confirm the delivery" → Re-route to Correct Business Unit (TC-04); "not delivered / unacceptable" → Review Invoice Rejection (TC-06).

---

## TC-04 — Re-route to Correct Business Unit/End-User (ADO #102233)
**Precondition:** item at Re-route step (from a "wrong person" certification). **Estimated duration:** 45s
1. CLICK Invoice Attachment link → ASSERT downloads
2. SNAPSHOT — locate the Business Unit/End-User field
3. CLICK the Business Unit/End-User field → ASSERT a list of users is displayed
4. SNAPSHOT — locate a user in the list
5. CLICK / search and select the correct Business Unit/End-User
   - ASSERT the user is displayed and the Submit button is active
6. SNAPSHOT — locate the Submit button
7. CLICK Submit button
   - ASSERT (BLOCKING) routed back to "Certify Invoice"

---

## TC-05 — Approve Invoice (ADO #102232)
**Role:** Approver. **Precondition:** item at Approve Invoice. **Estimated duration:** 45s
1. CLICK Invoice Attachment link → ASSERT downloads
2. SNAPSHOT — locate the Invoice attachment Audit icon
3. CLICK the Audit icon → ASSERT audit history displayed
4. SNAPSHOT — locate the Business Unit Response options
5. CLICK "Goods and Service has been delivered satisfactory - Invoice should be Paid"
   - ASSERT the Submit button is active
6. SNAPSHOT — locate the Submit button
7. CLICK Submit button
   - ASSERT (BLOCKING) routed to "Assign Responsible Official"

> **Branch:** "not delivered / unacceptable" → Review Invoice Rejection (TC-06).

---

## TC-06 — Review Invoice Rejection (ADO #102239)
**Precondition:** item at Review Invoice Rejection. **Estimated duration:** 60s
1. CLICK Invoice Attachment link → ASSERT downloads
2. SNAPSHOT — locate the Verification Outcome options
3. CLICK "Approve Rejection" → ASSERT Submit active
4. SNAPSHOT — locate the Submit button
5. CLICK Submit button → ASSERT the Approve Payment Rejection dialog is displayed
6. SNAPSHOT — locate the Comments field
7. TYPE Comments with a rejection reason → ASSERT the Ok button is active
8. SNAPSHOT — locate the Ok button
9. CLICK Ok
   - ASSERT (BLOCKING) redirected to landing page; workflow ends with status Rejected

> **Send-back branch:** "Send for Invoice Verification" + comments returns the item to its prior step.

---

## TC-07 — Assign Responsible Official (ADO #102242)
**Precondition:** item at Assign Responsible Official. **Estimated duration:** 45s
1. CLICK Invoice Attachment link → ASSERT downloads
2. SNAPSHOT — locate the Official field
3. CLICK the Official field → ASSERT a list of users is displayed
4. SNAPSHOT — locate an official in the list
5. CLICK / search and select an Official
   - ASSERT the official is displayed and the Submit button is active
6. SNAPSHOT — locate the Submit button
7. CLICK Submit button
   - ASSERT (BLOCKING) routed to "Verify Invoice"

---

## TC-08 — Verify Invoice (ADO #102246)
**Role:** Verifier. **Precondition:** item at Verify Invoice. **Estimated duration:** 60s
1. CLICK Invoice Attachment link → ASSERT downloads
2. SNAPSHOT — locate the Order Matching Outcome options
3. CLICK "Verification is Complete"
   - ASSERT the Submit button is active
4. SNAPSHOT — locate the Submit button
5. CLICK Submit button → ASSERT the Business Unit Response checklist is validated
6. SNAPSHOT — locate the Business Unit Response checklist
7. CLICK / update the Business Unit Response checklist → ASSERT checklist updated
8. SNAPSHOT — locate the Submit button
9. CLICK Submit button
   - ASSERT (BLOCKING) routed to "Capture and Link Invoice on LOGIS"

> **Branches:** "Send for Business Related Query" → Business Related Query (TC-09); "Send for Supplier related query" → Supplier Related Query (TC-10); "Reject Invoice" → Review Invoice Rejection (TC-06).

---

## TC-09 — Respond to Queries / Business Related Query (ADO #102393)
**Precondition:** item at Business Related Query. **Estimated duration:** 30s
1. CLICK Invoice Attachment link → ASSERT downloads
2. ASSERT the confirmation message enables the Submit button
3. SNAPSHOT — locate the Submit button
4. CLICK Submit button
   - ASSERT (BLOCKING) routed back to the step it came from (Verify Invoice or Prepare Voucher)
5. SNAPSHOT — locate the Close button
6. CLICK Close → ASSERT returns to the landing page

---

## TC-10 — Manage Supplier related Queries (ADO #102397)
**Precondition:** item at Supplier Related Query. **Estimated duration:** 30s
1. CLICK Invoice Attachment link → ASSERT downloads
2. ASSERT the confirmation message enables the Submit button
3. SNAPSHOT — locate the Submit button
4. CLICK Submit button
   - ASSERT (BLOCKING) routed back to the step it came from (Verify Invoice or Prepare Voucher)
5. SNAPSHOT — locate the Close button
6. CLICK Close → ASSERT returns to the landing page

---

## TC-11 — Capture and Link Invoice on LOGIS (ADO #102249)
**Role:** LOGIS Capturer. **Precondition:** item at Capture and Link Invoice on LOGIS. **Estimated duration:** 60s
1. CLICK Invoice Attachment link → ASSERT downloads
2. SNAPSHOT — locate the Payment Number field
3. CLICK the Payment Number field → ASSERT the field is active
4. TYPE Payment Number with a value
   - ASSERT the payment number is displayed
5. SNAPSHOT — locate the Save icon
6. CLICK the Save icon → ASSERT the payment number is saved
7. SNAPSHOT — locate "Should payment proceed"
8. SELECT Yes on "Should payment proceed"
   - ASSERT Yes is selected
9. ASSERT the confirmation message enables the Submit button (all mandatory fields captured)
10. SNAPSHOT — locate the Submit button
11. CLICK Submit button
    - ASSERT (BLOCKING) routed to "Pre-Authorise Payment"

> **Branch:** selecting "No" on Should payment proceed reveals Verify Invoice / Send to Business Unit options (each needs a mandatory comment) and routes accordingly.

---

## TC-12 — Pre-Authorise Payment (ADO #102277)
**Role:** Pre-Authoriser. **Precondition:** item at Pre-Authorise Payment. **Estimated duration:** 45s
1. CLICK Invoice Attachment link → ASSERT downloads
2. ASSERT the confirmation message deactivates "Send Back to Capture" and enables the Submit button
3. SNAPSHOT — locate the Submit button
4. CLICK Submit button
   - ASSERT (BLOCKING) routed to "Verify Voucher"

> **Send-back branch:** "Send Back to Capture" can return the item (with a mandatory comment) to Register and Upload Invoice or Certify Invoice only.

---

## TC-13 — Verify Voucher (ADO #102283)
**Role:** Verifier. **Precondition:** item at Verify Voucher. **Estimated duration:** 30s
1. CLICK Invoice Attachment link → ASSERT downloads
2. ASSERT the confirmation message enables the Submit button
3. SNAPSHOT — locate the Submit button
4. CLICK Submit button
   - ASSERT (BLOCKING) routed to "Final Authorise Payment"
5. SNAPSHOT — locate the Close button
6. CLICK Close → ASSERT returns to landing page

---

## TC-14 — Final Authorise Payment (ADO #102284)
**Role:** Payments. **Precondition:** item at Final Authorise Payment. **Estimated duration:** 90s
1. SNAPSHOT — locate the BAS Report menu item
2. CLICK BAS Report → BAS Report Import (open via direct URL `/dynamic/Shesha.SaGovInvoiceTracking/SaGov-BAS-report-import`)
   - ASSERT the BAS Report Import view opens with Import and History tabs
3. CLICK Import tab
4. CLICK Press to Upload and select a BAS report file (edited in place per memory its-bas-report-field-mapping; LOGIS Source Doc Type = "INV")
   - ASSERT the Import button becomes active
5. SNAPSHOT — locate the Import button
6. CLICK Import button
   - ASSERT the report imports and pending payments are auto-authorised
7. CLICK History tab → ASSERT audit history + total authorised payments shown
8. ASSERT (BLOCKING) the import row shows Is Success = Yes and Payments Authorised ≥ 1; item routed to "Attach Payment Stub"

---

## TC-15 — Attach Payment Stub (ADO #102285)
**Role:** Payments. **Precondition:** item at Attach Payment Stub. **Estimated duration:** 90s
1. CLICK Payments Stubs Import → Import Payment Stub (URL `/dynamic/Shesha.SaGovInvoiceTracking/SaGov-payment-stub-imports`)
   - ASSERT the Payment Stub Import page with Import and History tabs
2. CLICK Import tab
3. CLICK Press to Upload and select a Payment Stub file (fixed-width .txt edited per memory; matches on PAYMENT NUMBER)
   - ASSERT the Import button becomes active
4. SNAPSHOT — locate the Import button
5. CLICK Import button
   - ASSERT the stub imports, the payment is authorised and the invoice status updates to Paid
6. CLICK History tab → ASSERT audit history + total confirmed payments shown
7. ASSERT (BLOCKING) the import row shows Is Success = Yes and Payments Confirmed ≥ 1; item routed to "Capture Filing"

---

## TC-16 — Capture Filing (ADO #102286)
**Role:** Filing (GwenB / Gwen Simbeni). **Precondition:** item at Capture Filing. **Estimated duration:** 45s
1. CLICK Invoice Attachment link → ASSERT downloads
2. ASSERT the Batch Number is pre-populated read-only (from Capture and Link Invoice on LOGIS)
3. SNAPSHOT — locate the Box Number field
4. CLICK Box Number field; TYPE a valid box number → ASSERT box number populated
5. SNAPSHOT — locate the File Range field
6. CLICK File Range field; TYPE valid file range details → ASSERT file range populated
7. SNAPSHOT — locate the confirm checkbox
8. CLICK the confirmation checkbox (Submit inactive until all required fields are actioned)
9. SNAPSHOT — locate the Submit button
10. CLICK Submit button
    - ASSERT (BLOCKING) redirected to landing page; the process ends and the payment item is filed
