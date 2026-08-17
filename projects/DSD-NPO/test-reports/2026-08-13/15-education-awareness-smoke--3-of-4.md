# Report: NPO-15 — Education & Awareness (smoke)

**Date:** 2026-08-13 15:27 UTC
**Plan:** test-plans/education-awareness/15-education-awareness-smoke.md
**Spec:** test-plans/education-awareness/15-education-awareness-smoke.spec.ts
**Execution Mode:** ai-repair
**Result:** PARTIAL — 3 of 4 cases pass; Add Intervention cannot be saved
**Duration:** 1200s
**Cases:** TC-15-001, TC-15-002, TC-15-003, TC-15-004 (smoke suite 107359)
**Environment:** QA · both portals · view mode **Latest**

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 22 | 17 | 4 | 1 |

⚠️ **All four cases are `L1-draft`** with one prescribed step each and suite-level FDS anchors. Thabiso's note
says *"Needs L3 execution to promote to Ready-for-run"*. **This run IS that L3 validation**, so the detail below
is recorded to let the cases be sharpened.

## ✅ TC-15-001 — Admin reaches the E&A Dashboard (ADO #107404) — PASS
🔑 **The dashboard is under `Dashboards`, NOT under `Education and Awareness`** —
`/dynamic/education-and-awareness-dashboard`. The E&A menu itself holds only *Interventions* and
*Content Libraries*. **Worth adding to the case**, which just says "navigate to E&A Dashboard".

- [PASS] Dashboard loads
- [PASS] **At least one library visible** — *Library Topics*: `Friday Deployment (2) · Training BET (2) ·
  Testing (1) · cv (2) · Test · MS Docs (2) · sdsd (1)`
- Also renders a **Content** panel (per-item views/downloads/comments) and a **Content Details** analytics panel
  (*Number of Downloads 9 · Number of Views 9 · Number of comments/interactions 4*).
- 📌 Both listed content items show status **"Expired"** — relevant to TC-15-004 below.

## ✅ TC-15-002 — NPO user opens a Library on the portal (ADO #107405) — PASS
`/dynamic/boxfusion.dsdnpo/portal-education-awareness` → **6 libraries** → opens
`/dynamic/boxfusion.content/public-flattened-content-items?id=<libraryId>`

- [PASS] The content items list renders, with columns *Name · Date Modified · Type · Size · Downloads · File*
- Verified across several libraries: **Training BET = 1 item**, **cv = 2 items**
- ⚠️ **`Friday Deployment` and `Testing` render 0 items on the portal** although the admin dashboard counts 2 and
  1 respectively. The admin dashboard shows Friday Deployment's items as **"Expired"**, so the portal is very
  likely filtering expired content — **probably correct behaviour, but worth confirming**, because it means a
  library can look populated to DSD staff and empty to the public.
- 🔑 **Spec-authoring note: do NOT assert on the library link's `href`.** Every library anchor renders as
  `…/public-flattened-content-items?id=` with an **empty id**; the id is supplied by a click handler at runtime
  (the click resolved to `?id=23a135dd-…`). Reading the attribute alone would wrongly suggest broken links.

## 🔴 TC-15-003 — Admin adds and submits an Intervention (ADO #107406) — FAIL, cannot save
`Education and Awareness → Interventions` (`/dynamic/boxfusion.dsdnpo/interventions`, 4 existing) →
**Add Intervention** (`boxfusion.dsdnpo/add-intervention v6`).

**The modal has four tabs — `Section 1` · `Section 2` · `Section 3` · `Section 4` — and a standing note:**
> *"Note: Please ensure all sections have been captured before saving intervention."*

**All 15 required fields across all four sections were populated and read back individually:**

| Section | Fields set |
|---|---|
| 1 | Intervention Type `Education And Awareness` · Risk Status `Low` · Start `13/08/2026` · End `20/08/2026` · Province `KwaZulu-Natal` · District `Ugu` |
| 2 | 3 of 9 training-topic checkboxes ticked |
| 3 | Certificates Printed `50` · NPOs Registered `30` · 2 service checkboxes ticked |
| 4 | NPOs in attendance `120` · officials `40` · participants `160` · Reporter `Nomfanelo Nhleko` + email · Reviewer `Thabiso Kegakwile` + email |

- [FAIL] **(BLOCKING)** **`Save` never enables.** Verified with a full sweep of every `.ant-form-item` carrying
  `.ant-form-item-required` across **all four tab panes, visible and hidden**: **15 required, 0 empty**. No
  `.ant-form-item-has-error`, no `.ant-form-item-explain-error`, and a MutationObserver captured **no transient
  toast** beyond the standing note.
- ⚠️ **Cause undetermined — and one candidate could not be tested.** The three file uploads
  (*Attendance Register · Feedback Questionnaire · Other File*) are **not marked required**, but they are the
  only unfilled inputs.
  ▶ **This one needs a human to try: fill all four sections, attach an Attendance Register by hand, and see
  whether Save enables.** That single check decides whether this is a defect or a harness limit.

> 🔑 **CORRECTION (2026-08-13, from the NPO-12 run).** This report originally stated the upload *"could not be
> bound under automation"*. **That conclusion was reached with the wrong selector.** I checked
> `.ant-upload-list-item`, which this platform does not use. On the whistleblowing form the identical control
> **accepted `attendance-register.txt`, rendered it as `attendance-register.txt Download Zip`, and the file
> persisted server-side** (it is visible under *Supporting Documents* on the admin case). **Shesha uploads ARE
> automatable** — assert on the file name in the form-item text, not on `.ant-upload-list-item`.
> **What this does NOT change:** the Add Intervention upload was never confirmed either way, so TC-15-003's cause
> remains undetermined and still needs the manual check above.

### Findings raised regardless of the Save outcome
1. 🔴 **The navigation flyout overlays the toolbar.** `A.nav-links-renderer` (the *Dashboards* flyout) sits on top
   of the **Add Intervention** button and **persists across a full page navigation**. `document.elementFromPoint`
   at the button's centre returns the nav link, **so a real user clicking Add Intervention would hit the
   "CRM Dashboard" link instead**. Only a direct DOM click reached the button.
2. ⚠️ **Tabs are named `Section 1`–`Section 4`.** With a note telling the user to capture "all sections" and no
   indication of what each contains or which is incomplete, a blocked Save is undiagnosable from the UI.
   Their actual content: 1 = intervention details · 2 = training topics · 3 = services provided/rendered ·
   4 = attendance, reporter/reviewer, attachments.
3. 🔴 **District reference data is broken.**
   - **Gauteng returns NO districts at all** (`"No data"`). District is **required**, so **an intervention can
     never be created for Gauteng** — the country's most populous province.
   - **KwaZulu-Natal returns exactly one district, `Ugu`** (KZN has 11).
4. ~~🔴 **A raw GUID is rendered in the District dropdown**~~ — **RETRACTED 2026-08-13.** The same GUID `<div>`
   appears in *every* `ant-select` dropdown on both portals, so it was re-checked on the NPO-12 run: it is a
   **zero-width container** (`width: 0`) that is **invisible to a user** — a screenshot of the open dropdown shows
   a clean list with no GUID. It surfaces only in `innerText`/`textContent` extraction. **Not a defect.**
   🔑 *Standing note: never raise a rendering defect from extracted text alone — confirm with a screenshot.*
5. 📌 **Numeric fields default to `0` and typing prepends** rather than replacing — typing `12` into a field
   showing `0` yields `120`. Cosmetic, but it silently corrupts figures; **clear before typing**.

## ✅ TC-15-004 — NPO user views and downloads a Library item (ADO #107407) — PASS
- [PASS] Opened `cv` (2 items), clicked the file link
- [PASS] **Download completed without error** — `stampDsd-removebg-preview.png`
- [PASS] File is non-empty and the size matches: **37,509 bytes** vs the stated *37.51 kB*
- 📌 Minor: the `Size` column reads `36 KB` while the file link reads `37.51 kB` — KiB vs kB rounding, not a defect.

## 🔑 Correction to an earlier finding today — Risk IS implemented
Earlier I raised *"is NPO risk rating implemented at all?"* after finding no Risk column in All Applications,
All Annual Reports or the annual report details. **Add Intervention has a required `Risk Status` field with a
proper vocabulary — `Low / Medium / High`.**

So risk **is** a built concept; it is simply **absent from applications and annual reports**, where ADO #101712,
#101756 and #101757 prescribe it. **Reframe the question** for Thabiso: *risk exists on Interventions — why is it
missing from the application and annual-report views?*

## ❓ Questions for the test lead
1. **Does Add Intervention require the file attachments to save?** (Decides whether TC-15-003 is a defect.)
2. **District reference data** — Gauteng has none and KZN has one. Is the district table populated for any
   province, and is District genuinely mandatory?
3. Should the `Section 1–4` tabs carry meaningful names?
4. Is hiding **expired** content from the public portal intended? (Friday Deployment: 2 in admin, 0 on portal.)
5. Risk exists on Interventions — **why not on applications and annual reports?**

## ▶ Next
Still open and unblocked: **12P → 12A investigations (3)** · **14S public NPO search (1 — and `333-018-NPO` is now
a registered NPO to search for)** · **10P / 10A Post Registration (6)** · **13P / 13A Deregistration (6)**.
