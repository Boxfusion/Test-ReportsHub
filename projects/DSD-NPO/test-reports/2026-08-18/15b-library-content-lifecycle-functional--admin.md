# Report: NPO-15B-F — E&A Library Topics & Content Lifecycle (admin)

**Date:** 2026-08-18 16:20 UTC
**Plan:** test-plans/education-awareness/15b-library-content-lifecycle-functional.md
**Execution Mode:** ai-driven (Playwright MCP, live QA admin portal)
**Result:** FAILED — library create works; content upload is disabled (blocker) → lifecycle blocked
**Duration:** ~1100s
**Cases:** TC-15B-002, TC-15B-004
**Assessed-not-executed:** TC-15B-001, TC-15B-003, TC-15B-005, TC-15B-006, TC-15B-007, TC-15B-008, TC-15B-009, TC-15B-010
**Environment:** QA · admin portal (broad admin) · `boxfusion.content/manage-libraries-list`

## Summary
| Case | Area | Verdict |
|---|---|---|
| TC-15B-002 (TC-02) | Add Library: details/admins/types/routing | ✅ PASS |
| TC-15B-004 (TC-04) | View Library: status + actions | ✅ PASS (note: actions differ from ADO) |
| TC-15B-001 (TC-01) | Menu gated to authorised roles | ⏸ PARTIAL — admin sees menu; negative needs role-scoped user |
| TC-15B-003 (TC-03) | Tree view, expandable nodes | ⏸ PARTIAL — flat list, not an expandable tree |
| TC-15B-005 (TC-05) | Add content (allowed type) → for approval | 🔴 FAIL — **upload control disabled; cannot add content** |
| TC-15B-006 (TC-06) | Expiry notification 1 month before | ⛔ BLOCKED — time-travel |
| TC-15B-007 (TC-07) | Lifecycle states | ⛔ BLOCKED — no content can be created |
| TC-15B-008 (TC-08) | Incoming Items approver queue | ⏸ PARTIAL — inbox exists (Workflows); empty; can't feed it |
| TC-15B-009 (TC-09) | Approver checklist → Approve publishes | ⛔ BLOCKED — no content to approve |
| TC-15B-010 (TC-10) | Decline (unmet checklist) → Draft | ⛔ BLOCKED — no content to decline |

Bug: `bugs/2026-08-18-library-add-file-upload-disabled.md`.

## ✅ TC-02 — Add Library (PASS)
`Content Libraries → New Library` opens a config dialog matching the ADO spec: **Library Name*, Description, "Who can
administer this content?" (users)*, "Which content types are allowed?"* (Audio/Excel/Html/Images/MS Word/Pdf/…),
"Which users can view this?" (permissions + target flags), "How will the content be published?"* (Manual)**. Created
**"QA Test Library (synthetic)"** (admin = Mutshutshu Tshithukhe, type = Pdf, publication = Manual). A confirmation
dialog ("a notification will be sent to the content admins — Create?") appeared; after Create the list grew **6 → 7**
and the library shows **Status = Created**. PASS. (Our own synthetic record, left empty.)

## ✅ TC-04 — View Library (PASS, note)
Opening a library (`library-details-folder`) shows Name / Description / **Content Types** / **Status** (Created) /
Created Date / **Publication Method** / **Size (n Files)** on a Details tab (+ Comments tab). ✅ status shown.
📌 **Divergence:** the ADO case expects actions **"Publish, Edit, Add new item"**; the actual actions are
**New Folder / Add File / Delete / Submit** — the model is a **folder/file store**, not the content-item+approval
model the case describes.

## ⏸ TC-03 — "Tree view with expandable nodes" (PARTIAL)
`Manage Content Libraries` is a **flat list/grid** (columns Library Name / Description / Created Date / Status), **not
an expandable tree**. Opening a library reveals its folder/file contents (New Folder / Add File), so there is a
hierarchy one level down, but the top-level "tree view … expandable nodes" the case describes is not present.

## 🔴 TC-05 — Add Library Content (FAIL — blocker)
`Add File` opens a dialog (`add-content-file`) with **Name, Valid From, Valid To, File (Drag and drop)\***, and
buttons **Save / Cancel / Publish**. The **file-upload control is disabled** (`ant-upload-select ant-upload-disabled`):
clicking it opens no file chooser, and the drop zone is inert. With Name + Valid From (18/08/2026) + Valid To all set,
clicking **Save** returns **"This field is required"** for the File — but the File cannot be supplied because its
upload is disabled. **Chicken-and-egg → no content can be added to a library.**

🔑 **Global + likely a regression:** the upload is disabled on **both** the fresh library and the existing
**"Test MS Docs"** library (which already holds a `.doc` added 07/08). All existing library content predates ~13 Aug;
today no file can be uploaded — the same regression window as the public-intake bug
(`2026-08-18-public-enquiry-submit-broken-npoorganisation-null.md`). Also note the dialog offers **Save / Publish**,
not the ADO-described **"Save & Send for Approval"** — the approval-routing lifecycle may not be wired as specified.

## ⏸ / ⛔ The rest
- **TC-01:** our broad admin sees the Library Topics / Content Libraries menu (positive half ✅); the negative half
  (non-privileged user can't see it) needs a role-scoped user — the standing project dependency.
- **TC-08:** an **Incoming Items** inbox exists under **Workflows** (heading "Incoming Items", approver queue columns
  Ref/Initiator/Type/Action Required/…); it was empty for us. Can't populate it (no content can be sent for approval),
  and I won't approve/decline other teams' items.
- **TC-06/07/09/10:** all require content that can be created + routed through approval — **blocked by TC-05**.
  (TC-06 also needs time-travel.)

## Observations / questions for the test lead (Thabiso)
1. 🔴 **Content upload is disabled** in the Add File dialog across all libraries — no new content can be added.
   Existing content predates ~13 Aug, so this looks like a recent regression (same window as the public-intake bug).
   → bug filed. This blocks the whole 15B lifecycle + the 15E public content it feeds.
2. The library **content model is folder/file** (New Folder / Add File / Delete / Submit; Save / Publish) rather than
   the ADO's **content-item + Approver-checklist + Awaiting-approval → Published → Expired** lifecycle. Are the two
   reconciled, or is the approval workflow pending?
3. ✅ Add Library config is comprehensive and matches the FDS (admins, allowed types, viewer permissions, publication).

## Method notes
- Upload-disabled confirmed via the `.ant-upload-select.ant-upload-disabled` class + `browser_file_upload` finding no
  file-chooser modal + the Save "field is required" error — on both a new and an existing library.
- Library create verified by the list count (6 → 7) and the new library's `Status = Created` detail, after reload.
- AntD date fields driven via the panel (not `fill()`), per the project rule.
