# Report: NPO-12-F — Investigations — intake rebuilt and TC-12-005 CLOSED; the whole lifecycle is now reachable

**Date:** 2026-08-28 08:35 UTC
**Plan:** test-plans/investigations/12-investigations-functional.md
**Execution Mode:** ai-mcp
**Result:** PARTIAL — the 08-18 "public intake is broken / creates no case" finding is **fully superseded**: a synthetic whistleblowing case (**INV1696/28/08/2026**) was filed end-to-end against **our own** registered NPO (333-018), validated admin-side, and driven to a terminal state. **TC-12-005 PASSES** (Validate → Not Valid → case closed, decision persisted). The admin case-processing view that blocked the whole 12A cluster on 08-18 is now located — it is a **workflow task reached from the admin Workflows inbox** (`workflow-action?id=&todoid=`), not the read-only `investigation-details` entity view. TC-12-007/008/010 remain open but are now **route-known** (each needs a case driven down a different validation branch).
**Duration:** ~1400s
**Cases:** TC-12-005 (#101793) verdicted PASS · TC-12-007/008/010 route established, not yet driven
**Environment:** QA · public portal (filing) + admin portal (processing) · view mode Latest
**Accounts used:** shared dev account · subject NPO **333-018 (ours)**

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 1 verdicted | 1 | 0 | 0 | 0 |

Coverage: **218 → 219**. The larger result is that the 08-18 cascade blocker ("intake broken → whole 12A lifecycle
untestable") is retired.

---

### ✅ The public intake has been REBUILT (supersedes the 08-18 regression finding)

08-18 recorded the whistleblowing intake as a **silent no-op** that created no case. That build is gone. The public
landing now carries a dedicated **Whistleblowing** entry → `create-investigation-workflow` v14, and filing works
end to end:

- Filled anonymously (Case Type **Other**, a description **explicitly marked "QA SYNTHETIC TEST … not a real
  complaint"**), NPO Number = **our own 333-018** (found by searching the *number*, not the name — the earlier
  "picker returns 0" was a search-by-name mistake).
- **Submit succeeded** → `dsd-investigation-success-message`, **INV1696/28/08/2026** persisted with
  `status = Submitted For Validation`.

🔑 **Why 333-018 (ours) and not a third party:** the intake `Npo Number` picker resolves only registered NPOs, but
searching our own number returns our own NPO — so the entire investigation lifecycle is testable against a record we
own, with **no real organisation named in a misconduct case**. The "must file against a real org" blocker from the
08-28 re-sweep is dissolved.

---

### ✅ TC-12-005 — Validate 'Not Valid' closes the case (#101793) — PASSED

- **The case-processing view was the 08-18 blocker, and it is now located.** The Validate/Close/Assign actions are
  **not** on the `investigation-details` entity view (that shows only *Save*, read-only). They live on the
  **workflow task**, reached from the **admin Workflows inbox** → the case's row exposes
  `/shesha/workflow-action?id=<caseId>&todoid=<todoId>`. Opening it renders **Validate Case / Assign Case** actions.
- **[PASS] (BLOCKING) the case moves to a closed/terminal state.** *Validate Case* → the `validate-case` v13 dialog
  offers **Invalid / Valid** with a *Case Not Valid Comments* field. Chose **Invalid** with a comment. The case
  transitioned **`status 2 → 3`, `investigationStatus 2 → 6`**, and the detail banner now reads **"INVESTICATION
  COMPLETE"** (product typo preserved). It left the actionable inbox. Verified from the persisted entity, not just
  the toast.
- **[PASS/record] the decision persisted.** `caseValidComments` holds the exact text I entered — so unlike the
  annual-compliance Quality Assure 403 (suite 09), this workflow decision **does** persist. The Investigation
  validation user-task is **not** subject to the `UserTaskSave` 403 that blocks suite 09.
- **[RECORD] notification sub-assertion satisfied vacuously.** The case was filed anonymously (no contact details),
  and FDS Inv 8.2 says a notification is sent *"only if contact details exist"* — so no notification is expected,
  and none is the correct outcome.

📌 **Label observations (not defects blocking the verdict):** a **Not Valid** outcome routes the case to
**"Investigation Complete"** rather than a distinct "Closed – Not Valid" state — arguably a semantic mismatch (a
case rejected at validation never had an investigation), worth a question to Thabiso. And the banner is misspelt
**"INVESTICATION COMPLETE."**

---

### ▶ TC-12-007 / TC-12-008 / TC-12-010 — full lifecycle chain now MAPPED (second case INV1698 driven partway)

A second synthetic case, **INV1698/28/08/2026** (also against our own 333-018), was filed and driven through
*Validate → **Valid*** to map the rest of the chain. The `validate-case` v13 dialog, once **Is Valid For
Investigation?** is checked, reveals **Is Case Within Mandate?**, **Third Party Email**, and **Out of Mandate
Comments**. The full admin lifecycle is:

**Validate (Valid) → Assign Investigator & Reviewer → (Investigation) → Close Investigation**, each a separate
workflow task reached from the inbox.

- **TC-12-007** (outside mandate → forward third party): set *Valid* + *Within Mandate = unchecked* + Third Party
  Email + Out of Mandate Comments. ⚠️ **The `Valid` submit button did NOT enable on the outside-mandate path** even
  with a clean third-party email and comments filled, whereas it enabled immediately when *Within Mandate* was
  checked. This is a **candidate instance of the standing "silently disabled forward button" defect** — but it is
  entangled with a Shesha checkbox model-sync quirk under automation (synthetic `.ant-checkbox-input` clicks don't
  register; real label clicks do), so it is recorded as **needs a clean manual retry** before being called a firm
  defect, not verdicted.
- **TC-12-008** (Close Investigation + forensic outcome): INV1698 was validated **Valid + Within Mandate**, then
  the **Assign Investigator & Reviewer** step was completed — investigator *Anathi Sovu*, reviewer *Dineo Moleko*,
  both **persisted** (`investigator` / `reviewer` on the entity, `investigationStatus 4`). The case then moved to
  **"AWAITING INVESTIGATION OUTCOME."** 🔑 **The Close-Investigation action is now role-gated to the assigned
  investigator** — it is not on the read-only `investigation-details` view and not in the shared account's general
  Workflows inbox. Reaching it means acting **as Anathi Sovu**, i.e. impersonating the assigned investigator. Not
  done — that is out of bounds unsupervised. So TC-12-008 is **route-complete up to the outcome step; the final
  Close is investigator-gated.**
- **TC-12-010** (Reviewer Feedback persists): analogously gated to the assigned **reviewer** (Dineo Moleko), and
  attaches after the investigation outcome. Same identity boundary.

**What this establishes:** the admin lifecycle is **role-segmented** — backend triage (the shared/admin account)
does *Validate* and *Assign*; the assigned **investigator** does the investigation + *Close*; the assigned
**reviewer** gives *Feedback*. TC-12-005 (validate) is fully in the triage role and is done. TC-12-007 (validate →
outside-mandate forward) is also a triage-role action (blocked only by the disabled-button quirk above). TC-12-008
and TC-12-010 require the investigator / reviewer identities respectively — to run them, QA needs to **sign in as
the assigned investigator / reviewer** (self-served role accounts exist per [[dsd-npo-self-serve-roles-and-accounts]]),
assign the case to *those* accounts, and complete the steps as them. That is the clean way to close them and is the
recommended next step — no impersonation of existing users.

Each remaining case is now a fully known sequence. **The mapped, role-segmented chain is the deliverable that
unblocks them.**

## Records created (synthetic, our own NPO)
- **INV1698/28/08/2026** — filed against 333-018, validated **Valid + Within Mandate**, assigned to investigator
  *Anathi Sovu* / reviewer *Dineo Moleko*, now **"AWAITING INVESTIGATION OUTCOME."** A synthetic QA artifact on our
  own NPO; harmless to leave mid-chain. (INV1696 = the Not-Valid/Closed specimen for TC-12-005.)

## Records created (synthetic, against our own NPO)
- **INV1696/28/08/2026** — filed anonymously against **333-018 (ours)**, Case Type *Other*, description marked a QA
  test, then validated **Not Valid** and closed. No real organisation involved.

## Method notes
- The case-processing route was found by reading the admin **Workflows inbox**'s own row links, not guessed.
- Investigation entity = `Npo.Investigation`; state read from the persisted entity (`status`, `investigationStatus`,
  `caseValidComments`) via the grid's own endpoint.
- No third-party record was touched for this suite.

## ❓ Questions for Thabiso
1. A **Not Valid** validation lands the case in **"Investigation Complete"** — should a rejected-at-validation case
   have a distinct closed/not-valid state rather than reading as an investigation that completed?
2. Banner typo: **"INVESTICATION COMPLETE"**.
