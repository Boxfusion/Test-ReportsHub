# Report: TC-20 — Review and Approve: Disapprove (NEGATIVE) — retest → ✅ RESOLVED

> # ⚠️ OUTCOME REVERSED — read this first (2026-08-03, later the same day)
> The two passes below concluded **BLOCKED**. **That conclusion is superseded: Disapprove WORKS.**
> Verified in **both** view modes — **Live** (REF2026-1106, the same tender that hung 3× minutes earlier) and
> **Latest** (fresh REF2026-0855). Both are now **Declined**.
>
> **Final result for TC-20: PASSED, with one sub-assertion failing** (the initiator cannot see the reason).
> See "Pass 3" and "Pass 4" at the end.
>
> **⚠️ An intermediate "Live works / Latest hangs" conclusion was also WRONG and is retracted.** Pass 4 shows
> Latest working, with the **identical form-config `md5`** to the run that hung — same content, same view mode,
> opposite outcomes.
>
> **The cause of the original 5/5 hang was never identified.** Eliminated: the `Metadata … 404` (fires in
> successful runs too), tender data/age, form version, and view mode. Leading unproven hypothesis: the degraded
> network in that window. The bug doc stays **OPEN as not-reproducible**.
**Date:** 2026-08-03 09:24 UTC
**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Cases:** TC-20
**Spec:** *not encoded* — TC-20 is deliberately kept out of the spec so a blocked decision cannot turn the
demo-ready happy-path suite red. Driven live via Playwright MCP.
**Execution Mode:** ai-driven (MCP browser, headless)
**Result:** PARTIAL — **Disapprove WORKS** (see the outcome-reversal banner above; passes 1–2 concluded BLOCKED and
are superseded by passes 3–4, verified in **both** view modes). One sub-assertion still fails: the initiator
cannot see the disapproval reason. The original 5/5 hang was never reproduced and its bug doc stays **OPEN as
not-reproducible**.
**Duration:** ~110s (pass 1) + ~150s (pass 2, incl. fresh-tender creation)
**Tenders:** **REF2026-1106** (parked 2026-07-30) and **REF2026-0843** (created fresh 2026-08-03)
**Role:** Reviewer — MhlotiM / 123qwe, view mode **Latest**

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 9 | 3 | 1 (BLOCKING) | 5 (unreachable) |

**Disapprove is still completely non-functional — unchanged from 2026-07-30. Reproduction now 4/4.**
The purpose of this run was to check whether dev had repointed the `tender-reason for disapproval` form.
They have not.

## Step Results

### TC-20 — Disapprove
**Mode:** ai-driven (MCP)

- [PASS] Signed in as MhlotiM and switched view mode to **Latest**
- [PASS] Opened REF2026-1106 from Workflows → Inbox at **Review and Approve Tender Details**
  (status *Submitted*, "Received from Maand-awe Mamathuntsha 4 days ago" — untouched since being parked)
- [PASS] (BLOCKING) All three decisions are offered: **Approve**, **Disapprove**, and footer **Send Back**;
  **Submit** correctly disabled
- [FAIL] **(BLOCKING) Clicking Disapprove does not open the reason-for-disapproval form.** The button
  switches to `loading Disapprove` and stays spinning — waited **45+ s**. No dialog, no toast, no validation
  message, no modal in the DOM.
- [SKIP] Capture the mandatory disapproval reason — *unreachable*
- [SKIP] Commit the decision — *unreachable*
- [SKIP] Assert the tender leaves the reviewer's Inbox — *unreachable*
- [SKIP] Establish whether Disapprove is terminal or a rework loop — *unreachable*
- [SKIP] Assert the resulting status — *unreachable*

## Evidence

Network on the click — the same two requests as 2026-07-30, ending in the same 404:
```
[GET] /api/services/Shesha/FormConfiguration/GetByName
        ?name=tender-reason%20for%20disapproval&module=Shesha.SupplyChainManagement  → 200 OK
[GET] /api/services/app/Metadata/Get
        ?container=Boxfusion.BidManagement.Domain.Tenders.Tender                     → 404 Not Found
```

**No workflow call is ever made.** The only POST in the entire session is the framework's
`EntityConfig/SyncClientApi`, fired *before* the click. Nothing after the 404.

Console:
```
Failed to load resource: 404 (Not Found)
  …/Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender
Failed to fetch metadata of type "Boxfusion.BidManagement.Domain.Tenders.Tender"
  AxiosError: Request failed with status code 404
    at Bv.getMetadata → b7.applyFormSettingsAsync → b7.loadFormByIdAsync → b7.initByFormId
```

## Post-condition — retest data preserved

The Inbox was reloaded after the attempt: **REF2026-1106 is still at *Review and Approve Tender Details*,
status *Submitted*, on the same `todoid`.** Nothing was written, nothing corrupted. It remains available for
the next retest, as does REF2026-1110.

## Scope widened — the stale namespace is not confined to the broken form

The same failing lookup fires **three times on page load** on **Capture Functionality Scores**
(`tender-wf-capturefunctionalityscores`, TC-09):

```
[GET] /Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender → 404   (×3)
```

Evidence: Playwright trace from the 2026-08-03 80/20 chain run. **That page renders and works normally**, so
this is not a third dead decision — but it shows the stale
`Boxfusion.BidManagement.Domain.Tenders.Tender` binding is referenced from **healthy** form configurations
too. Dev should grep every form config for `Boxfusion.BidManagement.Domain.*` rather than fixing one form.
(Also still open from 2026-07-30: `Boxfusion.BidManagement.Domain.Domain.TenderEvaluations.EvaluationPanelMember`
— note the doubled `.Domain.` — also 404s.)

## Not covered by this run

**"Bid is non-responsive"** (*BEC: Finalise recommendation*, TC-26) was **not** re-driven — no tender is
currently parked at that stage in the no-qualifying-bid state. It loads the same form and 404s on the same
container, so it is almost certainly still dead, but **that is an inference from the shared form, not a fresh
observation.** Retest both together once the binding is fixed.

## Note on other tenders at this stage

**REF2026-0968 "testing BID is non responsive"** also sits at Review and Approve in the same Inbox. It was
created by the manual tester — **not ours, do not action it.**

## Pass 2 — reproduced on a brand-new tender (2026-08-03, ~09:29 UTC)

Pass 1 reused a tender parked four days earlier, which left two alternative explanations open: the defect
could be specific to older data, or to a stale cached form on that browser profile. **Both are now excluded.**

A fresh tender was built from scratch — `EVAL_CRITERIA=80/20 --grep "TC-01" --no-report`, passing in **36.6 s**
→ **REF2026-0843**. It was then opened in a **new browser session** as MhlotiM (view mode already **Latest**)
while the item still read *"Received from Maand-awe Mamathuntsha **a minute ago**"*.

- [PASS] Fresh tender created and submitted; lands in MhlotiM's Inbox at **Review and Approve Tender Details**
- [PASS] All three decisions render; **Submit** disabled
- [FAIL] **(BLOCKING) Disapprove → `loading Disapprove`, still spinning after 30+ s.** No dialog, no modal,
  no message. Same two requests, same terminal `Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender`
  **404**. Same console throw chain. Only POST is the framework's `EntityConfig/SyncClientApi`, pre-click.
- [PASS] REF2026-0843 unchanged afterwards — still at Review and Approve, dated 03/08/2026, same `todoid`

**Stale client cache specifically ruled out.** The two sessions today sent *different* cached hashes for the
same form: pass 1 `md5=ED0CCFC577B26994939F7519DD2F7B1E` → **200** ("your copy is stale, here's the current
one"); pass 2 `md5=53F860F0DC3722155BE873A894ED4D63` → **304** ("your copy IS current"). The
server-authoritative current version of `tender-reason for disapproval` is the one bound to the missing
container. It is a server-side form-configuration defect.

**Reproducibility is now 5/5 across three independent tenders over two build days**, one of them minutes old.

## Conclusion

No progress since 2026-07-30, and the fresh-tender pass removes every remaining "maybe it's the data"
explanation. Tender age, tender data and client caching have **no bearing** — the fix is entirely in the form's
model binding.

The expected behaviour of Disapprove — terminal rejection vs rework loop, whether the reason is mandatory,
whether the initiator sees it — **remains unknowable until the form loads**. Plan TC-20 steps 6–9 stay
provisional. This is a **dev blocker to raise before the demo**: it is one of only three decisions on the
stage, and its sibling "Bid is non-responsive" is the only procedurally correct outcome when no bid qualifies.

---

# Pass 3 — **Live** view mode: Disapprove WORKS. TC-20 resolved.

**Prompted by the tester reporting they had manually disapproved REF2026-0843 successfully**, with status
*Declined* — directly contradicting passes 1 and 2. The variable neither pass controlled for was **view mode**.

## The A/B — same tender, same user, same build, same hour

| | Pass 1/2 | Pass 3 |
|---|---|---|
| View mode | **Latest** | **Live** |
| Form version served | later unpublished draft | **`tender-reason for disapproval v8`**, badged LIVE |
| Disapprove | permanent spinner, 3 attempts, no commit | **dialog opened immediately** |
| Outcome | tender untouched | **committed → status Declined** |

`REF2026-1106` is the same tender in both rows. The app describes Live as *"Display only published versions of
configuration items. **It's a default view for regular users.**"* and Latest as *"Display latest versions…
**irrespectively of their status**"* — i.e. Latest serves unpublished drafts.

## What Disapprove does (finally observed)

- [PASS] Dialog **"Reason for Disapproval"** opens, form `tender-reason for disapproval v8`
- [PASS] It declares the semantics: *"After clicking 'Submit', this Tender Request will be **terminated**. A
  notification will be sent to the **Initiator** with the disapproval message attached."*
- [PASS] **The reason is mandatory** — with the field empty the dialog's **Submit is not rendered at all**;
  entering text makes it appear. Verified both directions. Not disabled, no validation message; the textarea
  carries neither `required` nor `aria-required`.
- [PASS] The **dialog's** Submit is the commit → `POST Process/UserTaskComplete` **200**, redirect to My Items.
  The page footer's Submit stayed disabled throughout (same pattern as Send Back).
- [PASS] (BLOCKING) **Terminal, not a rework loop** — status **Declined**, item gone from the reviewer's Inbox,
  no onward task for the initiator. Confirmed in the initiator's My Items and on the workflow view.
- [FAIL] **The reason is NOT visible to the initiator.** `tender-wf-details-view v27` shows *DECLINED* but no
  reason/disapproval text anywhere on the page. Whether the promised notification carries it could not be
  checked — no access to the notification channel.

## Corroborating evidence that this was never broken for users

Maanda-awe's My Items shows **REF2026-1199 "testing disapprove" → Declined, 31/07/2026 15:47**, plus
REF2026-1166 and REF2026-1160 → **Cancelled**. The manual tester had been using this decision successfully for
days. That alone should have invalidated a "Blocker, no workaround" framing earlier.

## Residual defects (real, but Low–Medium)

1. The **unpublished draft** of `tender-reason for disapproval` cannot initialise. Publishing it as-is would
   break Disapprove in production. The exact v8-vs-draft difference needs the form-config history, which QA
   does not have — **that diff is the fix.**
2. A **form-initialisation failure surfaces nothing and never resets the button**. A permanent spinner with no
   message is what made this look like a blocker for five attempts. Framework-level; worth fixing separately.

## ⚠️ Wider implication for this project's coverage

**The automated suite runs in Latest** (TC-01 step 2 switches to it, and it is the project convention). So the
16/16 happy-path chain and every negative finding validate **draft** form versions, not what regular users get.
Any Latest-only finding may be a draft artefact. **TC-26's "Bid is non-responsive is dead" hangs off this very
form and must be re-verified in Live.** TC-19 already carries an unexplained Live-vs-Latest discrepancy that now
looks like the same root cause. A Live-mode run of the full chain would be worth doing.

---

# Pass 4 — **Latest** mode also works. The view-mode explanation is retracted.

Prompted by the test lead correcting a wrong assumption in Pass 3: **users get `Latest`**, which is why the
project's convention is to test in it. That makes "Live works, so users are fine" invalid — and raises the
alternative that Pass 3's A/B was confounded by **time** rather than view mode, since a fix could have landed
between 09:29 and 09:35.

**Test:** fresh tender **REF2026-0855** (`EVAL_CRITERIA=80/20 --grep "TC-01"`, 42.0 s), MhlotiM switched
explicitly to **Latest** (selector verified reading "Latest" before the click).

**Result — it works:**
- [PASS] **"Reason for Disapproval"** dialog opened immediately, form `tender-reason for disapproval v8`
- [PASS] Reason typed, dialog Submit present, clicked → `POST Process/UserTaskComplete` **200**, redirect to
  My Items
- [PASS] **Status = Declined** on the workflow view; item gone from the reviewer's Inbox

**Decisive detail that kills the view-mode theory.** The dialog's form-config request carries the **same hash in
both the hanging and the working run**:

| Run | Time | Mode | form-config request | Outcome |
|---|---|---|---|---|
| Pass 2 | 09:29 | Latest | `md5=53F860F0DC3722155BE873A894ED4D63` → **304** | **hung** |
| Pass 4 | 09:53 | Latest | `md5=53F860F0DC3722155BE873A894ED4D63` → **304** | **worked** |

Same form content, same view mode, opposite outcomes ⇒ **the form version is not the variable.** The
`Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender` **404 also still fires** in this
successful run, confirming that retraction.

## Root cause: still unknown

Eliminated: the metadata 404 · tender data and age · form version · view mode.
Leading unproven hypothesis: **degraded network** — the office connection was measurably bad in that window
(a `page.goto` to `/login` timed out at 30 s during the 09:33–09:39 run), and an init stalling on a request that
never returns matches the signature exactly. Against it: the 2026-07-30 failures were a different day.

**If it recurs, capture immediately:** view mode, the dialog's form version badge (or its absence), the full
network waterfall **including pending requests**, and whether other pages are slow at the same time.

## Tender status after all four passes

- **REF2026-1106 — CONSUMED** (Pass 3, Live) → Declined
- **REF2026-0843 — CONSUMED** (disapproved manually by the tester) → Declined
- **REF2026-0855 — CONSUMED** (Pass 4, Latest) → Declined
- **REF2026-1110 — still parked**, untouched, at Review and Approve
- **REF2026-1128 — still parked** at *BEC: Finalise recommendation* (inspected for "Bid is non-responsive",
  deliberately not committed)
