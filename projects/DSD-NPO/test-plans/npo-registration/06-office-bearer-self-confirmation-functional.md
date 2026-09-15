# Test Plan: NPO-06-F — Office Bearer Self-Confirmation (functional)

> **Status:** Imported from Azure DevOps 2026-08-25
> **Owner:** QA
> **Last Updated:** 2026-08-25
> **Estimated Duration:** 420s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe (admin, for status checks) |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101889) |
| ADO Suite | 101889 — *06 OB Self-Confirmation* (6 cases) |

## Objective
> Verify the office-bearer self-confirmation flow: that a decline requires a reason and flags the OB, that the
> confirmation link is single-use and time-bound, and that the application status reflects the aggregate outcome
> (all confirm / some confirm / any decline).

## Provenance
Imported from the ADO functional plan on 2026-08-25 via the browser + REST route. Raw pull at
`test-data/ado-functional-101543/ado-suite-101889.json`. **5 of 6 cases carry `Drift-Risk`.**

## Preconditions
- [ ] An OB confirmation link on an application **we own** — harvested from the notification store
      (`ob-self-verification?mode=edit&tempId=<...>&npo=<...>`)
- [ ] 🔑 View mode **Live → Latest** on the admin portal for status checks
- [ ] The OB-status vocabulary: `RefListApplicationStatus` — `16 = OB Confirmed`, `13 = OB Partially Confirm`,
      `7 = OB Confirmation Failed` (from the ADO cases)

## 🔑 Method note
The thank-you page (TC-14T-006) is already proven to render. This suite goes further: it drives a **decline**, tests
**single-use**, and reads the **application-level status** aggregation. Status counts are read from the register
(`NpoApplication.applicationStatus`) and OB verification from `NpoOfficeBearer.isVerified`; verify the transition,
never assume it from the thank-you page.

## Test Cases

### TC-01 — Decline ('No') requires a comment and flags the OB (ADO #101705 · TC-06-003)
*Priority 1 · Negative · `Src:Both`.*
- **Steps (ADO):** OB clicks link, selects 'No I am not part of this organisation', adds comment, submits
- **Expected (ADO):** *"OB is flagged 'Not part of NPO' with reason; counts toward OB Confirmation Failure; admin sees this (FDS 7.6 rule 2)"*
- **Assertions:** [ ] (BLOCKING) a 'No' submission without a comment is refused · [ ] the OB is flagged with the reason · [ ] it counts toward OB Confirmation Failure
- **🔑** Test "required" by submitting with the comment empty, not by reading an asterisk.

### TC-02 — Confirmation link is single-use (ADO #101706 · TC-06-004)
*Priority 2 · Edge · `Drift-Risk`.*
- **Steps (ADO):** OB clicks the same link again
- **Expected (ADO):** *"Page indicates the link has already been used; cannot change response"*
- **Assertions:** [ ] (BLOCKING) a used link cannot be re-submitted · [ ] the page says so

### TC-03 — Confirmation link is time-bound (ADO #101707 · TC-06-005)
*Priority 3 · Edge · `Src:FDS` · `Drift-Risk`.*
- **Steps (ADO):** OB opens link after expiry
- **Expected (ADO):** *"Page indicates link expired and instructs OB to request a new one"*

### TC-04 — Status → 'OB Confirmed' once all OBs confirm (ADO #101708 · TC-06-006)
*Priority 1 · `Src:FDS` · `Drift-Risk`.*
- **Expected (ADO):** *"Status moves to 'OB Confirmed' (RefListApplicationStatus = 16) and triggers next workflow step"*
- **Assertions:** [ ] (BLOCKING) an application whose OBs all confirmed reaches status 16 (or is shown to have passed through it)

### TC-05 — Status → 'OB Partially Confirmed' if only some confirm (ADO #101709 · TC-06-007)
*Priority 2 · Edge · `Src:FDS` · `Drift-Risk`.*
- **Expected (ADO):** *"Status = 'OB Partially Confirm' (RefList=13)"*

### TC-06 — Status → 'OB Confirmation Failed' if any OB says No (ADO #101710 · TC-06-008)
*Priority 1 · Negative · `Src:Both`.*
- **Expected (ADO):** *"Status = 'OB Confirmation Failed' (RefList=7); reason captured; application flagged for resubmission (FDS 6.2)"*

## Coverage against ADO
| Plan TC | ADO id | ADO TC | Runnable |
|---|---|---|---|
| TC-01 | #101705 | TC-06-003 | ✅ decline on an OB we own |
| TC-02 | #101706 | TC-06-004 | ✅ re-open a used link |
| TC-03 | #101707 | TC-06-005 | ⛔ needs an expired link |
| TC-04 | #101708 | TC-06-006 | ✅ status observable |
| TC-05 | #101709 | TC-06-007 | ✅ status observable |
| TC-06 | #101710 | TC-06-008 | ✅ status observable |
