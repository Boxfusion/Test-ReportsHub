# Report: Appeals 11A — Admin and Tribunal

**Date:** 2026-08-14 07:35 UTC
**Plan:** test-plans/appeals/11a-appeals-admin-tribunal.md
**Spec:** test-plans/appeals/11a-appeals-admin-tribunal.spec.ts
**Execution Mode:** ai-repair
**Result:** PARTIAL — TC-11-007 passes; TC-11-008 and TC-11-012 need an appeal we own, which cannot be created
**Duration:** ~300s
**Cases:** TC-11-007
**Assessed-not-executed:** TC-11-008, TC-11-012
**Environment:** QA · admin portal · view mode **Latest**

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 7 | 4 | 0 | 3 |

## Step Results

### TC-01 — Admin sees all appeals and can filter by type (ADO #101779 · TC-11-007)
**Mode:** ai-repair
**Duration:** ~300s

- [PASS] `CRUDS → Appeals` (`/dynamic/boxfusion.dsdnpo/appeal-table`) renders **`1-10 of 26 items`**
- [PASS] Columns present: **Ref Number · NPO Status · Organization Name · Type Of Appeal · Submitter · Status ·
  Creation Time**
- [PASS] **(BLOCKING)** Filtering by type `Refusal To Register` narrows the register **26 → 16**, and **every visible
  row carries `Refusal To Register`** (asserted per row)
- [PASS] Clearing the filter restores exactly **26**

**Reference data observed.** `Type Of Appeal` values include `Refusal To Register` (and blanks on some rows).
`Status` values include **`Upheld`, `Denied`, `In Complete`**. `NPO Status` values include `Registered`,
`Application Failed`, `Deregistered` — so the register does span the lifecycle.

**Same caveat as every other grid:** there is no type-specific filter control. The funnel icon opens nothing;
filtering is the free-text `.sha-global-table-filter` quick-search. The case passes on outcome, not via a
type filter.

⚠️ **Some rows have a blank `Type Of Appeal`** (e.g. `APPEAL029/04/08/2026`, `APPEAL057/27/09/2025`) — worth asking
whether type is mandatory on capture, since an untyped appeal cannot be routed by type.

---

### TC-02 — Send to Chairperson emails the appeal and moves it to Case Preparation (ADO #101780 · TC-11-008)
**Mode:** not executed
- [SKIPPED] All assertions — **no appeal of our own exists to action.**

### TC-03 — Tribunal records an Upheld outcome for a refusal-to-register appeal (ADO #101784 · TC-11-012)
**Mode:** not executed
- [SKIPPED] All assertions — same reason.

## Why TC-11-008 and TC-11-012 could not run

Both need an appeal in an actionable state. All **26** appeals in the register belong to other testers
(`Welcomed Galane`, `Cinisile Mogane`) or to seed data, and several are already in terminal states (`Upheld`,
`Denied`). Driving *Send to Chairperson* or recording a tribunal outcome on someone else's record would corrupt
their test data, so it was not done.

The intended source of an appeal we own is a **denied application of ours**, and we now have exactly that —
**APPL26-01106 is `APPLICATION UNSUCCESSFUL`**. But no submitter-side route to lodge an appeal against it could be
found (see the 11P report). So the chain is broken at its first link, and the two admin cases are blocked behind
suite 11P rather than behind anything on the admin side.

## Questions for the test lead (Thabiso)
1. **How is an appeal meant to be created?** If there is no submitter entry point (11P report), is an appeal raised
   by DSD staff on the applicant's behalf, or by a channel we have not found?
2. **May QA action one of the existing 26 appeals?** If some are disposable seed records, name one and TC-11-008 and
   TC-11-012 can both run immediately. We will not touch another tester's record without that.
3. **Should `Type Of Appeal` be mandatory?** Several existing rows have none.
