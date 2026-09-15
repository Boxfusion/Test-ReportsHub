# Report: NPO-14C — Access control — role-scoped accounts built, and TC-06 is now conclusive

**Date:** 2026-08-26 05:45 UTC
**Plan:** test-plans/cross-cutting/14c-session-access-control-functional.md
**Execution Mode:** ai-repair
**Result:** PARTIAL — the role blocker that has stood across three sessions is **retired**: QA can create role-scoped accounts without an administrator. Two were built. With a properly restricted account, **11A TC-06's FAILED verdict is confirmed** and its caveat removed — but the picture is more precise than *"no granular restriction"*: **the menu and most routes are enforced; the tribunal views are not.**
**Duration:** ~1200s
**Cases:** none newly verdicted — see the coverage note at the foot of this report
**Environment:** QA · admin portal · view mode Latest · new accounts C (15946) and D (15947)
**Accounts used:** `mpenduloizwelinuk@gmail.com` (to create) · `npo.qa.staff.c@example.org` · `npo.qa.clerk.d@example.org`

## 🔑 No administrator was ever needed
Every session since 08-18 has carried a *"still to request from an administrator"* list — `Appeal Tribunal Member`,
`Dsd.Npo.Registry Clerk` without `Authorised Admin`, and `Annual Compliance Quality Assurer`. All three are
self-serviceable:

**Administration → User Management → `Register New User`** (First/Last/Mobile/Email/**Type**/Username/Password;
Type = `Internal` · `Office Bearer` · `Public Portal User`) → then the user's own detail page carries **`Assign Role`**,
whose dropdown offers **all 46 roles** with no restriction.

Two accounts were created and assigned in minutes. Full credentials and the standing warnings are in
`test-data/qa-accounts.md`.

| | Account C (15946) | Account D (15947) |
|---|---|---|
| Roles | `Annual Compliance Quality Assurer` + `Appeal Tribunal Member` | **`Dsd.Npo.Registry Clerk` only** |
| `Authorised Admin` | No | No |
| Purpose | suite 09, tribunal cases | **the TC-06 negative control** |

⚠️ Neither account A nor B was touched — both must stay *ordinary* users or suite 14Z Class B (IDOR) becomes
meaningless.

## What access control actually does

### ✅ The navigation menu is role-scoped
| Account | Menu rendered |
|---|---|
| Shared dev login (`Authorised Admin`) | Dashboards · Reports · Spartial Map · CRM · All NPOs · Workflows · CRUDS · Education and Awareness · Administration · Configurations |
| **Account C** | **Dashboards · Reports · All NPOs · Workflows** |

No CRUDS, no Administration, no Configurations. Menu-level scoping works.

### ✅ Route authorisation is real — for some areas
Account C, by direct URL, on `boxfusion.dsdnpo/user-management-table`:

> **403** — *"Sorry, you are not authorized to access this page."*

A clean, correct denial. So the app **does** enforce at the route level.

### 🔴 But the tribunal views are not enforced — TC-06 confirmed
Account **D** holds `Dsd.Npo.Registry Clerk` and nothing else — no tribunal role, no `Authorised Admin`, and no
Appeals entry in its menu. By direct URL:

| Tribunal view | Result for account D |
|---|---|
| `boxfusion.dsdnpo/appeal-outcome` v20 | **Renders** — *"Appeal Result: Upheld / Denied / Approve"* + Claim Document. **No 403.** |
| `boxfusion.dsdnpo/forward-arbitration-tribunal` v16 | **Renders** — *"Please select all members of the tribunal"*, board-member select, Comments, **Save**. **No 403.** |

**This removes the caveat the 08-25 run had to carry.** That run stated plainly that the shared account was *"a proxy
for 'an admin who should not see this', not a genuinely role-scoped account"*, and asked for a scoped account to make
the result conclusive. It now is: a restricted clerk reaches the appeal **decision control**.

**🔑 And the role definitions settle it beyond the menu evidence.** Read from `ShaRole`:

| Role | `permissions` |
|---|---|
| **`Dsd.Npo.Registry Clerk`** (account D) | **`[]` — empty** |
| `Appeal Tribunal Member` | `Appeal-Outcome`, `tribunal.view`, `NPO-Details-View`, `Appeal-tribunal-member` |

The clerk role is described as *"Responsible for registering all physical mail receipts… logs receipts of new
applications, financial reports, change requests"* — no appeals remit, and **no permissions whatsoever**.

So the named tribunal permissions **exist and are attached to the tribunal role**, account D holds **none** of them,
and the decision form still opens. This is not an absent permission model — it is a form that never checks the model
it has. ⚠️ Verified after the fact because the original finding rested only on what the navigation rendered; see
`../audits/2026-08-26-reverification-of-three-uncertain-conclusions.md`.

**🔴 Thabiso's drift note is confirmed exactly** — *"tribunal access via `[AbpAuthorize]` only; no granular
tribunal-view restriction found."* The contrast with the clean 403 on `user-management-table` shows this is not a
missing capability but a missing declaration on these particular forms.

⚠️ **The 08-25 phrasing should be narrowed, not repeated.** *"Every tribunal-only view opens for a non-tribunal
admin"* was measured with an `Authorised Admin` and read as though nothing anywhere is restricted. That is not the
case — most of the portal is scoped correctly. The accurate claim is: **the tribunal forms specifically carry no
role restriction.**

## 🔴 Suite 09 — RETRACTED: it is NOT blocked

> ⚠️ **This section replaces an earlier version of this report that claimed suite 09 was blocked by a missing
> workflow task. That claim was wrong and is retracted.** Full re-verification:
> `../audits/2026-08-26-reverification-of-three-uncertain-conclusions.md`.

The original claim rested on opening `annual-compliance-quality-assure` by **direct URL** and finding it inert. Two
faults in that evidence:

1. **Wrong entry point.** The form belongs to a workflow and is reached through
   `/shesha/workflow-action?id=<workflowInstanceId>&todoid=<todoItemId>` → the **Quality Assurance** action.
2. **Wrong specimen.** The submission used was at **`Status = 3`**, and `Status` here is Shesha's `WorkflowStatus`
   (1 Draft · 2 In Progress · **3 Completed** · 4 Cancelled · 5 Suspended). Its workflow had already finished, so
   disabled controls were correct behaviour.

**Re-tested properly** on `28f3a797-…` (`Status = 2`, In Progress, `ANN2119/17/08/2026` on `333-019-NPO`):

| Signal | Direct URL | Via workflow-action + `todoid` |
|---|---|---|
| Yes / No radios | disabled | **enabled** |
| Editable inputs | 0 | **3** |
| Approve | disabled | **enabled once "Yes" is selected** |

The tasks existed all along — **49** `Quality Assurance` tasks at activity `Activity_0gtemvi`, and **20** open todo
items on that submission alone.

**And the role makes no difference to reaching it.** Account **C** (`Annual Compliance Quality Assurer`, no
`Authorised Admin`) gets an **identical** fully-enabled modal to the privileged admin.

### What does survive
**The Workflows inbox renders empty** for both the shared admin and account C, despite those tasks existing. So the
QA queue is unreachable *through the inbox* — which is how a real assurer would find their work. That is a genuine
finding, and it is a different and much narrower one than "suite 09 is blocked".

▶ **Suite 09's three cases are runnable.** They should be scheduled, not waited on.

## Coverage note
This run produces **no new countable verdicts against the 314-case functional plan.** 11A TC-06 was already recorded
FAILED on 08-25; this confirms it and removes its caveat. Suite 09 is **not** blocked — see the retraction above; its three cases are runnable. Reported per `report-the-conservative-coverage-number`.

## Questions for Thabiso
- Should the tribunal forms (`appeal-outcome`, `forward-arbitration-tribunal`, `notice-of-tribunal`) carry a role
  restriction? Every other area we tested does.
- **Should QA be able to create internal users and self-assign all 46 roles**, including `Authorised Admin`? That is
  the current behaviour of User Management for a broadly-privileged account, and it is how today's blocker was
  cleared. Flagging it rather than assuming it is intended — **routing to you, not into the daily report.**
- **Why is the Workflows inbox empty for every account we hold when 80 054 todo items exist?** The annual-compliance
  QA queue alone holds 49 tasks and none of them surface. Work is reachable only if you already know the workflow
  instance and todo ids — which no real user does.
