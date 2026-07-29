# BUG — Register & Upload Invoice `Submit` intermittently returns 500, with no UI feedback

| Field | Value |
|---|---|
| **Logged** | 2026-07-29 |
| **Severity** | Medium (intermittent; retry clears it) — but **silent** to the user |
| **Environment** | TEST — https://dha-smartgov-adminportal-test.shesha.app/ (API `dha-smartgov-api-test.shesha.app`) |
| **Process** | BAS Request For Payment — step 1, *Register and Upload Invoice* |
| **Form** | `Shesha.SaGovInvoiceTracking/SAGovRequestForPayment-BAS-wf-RegisterScanandUploadInvoices-Create v9` |
| **Activity** | `Activity_0e0c34w` |
| **Status** | Open — a residual, low-frequency recurrence of [2026-07-28-bas-logis-test-env-register-upload-submit-500.md](2026-07-28-bas-logis-test-env-register-upload-submit-500.md) (which was a hard 5/5 failure and **is** fixed) |
| **Reproduced on** | PAY3061/2026, instance `ee3e9923-7b87-4e30-a8ed-1895dcb6b9a6`, 2026-07-29 07:59 SAST |

## Symptom

Clicking `Submit` on a completely valid *Register and Upload Invoice* form does nothing visible: the
page stays on the Draft form, no toast, no inline validation, no notification. Underneath, the API call
has failed:

```
POST /api/services/SheshaWorkflow/Process/UserTaskComplete  →  500

{"result":null,"success":false,
 "error":{"code":0,
   "message":"An internal error occurred during your request!",
   "details":"Task execution failed. Workflow instance id: `ee3e9923-e124-…`,
              elementId: `Activity_0e0c34w` (Exception has been thrown by the target of an invocation.)"}}
```

Request payload (captured via an `XMLHttpRequest` interceptor — the app uses XHR, not fetch):

```json
{"id":"ee3e9923-7b87-4e30-a8ed-1895dcb6b9a6",
 "todoId":"ff8b57ed-ef5e-460d-a421-f6b228a850ab",
 "data":{"subject":"Invoice(s) - DHA-INV-3061 | Supplier Name - ATLANTIS CORPORATE TRAVEL",
         "model":{"id":"7df717d0-1190-4ba9-b774-74330414c4ad",
                  "supplier":"eb34b184-66cb-4a14-86d0-649498ad79af",
                  "dateReceived":"2026-07-29T00:00:00Z","description":null}},
 "decisionUid":"GGMPWtCx1Jv9OjoiNvMq8"}
```

Nothing about the payload is malformed, and all row/attachment writes that precede it returned 200
(`SaGovRequestForPaymentInvoice/Crud/Create`, `PUT /api/StoredFile`, `UserTaskSave`).

## Frequency — intermittent, not deterministic

| Attempt | Item | Result |
|---|---|---|
| 1st Submit | PAY3061/2026 | **500** (`Activity_0e0c34w`) |
| 2nd Submit, identical, ~16 s later, nothing edited | PAY3061/2026 | **200** → routed to *Assign Branch Finance Admin*, Draft → RECEIVED |
| 1st Submit on a freshly registered invoice | PAY3065/2026 (DHA-INV-3065, R18 750) | **200** first time → routed correctly |

So it is neither "always the first attempt" nor "always this activity" — 1 failure in 2 full
registrations on 2026-07-29. Contrast with 2026-07-28, when it failed **5/5 across 3 instances** before
the workflow definition was reconfigured. The hard blocker is fixed; this is a residual flake.

## Steps to reproduce

1. Log in as `Admin` / `DHA@Admin_2026#xP4!`, switch view mode Live → **Latest**.
2. Workflows → My Items → Create New → **BAS Request For Payment**.
3. Pick supplier **ATLANTIS CORPORATE TRAVEL** (KL772) via the ellipsis → Select Item → double-click.
4. Add one invoice row (invoice date, service delivery date, invoice no, amount, invoice PDF) and commit
   it with the plus-circle button; attach one supporting document.
5. Click `Submit`.

Expected: the item is submitted and routed to *Assign Branch Finance Admin To Assign Certifier*.
Actual (intermittently): `UserTaskComplete` 500, item stays Draft, **and the UI says nothing at all**.

## Two defects here, really

1. **The 500 itself** — a `TargetInvocationException` inside `Activity_0e0c34w` on a well-formed
   request. The inner exception is not surfaced in the response, so it needs a server-log trace from
   the run at **2026-07-29 07:59:26 SAST** on TEST.
2. **The silent failure** (arguably the more serious of the two) — a failed submit produces no toast, no
   error, no state change a user can perceive. A capturer will read it as a missed click. This mirrors
   the LOGIS Certify silent-500 raised on 2026-07-28, which suggests the workflow-action form swallows
   `UserTaskComplete` failures generally rather than this being specific to one activity.

## Workaround

Click `Submit` again — the retry succeeded immediately, with no data loss and no duplicate created.

## Notes for whoever picks this up

- The app calls the API over **XHR, not fetch**; patch `XMLHttpRequest.prototype.open/send` plus a
  `loadend` listener to read 500 bodies and payloads.
- The BAS chain is otherwise fully healthy — PAY3061 went all 11 steps to **Paid + Filed** in ~12 min
  with no other error. See [../2026-07-29/bas-full-chain-PAY3061.md](../2026-07-29/bas-full-chain-PAY3061.md).
