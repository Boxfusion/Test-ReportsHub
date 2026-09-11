# Bug: The NPO name is interpolated into notification links without URL-encoding, truncating them

**Date:** 2026-08-24
**Severity:** Medium (link breakage confirmed; injection impact not established here)
**Area:** Notifications — `Office Bearer Acknowledgement Reminder` and `Registration Application OfficeBearerRegistry`
**Environment:** QA
**Found by:** TC-14T-005 (ADO #101832)

## Summary
Both office-bearer templates build their confirmation URL by concatenating the organisation name into a query string
**without URL-encoding it**. An organisation registered as `<script>alert(1)</script>QA_XSS_NPO` therefore produces a
link that is **cut short at the `)`**, so the URL is malformed and the confirmation flow is unreachable for that
organisation's office bearers.

19 rows across 4 templates carry script-like markup, most recently **2026-08-24** — today's reminder run.

## Evidence
Stored link from the 2026-08-24 00:01 reminder:

```
https://dsd-npo-publicportal-qa.azurewebsites.net/no-auth/boxfusion.dsdnpo/ob-self-verification
    ?mode=edit&tempId=efa4adbd2b74&npo=&lt;script&gt;alert(1
```

The URL simply ends after `alert(1` — the closing `)` terminated it. Body text from the same message:

> This is a reminder that you have been added as an office bearer to the `&lt;script&gt;alert(1)&lt;/script&gt;QA_XSS_NPO`
> for the NPO Application Registration to the Department of Social Development.

Affected templates and rows:

| Template | Rows | Dates |
|---|---|---|
| Email / SMS Registration Application OfficeBearerRegistry | 12 | 2026-08-18 |
| Email / SMS Office Bearer Acknowledgement Reminder | 6 | 2026-08-24 |
| Account Invitation New User | 1 | 2026-08-18 |

## Steps to reproduce
1. Harvest the notification store (query in `2026-08-24-ob-reminder-link-host-does-not-resolve.md`).
2. Filter bodies for `script|onerror|javascript:` → 19 rows.
3. Extract the URL from the newest reminder row and note it terminates mid-payload.

## Expected
The organisation name is URL-encoded when placed in a query string, so the link stays well-formed whatever the name
contains.

## Actual
Raw interpolation. Any name containing `&`, `#`, `?`, a space or a bracket will corrupt the link; the XSS test name
makes it obvious, but ordinary names with an ampersand would break it too.

## What this bug does NOT claim — recorded honestly
- **No stored XSS in the email.** In the message *body* the payload is HTML-escaped (`&lt;script&gt;`), so it renders
  as visible text and does not execute. I am not claiming script execution in the mail client.
- **The landing-page behaviour was not tested.** Whether the public portal reflects an unencoded `npo` parameter
  unescaped is a **reflected-XSS question that belongs to suite 14Z**, with the dev team's knowledge — not something
  to probe unilaterally here. Flagged, not tested.
- The confirmed, demonstrable defect is the **malformed URL**, which needs no security argument at all.

## Related question, not this bug
That an organisation could be **registered** with `<script>alert(1)</script>` in its name is an input-validation gap on
the registration wizard (suite 03) or 14Z. Someone created `QA_XSS_NPO` deliberately as test data; the form accepted
it, and it now propagates into outbound notifications.

## Fix direction
URL-encode every value interpolated into a notification link. Then decide separately whether the registration form
should accept markup in an organisation name.

## Verdict
Contributes to TC-14T-005 **FAILED**. Link-truncation confirmed from stored bodies; injection impact out of scope here.
