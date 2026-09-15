# Report: NPO Registration 04 — Wizard Tab 4, Office Bearers

**Date:** 2026-08-14 06:50 UTC
**Plan:** test-plans/npo-registration/04-wizard-office-bearers.md
**Spec:** test-plans/npo-registration/04-wizard-office-bearers.spec.ts
**Execution Mode:** ai-repair
**Result:** BLOCKED — the CIPC integration is wired but the upstream service returns 503 on QA
**Duration:** ~240s
**Cases:** TC-04-008
**Assessed-not-executed:** TC-04-001, TC-04-023
**Environment:** QA · public portal · view mode **Latest** · form `boxfusion.dsdnpo/create-npo v61`
**Application under test:** APPL26-01106 (`QA Smoke NPO 2026-08-14`)

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 4 | 1 | 0 | 3 |

## Step Results

### TC-02 — Legal Form NPC pre-populates the OB list from CIPC (ADO #101662 · TC-04-008)
**Mode:** ai-repair — probed with a well-formed but unverified CIPC number, per the agreed approach
**Duration:** ~240s

- [PASS] Set Legal Form = **NPC**, entered `2019/123456/08` in `NPCRegistration No` (value read back and confirmed)
- [SKIPPED] **(BLOCKING)** ASSERT directors and NPC details are pre-populated from CIPC — **not reachable**
- [SKIPPED] ASSERT manual addition is still available alongside the CIPC rows
- [SKIPPED] Remaining assertions

## The useful result: the integration exists, the upstream does not respond

Entering the number fires **two calls, immediately and automatically**:

```
POST /api/services/dsdnpo/CipcIntegrationActions/GetEnterpriseInformation?enterpriseNumber=2019/123456/08
POST /api/services/dsdnpo/CipcIntegrationActions/GetEnterpriseDirectors?enterpriseNumber=2019/123456/08
```

**Both return HTTP 500**, wrapping the same upstream failure:

```json
{"success":false,"error":{"message":"An internal error occurred during your request!",
 "details":"Response status code does not indicate success: 503 (Service Unavailable)."}}
```

Two conclusions, and I want to be careful about which is which:

1. **Firm:** the CIPC integration **is implemented and wired to the field** — both an enterprise-information and a
   directors endpoint are called on entry. Any doubt about whether this was built is settled. It also means the
   answer to the plan's open question ("which CIPC number should QA use?") is **moot until the upstream is up**.
2. **Firm, and independent of the number being real:** the failure is **completely silent in the UI**. No
   `.ant-form-item-explain-error`, no toast, no notification — nothing. A user entering a genuine NPC number while
   CIPC is down would simply find an empty office-bearer list at Tab 4 with no explanation. This is the same
   swallowed-error family as the headline 400-validation defect and the silent DHA non-match.
3. **Not established:** whether a *valid* number would return directors. **The case stays BLOCKED, not FAILED.**

## 🔑 RETRY 45 MINUTES LATER — the 503 was transient, and the picture changed

Re-entered the same number on a second draft at **08:20 UTC**. Both endpoints now return **200**:

```
GetEnterpriseInformation → 200  {"result":{"enterprise":[],"response_message":"Records found."},"success":true}
GetEnterpriseDirectors   → 200  {"result":{"directors":[], "response_message":"Records found."},"success":true}
```

This changes three things:

1. **The earlier 503 was a transient outage, not a permanent stub.** CIPC is reachable on QA. Worth retrying any
   CIPC-dependent case rather than treating it as environmentally blocked.
2. 🔴 **The upstream contradicts itself.** For a number that does not exist it returns **empty arrays** alongside
   **`"response_message": "Records found."`**. Anything trusting that message would conclude it had data. Whether the
   fault is CIPC's or the adapter's is for the devs, but a caller cannot distinguish "found nothing" from "found
   something" on this response.
3. ✅ **The silent-failure finding is now CONFIRMED and stronger, not weaker.** With the service healthy and returning
   a successful response containing no directors, the UI still shows **nothing at all** — no message, no empty-state,
   no hint. The earlier reading was confounded by the outage; it no longer is. An NPC applicant whose company is not
   in CIPC gets an empty office-bearer list and no explanation.
4. ✅ **TC-04-008's second assertion passes:** with zero CIPC directors returned, **office bearers can still be added
   manually** — three were captured by hand on this draft with no interference from the integration.

**What is still needed to pass the case:** a **real CIPC registration number** for an existing NPC. Now that the
service is confirmed up, that request is worth making — it is the only remaining obstacle to the primary assertion.

## 🔑 DHA resolves MORE than one ID — the "exactly one" note is superseded

A second checksum-valid SA ID (1994 date of birth, male, citizen) was entered on the **RSA-ID variant** of the Add
Office Bearer form and **resolved** — DHA returned a match and populated the locked name fields.

⛔ **The ID itself is deliberately not recorded here: it belongs to a real person** (confirmed by the tester after the
test). It has been redacted from this report and from the project notes. **Do not re-use it, and do not record live
SA ID numbers in test artefacts.**

**This supersedes the earlier note that DHA resolves exactly one id on QA (`8001015009087` → Ryno Koen).** It follows
that yesterday's four non-matching checksum-valid IDs were simply **absent from DHA's dataset**, not evidence of a
broken lookup. The integration works for any ID it holds. The silent-non-match defect
(`2026-08-13-dha-non-match-is-silent-on-office-bearer.md`) is unaffected — that is about the *absence of feedback* on
a miss, which still stands.

### 🔴 The name DHA returns is MASKED in the capture field
Both name fields came back with **vowels replaced by underscores** (a 7-character first name plus a second forename,
and a 5-character surname — values not reproduced here). This is a **capture** field whose value is saved as the office
bearer's name, so on the face of it the NPO's records would store a masked name rather than the person's actual one,
and the applicant cannot correct it (the field is locked on this variant).

⚠️ **Deliberately not saved.** The record was **cancelled, not submitted**, because the ID resolved to an apparently
real individual — since confirmed. Nothing was written to the database; the three existing office bearers on the draft
were unaffected.
📌 **Endpoint not captured.** My response filter (`dha|IdVerif|HomeAffairs|Person|Citizen`) matched nothing, so the
lookup runs under an endpoint name I have not identified. Worth capturing next time with an unfiltered listener.

### ✅ Only real IDs resolving is CORRECT — an earlier recommendation here is withdrawn
This report previously called for "a set of DHA *test* identities" and framed the situation as a coverage gap. **That
was wrong, and the test lead corrected it:** DHA is a live Department of Home Affairs verification service, so
validating **real** ID numbers and rejecting invented ones is exactly the intended behaviour. There is nothing to fix
and nothing to request.

**What this means for testing DHA in practice:** an ID that resolves must belong to a real person, so DHA coverage
needs an identity whose owner has **consented** — the tester's own, or a colleague's with permission — on the same
principle as using the tester's own mobile number for SMS delivery checks. The seeded `8001015009087` → Ryno Koen
remains the safe default for routine runs. **Live identities still must not be transcribed into artefacts** (see the
redaction note above); that is a records-hygiene rule, not a comment on the integration.

### Question this still raises for the test lead
**Is the masked name intended, and what actually persists?** The name fields returned with vowels replaced by
underscores, and they are locked on this variant. If the masked string is what gets stored, every DHA-verified office
bearer would carry an unusable name on the register; if the real name is stored server-side and the mask is only a
display-level POPIA measure, that is sound and worth documenting. This was **not** determined — the record was
cancelled before save, so nothing was written to compare.

## Observations
1. The office-bearer grid still has **no `ID Verified` column** — ADO #101655 prescribes one. Live columns: Full Name ·
   Nationality · SAIDNumber · Passport Number · Passport Expiry Date · Date Of Birth · Gender · Has Disability ·
   Type Of Disability · Residential Address · Work Address · Mobile Number · Home Number · Whatsapp Number ·
   Email Address · Position.
2. ✅ **TC-04-023's rule holds** — `Next` stayed disabled at 1 and 2 office bearers and enabled at exactly 3.
   (Recorded as corroboration; the case itself was executed previously.)
3. The passport route works as documented: 13 required fields, names typeable, and both date pickers accept a
   panel-driven year → month → day selection.

## Questions for the test lead (Thabiso)
1. **Is the CIPC integration expected to be available on QA at all?** If it is permanently stubbed out here, TC-04-008
   is not a QA-executable case and should be marked environment-dependent in the plan.
2. **When CIPC is unreachable, what should the applicant see?** Right now: nothing. An NPC applicant is left with an
   empty OB list and no way to tell whether that is CIPC's fault or their own data entry.
