# Report: NPO-11 — suite 11 reconciliation: the "all BLOCKED" entry was stale, but nothing in the residue is actionable

**Date:** 2026-08-31 09:05 UTC
**Plan:** test-plans/appeals/11p-appeals-submitter-functional.md
**Execution Mode:** ai-mcp
**Result:** BLOCKED — the register's *"Suite 11 — all BLOCKED"* entry is **stale and now corrected: 7 of the 11 functional cases already carry verdicts.** The residue is **4**, not 13. All four were then checked individually and **none is actionable**: one describes a control that does not exist in the build (already dispositioned on 08-26, but filed against the smoke plan so the functional parser never saw it), two need preconditions that do not exist anywhere in the environment, and the fixture that made the fourth reachable **was registered away by another user on 2026-08-29.** No coverage change.
**Duration:** ~600s
**Cases:** NO DATA — nothing verdicted this run
**Environment:** QA · admin portal · view mode Live
**Accounts used:** shared dev account (reads only)
**Coverage impact:** none — functional coverage stays **222 / 314 (70.7%)**

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 4 assessed | 0 | 0 | 0 | 4 |

---

## ✅ The reconciliation — the register entry was wrong, the coverage state was right

The blocked register carried *"**Suite 11 — all** (functional TC-11-002/003/004/006/009/010/011/013/014/015/016)"*
as blocked, dated 2026-08-20. Reconciled against the reports:

⚠️ **Deliberately formatted with the ADO work item first.** This report verdicts nothing — it *reports* verdicts
established elsewhere. The coverage parser treats a leading `TC-…` table cell as a verdict of this report's own, so
the case ids are kept out of the first column (see the tooling note at the end).

| ADO | Case | Verdict of record |
|---|---|---|
| #101776 | TC-11-004 | ✅ PASSED |
| #101782 | TC-11-010 | ⚠️ PARTIAL |
| #101783 | TC-11-011 | ⚠️ PARTIAL |
| #101785 | TC-11-013 | ⚠️ PARTIAL |
| #101786 | TC-11-014 | 🔴 FAILED |
| #101787 | TC-11-015 | 🔴 FAILED |
| #101788 | TC-11-016 | 🔴 FAILED |
| #101774 | TC-11-002 | ⛔ none |
| #101775 | TC-11-003 | ⛔ none |
| #101778 | TC-11-006 | ⛔ none |
| #101781 | TC-11-009 | ⛔ none |

**7 verdicted, 4 residue** — and this matches the coverage script's own per-suite line for suite 11 exactly
(`7 / 0 / 4`). The register entry was 11 days stale; the coverage number was never wrong.

🔑 **Lesson, and it is the second time this month:** the *register* is prose about why a run was hampered. It is
**not** a verdict source. Read the report verdict tables. Reading the register instead is what produced a list of
"reclassifiable" cases this session that all turned out to be already verdicted (see the correction section below).

---

## Each residue case, checked individually — none actionable

### TC-11-009 (#101781) — NOT EXECUTABLE, and already dispositioned
The case reads *"TYPE chairperson email = `invalid` and submit; ASSERT a validation error is shown."*
**There is no email field to type into** — the Send-to-Chairperson step is a confirmation dialog with no free-text
address. This was established on **2026-08-26** and written up in full, with the recommendation that Thabiso rewrite
#101781 against the confirmation-dialog design.

🔑 **Why it still reads as an unexplained gap:** that write-up lives in
`2026-08-26/11a-appeals-admin--send-to-chairperson-is-a-dead-button.md`, whose `**Plan:**` is the **smoke** plan
(`11a-appeals-admin-tribunal.md`). The coverage parser only reads reports whose plan ends in `-functional.md`
(`coverage-baseline.js:68`), so a correct, definite disposition recorded against the smoke plan is invisible to the
functional accounting. **This is a bookkeeping gap, not a testing gap** — and the verdict would be NOT EXECUTED,
which the parser excludes from the numerator anyway, so recording it changes no number.

### TC-11-002 (#101774) — precondition destroyed on 2026-08-29
Needs a refusal notice **older than 30 days** on an NPO we can act for. Our fixture was `Test Unsuccessful 03`,
which we reached on 08-26 via *Invite to Organisation* while it sat at **OrganisationStatus 9 (Not Registered)**.

🔴 **It is no longer status 9.** Read today:

```
name: Test Unsuccessful 03      status: 4
npoNumber: 333-027-NPO          dateRegistered: 2026-08-29T10:52:23
registrationCertificateFile: RegistrationCertificate.pdf
lastModificationTime: 2026-08-29T10:52:24   lastModifierUserId: 15932
```

It was **registered on 2026-08-29 by another user** (15932). On 08-26 all three status-9 organisations had
`npoNumber = null`; this one now has a number and a certificate. There is no refusal left to appeal, so the case's
premise is gone.

### TC-11-003 (#101775) — genuinely blocked, unchanged
Needs a **Cancelled** NPO (OrganisationStatus 7). Per the 08-20 investigation, status 7 has **never been set on any
of 62 543+ NPOs** and has no UI action even where `canBeCancelled = true` — which is still `true` on 333-027 today,
with still no action offered. Unchanged.

### TC-11-006 (#101778) — needs a denied Compulsory-Register application
No compulsory-register organisation with a denied application was located. The plan itself already notes
*"precondition may be unbuildable"*. Left blocked; not disproven, but nothing to run against.

---

## ⚠️ Corrections to claims I made earlier in this session

All four were produced by reading the blocked register rather than the report verdict tables. Recording them so they
are not repeated:

| I claimed | Actually |
|---|---|
| Case TC-15A-004 is blocked and reclassifiable to FAILED | **Already verdicted 🔴 FAIL on 08-18** — *"required District list empty → can't complete"* |
| Case TC-15A-005 likewise | **Already ⚠️ PARTIAL on 08-18** |
| Case TC-15B-005 is blocked and reclassifiable to FAILED | **Already verdicted 🔴 FAIL on 08-18** — *"upload control disabled; cannot add content"* |
| Case TC-10-005 verdictable from the "cancel broken unassigned" observation | The case tests cancel on an **assigned** request; the unassigned observation does not verdict it |
| Cases TC-14Z-021/022 unlockable with accounts A/B | Both are **`Src:Code`**, naming C# methods (`DeletePartnerAsync`, `GetOfficeBearerOrganisationsByUserIdAsync`) — out of black-box remit |
| "~8 cases of cheap coverage available" | **Zero.** Every candidate was already verdicted or out of remit. |

Suite 15A stands at **8 verdicted / 0 not-run** and 15B at **6 / 4** (006 time-travel, 007/009/010 dependent on the
broken content upload). Nothing to reclaim in either.

---

## 📌 The pattern worth escalating: QA state is drifting under us

Three independent instances found today, all dating to **on or after 2026-08-29**:

1. The public **whistleblowing** intake broke (workflow definition renamed/misspelt) — it worked 08-28.
2. Admin **Create Case** is inert for the Investigation category (no `CaseRouting`).
3. Our **appeals fixture** (`Test Unsuccessful 03`) was **registered**, destroying the status-9 precondition.

(1) and (3) are both attributable to activity by other users over the weekend. Any recorded precondition in this
project should be re-read immediately before use, not trusted from the register.

## Accounting — the full 314 reconciles
- **222** verdicted (PASS / FAIL / PARTIAL), script-derived, 0 assumed
- **50** explicitly not-run, each with a recorded reason, tracked per suite
- **42** dispositioned in `audits/2026-08-28-unattributed-44-reconciliation.md` (44 minus the 2 run that day)
- **222 + 50 + 42 = 314.** Nothing is unaccounted for.

## Records created / modified
**None.** This session was reads only — entity queries and report reconciliation. No form was submitted, no record
created, no workflow decision taken.

## ❓ Questions for Thabiso
1. **Who is changing QA state?** `Test Unsuccessful 03` was registered on 08-29 by user 15932. It was our only
   appeals fixture. Can a small set of NPOs be ring-fenced for QA, or should we expect fixtures to be consumed?
2. **#101781 (TC-11-009) needs a rewrite** — it specifies typing a chairperson email address; the build has a
   confirmation dialog with no address field. Same for step 3 of #101780.
3. **Is an NPO at OrganisationStatus 7 (Cancelled) ever going to exist in QA?** TC-11-003 cannot run without one,
   and status 7 has never been set on any NPO in the environment.
4. **Do any Compulsory-Register organisations with denied applications exist?** TC-11-006 needs one.

## 🔧 Tooling note — a parser fragility found while writing this report

`coverage-baseline.js` reads a verdict-table row with `/^\|\s*(TC-[0-9A-Za-z-]+)[^|]*\|([^|]*)\|([^|]*)\|/gm`.
Because `[^|]` **also matches a newline**, a **two-column** row whose first cell starts with `TC-` will consume the
line break and match the *next* row's leading pipe — so a two-column table is read as verdict rows.

Writing this report tripped it twice: the reconciliation table registered **9** phantom verdict rows, and the
two-column corrections table registered **2** more. The total did not move (the keys deduped against verdicts
already recorded elsewhere) but it would have corrupted the number had any cell disagreed.

**Rule for any report that reports rather than produces verdicts:** keep case ids out of the first table column —
lead with the ADO work item, or prefix the cell (`Case TC-…`). Then confirm with
`node scripts/coverage-baseline.js .` that the report shows as `0  NO DATA` before publishing.

**Suggested fix if the parser is ever revised:** anchor the row to a single line by replacing `[^|]` with `[^|\n]`.
Not applied here — that script produces the published number and should not be changed mid-session. Left for
Thabiso / whoever owns the tooling.
