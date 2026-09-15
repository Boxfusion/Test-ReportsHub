# Report: NPO-05-F — Wizard Documents upload allowlist (TC-05-021) — allowlist NOT enforced

**Date:** 2026-08-28 10:45 UTC
**Plan:** test-plans/npo-registration/05-wizard-admin-docs-declaration-functional.md
**Execution Mode:** ai-mcp
**Result:** FAILED — the registration wizard Documents-tab upload accepts file types the case requires it to reject. Uploading a **.docx** and a **.png** to the *Additional Documents File* control both returned **`PUT /api/StoredFile → 200, success:true`** and were stored (as `.docx` / `.png`); the **.pdf** control uploaded fine too. The ADO expected result — allowlist is only `.pdf`/`.doc`, so images and modern Office formats are rejected (`StoredFileCheckerAppService.cs:47`) — is not met: there is no server-side type enforcement on this endpoint.
**Duration:** ~4000s (most of it building the precondition — a 3-office-bearer application to reach the Documents tab)
**Cases:** TC-05-021 (#101697)
**Environment:** QA · public portal · registration wizard Documents tab · draft **APPL26-00793** (QA Test NPO, `61feb3a6-…`)
**Accounts used:** shared dev account

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 1 | 0 | 1 | 0 | 0 |

Coverage: **220 → 221**. This is the first of the two "genuinely runnable, not done" residual cases to be closed.

---

### 🔴 TC-05-021 — Uploaded file types: allowlist excludes images and modern Office formats (#101697) — FAILED

**ADO steps / expected:** upload `.docx` → *Rejected* (allowlist only `.pdf`/`.doc`); upload `.jpg`/`.png` →
*Rejected*; upload `.pdf` → *Accepted*.

**Observed** — each file was uploaded to the *Additional Documents File* control on the wizard Documents tab, and
the `PUT /api/StoredFile` response captured directly:

| File uploaded | ADO expectation | `StoredFile` response | Verdict |
|---|---|---|---|
| `qa-allowlist-test.docx` (38 B) | **Rejected** | `200 · success:true · type:".docx"` — **stored** | 🔴 accepted |
| `qa-allowlist-test.png` (67 B) | **Rejected** | `200 · success:true · type:".png"` — **stored** | 🔴 accepted |
| `qa-allowlist-test.pdf` (209 B) | Accepted | `200 · success:true · type:".pdf"` — stored | ✅ correct |

- **[FAIL] (BLOCKING) The allowlist does not reject disallowed types.** Both the `.docx` (a modern Office format)
  and the `.png` (an image) were accepted and persisted as `StoredFile` records against the application, with
  `error:null`. The endpoint applies **no type restriction** — the `.pdf` positive control confirms the accept path
  works, and the two disallowed types went through identically.
- The file inputs also carry **no client-side `accept` attribute** (`accept=""`), so there is no restriction at
  either layer.
- Each stored test file was **deleted afterwards** (via the control's own Delete → confirm), leaving the draft's
  *Additional Documents File* empty as found.

**Impact.** Beyond the case, an upload endpoint that accepts arbitrary types (images, Office docs, and by extension
anything) with no allowlist is a content-validation gap — relevant to the broader upload-handling and security
posture. Recorded as the case verdict; a separate observation is noted for the test lead rather than a new bug,
since it is the same `StoredFile` pipeline flagged elsewhere.

---

## Precondition built (synthetic, our own draft)
Reaching the Documents tab required an application clearing the **minimum-3-office-bearer** rule (Next stays
disabled below 3 — incidentally confirming that rule is enforced). The only resumable wizard draft (QA Test NPO,
APPL26-00793) had **0 OBs**, so **3 passport-variant office bearers were captured** with synthetic data
(`QaOfficer AlphaTest/BetaTest/GammaTest`, distinct mobiles `0810000001-3`, `@example.org` emails, Pretoria
addresses) — no real SA ID lookup, no real personal data. These OBs remain on the draft; nothing was submitted.

## Method notes
- Verdict taken from the **`StoredFile` PUT response body** (`success`, `type`), not the UI — the UI briefly shows
  the attached file then the control replaces on re-upload.
- Files uploaded through the visible AntD control via a real file-chooser (`browser_file_upload`); injecting the
  hidden input does not bind (known Shesha gotcha).
- Test files were tiny, locally generated, and deleted from the draft after each check.

## ❓ Question for Thabiso
The wizard Documents upload (`StoredFile` endpoint) accepts `.docx` and `.png` — should the `.pdf`/`.doc` allowlist
in `StoredFileCheckerAppService` be applied here? As built there is no server- or client-side type restriction.
