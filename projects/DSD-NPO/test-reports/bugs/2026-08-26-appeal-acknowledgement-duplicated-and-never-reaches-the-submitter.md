# Bug: appeal acknowledgement is sent twice on every channel, and never reaches the person who submitted the appeal

**Date:** 2026-08-26
**Severity:** 🟠 **Medium** (duplicate outbound messages to the public; the submitter gets no confirmation at all)
**Area:** Appeal submission → notification templates *Email Acknowledgement Appeal* / *SMS Acknowledgement Appeal*
**Environment:** QA · public portal · appeal `APPEAL1447/26/08/2026` on NPO `Test Unsuccessful 03`
**Found by:** smoke TC-11-005, submitting an appeal end to end as `npo.qa.applicant.a@example.org`

## What happens

A single appeal submission at `05:01:46` produced **four** notification messages:

| Time | Template | Recipient | Status |
|---|---|---|---|
| 05:01:46.473 | SMS Acknowledgement Appeal | the office bearer's mobile | **8 Failed** |
| 05:01:46.523 | Email Acknowledgement Appeal | the office bearer's email | **1 Sent** |
| 05:01:46.593 | SMS Acknowledgement Appeal | the office bearer's mobile | **8 Failed** |
| 05:01:46.623 | Email Acknowledgement Appeal | the office bearer's email | **1 Sent** |

Two separate defects sit in that table.

### 1. Every acknowledgement is duplicated
Two emails and two SMS, ~100ms apart, for one submit. The recipient receives the same acknowledgement twice.

### 2. The submitter is never told
The appeal was filed by `npo.qa.applicant.a@example.org` — the signed-in portal user who completed and submitted the
form. **That account receives nothing.** Every message goes to the **office bearer selected on the form**, who may be
a different person entirely and who took no action.

The submitter is left with no confirmation that their appeal was received, on any channel.

## Steps to reproduce

1. Sign in to the public portal as an applicant who belongs to an NPO at OrganisationStatus 9.
2. NPO landing → **Appeals** → **Initiate Appeal**.
3. Complete the form — mode, office bearer, declaration name/surname/capacity — and **Submit**.
4. Query the notification store for the submission minute:
   `GET /api/dynamic/Shesha/NotificationMessage/Crud/GetAll?filter={">=":[{"var":"creationTime"},"<submit time>"]}`
5. Observe four messages, two per channel, none addressed to the submitting account.

## Impact

- Duplicate messages to members of the public look like a system fault and erode trust in the notification channel.
- The person who actually lodged the appeal has no record that it succeeded — which matters for a statutory process
  with an appeal window attached to it.
- Duplicate SMS doubles the send cost on a channel that is already failing on credit in QA.

## Note on the SMS legs
Both SMS messages record **status 8 (Failed)**, consistent with the known QA SMS credit issue recorded in
`../2026-08-24/14t-notification-templates-functional--store-harvest.md`. That is **not** part of this bug — the
duplication and the addressing are, and both are visible on the email legs which sent successfully.

## Questions for the test lead
- Should the acknowledgement go to the submitting portal user in addition to the office bearer?
- Is a single acknowledgement per channel per submission the intended behaviour? (Assumed yes.)

## Related
- Report: `../2026-08-26/11p-appeals-submitter--precondition-built-and-appeal-submitted-e2e.md`
- `../2026-08-24/14t-notification-templates-functional--store-harvest.md`
