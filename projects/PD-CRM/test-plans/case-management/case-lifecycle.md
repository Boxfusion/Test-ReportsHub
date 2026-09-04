# Test Plan: Case Lifecycle

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-09-02
> **Estimated Duration:** 1800s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-dep-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | Admin / P@ssword1 |
| Azure DevOps | Plan **112718** › PD-CRM (112719) › Case Management (112720) › **Case Lifecycle (112755)** |
| ADO cases | #112773 – #112799 (27 cases, all state `Design`, priority 2) |

> **Source of truth.** This plan mirrors ADO suite 112755 one-to-one — 27 cases, in ADO order, with each
> case's expected result quoted from the ADO step.

> ⚠️ **This suite MUTATES data.** It changes case status, assignment and field values, and it merges
> cases — a Single-Case merge **permanently closes the child case**.
>
> **It does not create cases.** QA already holds ~1,600, including the `QA-AUTO` records this project
> created, so every subject is **claimed from that existing pool** (search term `QAAuto`, overridable via
> `QA_POOL_SEARCH`). Confining mutations to `QA-AUTO` records keeps every pre-existing case untouched, and
> the merge parent-case picker is always narrowed by search to a pool record before selecting.
>
> Subjects are chosen **by the status each case needs**, re-read from live data each time, rather than from
> a reservation ledger: a case already in the required state is used as-is, and only if none is does the
> suite drive a `NEW` one through the transitions. Terminal states shrink the usable pool — merges consume
> two cases each and leave them `Merged`/`Closed` — so a run may exhaust it, in which case the failure
> message says so explicitly and the pool needs topping up.

## Environment variables

Two cases need a recipient a human can actually check. Both are read from the environment so no personal
contact detail is ever committed to this repository:

| Variable | Used by | Fallback if unset |
|---|---|---|
| `QA_EMAIL_RECIPIENT` | TC-18 – TC-21 (email delivery) | `qa.auto@test.com` — send is still asserted, **receipt is reported as NOT VERIFIED** |
| `QA_SMS_MOBILE` | TC-22 (SMS delivery) | `0821234567` — same treatment |
| `AGENT_B_USER` / `AGENT_B_PASSWORD` | TC-06 (cross-agent pickup) | unset → TC-06 **skips** and is reported BLOCKED |

## Application map (captured live 2026-09-02)

**Cases list** → `/dynamic/Boxfusion.ServiceManagement/service-requests`

| Element | Selector |
|---|---|
| Case row | `label.sha-datalist-component-item-checkbox` — 10 per page. **A second click deselects it.** |
| List search | `.sha-global-table-filter input.ant-input`, submit via the adjacent `button` |
| Case Details | double-click a row → `/dynamic/Boxfusion.ServiceManagement/case-request-details?id=<guid>` |

⚠️ **The search input must be focused (`click()`) before `fill()`**, or the term does not register and the
list silently stays unfiltered. ⚠️ **The list lags a status change** — read a status from the Case Details
header (`Case Details: <ref> <STATUS>`), never from the list row, and re-read after a reload.

**Action buttons are status-dependent** (captured live):

| Status | Actions offered |
|---|---|
| `NEW` | Pick Up, Open, Assign, Mark In Progress, Merge, Cancel |
| `IN PROGRESS` | Assign, Merge, Cancel, Edit, **Close** |
| `CLOSED` | **ReOpen**, Pick Up, Edit |

**Case Details panels:** Timeline (with `Send Email`, `Send SMS`, `Add Notes`), Uploaded Media,
Related Case(s), Case Overview, Customer Overview. Also `Back`, `Edit`, `Turn On AI Assistant`.

**Assign dialog** — title `Assign Case`, form `StarterTemplate/assign-case v15`. Radios `Assign to Agent`
and `Assign to a Group of Agents`; the corresponding dropdown **does not exist until a radio is chosen**
(`Agent` → `label[for=personId]`, `Group` → `label[for=organisationId]`). Buttons `Cancel` / `OK`.

**Merge dialog** — title `Merge Case`, form `Boxfusion.ServiceManagement/merge-case v26`. `Link Type`
(`for=linkType`) offers exactly `Parent Case`, `Child Case`. `Merge Type` (`for=mergeType`) is a radio pair
`Related Case` / `Single Case`. A searchable parent-case table follows (`Reference No`, `Case Type`,
`Reported By`, `Reported Date`, `Status` — 1211 rows). Buttons `Cancel` / `Merge`.

**Timeline composers are inline, not modals:**
- `Send Email` → `Boxfusion.ServiceManagement/reporteduser-emailaddress v19`; prefilled `Email Address :`,
  a `Cc:` field, a rich-text body with a `CHARS/WORDS` counter, `(press to upload)`, `Cancel` / `Send`.
- `Send SMS` → `Boxfusion.ServiceManagement/ReportedUser-MobileNumber v21`; prefilled `Mobile Number`,
  a textarea, `Cancel` / `Send`.
- `Add Notes` → textarea, `Cancel` / `Add`.

**Edit mode** (`Edit` → `Cancel Form Edit` / `Save`) exposes these labels:
`From|fromPerson__displayName`, `Escalation|escalation`, `Reported By|reportedByChannel`,
`Priority|priority`, `Category|category`, `Case Type|caseType`, `Description|description`,
`Assigned To|personAssigned_fullName`, `First Name|reportedUser_firstName`,
`Last Name|reportedUser_lastName`, `Email Address|reportedUser_emailAddress1`,
`Mobile Number|reportedUser_mobileNumber1`, `Preferred Contact Method|reportedUser_preferredContactMethod`.
The Description control is an `input` with placeholder `Description missing`.

**Confirmation dialog wording (captured verbatim):**

| Action | From the list | From Case Details |
|---|---|---|
| Mark In Progress | `Are you sure you want to set this case to "In Progress" status ?` | `Are you sure you want to set this case to "In Progress"?` |
| Close | `Are you sure that you want to close the case?` | `Are you sure that you want to close case?` |
| ReOpen | — | `ReOpen Closed Case Or Cancelled Case` / `Are you sure you want to set this case to "Open" status: <ref>` |

## Deviations from the ADO text

1. **Button labels differ from ADO.** ADO says *"Mark as In Progress"* → the app renders **`Mark In Progress`**;
   ADO says *"Pickup"* → the app renders **`Pick Up`**. Matched on the real labels. Raised as **BUG-201**.
2. **The same action has different confirmation wording depending on where it is invoked**, and neither
   variant matches ADO exactly (see the table above). Assertions therefore match the *substance* of the
   message, not the punctuation, and the deltas are raised as **BUG-202**.
3. **ReOpen produces `NEW`, not `Open`.** ADO #112786 step 7 requires *"The case status changes from Closed
   to Open"* and the dialog itself promises `"Open" status`, but the case lands in `NEW`. Asserted as ADO
   prescribes, so TC-14 **fails by design** until resolved. Raised as **BUG-203**.
4. **#112796's title begins with a stray `": "`** (`: Verify Case Category and Case Type Can Be Updated`).
   Cosmetic ADO typo, noted only.
5. **Notification-receipt steps are only partly verifiable.** ADO #112782 step 12 requires proving a
   *negative* delivery (*"No merge notification is sent to the Child Case"*), which cannot be established
   from the portal. Those steps assert the observable proxy — the case Timeline — and the unobservable half
   is reported as NOT VERIFIED rather than passed. Raised as **BUG-204** against the test cases.
6. **#112778 needs two agent accounts.** Only `Admin` exists by default; TC-06 skips unless `AGENT_B_USER`
   and `AGENT_B_PASSWORD` are supplied.
7. **Status transitions are invoked from the Case Details screen, not the list.** ADO drives them from the
   list, and the list does expose the buttons — but during recon a list-invoked `Mark In Progress` → `Yes`
   left the case at `NEW`, while the same action from Case Details transitioned it reliably and durably.
   The two entry points also render *different* confirmation wording, which suggests two separate
   implementations. Rather than build the suite on the flakier path, transitions go through Case Details
   and the list-level path is recorded as **needing a dedicated follow-up** — it is not yet proven broken
   (the recon script's own status read was unreliable), so it is deliberately **not** logged as a defect.
8. **#112773 and #112774 verify against the record, not against creation-time input.** Both ADO cases say
   *"Locate the case that was previously created"* and then compare each field to what was captured at
   creation. Since the suite reuses existing cases rather than creating them, it cannot hold the
   creation-time values — so TC-02 instead asserts that **Case Details agrees with the list row** for every
   value both screens show (reference, case type, status) and that no displayed customer field is blank.
   That is a genuine consistency check, but it is weaker than the ADO text and is reported as such.
9. **Closure and reopening notifications are not observable.** ADO #112784 step 9 and #112786 step 9 both
   require a customer notification. After a close, the Timeline gains no entry at all — raised as
   **BUG-205** for investigation, since the notification may still be dispatched without being journalled.

## Preconditions
- [ ] App is reachable and `Admin` / `P@ssword1` authenticates
- [ ] At least one agent and one agent group exist for assignment (confirmed: 10+ agents, 9+ groups
      including `Auto Testing Group`)
- [ ] Reference data for Category/Case type is configured (see `case-creation.md`)

## Test Cases

### TC-01 (#112773): Verify Created Case Is Displayed in the Cases List
- **Type:** Happy path / Read-only
- **Steps:**
  1. Create a `QA-LIFE` fixture case and note its submitter name
  2. NAVIGATE to the portal and log in as `Admin`
  3. CLICK the Cases side menu — the All Cases list is displayed
  4. LOCATE the case just created
  5. VERIFY the case information shown in the list row
  6. SELECT the case
- **Expected result (ADO):** "The created case is displayed in the Cases list… The case displays the correct case ref number and all case information… The case details screen is displayed."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Cases list renders rows
  - [x] ASSERT the fixture case is found in the list
  - [x] ASSERT the row shows a `REF…` reference number, the case type and the submitter
  - [x] ASSERT (BLOCKING) opening it shows the Case Details screen

### TC-02 (#112774): Verify Case Details Are Displayed Correctly
- **Type:** Happy path / Read-only
- **Steps:** 1–4 as TC-01, then verify Case Reference Number, Channel, Submitter Details, Category and
  Case Type, address, Description and Case Status
- **Expected result (ADO):** each field "displayed correctly" / "The case displays the correct current status."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Case Details header shows the same reference number as the list row
  - [x] ASSERT the Channel recorded at creation is displayed
  - [x] ASSERT First Name, Last Name, Mobile Number and Email Address all match what was created
  - [x] ASSERT the Category and Case Type match
  - [x] ASSERT the address matches
  - [x] ASSERT the Description matches
  - [x] ASSERT a case status is displayed

### TC-03 (#112775): Verify Case Can Be Searched Using Case Reference Number
- **Type:** Functional
- **Steps:**
  1. Log in and open the Cases list
  2. LOCATE the reference number of an existing case
  3. TYPE it into the case search field
  4. CLICK the search icon
  5. OBSERVE the results, SELECT the case, VERIFY the reference number
- **Expected result (ADO):** "The case matching the typed Case Reference Number is displayed… The displayed Case Reference Number matches the value used in the search."
- **Assertions:**
  - [x] ASSERT the search field accepts the reference number
  - [x] ASSERT (BLOCKING) the result set narrows to exactly the searched case
  - [x] ASSERT opening the result shows Case Details for that same reference

### TC-04 (#112776): Verify Case Can Be Assigned to an Agent
- **Type:** Happy path
- **Steps:**
  1. Create a `QA-LIFE` fixture case and select it
  2. CLICK Assign — the Assign Case dialog is displayed
  3. SELECT the `Assign to Agent` radio — an Agent dropdown appears
  4. CLICK the Agent dropdown and SELECT an eligible agent
  5. CLICK OK
  6. OBSERVE the case, and verify the status
- **Expected result (ADO):** "The Assign Case dialog is displayed… The selected agent is populated in the Agent field… The case is successfully assigned… The selected agent is displayed against Assigned To… The case status reflects the status configured after assignment."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Assign Case dialog opens
  - [x] ASSERT no Agent dropdown exists before a radio is chosen, and one appears after
  - [x] ASSERT the agent list is non-empty and the chosen agent populates the field
  - [x] ASSERT (BLOCKING) after OK the dialog closes and `Assigned To` shows that agent
  - [x] ASSERT the case status after assignment is recorded (observed, not prescribed by ADO)

### TC-05 (#112777): Verify Case Can Be Assigned to a Group of Agents
- **Type:** Happy path
- **Steps:** as TC-04 but choose `Assign to a Group of Agents` and pick a group
- **Expected result (ADO):** "The selected group is populated in the assignment field… The case is successfully assigned to the selected group… The selected group is displayed against the case assignment."
- **Assertions:**
  - [x] ASSERT selecting the group radio reveals a Group dropdown
  - [x] ASSERT the group list is non-empty
  - [x] ASSERT (BLOCKING) after OK the case shows the selected group as its assignment
  - [x] ASSERT the case status after group assignment is recorded

### TC-06 (#112778): Verify Agent Can Pick Up a Case Assigned to Another Agent
- **Type:** Functional — **BLOCKED without a second account**
- **Steps:**
  1. Create a `QA-LIFE` case and assign it to Agent A
  2. Log in as **Agent B** (`AGENT_B_USER` / `AGENT_B_PASSWORD`)
  3. SEARCH for and SELECT that case — Agent A is shown as assignee
  4. CLICK `Pick Up`
  5. VERIFY the Assigned To field
- **Expected result (ADO):** "The case is reassigned from Agent A to Agent B… Agent B is displayed as the current assignee."
- **Assertions:**
  - [x] ASSERT the case initially shows Agent A as assignee
  - [x] ASSERT (BLOCKING) after `Pick Up` the assignee becomes Agent B
- **Note:** skips with a BLOCKED verdict when the Agent B variables are unset — the cross-agent semantics
  cannot be faked from a single account.

### TC-07 (#112779): Verify Cases Can Be Merged as Related Cases
- **Type:** Functional — **destructive**
- **Steps:**
  1. Create **two** `QA-LIFE` cases: a child and a parent
  2. SELECT the child and CLICK Merge
  3. CLICK the Link Type dropdown and verify its options
  4. SELECT a Link Type
  5. SELECT `Related Case` under Merge Type and read the hint
  6. SEARCH the parent picker for the parent case and SELECT it
  7. CLICK Merge
  8. OPEN the child case, then the parent case
- **Expected result (ADO):** "The options Parent Case and Child Case are displayed… the related-case hint that reads *Hint: This option will flag the child case as 'Merged' and receives all notifications identical to the parent case* is displayed… The selected case is successfully merged into the Parent case… The child case is displayed with its status/flag set to Merged."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Merge Case dialog opens and names the case being merged from
  - [x] ASSERT the Link Type options are exactly `Parent Case`, `Child Case`
  - [x] ASSERT the Related Case hint matches the ADO text
  - [x] ASSERT (BLOCKING) the parent selected is a `QA-LIFE` case — never a pre-existing record
  - [x] ASSERT (BLOCKING) after Merge the child case status/flag is `Merged`
  - [x] ASSERT the parent case remains open and displays

### TC-08 (#112780): Verify Cases Can Be Merged as Single Cases
- **Type:** Functional — **destructive, closes the child case**
- **Steps:** as TC-07 but choose `Single Case` under Merge Type
- **Expected result (ADO):** "…the single-case hint that reads *Hint: This option will merge the selected cases into a single case, and the merged child case will be automatically closed* is displayed… The child case is displayed with its status set to Closed… The parent case remains available and displayed as merged."
- **Assertions:**
  - [x] ASSERT the Single Case hint matches the ADO text (the app appends a full stop — matched tolerantly)
  - [x] ASSERT (BLOCKING) after Merge the child case status is `Closed`
  - [x] ASSERT the parent case remains available

### TC-09 (#112781): Verify Related Case(s) Panel Is Displayed for a Merged Case
- **Type:** Read-only — depends on TC-07
- **Steps:** open the merged case from TC-07, scroll to and expand the Related Case(s) panel
- **Expected result (ADO):** "The related case information is displayed, including the applicable Parent Case and/or Child Case(s) relationship."
- **Assertions:**
  - [x] ASSERT the Related Case(s) panel exists on the Case Details screen
  - [x] ASSERT (BLOCKING) expanding it shows the counterpart case's reference number

### TC-10 (#112782): Verify Notifications Are Sent to the Correct Case After Single Case Merge
- **Type:** Functional — **partly unverifiable**
- **Steps:** perform a Single Case merge, then verify the notification, its channel, and the child case
- **Expected result (ADO):** "A notification is sent only to the Parent Case… using the Preferred Contact Method configured for the Parent Case… No merge notification is sent to the Child Case."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the merge completes
  - [x] ASSERT the parent case Timeline records a merge notification
  - [x] ASSERT the child case Timeline records no merge notification
  - [ ] NOT VERIFIED — actual delivery, and the channel used, cannot be observed from the portal (BUG-204)

### TC-11 (#112783): Verify Notifications Are Sent to Both Cases After Related Case Merge
- **Type:** Functional — **partly unverifiable**
- **Steps:** perform a Related Case merge, then verify notifications to both parent and child
- **Expected result (ADO):** "A notification is sent to the Parent Case using its configured Preferred Contact Method… A notification is also sent to the Child Case… Both the Parent Case and Child Case receive the applicable merge notification."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the merge completes
  - [x] ASSERT both parent and child Timelines record a notification
  - [ ] NOT VERIFIED — actual delivery and channel (BUG-204)

### TC-12 (#112784): Verify Case Can Be Closed
- **Type:** Happy path
- **Steps:**
  1. Create a `QA-LIFE` case and drive it to `In Progress`
  2. SELECT it — action buttons are displayed
  3. CLICK Close
  4. SELECT `Yes` on the confirmation dialog
  5. VERIFY the case status, the available actions, and the customer notification
- **Expected result (ADO):** "A Close Case confirmation dialog is displayed asking *Are you sure that you want to close the case?* with No and Yes options… The case status changes from In Progress to Closed… The Reopen action is displayed for the closed case… A case closure notification is sent to the customer using the configured Preferred Contact Method."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Close Case dialog appears with `No` and `Yes`
  - [x] ASSERT the dialog asks about closing the case (wording differs by entry point — BUG-202)
  - [x] ASSERT (BLOCKING) after `Yes` the status changes to `Closed` and survives a reload
  - [x] ASSERT the `ReOpen` action becomes available
  - [x] ASSERT the closure notification is recorded — **currently no Timeline entry is added, see BUG-205**

### TC-13 (#112785): Verify Case Closure Is Cancelled When No Is Selected
- **Type:** Negative
- **Steps:** as TC-12 but click `No`
- **Expected result (ADO):** "The confirmation dialog closes and the case is not closed… The case remains In Progress… The Reopen action is not displayed because the case was not closed."
- **Assertions:**
  - [x] ASSERT the dialog closes on `No`
  - [x] ASSERT (BLOCKING) the status remains `In Progress`
  - [x] ASSERT no `ReOpen` action is offered

### TC-14 (#112786): Verify Closed Case Can Be Reopened
- **Type:** Happy path — **expected to FAIL, see BUG-203**
- **Steps:**
  1. Drive a `QA-LIFE` case to `Closed`
  2. SELECT it — `Open` and `ReOpen` actions are displayed
  3. CLICK `ReOpen`
  4. VERIFY the confirmation message
  5. CLICK `Yes`
  6. VERIFY the case status, available actions and customer notification
- **Expected result (ADO):** "The dialog asks whether the user wants to set the selected case to Open status and displays the case reference number… The case status changes from Closed to **Open**… The ReOpen action is no longer available… A case reopening notification is sent to the customer."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the ReOpen dialog appears and displays the case reference number
  - [x] ASSERT (BLOCKING) after `Yes` the status becomes **`Open`** — **fails: the app sets `NEW`** (BUG-203)
  - [x] ASSERT the `ReOpen` action is no longer offered
  - [x] ASSERT the reopening notification is recorded (BUG-205)

### TC-15 (#112787): Verify Case Reopening Is Cancelled When No Is Selected
- **Type:** Negative
- **Steps:** as TC-14 but click `No`
- **Expected result (ADO):** "The confirmation dialog closes and the case is not reopened… The case remains Closed… The ReOpen action remains available… No reopening notification is sent."
- **Assertions:**
  - [x] ASSERT the dialog closes on `No`
  - [x] ASSERT (BLOCKING) the status remains `Closed`
  - [x] ASSERT the `ReOpen` action remains available

### TC-16 (#112788): Verify Case Can Be Marked as In Progress
- **Type:** Happy path
- **Steps:**
  1. Create a `QA-LIFE` case not already `In Progress`
  2. SELECT it, CLICK `Mark In Progress`
  3. VERIFY the confirmation message, CLICK `Yes`
  4. VERIFY the case status and the available actions
- **Expected result (ADO):** "The dialog asks *Are you sure you want to set this case to 'In Progress' status?* and displays No and Yes options… The case status changes to In Progress… The actions available for an In Progress case are displayed."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the confirmation dialog appears with `No` and `Yes`
  - [x] ASSERT (BLOCKING) after `Yes` the status becomes `In Progress` and survives a reload
  - [x] ASSERT `Close` becomes available, and `Mark In Progress` / `Pick Up` are withdrawn

### TC-17 (#112789): Verify Case Is Not Marked as In Progress When No Is Selected
- **Type:** Negative
- **Steps:** as TC-16 but click `No`
- **Expected result (ADO):** "The confirmation dialog closes and the case is not marked as In Progress… The case remains in its previous status."
- **Assertions:**
  - [x] ASSERT the dialog closes on `No`
  - [x] ASSERT (BLOCKING) the status is unchanged from before the attempt

### TC-18 (#112790): Verify Email Can Be Sent from Case Details
- **Type:** Happy path
- **Steps:**
  1. Create a `QA-LIFE` case whose customer email is `QA_EMAIL_RECIPIENT`
  2. OPEN Case Details, CLICK `Send Email` on the Timeline panel
  3. VERIFY the Email Address field is prefilled
  4. TYPE a message, CLICK `Send`
  5. VERIFY the Timeline, and the customer's mailbox
- **Expected result (ADO):** "The customer's email address is automatically populated… The email is sent successfully… The sent email is recorded in the case Timeline with the relevant sender, message, and date/time information… The customer receives the email."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the email composer opens
  - [x] ASSERT the Email Address is prefilled with the case's customer address
  - [x] ASSERT (BLOCKING) `Send` is accepted and the composer closes
  - [x] ASSERT the email appears in the Timeline with sender and timestamp
  - [ ] MANUAL — confirm receipt in the `QA_EMAIL_RECIPIENT` mailbox

### TC-19 (#112791): Verify CC Email Address Can Be Added
- **Type:** Happy path
- **Steps:** as TC-18, additionally typing an address into `Cc`
- **Expected result (ADO):** "The CC email address is accepted and displayed in the Cc field… The primary recipient receives the email… The CC recipient receives a copy."
- **Assertions:**
  - [x] ASSERT the `Cc` field accepts and displays the address
  - [x] ASSERT (BLOCKING) the email sends and is recorded in the Timeline
  - [ ] MANUAL — confirm both primary and CC receipt

### TC-20 (#112792): Verify Email Attachment Can Be Uploaded
- **Type:** Happy path
- **Steps:** as TC-18, additionally attaching a file via `(press to upload)`
- **Expected result (ADO):** "The selected file is successfully attached… The attachment is displayed in the email composer and is associated with the email… The recipient receives the email with the attached file."
- **Assertions:**
  - [x] ASSERT `(press to upload)` accepts a file and the attachment is listed in the composer
  - [x] ASSERT (BLOCKING) the email sends with the attachment and is recorded in the Timeline
  - [ ] MANUAL — confirm the attachment arrives

### TC-21 (#112793): Verify Email Can Be Sent with CC Recipient and Attachment
- **Type:** Happy path — combination
- **Steps:** as TC-18 with both a `Cc` address and an attachment
- **Expected result (ADO):** "The primary recipient, CC recipient, message, and attachment are displayed correctly… The email is sent successfully… The CC recipient receives a copy of the email with the message and attachment."
- **Assertions:**
  - [x] ASSERT the composer shows recipient, Cc, message and attachment together before sending
  - [x] ASSERT (BLOCKING) the email sends and is recorded in the Timeline
  - [ ] MANUAL — confirm both recipients receive message and attachment

### TC-22 (#112794): Verify SMS Can Be Sent from Case Details Timeline
- **Type:** Happy path
- **Steps:**
  1. Create a `QA-LIFE` case whose customer mobile is `QA_SMS_MOBILE`
  2. OPEN Case Details, CLICK `Send SMS`
  3. VERIFY the Mobile Number field is prefilled
  4. TYPE a message, CLICK `Send`
  5. VERIFY the Timeline and the customer's handset
- **Expected result (ADO):** "The customer's mobile number is automatically populated… The SMS is sent successfully… The SMS activity is recorded against the case… The customer receives the SMS."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the SMS composer opens
  - [x] ASSERT the Mobile Number is prefilled, **with the leading `0` intact**
  - [x] ASSERT (BLOCKING) `Send` is accepted
  - [x] ASSERT the SMS activity is recorded in the Timeline
  - [ ] MANUAL — confirm receipt on the `QA_SMS_MOBILE` handset

### TC-23 (#112795): Verify Case Details Can Be Edited and Saved
- **Type:** Happy path
- **Steps:**
  1. Create a `QA-LIFE` case and open Case Details
  2. CLICK `Edit` — editable fields become available
  3. UPDATE an editable field with valid information
  4. CLICK `Save`
  5. VERIFY the updated field, then exit and reopen the case
- **Expected result (ADO):** "The changes are successfully saved… The updated information remains displayed, confirming that the changes were saved successfully."
- **Assertions:**
  - [x] ASSERT (BLOCKING) `Edit` reveals `Save` and `Cancel Form Edit`
  - [x] ASSERT the field accepts the new value
  - [x] ASSERT (BLOCKING) after `Save` the new value is displayed
  - [x] ASSERT (BLOCKING) the new value survives leaving and reopening the case

### TC-24 (#112796): Verify Case Category and Case Type Can Be Updated
- **Type:** Happy path
- **Steps:** in edit mode, change Category and Case Type on the Customer Overview panel, save, reopen
- **Expected result (ADO):** "The selected Category is displayed, and the available Case Types are updated based on the selected Category… The newly selected Category and corresponding Case Type are displayed correctly… The updated Category and Case Type remain displayed."
- **Assertions:**
  - [x] ASSERT the Category field is editable
  - [x] ASSERT changing Category refreshes the Case Type options to that category's types only
  - [x] ASSERT (BLOCKING) after `Save` both new values are displayed
  - [x] ASSERT (BLOCKING) both survive reopening the case

### TC-25 (#112797): Verify Case Description Can Be Updated
- **Type:** Happy path
- **Steps:** in edit mode, update the Description, save, reopen
- **Expected result (ADO):** "The updated description is displayed against the case… The updated Description remains displayed."
- **Assertions:**
  - [x] ASSERT the Description field is editable
  - [x] ASSERT (BLOCKING) after `Save` the new description is displayed
  - [x] ASSERT (BLOCKING) it survives reopening the case

### TC-26 (#112798): Verify Customer Details Can Be Updated
- **Type:** Happy path
- **Steps:** in edit mode, update customer details and Preferred Contact Method, save, reopen
- **Expected result (ADO):** "The updated customer details and Preferred Contact Method are displayed correctly… The updated customer information remains displayed."
- **Assertions:**
  - [x] ASSERT the Customer Information fields are editable
  - [x] ASSERT the Preferred Contact Method can be changed
  - [x] ASSERT (BLOCKING) after `Save` the updated details are displayed
  - [x] ASSERT (BLOCKING) they survive reopening the case

### TC-27 (#112799): Verify Case Edit Can Be Cancelled Using Cancel Form Edit
- **Type:** Negative
- **Steps:**
  1. Open a `QA-LIFE` case and NOTE the current value of an editable field
  2. CLICK `Edit`, CHANGE that field
  3. CLICK `Cancel Form Edit`
  4. VERIFY the field, then exit and reopen the case
- **Expected result (ADO):** "Edit mode is cancelled and the case returns to view mode… The field displays its original value and the changes made during editing have not been saved… The original value remains displayed."
- **Assertions:**
  - [x] ASSERT (BLOCKING) `Cancel Form Edit` returns the screen to view mode
  - [x] ASSERT (BLOCKING) the field shows its original value, not the edited one
  - [x] ASSERT (BLOCKING) the original value survives reopening the case

## Teardown
- Cases created by this plan remain in QA, tagged `QA-LIFE` in the Description. Several are deliberately
  left in a terminal state (`Closed`, `Merged`) and cannot be reverted through the UI.
- Each test case runs in its own isolated browser context, so no session teardown is required.
