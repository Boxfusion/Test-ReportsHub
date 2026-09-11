# Test Plan: NPO-15A-F — E&A Interventions (admin, functional)

> **Status:** Imported from Azure DevOps 2026-08-18 — 8 admin cases (ADO suite 107352). Capture/manage E&A
> Interventions (Workshop/Roadshow/Training). UI-only; create **our own** synthetic interventions.
> **Owner:** QA
> **Last Updated:** 2026-08-18
> **Estimated Duration:** 1200s

## Metadata
| Field | Value |
|-------|-------|
| App URL | Admin: https://dsd-npo-adminportal-qa.shesha.app/login · Interventions: `/dynamic/boxfusion.dsdnpo/interventions` |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe (broad admin) |
| Lead tester | **Thabiso Kegakwile** |
| ADO Suite | 107352 — *15A E&A Interventions (Admin)* (8 cases) |

## Objective
> Verify the Interventions admin area: the index + filters, the Add-Intervention capture form (mandatory Type +
> type-specific conditional fields), Complete-vs-Draft on full/partial submit, Close discards, Reporter/Reviewer
> capture, and attachment upload with an allowlist.

## 🔑 Context / watch-items
- ⚠️ **Upload may be broken** — suite 15B found the E&A content upload control disabled today (likely regression). TC-08
  (attachment upload) may reproduce; check the console + the `.ant-upload-disabled` class.
- ⚠️ Keep free text ≤100 chars; drive AntD date fields via the panel.

## Test Cases

### TC-01 — Interventions Index + filters (ADO #107366 · TC-15A-001)
*P2 · Src:FDS · Admin.* ✅ Runnable (observation).
- **Steps:** 1. Open Interventions Index · 2. Filter by type.
- **Assertions:** [ ] grid shows type/date/reporter/status + filter controls · [ ] filter narrows rows.

### TC-02 — Add Intervention opens capture form (ADO #107367 · TC-15A-002)
*P2 · Src:FDS · Admin.* ✅ Runnable.
- **Steps:** 1. Click Add Intervention.
- **Assertions:** [ ] capture form opens · [ ] Type selector required + at top.

### TC-03 — Type mandatory + conditional fields (ADO #107368 · TC-15A-003)
*P2 · Src:FDS · Admin.* ✅ Runnable.
- **Steps:** 1. Submit without Type → required · 2. Type=Workshop → workshop fields · 3. Type=Roadshow → roadshow fields.
- **Assertions:** [ ] Type required blocks submit · [ ] type-specific fields show/hide conditionally.

### TC-04 — Full submit → status Complete (ADO #107369 · TC-15A-004)
*P2 · Src:FDS · Admin.* ✅ Runnable (create).
- **Steps:** 1. Fill every mandatory field · 2. Submit.
- **Assertions:** [ ] (BLOCKING) success + appears in Index with status **Complete**.

### TC-05 — Partial submit → status Draft (ADO #107370 · TC-15A-005)
*P2 · Src:FDS · Admin.* ✅ Runnable (create).
- **Steps:** 1. Fill only some mandatory fields · 2. Submit.
- **Assertions:** [ ] saved as **Draft** (not blocked) · [ ] missing-field highlight.

### TC-06 — Close discards without persisting (ADO #107371 · TC-15A-006)
*P2 · Src:FDS · Admin.* ✅ Runnable.
- **Steps:** 1. Fill fields · 2. Close.
- **Assertions:** [ ] form closes · [ ] (BLOCKING) index count unchanged (no record created).

### TC-07 — Reporter + Reviewer captured (ADO #107372 · TC-15A-007)
*P2 · Src:FDS · Admin.* ✅ Runnable.
- **Steps:** 1. Add Reporter + Reviewer details · 2. Submit.
- **Assertions:** [ ] subfields validate · [ ] persisted + visible on the Intervention detail.

### TC-08 — Attachment upload + allowlist (ADO #107373 · TC-15A-008)
*P2 · Src:FDS · Admin.* ⚠️ May reproduce the disabled-upload regression.
- **Steps:** 1. Upload Attendance Register (PDF) · 2. Feedback Questionnaire (DOCX) · 3. .exe → rejected · 4. Submit →
  detail retains attachments; download works.
- **Assertions:** [ ] allowed accepted · [ ] .exe rejected (framework gap TG-001 may partially accept) · [ ] retained.

## Coverage against ADO
| Plan case | ADO | TC id | Runnable? |
|---|---|---|---|
| TC-01 | #107366 | TC-15A-001 | ✅ |
| TC-02 | #107367 | TC-15A-002 | ✅ |
| TC-03 | #107368 | TC-15A-003 | ✅ |
| TC-04 | #107369 | TC-15A-004 | ✅ |
| TC-05 | #107370 | TC-15A-005 | ✅ |
| TC-06 | #107371 | TC-15A-006 | ✅ |
| TC-07 | #107372 | TC-15A-007 | ✅ |
| TC-08 | #107373 | TC-15A-008 | ⚠️ upload |

**8 cases owned.**

## ADO anchors (machine-read — do not delete)
- ADO #107366 · TC-15A-001
- ADO #107367 · TC-15A-002
- ADO #107368 · TC-15A-003
- ADO #107369 · TC-15A-004
- ADO #107370 · TC-15A-005
- ADO #107371 · TC-15A-006
- ADO #107372 · TC-15A-007
- ADO #107373 · TC-15A-008

---

## ✅ Executed 2026-08-18 — index/form/discard work; required District list empty blocks create
Report: `test-reports/2026-08-18/15a-interventions-functional--admin.md`

| Case | Verdict | Note |
|---|---|---|
| TC-01 (TC-15A-001) | ✅ PASS | index + filter/search narrowing (4→1). **No Status column** |
| TC-02 (TC-15A-002) | ✅ PASS | Add form opens; Type* at top; 4 Sections; Save gated |
| TC-03 (TC-15A-003) | ⏸ PARTIAL | Type mandatory ✅; **no type-specific conditional fields** (fixed 4 sections) |
| TC-04 (TC-15A-004) | 🔴 FAIL | required **District** list empty ("No data" for Gauteng) → cannot complete a create |
| TC-05 (TC-15A-005) | ⏸ PARTIAL | Save disabled on partial data (contradicts "saves as Draft"); District-blocked |
| TC-06 (TC-15A-006) | ✅ PASS | Cancel discards; index count stayed 4 |
| TC-07 (TC-15A-007) | ⏸ PARTIAL | section tabs didn't switch under automation; persistence District-blocked |
| TC-08 (TC-15A-008) | ⏸ PARTIAL | Section-4 upload control exists + **enabled** (unlike 15B); full check District-blocked |

🔑 Blocker = **empty required District reference list** (Province→District cascade returns "No data") → question for
Thabiso (data seeding vs cascade bug). Divergences: no Status column; fixed sections (no type-conditional fields);
partial-save-as-Draft not supported. ✅ Intervention attachment upload is **enabled** (contrast 15B disabled upload).
Types: Education And Awareness / Train The Trainer / Outreach Programmes / Npo Sector Engagement. Risk: Low/Medium/High.
