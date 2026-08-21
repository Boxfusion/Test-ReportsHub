# Test Plan: NPO-14D-F — Document / PDF Generation (QR, Cache, PDF/A) (functional)

> **Status:** Imported from Azure DevOps 2026-08-18 — 4 cases (ADO suite 101902). Verify generated PDFs
> (Certificate / Constitution / Letter): QR code + signatures, PDF/A + font embedding, QR→public-verify, and the
> post-transition status value. UI-only where possible; byte-inspect downloaded PDFs.
> **Owner:** QA
> **Last Updated:** 2026-08-18
> **Estimated Duration:** 900s

## Metadata
| Field | Value |
|-------|-------|
| App URL | Admin: https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Suite | 101902 — *14D Document/PDF (QR, Cache Integrity)* (4 cases) |

## 🔑 Thabiso's drift note (decisive)
TC-14-002 carries a code-review note: **"NO QR code generation library/import found. PDF stamping supports
text/image/watermark only. Expect to FAIL."** So the QR is expected to be **absent**. Confirming that on a real
generated PDF is the point of TC-002/004.

## Preconditions
- [ ] A generated PDF (Certificate of Registration / outcome Letter / Constitution) reachable from a registered
      application or NPO in the admin portal.

## Test Cases

### TC-01 — Generated PDFs carry QR + signatures (ADO #101814 · TC-14-002)
*P2 · Src:FDS · Admin · Drift-Risk (expect FAIL).*
- **Steps:** 1. Open a generated Certificate/Letter PDF.
- **Expected (ADO):** *"QR code visible; scanning links back to NPO record/status"*.
- **Assertions:** [ ] (BLOCKING) RECORD whether a QR code is present · [ ] RECORD any signature. Per drift note, expect NO QR.

### TC-02 — Certificate reflects post-transition status (ADO #101826 · TC-14-014)
*P2 · Src:Code · Admin.* ⛔ **Not UI (NHibernate L1 cache).** Observable half only.
- **Steps:** 1. Open the generated Certificate.
- **Assertions:** [ ] RECORD the Certificate shows **Registered** status + the NpoNumber (not stale). The cache-bypass
  mechanism itself (`ApplicationManager.cs`) is code — out of scope.

### TC-03 — PDF/A + embedded fonts (ADO #107424 · TC-14D-003)
*P2 · Src:FDS · Both.* ⚠️ Byte-inspection (no full PDF/A validator).
- **Steps:** 1. Download the Certificate/Constitution PDF · 2. Inspect bytes.
- **Assertions:** [ ] RECORD font embedding (`/FontFile`/`/FontFile2`/`/FontFile3` present, no bare Type1 base-14
  reliance) · [ ] RECORD PDF/A XMP marker (`pdfaid`) if any. Full PDF/A-1a conformance needs a dedicated validator —
  note as partial.

### TC-04 — QR verifies against public record (ADO #107425 · TC-14D-004)
*P2 · Src:FDS · Both.* ⚠️ Depends on TC-01 (a QR existing).
- **Steps:** 1. Extract the QR from the Certificate · 2. Navigate to the decoded URL.
- **Expected:** *"QR decodes to https://…/verify/…; page shows NPO Name+Number+Status, no extra PII"*.
- **Assertions:** [ ] (BLOCKING) a QR decodes to a verify URL · [ ] the verify page shows status + no PII. If no QR
  (per drift note), RECORD that no public `/verify` flow exists.

## Coverage against ADO
| Plan case | ADO | TC id | Runnable? |
|---|---|---|---|
| TC-01 | #101814 | TC-14-002 | ✅ (expect FAIL — no QR) |
| TC-02 | #101826 | TC-14-014 | ⛔ Src:Code (observable half) |
| TC-03 | #107424 | TC-14D-003 | ⚠️ byte-inspect (no validator) |
| TC-04 | #107425 | TC-14D-004 | ⚠️ depends on a QR existing |

**4 cases owned.**

## ADO anchors (machine-read — do not delete)
- ADO #101814 · TC-14-002
- ADO #101826 · TC-14-014
- ADO #107424 · TC-14D-003
- ADO #107425 · TC-14D-004

---

## ✅ Executed 2026-08-18 — no public QR-verify flow (/verify 404); cert-visual deferred (sourcing)
Report: `test-reports/2026-08-18/14d-document-pdf-functional--qr-verify.md`

| Case | Verdict | Note |
|---|---|---|
| TC-01 (TC-14-002) | ⚠️ PARTIAL | QR absence corroborated (code note + /verify 404); **live-cert visual deferred** — couldn't source a registered NPO cert (grid search didn't bind) |
| TC-02 (TC-14-014) | ⛔ OUT OF UI SCOPE | Src:Code NHibernate L1 cache; needs a fresh cert to observe |
| TC-03 (TC-14D-003) | ⏸ DEFERRED | PDF/A + font embedding — needs a sourced PDF + validator |
| TC-04 (TC-14D-004) | 🔴 FAIL | public `/verify` route **404** — no QR-verification deep-link flow exists |

🔑 **No QR / no verify flow** — corroborates Thabiso's code note ("no QR-generation library"). Resume dependency:
need a **registered NPO's generated certificate** (known NPO number / doc URL, or a working Status=Registered filter)
to finish TC-14-002 (QR/signature visual), TC-14D-003 (fonts/PDF-A), and the observable half of TC-14-014.
