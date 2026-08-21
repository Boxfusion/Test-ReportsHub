# Registration document uploads accept any file type, including `.exe`

**Date raised:** 2026-08-17
**Severity:** High (security)
**Area:** Public portal → Registration wizard → Documents step
**Form:** `boxfusion.dsdnpo/create-npo v61`
**Environment:** QA · view mode **Latest**
**Found on:** draft `APPL26-01216` (Legal Form **Trust**)
**Fails:** ADO #101684 (TC-05-008) — and **contradicts** the drift note on #101697 (TC-05-021)

## What happens

There is **no file-type validation** on the registration document uploads. Both a `.docx` and a **`.exe`** were
accepted into required document slots with **no error, no toast and no rejection of any kind**.

## Reproduction

1. Reach the **Documents** step (Trust shows *Deeds Of Trust File*, *Letter Of Authority File*, *Additional Documents File*).
2. Upload **`qa-test.docx`** into *Additional Documents File* → **accepted**, listed as
   `qa-test.docx  Download Zip`. No error.
3. Upload **`qa-test.exe`** into *Deeds Of Trust File* → **accepted**, listed the same way. No error.
4. Upload a `.pdf` into *Letter Of Authority File* → accepted, and **`Next` becomes enabled**, so the application can
   proceed to Declaration carrying an executable as a statutory document.

Evidence: `test-reports/2026-08-17/evidence/v21-exe-and-docx-accepted-no-allowlist.png`.

## Why it matters

These documents are the statutory attachments for an NPO registration and are **downloaded and opened by DSD
assessors** during Document Verification. Accepting arbitrary executables means the portal will store and then serve a
file that an assessor is expected to open. There is also no size limit (see the note below), so the same endpoint
accepts unbounded content.

## Expected

Per #101684: *"Upload rejected with 'File type not allowed'"*.

## 🔑 This also corrects a code-review assumption

The drift note on **#101697 (TC-05-021)** states:

> *"Code allows **ONLY .pdf and .doc** per `StoredFileCheckerAppService.cs:47`. Confirm this matches business intent —
> **if users have docx documents, they will be blocked**."*

**That restriction is not in force at this upload point.** `.docx` was accepted, so the feared business problem (users
blocked from attaching Word documents) **does not occur**. The real problem is the opposite: **nothing is filtered at
all.**

▶ Two things follow for whoever fixes this:
1. The intended allowlist needs confirming with the BA — #101684 says *PDF, DOC/DOCX, JPG, PNG*, while #101697 says
   *.pdf/.doc only*. **The two ADO cases contradict each other**, and the build matches neither.
2. `StoredFileCheckerAppService` may exist but not be invoked on this path. Worth checking whether the checker is wired
   into the wizard's upload component at all.

## Notes

- ⚠️ **Not fully tested:** whether the **server** rejects these files on submit, and whether content sniffing (as
  opposed to extension) is applied anywhere. The fixtures used were small files with the relevant **extensions** and
  representative magic bytes; a real executable was not used.
- **TC-05-009 (max file size) was not executed** — a 50 MB fixture was prepared but lost when the fixture directory was
  cleaned mid-run. Its drift note says *"no app-level document size enforcement; only DocumentStamp images limited to
  5MB"*, so it is likely to fail too. **Test the two together when this is retested.**
- Related: the Trust document slots are **mandatory in behaviour but carry no `*`** — `Next` stays disabled until both
  are supplied. That is the 4th unmarked-mandatory instance on this build and is recorded in the run report.

---

## Refinement 2026-08-18 — the input *declares* `accept=".pdf"`, but nothing enforces it

Re-inspected the Documents step on `create-npo v62`. Every slot's `<input type="file">` carries:

```
accept=".pdf"   multiple=false
```

This sharpens the finding rather than softening it:

- `accept` is **only a file-picker hint**. It pre-filters the OS dialog; it is not validation, and every user can
  switch the dialog to "All files". It is bypassed entirely by drag-and-drop and by programmatic selection.
- So the build **declares PDF-only intent and enforces nothing** — neither client-side nor, per the 08-17 result,
  server-side. A `.exe` and a `.docx` both persisted.
- The `.exe` uploaded on 08-17 was **still attached to the draft today**, surviving the session — so the file is
  genuinely stored, not just displayed.

### Consequence for how the bug is described
Do **not** claim "the picker offers no filtering" — it does. The accurate statement is: **the allowlist exists as a
UI hint only and there is no enforcement anywhere**, so any file type reaches storage.

### This also settles the contradiction between the two ADO cases
#101684 lists PDF/DOC/DOCX/JPG/PNG, #101697 says only `.pdf`/`.doc`, and `StoredFileCheckerAppService.cs:47` was
expected to block `.docx`. The build matches **neither**: `.docx` was accepted, so the feared "docx users are blocked"
problem does not exist, and the real defect is the inverse. `StoredFileCheckerAppService` may exist but is evidently
not wired into the wizard upload path. The `accept=".pdf"` attribute suggests the *intended* allowlist is the narrow
one from #101697.
