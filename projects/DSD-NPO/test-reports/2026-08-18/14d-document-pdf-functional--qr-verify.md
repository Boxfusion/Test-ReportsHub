# Report: NPO-14D-F — Document / PDF Generation (QR, Cache, PDF/A)

**Date:** 2026-08-18 16:48 UTC
**Plan:** test-plans/cross-cutting/14d-document-pdf-functional.md
**Execution Mode:** ai-driven (Playwright MCP, live QA admin + public portals)
**Result:** FAILED — no public QR-verify flow (/verify 404); QR absence corroborated; cert-visual/PDF-A deferred (sourcing)
**Duration:** ~700s
**Cases:** TC-14D-004
**Assessed-not-executed:** TC-14-002, TC-14-014, TC-14D-003
**Environment:** QA · admin portal + public portal

## Summary
| Case | Area | Verdict |
|---|---|---|
| TC-14D-004 (TC-04) | QR verifies against public record | 🔴 FAIL — public `/verify` route 404; no QR-verify flow |
| TC-14-002 (TC-01) | Generated PDFs carry QR + signatures | ⚠️ PARTIAL — QR absence corroborated; live-cert visual deferred |
| TC-14-014 (TC-02) | Certificate reflects post-transition status | ⛔ OUT OF UI SCOPE (Src:Code — NHibernate L1 cache) |
| TC-14D-003 (TC-03) | PDF/A + embedded fonts | ⏸ DEFERRED — needs a sourced generated PDF |

## 🔴 TC-14D-004 — QR verifies against public record (FAIL)
The ADO case expects the Certificate QR to decode to a URL like `https://dsd-npo-publicportal-*.shesha.app/verify/…`
and that page to show NPO Name/Number/Status. **Navigating the public portal to `/verify` returns HTTP 404** — the
verification deep-link route does not exist. So there is **no QR-verification flow**. This is consistent with the
code-review note on TC-14-002 (no QR-generation library), i.e. there is neither a QR nor a verify endpoint to resolve
one. FAIL.

## ⚠️ TC-14-002 — QR + signatures on generated PDFs (PARTIAL)
Thabiso's code-review drift note on this case is decisive: **"NO QR code generation library/import found. PDF stamping
supports text/image/watermark only. Expect to FAIL."** Two independent live signals corroborate the QR is absent:
1. The public `/verify` route is **404** (TC-14D-004) — nothing for a QR to link to.
2. No QR-generation path exists per the code review.

**Deferred:** I could not open an actual generated Certificate/Letter PDF this run to *visually* confirm the missing QR
(and any signature). Sourcing one requires a **registered** NPO's generated document, and:
- the **All NPOs** grid (361 087 rows) and **All Applications** grid (10 334 rows) did not filter to our own NPO
  (`333-019`) — the quick-search did not bind under automation;
- the NPO-detail and application-detail views I could open were **Application-In-Progress** (no certificate) or the
  raw capture form (no generated documents surfaced).

So TC-14-002 is recorded as **corroborated-but-not-visually-confirmed**. → resume dependency below.

## ⛔ TC-14-014 — post-transition status (out of UI scope)
The case targets an NHibernate L1-cache bypass in `ApplicationManager.cs` (Src:Code) — verifying the certificate shows
the *new* status/NpoNumber rather than a stale cached value. The cache mechanism is not observable from the UI without
a freshly-transitioned certificate to open; the code half is out of the UI-only scope. Deferred to dev.

## ⏸ TC-14D-003 — PDF/A + embedded fonts (deferred)
Needs a sourced generated PDF to byte-inspect for `/FontFile*` embedding and a `pdfaid` (PDF/A) XMP marker; full
PDF/A-1a conformance needs a dedicated validator regardless. Deferred with TC-14-002 (same sourcing blocker).

## Observations / questions for the test lead (Thabiso)
1. 🔴 **No QR-verification flow** — the public `/verify` route is 404, and per the code review there is no QR-generation
   library. If the FDS assumes "QR Code protection" on certificates, the feature is **not implemented** (QR + a public
   verify page + the resolve endpoint are all absent).
2. **To finish 14D** I need a way to open a **registered NPO's generated Certificate** — e.g. a known registered NPO
   number/document URL, or a Status=Registered filter that works on the NPO grid. Then TC-14-002 (QR/signature visual),
   TC-14D-003 (fonts/PDF-A), and the TC-14-014 observable half can be completed.

## Method notes
- `/verify` checked directly on the public portal → HTTP 404 (decisive for the verify-flow half).
- Certificate sourcing attempted via All NPOs (search), All Applications (search + first detail), and an NPO detail —
  none yielded a registered NPO's generated certificate this run (grid quick-search did not bind; details reached were
  in-progress).
