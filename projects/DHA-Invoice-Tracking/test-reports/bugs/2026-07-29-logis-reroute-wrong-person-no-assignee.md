# BUG — LOGIS "wrong person to confirm delivery" re-route creates a task nobody can action

| | |
|---|---|
| **Logged** | 2026-07-29 |
| **Severity** | **High** — the branch is a dead end; the item can never be completed or cancelled by an available user |
| **Environment** | **TEST** — https://dha-smartgov-adminportal-test.shesha.app (API `dha-smartgov-api-test.shesha.app`) |
| **Process / step** | LOGIS Request For Payment → *Certify Invoice* → outcome **"I am the wrong person to confirm the delivery"** → **Re-route to Correct Business Unit** |
| **Plan** | `test-plans/invoice-process/logis.md` **TC-04** |
| **Item** | **PAY3076/2026**, instance `8f089a43-7cc4-4bd1-b54e-2c91a95c70c2` — Order OR-126151, invoice DHA-LOG-3076, R207 |
| **Status on QA** | Untested — this branch has never been exercised on QA either |

## Symptom

Certifying with *"I am the wrong person to confirm the delivery"* works as designed right up to the
hand-off. The dialog *"I am the wrong person to confirm delivery"*
(`…-wf-CertifyInvoice-WrongPersontoConfirm-dialog v6`) appears, requires a comment (`Ok` disabled until
text is typed), and on OK:

- *Certify Invoice* is completed with **outcome 3**
- a new step **"Re-route to Correct Business Unit"** becomes active (`status: 1`,
  `activatedOn 2026-07-29T08:14:19`, `overdueDate 2026-07-31`)
- no 4xx/5xx at any point

**But the new task has no assignee**, so no one can open it. `Process/Progress` returns:

```json
{
  "actionText": "Re-route to Correct Business Unit",
  "assignedTo": [],
  "status": 1,
  "activatedOn": "2026-07-29T08:14:19.737",
  "overdueDate": "2026-07-31T08:14:19.717",
  "completedOn": null
}
```

For contrast, every **other** active step in this same workflow resolves real names in that identical
field — *Certify Invoice* → `["Thabiso Maake"]`, *Capture and Link Invoice on LOGIS* → its five
`Capture Payment on LOGIS` members, *Pre-Authorise Payment* → `["MAHLATSE RAMORASWI MAZWI","MONICCA
JOHANNA KABINI"]`.

## Verification — all 8 available logins checked, two ways each

Checked both the **Inbox** list and **`Process/Details.activeTodoItems`** (which is scoped to the calling
user, so it is an authoritative per-user check):

| Login | Person | In inbox? | `activeTodoItems` |
|---|---|---|---|
| `Admin` | System Administrator — **the capturer who registered it** | No | `[]` |
| `ThabisoM` | Thabiso Maake — **the certifier who triggered the re-route** | No | `[]` |
| `Mutshutshut` | Mutshutshu Tshithukhe | No | `[]` |
| `00000000` | Melissa Ndlovu | No | `[]` |
| `H18433740` | Monicca J Kabini | No | `[]` |
| `H19234198` | Tshianeo M Maboya | No | `[]` |
| `H10226923` | Susanna M Erasmus | No | `[]` |
| `H23086050` | Lesetja J Bambo | No | `[]` |

`Process/Details` also reports **`canReassign: false`**, so there is no reassignment escape hatch through
the UI either.

## Steps to reproduce

1. As `Admin`, register a LOGIS Request For Payment (any order with invoiceable line items,
   e.g. OR-126151); set **Business Unit = Thabiso Maake**; commit an invoice row; tick a line item; Submit.
2. Log in as `ThabisoM` and open the *Certify Invoice* task.
3. Choose **"I am the wrong person to confirm the delivery"**, Submit, type a comment, click `Ok`.
4. Try to find the resulting *Re-route to Correct Business Unit* task as any user.

**Expected:** the re-route task is assigned to someone — per plan TC-04 it presents a
*Business Unit/End-User* picker and, once a correct end-user is chosen, routes back to *Certify Invoice*.
**Actual:** the task is active but unassigned; no available account can see or action it. The invoice is
stranded.

## Ruled out before logging

- **Not the test harness** — driven by hand through the real UI via MCP; the decision persisted
  (outcome 3 recorded, step activated), so the submission itself succeeded.
- **Not a stale page** — the API was re-queried after each of the eight logins.
- **Not an admin-visibility quirk** — `Admin`, the initiator, also has nothing.
- **Not a UI-only glitch** — the empty assignee list comes from the API, not from the DOM.

## What I could not determine

Whether the task is genuinely **unassigned** (workflow-definition bug) or assigned to a **person/role
outside our eight test accounts** (an environment gap, the same shape as the
[HLEKANEI ROSE MATHE query-role gap](2026-07-29-logis-capture-and-link-no-test-account-in-role.md) and the
`Capture Payment on LOGIS` gap). The empty `assignedTo` favours the former, since that field resolves
names for every other active step — but confirming it needs someone with workflow-definition/DB access.

➡️ **Ask:** confirm what *Re-route to Correct Business Unit* is assigned to in the LOGIS workflow
definition. Per TC-04's intent it most plausibly belongs to the **invoice capturer** (`Admin` on this
item), who does not have it.

## Impact

- The entire TC-04 re-route branch is unexecutable, including the *Business Unit/End-User* picker and the
  documented return to *Certify Invoice*.
- Any invoice where a certifier honestly says "this isn't mine" becomes stranded — no completion,
  no rejection, no reassignment.
- **PAY3076/2026 is currently stuck this way** and will stay stuck until the assignment is fixed.

## Related

Full run detail: [../2026-07-29/logis-negative-branches.md](../2026-07-29/logis-negative-branches.md) §1.
