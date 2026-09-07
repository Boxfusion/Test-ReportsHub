# Test Plan: DEV-COMP-2.1 — Compliance Case Lifecycle Workflow (Dev)

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-24
> **Estimated Duration:** 4m

## Metadata
| Field | Value |
|-------|-------|
| App | Land Bank CRM (Admin Portal) |
| Environment | Dev (`DEV_APP_URL`, `TEST_ENV=dev`) |
| Login As | **COMPLIANCE** role (`DEV_COMPLIANCE_USERNAME` / `DEV_COMPLIANCE_PASSWORD`) |
| Screens | Cases listing, Case detail (`Boxfusion.ServiceManagement/case-request-details`), Audit Log dialog |

## Objective
> Walk a compliance case through its full lifecycle — received from the RM, picked up, adjudicated,
> escalated to governance, de-escalated, signed off — and confirm the audit log records each
> transition. A second case covers the send-back-to-frontline branch, which is terminal and cannot
> coexist with sign-off on the same record.

## ⚠️ This plan CHANGES DATA
Unlike `compliance-review-functions.md`, this plan performs **real state transitions on real Dev
cases**: it picks up, escalates, de-escalates and **signs off** a case, and sends another back to
frontline. Sign-off is **irreversible** — the app states *"Sign-off locks the case and generates the
AML/compliance report… the report is immutable"*.

Each run **consumes two cases** that are in `Awaiting Compliance Review`. Dev held 139 such cases at
authoring time. The plan never touches a case that is already assigned or already decided, so it
cannot disturb work in progress — but do not run it on an environment whose case data matters.

## Preconditions
- [ ] Dev site reachable at `DEV_APP_URL`
- [ ] `DEV_COMPLIANCE_USERNAME` / `DEV_COMPLIANCE_PASSWORD` in the gitignored `.env`
- [ ] At least **two** unassigned cases with Compliance Decision `Awaiting Compliance Review`

> **Note (2026-08-24, recorded live against Dev as `andiswaN`, every transition actually performed):**
>
> **Reaching a case.** The Cases grid has no per-row detail link. The first cell holds an
> `expand-alt` icon inside `a.sha-link`; clicking it **selects** the row, which reveals a toolbar
> above the grid with **Pick Up**, **Open** and **Assign**. Reaching a case from the compliance
> dashboard instead goes: *Open case LA-…* (an `aria-label`, the button has no text) → preview
> drawer → **Open case**, which opens the case in a **NEW BROWSER TAB**.
>
> **Case screen** is `/dynamic/Boxfusion.ServiceManagement/case-request-details?id=…`, headed
> `Case Details LA-…: Risk and Compliance` followed by three chips — risk (`NONE`), status, decision.
> Actions: **Assign**, **Send Back**, **Escalate**, **Sign off case**, plus an **icon-only clock
> button** (`field-time`) that opens the Audit Log. Tabs: Overview / Risk Assessment / Documents.
>
> **The action set is state-dependent.** On an escalated case **Escalate is replaced by
> `De-Escalate`** (capital E) and an extra **Open** button appears. There is no de-escalate control
> on a case that is not escalated, so de-escalation can only be tested after escalating.
>
> **Observed transitions (all verified on LA-2026-001400):**
> | Action | Dialog (form) | Required fields | Confirm button | Resulting status / decision |
> |---|---|---|---|---|
> | Escalate | `governance-escalation-form v7` "Governence Escalation" *(sic)* | Forum (`Board`), **Summary for forum** | **Escalate & place on hold** | `ON HOLD` / `CONFIRMED (UNDER REVIEW) - ESCALATED TO BOARD/EXCO PENDING FINALISATION` |
> | De-Escalate | `governance-deescalation-form v6` "Governane Escalation" *(sic)* | **Reason for de-escalation** (+ optional upload) | **De-escalate & release** | `IN PROGRESS` / `AWAITING COMPLIANCE REVIEW` |
> | Send Back | `application-send-back v6` "Send back to frontline" | Recipient, **Reason** (select), **Details / Instructions** | **Send Back** | expected `Referred to Frontline` |
> | Sign off | `lbCase-sign-off v5` "Compliance Recommendation Sign Off" | **Decision Status** (select), **Rationale** | **Sign off & generate report** | `Signed Off` + immutable report |
> | Assign | `assign-case v6` "Assign Case" | Analyst (combobox) | OK | reassigns the case |
>
> **De-escalation does NOT set `Returned for Compliance Review`.** It returns the decision to
> `Awaiting Compliance Review` with status `In Progress` — verified, not assumed. `Returned for
> Compliance Review` is a separate state in the decision vocabulary, reached elsewhere (most likely
> when frontline resolves a send-back), and is **not** covered by this plan.
>
> **Dialogs are `[role="dialog"]`, NOT `.ant-modal-wrap`.** A `.ant-modal-wrap` locator finds
> nothing for Escalate / Send Back / Sign off, which makes them look like no-dialog actions that
> fired immediately. They do not fire: nothing transitions until the confirm button is clicked.
>
> **Toolbar buttons disable while any dialog is open.** An `Assign` button read as `[disabled]`
> purely because an earlier dialog was still open — on a fresh load it is enabled. Do not assert a
> disabled state without first confirming no dialog is up.
>
> **Audit Log** dialog (`lb-verifications-audit v10`) has tabs **Entity Audit Log**,
> **Verifications History Audit Log**, **Escalation History**, and a grid of
> Date / Actioned By / Change Type / Description. Observed Change Types:
> `Compliance Case Created`, `Application Status Changed`, `Document Status Changed`,
> `Case Escalated to Governance`, `Decision Captured`, `Case De-escalated from Governance`.

## Test Cases

### TC-01 — A case received from the RM is waiting for compliance
- **Type:** Happy path — case intake
- **Steps:**
  - NAVIGATE to the Cases listing
  - WAIT for the grid to load
  - EXTRACT the first row whose Compliance Decision is `Awaiting Compliance Review` and whose Assigned To is empty
- **Assertions:**
  - [x] ASSERT (BLOCKING) at least one such case exists
  - [x] ASSERT its Status is `New`
  - [x] ASSERT its Description names the originating loan application (`Compliance review initiated for loan application LA-…`)
  - [x] ASSERT its Reported By names the originating RM

---

### TC-02 — The audit log shows the case was created when the RM finalised verification
- **Type:** Function — audit trail of intake
- **Depends on:** TC-01
- **Steps:**
  - Open the case and open the **Audit Log** dialog (clock icon)
- **Assertions:**
  - [x] ASSERT the Audit Log dialog is displayed
  - [x] ASSERT a `Compliance Case Created` entry exists, describing the originating loan application
  - [x] ASSERT an `Application Status Changed` entry records the move out of `VerificationInProgress`
  - [x] ASSERT both entries are attributed to the RM, not to the compliance user

> This is how "receiving a case when an RM/CBA finalises verification" is verified without driving
> the RM flow: the audit trail is the system's own record that verification was finalised upstream.

---

### TC-03 — Picking up a case from the Cases listing
- **Type:** Happy path — pick up
- **Depends on:** TC-01
- **Steps:**
  - SELECT the eligible case row (click the `expand-alt` link in the first cell)
  - SNAPSHOT — confirm the **Pick Up**, **Open** and **Assign** toolbar appears
  - CLICK **Pick Up**
  - WAIT for the grid to refresh
- **Assertions:**
  - [x] ASSERT the **Pick Up**, **Open** and **Assign** actions appear once a row is selected
  - [x] ASSERT (BLOCKING) after Pick Up the case's Assigned To is no longer empty

> **Pick Up assigns the case but does NOT change its Status** — it stays `New`. Verified against the
> opposite expectation: asserting the status moved to `In Progress` failed on correct behaviour. The
> status only advances later (de-escalation set it to `In Progress`).
>
> The row must be re-read **by case reference, not by row index**, after Pick Up: the grid re-sorts
> on Last Modification Time, so the index goes stale immediately.

---

### TC-04 — Opening the picked-up case
- **Type:** Happy path
- **Depends on:** TC-03
- **Steps:**
  - CLICK **Open** on the selected row
  - WAIT for the case detail to load
- **Assertions:**
  - [x] ASSERT (BLOCKING) the case detail route is displayed with an `id` parameter
  - [x] ASSERT the header shows `Case Details LA-…: Risk and Compliance`
  - [x] ASSERT the **Assign**, **Send Back**, **Escalate** and **Sign off case** actions are displayed
  - [x] ASSERT the **Overview**, **Risk Assessment** and **Documents** tabs are displayed

---

### TC-05 — Adjudicating a flagged case on the Risk Assessment tab
- **Type:** Function — adjudication
- **Depends on:** TC-04
- **Steps:**
  - CLICK the **Risk Assessment** tab
  - WAIT for the risk form to render
- **Assertions:**
  - [x] ASSERT the **Risk Rating Tool Outcome** section is present with its **System Score** and **System Category** readouts

> **Do not assert a score VALUE here.** On a freshly received case the risk assessment has not been
> completed: System Score and System Category render as empty labels and every questionnaire response
> is blank. A previously worked case showed a score of 156. Asserting a number failed against a page
> behaving correctly for an un-adjudicated case — which is exactly the state this plan's case is in.
  - [x] ASSERT the risk questionnaire renders scored indicators (e.g. a Geographical Risk indicator)
  - [x] ASSERT the **Override system-calculated risk outcome** control is available
  - [x] ASSERT the **Calculate Risk Score** and **Save** actions are available

> The override is asserted as *available* and not applied. Applying it writes a manual risk outcome
> that would then be carried into the sign-off report later in this same journey, conflating two
> transitions in one assertion. A dedicated override plan should cover applying and reverting it.

---

### TC-06 — Escalating a case to governance
- **Type:** Happy path — escalation
- **Depends on:** TC-04
- **Steps:**
  - CLICK **Escalate**
  - SNAPSHOT — confirm the escalation dialog
  - TYPE a summary into **Summary for forum**
  - CLICK **Escalate & place on hold**
  - WAIT for the case to reload
- **Assertions:**
  - [x] ASSERT the escalation dialog shows the **Forum** and **Summary for forum** fields
  - [x] ASSERT (BLOCKING) the case status becomes `On Hold`
  - [x] ASSERT the compliance decision becomes `Confirmed (under review) - escalated to Board/Exco pending finalisation`
  - [x] ASSERT the **Escalate** action is replaced by **De-Escalate**

---

### TC-07 — De-escalating the case releases it from hold
- **Type:** Happy path — de-escalation
- **Depends on:** TC-06
- **Steps:**
  - CLICK **De-Escalate**
  - SNAPSHOT — confirm the de-escalation dialog
  - TYPE a reason into **Reason for de-escalation**
  - CLICK **De-escalate & release**
  - WAIT for the case to reload
- **Assertions:**
  - [x] ASSERT the de-escalation dialog shows the **Reason for de-escalation** field
  - [x] ASSERT (BLOCKING) the case is released from hold — status becomes `In Progress`
  - [x] ASSERT the compliance decision returns to `Awaiting Compliance Review`
  - [x] ASSERT the **De-Escalate** action is replaced by **Escalate** again

---

### TC-08 — The audit log records the escalation and de-escalation
- **Type:** Function — audit trail of transitions
- **Depends on:** TC-07
- **Steps:**
  - Open the **Audit Log** dialog
- **Assertions:**
  - [x] ASSERT a `Case Escalated to Governance` entry exists
  - [x] ASSERT a `Case De-escalated from Governance` entry exists
  - [x] ASSERT a `Decision Captured` entry records the escalated decision
  - [x] ASSERT these entries are attributed to the signed-in compliance user
  - [x] ASSERT the **Escalation History** tab is available

---

### TC-09 — Finalising a case by signing it off
- **Type:** Happy path — finalisation
- **Depends on:** TC-07
- **Steps:**
  - CLICK **Sign off case**
  - SNAPSHOT — confirm the sign-off dialog
  - SELECT a **Decision Status**
  - TYPE a **Rationale**
  - CLICK **Sign off & generate report**
  - WAIT for the case to reload
- **Assertions:**
  - [x] ASSERT the sign-off dialog shows **Decision Status** and **Rationale**, and states the report is immutable
  - [x] ASSERT (BLOCKING) the case status becomes `Signed Off`
  - [x] ASSERT the compliance decision reflects the chosen decision status

---

### TC-10 — Sending a case back to frontline
- **Type:** Happy path — send back (terminal branch, second case)
- **Steps:**
  - NAVIGATE to the Cases listing
  - EXTRACT a **different** eligible case (`Awaiting Compliance Review`, unassigned)
  - Open it and CLICK **Send Back**
  - SNAPSHOT — confirm the send-back dialog
  - SELECT a **Reason** and TYPE **Details / Instructions**
  - CLICK **Send Back**
  - WAIT for the case to reload
- **Assertions:**
  - [x] ASSERT the send-back dialog shows **Recipient**, **Reason** and **Details / Instructions**
  - [x] ASSERT the Recipient defaults to the originating RM
  - [x] ASSERT (BLOCKING) the compliance decision becomes `Referred to Frontline`

> A second case is used deliberately: send-back and sign-off are competing terminal transitions, and
> a signed-off case is locked. Running both on one record would make the later assertion depend on
> which transition the app happens to allow last.

## Out of scope
- **`Returned for Compliance Review`** — a real state in the decision vocabulary, but not reachable
  from the compliance role's own actions. It most likely appears when frontline resolves a send-back,
  which needs the RM role and a case already sent back.
- **Applying a risk override** — see the note on TC-05.
- **Enhanced Due Diligence Required**, **Cleared - no match**, **Permanently cleared - deceased** and
  the other decision statuses: only the one chosen in TC-09 is exercised. The full decision matrix
  needs one case per status and belongs in its own plan.
