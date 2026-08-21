# Report: NPO-15E2E-F — E&A End-to-End Content Lifecycle

**Date:** 2026-08-20 06:39 UTC
**Plan:** test-plans/education-awareness/15e2e-content-lifecycle-functional.md
**Execution Mode:** ai-driven (Playwright MCP + API, live QA admin portal)
**Result:** BLOCKED — both E2E chains stop at their first content step; the two 08-18 blockers are re-confirmed **still open**, with the District cause now pinned to a data-seeding gap
**Duration:** ~500s
**Cases:** TC-15E2E-001, TC-15E2E-002
**Environment:** QA · admin portal (Content Libraries, Interventions)

## Summary
| Case | Area | Verdict |
|---|---|---|
| TC-15E2E-001 | Library → content → approve → view/like/download → dashboard | ⛔ BLOCKED — Add File upload **still disabled** (step 2) |
| TC-15E2E-002 | Intervention + attachments → Complete → dashboard | ⛔ BLOCKED — District list **still empty** (step 1); root cause found |

Running these was the regression retest of the two 08-18 blockers. **Both still reproduce.** No new bug filed — this
updates the two existing bugs with a fresh reproduction and, for District, a root cause.

## ⛔ TC-15E2E-001 — blocked at step 2 (content upload)
- Step 1 OK: our library **"QA Test Library (synthetic)"** (created 08-18) still exists, Status **Created**, empty.
  Reused per [[reuse-our-created-records]].
- Step 2 FAILS: opening the library detail (`boxfusion.content/library-details-folder?id=85c004c8-…`) → toolbar
  **Add File** → the upload control is still `div.ant-upload ant-upload-select **ant-upload-disabled**` and the
  underlying `input[type=file]` is `disabled=true`. No file can be attached; File is required, so no content can be
  created. Evidence: `evidence/15e2e-addfile-still-disabled.png`.
- Consequently steps 3–5 (approval, portal view/like/download, dashboard engagement) are all unreachable. The **Like**
  sub-step is moot anyway — no Like control exists (15E/15C). Incoming Items remains empty/unfeedable.
- → the 08-18 blocker `bugs/2026-08-18-library-add-file-upload-disabled.md` is **STILL OPEN** as of 2026-08-20.
- Library toolbar today: **New Folder · Add File · Delete · Submit** — a folder/file store, not the content-item +
  approval lifecycle the FDS/case describes (unchanged from 08-18).

## ⛔ TC-15E2E-002 — blocked at step 1 (intervention) — root cause found
- Add Intervention opens; **Province** dropdown lists all **9** provinces correctly.
- With **Province = Gauteng** selected, the required **District** dropdown returns **"No data"** — unchanged from
  08-18. Save stays gated; no Draft state offered (15A TC-05). So a Complete intervention still cannot be created.
- 🔑 **Root cause pinned (new).** The cascade query is correct —
  `Entities/GetAll?entityType=Dsd.District&filter={parentArea == <Gauteng id>}` returns `totalCount: 0`. Querying
  `Dsd.District` with **no** parent filter returns only **2 rows in the entire table** (`uThungulu`, `Ugu` — both KZN
  districts), and **both have `parentArea: null`**. So this is a **reference-data seeding gap**, not a broken
  Province→District cascade: there are essentially no districts seeded, and the two that exist aren't linked to a
  province. For Thabiso: the `Dsd.District` reference data needs seeding (all 52 SA districts, each linked to its
  province) before any intervention can be captured.
- Intervention **attachment upload (Section 4)** remains **enabled** — the disabled-upload issue is specific to
  library content, confirming the 15A/15B contrast.
- Case-vs-build: TC-02 prescribes Type = **Workshop**; live Intervention Types are Education And Awareness /
  Train The Trainer / Outreach Programmes / Npo Sector Engagement — no *Workshop*.
- → the 08-18 blocker (15A TC-04, District empty) is **STILL OPEN**, now with a confirmed data-layer cause.
- Draft discarded via Cancel (no intervention created).

## Method notes
- Add-Intervention modal opened via JS click (the E&A sidebar flyout intercepts pointer events — known gotcha
  [[nc-dispatch-admin-page-urls]] style); selects opened with a **real** click (synthetic mousedown doesn't populate
  Shesha selects — [[shesha-forms-use-real-clicks]]).
- District cause confirmed at the API with the page's bearer token; the UI "No data" and the API `totalCount:0` agree.
- Two admins (author + approver) were never separable — we hold one shared broad-privilege login; the approval
  hand-off is unresolvable without role-scoped users regardless of the upload blocker.
