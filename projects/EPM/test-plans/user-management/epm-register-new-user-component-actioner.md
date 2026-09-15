# EPM — New User can be assigned as a Component Actioner immediately after registration

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109504 — *03 · EPM · User Management — Register New User with credentials and mobile number, ready for Component Actioner and Sha Role appointment*
**Parent suite:** Phase 01 · EPM · Foundation · Reference Data
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation (corrected live, 2026-08-27 — see Preconditions):** Manage Performance Report › Open report ›
**Build Tree** › expand the tree fully › click the KPI component › **Component Actioners** tab › **Add** ›
open the **Actioner** dropdown and select the newly-registered user › **Actioner Level: Outstanding**
(Stage 1 / action level 20) › **Save**.

> Mirrors a single ADO test case from suite 109504. **ADO is canonical.** Steps are transcribed verbatim
> from `Microsoft.VSTS.TCM.Steps`.

## TC-109448 — New User can be assigned as a Component Actioner (Stage 1..5) immediately after registration

**ADO ID:** 109448 · **Point:** 31266 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; integration
**Coverage dimension:** Integration

### Preconditions
- A user has just been created. Originally fulfilled by this spec registering one as its own setup
  step (reusing the flow from `epm-register-new-user.md` / TC-109445); changed 2026-08-27 to instead
  reuse a real, already-registered user — see the notes below for why.
- ADO's steps refer to opening "a Key Performance Indicator Component". QA confirmed the concrete click
  path: **Manage Performance Report → Open report → Build Tree → expand → click the KPI component node →
  Component Actioners tab.** Originally used **Emmanuel_QKPI** in the sole report then in QA
  ("Emmanuel_Test_Report", 2026-08-12) — both are gone now (confirmed live 2026-08-27: that report id
  404s; QA holds 27+ reports today). Two re-picks followed: a **Published** report's details view offers
  "Unpublish Performance Report" instead of "Build Tree" (Planning-only action); then a shallow
  Department→KPI tree (skipping Programme/Sub Programme) whose Component Actioners grid never rendered
  any row, which briefly looked like an app defect until the user identified the real rule — **the grid
  only populates for a KPI at the bottom of a complete 4-level tree**
  (`Department > Programme > Sub Programme > KPI`). Settled on the **"Princess"** report
  (`bc34f55d-bb32-4629-bd74-3e03250e4784`, status 10/Planning) → KPI **"Percentage compliance with
  statutory prescripts"**, whose own `fullIdPath` confirms exactly that 4-level shape. Re-check the same
  way (inspect the candidate KPI's `fullIdPath` segment count, not just "any Planning report with a KPI
  in it") if this target is ever published/modified out from under this spec.
- No admin list page for Performance Report was found in the sidebar menu ("Report on progress" —
  `/dynamic/Epm/kpi-component-progress-report-v3` — is a personalised inbox-style view and showed 0 items
  for this account). The spec navigates directly to
  `/dynamic/Epm/performance-report-details-view?id=<report id>` to open the report, which is where
  "Build Tree" lives — functionally equivalent to "Open report".
- **"View Tree" does not exist on this app** — the original spec's locator for it was simply wrong
  (unclear if ever correct, or a stale label from an earlier UI). Every other spec in this test suite
  reaches the tree builder via **"Build Tree"**, confirmed 2026-08-27; this case now matches that
  established pattern, including the click-and-confirm-navigation retry loop (the first click sometimes
  doesn't register).

### Steps

| # | Action | Expected |
|---|--------|----------|
| 2 | Open a Key Performance Indicator Component and add a Component Actioner row. | User dropdown includes the newly-created user. |
| 3 | Assign the user at Stage 1 (action level 20). | Component Actioner row saved with the new user. |

> ADO's step numbering starts at 2 (step 1 is the implicit "open the KPI component's Component Actioners
> tab and click Add" precondition).

### The "Add component actioner" form
Two mandatory fields, confirmed live in QA:

| Field | Type |
|---|---|
| Actioner\* | searchable select (person) |
| Actioner Level\* | select — **"Outstanding"** is the label for **action level 20 / Stage 1** (existing
  rows in QA confirm the level↔label mapping: 20=Outstanding, 30=Awaiting Level One QA, 40=Awaiting Level
  Two QA, … 86=Awaiting Level Eight QA). |

The existing Component Actioners grid for Emmanuel_QKPI already has **two** actioners at level 20
("Outstanding") before this run (`lvl outstanding`, `Bonolo Nthejane`) — the level is not a unique
constraint, so adding a third does not conflict.

### PASSES clean (live, 2026-08-27) — Component Actioners grid works correctly on a complete tree

The "View Tree" action named in this case's original navigation doesn't exist — the real button across
this whole suite is **"Build Tree"** (corrected 2026-08-27, matches every other spec that reaches the
tree builder).

Reused a real, already-registered user ("Tester Testing", created manually by the QA lead) as the
Actioner instead of registering a fresh one per run — this suite's own TC-109445 already covers
registration, and repeated auto-generated `TC448 User<token>` names from earlier failed runs today had
begun colliding in the Actioner search dropdown. Per QA guidance: when a case sits in the same suite as
a Register New User case, reuse a simple, stable name rather than minting a new disposable one per run.

**A false-defect scare, corrected the same day**: an earlier target ("Fresh Test KPI", a KPI sitting
directly under a Department with no Programme/Sub Programme in between) made the Component Actioners
grid render "0 items found / No Data" regardless of add — both baseline (6 real pre-existing
ComponentActioner rows via the API, 0 shown) and after a full re-navigation post-Save. This looked like
a confirmed UI defect. **The user identified the real cause**: the grid only populates for a KPI at the
bottom of a complete 4-level tree. Re-pointed at "Princess" → "Percentage compliance with statutory
prescripts" (confirmed 4 levels deep via `fullIdPath`) and the grid worked correctly on the very first
try — the row appeared immediately after Save, both before and after a reload, no soft-assert fallback
needed. See [[epm-component-actioner-grid-no-data-defect]] (now retracted) for the full trail.

**Verdict**: both the save/persist path and the display grid for Component Actioners work correctly.
ADO's step-3 expectation ("Component Actioner row saved with the new user" as a visible row) passes as a
genuine hard assertion — no workaround needed once the target KPI sits in a complete tree.

### Notes
- **Writes 1 ComponentActioner row per run** (against the reused "Tester Testing" user, on the real
  "Percentage compliance with statutory prescripts" KPI in the "Princess" report) — no teardown,
  mirroring TC-109445/109446/109447. No new user/Person is created by this case any more (see above).
