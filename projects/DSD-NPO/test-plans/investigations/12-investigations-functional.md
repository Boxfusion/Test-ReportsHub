# Test Plan: NPO-12-F — Investigations: Public submission + Admin processing (functional)

> **Status:** Imported from Azure DevOps 2026-08-18 — 10 cases across two ADO suites. Public submission runs on the
> public portal's "Submit a Query/Complaint" flow (Category = **Investigation**); admin processing runs on the admin
> portal CRUDS → Investigation. **UI-only scope** — TC-12-011 (temp-Person DB cleanup) is out of scope, listed for dev.
> **Owner:** QA
> **Last Updated:** 2026-08-18
> **Estimated Duration:** 1500s

## Metadata
| Field | Value |
|-------|-------|
| App URL | Public: https://dsd-npo-publicportal-1-qa.shesha.app · Admin: https://dsd-npo-adminportal-qa.shesha.app |
| Environment | QA |
| Login As | Public: none / shared acct · Admin: mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Suites | 101898 *12P Public* (TC-12-002/003, TC-12P-003/004) · 101897 *12A Admin* (TC-12-005/007/008/009/010/011) |

## Objective
> Verify the whistleblowing / investigation journey: public submission (anonymous + non-anonymous, NPO scoping,
> evidence-file allowlist + size), and admin processing (validate 'Not Valid', forward outside-mandate, close with
> forensic outcome, and the Reviewer-Feedback status gating + persistence).

## 🔑 Shared context / dependencies
- Public submission uses the **same `public-case-create` ("Submit A Query") form** as enquiries, with an **anonymous
  toggle** and **Category = Investigation**. ⚠️ **On 2026-08-18 that form's Submit is broken** for Education&Awareness
  (`bugs/2026-08-18-public-enquiry-submit-broken-npoorganisation-null.md` — `NpoOrganisation/Crud/Get?Id=null` 400, no
  case POST). **Re-test for Category=Investigation** — if it reproduces, the whistleblowing channel is down (High).
- Admin cases need **an open investigation case** — create one via the public submission first (reuse our own).
- 🔑 **Whistleblower anonymity** (smoke drift note): Investigation entity has **no `IsAnonymous` flag**; anonymity is
  inferred from a null ReportedUser. Capture whether a signed-in anonymous submission stores identity anyway.

## No overlap with the smoke plan
Smoke `12p-...`/`12a-...` own **TC-12-001** (anonymous submit) and **TC-12-004/006** (admin). This functional plan owns
the other 10 — nothing shared.

## Test Cases — 12P Public (ADO suite 101898)

### TC-01 — Non-anonymous submission requires contact details (ADO #101790 · TC-12-002)
*P2 · Src:Both · Public.* ✅ Runnable.
- **Steps:** 1. Do NOT tick anonymous → contact fields shown+required · 2. Submit empty → validation errors · 3. Fill
  contacts + submit → case captured; notification on progress.
- **Assertions:** [ ] contact fields shown & required when not anonymous · [ ] validation blocks empty submit ·
  [ ] (BLOCKING) case is captured & retrievable in admin.

### TC-02 — Authorised user sees only active/registered NPOs enabled (ADO #101791 · TC-12-003)
*P3 · Edge · Src:FDS · Public.* ⚠️ Runnable (needs linked NPOs in different statuses).
- **Steps:** 1. Open Submit a Query view → NPO picker.
- **Expected:** *"Active/Registered NPOs are clickable; Deregistered/Dissolved NPOs are disabled (FDS Inv 7 rule 2)"*
- **Assertions:** [ ] registered NPO (333-019) enabled · [ ] RECORD whether any deregistered/dissolved NPO is disabled.

### TC-03 — Anonymous whistleblower submits without an account (ADO #107422 · TC-12P-003)
*P2 · Src:FDS · Public · L1-draft.* ✅ Runnable (no login).
- **Steps:** 1. Signed-out, open the investigation report form → accessible without sign-in · 2. Fill Subject +
  Description + optional evidence → Submit → confirmation reference · 3. Access the case via reference → read-only
  status page (Submitted / Under Investigation / Closed).
- **Assertions:** [ ] form reachable signed-out · [ ] (BLOCKING) submission accepted with a confirmation reference ·
  [ ] status retrievable by reference · [ ] 🔑 stored case carries **no** submitter identity.

### TC-04 — Evidence-file allowlist + oversize rejection (ADO #107423 · TC-12P-004)
*P2 · Src:FDS · Public · L1-draft.* ✅ Runnable.
- **Steps:** 1. Upload allowed type (PDF/JPG/PNG) → accepted · 2. Disallowed (.exe/.js) → rejected · 3. File > 25 MB →
  rejected with a clear size message.
- **Assertions:** [ ] allowed accepted · [ ] (BLOCKING) disallowed rejected · [ ] oversize rejected with a visible
  message.
- **📌** Ties to the known CORS-masked oversize bug (`bugs/2026-08-18-oversize-upload-rejection-is-invisible-cors-masked.md`)
  — read the console, not just the DOM.

## Test Cases — 12A Admin (ADO suite 101897)

### TC-05 — Validate 'Not Valid' closes case + notifies (ADO #101793 · TC-12-005)
*P1 · Negative · Src:FDS · Admin.* ⚠️ Needs an open case (from TC-01/03).
- **Steps:** 1. Open a case → Validate → 'Not Valid' → submit.
- **Expected:** *"Case closed; notification sent only if contact details exist (FDS Inv 8.2)"*
- **Assertions:** [ ] (BLOCKING) case moves to Closed · [ ] RECORD the notification (NotificationMessage) when contacts exist.

### TC-06 — Valid case outside mandate → forward to third party (ADO #101795 · TC-12-007)
*P2 · Edge · Src:Both · Admin · Drift-Risk.* ⚠️ Needs a validated case.
- **Steps:** 1. Choose 'Outside Mandate' → forward to third party.
- **Expected:** *"Third-party email/integration triggered; submitter notified if contacts provided"*
- **Assertions:** [ ] forward action recorded · [ ] RECORD third-party notification.
- **⚠️** Code drift: third-party routing uses a temp-Person create+delete hack (`InvNotificationSender.cs:104-156`).

### TC-07 — Close Investigation captures forensic outcome + attachment + notifies (ADO #101796 · TC-12-008)
*P1 · Positive · Src:Both · Admin.* ⚠️ Needs an open investigation.
- **Steps:** 1. Close Investigation → capture forensic outcome → attach proof → submit.
- **Assertions:** [ ] (BLOCKING) case closed · [ ] outcome + attachment captured · [ ] RECORD submitter notification.

### TC-08 — Reviewer Feedback button gated by status (ADO #101797 · TC-12-009)
*P2 · Edge · Src:FDS · Admin · Drift-Risk.* ✅ Runnable (read-only observation).
- **Steps:** 1. Open an 'Initiated' case → Feedback hidden/disabled · 2. Open a Closed / Under Investigation / Referred
  case → Feedback visible.
- **Assertions:** [ ] RECORD button state per status · [ ] gating matches FDS Inv 8.5 rule 1.

### TC-09 — Reviewer feedback persists + displays (ADO #101798 · TC-12-010)
*P2 · Positive · Src:FDS · Admin.* ⚠️ Needs an eligible (Closed/Referred/Under Investigation) case.
- **Steps:** 1. Click Reviewer Feedback → capture → submit.
- **Expected:** *"Feedback shown on case details with reviewer name and date (FDS Inv 8.5 rule 5)"*
- **Assertions:** [ ] (BLOCKING) feedback persists · [ ] shows reviewer name + date.

### TC-10 — Third-party routing temp-Person create/delete (ADO #101799 · TC-12-011)
*P2 · Src:Code · Admin · Drift-Risk.* ⛔ **OUT OF UI SCOPE — DB verification.**
- **⛔** Requires DB inspection for an orphaned Person after send. Listed for dev (verify cleanup even on send failure).

## Coverage against ADO
| Plan case | ADO | TC id | P | Portal | Runnable? |
|---|---|---|---|---|---|
| TC-01 | #101790 | TC-12-002 | 2 | Public | ✅ yes |
| TC-02 | #101791 | TC-12-003 | 3 | Public | ⚠️ needs multi-status NPOs |
| TC-03 | #107422 | TC-12P-003 | 2 | Public | ✅ yes (no login) |
| TC-04 | #107423 | TC-12P-004 | 2 | Public | ✅ yes |
| TC-05 | #101793 | TC-12-005 | 1 | Admin | ⚠️ needs open case |
| TC-06 | #101795 | TC-12-007 | 2 | Admin | ⚠️ needs validated case |
| TC-07 | #101796 | TC-12-008 | 1 | Admin | ⚠️ needs open investigation |
| TC-08 | #101797 | TC-12-009 | 2 | Admin | ✅ yes (observation) |
| TC-09 | #101798 | TC-12-010 | 2 | Admin | ⚠️ needs eligible case |
| TC-10 | #101799 | TC-12-011 | 2 | Admin | ⛔ not UI (DB) |

**10 cases owned.** Smoke counterparts: TC-12-001/004/006.

## Suggested run order
1. **TC-03** (anonymous public submit — creates a case, no login) → **TC-01** (non-anonymous validation) → **TC-04**
   (file allowlist/size).
2. Switch to admin → **TC-08** (feedback gating, read-only), then on our submitted case: **TC-05** (Not Valid /
   close) or **TC-07** (close with outcome), **TC-06** (outside mandate), **TC-09** (feedback persists).
3. **TC-02** (NPO scoping) as available; **TC-10** deferred (DB).

## ADO anchors (machine-read — do not delete)
- ADO #101790 · TC-12-002
- ADO #101791 · TC-12-003
- ADO #107422 · TC-12P-003
- ADO #107423 · TC-12P-004
- ADO #101793 · TC-12-005
- ADO #101795 · TC-12-007
- ADO #101796 · TC-12-008
- ADO #101797 · TC-12-009
- ADO #101798 · TC-12-010
- ADO #101799 · TC-12-011

---

## ✅ Executed 2026-08-18 — public intake broken (2 fail); admin lifecycle blocked; 1 positive observation
Report: `test-reports/2026-08-18/12-investigations-functional--public-intake-and-admin.md`
Bug: `bugs/2026-08-18-public-enquiry-submit-broken-npoorganisation-null.md` (broadened to Investigation)

| Case | Verdict | Note |
|---|---|---|
| TC-01 (TC-12-002) | 🔴 FAIL | non-anon submit = silent no-op; `NpoOrganisation Get?id=undefined` 400, no case POST |
| TC-03 (TC-12P-003) | 🔴 FAIL | anon signed-out submit = silent no-op, no reference. **Anonymity IS permitted** (Submit enabled w/o contacts) |
| TC-02 (TC-12-003) | ⏸ PARTIAL | NPO-number search present; dereg-disabled needs known data |
| TC-04 (TC-12P-004) | ⛔ BLOCKED | **no evidence-upload control** on the public form at all |
| TC-05 (TC-12-005) | ⛔ BLOCKED | needs an open case we own — intake broken |
| TC-06 (TC-12-007) | ⛔ BLOCKED | needs a validated case |
| TC-07 (TC-12-008) | ⛔ BLOCKED | needs an open investigation |
| TC-08 (TC-12-009) | ⏸ PARTIAL | actions not on CRUD entity view; needs case-processing view + eligible statuses |
| TC-09 (TC-12-010) | ⛔ BLOCKED | needs eligible case + processing view |
| TC-10 (TC-12-011) | ⛔ OUT OF UI SCOPE | temp-Person DB cleanup (dev) |

🔑 **Public intake REGRESSION:** anonymous submissions succeeded 2026-08-13 (INV1283 in admin list) but create nothing
today — same `public-case-create` bug across E&A + Investigation, logged-in + anonymous. Blocks the whole 12 lifecycle.
✅ **Positive:** admin Investigation list now has an explicit **Is Anonymous** column + Reported User = Anonymous
(supersedes the old "no IsAnonymous flag" drift note).
