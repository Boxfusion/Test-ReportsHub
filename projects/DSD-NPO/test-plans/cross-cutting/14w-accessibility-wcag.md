# Test Plan: NPO-14W — Cross-Cutting: Accessibility & WCAG (smoke)

> **Status:** Imported from Azure DevOps — **partially reachable**
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 180s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=102150) |
| ADO Suite | 102150 — *14W - Cross-Cutting - Accessibility & WCAG* (1 case) |

## Objective
> Verify that the application wizard can be completed using the keyboard alone, with visible focus throughout and validation errors announced to assistive technology — WCAG 2.1 AA.

## Reachability
**Partially reachable.** Steps 1–2 can be exercised as far as the wizard goes today (Read This and Organisation Details); steps 3–4 need the wizard to complete, which the address defect prevents.

🔑 **Step 3 is worth running now even though the case cannot complete.** It asserts that *"validation error messages are announced and focus moves to the offending field"* — and we already know this wizard blocks with a **disabled `Next` and no validation message at all**. If there is no message, there is nothing to announce, so the accessibility failure and the usability defect are **the same defect**. Running step 3 turns a UX observation into a **WCAG 2.1 AA finding**, which carries more weight for a government portal.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO case; state `Design`. `Src:Code` / `Source-Sys-Obs`.

## Preconditions
- [ ] Signed in on the public portal; view mode **Live → Latest**
- [ ] The application wizard open
- [ ] Keyboard only — **no mouse for the duration of the case**. A screen reader is optional but makes step 3 conclusive

## Test Cases

### TC-01 — Keyboard-only navigation across all wizard tabs (ADO #102160 · TC-14W-001)

*Priority 1 · Accessibility · WCAG 2.1 AA.*

- **Type:** Accessibility
- **Steps:**
  1. Using only **Tab / Shift+Tab / Enter / Arrow** keys, navigate through **Tab 1 (Read This)**
  2. ASSERT every interactive element is reachable and **focus is visible on each**
  3. Continue keyboard-only through **Tabs 2–8**
  4. ASSERT all tabs, fields, controls and **Next/Back** buttons are reachable by keyboard alone
  5. Trigger a validation error with the keyboard only — leave a required field blank and press **Next**
  6. ASSERT (BLOCKING) the validation error is **announced** and **focus moves to the offending field**
  7. Submit the application using the keyboard only
  8. ASSERT submission completes with no mouse interaction and the success page is reachable by keyboard
- **Expected result:** *"All interactive elements reachable; focus is visible on each"* … *"Validation error messages are announced and focus moves to the offending field for AT users"* … *"Submit completes without any mouse interaction"*
- **Assertions:**
  - [ ] ASSERT every control on Read This is keyboard-reachable with visible focus
  - [ ] ASSERT every control on Organisation Details is keyboard-reachable with visible focus
  - [ ] ASSERT (BLOCKING) a validation error is announced and takes focus
  - [ ] ASSERT the remaining tabs are keyboard-navigable *(blocked — expect `SKIPPED`)*
  - [ ] ASSERT submission completes keyboard-only *(blocked — expect `SKIPPED`)*
- **🔴 Expect step 6 to fail.** Five instances of "blocked with no feedback" were found on 2026-08-12 — the POPIA gate, Organisation Details `Next`, the link-to-existing submit, the user-create modal and CRM Create Case. A disabled button with no message cannot announce anything, and a disabled control is typically skipped by the tab order entirely, so an AT user gets **no signal at all** about what is wrong.
- **📌 Report the blocked steps as `SKIPPED`, not `FAILED`.** Per RULES.md §5 the run is `PARTIAL` if the reachable assertions pass. Do not let the address blocker mask the accessibility result — record steps 1–2 and 5–6 properly.
- **📌** Check focus visibility against a real contrast requirement, not just "something happens" — AntD's default focus ring is easy to lose against this portal's styling.
- **❓ Question for Thabiso:** is WCAG 2.1 **AA** the contractual target for this portal? For a South African government service it usually is, and it changes whether these are defects or advisories.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #102160 | TC-14W-001 | ⚠️ **partial — run steps 1–2 and 5–6 now** |

**Not in this plan** (Functional suite 102151, 10 cases, to import later). The Education & Awareness area has its own accessibility suite too — 15W, 4 cases.
