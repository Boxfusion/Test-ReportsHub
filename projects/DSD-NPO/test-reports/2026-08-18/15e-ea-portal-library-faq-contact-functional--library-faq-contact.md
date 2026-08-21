# Report: NPO-15E-F — E&A Portal: Library / FAQ / Contact (functional)

**Date:** 2026-08-18 15:20 UTC
**Plan:** test-plans/education-awareness/15e-ea-portal-library-faq-contact-functional.md
**Execution Mode:** ai-driven (Playwright MCP, live QA public portal)
**Result:** FAILED — 2 pass, 1 pass-with-note, 1 partial, 2 fail of 6
**Duration:** ~900s
**Cases:** TC-15E-001, TC-15E-002, TC-15E-003, TC-15E-004, TC-15E-005, TC-15E-006
**Environment:** QA · public portal · logged in as mpenduloizwelinuk / Mpendulo ntshangase

## Summary
| Case | Area | Verdict |
|---|---|---|
| TC-15E-001 | View published Library Topics list | ✅ PASS |
| TC-15E-002 | Open a library + browse content | ✅ PASS (note: no Like control) |
| TC-15E-003 | Download increments the downloads counter | ✅ PASS |
| TC-15E-004 | Like increments/toggles | 🔴 FAIL — no Like feature exists |
| TC-15E-005 | FAQ grouped + expand + search | ⚠️ PARTIAL — grouping only; all empty; no search |
| TC-15E-006 | Contact Us / enquiry submits + confirms | 🔴 FAIL — enquiry Submit is broken (no case created) |

Bug: `bugs/2026-08-18-public-enquiry-submit-broken-npoorganisation-null.md`.

## ✅ TC-15E-001 — Library Topics list
Education and Awareness → Content Libraries renders the published library list: **"1-6 of 6 items"** (6 libraries).
No empty state — data is present. Columns/cards render. PASS.

## ✅ TC-15E-002 — Open a library and browse content (note)
Opened **"Test MS Docs"** (`public-flattened-content-items?id=fdc557ea-…`): **"1-1 of 1 items"**, one content row
with columns **Name · Date Modified · Type · Size · Downloads · File**. (The "Friday Deployment" library was empty =
0 items — a data state, not a fault.)
Double-clicking the row opened the content detail view (`content-item-public-detail-view?id=3863a3fe-…`) showing:
- an **iframe preview**, a **file download link** ("…(172.54 kB)"),
- counters: **Downloads · Views · Comment**,
- a **Comments** tab (with an existing comment).

✅ content items listed; content detail shows a download mechanism + a Comments panel.
📌 **Note:** the ADO expected result also names a **Like** control on content detail — **there is none** (see
TC-15E-004). So this passes on the "download + comments" half, with the Like gap recorded.

## ✅ TC-15E-003 — Download increments the downloads counter
On the content detail view the counter read **Downloads: 1**. Clicked the file link → a real file downloaded
(`Non-MembershipConstitutionTBC…doc`, 172.54 kB). After reload the counter read **Downloads: 2**. Increment by 1
confirmed. PASS.

## 🔴 TC-15E-004 — Like increments/toggles
**There is no Like feature on the content detail view.** A full DOM sweep for like / heart / thumb / favourite
controls (buttons, `[role=button]`, `.anticon`, links, aria-labels, class names, body text) returned **nothing**;
the only interactive tab is **Comments**. The content model tracks Downloads / Views / Comment counters but **no
Likes counter and no Like button exist**. The ADO case's expected "likes +1 / toggle Liked↔Unlike" cannot be
exercised because the feature is not implemented in this build. Recorded as a spec-vs-build divergence for the
test lead. FAIL (not-implemented).

## ⚠️ TC-15E-005 — FAQ grouped + expand + search
FAQs page (`/FAQs`, form v11) shows an **H1 "Frequently Asked Questions"** and **5 category groups** (H3):
1. Procedure for registration
2. Changes to Act No.22 of 2022 (GLAA)
3. About the Act
4. Submission of financial statements
5. After registration

✅ **grouping by category is present.** But **every category shows "No Data — No data is available for this list"**
— there are **no published FAQ items** under any group. There is also **no search box** anywhere on the page.
So "answers expand on click" and "search narrows to matches" **cannot be verified** (no items, no search control).
PARTIAL — grouping verified; expand + search blocked by data/feature absence.
📌 Also noted: the FAQ page's *in-content* footer links point to the **TEST** host
(`dsd-npo-publicportal-test.azurewebsites.net/...`) — a cross-environment link leak (minor).

## 🔴 TC-15E-006 — Contact Us / enquiry submits and confirms
The nav **"Contact Us"** page (`portal-contact-us`, v19) is a **static contact-details display**, not a form:
National DSD block (Physical + Postal address, Tel `(012) 312 7500`, Email `Npoenquiry@dsd.gov.za`) and a
**Provincial Contact Details** section with a Province dropdown that reveals Director / Physical Address / Contact.
**No name/email/subject/message fields and no Submit** on this page.

The actual submit channel is the footer **"Enquiry"** button → `public-case-create` ("**Submit A Query**"):
- Channel = Web, Priority = High (prefilled, required),
- Submitter Details prefilled from the logged-in person,
- **Case Info:** optional Application Ref / NPO-number search, required **Category***, **Description**, and (after a
  category is chosen) required **Case type***.

✅ **Required-field validation works** — Submit stayed **disabled** until Category, Description and Case type were
all set.

🔴 **But submission always fails.** With Category = *Education and Awareness*, a Description, and Case type =
*How to Register?*, clicking **Submit** shows **"Error: Your request is not valid!"** and **stays on the page**.
Network + console show the submit action unconditionally fires
`GET /api/dynamic/boxfusion.dsdnpo/NpoOrganisation/Crud/Get?Id=null` → **400**, and **no `Case/Crud/Create` POST is
ever attempted** — the enquiry is never created.

Verification (rule out harness / data — reproduced **3×** identically):
1. No NPO linked → Submit → `Get?Id=null` 400, "not valid".
2. Identical retry → same.
3. Linked our own NPO **333-019-NPO** via the NPO-number search (the correct org resolved:
   `NpoOrganisation/Crud/Get?...id=4be65ab5-c421-4b22-a275-0a26ccd802f6` returned 200) → Submit **still** fired a
   separate `Get?Id=null` 400 and no case POST. So the null-id Get is hardcoded in the submit action, independent of
   the linked org. Genuine app defect. FAIL.

📌 Secondary UX/data observations on this form:
- **Application Ref** and **NPO Number** dropdowns render **raw GUIDs** as labels in the default (unfiltered) list;
  human-readable values only resolve after a typed search. The NPO-number list is also **system-wide** (paged over
  all NPOs), not scoped to the submitter.

## Observations / questions for the test lead (Thabiso)
1. 🔴 **The public "Submit A Query" enquiry form cannot submit anything** — Submit always throws "Your request is not
   valid!" and never creates a case (`NpoOrganisation/Crud/Get?Id=null` → 400 in the submit action). This is the
   public Contact-Us / enquiry channel; it is effectively down. → bug filed.
2. **Like feature absent** on content detail (TC-15E-004) — is Like in scope for this build, or should the case be
   retired? Downloads/Views/Comments all work.
3. **FAQ content is empty** across all 5 categories and there is **no search box** — is FAQ content pending seeding,
   and is a keyword search expected on this page (the ADO case asks for one)?
4. **GUID labels** on Application-Ref / NPO-Number pickers and the **system-wide** NPO list on a public form.
5. **Cross-env link leak** — FAQ page footer links to `...-test.azurewebsites.net`.

## Method notes
- Download counter increment verified by reading the counter **before and after** a real file download + reload.
- Like absence verified by an exhaustive DOM sweep (controls + icons + body text), not a single-selector miss.
- Enquiry-submit failure verified via **network log + console** (the `Get?Id=null` 400 and the absence of any
  case-create POST), reproduced 3× including a positive-path attempt with our own NPO correctly resolved server-side.
- Toasts captured with a MutationObserver armed **before** each Submit click (AntD toasts are ~3s).
