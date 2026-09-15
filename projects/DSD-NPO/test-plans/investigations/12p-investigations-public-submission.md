# Test Plan: NPO-12P — Investigations: Public Submission (smoke)

> **Status:** Imported from Azure DevOps — ✅ **reachable now** (no login required)
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app |
| Environment | QA |
| Login As | **none** — the case is explicitly anonymous |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101872) |
| ADO Suite | 101872 — *12P - Investigations - Public Submission* (1 case) |

## Objective
> Verify that a member of the public can submit a whistleblowing complaint anonymously — without signing in and without being forced to supply contact details.

## Reachability
✅ **This is one of the few smoke suites reachable today.** It needs no registered NPO, no submitted application and no login — it runs against the public portal's *Submit a Query/Complaint* form. Prioritise it while registration is blocked.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO case; state `Design`.

⚠️ **Drift-Risk case — Thabiso's own note:** *"Code: Investigation entity has **NO `IsAnonymous` flag**; anonymous routing inferred from null `ReportedUser`. May not behave as FDS describes."*

That makes the anonymity assertion the whole point of running this. If anonymity is only implied by a null user rather than recorded explicitly, then a signed-in user submitting the form may be silently identified — which for a **whistleblowing** channel is a serious finding, not a cosmetic one.

## Preconditions
- [ ] Public portal reachable
- [ ] **Run signed out**, in a clean browser context — a leftover session would invalidate the entire case
- [ ] A document available to attach

## Test Cases

### TC-01 — Anonymous submission of a whistleblowing case (ADO #101789 · TC-12-001)

*Priority 1 · Positive · Public, unauthenticated.*

- **Type:** Happy path (anonymous)
- **Steps:**
  1. In a **clean, signed-out** browser context, NAVIGATE to the public portal
  2. Open the **Submit a Query/Complaint** form
  3. SNAPSHOT
  4. ASSERT (BLOCKING) an **anonymous toggle** is visible
  5. TICK **anonymous**
  6. SELECT the **case category** and **case type** — RECORD every option offered
  7. Attach the supporting documents
  8. CLICK **Submit**
  9. API — capture the create request **and its body**, plus the response body on any non-2xx
  10. ASSERT a confirmation is shown to the submitter
  11. ASSERT (BLOCKING) the system **does not require contact details** *(FDS Inv 7 rule 1)*
- **Expected result:** *"Anonymous toggle visible"* then *"Case captured; submitter sees confirmation; system does not require contact details (FDS Inv 7 rule 1)"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the anonymous toggle exists on the form
  - [ ] ASSERT the form submits with **no contact details supplied**
  - [ ] ASSERT a confirmation is displayed
  - [ ] ASSERT the case is retrievable in `admin → CRUDS → Investigation`
  - [ ] 🔑 ASSERT the stored case **carries no identifying details** of the submitter
- 🔑 **The last assertion is the one that matters, and it is not in the ADO case.** Given the drift note, check the submitted payload and the admin-side record for any residual identity — IP, session, user id, or an auto-filled contact field. Report what you find either way; a clean result is worth recording, and a leak is a High finding.
- 🔑 **Capture the create POST body.** On this build, `CRM → Create Case` appeared to save and persisted nothing, and a 400 with a validation error was silently discarded by the UI. Verify this submission is **retrievable**, not merely that the form closed.
- **📌** The category/type lists here should be comparable to CRM's — recorded on 2026-08-12 as Category = *Application · Annual Compliance · Appeals · Voluntary Deregistration · Post Registration · Investigation* (+1). Note any divergence.

---

## ❓ Questions for Thabiso

1. **Is the anonymity explicit or inferred?** Per the drift note there is no `IsAnonymous` flag. If a signed-in user ticks *anonymous*, is their identity stored anyway?
2. **How does an anonymous complainant get an outcome?** With no contact details, there is no channel back — is a reference number issued so they can follow up?
3. **What throttles abuse** of an unauthenticated, attachment-accepting endpoint?

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101789 | TC-12-001 | ✅ **yes — run this one** |

**Not in this plan** (Functional suite 101898, 4 cases, to import later): TC-12-002, 003, 005, 007.
