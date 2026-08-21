# Report: NPO-12P → NPO-12A — Investigations, anonymous submission to investigator assignment

**Date:** 2026-08-13 16:00 UTC
**Plan:** test-plans/investigations/12p-investigations-public-submission.md
**Spec:** test-plans/investigations/12p-investigations-public-submission.spec.ts
**Execution Mode:** ai-repair
**Result:** PARTIAL — 2 of 3 cases pass; the case status filter does not exist
**Duration:** 1500s
**Cases:** TC-12-001 (suite 101872) · TC-12-004, TC-12-006 (suite 101871)
**Environment:** QA · both portals · view mode **Latest**
**Case created:** **INV1283/13/08/2026** against **`333-018-NPO`** — *Nomfanelo QA NPO 2026-08-13*

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 24 | 20 | 3 | 1 |

## 🔓 The full lifecycle ran end to end
This is the first DSD-NPO flow driven **from an unauthenticated public submission all the way to a backend
assignment** — anonymous report → validation → in-mandate ruling → investigator + reviewer assigned. The plan
predicted this would be *"the one complete lifecycle we can drive end to end right now"*, and it was.

## ✅ TC-12-001 — Anonymous whistleblowing submission (ADO #101789) — PASS
Entry point: the **signed-out** landing page `/no-auth/boxfusion.dsdnpo/landing-page` → **Report Anonymously**
→ **Whistleblowing** button → `/no-auth/shesha/workflow-action?id=<id>&todoid=<todoId>`.

🔑 **A workflow instance is created for an anonymous, unauthenticated visitor** — the same `workflow-action`
shape used by the authenticated registration wizard, but under `/no-auth/`.

- [PASS] The form is reachable **with no login at all** (verified genuinely signed out — the page offered *Login*)
- [PASS] **The anonymous toggle is present** — `Remain Anonymous`, with the hint *"Remaining anonymous means you
  won't be contacted regarding the case"*
- [PASS] **(BLOCKING)** **Ticking it removes First Name / Last Name / Email Address / Mobile Number entirely** —
  the case's *"no contact details required"* is satisfied properly, by removing the fields rather than merely
  making them optional
- [PASS] Category and case type selected — **Case Type** offers 10 values: *Conflict of Interest ·
  Constitutional Non-Compliance · Labour related issues · Membership related issues · Non-Compliance to NPO Act ·
  Office Bearers Dispute · Other · Poor Governance/ Maladministration · Procurement · Theft*
- [PASS] **Supporting document attached** — `attendance-register.txt`, later confirmed **persisted server-side**
- [PASS] Submitted → `/no-auth/boxfusion.dsdnpo/dsd-investigation-success-message?id=<id>`:
  > *"Your Case has been successfully Submitted. You can use Case Number: **INV1283/13/08/2026** for tracking."*
- [PASS] **The case is captured** — it appears on the admin portal and in the workflow inbox

### Positive findings worth recording
1. 🔑 **Selecting the NPO auto-populates Npo Name and NPO Address.** Choosing `333-018-NPO` filled
   *Nomfanelo QA NPO 2026-08-13* and **`18 South Street, Zwartkop, Centurion, South Africa`** — the exact address
   captured during registration. **This proves the registration address persisted**, which the NPO-06 report had
   flagged as doubtful after the admin application view rendered its location fields blank. The address is
   stored; only that one view fails to show it.
2. 🔑 **Our registered NPO is searchable from an unauthenticated page.** `333-018` resolved to
   `333-018-NPO - Nomfanelo QA NPO 2026-08-13`. **This is most of TC-14-S** (public NPO search) already evidenced.
3. 🔑 **Anonymity is enforced at the DATA layer, not just hidden in the UI.** The API returns
   `sourceCase: { isAnonymous: true, reportedUser: null }` — there is no submitter record to leak. The admin
   inbox correspondingly shows the initiator as **`Unidentified`**. Strong POPIA behaviour; worth citing in 14Y.

## ✅ TC-12-006 — Valid in-mandate case assigned to an investigator (ADO #101794) — PASS (with a display defect)

### 🔑 This answers the plan's open question: how a case becomes "validated" and "in mandate"
Both are a **workflow action**, not a data fix. The inbox task is **`Validate Investigation Case`**, and the
**Validate Case** dialog is *conditional*:

| Step | Behaviour |
|---|---|
| Dialog opens | `Is Valid For Investigation ?` + `Case Not Valid Comments`; **both `Valid` and `Invalid` disabled** |
| Tick *Is Valid For Investigation* | Reveals **`Is Case Within Mandate ?`**, `Third Party Email`, `Out of Mandate Comments` |
| Tick *Is Case Within Mandate* | **`Valid` enables** |

- [PASS] The guard is **correct** — `Valid` stays disabled until *both* flags are set. No way to validate a case
  without ruling on mandate.
- [PASS] After `Valid`: status **SUBMITTED FOR VALIDATION → SUBMITTED FOR ASSIGNMENT**, the task became
  **`Assign Investigator and Reviewer`**, and **`Assign Case` changed from disabled to enabled**. The sequencing
  is properly enforced.
- [PASS] The **Assign Investigator and Reviewer** dialog opens with two required pickers; **Submit stays disabled
  until both are chosen**.
- [PASS] **(BLOCKING)** **The case is assigned.** Investigator **fatima makina**, reviewer
  **Mutshutshu Tshithukhe**. Verified against the API the details page itself calls:
  ```
  investigator : 5876d452-0c21-4c31-a13c-1a2f8c62f99a
  reviewer     : 3e0bc0eb-f583-487d-8af9-2a0ba0b7c86f
  isValidForInvestigation : true
  investigationStatus     : 4   (AWAITING INVESTIGATION OUTCOME)
  ```
- [FAIL] ⚠️ **The assignment is NOT visible anywhere in the UI** — see the defect below.
- [SKIP] **Investigator notification (FDS Inv 8.3) not verified** — we have no mailbox for fatima makina. The
  case leaving our inbox and the status advancing are consistent with routing, but the notification itself is
  **unconfirmed**, so the case is not fully closed on that assertion.

## 🔴 TC-12-004 — Investigations list filterable by case status (ADO #101792) — FAIL
`CRUDS → Investigation` → `/dynamic/boxfusion.dsdnpo/investigations` — **163 cases**, rendered as a **card list**
(`.sha-datalist-cell`), not a `sha-react-table`. The plan's `[role=table]` guidance does not apply to this page.

- [PASS] **The list renders** with rows and statuses (*OPEN · CLOSED · IN PROGRESS*, as coloured tags)
- [PASS] A quick-search filter works — `INV1283` narrowed 163 → 1
- [FAIL] **(BLOCKING)** **There is no status filter.**
  - The toolbar's **funnel icon opens nothing** — clicked three times, via the icon, its parent button and a full
    synthetic pointer sequence. No modal, drawer, popover or dropdown is added to the DOM.
  - The quick search **does not match status**: `CLOSED` returns **`0 items found` / "No data"**, though CLOSED
    cases are plainly visible in the unfiltered list (screenshot captured).

  So the prescribed *"status filter works (FDS Inv 8.1)"* cannot be satisfied by any control on the page.

## 🔴 Defects raised
### 1. Assigned investigator and reviewer are stored but never displayed *(High)*
The assignment **saves correctly** — the API returns both ids and the workflow advanced. But:
- The case list shows **`Assigned to: (None)`** for our case *after* assignment, and for **all 163 cases**
- The case details page (`investigation-details v13`) shows **no investigator and no reviewer** — neither
  `fatima` nor `Mutshutshu` appears anywhere in the rendered page

**Why this matters:** DSD staff cannot see who owns any investigation. It is a pure presentation gap over
correct data, so it should be a cheap fix — and it directly fails TC-12-006's *"assignment is visible on
re-opening the case"*.
Bug: `test-reports/bugs/2026-08-13-investigation-assignee-not-displayed.md`

### 2. Every investigation case is titled "Address Missing" *(Medium)*
All 163 cards render the title **`Address Missing`** — including ours, which **has** an address
(`18 South Street, Zwartkop, Centurion`, shown correctly on the case details page). The list is therefore
unreadable: no case number, no NPO name, no case type, nothing to tell one case from another.
Bug: `test-reports/bugs/2026-08-13-investigation-cards-titled-address-missing.md`

### 3. Investigation cases cannot be opened from the Investigations list *(Medium)*
The card has **no anchor, button or `role=button`**, and the only React `onClick` (on
`.sha-datalist-component-item`) does nothing when clicked. The only way to reach a case is the **magnifier link
in the workflow inbox** (`/shesha/workflow-action?id=…&todoid=…`). Since the inbox holds **2,475 items** and only
shows tasks assigned to *you*, a case with no outstanding task for the current user is effectively unreachable.

### 4. Nav flyout overlays page controls — **CONFIRMED ON A SECOND PAGE**
Suite 15 reported the `Dashboards` flyout covering the *Add Intervention* button. It **also overlays the
workflow-action toolbar** (captured in the Validate Case screenshot, sitting on top of the page header). This is
**not** an Education-and-Awareness quirk — it is a global layout defect.
Existing bug: raised under suite 15.

## ⚠️ Two corrections to today's suite 15 report
Both were caught by this run and the suite 15 report has been amended in place.

1. **RETRACTED — "a raw GUID renders in the District dropdown".** The same GUID `<div>` appears in *every*
   `ant-select` on both portals, so I re-checked it here with a **screenshot**: it is a **zero-width element,
   invisible to a user**. The dropdown renders cleanly. It surfaces only in text extraction. **Not a defect.**
   🔑 *Never raise a rendering defect from extracted text alone — confirm visually.*
2. **CORRECTED — "the upload could not be bound under automation".** That used the wrong selector
   (`.ant-upload-list-item`, which this platform does not use). Here the identical control **accepted the file,
   rendered `attendance-register.txt Download Zip`, and the file persisted server-side**. **Shesha uploads ARE
   automatable.** TC-15-003's root cause remains undetermined and still needs the manual check.

## 📌 Observations
1. **The Assign pickers are searches that return `No data` until you type** — `zzzzqqq` correctly returns nothing
   while `fat` returns `fatima makina`, so the empty initial list is **not** a defect.
2. **Neither `Mpendulo` nor `Thabiso` can be selected** as investigator or reviewer (both return *No data*),
   though `Appeal Admin` and `Appeal Chairperson` *are* offered as investigators. So the pickers are **role- or
   permission-scoped, but seemingly not to an investigator role**. Worth confirming who is meant to be eligible.
3. **Two different departmental phone numbers.** The investigation success page gives **0123127500**; the office
   bearer self-confirmation thank-you screen gave **0123227500**. Same department, same email
   (`npoinquiry@dsd.gov.za`) — one of the two is a typo.
4. **The footer links leave the environment.** On QA, *Contact Us* and *FAQ* in the page footer point at
   **`dsd-npo-publicportal-test.azurewebsites.net`** (the TEST environment), while the header versions correctly
   use relative `/no-auth/...` paths. Hardcoded absolute URLs.
5. **The list has no meaningful default sort** — created dates on page 1 run 15/10/2025, 18/02/2026, 06/08/2026,
   27/09/2025… so a newly created case is not findable without searching.
6. `Priority` (High), `Category` (Investigation) and `Reported By Channel` (Web) are **fixed, non-editable** on
   the public form — the reporter cannot inflate priority. Sensible.

## ❓ Questions for the test lead
1. **Who should appear in the Assign Investigator / Assign Reviewer pickers?** Neither Mpendulo nor Thabiso is
   eligible, yet *Appeal Chairperson* is offered as an investigator. Is this scoped to a role, and is that role
   the right one?
2. **Where is the investigator meant to be displayed?** The data is stored correctly — is a column and a details
   field simply missing, or is it intentionally hidden?
3. **Is the Investigations list meant to be openable?** Today a case is reachable only via the inbox task.
4. **Which department number is correct — 0123127500 or 0123227500?**
5. Should the investigations list carry a real **status filter**, and what should the card **title** be?

## ▶ Next
Still open: **14S public NPO search (1 — largely evidenced above)** · **10P / 10A Post Registration (6)** ·
**13P / 13A Deregistration (6)**. The investigation itself now sits at **AWAITING INVESTIGATION OUTCOME** with
fatima makina as investigator — continuing it needs her login, so the remaining investigation cases (Functional
suite 101897) are blocked on that.
