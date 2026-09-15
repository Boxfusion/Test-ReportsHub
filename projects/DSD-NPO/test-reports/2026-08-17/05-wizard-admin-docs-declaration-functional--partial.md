# Report: NPO-05-F — Wizard Tabs 5–8 (functional) — partial run

**Date:** 2026-08-17 12:58 UTC
**Plan:** test-plans/npo-registration/05-wizard-admin-docs-declaration-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 8 of 16 cases verdicted; uploads accept **any** file type including `.exe`, and the Control Structure step vanishes on resume
**Duration:** ~2100s (two sittings)
**Cases:** TC-05-001, TC-05-003, TC-05-004, TC-05-005, TC-05-008, TC-05-010, TC-05-015, TC-05-021, TC-05-022
**Assessed-not-executed:** TC-05-009, TC-05-011, TC-05-012, TC-05-017, TC-05-018, TC-05-020, TC-05-023
**Environment:** QA · public portal · view mode **Latest** · form `create-npo v61`
**Application under test:** draft **APPL26-01216** (`QA Suite05 Intl Trust 2026-08-17`) —
Legal Form **Trust**, `ITRegistration No` `IT001234/2020`, FY end **June**, **National (SA)** Gauteng **+ International
Cameroon**, 1 objective, **3 office bearers**. Deliberately **not submitted**.

## Summary
| Total | Passed | Failed | Not executed |
|---|---|---|---|
| 16 | 5 | 3 | 8 |

⚠️ **Two sittings.** The first ended when a `browser_click` hung for ~75 minutes and was aborted by the harness — a
**tooling failure, not an application fault** (the browser survived and the click had landed). The second sitting resumed
the same draft and completed the Control Structure, Documents and Declaration cases.
🔑 **Resuming the draft turned out to be a finding in its own right** — see the Control Structure section below.

## 🔴 Two bugs filed from this run
- `bugs/2026-08-17-registration-uploads-accept-any-file-type-including-exe.md` — **High (security)**
- `bugs/2026-08-17-control-structure-tab-lost-on-draft-resume.md` — **High**

## 📸 Evidence — `test-reports/2026-08-17/evidence/`
| File | Shows |
|---|---|
| `v17-control-structure-tab-appears.png` | The stepper with **8 steps including "6 Control Structure"** |
| `v18-admin-ops-none-selected-blocked.png` | Admin & Operations, nothing selected, `Next` greyed, static note shown |

## Step Results

### ✅ TC-01 — At least one Admin & Operations item must be selected (#101677 · TC-05-001) — PASSED
With **0 of 27** checkboxes selected: `Next` **disabled** (navigation blocked ✓), **0** `.ant-form-item-explain-error`
nodes, and the step displays *"Note: Please select one or more administration and Operations of the organisation"*.
📌 Same mechanism as Tabs 3 and 4 — a **static instructional note**, not a triggered validation error — but the
requirement *is* communicated, which satisfies the case's intent. **Marked PASSED**, with the mechanism recorded.
📌 This is now the third step (after Objectives and Office Bearer) that guides the user where **Tab 2 stays silent**,
which strengthens the touched-vs-pristine diagnosis: these steps carry a permanent hint, so they never depend on
AntD's touched-field validation.

### ✅ TC-02 — Control Structure only shown for international operations (#101679 · TC-05-003) — PASSED
🔑 **Verified live, not just from the case text.** Selecting **Cameroon** under *International* on Tab 2 changed the
stepper from **7 steps** to **8**, adding **"6 Control Structure"** between Admin & Operations and Documents:

`Read This · Organisation Details · Objectives · Office Bearer · Admin & Operations · Control Structure · Documents · Declaration`

Every previous journey on this project — all domestic-only — ran **7 steps with no Control Structure tab**. So the tab
is **hidden**, not "shown empty", for a domestic organisation.
🔑 **This closes the open question carried since 2026-08-13** (*"Control Structure is CONDITIONAL — ask what triggers
it"*). The trigger is **≥1 country selected under International (Area of Operations)**, exactly as FDS 7.5.6 implies.

## Second sitting — Control Structure, Documents, Declaration

### 🔴 The Control Structure step disappears on resume (relates to #101679 · TC-05-003)
Reopening the draft showed a **7-step** stepper with **no Control Structure tab**, yet Tab 2 still held
`International = Cameroon`, Gauteng, Trust and the IT number — **the data was intact, only the step was gone**.
**Touching the International field restored it instantly** (adding Bolivia → back to 8 steps). So the conditional step is
driven by the **change event**, never recomputed from loaded data.
▶ An international NPO that saves and returns would **submit with no control-structure data**, and the 7-step stepper
looks identical to a legitimate domestic application. Filed as a bug; evidence
`v19-control-structure-lost-on-resume.png`.

### ✅ TC-03 — Add multiple partners (#101680 · TC-05-004) — PASSED
The dialog is **`Add Organisation Partner`** (`add-npo-partner v10`) with **Partner Name\* · Trading Name\* · Legal
Form\*** required, plus optional *Income Tax Number*, *Control Structure Type*, *Control Structure Sub Commitees Title*
and *Names of affiliate organizations and fiscal sponsorship*. Two partners added and both listed (`1-2 of 2 items`).
⚠️ **The case's field list does not match the build** — it says *"partner org name, country, admin/ops"*, but the dialog
has **no country and no admin/ops fields** at all.
📌 Typo: label reads *"Sub **Commitees**"* while its own placeholder spells *"Sub Committees"* correctly.

### 🔴 TC-04 — Delete a country with its admin/ops (#101681 · TC-05-005) — FAILED
There are no country rows to delete, so this was run in its only executable form: deleting a **partner**. The delete icon
works and raises a confirm — *"Are you sure want to delete this item?"* (grammar slip, missing "you") — but after
clicking **OK** the partner **is still there**, confirmed again after using the list's reload control (`1-2 of 2 items`).
🔴 **The delete affordance exists, is actionable, and has no effect.** That is worse than the objectives list, where no
delete control is offered at all — here the user is told the item was deleted. Evidence
`v20-partner-delete-has-no-effect.png`.

### ✅ TC-16 — Partner org name required (#101698 · TC-05-022) — PASSED
Typing then clearing **Partner Name** produced **"This field is required"**, and `Save` stayed disabled. Same
touched-field behaviour as the office-bearer dialog — further confirmation that the Tab 2 silence is a
touched-vs-pristine problem, not missing validation.

### 🔴 TC-13 — Upload allowlist (#101697 · TC-05-021) — FAILED, and it corrects the drift note
**`.docx` was ACCEPTED** — listed as `qa-test.docx  Download Zip`, no error, no toast.
The drift note claimed *"Code allows **ONLY .pdf and .doc**… if users have docx documents, they will be blocked."*
**That restriction is not in force**, so the feared business problem does not occur. **The real problem is the opposite —
see TC-05.**

### 🔴 TC-05 — Disallowed file type rejected (#101684 · TC-05-008) — FAILED
**A `.exe` was accepted** into the *Deeds Of Trust File* slot, with no error of any kind — and the wizard then allowed
progression to Declaration carrying it as a statutory document. **There is no file-type validation at all.**
🔴 Filed as a **High security** bug. Note the two ADO cases contradict each other on the intended allowlist
(#101684 says PDF/DOC/DOCX/JPG/PNG; #101697 says .pdf/.doc only) and **the build matches neither**.
⚠️ Not tested: whether the **server** rejects on submit, or whether content sniffing applies anywhere. Fixtures had the
right extensions and representative magic bytes; no real executable was used.

### ✅ TC-07 — Cannot proceed if a required document is missing (#101686 · TC-05-010) — PASSED
With all three Trust slots empty, `Next` was **disabled** and the step showed *"Note: Please download/Upload all required
documents."* Supplying **Deeds Of Trust** and **Letter Of Authority** released `Next`.
🔴 **Neither mandatory slot carries a `*`** — `req: false` on all three form items, yet two of them gate progression.
**That is the 4th unmarked-mandatory instance on this build**, after Area of Operations, the Objectives `Sector`, and the
9 declaration checkboxes.

### ✅ TC-10 — All declaration checkboxes required before Submit (#101691 · TC-05-015) — PASSED
Declaration shows **9 checkboxes, none marked required**, and with **0 ticked `Submit` is disabled** — which satisfies
the case's *"leave at least one unticked → Submit disabled"*.
📌 **The 9/9-releases-Submit half is carried from the 2026-08-17 registration run** (`APPL26-01143`, where Submit enabled
only at 9/9) rather than re-proven here, to save 9 interactions. Stated so the reader knows which half was observed today.

## Incidental findings — all new, none of them the cases under test

0. 🔑 **The office-bearer wipe did NOT reproduce.** Passing Tab 2 with a re-save (having modified the International
   field) left **all 3 office bearers intact** — `1-3 of 3 items`, Alpha/Beta/Gamma all present. The bug
   `2026-08-14-org-details-resave-deletes-all-office-bearers.md` was **DB-measured** on 08-14, so one contrary
   observation does not overturn it — but this is a **Trust**, and it may be fixed or conditional.
   ▶ **Worth an explicit retest**, because the standing "never revisit Tab 2" rule shapes how every future run is
   sequenced. If it is fixed, testing gets considerably easier.

1. 🔴 **DHA resolves at least one further identity, and a synthetic-looking ID hit it.** I invented `0001015009085` as
   throwaway setup data; DHA **resolved it**, returning masked names (`J_n D_rk` / `B_th_`). Per the standing rule that
   a resolving ID may belong to a real person, **I abandoned it immediately, created no record against it, and have not
   recorded the unmasked name.** ▶ **Practical warning for future setup: do not invent SA ID numbers as filler** — a
   plausible 13-digit value can hit a live identity. Use deliberately invalid values such as `1111111111111`.
2. 🔴 **A DHA-resolved name persists after the ID is changed.** After replacing that ID with `1111111111111`, the
   `First Name (s)` field **still contained the previous person's name** (`Jan dirk`). Nothing cleared it. So an office
   bearer can be saved carrying **one person's name against another person's ID** unless the tester notices and
   overwrites it — which I did.
3. ⚠️ **The DHA-unmatched path is non-deterministic, and this partly corrects the suite 04 report.** With
   `9001015009086` the visible name fields came back **`disabled: true` and empty**, with the typeable pair hidden —
   making the office bearer **impossible to complete** (required names unfillable, so `Save` can never enable). In the
   suite 04 run **the same ID** yielded the *typeable* pair and the OB saved as `Nomatch Tester`. Both observations are
   real; **which pair renders appears to depend on the timing of the DHA response.** ▶ The suite 04 TC-04-007 verdict
   (FAILED, no indicator) still stands, but the note there implying the fields are reliably typeable should be read
   with this caveat.
4. 📌 **The International country list is server-paged at 10** and contains a **typo: `Cryprus`** (should be *Cyprus*).
   Relevant to TC-05-023 — and note that Burundi and Cameroon *are* present, so the earlier shorthand that "most
   African countries are absent" is imprecise; the real characteristic is a **108-entry curated list, not full ISO
   3166**.
5. 📌 Trust reveals `ITRegistration No*` as expected, and `IT001234/2020` was accepted — consistent with TC-03-027,
   where **any** value is accepted because no format rule exists.

## Resume instructions

The draft is at **Tab 5** with Trust + International + 1 objective + 3 office bearers, so the expensive setup is done.
▶ **Do not revisit Tab 2** (the office-bearer wipe), and be aware `APPL26-01212` demonstrated that a resumed draft can
get stuck on Tab 2 — so resume **forward** from Tab 5 rather than re-walking the wizard.

Upload fixtures were created for the allowlist and size cases and remain at
`.playwright-mcp/upload-fixtures/`: `qa-test.pdf`, `qa-test.docx`, `qa-test.jpg`, `qa-test.exe`, `qa-test.js`, and a
**50 MB** `qa-oversize.pdf`. They must stay inside the repo — the MCP upload tool is sandboxed to it.

**Highest value remaining:** **TC-05-021** (the `.pdf`/`.doc`-only allowlist, which would block `.docx` and phone
photos) and **TC-05-009** (no size enforcement — the 50 MB file is ready).

## Artefacts

| Item | Value |
|---|---|
| Draft application | `APPL26-01216` · `50cc1481-e38e-436d-97df-d7bf89d6f984` (Trust, not submitted) |
| Office bearers | Alpha One `8001015009086` · Beta Two `9001015009085` · Gamma Three `1111111111111` — all deliberately invalid IDs |
| Objective | International / International Activities / Development assistance associations |
| Area of operations | National **Gauteng** + International **Cameroon** |
