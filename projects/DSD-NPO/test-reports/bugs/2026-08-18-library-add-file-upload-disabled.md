# Bug: E&A Library "Add File" upload control is disabled — no content can be added

**Date:** 2026-08-18
**Severity:** High (the E&A content-management pipeline is down; the public library shows only pre-existing content)
**Area:** Admin portal — `boxfusion.content/add-content-file` (Add File dialog under Content Libraries → library detail)
**Environment:** QA
**Found by:** Suite 15B (TC-15B-005)

## Summary
In the admin Content-Libraries "Add File" dialog, the **file-upload control is disabled**
(`div.ant-upload-select.ant-upload-disabled`). Clicking it opens no file chooser and the drop zone is inert, so no file
can be attached. The **File** field is required, so **Save** fails with *"This field is required"* — a chicken-and-egg
that makes it **impossible to add content to any library**.

## Steps to reproduce
1. Admin portal → Education and Awareness → **Content Libraries** (`/dynamic/boxfusion.content/manage-libraries-list`).
2. Open any library (e.g. **Test MS Docs**) → toolbar **Add File**.
3. Fill Name; set Valid From / Valid To. Try to attach a file via the "Click or drag file to this area to upload" area.

**Expected:** a file chooser opens / the file attaches; Save creates the content item (ADO: status "Awaiting Approval").
**Actual:** the upload control is disabled (no chooser, inert drop zone). Save → **"This field is required"** for File.
No content can be created.

## Scope / evidence
- Reproduced on a **freshly created** library ("QA Test Library (synthetic)") **and** on the existing **"Test MS Docs"**
  library (which already contains a `.doc` added 07/08/2026).
- The disabled state persists with Name + Valid From (18/08/2026) + Valid To all set — it is **not** gated on those.
- `browser_file_upload` reports no file-chooser modal on clicking the upload area (consistent with a disabled control).

## Likely a regression
All existing library content predates ~13 Aug 2026; today (18 Aug) **no file can be uploaded**. This matches the same
window as the public case/enquiry/investigation intake regression
(`2026-08-18-public-enquiry-submit-broken-npoorganisation-null.md`) — multiple create/upload flows appear to have
broken in the QA build around/after 13 Aug.

## Impact
- The E&A content pipeline is down: no new library content can be published.
- The public library (suite 15E) can only ever show content added before the regression.
- Blocks the whole admin content lifecycle (send-for-approval / approve / publish / decline).

## Also noted (same dialog, lower severity)
- Buttons are **Save / Publish**, not the ADO-described **"Save & Send for Approval"** — the approval-routing lifecycle
  (Awaiting approval → Awaiting publication → Published → Expired) may not be wired as the FDS/case describes.

## Fix direction
- Re-enable the Add-File upload control (check the `disabled` binding on the AntD Upload in `add-content-file`), or
  surface why it is disabled (permission / config). Then confirm Save creates content and routes it for approval.
