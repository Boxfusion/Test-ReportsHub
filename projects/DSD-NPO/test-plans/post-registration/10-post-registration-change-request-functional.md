# Test Plan: NPO-10-F — Post Registration / Change Request (functional)

> **Status:** Imported from Azure DevOps 2026-08-18 — Change Request lifecycle. Submitter cases run on our registered NPO `333-019`; admin cases need a request to reach the admin queue.
> **Owner:** QA
> **Last Updated:** 2026-08-18
> **Estimated Duration:** 1200s

## Metadata
| Field | Value |
|-------|-------|
| App URL | Public: https://dsd-npo-publicportal-1-qa.shesha.app/login · Admin: https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543) |
| ADO Suites | 101894 *10P Submitter* (TC-10-003/004/005) · 101893 *10A Admin* (TC-10-010/011) |

## Objective
> Verify the post-registration Change Request lifecycle: the submitter cannot open a duplicate in-progress request of
> the same type, can cancel an unassigned request, and can cancel an assigned one; and on the admin side, Accept
> Changes approves + notifies, while Decline requires a reason.

## No overlap with the smoke plan
Smoke plans `10a-*`/`10p-*` own **TC-10-001/002/006/007/008/009**. This functional plan owns the other 5 — nothing
shared.

## Preconditions
- [ ] A **registered** NPO owned by our account — **`333-019-NPO`** (`Nomfanelo QA Annual NPO`).
- [ ] The Change Request entry point. Seen in suite 08 as a persistent **"Submit a Change Request instead?"** link that
      *"instantly creates a Post Registration draft"*; there may also be a dedicated Post-Registration/Manage option.
- [ ] For admin cases (010/011): a submitted change request in the admin queue, and the admin portal.

## Test Cases

### TC-01 — Cannot start a duplicate in-progress request of the same type (ADO #101764 · TC-10-003)
*P1 · Negative · Src:FDS · `Drift-Risk`.*
- **Steps:** 1. With a Change of type X in progress, try to initiate **another** Change of type X
- **Expected result:** *"System shows request history and blocks new initiation (FDS Post-Reg 7.1.1 rule 2 / 6.2)"*
- **Assertions:** [ ] (BLOCKING) the second same-type request is blocked · [ ] request history is shown
- **📌** Create the first request, then attempt a second of the same type. Record whether it blocks with a message or
  silently.

### TC-02 — Cancel an unassigned active request (ADO #101765 · TC-10-004)
*P2 · Positive · Src:FDS.*
- **Steps:** 1. Open request history → **Cancel** the unassigned request
- **Expected result:** *"Request cancelled; user can now create a new one"*
- **Assertions:** [ ] (BLOCKING) the request is cancelled · [ ] a new request of that type can then be created
- **📌** Confirms the TC-01 block clears once the in-progress request is cancelled — run it right after TC-01.

### TC-03 — Cancel an assigned request (ADO #101766 · TC-10-005)
*P3 · Edge · Src:FDS.* ⚠️ **Needs an admin to assign the request first.**
- **Steps:** 1. Cancel a request that has been **assigned** to an assessor
- **Expected result:** *"Per FDS Post-Reg 6.2 rule 3 — allowed; admin gets notified"*
- **Assertions:** [ ] cancel allowed on an assigned request · [ ] RECORD whether the admin is notified
- **⚠️** Getting a request into "assigned" state needs admin action; defer if assignment can't be reached.

### TC-04 — Admin Accept Changes approves + notifies (ADO #101771 · TC-10-010)
*P2 · Positive · Src:Both.* ⚠️ **Admin portal — needs a submitted request in the queue.**
- **Steps:** 1. On the admin request, click **Accept Changes**, confirm in the dialog
- **Expected result:** *"Approval recorded; user gets notification with outcome (FDS Post-Reg 8.3)"*
- **Assertions:** [ ] (BLOCKING) approval recorded · [ ] RECORD the user notification
- **🔑** Needs a submitted change request (from TC-01). Destructive — approves the request.

### TC-05 — Admin Decline requires a reason (ADO #101772 · TC-10-011)
*P1 · Negative · Src:FDS.*
- **Steps:** 1. Choose **Decline / 'Not Aligned'**, leave reason empty, submit → 2. Enter a reason and submit
- **Expected result:** *"Validation error"* → *"User receives the decline reason via email"*
- **Assertions:** [ ] (BLOCKING) decline without a reason is blocked · [ ] RECORD the decline-reason notification
- **📌** Test the reason-required gate (as with OB compliance / doc verification) — record disabled-button vs message.

## Coverage against ADO
| Plan case | ADO | TC id | P | Portal | Runnable? |
|---|---|---|---|---|---|
| TC-01 | #101764 | TC-10-003 | 1 | Public | ✅ yes (create a request first) |
| TC-02 | #101765 | TC-10-004 | 2 | Public | ✅ yes |
| TC-03 | #101766 | TC-10-005 | 3 | Public | ⚠️ needs admin assignment |
| TC-04 | #101771 | TC-10-010 | 2 | Admin | ⚠️ needs a submitted request |
| TC-05 | #101772 | TC-10-011 | 1 | Admin | ⚠️ needs a submitted request |

**5 cases owned.** Smoke counterparts: TC-10-001/002/006/007/008/009.

## Suggested run order
1. **TC-01** — create a change request on 333-019, attempt a duplicate → expect block.
2. **TC-02** — cancel the unassigned request; confirm a new one can then be created.
3. **TC-05 / TC-04** — switch to admin; test Decline-requires-reason, then Accept Changes (destructive last).
4. **TC-03** — only if a request can be moved to "assigned".

---

## ✅ Executed 2026-08-18 — 1 pass · 1 fail · 3 deferred
Report: `test-reports/2026-08-18/10-post-registration-change-request-functional--submitter.md`
Ran on registered NPO **333-019** (existing request POST1317).

| Case | Verdict | Note |
|---|---|---|
| TC-01 (TC-10-003) | ✅ PASS | duplicate blocked — Initiate disabled + history + banner |
| TC-02 (TC-10-004) | 🔴 FAIL | **no cancel/delete control anywhere** (`bugs/2026-08-18-change-request-cannot-be-cancelled-or-deleted.md`) |
| TC-03 (TC-10-005) | ⚪ DEFERRED | needs admin assignment |
| TC-04 (TC-10-010) | ⚪ DEFERRED | needs a submitted typed request |
| TC-05 (TC-10-011) | ⚪ DEFERRED | needs a submitted typed request |

🔑 Change Request = registered NPO landing → Post Registration → `portal-change-request-table`. The blocking POST1317 is
a typeless auto-draft from suite 08 that can't be cleared → TC-10-003's block is a dead-end.
