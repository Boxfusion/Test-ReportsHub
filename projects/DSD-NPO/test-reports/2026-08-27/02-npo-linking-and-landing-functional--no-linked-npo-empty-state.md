# Report: NPO-02-F — NPO Linking & Landing (functional) — the no-linked-NPO empty state exists but is not where sign-in lands

**Date:** 2026-08-27 09:56 UTC
**Plan:** test-plans/npo-registration/02-npo-linking-and-landing-functional.md
**Execution Mode:** ai-mcp
**Result:** PARTIAL — the FDS Fig.9 empty-state page **exists and is correct**, carrying both the *Register a new NPO* and *Link to an Existing NPO* calls to action. But signing in with no linked NPO does **not** land there: the user is dropped on the generic Shesha framework page `Shesha.Workflow/workflows-inbox`, an empty "Incoming Items" grid. The Register CTA is still reachable from the top nav, so this is a routing defect rather than a dead end. No application data leaks.
**Duration:** ~360s
**Cases:** TC-05
**Environment:** QA · public portal · view mode Latest
**Accounts used:** `npo.qa.applicant.b@example.org` (Account B — ordinary applicant, no linked NPO at start of run)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 1 | 0 | 0 | 1 | 0 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-05 No linked NPO → empty-state dashboard | #101623 | ⚠️ PARTIAL | Empty-state page correct; sign-in routes to the Shesha workflows inbox instead |

## 🔑 This case was recorded "likely NOT EXECUTABLE" — it is now runnable

The plan's caveat was *"our shared account already has linked NPOs… needs a fresh account with no links"*. Account B,
self-registered on 2026-08-25, was still unlinked, so the case ran properly for the first time.

⚠️ **Account A is no longer usable for this case.** It now owns `Nomfanelo QA Test NPO 2026-08-13`
(`24aff906-…`) — picked up via the *Invite to Organisation* step of the 2026-08-26 appeals work. Signing in as A lands
on a **populated** `npo-landing-view`. Only B was clean. **B is now linked too** (see the closing note), so a future
re-run of this case needs a fresh sign-up.

## Per-case detail

### TC-05 — No linked NPO → empty-state page with CTA to Register/Link (#101623 · TC-02-008) — PARTIAL

**Step 1 — Sign in as Account B.**

Landed on `/dynamic/Shesha.Workflow/workflows-inbox`, rendering:

> Incoming Items — 0 items found · 10 / page · Export
> Ref No | Initiator | Type | Name | Action Required | Received Date | Target Date | Status | Period In Possession
> **No Data — No data is available for this table**

That is a **Shesha framework page**, not a DSD page. It exposes an `Export` button and a workflow-task grid to a
member of the public who has just signed up and has no NPO, no application and no workflow tasks.

**Assertion results**

| Assertion | Result | Evidence |
|---|---|---|
| Empty-state shown | ❌ **not as specified** | Landing target is `Shesha.Workflow/workflows-inbox`; the FDS Fig.9 page is `boxfusion.dsdnpo/no-existing-npo-landing-page` and is never routed to |
| Register/Link CTA present | ✅ **yes** | Top nav carries **Register NPO** → `/dynamic/boxfusion.dsdnpo/no-existing-npo-landing-page` |
| No data leaks | ✅ **yes** | Grid renders "No Data"; 0 rows |

**The empty-state page itself is correct.** Opened directly, `no-existing-npo-landing-page` (v7) renders exactly what
the FDS calls for:

> Hi NpoQaApplicant, Welcome to the DSD NPO Portal
> **What would you like to do?**
> You are currently not linked to any NPOs. Please link your existing NPO number or register a new one.
> **[ Register a new NPO ]** or **[ Link to an Existing NPO ]**

So the page is built, the copy matches, and both CTAs are present. Only the **post-login redirect** is wrong.

Verdict is **PARTIAL** rather than FAIL because the journey is not blocked — a user who notices the nav item reaches
the right page in one click. It is a discoverability defect, not an onboarding blocker.

## ⚠️ One near-miss worth recording as method

On first inspection the header nav appeared **completely empty** (`menu` element with zero children) — which would
have made this a hard blocker: a new user with no way to reach *Register NPO* at all. That was a **render-timing
artefact**. After a 3-second settle the nav populated with 4 items. Re-checking before concluding is what stopped a
false High-severity defect going out. The nav does differ between account states, and that difference is real:

| | Account A (linked) | Account B (unlinked) |
|---|---|---|
| Nav items | Dashboard · Register NPO · Education and Awareness · Contact Us · FAQs | Register NPO · Education and Awareness · Contact Us · FAQs |
| Landing route | `boxfusion.dsdnpo/npo-landing-view?id=…` | `Shesha.Workflow/workflows-inbox` |

No **Dashboard** item for the unlinked user — consistent, since there is nothing to show.

## Notes for the test lead

- The correct landing target already exists and is already linked from the nav. The fix looks like a one-line
  redirect change, not new UI.
- 📌 The `workflows-inbox` landing may be the same underlying cause as the standing **"every Workflows inbox renders
  empty"** question (`resume-dsd-npo-tomorrow`, item 2c). If unlinked users are being routed to the framework inbox
  by default, it is worth asking whether the DSD landing route is configured as the post-login destination at all.
- Question for Thabiso: should a public applicant see a Shesha workflow inbox with an `Export` button at any point?
  It is empty today, but it is a framework surface rather than a designed one.

## Records touched

Account B was used to drive the **Register a new NPO** CTA onward for the wizard cases in this session, and ended the
session owning application **APPL26-01570** (`be7125b8-…`). It is therefore no longer an unlinked account.
