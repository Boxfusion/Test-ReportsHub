# Report: NPO-15W-F — E&A Accessibility (WCAG 2.1 AA)

**Date:** 2026-08-20 06:36 UTC
**Plan:** test-plans/education-awareness/15w-accessibility-functional.md
**Execution Mode:** ai-driven (computed DOM/CSS audit, live QA — same method as 14W)
**Result:** FAILED — the app-wide 14W violations recur on E&A, plus E&A-specific keyboard, landmark and label failures
**Duration:** ~600s
**Cases:** TC-15W-001, TC-15W-002, TC-15W-003, TC-15W-004
**Environment:** QA · public E&A portal (`/dynamic/boxfusion.dsdnpo/portal-education-awareness`) · admin (Interventions, Add Intervention)

## Summary
| Case | Area | Verdict |
|---|---|---|
| TC-15W-001 | Keyboard-only navigation | 🔴 FAIL — 11/30 focusables have no visible focus ring; library tiles are non-focusable `<div>` |
| TC-15W-002 | Landmarks + roles | ⚠️ PARTIAL — main/header/footer present, but **no `<nav>` landmark, no live regions**, 2× `<h1>` |
| TC-15W-003 | Colour contrast AA | 🔴 FAIL — DSD ochre `#C6831B` at **3.15:1** recurs (the app-wide 14W defect) |
| TC-15W-004 | Admin form labels + focus | 🔴 FAIL — **all 11** Add-Intervention fields have no resolving label / aria-label |

No new bug filed — every failure is an instance of the existing
`bugs/2026-08-18-accessibility-wcag-aa-violations.md` (label associations, ochre contrast, missing live regions,
heading structure) now shown to extend to the E&A surfaces. Referenced, not duplicated, per
[[dont-raise-defects-in-daily-reports]] / the 14W bug.

## 🔴 TC-15W-001 — Keyboard navigation (E&A portal home)
- **11 of 30** visible focusable elements have **no visible focus indicator** (`outline:none` and `box-shadow:none`
  when focused) — including **every main nav link** (Register NPO, Education and Awareness, Contact Us, FAQs), the
  search input, the pager and two toolbar buttons. WCAG 2.4.7 (Focus Visible) fail.
- The **library tiles are plain `<div>`** with `role=null` and `tabindex=null` — they are not in the tab order and
  carry no button/link semantics, so "open a library" is **not keyboard-operable**. This is the E&A version of the
  14W href-less-link pattern. WCAG 2.1.1 (Keyboard) fail.

## ⚠️ TC-15W-002 — Landmarks and roles (E&A portal home)
- Landmarks present: `main` ×1, `header` ×1, `footer` ×1 — **better than the registration wizard** (which had none).
- 🔴 **No `<nav>` / `role=navigation`** around the primary menu, so AT users get no navigation landmark.
- 🔴 **No live regions** anywhere (`aria-live` / `role=alert|status` = 0) — status/toasts are not announced (same as 14W).
- 🔴 **Two `<h1>` elements** and a broken heading order (H1, H1, H5, H5 — no H2/H3/H4). WCAG 1.3.1 fail.
- Method caveat: verified through the DOM contract AT reads, **not** an NVDA/VoiceOver session.

## 🔴 TC-15W-003 — Colour contrast (E&A public pages)
Computed (WCAG relative-luminance) worst offenders:
| Text | fg | bg | size | ratio | needs |
|---|---|---|---|---|---|
| Nav link "Education and Awareness" | `#C6831B` | `#FFFFFF` | 14 px | **3.15:1** | 4.5 |
| Header title text (white on ochre) | `#FFFFFF` | `#C6831B` | 10 px | **3.15:1** | 4.5 |

The ochre `#C6831B` at 3.15:1 is the **same app-wide brand-colour failure** filed on 14W, now confirmed on the E&A
surface. (The green "LIVE" badge at 1.87:1 is the dev Live-Mode toggle, not production chrome — excluded.)

## 🔴 TC-15W-004 — Admin E&A form labels (Add Intervention)
Audited all **11** form items in the Add Intervention dialog (Intervention Type*, Programme Type, Type of Engagement,
Risk Status*, Date Start/End Session*, Province*, District*, Municipality, Partnership, Other Partnership):
- **Every** control's programmatic label is broken or absent: the AntD-select controls have **no `id`** at all; the
  `<input>` controls have an `id` but **no `<label for>` resolves to it** (`getElementById` on each `for` target /
  `for`-less), and **none** carry `aria-label` or `aria-labelledby`.
- So a screen reader announces all 11 fields (including four required ones) as unlabelled — same failure mode as the
  registration wizard on 14W. WCAG 1.3.1 / 4.1.2 fail.
- Focus order was not separately measured here (the modal is a single vertical column, so visual == DOM order by
  construction); the label failure alone fails the case.

## Method notes
- Contrast via the WCAG relative-luminance formula on resolved `color`/`background-color`, walking up for the first
  non-transparent background.
- Focus-ring check focuses each element and reads computed `outline`/`box-shadow`.
- Label resolution done with `getElementById` on each `for` target (14W's exact failure signature).
- Same computed-audit caveat as 14W: a passing DOM contract is necessary, not sufficient, for a good AT experience.
