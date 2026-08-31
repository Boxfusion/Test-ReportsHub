# Observations: notification template copy defects and open questions

**Date:** 2026-08-24
**Source:** 14T store harvest — `test-reports/2026-08-24/14t-notification-templates-functional--store-harvest.md`
**Scope:** 2 521 messages, 132 distinct subjects, 2026-01-13 → 2026-08-24

These are low-severity but high-visibility items — every one of them is read by an NPO chairperson. Grouped here
rather than logged as separate bugs because they are all copy, in the same family of templates, and would presumably
be fixed in one pass.

## 1. "National **Departmet** of Social Development"
`Department` is misspelt in at least 8 templates, including both of the highest-volume registration letters:

- Email Registration Application Acknowledgment (104 msgs)
- Email Registration Application Incomplete (65)
- Email Registration Application Successful (46)
- Email Annual Compliance Submission Acknowledgement (42)
- Email Annual Compliance Submission Successful (8)
- Email Annual Compliance Submission Incomplete (16)
- Email Denied Post Registration (11)
- Email Acknowledgement Appeal (27)

## 2. Two templates send recipients to the wrong domain
Most letters cite `www.npo.gov.za`. Two cite **`www.npo.org.za`**:

- `Email Registration Application Unsuccessful`
- `Email Registration Application Successful`

A national department would be `.gov.za`, so `.org.za` looks wrong — but which is canonical is the test lead's call,
not mine. It matters because these are the two outcome letters most likely to be acted on.

## 3. Literal bracket markup leaking into the body
Rendered text includes `[( www.npo.gov.za )]` and `[(www.npo.org.za)]`, brackets and parentheses included. Looks like
a link syntax that was never processed. Appears in the Acknowledgment, Unsuccessful and Successful templates.

## 4. "Post **Rgistration**"
`Email Denied Post Registration`. Logged with its dropped-NPO-name defect in
`bugs/2026-08-24-denied-post-registration-letter-drops-npo-name.md`.

## 5. Inconsistent switchboard number
`(012) 312 **7900**` in the registration and annual-compliance letters; `(012) 312 **7500**` in the appeal, voluntary
deregistration, OB and post-registration letters. Both appear in current templates. One is presumably stale.

## 6. Nothing is personalised, and the one attempt renders wrong
Every letter opens *"Dear Chairperson"* or *"Dear Sir/Madam"* — no name, despite the chairperson being a known person
on the application. The one template that does interpolate a name, `Registration Application OfficeBearerRegistry`,
currently renders **"Dear Not Verified"** — the office bearer's verification status appears to be occupying the name
slot. Earlier rows in the same template (May) rendered real names, e.g. *"Dear Mr/Miss …"*, so this is a regression
rather than a template that never worked.

That one is not merely cosmetic — addressing a member of the public as "Not Verified" is the kind of thing that gets
screenshotted. It is scored under TC-14T-005 **FAILED** in the run report.

## Questions for the test lead
1. Is the canonical website `www.npo.gov.za` or `www.npo.org.za`?
2. Which switchboard number is current — 7900 or 7500?
3. Should letters address the chairperson by name? The data is there.
4. `status: 16` appears on 2 notification rows. We know `1` = Sent and `8` = Failed — what is 16?
5. SMS is **not** uniformly failing on QA: 195 rows carry `status: 1` against 969 at `status: 8`. Has credit been
   topped up intermittently? Our standing note that "no SMS can pass on QA" is too strong and should be corrected.
