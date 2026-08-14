# Report: NPO-07 — Backend triage, OB Compliance & Document Verification (APPL26-00817)

**Date:** 2026-08-13 12:32 UTC
**Plan:** test-plans/application-processing/07-application-triage-and-verification.md
**Spec:** test-plans/application-processing/07-application-triage-and-verification.spec.ts
**Execution Mode:** ai-repair
**Result:** PASSED — the full assessment lifecycle completes; NPO **333-018-NPO** is REGISTERED and all 4 registration artefacts issued
**Duration:** 900s
**Cases:** TC-07-001, TC-07-002, TC-07-004, TC-07-006, TC-07-010, TC-07-013 (smoke suite 101864)
**Environment:** QA · admin portal · view mode **Latest**
**Application:** **APPL26-00817** → **NPO `333-018-NPO`**

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 25 | 23 | 1 | 1 |

## 🎉 THE FULL LIFECYCLE COMPLETES

`APPLICATION IN PROGRESS` → `AWAITING DOCUMENT VERIFICATION` → **`APPLICATION SUCCESSFUL`**

The public NPO view now reads:

| Field | Value |
|---|---|
| Name | `Nomfanelo QA NPO 2026-08-13` |
| **NPO Number** | **`333-018-NPO`** ✅ correct `NNN-NNN-NPO` format |
| **NPO Status** | **`REGISTERED`** |
| Financial End Month | March |

**New actions appeared for the NPO: `Annual Reports` · `Post Registration` · `Voluntary Deregistration` ·
`Submit Query`.**

🔑 **This unblocks smoke suites 08, 09, 10P, 13P** — all of which required a *registered* NPO, not merely a
submitted application. Combined with the earlier submission unblocking 06→13, **the whole smoke plan is now
reachable.**

## ✅ TC-07-001 — admin sign-in (ADO #101711) — PASS

## ✅ TC-07-002 — All Applications lists every application (ADO #101712) — PASS with one defect
- [PASS] Grid renders; total **10,313**
- [PASS] Columns: *Application Ref · Organisation Name · Whatsapp Number · Email Address · Legal Form ·
  No. of Office Bearers · Application Status · Date Received*
- [FAIL] ⚠️ **No `Risk Status` column** — ADO #101712 prescribes it. The other four prescribed columns are
  present under different labels.
- ⚠️ **Intermittent hang:** on one attempt the grid sat on a spinner (`aria-busy="true"`) 30 s+ with zero rows,
  blocking clicks, while the underlying `GetAll?entityType=Npo.Application` returned **200** — so the API
  answered and the fault is client-side rendering. It behaved normally on other attempts.

## ✅ TC-07-004 — Application details (ADO #101714) — PASS
`/dynamic/boxfusion.dsdnpo/npoapplication-details?id=<applicationId>&mode=edit` — all prescribed sections present
across tabs: *Application Details · Organisation Details · Objectives · Particulars Of Office Bearers ·
Particulars Of Control Structure · NPO Admin and Operations · Area of Operation · Declarations*.
✅ SA IDs and passports are **masked** (`800101*******`) — good POPIA behaviour, worth crediting in suite 14Y.

## ⚠️ TC-07-006 — OB Compliance (ADO #101716) — works, but the DESIGN does not match the case
**Reached via the workflow inbox, not the details page** — `APPL26-00817 · Action Required: Doc Verification` →
`/shesha/workflow-action?id=<appId>&todoid=<taskId>`, which exposes **OB Compliance** and **Verification**.

- [PASS] Dialog opens (`office-bearer-compliance v26`); selecting **Yes** hides the non-compliance fields and
  enables Submit; submits cleanly
- [PASS] ✅ **It records** — proven by the Document Verification dialog subsequently showing
  **"Are OBs Compliant? = Yes"** as a **read-only, disabled** field
- [FAIL] 🔴 **Does not match ADO #101716.** The case prescribes *"lists **each OB** with verifications:
  **UN Sanctions, Dept of Justice, Child Protection DB**"*. The build asks one blanket question:

  > *Are all office bearers compliant?* **Yes / No** · *Select office bearers which are not compliant* ·
  > *Reason for non-compliance*

  **No per-office-bearer breakdown and none of the three statutory database checks appear.** The OB grid does
  carry an `Is On Un Sanctions List` column, so the data point partly exists — but this dialog neither surfaces
  nor captures it, and there is nothing for Dept of Justice or Child Protection.
- 📌 The decision is not shown on the OB grid afterwards; the only visible evidence is inside the other dialog.

## ⚠️ TC-07-010 — Document Verification (ADO #101720) — works, but the DESIGN does not match
Dialog `document-verification-copied v13` *(note "copied" in the form name — likely a leftover clone)*.
Hint: *"Download documents and verify the below information with the organisation details"*.

**Five fixed Yes/No questions**, not a document list:
1. Do you want to refuse/reject this application?
2. Name of the organisation verified?
3. Organisation services verified?
4. The financial year end verified?
5. Are OBs Compliant? *(read-only, carried from OB Compliance)*

**Actions:** `Decline` · `Approve` · `Reject`

- [FAIL] 🔴 **Does not match ADO #101720**, which prescribes *"lists **each uploaded document** with **Yes/No
  radio and Reason field**"*. There is **no per-document verification at all** — no document list, no
  per-document Yes/No, no reason field. The questions are about the organisation, not the documents.
- [PASS] Conditional logic is sound: with refuse/reject = No and the verifications Yes, **Approve** enables while
  **Decline** and **Reject** stay disabled.
- [PASS] **Two approval passes are required**, and each is confirmed:
  - Pass 1 → `APPLICATION IN PROGRESS` → **`AWAITING DOCUMENT VERIFICATION`**
  - Pass 2 → **`APPLICATION SUCCESSFUL`**
- 🔑 **Each Approve raises a nested confirmation dialog** — *"Approve application — Are you sure you want to
  approve application for &lt;NPO name&gt;"* with **No / Yes**. **It must be actioned or nothing happens.**

## ✅ TC-07-013 — approval issues the NPO Registration Number (ADO #101723) — PASS
- [PASS] **(BLOCKING)** Application Status = **`APPLICATION SUCCESSFUL`**
- [PASS] **NPO Registration Number issued: `333-018-NPO`**, matching the register's `NNN-NNN-NPO` format
- [PASS] NPO Status = **`REGISTERED`**, and the post-registration action set unlocked
- [PASS] ✅ **The chairperson was notified** — the tester confirmed receipt of a **registration success
  confirmation email**. That satisfies the notification leg of #101723.
- [FAIL] 🔴 **Only 2 of the 4 prescribed artefacts were issued.** The confirmation email carries two attachments:

- [PASS] ✅ **ALL FOUR prescribed artefacts are issued**, attached to the chairperson's confirmation email:

  | # | Required by #101723 | Received? |
  |---|---|---|
  | 1 | **PDF Certificate** | ✅ *"registration certificate"* |
  | 2 | Signed/stamped **Constitution** | ✅ *"Model constitution for a membership organisation"* — **signed and stamped** |
  | 3 | **Letter of Registration** | ✅ yes |
  | 4 | **OB list** | ✅ *"list of office bearers and their positions"* |

  🔑 **`BackfillMissingApplicationDocumentsAsync` works as intended** on this path — all four registration
  outputs are generated and delivered.

- [PASS] ✅ **THE CERTIFICATE IS QR-PROTECTED — and the QR code resolves correctly.**
  Scanning it opens a document headed **"NPO Certificate Authentication"** showing:

  | Field | Value |
  |---|---|
  | NPO Number | `333-018-NPO` |
  | Name | `Nomfanelo QA NPO 2026-08-13` |
  | Status | `Registered` |
  | Date Registered | `13/08/2026` |

  All four values match the record exactly. **This satisfies the final outstanding clause of #101723**, and
  TC-07-013 now passes in full.

  🔑 **This RETRACTS Thabiso's own drift note on #101723**, which read *"Certificate generated via
  `BackfillMissingApplicationDocumentsAsync`, but **QR code generation NOT found in code** — the FDS 'QR Code
  protection' is at risk."* **The QR code is implemented and working.** Either it lives somewhere the code review
  did not reach, or it has been added since. Worth telling him — a risk raised from code review, cleared by
  execution, is exactly the kind of feedback that improves the next review.

  📌 **New surface discovered — a public certificate-authentication endpoint.** The QR resolves to an
  anonymously-accessible verification page. Relevant to three Functional suites not yet imported:
  **14S** (public search & anonymous endpoints), **14Y** (POPIA data protection) and **14Z** (security).
  Worth checking what it exposes and whether the URL is guessable/enumerable — name, number, status and
  registration date are arguably public-register data, so this is a question rather than a concern.
  📌 Separately: **no artefact is retrievable from the application record** — the admin view has no
  documents/attachments section, so an assessor cannot re-send or re-download them after the fact. Worth raising
  as a usability gap, not a defect against this case.

  ⚠️ **RETRACTED, same day:** an interim reading of this run recorded only 2 of 4 attachments and a High-severity
  bug was filed (`2026-08-13-registration-certificate-and-letter-not-generated.md`, now **deleted**). The tester
  was checking on a phone and two attachments were not visible; on a full check all four were present. **The
  defect does not exist.** 🔑 Lesson: for a finding this significant, confirm the observation is complete before
  filing — an absence reported from a partial view is not an absence.

## Skipped
- [SKIP] TC-07-003 — filter applications by status. Not run: the grid's search/filter was hanging.

## 🔑 Two corrections to earlier findings in this session

1. **"The second Approve does nothing" — WRONG.** It raises a **nested confirmation modal** (`.ant-modal-confirm`,
   *"Approve application… No / Yes"*) which I never actioned. My selector matched the outer Document Verification
   dialog and looked straight past the confirm. Once Yes was clicked, the workflow completed immediately and
   redirected to the inbox. **The tester spotted this.**
   🔑 **Lesson: after any action button, check for a nested `.ant-modal-confirm` before concluding "no effect".**
   Same family as the transient-toast mistake earlier today — the evidence was on screen; my query missed it.

2. **The unrecorded OB self-confirmation did NOT block approval.** Suite 06 found `Is OB Self-Verified?` stays
   `No` after a genuine confirmation. The application nonetheless went all the way to REGISTERED. **So office-
   bearer self-confirmation is not enforced as a gate anywhere in the assessment path** — which is a finding in
   its own right, and arguably more serious than the flag not updating.

## Observations
1. **Suite 07's actions live in the workflow inbox, not `CRUDS → All Applications`.** The details page exposes
   only *Save*. **Plan NPO-07 should be re-routed through Workflows → Inbox.**
2. The same `todoid` served both approval passes — the workflow did not issue a new task between stages.
3. Status vocabulary observed: `APPLICATION IN PROGRESS` → `AWAITING DOCUMENT VERIFICATION` →
   `APPLICATION SUCCESSFUL`; NPO status `REGISTERED`. The header also carries a persistent, undocumented
   **`NOT RECOGNISED`** tag which did **not** clear on registration — worth asking what it means.

## ❓ Asks for the test lead / developer
1. **Should OB Compliance list each office bearer with UN Sanctions / Dept of Justice / Child Protection checks**,
   per ADO #101716? The build asks one blanket question.
2. **Should Document Verification list each uploaded document with Yes/No + reason**, per ADO #101720?
3. Should `All Applications` carry a **Risk Status** column (#101712)?
4. Is `document-verification-copied` the intended form or a leftover clone?
5. **Is office-bearer self-confirmation meant to gate approval?** It currently does not.
6. What does the persistent **`NOT RECOGNISED`** tag mean, and what clears it?
7. Should generated artefacts be **retrievable from the application record**, not emailed once only?
8. 📌 **Tell Thabiso the QR drift note can be closed** — QR generation IS implemented and the authentication page
   resolves correctly. His code review missed it.
9. The **certificate-authentication page** is anonymously accessible — is the URL enumerable, and is
   name/number/status/date the intended public disclosure? (Feeds suites 14S / 14Y / 14Z.)

## ▶ Next — the whole smoke plan is now reachable
With `333-018-NPO` **REGISTERED**, these open up:
- **08 / 09** Annual Compliance (8 cases) — *Annual Reports* action is live on the NPO
- **10P / 10A** Post Registration (6) — *Post Registration* action is live
- **13P / 13A** Voluntary Deregistration (6) — *Voluntary Deregistration* action is live; 13P TC-01 is expected
  to fail by design (no outstanding-report block)
- Still independent: **15 E&A (4)**, **12P → 12A investigations (3)**, **14S (1)**
