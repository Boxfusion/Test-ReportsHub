# 🟠 Medium — A placeholder SMS whose body is "ssdsd" is sent to a newly added office bearer

**Raised:** 2026-08-27
**Found in:** NPO-10-F TC-04 preparation — adding an office bearer to a Change Request
**Environment:** QA · public portal → notification store
**Severity:** 🟠 Medium — junk content leaves the platform to a real destination; embarrassing rather than dangerous, but it is wired into a live path

## What happens

Saving a new office bearer on a Change Request fires **two** notifications to that person:

| Fired | Subject | To | Body | Status |
|---|---|---|---|---|
| 2026-08-27 08:02:28.733 | `Email PostReg OB Verification` | the office bearer's email | correct — "you have been added as an office bearer to …" | 1 Sent |
| 2026-08-27 08:02:28.690 | **`SMS`** (blank/generic) | the office bearer's mobile | **`ssdsd`** | 8 Failed |

The email is right. The SMS carries a developer placeholder as its entire body and has no meaningful subject.

Its `status = 8` (Failed) here is only the QA SMS-credit problem — that is incidental. The template is registered and
the send was attempted, so on any environment with working SMS credit this message goes out.

## Reproduction

1. Public portal → an NPO with a Post Registration draft → wizard step 3 **Office Bearer Change** →
   **Add Office Bearer**.
2. Complete the office bearer (a passport-based, non-RSA record is sufficient) and **Save**.
3. Query the notification store for messages created in that second:
   `GET /api/dynamic/Shesha/NotificationMessage/Crud/GetAll?filter=<creationTime > …>`
4. Alongside the correct `Email PostReg OB Verification`, an `SMS` row appears whose `message` is `ssdsd`.

Recipient mobile was `0999999996` — deliberately an unallocated South African prefix, so nothing reached a real
subscriber. **Note the destination is whatever mobile the submitter typed**, so in production this reaches a member
of the public.

## Suggested fix

Either give the office-bearer-add SMS the same content as its email counterpart, or unregister the template. Worth a
sweep for other placeholder bodies at the same time — this one only surfaced because the store was read directly.

## Related
The 08-24 suite 14T harvest found 22 of 24 SMS templates over 160 characters and 54 emails linking to
`localhost:3000`. This is the same class of problem: notification templates that were never finished.
See [[dsd-npo-notification-templates-14t]].
