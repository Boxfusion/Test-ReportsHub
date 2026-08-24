# BAS — Invoice Tracking Process

> **Source:** Azure DevOps test plan #102133 "ITS Automation Test Cases", suite #102355 "BAS".
> **App:** DHA SmartGov Invoice Tracking (ITS) Admin Portal — https://dha-smartgov-adminportal-qa.shesha.app/login (QA)
> **Login:** `Admin` (initiator) then `ThabisoM` for the Finance Unit hand-offs — see CLAUDE.md for the full actor map.
> **View mode:** switch Live → **Latest** immediately after every login (it resets to Live each time; Admin only).

This plan covers the full **BAS Request for Payment** invoice lifecycle as one chain. In production each step is actioned by a different role (Invoice Capturer → Branch Finance Admin → Responsible Person → Certifier → Voucher Preparer → Verifier → Authoriser → Payments). Only the `ThulileM` account is confirmed so far; additional role logins are discovered live as steps hand off and recorded in CLAUDE.md. The downstream TCs (TC-03 onward) each assume the invoice from TC-02 has been routed to that step — they are **not** independently runnable until the preceding step completes.

**Run order today:** TC-01 (login) → TC-02 (Register and Upload Invoice).

---

## TC-01 — Login (ThulileM)
**Estimated duration:** 15s

1. NAVIGATE https://pd-invtracking-adminportal-qa.azurewebsites.net/login
2. SNAPSHOT — locate the Username field
3. TYPE Username field with `ThulileM`
4. SNAPSHOT — locate the Password field
5. TYPE Password field with `123qwe`
   - ASSERT the populated Username and Password are displayed in their respective fields
6. SNAPSHOT — locate the Sign In button
7. CLICK Sign In button
8. WAIT for the Homepage to load
   - ASSERT (BLOCKING) the Homepage is displayed after sign-in
9. SNAPSHOT — locate the view-mode toggle in the header (reads "Live")
10. CLICK the view-mode toggle and SELECT "Latest"
    - ASSERT the toggle reads "Latest" (skip for non-admin users — their header has no toggle)

---

## TC-02 — Register and Upload Invoice (ADO #102362)
**Role:** Invoice Capturer. **Estimated duration:** 120s

1. SNAPSHOT — locate the Workflow menu item
2. CLICK Workflow menu item
   - ASSERT the sub-menu items (Inbox, My Items, Sent, Drafts) are displayed
3. SNAPSHOT — locate the My Items sub-menu item
4. CLICK My Items submenu item
   - ASSERT the My Items page is displayed with Create New and Export buttons
5. SNAPSHOT — locate the Create New button
6. CLICK Create New button
   - ASSERT the list of processes is displayed (BAS / LOGIS Request for Payment)
7. SNAPSHOT — locate the BAS Request for Payment option
8. CLICK BAS Request for Payment workflow
   - ASSERT the Register and Upload Invoice page is displayed
   - ASSERT the Date Received field is auto-populated with today's date
9. SNAPSHOT — locate the Date Received field
10. CLICK Date Received field
    - ASSERT a Date Picker is displayed
11. SELECT Date Received — choose a valid current-or-past date (future dates must not be selectable)
    - ASSERT the chosen date is displayed and no future date is accepted
12. SNAPSHOT — locate the Supplier Name ellipsis
13. CLICK the ellipsis on the Supplier Name field
    - ASSERT a list of confirmed suppliers is displayed
14. SNAPSHOT — locate a supplier in the list
15. CLICK a Supplier Name from the list
    - ASSERT the selected supplier is displayed in the Supplier Name field
    - ASSERT the read-only Supplier Details are displayed
16. SNAPSHOT — locate the Invoices panel Add icon
17. CLICK the Add icon on the Invoices panel
    - ASSERT mandatory fields are highlighted in red with "this field is required"
18. SNAPSHOT — locate the Cancel icon
19. CLICK the Cancel icon
    - ASSERT the validation errors are cleared
20. SNAPSHOT — locate the Invoice Date field
21. CLICK the Invoice Date field
    - ASSERT a Date Picker is displayed
22. SELECT Invoice Date — choose a current-or-past date from the picker
    - ASSERT the selected invoice date is displayed
23. SNAPSHOT — locate the Service Delivery field
24. CLICK the Service Delivery field
    - ASSERT a Date Picker is displayed
25. SELECT Service Delivery Date from the picker
    - ASSERT the selected service delivery date is displayed
26. SNAPSHOT — locate the Invoice No. field
27. TYPE Invoice No. field with a unique invoice number
    - ASSERT the populated invoice number is displayed
28. SNAPSHOT — locate the Invoice Amount field
29. TYPE Invoice Amount field with a valid amount
    - ASSERT the invoice amount is displayed
30. CLICK the invoice attachment upload control and attach an invoice file
    - ASSERT the invoice attachment is attached
31. SNAPSHOT — locate the Add icon (commit invoice row)
32. CLICK the Add icon
    - ASSERT the invoice row is added to the Invoices panel and the Total sums all invoice amounts
33. CLICK the supporting-documents upload control and attach a supporting document
34. SNAPSHOT — locate the Submit button
35. CLICK Submit button
    - ASSERT (BLOCKING) the system redirects away from the action form — on the current build it lands
      on the read-only workflow view (`/shesha/workflow?id=<instanceId>`); older builds returned to
      My Items — and the item is routed to the "Assign Branch Finance Admin to Assign Certifier" step

---

## TC-03 — Assign Branch Finance Admin to Assign Certifier (ADO #102369)
**Role:** Branch Finance Admin. **Precondition:** item at "Assign Branch Finance Admin" step (from TC-02). **Estimated duration:** 60s

1. SNAPSHOT — locate the Invoice Attachment link
2. CLICK Invoice Attachment link
   - ASSERT the invoice attachment downloads
3. SNAPSHOT — locate the Invoice attachment Audit icon
4. CLICK the Invoice attachment Audit icon
   - ASSERT the invoice attachment audit history is displayed
5. SNAPSHOT — locate the Branch Finance Admin field
6. CLICK Branch Finance Admin field
   - ASSERT a list of officials is displayed
7. SNAPSHOT — locate an official in the list
8. CLICK / search and select an Official
   - ASSERT the official is displayed in the Branch Finance Admin field and the Submit button is active
9. SNAPSHOT — locate the Submit button
10. CLICK Submit button
    - ASSERT (BLOCKING) the user is redirected to the landing page and the item is routed to "Assign Responsible Person to Certify Invoice" step
11. SNAPSHOT — locate the Close button
12. CLICK Close button
    - ASSERT the details page closes and the user returns to the landing page

---

## TC-04 — Assign Responsible Person to Certify Invoices (ADO #102370)
**Role:** Branch Finance Admin. **Precondition:** item at "Assign Responsible Person" step. **Estimated duration:** 60s

1. SNAPSHOT — locate the Invoice Attachment link
2. CLICK Invoice Attachment link
   - ASSERT the invoice attachment downloads
3. SNAPSHOT — locate the Invoice attachment Audit icon
4. CLICK the Invoice attachment Audit icon
   - ASSERT the invoice attachment audit history is displayed
5. SNAPSHOT — locate the Official field
6. CLICK Official field
   - ASSERT a list of officials is displayed
7. SNAPSHOT — locate an official in the list
8. CLICK / search and select an Official
   - ASSERT the official is displayed in the Official field and the Submit button is active
9. SNAPSHOT — locate the Submit button
10. CLICK Submit button
    - ASSERT (BLOCKING) the user is redirected to the landing page and the item is routed to "Certify Invoice" step
11. SNAPSHOT — locate the Close button
12. CLICK Close button
    - ASSERT the details page closes and the user returns to the landing page

---

## TC-05 — Certify Invoice (ADO #102372)
**Role:** Certifier (Responsible Person). **Precondition:** item at "Certify Invoice" step. **Estimated duration:** 60s

1. SNAPSHOT — locate the Invoice Attachment link
2. CLICK Invoice Attachment link
   - ASSERT the invoice attachment downloads
3. SNAPSHOT — locate the Invoice attachment Audit icon
4. CLICK the Invoice attachment Audit icon
   - ASSERT the invoice attachment audit history is displayed
5. SNAPSHOT — locate the Business Unit Response options
6. CLICK "Goods and Service has been delivered satisfactory - Invoice should be Paid"
   - ASSERT the Submit button is active
7. SNAPSHOT — locate the Submit button
8. CLICK Submit button
   - ASSERT (BLOCKING) the user is redirected to the landing page and the item is routed to "Prepare Voucher" step

> **Negative branch (separate run):** selecting "Goods or Service has not been delivered… - Invoice should not be paid" routes the item to "Review Invoice Rejection" (TC-06).

---

## TC-06 — Review Invoice Rejection (ADO #102378)
**Role:** Reviewer. **Precondition:** item at "Review Invoice Rejection" step (from a rejected certification). **Estimated duration:** 60s

1. SNAPSHOT — locate the Invoice Attachment link
2. CLICK Invoice Attachment link
   - ASSERT the invoice attachment downloads
3. SNAPSHOT — locate the Invoice attachment Audit icon
4. CLICK the Invoice attachment Audit icon
   - ASSERT the invoice attachment audit history is displayed
5. SNAPSHOT — locate the Verification Outcome options
6. CLICK "Approve Rejection"
   - ASSERT the Submit button is active
7. SNAPSHOT — locate the Submit button
8. CLICK Submit button
   - ASSERT the Approve Payment Rejection dialog is displayed
9. SNAPSHOT — locate the Comments field
10. TYPE Comments field with a rejection reason
    - ASSERT the Ok button is active
11. SNAPSHOT — locate the Ok button
12. CLICK Ok button
    - ASSERT (BLOCKING) the user is redirected to the landing page and the workflow ends with status Rejected

> **Send-back branch (separate run):** selecting "Send for Invoice Verification" + comments returns the item to its prior step (Prepare Voucher / Certify Invoice / Approve Invoice).

---

## TC-07 — Prepare Voucher (ADO #102361)
**Role:** Voucher Preparer. **Precondition:** item at "Prepare Voucher" step. **Estimated duration:** 60s

1. SNAPSHOT — locate the Invoice Attachment link
2. CLICK Invoice Attachment link
   - ASSERT the invoice attachment downloads
3. SNAPSHOT — locate the Invoice attachment Audit icon
4. CLICK the Invoice attachment Audit icon
   - ASSERT the invoice attachment audit history is displayed
5. SNAPSHOT — locate the Outcome options
6. CLICK "Verification is Complete" under Outcome
   - ASSERT the Submit button is active
7. SNAPSHOT — locate the Submit button
8. CLICK Submit button
   - ASSERT the Business Unit Response checklist is validated
9. SNAPSHOT — locate the Business Unit Response checklist
10. CLICK / update the Business Unit Response checklist
    - ASSERT the checklist is updated
11. SNAPSHOT — locate the Submit button
12. CLICK Submit button
    - ASSERT (BLOCKING) the user is redirected to the landing page and the item is routed to "Verify Voucher" step

> **Query branches (separate runs):** "Send for Business Related Query" routes to Business Related Query; "Send for Supplier related query" routes to Supplier Related Query; "Reject Invoice" routes to Review Invoice Rejection.

---

## TC-08 — Respond to Queries / Business Related Query (ADO #102398)
**Role:** Business Unit responder. **Precondition:** item at "Business Related Query" step. **Estimated duration:** 30s

1. SNAPSHOT — locate the Invoice Attachment link
2. CLICK Invoice Attachment link
   - ASSERT the invoice attachment downloads
3. SNAPSHOT — locate the Invoice attachment Audit icon
4. CLICK the Invoice attachment Audit icon
   - ASSERT the invoice attachment audit history is displayed
5. ASSERT the confirmation message enables the Submit button
6. SNAPSHOT — locate the Submit button
7. CLICK Submit button
   - ASSERT (BLOCKING) the user is redirected to the landing page and the item is routed back to the step it came from (Verify Invoice or Prepare Voucher)
8. SNAPSHOT — locate the Close button
9. CLICK Close button
   - ASSERT the payment details view closes and the user returns to the landing page

---

## TC-09 — Manage Supplier related Queries (ADO #102399)
**Role:** Supplier-query handler. **Precondition:** item at "Supplier Related Query" step. **Estimated duration:** 30s

1. SNAPSHOT — locate the Invoice Attachment link
2. CLICK Invoice Attachment link
   - ASSERT the invoice attachment downloads
3. SNAPSHOT — locate the Invoice attachment Audit icon
4. CLICK the Invoice attachment Audit icon
   - ASSERT the invoice attachment audit history is displayed
5. ASSERT the confirmation message enables the Submit button
6. SNAPSHOT — locate the Submit button
7. CLICK Submit button
   - ASSERT (BLOCKING) the user is redirected to the landing page and the item is routed back to the step it came from (Verify Invoice or Prepare Voucher)
8. SNAPSHOT — locate the Close button
9. CLICK Close button
   - ASSERT the payment details view closes and the user returns to the landing page

---

## TC-10 — Verify Voucher (ADO #102380)
**Role:** Verifier. **Precondition:** item at "Verify Voucher" step. **Estimated duration:** 60s

1. SNAPSHOT — locate the Invoice Attachment link
2. CLICK Invoice Attachment link
   - ASSERT the invoice attachment downloads
3. SNAPSHOT — locate the Invoice attachment Audit icon
4. CLICK the Invoice attachment Audit icon
   - ASSERT the invoice attachment audit history is displayed
5. SNAPSHOT — locate the Batch Number field
6. CLICK Batch Number field
   - ASSERT the Batch Number field is active
7. TYPE Batch Number field with a valid batch number
   - ASSERT the batch number is populated
8. ASSERT the confirmation message enables the Submit button
9. SNAPSHOT — locate the Submit button
10. CLICK Submit button
    - ASSERT (BLOCKING) the user is redirected to the landing page and the item is routed to "Authorise Invoice Voucher" step
11. SNAPSHOT — locate the Close button
12. CLICK Close button
    - ASSERT the payment details view closes and the user returns to the landing page

---

## TC-11 — Authorise Invoice Voucher (ADO #102383)
**Role:** Authoriser. **Precondition:** item at "Authorise Invoice Voucher" step. **Estimated duration:** 30s

1. SNAPSHOT — locate the Invoice Attachment link
2. CLICK Invoice Attachment link
   - ASSERT the invoice attachment downloads
3. SNAPSHOT — locate the Invoice attachment Audit icon
4. CLICK the Invoice attachment Audit icon
   - ASSERT the invoice attachment audit history is displayed
5. ASSERT the confirmation message enables the Submit button
6. SNAPSHOT — locate the Submit button
7. CLICK Submit button
   - ASSERT (BLOCKING) the user is redirected to the landing page and the item is routed to "Final Authorise Payment" step
8. SNAPSHOT — locate the Close button
9. CLICK Close button
   - ASSERT the payment details view closes and the user returns to the landing page

---

## TC-12 — Upload Captured Invoices Report From BAS / Final Authorise Payment (ADO #102360)
**Role:** Payments. **Precondition:** item at "Final Authorise Payment" step. **Estimated duration:** 60s

1. SNAPSHOT — locate the Invoice Attachment link
2. CLICK Invoice Attachment link
   - ASSERT the invoice attachment downloads
3. SNAPSHOT — locate the Invoice attachment Audit icon
4. CLICK the Invoice attachment Audit icon
   - ASSERT the invoice attachment audit history is displayed
5. SNAPSHOT — locate the BAS Report menu item
6. CLICK BAS Report menu item
   - ASSERT the BAS Report Import sub-menu is displayed
7. SNAPSHOT — locate the BAS Report Import menu item
8. CLICK BAS Report Import menu item
   - ASSERT the BAS Report Import view opens with Import and History tabs
9. SNAPSHOT — locate the Import tab
10. CLICK Import tab
    - ASSERT the File to import field with a Press to upload link is displayed
11. CLICK Press to Upload link and select a BAS report file
    - ASSERT the BAS report is attached and the Import button becomes active
12. SNAPSHOT — locate the Import button
13. CLICK Import button
    - ASSERT the BAS report imports and payments pending final authorisation are auto-authorised
14. SNAPSHOT — locate the History tab
15. CLICK History tab
    - ASSERT the audit history and total authorised payments are displayed
16. SNAPSHOT — locate the Export button
17. CLICK Export button under History tab
    - ASSERT the history exports as an .xlsx file
18. SNAPSHOT — locate the item in the list
19. CLICK / open the item
    - ASSERT (BLOCKING) the Final Authorise Payment step completes and the item is routed to "Attach Payment Stub" step

---

## TC-13 — Attach Payment Stub (ADO #102359)
**Role:** Payments. **Precondition:** item at "Attach Payment Stub" step. **Estimated duration:** 60s

1. SNAPSHOT — locate the Invoice Attachment link
2. CLICK Invoice Attachment link
   - ASSERT the invoice attachment downloads
3. SNAPSHOT — locate the Invoice attachment Audit icon
4. CLICK the Invoice attachment Audit icon
   - ASSERT the invoice attachment audit history is displayed
5. SNAPSHOT — locate the Payments Stubs Import menu item
6. CLICK Payments Stubs Import menu item
   - ASSERT Import Payment Stub and Payment Stubs Dashboard are displayed
7. SNAPSHOT — locate the Import Payment Stub sub-menu item
8. CLICK Import Payment Stub sub-menu item
   - ASSERT the Payment Stub Import page is displayed with Import and History tabs
9. SNAPSHOT — locate the Import tab
10. CLICK Import tab
    - ASSERT the File to import field with a Press to upload link is displayed
11. CLICK Press to Upload link and select a Payment Stub file
    - ASSERT the Payment Stub is attached and the Import button becomes active
12. SNAPSHOT — locate the Import button
13. CLICK Import button
    - ASSERT the Payment Stub imports, pending invoices are processed, payment is authorised and invoice status updates to Paid
14. SNAPSHOT — locate the History tab
15. CLICK History tab
    - ASSERT the audit history and total confirmed payments are displayed
16. SNAPSHOT — locate the Export button
17. CLICK Export button under History tab
    - ASSERT the history exports as an .xlsx file
18. SNAPSHOT — locate the item in the list
19. CLICK / open the item
    - ASSERT (BLOCKING) the Attach Payment Stub step completes and the item is routed to "Capture Filing" step

---

## TC-14 — Capture Filing (ADO #102358)
**Role:** Filing. **Precondition:** item at "Capture Filing" step. **Estimated duration:** 60s

1. SNAPSHOT — locate the Invoice Attachment link
2. CLICK Invoice Attachment link
   - ASSERT the invoice attachment downloads
3. SNAPSHOT — locate the Invoice attachment Audit icon
4. CLICK the Invoice attachment Audit icon
   - ASSERT the invoice attachment audit history is displayed
5. ASSERT the Batch number is pre-populated read-only (from Capture and Link Invoice on the LOGIS step)
6. SNAPSHOT — locate the Box Number field
7. CLICK Box Number field
   - ASSERT the Box Number field is active
8. TYPE Box Number field with a valid box number
   - ASSERT the box number is populated
9. SNAPSHOT — locate the File Range field
10. CLICK File Range field
    - ASSERT the File Range field is active
11. TYPE File Range field with valid file range details
    - ASSERT the file range is populated
12. ASSERT the confirmation message activates the Submit button (Submit stays inactive until all required fields are actioned)
13. SNAPSHOT — locate the Submit button
14. CLICK Submit button
    - ASSERT (BLOCKING) the user is redirected to the landing page, the process ends and the payment item is filed
