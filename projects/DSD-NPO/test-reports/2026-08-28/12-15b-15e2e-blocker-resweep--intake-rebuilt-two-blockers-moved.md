# Report: Stale-blocker re-sweep — investigations intake has been REBUILT; the two content blockers have MOVED, not lifted

**Date:** 2026-08-28 07:30 UTC
**Plan:** test-plans/cross-cutting/14u-audit-trail-functional.md
**Execution Mode:** ai-mcp
**Result:** PARTIAL — a re-check of the three oldest cluster blockers (last tested 08-18 and 08-20). **No case is newly verdicted, and coverage is unchanged at 215/314** — but two of the three root causes have changed materially and the register was wrong about all three. **Investigations intake has been rebuilt** as a real workflow (`create-investigation-workflow` v14) that mints a case reference, superseding the 08-18 *"submit is a silent no-op"* finding. **`Dsd.District` is partially seeded** — the cascade now works for KwaZulu-Natal, so the 08-20 District blocker is lifted, but intervention Save is now gated silently by something else. **The library Add File upload is still disabled — third reproduction, unchanged.**
**Duration:** ~1000s
**Cases:** none — no case is verdicted by this run. It is a blocker re-sweep across the investigations, interventions and content-lifecycle clusters; the affected case ids are listed in the body, deliberately not here, so the coverage parser records nothing from this report.
**Environment:** QA · admin portal (view mode **Latest**) + public portal
**Accounts used:** shared dev account (admin) · `npo.qa.applicant.b@example.org` (Account B, public)

## Summary
| Cluster | Blocker as recorded | Status today |
|---|---|---|
| Investigations (5 cases) | *"public intake broken — creates no case"* (08-18) | 🔄 **SUPERSEDED** — intake rebuilt and working; held up now by a **different** constraint |
| Interventions E2E (1 case) | *"District list empty — data-seeding gap"* (08-20) | 🔄 **PARTLY FIXED** — KZN cascades; Save now silently gated instead |
| Content lifecycle (4 cases) | *"Add File upload disabled"* (08-18, 08-20) | ⛔ **UNCHANGED** — third reproduction |

> ⚠️ Case ids are deliberately kept out of this table's first column: the coverage parser reads a leading `TC-…`
> cell as a case verdict, and the word *blocked* in a later cell registered a phantom case on first write.

**Coverage impact: none.** No case moved to a verdict. The value here is that three stale blocker descriptions are
now accurate, and one of them was materially misleading.

---

## 🔄 Investigations — the intake has been rebuilt since 08-18

The 08-18 report recorded the whistleblowing channel as **down**: the public investigation report reused the generic
*"Submit A Query"* (`public-case-create`) form, **Submit was a silent no-op**, and **no `Case/Crud/Create` was ever
issued**. It was called a regression and *"the whistleblowing channel is down"*.

**That is no longer the build.** The public landing page now carries a dedicated **Whistleblowing** entry point, and
it opens a purpose-built form:

- Route: `/shesha/workflow-action?id=…&todoid=…` → **`boxfusion.dsdnpo/create-investigation-workflow` v14**
- Opening it **immediately creates a persisted draft** — `initiate-investigation: DRAFT`,
  **Ref No: `INV1694/28/08/2026`**, *"Created by: NpoQaApplicant BravoTest"*.
- Fields: Remain Anonymous (switch) · First/Last Name · Email · Mobile · Reported By Channel · Priority · Category ·
  **Case Type\*** · **Description\*** · **Npo Number\*** · Npo Name · NPO Address · Attachments.
- **Case Type** offers 10 values: Conflict of Interest · Constitutional Non-Compliance · Labour related issues ·
  Membership related issues · Non-Compliance to NPO Act · Office Bearers Dispute · Other ·
  Poor Governance/Maladministration · Procurement · Theft.
- ✅ **The anonymity logic works.** With *Remain Anonymous* on, the four contact fields are not rendered as inputs
  at all. (They still carry `*` in their labels, which is cosmetically wrong when they cannot be filled.)

### ⛔ But the TC-12 admin cluster is still blocked — for a new reason

`Npo Number*` is mandatory and is a **search picker that resolves only against the registered NPO register**:

- `333` → 10 real registered NPOs returned. The picker works.
- `NpoQa` → **0 results.** Our own organisation is still *Application In Progress* and has no NPO number, so we
  cannot file against ourselves.
- `Test` → **0 results.** There is no synthetic or test NPO in the register to use instead.

**So completing a whistleblowing submission requires naming a real, registered South African organisation as the
subject of a misconduct allegation** (Procurement, Theft, Maladministration…). I stopped rather than do that on a
shared environment. TC-12-005 / 007 / 008 / 010 all need *"an open investigation case we own"*, and that
precondition is still not constructible without it.

**▶ Decision needed before these five can run.** Either (a) a synthetic NPO is seeded into the register for QA to
file against, or (b) we get explicit sign-off to file a clearly-labelled synthetic case against a named real NPO and
withdraw it afterwards. **(a) is the right answer.** This is a question for Thabiso, not a call for QA to make.

📌 **Worth raising on its own:** merely *clicking* Whistleblowing persists a draft investigation with a live
reference number before the reporter has entered anything. `INV1694/28/08/2026` exists now as a result of this
check. If every abandoned visit mints a case reference, the investigation register will accumulate empty drafts.

---

## 🔄 Interventions — District is partly seeded; the gate has moved

The 08-20 root cause was pinned as a reference-data gap: `Dsd.District` held **2 rows**, both with `parentArea:
null`, so **no** province cascaded and no intervention could be captured.

**Re-measured today — one row has been linked:**

| | 08-20 | 08-28 |
|---|---|---|
| `Dsd.Province` | 9 | **9** ✅ |
| `Dsd.District` total | 2 | **2** (unchanged) |
| Districts with a parent | **0** | **1** — `Ugu` → **KwaZulu-Natal** |

Per-province cascade counts today: **KwaZulu-Natal 1**, every other province **0**.

✅ **Confirmed in the UI**: Province = *KwaZulu-Natal* → the District dropdown populates with **Ugu**. On 08-20 the
equivalent step returned *"No data"*. **The 08-20 District blocker is lifted for one province.**

### ⛔ Save is now silently disabled, with no discoverable cause
Driving the whole Add Intervention form with KZN → Ugu:

- **All 15 starred required fields across all four sections were satisfied** — Intervention Type (Education And
  Awareness), Risk Status (Low), start/end dates (picked from the panel, never set programmatically), Province,
  District, the three Section-4 counts, and all six Reporter/Reviewer name-surname-email fields.
- **Save remained `disabled`.**
- No `.ant-form-item-has-error`, no `aria-invalid="true"`, no `.ant-form-item-explain`, and **no empty starred
  field anywhere in the modal**.
- The three intervention upload controls (Attendance Register, Feedback Questionnaire, Other File) are **enabled** —
  confirming the 08-20 library-vs-intervention contrast still holds.

This is a textbook instance of the standing 🔴 known issue *"unstarred mandatory fields silently disable
Next/Save/Reject"*. **TC-15E2E-002 therefore remains blocked**, but the register's stated reason (District data) is
now wrong and has been corrected.

📌 Case-vs-build, unchanged from 08-20: TC-02 prescribes Type = **Workshop**; the live list offers Education And
Awareness / Train The Trainer / Outreach Programmes / Npo Sector Engagement. No *Workshop*.

**Nothing was saved.** The draft was cancelled.

---

## ⛔ Content library — Add File still disabled, third reproduction

Reused our own **"QA Test Library (synthetic)"** (created 08-18, still present, Status CREATED, 0 items) at
`boxfusion.content/library-details-folder?mode=edit&id=85c004c8-e514-4f43-85be-2be8bf63327b`.

- Toolbar → **Add File** → `boxfusion.content/add-content-file` v3 modal opens with Name · Valid From · Valid To ·
  **File (Drag and drop)\*** · Save · Cancel · Publish.
- The upload is **`ant-upload ant-upload-select ant-upload-disabled`** and its `input[type=file]` is
  **`disabled: true`** — identical to 08-18 and 08-20.
- 🔑 **New detail: it is not gated on the other fields.** I filled **Name** and re-checked; the upload stayed
  disabled. It is unconditionally disabled, so no amount of form completion will unlock it.
- File is required, so **no content item can be created**, and TC-15B-007 / 009 / 010 (lifecycle states, approve,
  decline) and TC-15E2E-001 stay blocked with **no** change since 08-18.
- Bug `bugs/2026-08-18-library-add-file-upload-disabled.md` is **STILL OPEN**, now with a third reproduction.

📌 Minor drift: the library toolbar today reads **New Folder · Add File · Delete**. The 08-20 report also listed
**Submit**, which is now absent.

**Nothing was saved.** The modal was cancelled.

---

## What this means for the close-out

None of these ten cases became runnable, so the coverage number does not move. But the register was carrying three
blocker descriptions that no longer matched the build, and one of them — *"the whistleblowing channel is down"* —
would have been actively misleading in a status report. **The intake works; what blocks us is that we have nothing
safe to file against.**

🔑 **The pattern across today's whole sweep:** of five blockers re-examined, **four had changed** and only one
(library upload) was still true as written. Blocker descriptions decay fast on an unstable build. They should be
re-read against the environment before any of them is quoted in a report or used to scope a session.

## ❓ Questions for Thabiso
1. **Can a synthetic NPO be seeded into the registered register for QA to file investigations against?** Without
   one, five TC-12 cases cannot be run without naming a real organisation in a misconduct allegation.
2. **Should clicking *Whistleblowing* create a persisted draft with a reference number before anything is entered?**
   `INV1694/28/08/2026` was created by opening the form.
3. **`Dsd.District` has 2 of ~52 districts, and only one is linked to a province.** Is the full seed still coming?
   Interventions can currently only be captured for KwaZulu-Natal.
4. **What disables Save on Add Intervention when every starred field is filled?** No error state is exposed anywhere
   in the modal.
5. **The library Add File upload has been unconditionally disabled since 08-18.** Is content creation intended to be
   switched off in QA, or is this a defect?
