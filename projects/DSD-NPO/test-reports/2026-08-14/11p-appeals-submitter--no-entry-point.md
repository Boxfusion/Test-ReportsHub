# Report: Appeals 11P — Submitter

**Date:** 2026-08-14 07:32 UTC
**Plan:** test-plans/appeals/11p-appeals-submitter.md
**Spec:** test-plans/appeals/11p-appeals-submitter.spec.ts
**Execution Mode:** ai-repair
**Result:** BLOCKED — the precondition is satisfied, but no submitter route to lodge an appeal could be found
**Duration:** ~360s
**Cases:** TC-11-001, TC-11-005
**Environment:** QA · public portal · view mode **Latest**
**Denied application under test:** APPL26-01106 (`QA Smoke NPO 2026-08-14`), `APPLICATION UNSUCCESSFUL` on admin /
`APPLICATION FAILED` on the public portal

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 6 | 1 | 0 | 5 |

## Step Results

### TC-01 — Initiate an appeal of type 'Refusal to Register' from a denied application (ADO #101773 · TC-11-001)
**Mode:** ai-repair
**Duration:** ~360s

- [PASS] **The precondition is genuinely met for the first time.** We created, submitted and had refused an
  application of our own: `APPL26-01106` reads `APPLICATION UNSUCCESSFUL` on admin, NPO `status: 3`, no NPO number,
  no registration date. The suite is no longer blocked for want of a denied application.
- [SKIPPED] **(BLOCKING)** Initiate an appeal — **no entry point found.** Three submitter surfaces were checked:

| Surface | URL | Appeal action? |
|---|---|---|
| NPO landing view | `npo-landing-view?id=ae7257cf…` | **No** — *Additional Actions* offers only **`Submit Query`** |
| Public NPO profile | `public-npo-details-view?id=ae7257cf…` | **No** — read-only; 9 tabs, no action buttons |
| Public workflow inbox | `Shesha.Workflow/workflows-inbox` | **No** appeal task for this application |

  The landing view's own action panel reads *"All Done! You're all caught up, there's no new actions."* on a freshly
  refused application — so the portal does not present the refusal as something the applicant can respond to.
- [SKIPPED] Remaining assertions.

### TC-02 — Submit an appeal with the required fields (ADO #101777 · TC-11-005)
**Mode:** not executed
- [SKIPPED] All assertions — depends on TC-11-001.

## What is and is not established

**Established:** the refusal itself works end to end, and the refusal **notification is raised** — an
`Registration Application Unsuccessful` email to two recipients (status 1, Sent) plus two SMS attempts (status 8,
Failed — *Vodacom out of credit*). So the applicant is told the outcome.

**Not established:** whether the notification carries an appeal link. Emailed action links are a real pattern in this
module — office-bearer self-confirmation works exactly that way — so an appeal link in the refusal email remains the
most likely route and is the open question. **Confirm the email body before concluding the capability is absent.**

**Not a defect claim.** An appeal register exists and is populated (26 appeals, 16 of type `Refusal To Register`), so
appeals plainly get created somehow in this system — by staff on the applicant's behalf, by a route we have not
found, or by an emailed link. Recording this as a **question**, not a missing feature.

## Consequence for suite 11A
TC-11-008 (*Send to Chairperson*) and TC-11-012 (*tribunal Upheld outcome*) are blocked behind this case: both need
an appeal we own, and every appeal in the register belongs to another tester. See the 11A report.

## Questions for the test lead (Thabiso)
1. **Does the `Registration Application Unsuccessful` email contain an appeal link?** If yes, TC-11-001 and TC-11-005
   are runnable today and the plan's preconditions should name the email as the entry point.
2. **If not, how does an applicant appeal a refusal?** ADO #101773 is written from the submitter's point of view
   (*"Initiate an appeal … from a denied application"*), which implies a portal action that does not exist in this
   build. Either the build is missing it or the case needs rewriting — worth deciding which.
3. **Is there a time bar on appealing?** Relevant to whether the action should appear on the landing page
   permanently or only for a window after refusal.
