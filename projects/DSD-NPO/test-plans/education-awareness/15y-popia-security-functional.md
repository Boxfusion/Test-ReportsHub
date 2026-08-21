# Test Plan: NPO-15Y-F — E&A POPIA & Security (functional)

> **Status:** Imported from Azure DevOps 2026-08-20 — 4 cases (ADO suite 107358). ⚠️ **Only TC-04 is in black-box UI
> scope.** Per the scope rule ([[black-box-ui-only-no-api-testing]]) we do **not** test APIs/swagger as targets, so
> the transport/endpoint/log cases are handed to dev/security.
> **Owner:** QA
> **Last Updated:** 2026-08-20
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Suite | 107358 — *15Y E&A POPIA & Security* (4 cases) |

## Objective
> Verify the one user-facing POPIA control in E&A: that the public Contact Us / Enquiry form captures explicit POPIA
> consent before submission. The transport (HTTPS/HSTS), endpoint-auth (swagger) and server-log cases are out of
> black-box remit.

## 🔑 Scope decision (record, don't run)
| ADO | TC id | Case | Disposition |
|---|---|---|---|
| #107400 | TC-15Y-001 | Portal over HTTPS with HSTS header | 🚫 OUT — transport/API probe (curl headers). Dev/DevOps. |
| #107401 | TC-15Y-002 | E&A endpoints AbpAuthorize-gated (swagger, anon → 401) | 🚫 OUT — API endpoint is the target. Security/dev. |
| #107402 | TC-15Y-003 | No PII in application logs | 🚫 OUT — needs server log access. Dev. |
| #107403 | TC-15Y-004 | POPIA consent captured before Contact Us submit | ✅ **UI — runnable here** |

## 🔑 Context from 15E (2026-08-18)
- The nav **Contact Us** page is **static** (no form).
- The footer **Enquiry** button → `public-case-create` ("Submit A Query") is the actual form, and its Submit is
  **broken** (`NpoOrganisation/Crud/Get?Id=null` → 400, never POSTs a case) — bug
  `bugs/2026-08-18-public-enquiry-submit-broken-npoorganisation-null.md`.
- So TC-04 must first establish **which** surface is the "Contact Us form", then check for a consent control on it.

## Preconditions
- [ ] Public portal reachable (the Enquiry/Contact surfaces are reachable signed-out too).

## Test Cases

### TC-04 — POPIA consent captured before Contact Us submit (ADO #107403 · TC-15Y-004)
*P2 · Src:FDS · Public.* ✅ Runnable (UI).
- **Steps:** 1. Open the Contact Us / Enquiry form → 2. Look for a **consent checkbox with a plain-language POPIA
  notice** → 3. Try to submit **without** ticking consent.
- **Expected:** a consent checkbox is present with a readable POPIA notice; Submit is disabled, or the form rejects
  with a clear message, until consent is given.
- **Assertions:** [ ] RECORD whether a consent checkbox exists on the Enquiry form and/or the nav Contact Us page ·
  [ ] RECORD the notice wording if any · [ ] RECORD whether submit is gated on consent · [ ] note the interaction
  with the known broken-Enquiry-submit bug (a broken submit can't prove consent-gating either way — say so).

## Coverage against ADO
| Plan case | ADO | TC id | Runnable? |
|---|---|---|---|
| — | #107400 | TC-15Y-001 | 🚫 out — transport/API |
| — | #107401 | TC-15Y-002 | 🚫 out — swagger/API |
| — | #107402 | TC-15Y-003 | 🚫 out — server logs |
| TC-04 | #107403 | TC-15Y-004 | ✅ UI |

**1 of 4 in black-box UI scope; 3 recorded out-of-remit.**

## ADO anchors (machine-read — do not delete)
- ADO #107400 · TC-15Y-001
- ADO #107401 · TC-15Y-002
- ADO #107402 · TC-15Y-003
- ADO #107403 · TC-15Y-004

---

## 🔴 Executed 2026-08-20 — no POPIA consent on the Enquiry form; 3/4 out of remit
Report: `test-reports/2026-08-20/15y-popia-security-functional--contact-consent.md`

| Case | Verdict | Note |
|---|---|---|
| TC-15Y-004 | 🔴 FAIL | Enquiry form (`public-case-create`) collects name/mobile/email/geolocation with **no consent checkbox, no POPIA notice, no privacy link**. Nav Contact Us is static. Submit gated on Category, not consent |
| TC-15Y-001/002/003 | 🚫 OUT | transport/swagger/logs — dev/security per [[black-box-ui-only-no-api-testing]] |

🔑 **E&A 15-series now COMPLETE** (15A/15B/15C/15D/15E/15E2E/15W/15Y all run or dispositioned).
