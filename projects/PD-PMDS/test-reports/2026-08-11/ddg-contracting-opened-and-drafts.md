# PMDS DDG Performance Agreement — Contracting opened, all 4 assigned workflows completed

**Date:** 2026-08-11
**Cycle:** **Deputy Director General Performance Agreement**, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Refs:** PA2026/6619 (Kabelo Mabalane) · PA2026/6615 (Gail Mabalane) · PA2026/6617 (Thando Zide) · PA2026/6609 (Hennie Kruger)
**Result:** PASSED — all 4 assigned workflows completed end-to-end to Generate PERSAL Input; 3 defects raised on the draft wizard

## Context

First run against the **DDG cycle** — a different cycle to SL 1-12 (which Lerato was working on
concurrently and which this run deliberately did not touch). The DDG population is **6 employees**
against SL 1-12's 43.

Workflow assignments came from the test lead:

| User | Login | Employee | Assigned workflow | Outcome |
|---|---|---|---|---|
| KabeloM | `KabeloM` | Kabelo Mabalane, Deputy Minister | Positive | ✅ Generate PERSAL Input |
| Gail | `Gail` | Gail Mabalane, Deputy Premier | Positive | ✅ Generate PERSAL Input |
| ThandoZide | `ThandoZide` | Thando Zide, Premier | Negative 1 — resolved dispute | ✅ Generate PERSAL Input |
| Hennie Kruger | **`GOV016`** | Hennie Kruger (Persal GOV01600) | Negative 2 — escalated dispute | ✅ Generate PERSAL Input |

⚠️ The login for Hennie Kruger is **`GOV016`**, not `Gove016`. **Lerato SCHREIBER = `55435009`**.
All DDG passwords are `123qwe`.

## Steps executed (live, headed)

1. **Admin — Open Contracting process.** SL 1-12 left untouched. DDG cycle → Manage Process →
   **Open process**, Submission **2026-08-31** / Closing **2026-09-30**, initiate **immediately**.
   Settled at **6 Total / 0 Not Started / 6 In progress**.
   ⚠️ The stats tile **lagged badly** — it sat at "NOT STARTED, 1 In progress" for ~35 s after the
   dialog closed and only showed the true 6/6 after a hard page refresh.
2. **Positive — Kabelo Mabalane** (PA2026/6619). Draft (blocked at Confirm Details, see Defect 1;
   proceeded after assigning **Babalwa M** as Alternative Mediator + reason) → 4 KRAs @ 25%
   (Total 100%), 4 CMCs, 8 key activities, 1 PDP → Submit → **Lerato SCHREIBER Sign** →
   **SalesHR Verify** → **Generate PERSAL Input**.
3. **Positive — Gail Mabalane** (PA2026/6615). Draft → **Thando Zide Sign** → **SalesHR Verify** →
   **Generate PERSAL Input**.
4. **Negative 1 — Thando Zide, resolved dispute** (PA2026/6617). Draft → **Kabelo Mabalane Refer for
   Dispute** (comment-gated Yes) → **Lerato SCHREIBER mediator "The disagreement has been resolved"**
   + comment → Submit → **Thando Update with Outcomes** → **Kabelo Review Updated** → **SalesHR Verify**
   → **Generate PERSAL Input**.
5. **Negative 2 — Hennie Kruger, escalated dispute** (PA2026/6609). Draft → **Babalwa M Refer for
   Dispute** → **Sampha Sampha mediator "not resolved"** (mandatory Comments + Attachments;
   `mediation-outcome-escalated.txt` uploaded with the post-upload wait guard — **Submit first click,
   no 500**) → escalated to **Tania Smith (`Tester97`)** as *Mediator Supervisor Review* → she selected
   **"resolved"** → **Approve** → **Hennie Update with Outcomes** → **Babalwa M Review Updated** →
   **SalesHR Verify** → **Generate PERSAL Input**.

## The DDG hierarchy (discovered live)

| Employee | Supervisor | Mediator |
|---|---|---|
| Kabelo Mabalane (Deputy Minister, SL15) | Lerato SCHREIBER (Minister of Technology, **SL5**) | **none — blank** |
| Gail Mabalane (Deputy Premier, SL15) | Thando Zide (Premier, SL15) | Kabelo Mabalane (SL15) |
| Thando Zide (Premier, SL15) | Kabelo Mabalane (SL15) | Lerato SCHREIBER |
| Hennie Kruger (SL16) | Babalwa M (Chief Director, SL14) | Sampha Sampha (Director of Engineering, SL13) |

The chain is largely **circular** (Kabelo ↔ Thando supervise each other's PAs) and **salary levels run
backwards** in places — a Minister at SL5 supervising an SL15 Deputy Minister; an SL14 Chief Director
supervising an SL16. Flagged as a data question for the test lead, not raised as a defect.

**Escalation tier confirmed:** above mediator **Sampha Sampha** sits **Tania Smith (`Tester97`)**, whose
task is *"Mediator Supervisor Review Disagreement and attempts to resolve"* with an **Approve** action
(the mediator level uses **Submit**). Same two-tier pattern as SL 1-12.

**HR verification for DDG is `SalesHR`** — the same role as SL 1-12 Contracting, not a separate DDG verifier.

## Structural differences vs SL 1-12

- **The GAF section is different.** SL 1-12 lists 10 individually-checkboxed Generic Assessment
  Factors. The DDG form lists the **SMS Core Management Criteria** in a 3-column table —
  **Name | Process Competencies | Development Required** — 5 rows, with the two name columns holding
  *different* criteria (Financial Management / Service Delivery Innovation, Project and Programme
  Management / Communication, Change Management / Problem Solving and Analysis, People Management and
  Empowerment / Client Orientation, Strategic capability and Leadership / Knowledge Management) but only
  **one checkbox per row**. So only the "Name" column can be flagged for development; the 10 criteria
  cannot be selected independently. **Question for the test lead:** is Process Competencies meant to be
  reference-only, or has it lost its checkbox?
- The step's hint still reads *"Check a minimum of 4 or a maximum of 6 GAFs"*, but the form exposes
  only **5** checkboxes — the stated maximum is unreachable.
- The **PDP step arrives pre-populated** with a row *"Service Delivery Improvement / Coal-face
  Deployment to Service Site"* that has **no Commencement Date**. SL 1-12's PDP starts empty.

## Defects raised

All three are the same shape — a mandatory value gates progression with **no validation message**.
See `bugs/2026-08-11-ddg-silent-validation-blocks-draft-wizard.md`.

1. **Blank default mediator blocks Confirm Details silently.** Assigning an Alternative Mediator
   unblocks it immediately, proving causation.
2. **PDP step silently blocks on the pre-seeded row's missing Commencement Date** (confirmed by the
   test lead). Console shows `Create failed … errorFields: Array(3)` and
   `TypeError: Cannot read properties of undefined (reading 'tableData')` thrown out of
   `executeBooleanExpression` — the Next enable-expression.
3. **The step additionally requires a user-added PDP.** Completing the pre-seeded row's date is not
   sufficient; Next only enables once at least one PDP is added via **Add PDP**.

**Working recipe:** on Confirm Details assign an Alternative Mediator + reason when the default is
blank; on the PDP step open the pre-seeded row via its row **search icon**, set the Commencement Date,
Save, then add at least one PDP of your own.

## Final cycle state

Contracting card: `6 Total · 0 Not Started · 1 In progress · **5 Completed**`.

Employee List: Kabelo PA2026/6619, Gail PA2026/6615, Thando PA2026/6617 and Hennie PA2026/6609 all at
**Generate PERSAL Input**. The 5th completion, **PA2026/6613 (W van Zyl)**, was not part of this test
set. **S Maluleke PA2026/6611** remains at Draft (unassigned).

**Completed tile = 5 against 5 genuine completions — no over-count here**, consistent with the
SL 1-12 over-count being specific to the "Dispute Unresolved" terminal, which this cycle has none of.

## Environment

- All DDG logins use password `123qwe`. Hennie Kruger = **`GOV016`**; Lerato SCHREIBER = **`55435009`**.
- Frontend `pd-hcm-adminportal-qa.shesha.app`; API `pd-hcm-api-qa.shesha.app`.
- Attachment fixture: `.playwright-mcp/mediation-outcome-escalated.txt` (gitignored).
