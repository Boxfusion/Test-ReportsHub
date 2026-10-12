# Test Plan: ELEAVE-LEAVE-CREDITS — Leave Credits (Add, Edit, Audit Trail)

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-10-07
> **Estimated Duration:** 180s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625) |
| ADO Suites | #86624 — addpersonalcredit-dialog · #86632 — edit-dialog · #86647 — viewaudit-details |
| Replaces | `add-personal-credit-dialog.md`, `edit-leave-credits-dialog.md`, `leave-credits-audit-trail.md` |

## Objective
> Validate the full leave-credit lifecycle on **SaGov Leave Management › Leave Balances**: the **Add a New Personal Leave Balance** dialog (Close, mandatory fields, OK), the **Edit Leave Credits** dialog (Close, OK), and the **Leave Credits Audit Trail** (the edit is audited, Export downloads Excel). The test creates its own credit, edits it, checks the audit, and deletes it at the end.

## Test Data
| Field | Value |
|-------|-------|
| Leave Type | `Natural Disasters – Unforeseen` (note the en dash) |
| Person | `Jane Doe` (PERSAL `78545623`) |
| Add — Total / Balance | `5` / `5` |
| Add — Comments | `Automated test credit` |
| Edit — Total / Balance | `7` / `6` |
| Edit — Comments | `Automated test edit` |

> On the Leave Balances table, the dialog's **Balance** field shows in the **Credit** column and **Total** shows in the **Total** column.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] Person `Jane Doe` exists and is selectable in the Person lookup
- [ ] Leave Type `Natural Disasters – Unforeseen` exists
- [ ] Ideally Jane Doe has **no** current-cycle `Natural Disasters – Unforeseen` balance. TC-05 deletes any leftover one from an earlier failed run before adding.

> The test cases run **in order** and share data: TC-05 creates the credit that TC-06 to TC-10 use, and TC-10 deletes it.

## Test Cases

### TC-01 — Login as Admin

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
  2. SNAPSHOT — confirm the Username and Password fields and the Sign In button are visible
  3. TYPE Username field with `admin`
  4. TYPE Password field with `P@ssw0rd`
  5. CLICK the Sign In button
  6. WAIT for the home page to load
- **Expected result:** User is logged in
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the **SaGov Leave Management** menu item is visible

---

### TC-02 — Leave Balances page shows the credit actions

- **Type:** Happy path
- **Steps:**
  1. CLICK **SaGov Leave Management** in the side menu
  2. CLICK **Leave Balances**
  3. WAIT for the table to load
- **Expected result:** The Leave Balances administration table is shown with its toolbar actions
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL contains `/dynamic/SaGov.Leave/sagov-personal-balances` and the heading **Leave Balances** is visible
  - [x] ASSERT The toolbar shows the **Export**, **Add Personal Credit** and **Recalculate Family Leave Balances** buttons and the **View Audit** link
  - [x] ASSERT The table has the columns **Balance Type, Full Name, PERSAL No, Leave Type, Period From, Period To, Credit, Total, Is Current Cycle**

---

### TC-03 — Add Personal Credit: 'Close' closes the dialog without saving (ADO #86626)

*When a user clicks on the 'Close' button, the system should close the dialog*

- **Type:** Happy path
- **Steps:**
  1. Open **Leave Balances** (as in TC-02), set the page size to **100 / page**, and EXTRACT the number of `Jane Doe` / `Natural Disasters – Unforeseen` rows
  2. CLICK **Add Personal Credit**
  3. ASSERT the dialog **Add a New Personal Leave Balance** opens with the fields Leave Type\*, Is Previous Cycle, Person\*, Total\*, Balance\*, Comments, Attachments and the **Cancel** / **OK** buttons
  4. SELECT Leave Type `Natural Disasters – Unforeseen`
  5. CLICK the **Close** (X) button in the dialog header
- **Expected result:** The dialog closes and nothing is saved
- **Assertions:**
  - [x] ASSERT (BLOCKING) The **Add a New Personal Leave Balance** dialog is no longer visible
  - [x] ASSERT The user stays on Leave Balances, and the number of `Jane Doe` / `Natural Disasters – Unforeseen` rows is unchanged

---

### TC-04 — Add Personal Credit: mandatory fields are enforced (ADO #86631)

*The system should not allow a user to add credits without adding all the mandatory fields*

- **Type:** Negative
- **Steps:**
  1. Open **Leave Balances**
  2. CLICK **Add Personal Credit**
  3. Leave every field empty
  4. CLICK **OK**
- **Expected result:** The credit isn't saved and every mandatory field is flagged
- **Assertions:**
  - [x] ASSERT (BLOCKING) Exactly **4** "This field is required" messages are shown (Leave Type, Person, Total, Balance)
  - [x] ASSERT (BLOCKING) The dialog stays open and no create request (`CreateSaGovLeaveCycleBalance`) is sent
  - [x] ASSERT CLICK **Cancel**, and the dialog closes

---

### TC-05 — Add Personal Credit: 'OK' adds the credit and returns to Leave Balances (ADO #86628, #86629)

*When a user clicks on the 'OK' button, the system should add the credits and redirect the user to the Leave Balances dashboard*

- **Type:** Happy path
- **Steps:**
  1. Open **Leave Balances** and set the page size to **100 / page**
  2. Cleanup: for every `Jane Doe` / `Natural Disasters – Unforeseen` row, CLICK the delete icon, then CLICK **Yes** on **Delete Leave Balance**
  3. CLICK **Add Personal Credit**
  4. SELECT Leave Type `Natural Disasters – Unforeseen`
  5. TYPE `Jane Doe` in Person and SELECT **Jane Doe**
  6. TYPE Total with `5`
  7. TYPE Balance with `5`
  8. TYPE Comments with `Automated test credit`
  9. CLICK **OK**
- **Expected result:** The credit is created, the dialog closes and the user is on the Leave Balances dashboard
- **Assertions:**
  - [x] ASSERT (BLOCKING) The create request `CreateSaGovLeaveCycleBalance` returns HTTP 200
  - [x] ASSERT (BLOCKING) The dialog closes, the URL contains `sagov-personal-balances` and the heading **Leave Balances** is visible (ADO #86629)
  - [x] ASSERT (BLOCKING) A row appears with Balance Type `Personal`, Full Name `Jane Doe`, PERSAL No `78545623`, Leave Type `Natural Disasters – Unforeseen`, Credit `5`, Total `5`, Is Current Cycle `Yes` (ADO #86628)

---

### TC-06 — Edit Leave Credits: 'Close' closes the dialog without saving (ADO #86637)

*When a user clicks on the 'Close' button, the system should close the dialog*

- **Type:** Happy path
- **Steps:**
  1. Open **Leave Balances** and set the page size to **100 / page**
  2. CLICK the **edit** (pencil) icon on the `Jane Doe` / `Natural Disasters – Unforeseen` row
  3. ASSERT the dialog **Edit Leave Credits** opens with Leave Type `Natural Disasters – Unforeseen`, Person `Jane Doe`, Total `5`, Balance `5`, Comments `Automated test credit`
  4. TYPE Total with `99`
  5. CLICK the **Close** (X) button in the dialog header
- **Expected result:** The dialog closes and the change is discarded
- **Assertions:**
  - [x] ASSERT (BLOCKING) The **Edit Leave Credits** dialog is no longer visible
  - [x] ASSERT The row still shows Credit `5` and Total `5`

---

### TC-07 — Edit Leave Credits: 'OK' saves and returns to Leave Balances (ADO #86634, #86635)

*When a user clicks on the 'OK' button, the system should save the updated information and redirect the user to the Leave Balances dashboard*

- **Type:** Happy path
- **Steps:**
  1. Open **Leave Balances** and set the page size to **100 / page**
  2. CLICK the **edit** icon on the `Jane Doe` / `Natural Disasters – Unforeseen` row
  3. TYPE Total with `7`
  4. TYPE Balance with `6`
  5. TYPE Comments with `Automated test edit`
  6. CLICK **OK**
- **Expected result:** The changes are saved and the user is on the Leave Balances dashboard
- **Assertions:**
  - [x] ASSERT (BLOCKING) The dialog closes, the URL contains `sagov-personal-balances` and the heading **Leave Balances** is visible (ADO #86635)
  - [x] ASSERT (BLOCKING) The `Jane Doe` / `Natural Disasters – Unforeseen` row now shows Credit `6` and Total `7` (ADO #86634)
  - [x] ASSERT Opening Edit again shows Comments `Automated test edit` (then CLICK **Cancel**)

---

### TC-08 — View Audit shows the edit in the Leave Credits Audit Trail

- **Type:** Happy path
- **Steps:**
  1. Open **Leave Balances**
  2. CLICK the **View Audit** link
  3. CLICK the **Action Date** column header twice to sort newest first
- **Expected result:** The Leave Credits Audit Trail lists the TC-07 changes for Jane Doe
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL contains `/dynamic/SaGov.Leave/sagov-personal-balance-audit-item` and the title **Leave Credits Audit Trail** is visible
  - [x] ASSERT The table has the columns **Action Date, Actor, Description, Leave Type Name, Employee Full Name, Employee Persal No, Cycle From, Cycle To, Is Current Cycle**
  - [x] ASSERT (BLOCKING) A `Jane Doe` / `Natural Disasters – Unforeseen` entry dated today reads `Balance changed from "5…" to "6…"`
  - [x] ASSERT A `Jane Doe` / `Natural Disasters – Unforeseen` entry dated today reads `EntitlementForCycle changed from "5…" to "7…"` (the Total change)

---

### TC-09 — Audit Trail: 'Export' downloads an Excel sheet (ADO #86649)

*When a user clicks on the 'Export' button, the system should download the audit into an Excel sheet*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Leave Credits Audit Trail (Leave Balances › **View Audit**)
  2. CLICK **Export**
  3. WAIT for the download
- **Expected result:** An Excel file is downloaded
- **Assertions:**
  - [x] ASSERT (BLOCKING) A download starts and the file name ends in `.xlsx` (currently `Export.xlsx`)
  - [x] ASSERT The downloaded file isn't empty (size > 0 bytes)

---

### TC-10 — Cleanup: delete the test credit

- **Type:** Teardown
- **Steps:**
  1. Open **Leave Balances** and set the page size to **100 / page**
  2. CLICK the **delete** (bin) icon on the `Jane Doe` / `Natural Disasters – Unforeseen` row
  3. ASSERT the confirmation **Delete Leave Balance**, "Are you sure you want to delete this leave balance", with **No** / **Yes** is shown
  4. CLICK **Yes**
- **Expected result:** The test credit is removed
- **Assertions:**
  - [x] ASSERT (BLOCKING) No `Jane Doe` / `Natural Disasters – Unforeseen` row remains on the Leave Balances table

---

## Teardown
- TC-10 deletes the credit the test created. If a run stops early, the next run's TC-05 step 2 removes the leftover row.

## Notes
- The audit **Actor** column was blank for admin's edits when this plan was recorded (2026-10-07). It isn't asserted here, so check with the team whether that's expected.
- Editing a balance also logs a `PeriodTo changed from "…23:59:59.06" to "…23:59:59.059"` entry even though the period wasn't touched. This looks like a precision side effect. It isn't asserted here.
