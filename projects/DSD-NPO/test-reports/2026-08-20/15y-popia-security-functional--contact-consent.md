# Report: NPO-15Y-F — E&A POPIA & Security (Contact Us consent)

**Date:** 2026-08-20 07:50 UTC
**Plan:** test-plans/education-awareness/15y-popia-security-functional.md
**Execution Mode:** ai-driven (Playwright MCP, live QA public portal)
**Result:** FAILED — the public Enquiry form collects personal data with no POPIA consent capture; 3 of 4 cases are out of black-box remit
**Duration:** ~250s
**Cases:** TC-15Y-004 (run) · TC-15Y-001/002/003 (out of scope — recorded, not run)
**Environment:** QA · public portal · `portal-contact-us` + `public-case-create`

## Summary
| Case | Area | Verdict |
|---|---|---|
| TC-15Y-001 | HTTPS + HSTS header | 🚫 OUT — transport/API probe (dev/DevOps) |
| TC-15Y-002 | Endpoints AbpAuthorize-gated (swagger) | 🚫 OUT — API endpoint is the target (security/dev) |
| TC-15Y-003 | No PII in application logs | 🚫 OUT — needs server log access (dev) |
| TC-15Y-004 | POPIA consent before Contact Us submit | 🔴 **FAIL** — no consent control, no POPIA notice |

Per the scope rule ([[black-box-ui-only-no-api-testing]]) the API/transport/log cases are handed to dev/security, not run here.

## 🔴 TC-15Y-004 — no POPIA consent on the public data-collection form
Two candidate "Contact Us" surfaces, per 15E:
- **Nav "Contact Us"** (`portal-contact-us`) is **static** — physical/postal address, tel, email, and a province
  lookup. No form, no inputs, no consent control. (Confirms the 15E static-page finding.)
- **Footer "Enquiry"** (`public-case-create`, titled **"Submit A Query"**) is the actual data-collection form. It
  captures **First Name, Last Name, Mobile Number, Email Address, Preferred Contact Method, Office Number**, an NPO
  lookup, a **Category** (required), a **Description**, and even **Address / Latitude / Longitude**.

**Finding:** the Enquiry form has **no POPIA consent checkbox and no privacy/POPIA notice of any kind.** A full-page
scan returned **zero** occurrences of *consent / POPIA / privacy / personal information / data protection / I agree*,
and there is **no privacy-policy link**. The only checkboxes on the form are functional toggles —
**"Search using NPO Number"** and **"Can't Find Address"** — not consent.
- So the case's expected "consent checkbox visible with a plain-language POPIA notice; submit gated on consent" is
  **not met** — there is nothing to tick. FAIL.
- The form's **Submit is disabled**, but that is because the required **Category** is empty, **not** because of any
  consent gate — the two must not be conflated.
- Evidence: `evidence/15y-enquiry-no-consent.png` (full page).

## Interaction with the known broken submit
This is the same `public-case-create` form whose **Submit is broken** (`NpoOrganisation/Crud/Get?Id=null` → 400, no
case POSTed — `bugs/2026-08-18-public-enquiry-submit-broken-npoorganisation-null.md`). So even the "try to submit
without consent" step can't be exercised end-to-end. But that is moot for this case: **the consent control is absent
outright**, which fails TC-15Y-004 regardless of whether submit works.

## Observation for the test lead (not a duplicate defect)
A public form collecting name, contact details and geolocation **without any POPIA consent or notice** is a POPIA gap
worth raising with Thabiso ([[dont-raise-defects-in-daily-reports]]). Recording it here as the TC-15Y-004 result +
an observation rather than a separate bug, since it is the case's own expected-vs-actual. No new API testing was done.

## Method notes
- Pure UI inspection; no endpoint or swagger probing ([[black-box-ui-only-no-api-testing]]).
- Consent absence confirmed by a whole-page text scan for privacy/POPIA/consent terms **and** an anchor scan for a
  privacy-policy link — both empty ([[read-console-before-calling-failure-silent]]).
