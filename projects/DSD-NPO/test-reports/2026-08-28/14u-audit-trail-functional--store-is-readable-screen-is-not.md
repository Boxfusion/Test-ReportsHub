# Report: NPO-14U-F — Audit trail & resubmission diff (functional) — the audit store is populated and readable; only the screen is broken

**Date:** 2026-08-28 06:45 UTC
**Plan:** test-plans/cross-cutting/14u-audit-trail-functional.md
**Execution Mode:** ai-mcp
**Result:** PARTIAL — the substantive finding is that the 08-25 blocker on this suite was **wrong**: it read *"there is no route to read an audit entry from"*, and in fact the audit trail **is populated, attributed and readable** — the dedicated screen is the only broken part. **TC-14U-004 is newly verdicted PARTIAL**: a state transition is recorded with full before/after and actor, but a file upload records **no file hash**. **TC-14-003 was ALREADY FAILED on 2026-08-25 and is only re-verified here — it adds no coverage**; what is new is *why* it fails and what the data behind it holds. **TC-14U-003 is now unblocked but not yet run.** Net coverage change: **+1** (214 → 215).
**Duration:** ~600s
**Cases:** TC-04 (TC-14U-004) newly verdicted · TC-01 (TC-14-003) re-verified, already counted · TC-03 (TC-14U-003) unblocked, not run · TC-02 (TC-14-004) not attempted
**Environment:** QA · admin portal · view mode **Latest** · application **APPL26-01570** (`6c02e52c-6799-4180-8b5c-9b84a5884aa4`)
**Accounts used:** shared dev account (admin portal)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 3 | 0 | 1 | 1 | 1 |

**Of those, only TC-14U-004 is new to the count.** TC-14-003 was already FAILED on 08-25; TC-14U-003 remains
unverdicted. Coverage moves **214 → 215**.

---

### 🔴 TC-01 — Audit trail captures who/when for every state transition (#101815 · TC-14-003) — FAILED

⚠️ **This case was ALREADY verdicted FAILED on 2026-08-25 and was already counted. This run adds no coverage.**
I approached it as blocked because the **plan's** coverage table still reads *"⛔ blocked — `entity-change-audit-log`
400s"*, and I did not check the report first. **That is the third time this month a stale plan line has been
mistaken for a verdict** — see the TC-14T-011 and 14S episodes. The plan line is corrected as part of this run.
What follows is a re-verification that stands, plus the genuinely new finding about the underlying data.

- **[FAIL] (BLOCKING) An audit trail cannot be opened for an application.** `Shesha/entity-change-audit-log` v32
  renders its four column headings (Date · Actioned By · Change Type · Description) and then *"No data is available
  for this list"*. The cause is visible in its own request:
  `EntityHistory/GetAuditTrail?entityId=&entityTypeFullName=&…` → **400**. The screen sends **both required
  parameters empty**. This reproduces the 08-25 diagnosis exactly; it has not been fixed.
- **[RECORD] The data the screen fails to show is nonetheless complete on actor, timestamp and states.** Supplying
  the two parameters the screen omits returns **200** with three entries for this application:

  | Timestamp (UTC) | Actor | Event | Description |
  |---|---|---|---|
  | 2026-08-27 09:56:14 | NpoQaApplicant BravoTest | Created | *(empty)* |
  | 2026-08-27 10:24:31 | NpoQaApplicant BravoTest | Updated | *(empty)* |
  | 2026-08-27 11:05:35 | Mpendulo ntshangase | Updated | `` `Application Status` was changed from "Application In Progress" to "OBFailed Compliance" `` |

  Against the ADO expected result — *"Each transition includes actor, timestamp, from-state, to-state, comment"* —
  **actor ✅, timestamp ✅, from-state ✅, to-state ✅, comment ❌** (there is no comment field on the record).

**Why this is FAILED and not BLOCKED.** The blocking assertion is *"an audit trail can be **opened**"*, and through
the product it cannot be. That the data exists behind the screen makes the defect **more** serious, not less: the
audit history is being captured correctly and is simply unreachable by any user. This is a one-parameter fix on the
form, not a missing feature.

---

### ⚠️ TC-04 — Document upload + application state change written to audit (#107427 · TC-14U-004) — PARTIAL

- **[PASS] Step 2 — the state transition carries before/after and the actor.** The third row above is exactly what
  the case prescribes: *"state transition captured with before/after + actor"*. `Application In Progress` →
  `OBFailed Compliance`, actioned by the admin account, timestamped. This assertion passes cleanly.
- **[FAIL] Step 1 — an audit entry exists per uploaded file, but it carries no file hash.** The application owns
  three stored files. Querying the audit trail for the first
  (`NpoQa Bravo Wizard Test 2026-08-27 - ApplicationNonMembershipConstitution.pdf`, 79 549 B) returns **one**
  entry: `Created`, by `NpoQaApplicant BravoTest`, at 2026-08-27 10:17:46. So *"audit entry per file upload"* ✅ and
  *"user reference"* ✅ — but `extendedDescription` is **empty**, so there is **no file hash** and no file
  identifier in the entry itself.
- 📌 The plan noted suite 05 TC-05-011 proved uploads round-trip byte-identical, so a hash is computable. It is
  simply not written to the audit record. The gap is in the audit write, not in file handling.

---

### ⚪ TC-03 — Office Bearer CRUD writes audit entries (#107426 · TC-14U-003) — NOT EXECUTED

**Its recorded blocker is withdrawn — this case is now runnable.** The 08-25 reason was *"there is no route to read
an audit entry from"*. There is: `EntityHistory/GetAuditTrail` answers 200 for any entity given `entityId` and
`entityTypeFullName`, and the office-bearer entity type resolves as
**`boxfusion.dsdnpo.Domain.OfficeBearers.NpoOfficeBearer`** (2 181 689 records).

It is not verdicted here because I could not resolve the office-bearer → application foreign-key property name
without guessing, and **a guessed property name is not evidence**. Two candidate names returned 400 and I stopped
rather than build a verdict on a probe.

**▶ To close it (cheap, next session):** open APPL26-01570 in the admin portal, go to the Office Bearers grid, and
capture the grid's **own** outgoing request to read the correct filter property — the same technique that produced
the application query in today's 14C run. Then pull the audit trail for our two known specimens: the surname-less
office bearer created 2026-08-27 (Create + Update), and the self-verified `tempId eba499877cad` on
`Nomfanelo_QA_NPO_2026-08-13` (the `SelfConfirm` step, which the plan flags as the strongest evidence either way).

📌 **One data point already in hand:** the application's audit query was run with
`includeEventsOnChildEntities=true` and returned **only** the three `NpoApplication` rows — no office-bearer events
surfaced as child events. That is suggestive but **not** conclusive, since the flag's behaviour is unverified. It
should not be quoted as a finding until the direct office-bearer query is run.

---

### ⬜ TC-02 — Resubmission diff (#101816 · TC-14-004) — not attempted
Out of scope for this run. It needs a resubmitted application, and its blocker is unrelated to the audit screen.

---

## What this changes for the suite

The 08-25 report said *"a single fix — make `entity-change-audit-log` supply the parameter its query requires —
converts TC-01, TC-03 and TC-04 from blocked to runnable in one go."* That is confirmed as the right diagnosis, but
the framing was too pessimistic: **the fix was never needed to test the cases**, only to use the feature. Two of the
three are verdicted today without it.

🔑 **The generalisable lesson.** *"The screen that shows X is broken"* is not the same as *"X cannot be observed."*
Twice this week a blocker rested on that conflation — here, and on the 14T Correspondence cross-check. Before
recording a case as blocked on a broken view, check whether the underlying data is reachable another way.

## Method notes
- Every audit read was a **read**. No entity was created, modified or deleted during this run.
- The entity type name was **discovered by probe and confirmed by a 200 with data**, not assumed — three candidate
  names returned 500 and were discarded. Only the positive result was used.
- View mode **Latest** throughout.

## ❓ Questions for Thabiso
1. `entity-change-audit-log` passes `entityId` and `entityTypeFullName` **empty**, so the audit screen has never
   been able to render. Was it ever wired to a source entity, or is it intended to be opened only from a record's
   own detail view?
2. Should audit entries carry a **comment**? The ADO expected result for #101815 names one, and the record has no
   such field.
3. Should a file-upload audit entry carry a **file hash**, as #107427 step 1 prescribes? Today it records the actor
   and the event but nothing identifying the file.
