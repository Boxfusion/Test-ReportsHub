# Report: NPO-13-F — Voluntary Deregistration (admin processing)

**Date:** 2026-08-20 07:29 UTC
**Plan:** test-plans/deregistration/13-voluntary-deregistration-functional.md
**Execution Mode:** ai-driven (Playwright MCP + API, live QA admin + public portals)
**Result:** FAILED — detail view (TC-04) passes; the insufficient-documents validation (TC-05) is broken by a missing workflow definition, which blocks TC-06 and TC-07
**Duration:** ~1500s
**Cases:** TC-13-009 (TC-04), TC-13-011 (TC-05), TC-13-012 (TC-06), TC-13-013 (TC-07)
**Environment:** QA · admin portal (`allDeregistrationApplications-details`) · public portal (deregistration wizard on 333-019)

## Summary
| Case | Area | Verdict |
|---|---|---|
| TC-04 (TC-13-009) | Admin detail view: captured info, docs, status, risk, assets | ✅ PASS (note) |
| TC-05 (TC-13-011) | Insufficient docs → notice + 30-day clock | 🔴 FAIL (blocker) — `UserTaskSave` 400, no outcome recorded |
| TC-06 (TC-13-012) | No resubmission in 30 days → denied | ⛔ BLOCKED — 30-day clock **and** blocked by TC-05 |
| TC-07 (TC-13-013) | Resubmitted still insufficient → denied + investigation | ⛔ BLOCKED — chains off TC-05 |

Bug filed: `bugs/2026-08-20-deregistration-validate-documents-workflow-definition-missing.md` (**High** — the deregistration admin lifecycle cannot proceed past submission).

## Precondition work (per your go-ahead to use 333-019)
No submitted deregistration existed to process (the 08-18 draft `7a7419b7` was Initiated-only, Validate Documents disabled). So the draft was resumed via the workflow-action URL and **completed + submitted** on our own NPO **333-019**:
- Resumed at `/shesha/workflow-action?id=7a7419b7…&todoid=7098917b…` → 3-step wizard (Guideline → Details → Declaration & Documents).
- Details: severance **Voluntary Deregistration**, reason (short synthetic text), effective date **27/08/2026** (via the AntD panel, never `fill()`), Office Bearer **Ryno Koen** (picker correctly scoped to 333-019's 3 OBs).
- Declaration: Name/Surname (typed) + Capacity **Chairperson** (combobox — the field that gated Submit until set). Three required docs uploaded (synthetic PDFs): Official letter, Minutes, Section 23 — the wizard's upload control is **enabled** (unlike the 15B library upload).
- Submit succeeded → status advanced **Initiated → In Progress (2)**; NPO stayed **REGISTERED**.
- ✅ **Submission acknowledgment delivered.** At 07:24:08 the submit fired a **"Voluntary Deregistration
  AcknowledgementLetter"** on both channels: **Email → 2 recipients, status 1 (Sent)** — the user **confirmed live
  receipt** of the email — and **SMS → 2 numbers, status 8 (Failed: Vodacom no credit)**. So the email pipeline works
  end-to-end for deregistration; only SMS is blocked by the known credit issue ([[dsd-npo-notification-audit-via-api]]).
  This also cleanly isolates the TC-05 defect below: the *submission* raises and delivers a notice, whereas the
  *Validate-Documents Decline* raised **none** — because it 400'd, not because the notification layer is broken.

## ✅ TC-04 (TC-13-009) — Admin detail view
The `allDeregistrationApplications-details` view exposes everything the case requires: **V.Deregistration Status, NPO Status, Risk Status**, Deregistration Details (org name, NPO number, date of registration, type of severance, reason, effective date), an Office Bearer block, **Documents** (attached files listed with sizes), and a **Comment** section. Verified on two records — a well-populated seed record (`a34c9e13`, In Progress) and our own submission. PASS.
- Note (observation): on some records several captured fields render **blank** (severance type, reason, OB details), while the Documents and status render fine — worth asking Thabiso whether that is missing data or a binding gap on the detail form.

## 🔴 TC-05 (TC-13-011) — Insufficient-documents validation is broken
Opened **Validate Documents** on our In-Progress submission, selected **"Are all documents received: No"**, captured a comment, and clicked **Decline** (the insufficient path; Approve is correctly gated when docs are marked not-received).
- **The submission fails: `POST /api/services/SheshaWorkflow/Process/UserTaskSave` → 400.** The status stays **In Progress**, **no `Case`/notice is written**, and `NotificationMessage` shows no new row — so the "notice sent + 30-day window starts" the case requires never happens.
- **Root cause (pinned at the API):** the modal first calls
  `GET …/WorkflowDefinition/GetUserDecisions?...&name=voluntary-deregistration-definition&userTaskUid=Activity_1ga0s1z`
  which returns **404 `workflow-definition 'boxfusion.dsdnpo\voluntary-deregistration-definition' not found`**. With the
  user-task decisions unresolvable, the decision save 400s.
- **Reproduced twice** — once with a JS-set radio and once with a genuine real click — identical 400 each time. Not intermittent, not an automation artefact.
- Evidence: `evidence/13a-validate-documents-400.png`; bug file above.
- ⚠️ The **Approve** (sufficient) path was **not** tested — approving would carry 333-019 toward actual deregistration, which we are protecting. So the defect is confirmed for the Decline path; whether Approve shares the same 404 is unverified by design.

## ⛔ TC-06 (TC-13-012) & TC-07 (TC-13-013)
Both remain unreachable: TC-06 needs the 30-day clock (no system-clock control on QA) **and** a successful insufficient outcome to start it; TC-07 needs a resubmission cycle off that outcome. Both are blocked by the TC-05 workflow-definition failure on top of their existing dependencies.

## State left behind
333-019 now carries an **In-Progress deregistration that cannot be validated** (stuck on the workflow-definition 404). The NPO itself remains **REGISTERED** (not deregistered). The stuck state is itself evidence of the defect; it cannot be cleanly reverted from the UI because the same workflow action is broken. Flag for Thabiso if 333-019 needs resetting.

## Method notes
- OB / severance / capacity selects driven with **real clicks** ([[shesha-forms-use-real-clicks]]); date via the panel ([[antd-date-fields-never-set-programmatically]]); free text kept short ([[keep-automated-free-text-short]]).
- The 400 was read at the network layer and its cause confirmed by calling `GetUserDecisions` directly ([[read-console-before-calling-failure-silent]], [[verify-before-claiming-app-bug]]).
- ⚠️ A seed **Incomplete** record inspected during TC-04 carried a **real personal identifier** (name + SA ID + contact) — described, never transcribed ([[never-record-real-personal-identifiers]]). It also showed **NPO Status = DEREGISTERED while V.Deregistration Status = Incomplete**, which contradicts the FDS (insufficient→denied should keep it registered) — raised as a **question for Thabiso**, not a confirmed defect, given it is seed data of unknown provenance.
