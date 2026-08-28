# Report: NPO-14C-F — Session / read-only / access control (functional) — submitter edit correctly blocked; the "Read only" role does not exist

**Date:** 2026-08-28 06:40 UTC
**Plan:** test-plans/cross-cutting/14c-session-access-control-functional.md
**Execution Mode:** ai-mcp
**Result:** PARTIAL — the two cases left unverdicted in this suite are now run, and **both blockers recorded on 2026-08-25 were stale**. **TC-14-009 PASSES**: a submitter is offered no route whatsoever to edit an application at `applicationStatus 10` — the dashboard shows *"All Done!"*, the profile view is read-only, and the workflow inbox holds 0 items. **TC-14C-005 FAILS**: its step 1 expects *"Role seed present"* for a **"Read only"** role, and that role **does not exist** — the registry holds exactly 46 roles and none matches, confirmed against the grid's own endpoint with a working search as the control.
**Duration:** ~700s
**Cases:** TC-01 (TC-14-009), TC-05 (TC-14C-005)
**Environment:** QA · public portal + admin portal · admin view mode **Latest** · application **APPL26-01570** (`6c02e52c-6799-4180-8b5c-9b84a5884aa4`, `applicationStatus 10`)
**Accounts used:** `npo.qa.applicant.b@example.org` (Account B) · shared dev account (admin portal, role registry read)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 2 | 1 | 1 | 0 | 0 |

Both cases had been excluded from coverage since 2026-08-25. Neither blocker survived contact.

---

### ✅ TC-01 — Submitter cannot edit an application not in an editable state (#101821 · TC-14-009) — PASSED

Recorded on 08-25 as *"Not driven in this run… Cheap; it simply was not reached."* It has now been driven.

**Specimen.** APPL26-01570, owned by Account B, read back from the grid's own endpoint as
`applicationStatus: 10` (OB Failed Compliance) — a state under departmental assessment, not with the applicant.

- **[PASS] (BLOCKING) The UI blocks editing.** Three independent routes were tried as the submitter, and none
  offers an edit:
  1. **Dashboard** (`npo-landing-view` v86) — renders *"All Done! You're all caught up, there's no new actions."*
     The only controls are `View NPO Profile` (read) and `Submit Query`.
  2. **Profile view** (`public-npo-details-view` v4) — eight tabs of application data rendered as **static text,
     not inputs**. The only enabled inputs on the page are grid search boxes; both declaration checkboxes are
     `disabled`. No Edit, Save, Withdraw or Resubmit control exists anywhere on the form.
  3. **Workflow inbox** (`Shesha.Workflow/workflows-inbox` v12) — **`0 items found`**. With no todo item there is
     no `workflow-action?id=…&todoid=…` route back into the wizard, which is the only path by which this
     application was ever editable.
- **[RECORD] No rejection is surfaced — because no action is offered.** The case's second assertion asks whether a
  rejection is shown or silently swallowed. Neither happens: the application is protected by **absence of any
  control**, not by a guard that refuses an attempt. That satisfies the ADO expected result (*"UI blocks edit"*)
  but it is worth stating precisely — nothing was tested that *refuses*; there is simply nothing to press.
- **N/A — the API half.** *"API rejects PATCH attempts with 403/409"* is a direct API assertion and is excluded
  by the project's black-box rule. Marked N/A rather than skipped silently.

📌 **A caveat that cuts the other way, and belongs with TC-07-008.** Status 10 is the state FDS 8.4 rule 2b
contemplates a **resubmission** from. The applicant is offered no resubmission path either — the same screens that
correctly refuse an *edit* also withhold the *fix-and-resubmit* journey. This is consistent with the 08-27 finding
that no resubmission notification is raised at this transition. TC-14-009 passes on its own terms; the resubmission
gap is a separate, already-recorded concern and is **not** re-raised here.

---

### 🔴 TC-05 — Read-only role cannot mutate (#107430 · TC-14C-005) — FAILED

**The 08-25 blocker is withdrawn.** It read: *"We hold a single shared account that is broadly privileged… there is
no read-only identity to test with"*, and called a role-scoped account *"the highest-leverage environment request we
have"*. We have since proved (08-26) that QA can self-serve any role. So the case was re-approached — and the
obstacle turned out not to be our accounts at all.

- **[FAIL] Step 1's expected result — *"Role seed present."* — is false.** There is **no "Read only" role** in this
  build. Evidence, UI first:
  - `Shesha/roles-table` v21 (admin portal, view mode **Latest**) reports **`1-10 of 46 items`**.
  - The grid's own data call — `Entities/GetAll?entityType=Shesha.Core.ShaRole` — returns `totalCount: 46`, and
    **none of the 46 names is "Read only"**. The full list was enumerated, not sampled.
  - `quickSearch=read` → **0 results**. `quickSearch=Read only` → **0 results**. Both search name *and* description.
- 🔑 **The zero was verified against a working control, not assumed.** A search returning nothing is worthless
  evidence unless the search works. `quickSearch=Registry` returns **2** (`Dsd.Npo.Registry Clerk`,
  `Dsd.Npo.Email Registry Clerk`) and `quickSearch=Reviewer` returns **3**. The search is sound, so the 0 for
  *read* is a real zero.
- The nearest names are `Dsd.Npo.Reviewer` and `Investigation Reviewer`. Both are functional workflow roles with
  write duties, **not** a read-only seed, so neither is a substitute.
- **N/A — steps 2 and 3.** Both are direct API mutations (`OrganisationLocations/CreateAsync`, DELETE variants)
  and are excluded by the black-box rule. The plan's fallback — *"drive the equivalent action through the UI and
  record whether the control is even offered"* — **cannot be performed either**, because there is no user to
  perform it as.

**Why FAILED and not BLOCKED.** Step 1 is an assertion about the build, and it is fully testable black-box: the role
registry is readable and complete, and it does not contain the role. Recording this as *blocked* would keep implying
a QA-environment shortfall that no longer exists. The honest reading is that the case tests a seed that was never
shipped.

**❓ Question for Thabiso.** Was a **"Read only"** role ever seeded, or has the concept been superseded by the
per-role permission model? If it is not coming, #107430 needs a rewrite rather than a re-run — and the same applies
to any sibling case that names it.

---

## Corrections to earlier records

- **The 08-25 note that this missing role *"blocks ~10 cases in suite 14Z (Class B)"* should be read narrowly.**
  Suite 14Z Class B needs *ordinary unprivileged* users, which Accounts A and B already provide; it does not need a
  **"Read only"** role. The 14Z cases that remain open are held up by missing endpoints, unsafe mutations on shared
  QA, and one sensitive case — not by this seed. Those blockers are unchanged by today's run.
- **TC-14-009 was never blocked**, only unreached. Recording it as excluded for three days overstated the blocker
  count by one.

## Method notes
- Application status was read from the grid's **own** endpoint (`NpoApplication/Crud/GetAll`), captured from the
  page's network traffic rather than guessed — an earlier guess at
  `Boxfusion.Dsd.Npo.Domain/NpoApplication/Crud/Get` returned 404.
- View mode was switched **Live → Latest** on the admin portal before the role registry was read. The public portal
  offers no such switcher to an ordinary applicant account.
- No records were created, modified or deleted during this run.

## 📌 Incidental observations (not defects)
- `npo-landing-view` issues `NpoApplication/Crud/Get?id=<npoId>` — passing the **NPO** id to an **application**
  lookup — and takes a **404** on every dashboard load. Harmless to the user; the page recovers via a second,
  correct `GetAll`. Logged for the observations file, not raised.
- The dashboard briefly renders *"Draft Application"* and *"Resubmit Annual Compliance Submission"* during
  hydration before settling to *"All Done!"*. Transient; the settled state is the true one. **Read the settled DOM,
  never the first paint.**
- `View NPO Profile` renders with an empty `?id=` in its href pre-hydration; the id is present by click time. **A
  rendered attribute is not evidence** — the link works.

## 🔑 Harness gotcha worth carrying forward
A Shesha grid's **`quickSearch` persists in `localStorage` per table and survives a full page reload while the input
box renders empty.** A stale value from an earlier interaction left the Roles grid reading *"No Data"* across
several reloads, which looked exactly like a broken screen. It is **browser-local only** — it never touched server
state and could not have affected another user. Two near-misses came out of it, both avoided:

1. *"The roles quick search is broken"* — **wrong**; the control search proved it works.
2. *"Changing page size empties the grid"* — **wrong**; the stale filter was the cause both times.

Related: `pressSequentially` **appends** to whatever the box already holds (the field became `Registryread`), and
`fill()` leaves React state stale. Clear with a real click → `Ctrl+A` → `Delete`, and confirm against the grid's
outgoing request, not the input's value.
