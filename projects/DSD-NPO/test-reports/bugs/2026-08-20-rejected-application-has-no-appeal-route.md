# Bug: a Document-Verification reject lands on "Application Failed" (3), which is not appeal-eligible — no admin action can produce an appealable NPO

**Date:** 2026-08-20
**Severity:** **High** — the appeal right has no product-reachable trigger, and suite 11 cannot be executed.
**Area:** Admin portal → Document Verification → Reject; Public portal → NPO landing / Organisations
**Environment:** QA
**Found by:** driving APPL26-01494 (`4ec56d13-…`, NPO `db7d5cc6-…`) from registration through to a rejection
**Application:** **APPL26-01494** — ours, purpose-built for this, 3 office bearers, 1 marked non-compliant

> ### Scope — what is new here and what was already known
> The status-gating of the appeal route was **already established earlier on 2026-08-20** and is recorded in
> `test-reports/skipped-blocked-register.md` (suite 11 row): the **"Initiate Appeal" action does exist** — public
> portal profile dropdown → Organisations → the NPO → *Initiate Appeal*, form `npo-appeal-application`, with 26
> appeals already in the system — and it only appears when the NPO is **Cancelled (OrgStatus 7)** or **Not
> Registered (9)**.
>
> **This report does not re-discover that.** What it adds is the end-to-end confirmation, on a purpose-built
> application, that the **Document-Verification reject path produces "Application Failed" (status 3)** — so the one
> refusal outcome an assessor can actually reach is *not* appeal-eligible. That closes the last "maybe we just
> haven't produced the right refusal yet" possibility.

## Summary
I built an application specifically to reach an appeal-eligible state, submitted it, and rejected it as admin. Result:
**NPO Status "Application Failed"**, and the applicant's only available action is **"Submit Query"** — no *Initiate
Appeal*, consistent with the documented status gate, because status 3 is neither 7 nor 9.

Combined with what was already known, every route to an appealable NPO is now accounted for and all of them are shut:

| Route to OrgStatus 7 / 9 | State |
|---|---|
| Document-Verification **reject** | ❌ produces **3 (App Failed)** — confirmed here, end-to-end |
| Admin **"Cancel NPO"** action | ❌ no such action exists (`npo-details-view2` offers only "Invite to Organisation") |
| **Investigation** / compliance outcome → Cancelled (7) | ⛔ blocked — suite 12 intake broken, admin lifecycle unreachable |
| **Voluntary Deregistration** | ❌ yields **Deregistered (6)**, not Cancelled (7) |
| **"Not Registered" (9)** as a registration decision | ❌ never produced by any admin action we can find |

## Steps to reproduce
1. Public portal: register and submit an application with 3 office bearers (APPL26-01494 was used).
2. Admin portal → Workflow Inbox → the application (action required **Doc Verification**).
3. **OB Compliance** → *Are all office bearers compliant?* = **No**, select one office bearer, give a reason → Submit.
4. **Verification** → *Do you want to refuse/reject this application?* = **Yes**, fill **both** reason boxes (see
   `2026-08-20-unstarred-mandatory-fields-silently-gate-next-and-save.md` — the second is unstarred and gates the
   button) → **Reject** → confirm **Yes**.
5. Public portal → the NPO's landing view → **NPO Status: Application Failed**; Additional Actions: **Submit Query** only.
6. Profile menu → *Organistions* → select the NPO → same view, **no Initiate Appeal** (as expected given the gate).

## Expected
Needs a ruling (see questions), but one of:
- a refused registration should set the NPO to **Not Registered (9)** so the statutory appeal right is exercisable; or
- the appeal gate should include **Application Failed (3)**; or
- some admin action should exist that moves a failed application's NPO to an appealable status.

## Actual
Reject → status 3 → appeal action correctly hidden by its own gate → applicant has no route to challenge the decision,
and the admin **CRUDS → Appeals** queue has no product path feeding it from a registration refusal.

## What this still does NOT tell us
Whether *Initiate Appeal* and the downstream tribunal flow actually **work** — that needs an NPO at status 7 or 9,
which I cannot create. So suite 11 remains untested, not failed.

## Related
- `test-reports/skipped-blocked-register.md` — suite 11 row; this report is the evidence behind its "our refused apps
  sit at Application Failed (3), which does not qualify" statement.
- `2026-08-18-no-application-incomplete-first-reject-denies-outright.md` — same reject path; no resubmission cycle.
  Together: a single correctable error on a registration application is **terminal** for the applicant — no resubmit,
  no appeal, only "Submit Query".
- That bug's *secondary defect* (application and organisation records disagreeing on the outcome after a reject)
  applies here too.

## Impact
- **Suite 11 (Appeals) BLOCKED** — now with every alternative route ruled out rather than merely untried.
- An applicant refused registration has no route in the shipped UI to challenge the decision — a legal/fairness
  problem, not just a functional gap.

## Questions for the test lead (Thabiso)
1. **Which OrgStatus is a registration refusal meant to set?** If it should be 9 (Not Registered), this is a
   status-mapping bug in the reject action. If 3 is correct, the appeal gate is wrong.
2. **A seeded NPO at OrgStatus 7 or 9** (plus chairperson/tribunal users) is the single highest-value unblocker left —
   it is the only way to test appeals at all.

## Minor defects observed on the same screens
| What | Where |
|---|---|
| **"View NPO Profile"** link renders with an empty id (`public-npo-details-view?id=`) → dead link | Public NPO landing view |
| Profile menu item is spelt **"Organistions"** | Public portal header |
| Header's active-organisation label keeps showing the previously selected NPO after switching via *Organistions* | Public portal header |
| Org **mobile** number is echoed under a **"WhatsApp number"** label although WhatsApp was left blank, and again under "Cellphone Number" | Admin → Application Details → Organisation Details |
| **District** and **Metropolitan Municipality** blank although Metro was captured on the public form | Admin → Application Details → Organisation Details |
| Console error **"Failed to execute action 'shesha.common:Show Dialog', error: undefined"** on every modal save (objective, office bearer) — the save succeeds, so cosmetic, but it fires every time | Public portal registration wizard |
