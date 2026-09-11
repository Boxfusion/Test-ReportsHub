# Report: NPO-07-F — Triage / OB Compliance (functional) — 'OB Failed Compliance' is set correctly, the resubmission notification is not sent

**Date:** 2026-08-27 11:06 UTC
**Plan:** test-plans/application-processing/07-triage-ob-compliance-doc-verification-functional.md
**Execution Mode:** ai-mcp
**Result:** PARTIAL — the blocking assertion **PASSES**: marking all three office bearers non-compliant with a reason moves the application to **OB Failed Compliance**, and the stored `applicationStatus` is **10**, exactly the RefList value the case prescribes. `OB Compliance` then correctly disables and `Verification` unlocks. The second, non-blocking assertion is recorded as a **negative**: no resubmission notification was created. FDS 8.4 rule 2b calls for a resubmission email; the notification store gained nothing after the transition.
**Duration:** ~1500s
**Cases:** TC-03
**Environment:** QA · admin portal · `boxfusion.dsdnpo/office-bearer-compliance` v27 (LIVE) · view mode Latest · opened via the inbox's own `workflow-action?id=…&todoid=…` link
**Accounts used:** `mpenduloizwelinuk@gmail.com` (shared admin)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 1 | 0 | 0 | 1 | 0 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-03 All OBs non-compliant → 'OB Failed Compliance' | #101718 | ⚠️ PARTIAL | Status transition correct (`applicationStatus` 10); **no resubmission notification created** |

## 🔑 Specimen — our own application, not APPL26-01270

The plan targets `APPL26-01270` and warns the case is **destructive**. Rather than terminate that record's path, this
run used **`APPL26-01570`** — the application **we submitted ourselves earlier today** (Account B, 3 office bearers,
`Npo.Application` id `6c02e52c-6799-4180-8b5c-9b84a5884aa4`). APPL26-01270 is untouched and still available for
TC-02/TC-04/TC-09.

## Per-case detail

### TC-03 — All OBs non-compliant → 'OB Failed Compliance' (#101718 · TC-07-008) — PARTIAL

**Step 1 — mark all OBs Non-Compliant with reasons, Submit.**

The `Office Bearer Compliance` dialog asks *"Are all office bearers compliant?"* (Yes/No). Answering **No** reveals a
multi-select of office bearers and a free-text reason. All three were selected:

```
Johannes                 ← note the trailing space; this is the empty-surname record
Pieter van der Merwe
Siobhan O'Brien
```

Reason (85 chars, within the ≤100 automation limit):
`QA TC-07-008: all three OBs marked non-compliant to test OB Failed Compliance status.`

`Submit` was disabled until **both** the office-bearer selection and the reason were supplied — validation gates
correctly in this dialog, unlike several others in this build.

**Assertion results**

| Assertion | Result | Evidence |
|---|---|---|
| (BLOCKING) status becomes OB Failed Compliance | ✅ **PASS** | Header chip changed to `OB FAILED COMPLIANCE`; `applicationStatus` = **10** read back from `Npo.Application` |
| RECORD whether the resubmission notification is created | ❌ **not created** | 0 rows in `NotificationMessage` after the transition |

#### The status transition is clean

Read back from the entity, not the screen:

```json
{ "id": "6c02e52c-…", "applicationStatus": 10, "numOfResubmissions": null,
  "npo": { "id": "be7125b8-…", "name": "NpoQa Bravo Wizard Test 2026-08-27", "status": 1 } }
```

`applicationStatus: 10` matches the case's prescribed *"RefList=10"* exactly. Alongside it:

- `OB Compliance` became **disabled**
- `Verification` became **enabled**

which independently re-confirms the suite's starting knowledge that *"OB Compliance must run before Verification"*.

📌 `numOfResubmissions` stays **null** rather than incrementing. The case does not assert on it, so this is recorded,
not raised — but if the resubmission path is meant to be counted, that counter is not being touched.

#### The resubmission notification was not created — and the query was validated first

Submit landed at ~11:05 UTC. Querying `Shesha.Domain.NotificationMessage`:

| Query | Result |
|---|---|
| `creationTime >= 2026-08-27T10:50` | **0 rows** |
| `creationTime >= 2026-08-27T00:00` (control) | 356→**108 rows**, latest at **10:24:33** |
| no filter (control) | **24 000 rows** |

The two controls matter: they prove the query shape works and the store is being written to today, so the zero is a
**real negative**, not a broken query. Nothing at all was written to the notification store in the window after the
status change.

⚠️ One sub-check was **inconclusive** and should not be quoted: a `like` filter on `message` for the NPO's name
returned no `totalCount`, so I cannot say whether *any* notification has ever referenced this NPO. Only the
time-window result above is evidence.

## Two observations from reaching this case

### 🔑 The Workflows inbox is NOT empty — the standing claim needs narrowing

The long-running open question (*"80 054 todo items exist, yet every inbox we hold renders empty, so no user can find
their queue"*) is **not true for the shared admin account on the admin portal**. `Shesha.Workflow/workflows-inbox`
rendered **1-10 of 2 476 items**, correctly populated, with APPL26-01570 at row 1:

```
APPL26-01570 | NpoQaApplicant BravoTest | Registration Process |
NpoQa Bravo Wizard Test 2026-08-27 | Doc Verification | 27/08/2026 | In Progress | 37 minute(s) ago
```

Each row's first cell links to `/shesha/workflow-action?id=<instance>&todoid=<todo>` — which is exactly the entry
point the standing rule requires, and it is available through the UI without guessing. **The empty inboxes previously
observed were the applicant-side accounts (A/B on the public portal), not the admin inbox.** The question for Thabiso
should be re-scoped to the applicant portal, not withdrawn.

### 🔴 All Applications renders no data in 7 of its 8 columns — and it is a data problem

Reaching the case surfaced this. `boxfusion.dsdnpo/npoapplication` v28 claims **1-10 of 10 349 items**, but every
column except `Date Received` is blank. It is **not** a rendering fault — the grid's own request returns nulls:

```
GET /api/services/app/Entities/GetAll?entityType=Npo.Application
    &properties=npo { applicationRef name whatsappNumber emailAddress type numberOfOfficeBearers }
                applicationStatus numOfResubmissions creationTime id
→ 200, and every one of the 10 items comes back "npo": null, "applicationStatus": 0
```

All the visible columns are projected through `npo { … }`, so a null `npo` blanks the whole row. Our own
APPL26-01570 has a **non-null** `npo`, so this is not universal — but the default page of the register is entirely
orphaned rows.

⚠️ **This corrects my own TC-07-020 report from earlier today**, which said the register "renders with `Email Address`
and `Whatsapp Number` columns" and treated that as a POPIA exposure. The column *headers* exist; the **values do
not**. Correction applied in that report.

📌 Also on that grid: the `Date Received` header toggles to `sorted-desc` but the row order does not change — sorting
is ignored, consistent with the known Shesha behaviour. And `applicationRef` is stored as **`" APPL26-01570"` with a
leading space**, which is worth cleaning up and may defeat exact-match searches.

## Notes for the test lead

- The status machinery works. The gap is the notification, which is the part FDS 8.4 rule 2b actually promises the
  applicant — without it, an NPO whose office bearers all failed compliance is never told to resubmit.
- Question: should `numOfResubmissions` increment on entering OB Failed Compliance, or only on an actual resubmission?
- The 10 349 orphaned `npo: null` application rows are worth a question of their own — they make the primary admin
  register unusable at a glance, whatever their cause.
