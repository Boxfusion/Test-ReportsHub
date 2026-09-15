# Test Plan: NPO-15B-F — E&A Library Topics & Content Lifecycle (admin, functional)

> **Status:** Imported from Azure DevOps 2026-08-18 — 10 admin cases (ADO suite 107353). This is the **admin side that
> creates the libraries/content** consumed by the public suite 15E. UI-only scope. Create **our own** synthetic library
> + content; do not touch existing production-looking libraries.
> **Owner:** QA
> **Last Updated:** 2026-08-18
> **Estimated Duration:** 1500s

## Metadata
| Field | Value |
|-------|-------|
| App URL | Admin: https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe (broad admin) |
| Lead tester | **Thabiso Kegakwile** |
| ADO Suite | 107353 — *15B E&A Library Topics & Content Lifecycle (Admin)* (10 cases) |

## Objective
> Verify the admin Library lifecycle: create/configure a Library (admins, content types, approval routing), the tree +
> library index, add content within the allowlist → send for approval, the Incoming-Items approver queue, and the
> approve-publishes / decline-to-Draft checklist gating. Content published here should then appear in the public 15E view.

## 🔑 Context
- **Pairs with 15E** (public library/FAQ/content) — a piece of content published here should surface at the public
  `public-flattened-content-items`. 15E already showed the public read side (Downloads counter works; no Like).
- ⚠️ **Role-gating cases (TC-01) need role-scoped users** — we hold only the broad admin account (standing project
  dependency). Record the positive half (admin sees the menu) and defer the negative half.
- ⚠️ **Upload binding gotcha:** Shesha AntD Upload — inject via a real `setInputFiles`/click on the visible control,
  not the hidden input ([[shesha-upload-automation-gotcha]]). Keep free text ≤100 chars.

## Test Cases

### TC-01 — Library Topics menu gated to authorised roles (ADO #107374 · TC-15B-001)
*P2 · Src:FDS · Admin.* ⚠️ Partial — needs a non-privileged user for the negative half.
- **Steps:** 1. As a user WITHOUT Library-manage → menu hidden · 2. As a user WITH → menu visible.
- **Assertions:** [ ] RECORD that our admin sees Library Topics · [ ] negative half deferred (no role-scoped user).

### TC-02 — Add Library: details, admins, content types, approval routing (ADO #107375 · TC-15B-002)
*P2 · Src:FDS · Admin.* ✅ Runnable (create our own).
- **Steps:** 1. Library Topics → Add Library · 2. Name = "QA Test Library (synthetic)"; assign content admins; allowed
  types (PDF/DOC/MP4); approval routing (Approver + Escalation) · 3. Save.
- **Assertions:** [ ] config form opens · [ ] fields accepted · [ ] (BLOCKING) new library appears as a tree node.

### TC-03 — Library Topics tree view, expandable nodes (ADO #107376 · TC-15B-003)
*P2 · Src:FDS · Admin.* ✅ Runnable.
- **Steps:** 1. Navigate to Library Topics (≥2 libraries exist).
- **Assertions:** [ ] libraries listed as expandable nodes · [ ] expanding shows content items.

### TC-04 — View Library: status (Created/Retracted) + actions (ADO #107377 · TC-15B-004)
*P2 · Src:FDS · Admin.* ✅ Runnable.
- **Steps:** 1. Click a library in the tree.
- **Assertions:** [ ] detail opens; status shown · [ ] actions incl. Publish / Edit / Add new item.

### TC-05 — Add Library Content (allowed type) → send for approval (ADO #107378 · TC-15B-005)
*P2 · Src:FDS · Admin.* ✅ Runnable (upload).
- **Steps:** 1. Library detail → Add new items · 2. Title + description; attach a PDF within the allowlist;
  duration = 12 months; Save & Send for Approval.
- **Assertions:** [ ] dialog opens · [ ] (BLOCKING) content created with status "Awaiting Approval" · [ ] RECORD
  approver notification.

### TC-06 — Content expiry notification 1 month before expiry (ADO #107379 · TC-15B-006)
*P2 · Src:FDS · Admin.* ⛔ BLOCKED — time-travel + NotificationMessage.
- **⛔** Needs clock control; SMS is dead, email may work. Defer; verify via `NotificationMessage` if possible.

### TC-07 — Content lifecycle states (ADO #107380 · TC-15B-007)
*P2 · Src:FDS · Admin.* ⚠️ Partial — Expired needs time.
- **Steps:** Awaiting approval → (approve) Awaiting publication/Published → (duration end) Expired.
- **Assertions:** [ ] drive create→approve→publish and RECORD each status · [ ] Expired deferred (time).

### TC-08 — Incoming Items inbox = approver queue (ADO #107381 · TC-15B-008)
*P2 · Src:FDS · Admin.* ✅ Runnable (observation).
- **Steps:** 1. As approver, open Incoming Items.
- **Assertions:** [ ] Incoming Items visible · [ ] grid shows Awaiting-approval items for this approver.

### TC-09 — Approver checklist → Approve publishes (ADO #107382 · TC-15B-009)
*P2 · Src:FDS · Admin.* ✅ Runnable (on our own content from TC-05).
- **Steps:** 1. Open an Incoming item · 2. Tick every checklist criterion → Approve.
- **Assertions:** [ ] preview + checklist shown · [ ] (BLOCKING) status → Published · [ ] appears in public portal.

### TC-10 — Approver Decline (unmet checklist) → back to Draft (ADO #107383 · TC-15B-010)
*P2 · Src:FDS · Admin.* ✅ Runnable (on our own content).
- **Steps:** 1. Open an Incoming item; leave one criterion unticked · 2. Enter decline reason → Decline.
- **Assertions:** [ ] Decline enabled with reason required · [ ] (BLOCKING) status → Draft · [ ] RECORD author
  notification with the reason.

## Coverage against ADO
| Plan case | ADO | TC id | Runnable? |
|---|---|---|---|
| TC-01 | #107374 | TC-15B-001 | ⚠️ partial (role-scoped) |
| TC-02 | #107375 | TC-15B-002 | ✅ |
| TC-03 | #107376 | TC-15B-003 | ✅ |
| TC-04 | #107377 | TC-15B-004 | ✅ |
| TC-05 | #107378 | TC-15B-005 | ✅ |
| TC-06 | #107379 | TC-15B-006 | ⛔ time/notification |
| TC-07 | #107380 | TC-15B-007 | ⚠️ partial (time) |
| TC-08 | #107381 | TC-15B-008 | ✅ |
| TC-09 | #107382 | TC-15B-009 | ✅ |
| TC-10 | #107383 | TC-15B-010 | ✅ |

**10 cases owned.**

## Suggested run order
1. **TC-01** (menu present), **TC-03** (tree), **TC-04** (view) — read-only orientation.
2. **TC-02** (Add our library) → **TC-05** (add content → Awaiting Approval) → **TC-08** (approver queue) →
   **TC-09** (approve → Published) / **TC-10** (decline → Draft, on a 2nd item) → **TC-07** (record states).
3. **TC-06** deferred.

## ADO anchors (machine-read — do not delete)
- ADO #107374 · TC-15B-001
- ADO #107375 · TC-15B-002
- ADO #107376 · TC-15B-003
- ADO #107377 · TC-15B-004
- ADO #107378 · TC-15B-005
- ADO #107379 · TC-15B-006
- ADO #107380 · TC-15B-007
- ADO #107381 · TC-15B-008
- ADO #107382 · TC-15B-009
- ADO #107383 · TC-15B-010

---

## ✅ Executed 2026-08-18 — library create works; content upload disabled (blocker) → lifecycle blocked
Report: `test-reports/2026-08-18/15b-library-content-lifecycle-functional--admin.md`
Bug: `bugs/2026-08-18-library-add-file-upload-disabled.md`

| Case | Verdict | Note |
|---|---|---|
| TC-01 (TC-15B-001) | ⏸ PARTIAL | admin sees the menu; negative half needs a role-scoped user |
| TC-02 (TC-15B-002) | ✅ PASS | New Library config matches spec; created "QA Test Library (synthetic)", Status=Created (list 6→7) |
| TC-03 (TC-15B-003) | ⏸ PARTIAL | **flat list, not an expandable tree**; folder/file hierarchy one level down |
| TC-04 (TC-15B-004) | ✅ PASS (note) | detail + Status shown; actions = New Folder/Add File/Delete/Submit (**≠** ADO Publish/Edit/Add-new-item) |
| TC-05 (TC-15B-005) | 🔴 FAIL | **Add File upload control DISABLED** on new + existing libraries → File required but can't upload → no content can be added. Likely regression |
| TC-06 (TC-15B-006) | ⛔ BLOCKED | expiry notification — time-travel |
| TC-07 (TC-15B-007) | ⛔ BLOCKED | lifecycle — no content can be created |
| TC-08 (TC-15B-008) | ⏸ PARTIAL | Incoming Items inbox exists (Workflows); empty; can't feed it |
| TC-09 (TC-15B-009) | ⛔ BLOCKED | approve — no content |
| TC-10 (TC-15B-010) | ⛔ BLOCKED | decline — no content |

🔑 **Upload disabled globally** (fresh + existing "Test MS Docs" library) — all existing content predates ~13 Aug →
matches the public-intake regression window. Admin URL: `boxfusion.content/manage-libraries-list`; detail:
`library-details-folder`. Content model is folder/file (Save/Publish), not the FDS content-item+approval lifecycle.
