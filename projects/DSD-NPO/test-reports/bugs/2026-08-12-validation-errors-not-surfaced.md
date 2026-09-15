# Server-side validation errors are silently discarded — a rejected save looks identical to success

**Date found:** 2026-08-12
**Severity:** 🔴 **High** — users believe data was saved when the server rejected it
**Module:** DSD-NPO · admin portal (and very probably the public portal too)
**Reproduced on:** Administration → User Management → **Register New User**
**Environment:** QA — `https://dsd-npo-adminportal-qa.shesha.app`, view mode **Latest**
**Account used:** `mpenduloizwelinuk@gmail.com` (developer's account)

## Symptom
A save that the server **rejects with HTTP 400** produces, in the UI:

- the modal **closing normally**, exactly as on a successful save
- **no error message** — no field error, no toast, no alert, no notification
- no indication anywhere that the record was not created

The user has no way to tell a rejected save from a successful one.

## Evidence
Submitting **Register New User** with every mandatory field populated, but a `Mobile Number` already held by
another person:

`POST /api/services/app/UserManagement/Create` → **400**

```json
{"result": null, "success": false,
 "error": {"code": 0,
           "message": "Your request is not valid!",
           "details": "The following errors were detected during validation.\n - Specified mobile number already used by another person\n",
           "validationErrors": [{"message": "Specified mobile number already used by another person", "members": null}]},
 "__abp": true}
```

Request sent:
```json
{"firstName":"QA","lastName":"Tester0812","mobileNumber":"0818400598",
 "emailAddress":"qa.tester0812@example.org","typeOfAccount":{"item":"Internal","itemValue":1},
 "userName":"qa.tester0812@example.org","password":"…","passwordConfirmation":"…"}
```

**The API did its job.** It returned a specific, human-readable, already-localised message in the standard ABP
`validationErrors` envelope. The front end simply does not render it.

Confirmed by a DOM sweep immediately after the modal closed: `.ant-form-item-explain-error`,
`.ant-message-error`, `.ant-alert-error` and `.ant-notification-notice-description` were all **empty**. The register
count stayed at **8,773**, proving nothing was created.

The same submission with a unique mobile number returned **200** and the user was created (8,773 → 8,774), so the
endpoint and the form are otherwise sound. The defect is purely the unreported failure.

## Steps to reproduce
1. Sign in to the admin portal; switch view mode to **Latest**.
2. **Administration → User Management** → **Register New User**.
3. Populate all eight mandatory fields, setting **Mobile Number** to one already held by another person — e.g.
   `0818400598` on this environment.
4. Click **Ok**.
5. **Observe:** the modal closes, nothing is reported, and no user is created.

## Expected
The validation message returned by the API should be displayed — ideally against the offending field, or at minimum
as a toast — and **the modal should stay open** so the value can be corrected.

## Actual
The message is discarded, the modal closes, and the failure is invisible.

## Impact
This is the single most damaging pattern found on the module, because it converts every server-side rejection into
apparent success. It is very likely the explanation for a second unexplained failure the same day:

- **CRM → Create Case** accepted all seven mandatory fields, closed on **Ok** with no error, and persisted nothing —
  no case in the register, in Assigned Cases, or on the CRM Dashboard
  (`test-reports/2026-08-12/create-and-resolve-case--tc01-create.md`). The create POST was not captured on that run,
  but the observable behaviour is identical. **Worth re-running with the response body captured to confirm.**

## Related — the same "no feedback" family, found the same day
Five instances, of which this is the only one where the message provably existed and was thrown away:

| Where | Behaviour |
|---|---|
| **Register New User** | 400 with a validation message → **discarded**, modal closes as if saved |
| CRM Create Case | Modal closes on Ok, nothing persisted, no message |
| Registration → Organisation Details | `Next` disabled with all 9 mandatory fields populated, no message |
| Registration → POPIA gate | `Next` disabled with one consent ticked, no message |
| Link to an Existing NPO | Submit stays disabled for every identifier tried, no message |

Whether these share one root cause is for the developers to say, but they present as one systemic gap: **the module
does not tell the user why an action cannot complete.**

## Notes
⚠️ **Awaiting Thabiso K's confirmation** of intended behaviour, per the project convention that expected results come
from the lead tester. The evidence here is a server response the UI demonstrably received and did not show, so this is
not believed to be an automation artefact.

Also worth checking against ADO work item **101615**, flagged as *"I think it failed testing"* and still unread.
