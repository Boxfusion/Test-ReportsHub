# Bug: Outcome and case-assignment emails link to `localhost:3000`, through a malformed anchor tag

**Date:** 2026-08-24
**Severity:** High
**Area:** Notifications — case assignment (investigations/CRM) and the `*: Outcome` / `*: Status` / `Auth Person Link` templates
**Environment:** QA
**Found by:** TC-14T-019 / TC-14T-021 (ADO #101846 / #101848) during the 14T store harvest

## Summary
**54 emails** in the notification store contain links to `https://localhost:3000/...`, spanning 2026-02-18 →
**2026-08-20**. For any recipient other than a developer on the machine that sent it, the link is dead.

The same templates also emit a **malformed anchor tag**, so the URL renders as visible raw text rather than a
hyperlink — the link would not be clickable even if the host were right.

## Steps to reproduce
1. Harvest the notification store (see `2026-08-24-ob-reminder-link-host-does-not-resolve.md` for the query).
2. Filter bodies matching `/localhost/` → 54 rows.
3. Inspect the raw `message` field of the newest (2026-08-06, subject `": Non-Compliance to NPO Act"`):

```
Hi <recipient name>,
 Kindly note that the case with reference number <br><br> has been assigned to you.Please log on to
 the system to view details and resolve the item. a href=\"https://localhost:3000/dynamic/
 Boxfusion.ServiceManagement/case-request-details?id=639ab1a5-874a-4441-a11c-3b697f413557\">:
 Non-Compliance to NPO Act</a>
```

## Expected
A link to the deployed environment's host, inside a well-formed `<a href="…">` element.

## Actual
Three defects in one line:
1. **Host is `localhost:3000`** — unreachable for every real recipient.
2. **The opening `<` of the anchor is missing** and the attribute quotes are **backslash-escaped** (`\"`), so the
   markup is not parsed as HTML. The recipient sees the literal text `a href=\"https://localhost:3000/…\">` followed
   by the link text and a stray `</a>`.
3. **The case reference number is empty** — *"the case with reference number `<br><br>` has been assigned"*. See
   `2026-08-24-appeal-and-case-letters-omit-their-reference-number.md`; same root pattern.

## Templates affected
`Auth Person Link` (multiple REF variants) · `Appeal outcome` · `Appeal Status` · `Application Outcome` ·
`Application Status` · `Post Registration Outcome` · `Post Registration Status` · `Compliance Status` ·
`Voluntary Deregistration Status` · the case-assignment mails whose subject renders as `": <reason>"`.

## Scope note recorded honestly
- These are the **REF-prefixed, per-record** notifications, not the main letter templates. The high-volume letters
  (`Registration Application *`, `Annual Compliance *`, `Voluntary Deregistration *`) contain **no URLs at all** and
  are unaffected.
- 54 rows is the count of messages, not of templates — a single misconfigured base URL likely explains all of them.
- I have not established whether `localhost:3000` comes from a template literal or from a deployed base-URL setting
  that is unset in this environment. Both are consistent with the evidence.

## Fix direction
Find the base-URL source these templates use and point it at the deployed host, then fix the anchor markup — the
escaped quotes suggest the HTML is being built by string concatenation with over-escaped input, so the same bug
probably affects every link in that template family.

## Verdict
Confirmed from stored message bodies. Contributes to TC-14T-019 and TC-14T-021 **FAILED**.
