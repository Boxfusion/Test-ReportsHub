# Test Plan: NPO-15 — Education & Awareness (smoke)

> **Status:** Imported from Azure DevOps — ✅ **reachable now**
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 150s

## Metadata
| Field | Value |
|-------|-------|
| App URL | Admin: https://dsd-npo-adminportal-qa.shesha.app/login · Public: https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe (both portals) |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=107359) |
| ADO Suite | 107359 — *15 - Education & Awareness - Smoke* (4 cases) |

## Objective
> Verify the Education & Awareness critical paths across both portals: an admin can reach the E&A dashboard and add an intervention, and an NPO user can open a library on the public portal and download a published content item.

## Reachability
✅ **Fully reachable today, and cross-portal.** None of these cases needs a registered NPO or a submitted application:
- **Admin** — `Education and Awareness → Interventions / Content Libraries / Content Administration` all exist, and *Interventions* has an **Add Intervention** action, so TC-03 can create our own record.
- **Public** — the portal exposes *Education and Awareness (Libraries)*, and the POPIA consent gate already refers to the library, so content should exist.

**This is the highest-value suite to run right now** — it is the only one in the smoke plan that is both unblocked and includes a **create** action.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. All four cases are **`L1-draft`** and carry Thabiso's note: *"Needs L3 execution to promote to Ready-for-run"* and *"Suite-level auto-mapping applied by batch script. L3 reviewer should refine per-TC to specific FDS subsection + specific file:line."*

⚠️ **These cases are thinner than the rest of the plan** — one step each, with FDS anchors mapped at suite level rather than per case. Treat the expected results as directional. Executing them **is** the L3 validation Thabiso is asking for, so record what each screen actually does in enough detail to sharpen the cases afterwards.

Source FDS: `NPO_Education&Awareness_FunctionalDesignSpecifications_v0.1`.

## Preconditions
- [ ] 🔑 View mode **Live → Latest** after login, on **both** portals
- [ ] At least one library with published content exists (TC-02, TC-04)
- [ ] A file available to attach if Add Intervention requires one

## Test Cases

### TC-01 — Admin can sign in and reach the E&A Dashboard (ADO #107404 · TC-15-001)

*Priority 2 · `L1-draft`.* ✅ Runnable now.

- **Type:** Happy path (navigation)
- **Steps:**
  1. Sign in to the **admin** portal; switch view mode **Live → Latest**
  2. NAVIGATE to the **Education & Awareness dashboard**
  3. WAIT for it to render
  4. ASSERT (BLOCKING) the dashboard loads
  5. ASSERT **at least one library is visible**
- **Expected result:** *"Dashboard loads; at least one library visible."*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the E&A dashboard loads
  - [ ] ASSERT at least one library is listed
- **📌** RECORD the dashboard's widgets and figures — the case prescribes only "at least one library", so everything else is reporting that will sharpen the case later.
- **📌** Grids here are `sha-react-table`. Use `[role=table]` / `[role=row]`, never `.ant-table*`.

---

### TC-02 — NPO user can sign in and open a Library on the portal (ADO #107405 · TC-15-002)

*Priority 2 · `L1-draft`.* ✅ Runnable now.

- **Type:** Happy path (navigation)
- **Steps:**
  1. Sign in to the **public** portal; switch view mode **Live → Latest**
  2. Open **Education and Awareness → Libraries**
  3. CLICK a library
  4. ASSERT (BLOCKING) the library's **content items list renders**
- **Expected result:** *"Library content items list renders."*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the content items list renders
  - [ ] ASSERT at least one content item is listed
- **📌** RECORD what a content item shows — title, type, size, date. TC-04 needs to identify a **published** item, and neither case says how published items are distinguished from unpublished ones.
- **📌 Worth checking while here:** the POPIA gate's second consent checkbox asserts the applicant *"has gone through all the content uploaded under the Public Portal library"*. Confirm that library is reachable and populated — if it is empty, that consent is unsatisfiable in principle.

---

### TC-03 — Admin can add and submit an Intervention with all mandatory fields (ADO #107406 · TC-15-003)

*Priority 2 · `L1-draft`.* ✅ Runnable now — **creates our own record.**

- **Type:** Happy path (create)
- **Steps:**
  1. On the admin portal, NAVIGATE to **Education and Awareness → Interventions**
  2. CLICK **Add Intervention**
  3. SNAPSHOT — RECORD every field and which are mandatory
  4. Fill all mandatory fields *(free text ≤100 characters)*
  5. CLICK **Submit**
  6. API — capture the create request **and its response body**, including any non-2xx
  7. ASSERT (BLOCKING) the intervention is **persisted with status `Complete`**
  8. Re-open the interventions list and ASSERT the new record is retrievable
- **Expected result:** *"Intervention persisted with status Complete."*
- **Assertions:**
  - [ ] ASSERT the Add Intervention form opens and its mandatory fields are identifiable
  - [ ] ASSERT (BLOCKING) the intervention persists with status exactly `Complete`
  - [ ] ASSERT it is retrievable in the list after a reload
- 🔑 **Assert retrievability separately — this is the exact shape that failed before.** `CRM → Create Case` looked like it saved and persisted nothing: the modal closed cleanly, all mandatory fields set, and **0 records** existed afterwards. The cause is very likely the headline defect — a 400 with `validationErrors` that the UI silently discards. **Capture the POST body and the response**, and never treat a closing modal as proof.
- **📌** Watch for a modal whose submit button is **`Ok`** rather than a second *Add Intervention*. On the CRM form, clicking the opener again proved nothing and produced a retracted result.
- **📌** Date-stamp the intervention name so our own records are distinguishable: `QA Intervention <YYYY-MM-DD>`.

---

### TC-04 — NPO user can view and download a published Library content item (ADO #107407 · TC-15-004)

*Priority 2 · `L1-draft`.* ✅ Runnable now.

- **Type:** Happy path (download)
- **Steps:**
  1. On the **public** portal, open a library (TC-02)
  2. CLICK a **published** content item
  3. ASSERT the item opens/renders
  4. CLICK **Download**
  5. ASSERT (BLOCKING) the file downloads **without error**
  6. ASSERT the downloaded file is non-empty and of the expected type
- **Expected result:** *"File downloads without error."*
- **Assertions:**
  - [ ] ASSERT a content item can be opened
  - [ ] ASSERT (BLOCKING) the download completes without error
  - [ ] ASSERT the downloaded file is non-empty
- **⚠️** A **`500 /api/StoredFile/FilesList`** has been seen elsewhere on this build behind a documents control. If the download fails, check whether it is that same endpoint before classifying it as an E&A defect.
- **📌** Downloaded evidence that must ship belongs under `test-reports/`, never `test-results/` (gitignored).

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #107404 | TC-15-001 | ✅ yes |
| TC-02 | #107405 | TC-15-002 | ✅ yes |
| TC-03 | #107406 | TC-15-003 | ✅ **yes — and it creates our own record** |
| TC-04 | #107407 | TC-15-004 | ✅ yes |

**Not in this plan** (Functional plan, 40 cases across six suites, to import later): **15A** Interventions (8) · **15B** Library Topics & Content Lifecycle (10) · **15C** Dashboard & Analytics (4) · **15D** Portal Sign In / Sign Up (6) · **15E** Portal Library / FAQ / Contact (6) · **15E2E** End-to-End Content Lifecycle (2) · **15W** Accessibility (4) · **15Y** POPIA & Security (4).
