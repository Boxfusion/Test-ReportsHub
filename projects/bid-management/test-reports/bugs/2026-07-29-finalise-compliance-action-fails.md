# Bug: "Finalise Compliance" fails — configured action `Checklist:Update` throws, compliance never saves

- **Date:** 2026-07-29
- **Status:** ⚠️ **DOWNGRADED 2026-07-30 — no longer a blocker.** See the retest below.
- **Severity:** ~~Blocker~~ → **Medium** — the dialog *does* save; what remains is a **missing-validation**
  defect (an unanswered required section fails silently and discards everything)

## ▶ RETEST 2026-07-30 — the blocker is NOT reproducible; the real trigger is narrower

Re-driven live on **REF2026-0890** (the same tender as the original investigation) while testing the
**Non-Compliant** negative path. Findings, in order:

1. **First attempt reproduced the original symptom exactly** — dialog stays open, nothing persists, console
   shows `Failed to execute action 'Checklist:Update', error: undefined` plus 5 × `Action name is mandatory`,
   and **no message of any kind reaches the user**. Critically, on reopening the dialog **everything was
   blank** — including the five per-document rows whose `FlatResponseDocument/Crud/Update` PUTs had returned
   **200**. So a 200 on those row PUTs is *not* evidence anything was saved.
2. **The difference was the Checklist section.** In that first attempt the five **Checklist** Yes/No/N/A
   questions were left **unanswered** (and 3 of 5 document rows left unticked). That is precisely what
   `Checklist:Update` chokes on.
3. **Filled properly, it works.** Same tender, same dialog, same session: all 5 document rows commented,
   4 of 5 ticked compliant, **all 5 Checklist questions answered N/A**, status set, confirmation ticked →
   **Finalise Compliance succeeded, the dialog closed, and the status persisted.** Repeated successfully for
   all three suppliers.
4. **The stage submits and advances.** With all three responses assessed, Submit moved REF2026-0890 on to
   **Calculate Specific Goal Points**. The lifecycle is not blocked at Verify Compliance.

**What is actually still wrong (the residual defect):** the **Checklist** section is effectively required,
but nothing says so. Leave it unanswered and the app fails **silently and destructively** — no inline
validation, no toast, the dialog just sits there, and **all captured work in the dialog is discarded**. It
should either validate the Checklist up-front (like `Compliance status`, which carries a visible `*`) or
surface the `Checklist:Update` failure.

**Note on the original 3/3 reproductions:** the write-up below states all 5 Checklist questions were
answered. Given today's result that is doubtful — most likely they were set but not registered (the
document rows re-render on every save and steal/reset interactions, as the harness note at the bottom
describes). Either way, the "cannot pass Verify Compliance" conclusion no longer holds.

**Also verified today (separate from this bug, and working correctly):** a supplier marked **Non Compliant**
persists as such, the stage still submits, and the non-compliant supplier is **correctly excluded from the
next stage** — see `test-reports/2026-07-30/bid-supply-chain-management--negative-non-compliant-and-bac.md`.

---

## Original 2026-07-29 write-up (kept for the record)

- **Status when logged:** ❌ OPEN — **app defect**, verified by hand (no test harness involved)
- **Severity when logged:** **Blocker** — the tender lifecycle cannot pass Verify Compliance, so no end-to-end run is possible
- **Module:** BID: Supply Chain Management (Bid Management) — ADO project `PD-SupplyChainManagement`
- **Environment:** QA — https://pd-supplychainmanagement-adminportal-qa.shesha.app
  (**note the migrated host** — the old `linux-supplychainmanagement-adminportal-qa.azurewebsites.net` no longer resolves)
- **Plan / TC:** `test-plans/tender-process/bid-supply-chain-management.md` — **TC-05 Review Compliance** (ADO #57553)
- **Forms:** `tender-wf-reviewcompliance v28` → per-supplier dialog `response-wf-reviewsuppliercompliance-dialog v20`
- **Tenders used:** **REF2026-0890** (`run-ms5wtnl4`, instance `e6c17246-4c05-4c4f-b079-9c175faf5dc9`) and
  **REF2026-0901** (`run-ms5xzl0a`, instance `a8220dce-8864-4abd-ad10-5717239d5079`) — REF2026-0901 was
  created fresh specifically to rule out contaminated state from the first investigation
- **Reproductions:** **3 attempts across 2 tenders**, all failing identically — including one with every
  document uploaded and one with `Compliance Comments` left empty

## Symptom

On the *Verify Compliance* stage, opening a supplier response's **Supplier compliance** dialog, completing
**every** control and clicking **Finalise Compliance**:

- the dialog **stays open**
- **no error is shown to the user** — no toast, no notification, no inline validation
- the supplier row's **Compliance Status stays empty**
- **no `RfxResponse/Crud/Update` request is issued** — nothing persists at response level
- the tender therefore never leaves *Verify Compliance*

The browser console shows the real failure:

```
Failed to execute action 'Checklist:Update', error: undefined
Failed to execute action 'shesha.common:Show Dialog', error: undefined
Action name is mandatory        (× many — one per interaction with the document rows)
```

So the button's configured action chain is broken: `Checklist:Update` throws, and the follow-on
`shesha.common:Show Dialog` never runs. The five "Action name is mandatory" errors that fire while
ticking the document rows suggest one or more actions in this form version are missing their `name`.

## Steps to reproduce

1. Log in as **TumisangM / 123qwe**, switch view mode to **Latest**.
2. Open a tender at the **Verify Compliance** stage (Workflows → Incoming Items).
3. On a supplier response row, click the **edit** (pencil) icon → the *Supplier compliance* dialog opens.
4. Complete everything:
   - tick **Is Compliant?** on all 5 Tender Documents rows (Cert, Test, Test DOC, RFQ Document, TAX Clearance Cert)
   - answer all 5 **Checklist** questions (N/A is fine)
   - set **Compliance status = Compliant**
   - type **Compliance Comments** (see the separate finding below — this is what enables the button)
   - tick **"I confirm that I have reviewed all the provided information…"**
5. **Finalise Compliance** is now enabled — click it.

**Expected:** the dialog closes, the supplier's Compliance Status becomes *Compliant*, and once all
suppliers are done the stage can be submitted onward.
**Actual:** dialog stays open, nothing saves, console shows `Failed to execute action 'Checklist:Update'`.

## Ruled out before logging (per test-plans/RULES.md and the project's verify-before-claiming rule)

- **Not our Playwright spec** — reproduced entirely **by hand** through the real UI via MCP, no spec running.
- **Not synthetic-event corruption** — the first attempt mixed programmatic clicks, so it was redone on a
  **different supplier (A & A Stationers) using real clicks only**; identical result.
- **Not un-registered React state** — every control was confirmed as `ant-checkbox-checked` /
  `ant-radio-checked` on the AntD wrapper (i.e. React state, not just the native input), and the comments
  textarea held 100 characters, before Finalise was clicked.
- **Not a stale/incomplete form load** — the per-document `FlatResponseDocument/Crud/Update` PUTs returned
  **200** as each row was ticked, so the dialog was live and saving at row level.
- **Not the migrated URL** — TC-01 through TC-04 pass against this host; only this action fails.

## Impact

**Blocks the whole downstream chain.** With Verify Compliance unable to complete, TC-06 → TC-16 have no
tender to act on. In the 2026-07-29 run this showed up as 1 real failure (TC-05) plus 11 cascade failures
that are *not* independent defects:

```
PASS TC-01 Draft Tender          PASS TC-03 Publish Tender
PASS TC-02 Review and Approve    PASS TC-04 Consolidate Supplier Responses
FAIL TC-05 Review Compliance  ← real failure (this bug)
FAIL TC-06 … TC-16            ← cascade: nothing reached these stages
```

## Separate finding — the button's enabled state goes stale (NOT a mandatory-comments rule)

> **Correction (same day).** An earlier version of this bug claimed `Compliance Comments` was a hidden
> mandatory field. **That was wrong** and has been retracted — see below for what is actually happening.

What enables **Finalise Compliance** is: all 5 document **Is Compliant?** checkboxes + all 5 **Checklist**
radios + **Compliance status** + the **confirmation** checkbox. `Compliance Comments` is **not** required —
verified on REF2026-0901 by completing exactly those controls and leaving comments **empty** (`value.length
= 0`), at which point the button enabled.

The real behaviour is that **the button does not always re-evaluate when the last required control is
set**. On the first attempt (REF2026-0890) the order was radios → status → confirmation → documents, and
after the final document tick the button was *still* disabled; typing into Compliance Comments then
enabled it — which is what produced the false "comments are mandatory" conclusion. The comment typing was
merely the next event that forced a re-render. Setting the documents *before* the confirmation (REF2026-0901)
enables it with no comment at all.

Consequences:
1. **Product:** the enabled/disabled state of Finalise Compliance is computed from stale form state — it
   should re-evaluate whenever any dependency changes. As it stands a user can complete every field and
   still face a dead button until they happen to touch something else.
2. **Our spec:** TC-05's original failure was that it never ticked the 5 per-document **Is Compliant?**
   checkboxes at all (they are new since the 2026-06 recording). The spec has been updated to tick them
   *before* the confirmation, which both satisfies the real rule and dodges the stale-state quirk.

## Ruled out — "documents with no uploaded file" is NOT the trigger

On both tenders, 2 of the 5 document rows (**Cert**, **Test DOC**) initially had no uploaded file. That
was the most plausible difference from a manual tester's run, so it was tested directly: `pdf-test.pdf`
was uploaded to **both** rows on REF2026-0901, giving all 5 rows a file, all 5 marked compliant, all
radios set and the confirmation ticked. **Finalise Compliance still failed with the same
`Checklist:Update` error.** Missing uploads are not the cause.

## Harness note — document rows re-render on save

Each **Is Compliant?** tick fires a `FlatResponseDocument/Crud/Update` and re-renders the table, so
index-based (`nth`) clicking is unreliable: clicking indices 0–4 in sequence left 0 and 3 unticked. Scope
clicks to the row and verify the wrapper state after each, or re-tick. Relevant to whoever automates this
once the app is fixed.

## ~~Related finding — the Attendees/Evaluators inline grid will not commit a backup evaluator (TC-08)~~ — RESOLVED 2026-07-30: NOT A DEFECT

> **Closed 2026-07-30 by the test lead: this is the intended requirement, not a bug.** At the
> Confirm-Attendance stage **an attendee can only be added if "Is Present?" is ticked** in the add-row.
> The add-row was refusing to commit because the spec deliberately left the backup evaluator *absent*
> (per the 2026-06-03 plan step). The grid was enforcing the rule correctly the whole time.
>
> **Actions taken:** `addBecEvaluator(page, term, name, markPresent)` now ticks "Is Present?" in the
> add-row (after the name is selected, since selecting re-renders the row); TC-08's add is a **hard
> blocking assertion again** — the soft-failure treatment introduced on 2026-07-29 has been removed;
> plan TC-08 step 6 and its expected result were updated. No dev action required, and the question
> "can a backup attendee be added at this stage" is answered: yes, but only as present.
>
> The original write-up is kept below for the record.

Separate from compliance, and the **only** outstanding failure in the chain as of 2026-07-29 14:5x.

On **Confirm Attendance and Open Evaluation**, adding a backup evaluator via the Attendees/Evaluators
add-row does not commit. The selection works — searching `Mamathuntsha` selects
**Maand-awe Mamathuntsha** and the grid auto-fills Job Title (`System Administrator`) and Email
(`Maad-we@gmail.com`) — but clicking **plus-circle** leaves the entry in the pending add-row. Captured
snapshot at failure:

```
row "Maand-awe Mamathuntsha  System Administrator  Maad-we@gmail.com  plus-circle close-circle"
   columnheader "Maand-awe Mamathuntsha"   ← PENDING add-row (never committed)
row "Nelly Tears        …  edit delete"    ← committed rows render as `cell`
row "Thabitha Modula    …  edit delete"
row "Nkosinathi Sibiya  …  edit delete"
```

Committed rows expose the name as a `cell`; the pending add-row exposes it as a `columnheader`, which is
how the spec detects non-commitment.

**Retrying does not help.** The commit is now wrapped in a re-click-until-committed loop with a 40 s
budget (re-checking first so a slow commit is never double-added) and it still fails. The same helper
commits fine on the **Invite BEC Members** page (TC-07 adds three evaluators and passes), so this is
specific to the Confirm-Attendance grid.

**Manual comparison needed:** the test lead reports actioning this stage by hand successfully. Marking the
three invited evaluators present and clicking **Open Evaluation** does work under automation too — so the
question is specifically whether *adding a backup attendee* at this stage still works manually, or whether
that step is now stale (the page may be intended for attendance-marking only, with membership fixed at the
Invite stage). The plan has flagged this add as "not yet green under automation" since **2026-06-03**.

TC-08 now records this as a **soft** failure so it no longer cascades: the stage still completes and
TC-09 → TC-16 run. That is how the chain reached 11/12 on REF2026-0922.

## Fix required before the demo

The tender lifecycle **cannot be demonstrated end-to-end on QA** while this stands. Either fix the
`Checklist:Update` action on `response-wf-reviewsuppliercompliance-dialog v20`, or provide a tender
pre-advanced past Verify Compliance for demo purposes.
