# Observation — SMS notification on case creation works

**Date:** 2026-09-02
**Environment:** QA — https://pd-dep-adminportal-qa.shesha.app
**Build:** `Boxfusion.ServiceManagement/case-add v9`, `Boxfusion.Dep/update-submitter v31`
**Type:** Exploratory check, not an ADO case

## What was checked

Whether the Case Management module actually **dispatches** the acknowledgement SMS when a case is created for
a submitter whose **Preferred Contact Method** is `SMS`. No case in ADO suite 112754 covers notification
delivery — the suite stops at case creation — so this was driven ad hoc.

## Method

One case created through the portal:

| Field | Value |
|---|---|
| Channel | `Call Centre` |
| Submitter first name | `SmsCheck35197` (unique, for identification) |
| Mobile Number | a real personal handset — **deliberately not recorded here** |
| Email Address | `qa.auto@test.com` |
| Preferred Contact Method | `SMS` |
| Category / Case type | `Electrical` / `Area Power Failure` |
| Address | `Heidelberg` (inside Lesedi, via geolocation) |
| Description | `QA-SMS-TEST …` |

The number was read back out of the form immediately before submitting, to rule out the input silently
reformatting it: it held all **10 digits with the leading `0` intact**. That check matters because a stripped
leading zero would send the SMS to a different number and present as "SMS is broken".

## Result

✅ **The SMS was received on the handset.** Case creation → SMS dispatch works end to end on this build.

## Notes

- The test was run headed and the number supplied through an `SMS_TEST_MOBILE` environment variable read by
  a throwaway script outside the repo, so no personal number reaches a tracked file or git history. Do the
  same for any future delivery check.
- The new case did not appear on page 1 of the Cases list on an immediate reload, so the list ordering or
  cache lags slightly behind creation. Not investigated; find the record by submitter name `SmsCheck35197`.
- **Not checked:** email delivery for Preferred Contact Method `Email`, `Push`, the inbound direction
  (Channel `SMS`, i.e. a case *raised* by SMS rather than acknowledged by it), the message body/wording, and
  whether anything is sent when Preferred Contact Method is left blank. All are candidates for a
  notifications suite, which ADO does not currently have.

## Cleanup

The `SmsCheck35197` case remains in QA and should be deleted with the other `QA-AUTO` records.
