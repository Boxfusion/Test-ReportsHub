# Test Plan: NPO-15W-F — E&A Accessibility (WCAG 2.1 AA, functional)

> **Status:** Imported from Azure DevOps 2026-08-20 — 4 cases (ADO suite 107357), public + admin E&A screens.
> Method is the **computed DOM/CSS audit** proven on suite 14W, not a screen-reader session.
> **Owner:** QA
> **Last Updated:** 2026-08-20
> **Estimated Duration:** 700s

## Metadata
| Field | Value |
|-------|-------|
| App URL | Public: https://dsd-npo-publicportal-1-qa.shesha.app/login · Admin: https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Suite | 107357 — *15W E&A Accessibility (WCAG 2.1 AA)* (4 cases) |

## Objective
> Verify the E&A screens against WCAG 2.1 AA: keyboard-only operation, landmark/role exposure, text contrast, and
> admin form labelling + focus order.

## 🔑 Method (carried from 14W — do not substitute)
- **"Screen reader announces X" is verified through the DOM contract AT reads** — `label[for]` → `id` resolution,
  `aria-*`, `role`, landmarks, live regions. A broken contract is a real AT failure; a passing contract is not proof
  of a good AT experience, so say which of the two was established.
- **Contrast computed** with the WCAG relative-luminance formula from *resolved* `color` / `background-color`.
- **Keyboard order** read from the real focusable set in DOM order, plus the computed focus style of each.
- ⚠️ **14W already found app-wide failures** (unlabelled inputs, DSD ochre at 3.15:1, no live regions, no h1).
  If those recur on E&A screens they are the **same defect surfacing again** — reference the existing bug, do not
  file a duplicate. Only genuinely E&A-specific findings are new.
- Uploaded-file links on the wizard had **no href** (JS-only) — carried from 14W; check the E&A content and download
  links for the same pattern.

## Preconditions
- [ ] Public portal signed in (E&A nav reachable), at least one library with a content item.
- [ ] Admin portal signed in; Interventions index, Add Intervention dialog, Content Libraries, E&A dashboard reachable.

## Test Cases

### TC-01 — Keyboard-only navigation across the E&A portal (ADO #107396 · TC-15W-001)
*P2 · Src:Code · Both.* ✅ Runnable (computed).
- **Steps:** 1. Portal home → 2. Sign In → 3. Library Topics → open a library → open a content item → download.
- **Expected:** every interactive element reachable in a logical order with a **visible focus indicator**; all actions
  achievable without a mouse.
- **Assertions:** [ ] focusable set in DOM order recorded per page · [ ] each has a computed visible focus style ·
  [ ] any control reachable only by mouse (no tabindex, div-as-button, href-less link) named explicitly ·
  [ ] the case's **Like** step recorded as *not applicable — no Like control exists* (15E finding), not as a fail.

### TC-02 — Landmarks + interactive roles are exposed (ADO #107397 · TC-15W-002)
*P2 · Src:Code · Both.* ⚠️ Substituted method — no NVDA/VoiceOver session available.
- **Steps:** 1. Audit the E&A portal pages for landmark and role exposure.
- **Expected:** Main / Navigation / Complementary landmarks announced; button and link roles announced; live regions
  used for status.
- **Assertions:** [ ] landmark elements/roles enumerated (`main`, `nav`, `aside` or their ARIA equivalents) ·
  [ ] role of each interactive element recorded · [ ] live regions present for status/toasts · [ ] state that the
  verdict rests on the DOM contract, **not** an NVDA run.

### TC-03 — Text contrast meets AA on the public E&A pages (ADO #107398 · TC-15W-003)
*P2 · Src:Code · Both.* ✅ Runnable (computed).
- **Steps:** 1. Audit Home, Library Topics, content detail, FAQ, Contact Us.
- **Expected:** zero critical contrast violations; body text ≥ 4.5:1, large text ≥ 3:1.
- **Assertions:** [ ] worst offenders listed with computed ratio + colour pair + page · [ ] separated into
  **new to E&A** vs **the app-wide ochre failure already filed on 14W**.

### TC-04 — Admin E&A screens: ARIA labels + focus order (ADO #107399 · TC-15W-004)
*P2 · Src:Code · Both.* ✅ Runnable (computed).
- **Steps:** 1. Audit Interventions index → 2. Add Intervention form → 3. Content Libraries list → 4. E&A dashboard.
- **Expected:** ARIA labels present on **all** form fields; focus order matches visual order.
- **Assertions:** [ ] every field in the Add Intervention dialog checked for a resolvable label · [ ] `label[for]`
  targets resolved with `getElementById` (14W's failure mode was `for` pointing at ids that do not exist) ·
  [ ] focus order compared against visual (geometric) order · [ ] the **disabled** upload control (15B) and the empty
  **District** list (15A) noted for their AT impact — a required field that cannot be satisfied is also a
  usability barrier.

## Coverage against ADO
| Plan case | ADO | TC id | Runnable? |
|---|---|---|---|
| TC-01 | #107396 | TC-15W-001 | ✅ computed |
| TC-02 | #107397 | TC-15W-002 | ⚠️ DOM contract, not NVDA |
| TC-03 | #107398 | TC-15W-003 | ✅ computed |
| TC-04 | #107399 | TC-15W-004 | ✅ computed |

**4 cases owned.**

## ADO anchors (machine-read — do not delete)
- ADO #107396 · TC-15W-001
- ADO #107397 · TC-15W-002
- ADO #107398 · TC-15W-003
- ADO #107399 · TC-15W-004

---

## ✅ Executed 2026-08-20 — E&A portal + admin form audited; app-wide 14W violations recur + E&A-specific fails
Report: `test-reports/2026-08-20/15w-accessibility-functional--ea-portal-and-admin.md`

| Case | Verdict | Note |
|---|---|---|
| TC-15W-001 | 🔴 FAIL | 11/30 focusables no visible focus ring (incl. all nav links); library tiles are non-focusable `<div>` |
| TC-15W-002 | ⚠️ PARTIAL | main/header/footer present; **no `<nav>` landmark, no live regions**, 2× `<h1>` + broken order |
| TC-15W-003 | 🔴 FAIL | DSD ochre `#C6831B` **3.15:1** recurs (app-wide 14W defect) |
| TC-15W-004 | 🔴 FAIL | all 11 Add-Intervention fields unlabelled (no resolving `for`, no aria-label) |

No new bug — all instances of `bugs/2026-08-18-accessibility-wcag-aa-violations.md`, now shown on E&A surfaces.
