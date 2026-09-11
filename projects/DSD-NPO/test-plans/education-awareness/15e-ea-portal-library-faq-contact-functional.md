# Test Plan: NPO-15E-F — Education & Awareness Portal: Library / FAQ / Contact (functional)

> **Status:** Imported from Azure DevOps 2026-08-18 — all 6 are **public-portal, fully black-box runnable**.
> **Owner:** QA
> **Last Updated:** 2026-08-18
> **Estimated Duration:** 900s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Suite | 107355 — *15E E&A Portal Library/FAQ/Contact (Public)* (6 cases, **all owned here**) |

## Objective
> Verify the public Education & Awareness experience: browsing published Library Topics and content, the download and
> like counters, the FAQ page (grouping + search), and the Contact Us form.

## No overlap with the smoke plan
Smoke `15-education-awareness-smoke.md` owns a separate generic set (TC-15-001…004, ADO #107404–407). These
**TC-15E-###** cases are distinct — nothing shared.

## Preconditions
- [ ] Public portal reachable; signed in (nav shows **Education and Awareness**, **Contact Us**, **FAQs**).
- [ ] At least one **Published, non-expired** library with content exists (content is admin-created in suite 15B; if
      none exists, TC-001–004 may show an empty state — record that as the finding).

## Test Cases

### TC-01 — View published Library Topics list (ADO #107388 · TC-15E-001)
*P2 · Public.*
- **Steps:** 1. Open Education and Awareness → Library Topics
- **Expected:** *"List shows all Published (non-expired) libraries the user may view"*
- **Assertions:** [ ] the library list renders · [ ] RECORD count and whether an empty state shows if none published.

### TC-02 — Open a library and browse content (ADO #107389 · TC-15E-002)
*P2 · Public.*
- **Steps:** 1. Click a library → 2. Click a content item
- **Expected:** library detail lists Published items (title + summary + attachment icon); content detail shows preview
  + Download + Like (+ Comments if enabled).
- **Assertions:** [ ] content items listed · [ ] content detail shows Download + Like.

### TC-03 — Download increments the downloads counter (ADO #107390 · TC-15E-003)
*P2 · Public.*
- **Steps:** 1. On content detail, note the downloads count → click Download → re-read
- **Assertions:** [ ] a file downloads · [ ] (BLOCKING) the downloads counter increments by 1.
- **📌** MCP download sandbox may block the actual save; verify the counter increment via the UI/API read either way.

### TC-04 — Like increments/toggles (ADO #107391 · TC-15E-004)
*P2 · Public.*
- **Steps:** 1. Click Like → 2. Click again (Unlike)
- **Assertions:** [ ] likes +1 and button → Liked/Unlike · [ ] (BLOCKING) second click −1 and back to Like (idempotent).

### TC-05 — FAQ grouped by category + search (ADO #107392 · TC-15E-005)
*P2 · Public.*
- **Steps:** 1. Open FAQs → 2. Expand an answer → 3. Search by keyword
- **Assertions:** [ ] items grouped by category · [ ] answers expand on click · [ ] search narrows to matches.

### TC-06 — Contact Us submits and confirms (ADO #107393 · TC-15E-006)
*P2 · Public.*
- **Steps:** 1. Open Contact Us → fill name + email + subject + message → 2. Submit
- **Assertions:** [ ] required-field validation · [ ] (BLOCKING) a confirmation is shown · [ ] RECORD the recipient
  notification (`NotificationMessage`, if verifiable).

## Coverage against ADO
| Plan case | ADO | TC id | Runnable? |
|---|---|---|---|
| TC-01 | #107388 | TC-15E-001 | ✅ |
| TC-02 | #107389 | TC-15E-002 | ✅ |
| TC-03 | #107390 | TC-15E-003 | ✅ |
| TC-04 | #107391 | TC-15E-004 | ✅ |
| TC-05 | #107392 | TC-15E-005 | ✅ |
| TC-06 | #107393 | TC-15E-006 | ✅ |

**6 cases owned.**

## ADO anchors (machine-read — do not delete)
- ADO #107388 · TC-15E-001
- ADO #107389 · TC-15E-002
- ADO #107390 · TC-15E-003
- ADO #107391 · TC-15E-004
- ADO #107392 · TC-15E-005
- ADO #107393 · TC-15E-006

---

## ✅ Executed 2026-08-18 — 2 pass, 1 pass-with-note, 1 partial, 2 fail (all 6 run)
Report: `test-reports/2026-08-18/15e-education-awareness-portal-functional--library-faq-contact.md`
Bug: `bugs/2026-08-18-public-enquiry-submit-broken-npoorganisation-null.md`

| Case | Verdict | Note |
|---|---|---|
| TC-15E-001 | ✅ PASS | Content Libraries list = "1-6 of 6 items" |
| TC-15E-002 | ✅ PASS (note) | "Test MS Docs" → 1 item; detail = preview + file link + Downloads/Views/Comment + Comments tab. **No Like control** |
| TC-15E-003 | ✅ PASS | Downloads counter 1 → 2 after a real file download |
| TC-15E-004 | 🔴 FAIL | **No Like feature exists** on content detail (only Comments) — spec-vs-build gap |
| TC-15E-005 | ⚠️ PARTIAL | 5 category groups present but **all "No Data"**; **no search box** → expand/search unverifiable |
| TC-15E-006 | 🔴 FAIL | Contact Us page is static (no form); footer **Enquiry** → `public-case-create` Submit always **"Your request is not valid!"** — `NpoOrganisation/Crud/Get?Id=null` 400, no case POST (bug filed) |

🔑 The public **enquiry/Contact-Us channel is non-functional** (TC-006). Downloads work; Like + FAQ content + FAQ
search are absent in this build. GUID-labelled pickers + system-wide NPO list noted as secondary observations.
