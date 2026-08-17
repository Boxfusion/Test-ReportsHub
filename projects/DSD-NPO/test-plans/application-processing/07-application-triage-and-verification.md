# Test Plan: NPO-07 — Backend: Application Triage, OB Compliance & Document Verification (smoke)

> **Status:** Imported from Azure DevOps — **partially reachable** (TC-01→TC-03 runnable now)
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101864) |
| ADO Suite | 101864 — *07 - Backend - Application Triage, OB Compliance & Document Verification* (7 cases) |

## Objective
> Verify the DSD-staff side of a registration application: signing in to the admin portal, listing and filtering all applications, opening an application's details, running OB Compliance and Document Verification, and confirming that a fully approved application issues an NPO Registration Number and a certificate.

## Reachability
**TC-01 → TC-04 are runnable today** — the admin portal is up and populated (**361,068 NPOs**, **2,470 workflow inbox items**). TC-05 → TC-07 need **an application we created ourselves** to act on.

⚠️ **Do not action the 2,470 existing inbox items.** They belong to other testers ([[reuse-our-created-records]]). TC-05→TC-07 must wait for our own submitted application (plan NPO-05, TC-05), which is blocked by the address defect.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO cases; all state `Design`. Three carry Thabiso's own **Drift-Risk** notes, reproduced in place below.

## Preconditions
- [ ] Admin portal reachable; signed in
- [ ] 🔑 View mode **Live → Latest** immediately after login
- [ ] TC-02/TC-03: at least 3 applications exist in various statuses
- [ ] TC-05→TC-07: **our own** submitted application, with OBs confirmed

## 🔑 Automation notes — admin portal
- **Grids are `sha-react-table`, not AntD tables.** `.ant-table*` selectors return **0 rows on healthy pages** — on 2026-08-12 that produced a false "21 of 24 admin areas did not render" inventory which was retracted in full. Use `[role=table]` / `[role=row]`; read totals from the caption (*"1-10 of N items"*).
- Menu items **CRM → Case Management** and **Administration → Audit Logs** were not clickable under automation. Prefer direct URLs where a menu flyout will not open.
- `404 /signalr-timeline/negotiate` — the real-time timeline never connects on admin. Known; note it, do not re-raise.

## Test Cases

### TC-01 — Admin can sign in to the Admin Portal (ADO #101711 · TC-07-001)

*Priority 1 · Positive · Admin portal.* ✅ **Runnable now.**

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://dsd-npo-adminportal-qa.shesha.app/login
  2. WAIT for `input[type=password]` (hydration marker)
  3. ASSERT the Sign-In page is displayed
  4. TYPE the admin credentials, CLICK **Sign In**
  5. ASSERT (BLOCKING) the admin lands on the admin dashboard
  6. Switch view mode **Live → Latest**
- **Expected result:** *"Sign-In displayed"* then *"Admin lands on admin dashboard"*
- **Assertions:**
  - [ ] ASSERT the Sign-In page renders
  - [ ] ASSERT (BLOCKING) authentication succeeds and the dashboard loads
- **⚠️ The account is not role-scoped.** `mpenduloizwelinuk@gmail.com` logs into **both** portals and exposes the full `Configurations` menu — almost certainly the developer's account. This case proves *an* admin can sign in, **not** that a DSD-staff role can. Creating role-scoped users is ours to do (`Administration → Roles`); the cross-portal access is the open question for Thabiso.
- **📌** The admin login button reads **Sign In**; the public portal's reads **Login**.

---

### TC-02 — All Applications lists every received application (ADO #101712 · TC-07-002)

*Priority 1 · Positive.* ✅ **Runnable now.** ⚠️ Drift-Risk case.

- **Type:** Happy path (structural)
- **Steps:**
  1. NAVIGATE to **CRUDS → All Applications**
  2. WAIT for the grid to render
  3. ASSERT (BLOCKING) applications are listed with columns **Reference No · NPO Name · Date Received · Application Status · Risk Status** *(FDS 8.1)*
  4. CLICK a column header → ASSERT sorting works
- **Expected result:** *"All applications listed with: Reference No, NPO Name, Date Received, Application Status, Risk Status; column sorting works (FDS 8.1)"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the grid renders rows
  - [ ] ASSERT all five prescribed columns are present
  - [ ] ASSERT column sorting works
- **⚠️ ADO drift note (Thabiso's own):** *"Code: no dedicated list+filter endpoint found in AppService layer; likely Shesha generic CRUD on NpoApplication. Verify with QA."*
- **📌** Assert the **column set** precisely — the five names are prescribed. A missing **Risk Status** column is a citable finding.

---

### TC-03 — Filter applications by status (ADO #101713 · TC-07-003)

*Priority 1 · Positive.* ✅ **Runnable now.** ⚠️ Drift-Risk case.

- **Type:** Happy path
- **Steps:**
  1. On **All Applications**, RECORD the unfiltered row count from the grid caption
  2. Apply filter **Status = 'Application In-Progress'**
  3. ASSERT (BLOCKING) only In-Progress applications are displayed
  4. Clear the filter
  5. ASSERT all applications are visible again, and the count matches step 1
- **Expected result:** *"Only In-Progress applications displayed"* then *"All applications visible again"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the filter narrows the list to the chosen status
  - [ ] ASSERT every visible row carries that status
  - [ ] ASSERT clearing restores the original count
- **⚠️ ADO drift note:** *"Same as TC-07-002 - filtering depends on Shesha generic API."*
- **📌** Assert **every visible row's status**, not just that the count dropped.

---

### TC-04 — Application Details shows captured data, documents and status (ADO #101714 · TC-07-004)

*Priority 1 · Positive.* ✅ Runnable against an existing application (read-only — **do not action it**).

- **Type:** Happy path (structural)
- **Steps:**
  1. On **All Applications**, CLICK an application row
  2. ASSERT (BLOCKING) the details page shows: **Organisation Details · Office Bearers (with verification flags) · Control Structure (if any) · Declarations · uploaded documents · status · risk status** *(FDS 8.2)*
- **Expected result:** *"Details page shows Organisation Details, OBs (with verification flags), Control Structure (if any), Declarations, uploaded documents, status, risk status (FDS 8.2)"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the details page opens
  - [ ] ASSERT each of the seven prescribed sections is present
- **📌 Read-only case** — opening a details page changes nothing, so this may safely be run against an application another tester created. TC-05 onwards must not.
- **📌** *Control Structure* appears here as a details section — relevant to the 7-vs-8 tab question raised in plan NPO-05.

---

### TC-05 — OB Compliance dialog allows manual verification of each OB (ADO #101716 · TC-07-006)

*Priority 1 · Positive.* ⛔ Needs our own application at the right status.

- **Type:** Happy path (workflow action)
- **Steps:**
  1. Open **our** application, at a status that allows the OB Compliance step
  2. CLICK **OB Compliance**
  3. ASSERT (BLOCKING) the dialog *(FDS Fig.20)* lists **each OB** with verifications against **UN Sanctions · Dept of Justice · Child Protection DB**
  4. Mark each as compliant and CLICK **Submit**
  5. ASSERT the application status moves toward **Awaiting Document Verification**
- **Expected result:** *"Dialog (FDS Fig.20) lists each OB with verifications: UN Sanctions, Dept of Justice, Child Protection DB"* then *"Application status moves toward Awaiting Document Verification"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the dialog lists every OB
  - [ ] ASSERT all three verification checks are offered per OB
  - [ ] ASSERT the status advances after submit
- **❓ Question for Thabiso:** are the three checks **manual attestations** by the assessor, or live integrations? The case says *"manual verification"* in its title but names three external databases. That changes what a pass means.

---

### TC-06 — Document Verification allows yes/no per document with reasons (ADO #101720 · TC-07-010)

*Priority 1 · Positive.* ⛔ Needs all OBs confirmed and compliant.

- **Type:** Happy path (workflow action)
- **Steps:**
  1. On our application, CLICK **Document Verification**
  2. ASSERT (BLOCKING) the dialog *(FDS Fig.21)* lists each uploaded document with a **Yes/No radio** and a **Reason** field
  3. Mark all **Yes**, CLICK **Submit**
  4. ASSERT the status moves to **'Successful Document Verification'**
  5. ASSERT the system generates a **Certificate**, a **Constitution** and an **OB list**
  6. ASSERT a notification with those attachments is sent to the chairperson *(FDS 8.4 rule 2a)*
- **Expected result:** *"Status moves to 'Successful Document Verification'; system generates Certificate, Constitution, OB list; notification sent to chairperson with attachments"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) every uploaded document is listed with Yes/No and Reason
  - [ ] ASSERT the status string is exactly `Successful Document Verification`
  - [ ] ASSERT all three documents are generated
  - [ ] ASSERT the chairperson notification carries the attachments

---

### TC-07 — End-to-end approval issues an NPO Registration Number and Certificate (ADO #101723 · TC-07-013)

*Priority 1 · Positive.* ⛔ Needs all checks passed. ⚠️ Drift-Risk case. **The terminal case of the registration journey.**

- **Type:** Happy path (end-to-end)
- **Steps:**
  1. With OB Confirmation, OB Compliance and Document Verification all passed, complete **Document Verification with all Yes**
  2. ASSERT (BLOCKING) Application Status = **'Application Successful'**
  3. ASSERT an **NPO Registration Number** is issued — ASSERT it matches the register's format `NNN-NNN-NPO`
  4. ASSERT these are generated: **PDF Certificate · signed/stamped Constitution · Letter of Registration · OB list**
  5. ASSERT the chairperson is emailed all attachments, with a **QR-protected certificate**
- **Expected result:** *"Application Status = 'Application Successful'; NPO Registration Number issued; PDF Certificate + signed/stamped Constitution + Letter of Registration + OB list are generated; chairperson is emailed all attachments with QR-protected certificate"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) status is exactly `Application Successful`
  - [ ] ASSERT an NPO Registration Number is issued in `NNN-NNN-NPO` format
  - [ ] ASSERT all four artefacts are generated
  - [ ] ASSERT the certificate carries a **QR code** — see the drift note
- **⚠️ ADO drift note (Thabiso's own) — expect this to fail:** *"Certificate generated via `BackfillMissingApplicationDocumentsAsync`, but **QR code generation NOT found in code** — the FDS 'QR Code protection' is at risk."* Assert the QR code explicitly and report the result either way; this is a known-suspect assertion, and confirming its absence is a useful outcome.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101711 | TC-07-001 | ✅ yes |
| TC-02 | #101712 | TC-07-002 | ✅ yes |
| TC-03 | #101713 | TC-07-003 | ✅ yes |
| TC-04 | #101714 | TC-07-004 | ✅ yes (read-only) |
| TC-05 | #101716 | TC-07-006 | ⛔ needs our own application |
| TC-06 | #101720 | TC-07-010 | ⛔ blocked on TC-05 |
| TC-07 | #101723 | TC-07-013 | ⛔ blocked on TC-06 |

**Not in this plan** (Functional suite 101890, 15 cases, to import later): TC-07-005, 007→009, 011, 012, 014+.
