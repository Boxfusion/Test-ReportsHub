# Report: NPO-12-F — Investigations — both case-creation routes are down; the three target cases could not be run

**Date:** 2026-08-31 07:50 UTC
**Plan:** test-plans/investigations/12-investigations-functional.md
**Execution Mode:** ai-mcp
**Result:** BLOCKED — the three cases targeted this session could not be verdicted. Both routes that create an investigation case are broken: the public whistleblowing channel cannot start its workflow (missing workflow definition, a **regression** since 2026-08-28), and the admin **Create Case** action is **silently inert** for the Investigation category (no `CaseRouting` configured). The third case additionally needs an identity we cannot obtain, because **Assign Case is disabled** on the only live task. Two new defects confirmed, one with a clean control test; the recorded blocker reasons for all three cases are replaced with proven ones.
**Duration:** ~1150s
**Cases:** NO DATA — nothing verdicted this run
**Environment:** QA · public portal (intake) + admin portal (processing) · view mode Live
**Accounts used:** shared dev account only
**Coverage impact:** none — functional coverage stays **222 / 314 (70.7%)**, re-derived with `scripts/coverage-baseline.js`

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 3 attempted | 0 | 0 | 0 | 3 |

The session set out to close the three cases left route-known but undriven on 2026-08-28. None were closable. What
changed is the *reason*: each old blocker description is now replaced by a tested one, and two new defects were found.

---

## 🔴 Defect 1 — the public whistleblowing channel cannot be used at all (REGRESSION)

**Filed:** `bugs/2026-08-31-whistleblowing-intake-cannot-start-its-workflow.md`

The landing-page **Whistleblowing** button fires `workflows:Start Workflow`, which issues:

```
POST /api/services/SheshaWorkflow/Process/StartByName
→ 404
{"error":{"code":404,
  "message":"workflow-definition `boxfusion.dsdnpo\\investigaton-definition` not found"}}
```

- **The endpoint is alive** — it answers with a structured "not found" for the *definition*, not a route 404.
- **The definition name is wrong.** All **169** existing investigations carry workflow definition
  **`investigation-process`**. The button asks for **`investigaton-definition`** — a name no record has ever used,
  and misspelt (`investigaton`).
- **Reproduced identically on retry**, and from both landing routes (`/` and `/no-auth/…/landing-page`) — not
  intermittent.
- **This is a regression.** INV1696 and INV1698 were both filed end-to-end through this exact route on 2026-08-28.

**Opening the form directly does not rescue it.** `/no-auth/boxfusion.dsdnpo/create-investigation-workflow` renders,
but **5 required fields have no input control at all** — First Name, Last Name, Email Address, Mobile Number and
**Npo Number** appear as labels with a required `*` and nothing to type into. **Remain Anonymous** is disabled and
**Submit** is disabled. Only Case Type, Description and NPO Address have working controls (4 inputs on the page in
total). Consistent with the landing-page console error
`TypeError: Cannot read properties of undefined (reading 'setFieldValue')` — the form appears to depend on a workflow
instance that the broken Start Workflow never creates.

⚠️ **Correction recorded deliberately:** mid-session I read the rendered labels and concluded "the form is fine, only
the button is broken." That was wrong — checking for *controls* rather than labels showed the required inputs are
absent. The channel is unusable end to end, not merely missing an entry point.

---

## 🔴 Defect 2 — admin Create Case is silently inert for Category = Investigation (CONFIRMED by control)

**Filed:** `bugs/2026-08-31-create-case-silently-inert-for-investigation-category.md`

CRM → **Cases** → **Create Case** (`boxfusion.dsdnpo/case-create-two v4`) was filled completely and validly against
our own NPO **333-018** with fully synthetic submitter details. On **Ok**:

- The click **lands** (verified with an attached capturing listener: `clicks: 1`).
- It issues **exactly one GET** — `CaseRouting/Crud/GetAll?filter=caseCategory==6` — and then **nothing**.
  Verified by patching `window.fetch` and `XMLHttpRequest.prototype.open`, not by reading a filtered log.
- **No POST. No validation error** (`ant-form-item-has-error` count 0), **no toast, no console error**, Ok stays
  **enabled**, the modal stays open. Clicked three times, including after committing the submitter sub-form with its
  ✓ control.

**Root cause, with a control test.** `CaseRouting` rows per case category:

| Category | Routing rows |
|---|---|
| Application | 6 |
| Annual Compliance | 3 |
| Appeals | 2 |
| Voluntary Deregistration | 1 |
| Post Registration | 2 |
| **Investigation** | **0** |
| Education and Awareness | 1 |

Investigation is **the only category of the seven with no routing configured**. To prove causation rather than
correlation, the *same form with the same data* was resubmitted with only **Category** changed to **Post
Registration** — it created immediately: case count **119 → 120**, new record at `2026-08-31T07:45:01`. So the
form works; it fails **only** on the category with no routing, and it fails **silently**.

---

## ⛔ Blocker 3 — the Investigation Outcome step is identity-gated and cannot be re-routed

TC-12-008 and TC-12-010 need the assigned **investigator** / **reviewer** identity. The plan was to assign those
roles to accounts we create (per `test-data/qa-accounts.md`), avoiding any impersonation of the real users currently
assigned. That is not possible:

- INV1698 (ours) has an open **Investigation Outcome** task, workflow instance `ff4e5f5e-…`, with **9 todo items**.
- Opened via the correct surface (`/shesha/workflow-action?id=<instance>&todoid=<todo>`) on **2 different todo ids**:
  the page renders, but **`Assign Case` is disabled** and **`Save` is disabled**. The **Case Outcome** tab exposes
  only a **read-only `Investigator` label** — no forensic-outcome field, no attachment control, no Close action.
- So the shared admin can neither complete the step nor reassign the case to an account we control.

**No impersonation was attempted.** Signing in as the assigned investigator would have closed the case, and is out
of bounds.

### 🔑 New supporting finding — Reviewer Feedback has no surface for the statuses its cases require

Open workflow todos, by case (all four are our own records on 333-018):

| Case | Investigation status | Open todos | Action available |
|---|---|---|---|
| INV1694 | Draft / initiated | **0** | — |
| INV1698 | Under Investigation | 9 | Investigation Outcome |
| INV1283 | reviewer already assigned | **0** | — |
| INV1696 | Investigation Complete (closed) | **0** | — |

**Only *Under Investigation* has a workflow-task surface.** Closed and reviewer-assigned cases have **zero** open
todos, so the only remaining surface for them is the read-only `investigation-details` view — which carries no
Feedback control. The Reviewer Feedback action that TC-12-009 and TC-12-010 describe is therefore **unreachable for
exactly the Closed / Referred statuses those cases specify**. This replaces TC-12-009's recorded reason
("actions not on the CRUD view; needs the case-processing view") — the case-processing view was found on 08-28, so
that reason is stale; the real obstacle is that closed cases have no task at all.

---

## 📌 Observations (not verdict-bearing)

- **A single workflow step holds 9 duplicate todo items.** INV1698's Investigation Outcome step has 9 todos, all
  stamped `2026-08-28T09:01`, all with identical action text. Whether that is intended fan-out or duplication is a
  question for the test lead.
- **`case-create-two` throws once per keystroke.** Typing into the submitter fields produced 25+
  `executeScriptSync error TypeError: Cannot read properties of null (reading 'id')` console exceptions, one per
  character, on every text field. The form still functions; the noise makes real errors hard to spot.
- **The case-processing view renders submitter contact details in full** (name, email address, mobile) for a
  non-anonymous case. Expected for a named submitter, but noted because the same view is the one an investigator
  uses. **Those values were deliberately not transcribed into this report or any other artefact.**
- **"Remain Anonymous" is disabled** on the intake form as it currently renders, so the anonymous path cannot be
  chosen at all even if the inputs were present.

## Records created
- **One synthetic case** on our own NPO 333-018, category **Post Registration** / type *Post Registration Status*,
  created `2026-08-31T07:45:01` — created **as the control test** for Defect 2 and left in place as its evidence.
  Description marks it a QA synthetic. No investigation case was created (neither route allows it).
- No existing record was modified. No workflow decision was taken. No third party was contacted.

## Method notes
- Both creation routes were exercised through the **UI**; the API was used only for **reads** (entity state, routing
  configuration, todo enumeration) and for **instrumenting** the page's own fetch/XHR to answer "was a request
  issued at all".
- The `CaseRouting` comparison across all seven categories is a read, and the causal claim rests on the **UI control
  test** (same form, one field changed), not on the read alone.
- Guessed API routes were abandoned early in favour of the endpoints the pages themselves call.

## ❓ Questions for Thabiso
1. **Whistleblowing is down in QA** — the landing button references workflow definition `investigaton-definition`
   while every record uses `investigation-process`. Was the button or the definition renamed on/after 2026-08-29?
2. **Is `CaseRouting` for the Investigation category missing configuration, or is admin-created investigation
   intentionally unsupported?** If unsupported, Create Case should say so rather than doing nothing.
3. **How is QA meant to obtain an investigator / reviewer identity?** With `Assign Case` disabled on the live task,
   TC-12-008 and TC-12-010 are unrunnable without either a seeded case assigned to our own accounts, or the ability
   to reassign.
4. **Should Reviewer Feedback be reachable for Closed / Referred cases?** Those statuses currently have no workflow
   task, so the action described by TC-12-009 / TC-12-010 has no home.
5. Is the 9-todos-per-step fan-out on a single Investigation Outcome step intended?
