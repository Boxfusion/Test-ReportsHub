# Bug: an NPO cannot be cancelled at all — and the appeal-eligible state comes from **Decline**, not cancellation

**Date:** 2026-08-20
**Severity:** **High** — OrgStatus 7 (Cancelled) is unreachable by any means, and the one appeal-eligible state that
*is* modelled (9 Not Registered) sits behind the already-broken Incomplete/resubmission cycle.
**Area:** Admin portal → All NPOs → NPO detail (`npo-details-view2`); Document Verification outcomes; Investigations
**Environment:** QA
**Investigated on:** our own registered NPO **333-019-NPO** "Nomfanelo QA Annual NPO 2026-08-17"
(`4be65ab5-c421-4b22-a275-0a26ccd802f6`, OrgStatus **4 Registered**)

## Why this was investigated
An appeal requires the NPO at **OrgStatus 7 (Cancelled)** or **9 (Not Registered)**. Rejecting an application produces
**3 (App Failed)** — see `2026-08-20-rejected-application-has-no-appeal-route.md`. So the question became: how do you
**cancel** a registered NPO, as opposed to rejecting its application? Answer: **you can't**, and cancellation turns out
not to be the route we actually need.

## Finding 1 — cancellation is modelled in the data but has no action in the UI
The `NpoOrganisation` entity carries three cancellation fields:

| Field | On our registered NPO 333-019 |
|---|---|
| `canBeCancelled` | **true** |
| `dateCancelled` | null |
| `formOfCancellation` | null |

So the product explicitly flags this NPO as **cancellable** — and yet its admin detail view
(`npo-details-view2`) exposes exactly **one** action: **"Invite to Organisation"**. There is no Cancel, Revoke,
Terminate, Suspend or Withdraw action, on any of its 15 tabs (Organisation Details · Admin and Operations · Objectives ·
Office Bearers · Control Structure · Areas of Operation · Documents · Authorised User · Application · Annual
Compliance · Appeals · Post Registration · Voluntary Deregistration · Investigations · Cases).

⚠️ This confirms the earlier note that "npo-details-view2 offers only Invite to Organisation" — but it now confirms it
**on a Registered NPO that the data says can be cancelled**, which is the case that matters. It is not a
status-conditional action that we were simply looking for on the wrong record.

## Finding 2 — OrgStatus 7 has never been used, though ~37 600 NPOs record a cancellation
Counts across the whole QA database:

| OrgStatus | Count |
|---|---|
| 4 Registered | 62 543 |
| 5 Outstanding Report | **0** |
| **7 Cancelled** | **0** |
| 8 Appealed Npo | **0** |
| **9 Not Registered** | **3** |

Yet **37 623 NPOs have `dateCancelled` set** and **37 621 have `formOfCancellation` set** — historical/migrated
cancellations recorded in the data while **no NPO carries status 7**. So even the legacy cancelled population would not
satisfy the appeal gate. Either the migration mapped cancelled NPOs onto Deregistered (6), or status 7 is simply dead.
**This needs a ruling — it is a data-semantics problem, not just a missing button.**

## Finding 3 🔑 — the appeal-eligible state comes from **Decline**, and Decline sits behind the Incomplete cycle
This is the useful part. All **3** NPOs at status **9 (Not Registered)** — the only appeal-eligible records in the
system — are dev-created test records ("Test Unsuccessful 03", "Decline NPO Validation", "Test Unsuccessful Letter 01",
created 5–7 Aug by users 3230/15932). Tracing their applications:

- Every one of them has a **`documentVerificationDeclineComment`** — i.e. they went through the **Decline** button in
  Document Verification, **not** Reject.
- By contrast our freshly-rejected APPL26-01494 has `rejectionReason` set, **no** decline comment, and its NPO sits at
  **3 (App Failed)**.
- Querying every application that has ever been declined (`documentVerificationDeclineComment != null`) returns **8
  records — and all 8 also have `incompletenessLetterFile` set.** 8/8. `numOfResubmissions` is null on all of them.

So the intended sequence is:

```
Document Verification finds a problem
  → Letter of Incompleteness  ("Application Incomplete")
    → [resubmission cycle]
      → Decline  → application Unsuccessful (7) → NPO Not Registered (9) → APPEAL AVAILABLE
```

and the sequence we can actually execute is:

```
Document Verification → Reject → NPO Application Failed (3) → no appeal, ever
```

**`Decline` never enables in any combination we have tried, and the "Application Incomplete" outcome does not exist in
this build** (`2026-08-18-no-application-incomplete-first-reject-denies-outright.md`). Those are the same blocker seen
from two directions: **because Incomplete is unreachable, Decline is unreachable, so status 9 is unreachable, so
appeals cannot be tested.**

## What this changes for us
▶ **Stop trying to cancel an NPO — chase `Decline` instead.** The unblocker for suite 11 is no longer "seed an NPO at
status 7 or 9" as a first resort; it is **fix or expose the Incomplete → Decline path**, which also fixes the
substantive 08-18 fairness defect (an applicant currently gets no chance to correct a document error). A seeded
status-9 NPO remains a valid fallback for testing the appeal *form* itself.

▶ The 3 existing status-9 NPOs are appeal-eligible **but not ours** — they belong to other users, and an appeal is
initiated by the NPO's own portal user (profile → Organisations → the NPO → Initiate Appeal). Being linked to one of
them (or having one transferred to our account) would unblock the appeal-form tests **without any code fix**. That is
probably the cheapest unblocker available and is worth asking for directly.

## Expected
- A registered NPO flagged `canBeCancelled = true` should have a cancellation action somewhere in the admin UI, and
  cancelling it should set OrgStatus **7** — otherwise the flag, the two cancellation fields, status 7, status 8
  (Appealed Npo) and the cancellation branch of the appeal feature are all dead code.
- Cancellation should be reachable as an **Investigation / non-compliance outcome** per the NPO Act. Our own
  investigation `INV1283/13/08/2026` (NPO 333-018, case type *Non-Compliance to NPO Act*) sits at **"Awaiting
  Investigation Outcome"** with **no workflow task and no outcome action anywhere** — so that route is dead too.

## Actual
No cancel action exists; status 7 has never been set on any of 62 543+ NPOs; the investigation that should produce a
cancellation has no actionable outcome step.

## Steps to reproduce
1. Admin portal → open a **Registered** NPO's detail view: `/dynamic/boxfusion.dsdnpo/npo-details-view2?id=<npoId>`
   (used 333-019, `canBeCancelled = true`).
2. Inspect every tab and the action bar → the only action is **"Invite to Organisation"**.
3. CRUDS → **Investigation** → open `INV1283/13/08/2026` → status *Awaiting Investigation Outcome*, buttons are only
   **Save** (disabled) and **Download Zip**; no outcome action. Searching the Workflow Inbox for `INV1283` returns
   **0 items**, so there is no task carrying the outcome either.

## Questions for the test lead (Thabiso)
1. **Is NPO cancellation in scope for this build at all?** If yes, where is the action meant to live — Investigation
   outcome, All NPOs detail, or a dedicated screen?
2. **Why do ~37 600 NPOs have `dateCancelled`/`formOfCancellation` but none have OrgStatus 7?** Did the migration map
   cancelled NPOs to Deregistered (6)? If so, the appeal gate on 7 will never fire for historical records.
3. **What is `Decline` meant to require?** It is the only route to the appeal-eligible status 9 and it has never
   enabled for us. Confirming its precondition would unblock suite 11 immediately.
4. **Can we be linked to one of the 3 existing status-9 NPOs** (or have one moved to our portal account)? That would
   let us test the appeal form itself without waiting for any fix.

## Side observations
- Admin **All NPOs** (`/npos`) and **Annual Compliance** (`/annual-compliance`) grids never finish loading — they sit
  on `loading...` indefinitely, even with a quick-search filter applied. Both are effectively unusable.
- The **Workflow Inbox** renders its pager ("1-10 of 2480 items") but **no rows** when unfiltered; rows appear only
  once a narrow quick-search is applied. This is the previously "unconfirmed" empty-inbox note — it is a rendering
  fault, not an empty inbox.
- A boolean equality filter on the NPO entity (`canBeCancelled == true`) returns **HTTP 500**, while
  `!= null` filters on the same entity work.
