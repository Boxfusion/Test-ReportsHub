# Report: eLeave — Apply for Someone Else (Annual Leave) End-to-End Happy Path

**Date:** 2026-06-11 11:52 UTC
**Plan:** test-plans/eLeave/capture-new-leave-application.md (+ Recommend/Approve chain — "Someone Else" variant)
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live
**Result:** PASSED
**Duration:** ~9 min (11:44–11:52 UTC)
**Ref No:** LA2026/12918
**ADO Plan:** eLeave Smoke test (#101528) — suites: Application for leave (#101941), Recommend Leave (#101970), Approve leave (#101991)

## Scenario
Test the **"Someone Else"** capture path: log in as **Thabo Musa Victor Mthembu (GOV003)** and apply for a **1-day Annual Leave** on **Thu 18 June 2026** on behalf of **Priya Maharaj** (PERSAL 12345678), then carry it through the full approval chain. 18 June is future-dated → no backdated dialogs.

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

## Step Results

### TC-01: Apply on behalf of Priya (Thabo Mthembu, GOV003 — initiator)
**ADO suite:** Application for leave (#101941) · **Mode:** mcp-live
- [PASS] Login as GOV003 (view mode → Latest); My Items → Create New → SaGov Leave Application (Ref No **LA2026/12918**)
- [PASS] "Who are you requesting the leave for?" = **Someone else** → new fields appeared: **Leave Profile**, **Type Of Verification**
- [PASS] Leave Profile = **Priya Maharaj** (typeahead "Priya"); **PERSAL auto-filled to 12345678**; routing preview updated to **Recommender Kavitha Naidoo (Testers) → Approver Naledi Khumalo**
- [PASS] Type Of Verification = **Consent Form** → required **Consent Form** upload appeared → uploaded `supporting-doc.txt` (122 B). (OTP option not used — would require receiving Priya's code.)
- [PASS] Category = Annual Leave → Sub-Category = Annual Leave → Duration = **Days**
- [PASS] Start 18/06/2026, End 18/06/2026 → "Great! You have selected to take 1 day off"; Priya's balance = 15 days (current cycle)
- [PASS] Address captured; certification checkbox ticked (gated Submit) → Submit → **Delegate** modal → Don't Delegate → status **In Progress**, recorded as **"Leave by P Maharaj"**

### TC-02: Recommend (Kavitha Naidoo, GOV012 — Infra Manager)
**ADO suite:** Recommend Leave (#101970) · **Mode:** mcp-live
- [PASS] Routed straight to the recommender (Priya's reporting line, not Thabo's); login GOV012 (view mode → Latest); Inbox → LA2026/12918 (Initiator: Thabo; Applicant Name: **Priya Maharaj**)
- [PASS] Recommend form shows **Type Of Verification** + **Consent Form** (downloadable). Downloaded the Consent Form attachment + ticked "I acknowledge…" → **Recommend** enabled
- [PASS] **Recommend** → item left Kavitha's inbox (no backdated dialog — future date)

### TC-03: Approve with Full Pay (Naledi weeeee Khumalo, GOV022 — HOD Infrastructure)
**ADO suite:** Approve leave (#101991) · **Mode:** mcp-live
- [PASS] Login GOV022 (view mode → Latest); Inbox → LA2026/12918 (Approve Leave; Applicant Name: Priya Maharaj)
- [PASS] Offered Not Approve / Approve without Pay / Approve with Full Pay; gated until attachment downloaded + acknowledge ticked
- [PASS] **Approve with Full Pay** → item left Naledi's inbox
- ℹ️ **Generate PERSAL Input (system step — NOT a verified test case):** on approval the system auto-created the PERSAL transaction (`Create Transaction | 50/ 500 | 18/06/2026 → 18/06/2026`) and moved the item to status **Generate PERSALinput**. Reported as information only.

## Notes
- **"Someone Else" reveals three extra capture fields** vs the Myself path: **Leave Profile** (typeahead person picker — drives PERSAL + routing), **Type Of Verification** (Otp / Consent Form), and — when Consent Form is chosen — a required **Consent Form** upload. PERSAL No auto-populates from the selected Leave Profile (Priya = 12345678).
- **Routing follows the leave-profile person's (Priya's) reporting line**, not the initiator's: Recommender **Kavitha Naidoo** (org unit shows "Testers" for Priya) → Approver **Naledi Khumalo**. Thabo is only the initiator.
- The application is recorded throughout as **"Leave by P Maharaj"** and the Recommend/Approve screens show **Applicant Name = Priya Maharaj** (not Thabo).
- The item lives in **Thabo's** My Items (initiator) but routes through Priya's approval chain. It routes **straight to the recommender** — no applicant Verify-Attachments step.
- **Type Of Verification = OTP** was deliberately avoided (would require receiving an OTP on Priya's behalf); **Consent Form** is the practical test path — upload satisfies the requirement.
- Annual Leave PERSAL code **50/500** (same as a normal Annual Leave). Standard certification checkbox + Days/Hours Duration radio present (used Days to avoid the [Hours Submit-hidden bug](../bugs/2026-06-10-eleave-hours-submit-button-hidden.md)).
- No defects observed. Browser closed after the run.
