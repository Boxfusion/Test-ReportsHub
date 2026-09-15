# Test Plan: NPO-15E2E-F — E&A End-to-End Content Lifecycle (functional)

> **Status:** Imported from Azure DevOps 2026-08-20 — 2 end-to-end cases (ADO suite 107356) spanning admin + public.
> ⚠️ **Both cases run straight through the two blockers found on 08-18** (15B content upload disabled, 15A District
> list empty). Running them is therefore also the **regression retest** of those blockers — attempt them fresh and
> record whether they still bite before concluding blocked.
> **Owner:** QA
> **Last Updated:** 2026-08-20
> **Estimated Duration:** 900s

## Metadata
| Field | Value |
|-------|-------|
| App URL | Admin: https://dsd-npo-adminportal-qa.shesha.app/login · Public: https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe (broad admin — we hold no second, role-scoped admin) |
| Lead tester | **Thabiso Kegakwile** |
| ADO Suite | 107356 — *15E2E E&A End-to-End Content Lifecycle* (2 cases) |

## Objective
> Walk one piece of content and one intervention through their whole life: admin creates → sends for approval →
> a second admin approves → a portal user views/likes/downloads → the dashboard reflects the engagement.

## 🔑 Context — the obstacles, all recorded before the run
1. 🔴 **15B:** the **Add File upload control is DISABLED** on every library (fresh and existing) — File is required, so
   no content can be added. Bug `bugs/2026-08-18-library-add-file-upload-disabled.md`. Blocks TC-01 at step 2.
2. 🔴 **15A:** the required **District** dropdown returns *"No data"*, so an intervention cannot be completed.
   Blocks TC-02 at step 1. Note the intervention **attachment upload is enabled** — the disabled upload is specific
   to library content.
3. ⚠️ **Two admins are needed** (Admin A author, Admin B approver). We hold one shared broad-privilege login, so the
   approval hand-off cannot be genuinely separated — record it as unresolvable without role-scoped users rather than
   faking it with the same account.
4. **Case-vs-build:** TC-02 prescribes Type = **Workshop**; live types are Education And Awareness / Train The
   Trainer / Outreach Programmes / Npo Sector Engagement. TC-01 expects a **Like**; no Like control exists (15E/15C).

## Preconditions
- [ ] Admin portal reachable; Education and Awareness → Content Libraries + Interventions reachable.
- [ ] Public portal account for the consumer half.
- [ ] Our library **"QA Test Library (synthetic)"** from 15B still exists (Status=Created, empty) — reuse it rather
      than creating another ([[reuse-our-created-records]]).

## Test Cases

### TC-01 — Library → content → approval → portal view/like/download → dashboard (ADO #107394 · TC-15E2E-001)
*P2 · Src:FDS · Both.* ⚠️ Expected to block at step 2 — **retest, do not assume**.
- **Steps:** 1. Admin A: create/reuse a library with a PDF/DOC allowlist and an approver → 2. Admin A: add content
  (PDF), duration 6 months, **Send for Approval** → 3. Admin B: Incoming Items → approve → 4. Portal user: open the
  library, view the content, Like, Download → 5. Admin A: dashboard shows 1 published / 1 view / 1 like / 1 download.
- **Expected:** each stage advances the status and the engagement counters land on the dashboard.
- **Assertions:** [ ] step 1 library persisted · [ ] **step 2 re-attempted live** — record whether the upload control
  is still disabled (and its class attribute as evidence) · [ ] if blocked, record the furthest reachable stage and
  which sub-steps are consequently unreachable · [ ] the **Like** sub-step recorded as *no such control* ·
  [ ] Incoming Items queue state recorded (15B found it empty and unfeedable).

### TC-02 — Intervention with attachments → status Complete → dashboard (ADO #107395 · TC-15E2E-002)
*P2 · Src:FDS · Both.* ⚠️ Expected to block at step 1 — **retest, do not assume**.
- **Steps:** 1. Admin: Add Intervention, fill all mandatory fields + reporter + reviewer → 2. Upload Attendance
  Register (PDF) + Feedback Questionnaire (DOCX); Submit → 3. Interventions index shows the row, status **Complete** →
  4. Dashboard count reflects it.
- **Expected:** intervention created with both files retained; index and dashboard agree.
- **Assertions:** [ ] **District dropdown re-probed live** — record whether it still returns "No data" (and for which
  province) · [ ] Type substitution recorded (no *Workshop* type exists) · [ ] if District is fixed, carry the case
  all the way to the dashboard · [ ] if still empty, record that Save stays gated and no Draft state is offered
  (15A TC-05) · [ ] attachment upload availability recorded either way (it was enabled on 08-18).

## Coverage against ADO
| Plan case | ADO | TC id | Runnable? |
|---|---|---|---|
| TC-01 | #107394 | TC-15E2E-001 | ⚠️ blocked at step 2 by the 15B upload defect (retest) |
| TC-02 | #107395 | TC-15E2E-002 | ⚠️ blocked at step 1 by the 15A District defect (retest) |

**2 cases owned.**

## ADO anchors (machine-read — do not delete)
- ADO #107394 · TC-15E2E-001
- ADO #107395 · TC-15E2E-002

---

## ⛔ Executed 2026-08-20 — both blockers STILL OPEN; District cause pinned to a data-seeding gap
Report: `test-reports/2026-08-20/15e2e-content-lifecycle-functional--blocker-retest.md`

| Case | Verdict | Note |
|---|---|---|
| TC-15E2E-001 | ⛔ BLOCKED | Add File upload **still `ant-upload-disabled`** (step 2); steps 3–5 unreachable |
| TC-15E2E-002 | ⛔ BLOCKED | District list **still "No data"** (step 1); Province lists all 9 |

🔑 District root cause: `Dsd.District` has only **2 rows total** (uThungulu, Ugu, both `parentArea:null`); Gauteng = 0.
It's a **reference-data seeding gap**, not a broken cascade. Both 08-18 bugs re-confirmed open:
`bugs/2026-08-18-library-add-file-upload-disabled.md`, 15A District (TC-04).
