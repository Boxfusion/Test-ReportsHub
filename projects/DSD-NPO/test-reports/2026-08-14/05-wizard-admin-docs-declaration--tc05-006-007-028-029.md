# Report: NPO Registration 05 — Wizard Tabs 5–8 (Admin & Operations, Documents, Declaration)

**Date:** 2026-08-14 07:15 UTC
**Plan:** test-plans/npo-registration/05-wizard-admin-docs-declaration.md
**Spec:** test-plans/npo-registration/05-wizard-admin-docs-declaration.spec.ts
**Execution Mode:** ai-repair
**Result:** FAILED — TC-05-029's blocking assertion fails on data loss; TC-05-028 is not executable as written
**Duration:** ~2400s
**Cases:** TC-05-006, TC-05-007, TC-05-028, TC-05-029
**Assessed-not-executed:** TC-05-002, TC-05-013, TC-05-016, TC-05-019, TC-05-026, TC-05-027
**Environment:** QA · public portal · view mode **Latest** · form `boxfusion.dsdnpo/create-npo v61`
**Application under test:** APPL26-01106 (`QA Smoke NPO 2026-08-14`), Legal Form Voluntary Association / Membership

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 20 | 15 | 5 | 0 |

**Per-case verdicts:** TC-05-006 **PASSED** · TC-05-007 **PASSED** · TC-05-028 **FAILED** (not executable as
written) · TC-05-029 **FAILED (blocking)**. The report-level `FAILED` is driven by TC-05-029.

## Step Results

### TC-02 — Required documents vary by organisation type (ADO #101682 · TC-05-006)
**Mode:** ai-repair
**Duration:** ~120s
**Case result: PASSED** — all three organisation types captured. *(Upgraded from PARTIAL after a second run on draft
`APPL26-00599` / `QA Docs NPC 2026-08-14`, which was driven to Documents as an NPC and then, via Back to
Organisation Details and a Legal Form switch, as a Trust.)*

- [PASS] **(BLOCKING)** **Each organisation type presents its own document set, and the three are genuinely
  distinct:**

| Legal Form | Slots presented | Mandatory in behaviour | Marked required (`*`) |
|---|---|---|---|
| **Voluntary Association** (Membership) | `Constitution File` · `Additional Documents File` | Constitution — but it is **auto-generated**, so nothing to upload | ✅ `Constitution File *` |
| **NPC** | `Certificate of Incorporation issued by the commissioner (CoR14.3)` · `Memorandum of Incorporation (CoR15.1C)` · `Certificate of registration of Directors` · `Additional Documents File` | **all three** | ✅ all three marked `*` |
| **Trust** | `Deeds Of Trust File` · `Letter Of Authority File` · `Additional Documents File` | **both** Deeds of Trust and Letter of Authority | 🔴 **neither marked** |

- [PASS] The **VA** set: `Constitution File *` arrives **already populated and auto-generated** —
  `QA Smoke NPO 2026-08-14 - ApplicationMembershipConstitution.pdf (71.39 kB)`, produced from the Membership legal
  form. `Next` is enabled on arrival because the one required document fills itself. **This contradicts the plan's
  assumption** that the applicant uploads a constitution.
- [PASS] The **NPC** set: three genuinely uploadable required slots, all correctly asterisked, `Next` disabled until
  they are supplied. No auto-generated document.
- [PASS] The **Trust** set: proven mandatory by stepping the uploads one at a time —
  nothing uploaded → `Next` disabled · Deeds of Trust uploaded → **still disabled** · Letter of Authority also
  uploaded → **enabled**. `Additional Documents File` is genuinely optional.

### 🔴 Finding — the Trust document set is mandatory but unmarked, while NPC's is marked correctly
Two required uploads on the Trust branch carry **no asterisk and no `ant-form-item-required` class**, so a Trust
applicant sees three apparently optional uploads and a disabled `Next` with no indication which are needed. The NPC
branch of the **same step** marks its three correctly. This is the **fourth instance** of the unmarked-mandatory
pattern found today (with `Area of Operations`, the Objectives `Sector`, and the nine Declaration acknowledgements) —
and the inconsistency between two branches of one step suggests per-field form configuration rather than a platform
default.

### Deviations from the ADO expectations (flagged, not failed — the case says "e.g.")
- **VA** — the case lists *"Constitution, Founding statement"*. There is **no `Founding statement` slot**.
- **NPC** — the case lists *"e.g. MOI, Constitution"*. MOI is present as `CoR15.1C`; there is **no Constitution slot**,
  and two documents the case does not mention are required (`CoR14.3`, `Certificate of registration of Directors`).
- **Trust** — the case lists *"Letter of Authority, IT Reg"*. Letter of Authority is present; **`IT Reg` is captured
  as a field on Organisation Details (`ITRegistration No *`), not as a document**, and `Deeds Of Trust File` is
  required but unlisted.

📌 **Corroborated by the data model:** the application payload carries a field per document type —
`constitutionFile`, `memorandumOfIncorpFile`, `certificateofIncorpFile`, `deedsOfTrustFile`, `letterOfAuthorityFile`,
`additionalDocumentsFile`, `certificateOfRegistrationFile` — matching the three rendered sets.

📌 **Method note worth reusing:** all three sets were captured from **two drafts, not three**. Back-navigation to
Organisation Details, switching Legal Form, and walking forward again re-renders the Documents step for the new type.
Cheaper than the three separate drafts the plan budgets for — but see the office-bearer caveat under TC-09.

---

### TC-03 — Upload a PDF under 10 MB succeeds (ADO #101683 · TC-05-007)
**Mode:** ai-repair
**Duration:** ~60s
**Case result: PASS** (with one deviation from the case's wording).

- [PASS] **(BLOCKING)** Upload succeeds — `POST /api/StoredFile` → **200**, returning
  `id: 1bc2bb31-4a9c-421c-b073-395be876a640`, `name: qa-constitution-2026-08-14.pdf`, `size: 120426`, `type: .pdf`,
  **`temporary: false`** (so it is committed, not staged)
- [PASS] The file appears with **name and size** — `qa-constitution-2026-08-14.pdf (120.43 kB)`
- [PASS] **Remove** is offered — the item exposes a `delete` control; **download** is offered as the filename link
  *(its `href` is empty and resolved by a click handler at runtime, which is the known pattern on this platform — do
  not assert on the attribute)*
- **Deviation:** the case says to upload into the **Constitution** slot. That slot is auto-generated and not
  uploadable for a VA, so the upload was made into **Additional Documents**, the only uploadable slot on this
  organisation type. The upload mechanics are proven; the case's target slot does not exist as described.
- 📌 The `500 /api/StoredFile/FilesList` the plan warned about **did not occur** on this form.

---

### TC-08 — Tab-tick navigation preserves data on the current tab (ADO #102158 · TC-05-028)
**Mode:** ai-repair
**Duration:** ~180s
**Case result: FAILED — not executable as written.**

- [PASS] Tabs 2–4 complete and **Tab 5 partially filled** (`Humanitarian` + `Charitable` ticked, `Next` enabled)
- [PASS] The Tab 4 tick is visible in the stepper — the item carries `ant-steps-item ant-steps-item-finish`
- [FAIL] Step 3 — **clicking the tick mark of Tab 3 does nothing.** Real mouse clicks at the measured screen
  coordinates of the step's **icon**, its **title** and its **container** all leave the wizard on Tab 5.
- [FAIL] Step 4 — cannot be assessed; the wizard never navigates
- [FAIL] Step 5 — cannot be assessed
- [FAIL] **(BLOCKING)** Step 6 — cannot be assessed via the prescribed route

**Why:** the stepper is a **read-only progress indicator**. The completed step has `cursor: auto` (no pointer
affordance), no `role` attribute, no `tabindex`, and no focusable child. There is no tab-tick navigation in this
build. Combined with the suite-14W finding that the stepper is also unreachable by keyboard, the stepper is not
interactive at all.

**The underlying risk the case targets does NOT materialise.** Using `Back`/`Next` — the navigation that does work —
the round trip Tab 5 → Tab 4 → Tab 5 preserved everything: Tab 4 still showed **`1-3 of 3 items`** with all three
office bearers, and Tab 5's two ticks were both still set. So there is **no data loss from tab jumping**; the case
fails because its control does not exist, not because the wizard loses data.

---

### TC-09 — Draft survives logout and re-login (ADO #102159 · TC-05-029)
**Mode:** ai-repair
**Duration:** ~600s
**Case result: FAILED (BLOCKING) — real data loss.**

- [PASS] Filled the wizard to Tab 4 with **3 office bearers** added, each shown in the grid (`1-3 of 3 items`)
- [PASS] Step 3 — **logout succeeds**, returns to `/login`
- [PASS] Step 4 — logged back in as the same submitter
- [FAIL] Step 5 — **the draft is not listed on the dashboard.** The NPO landing view's own **`Draft Application`**
  panel reads *"All Done! You're all caught up, there's no new actions."* even though a draft exists on that NPO. The
  draft is reachable only via the **header user menu → `Organistions`**, which lists the organisation but is not the
  dashboard the case describes.
- [PASS] Step 6 — the draft **is** resumable by URL, and Organisation Details data survived (`Next` was enabled on
  arrival at Tabs 2 and 3, which is impossible with empty mandatory fields)
- [FAIL] **(BLOCKING)** Step 7 — **it does not open at Tab 4, and the data is not intact.** It reopens at **Tab 1
  (Read This)** with every completion tick cleared, and on reaching Tab 4 the office-bearer grid reads
  **`0 items found`**, stable across a 30-second poll.

**Verified server-side, because "not displayed" and "not saved" are different bugs here.** Querying by NPO id:

| Entity | Filter | Result |
|---|---|---|
| `NpoProvinceOperation` | `Npo == ae7257cf…` | **1** — Gauteng, created 06:35:04 ✅ persisted |
| `NpoObjective` | `npo == ae7257cf…` | **1** — the saved objective ✅ persisted |
| `NpoOfficeBearer` | `organisation == ae7257cf…` | **0** ❌ |
| `NpoOfficeBearer` | `creationTime > 2026-08-14T00:00:00` | **0 rows anywhere in the table** at that point |

So the three office bearers were **never written to the database**, while the province, the objective and
Organisation Details all were. They existed only in client state, were displayed as saved, and were lost on logout.

### ✅ CAUSE NOW PROVEN — and it is not what this report first said

A dedicated payload-capture run on draft `APPL26-00592` established the real mechanism. Full write-up:
`test-reports/bugs/2026-08-14-org-details-resave-deletes-all-office-bearers.md` (**Blocker**).

**Re-saving the Organisation Details step deletes every office bearer.** Measured against the database, one action at
a time:

| Action | `NpoOfficeBearer` rows |
|---|---|
| One office bearer saved on Tab 4 | **1** |
| `Back` twice to Organisation Details | **1** — back-navigation is harmless |
| `Next` with **no field changed** | **0** |

The responsible call is `POST NpoApplicationActions/CreateAndUpdateApplicationAsync`, a **full-object update whose
payload contains no office-bearer collection**. No `DELETE` is issued; the server treats the absent collection as
empty. Nothing is shown to the user.

**Three earlier explanations in this report are therefore withdrawn:**
1. ~~"Office bearers are never persisted"~~ — that came from a `sorting=creationTime desc` query, and **`sorting` is
   silently ignored on these endpoints**.
2. ~~"Saves in the same session the NPO is created don't persist"~~ — **refuted.** The first save in a fresh session
   posts the **correct** `organisationId` and returns 200, and the row is in the database. A stale
   `localStorage.currentOrganisation` is irrelevant — the id comes from the application context, not storage.
3. ~~"Changing the Legal Form wipes them"~~ — nearly right but too specific; the legal-form change merely forced a
   re-save of Tab 2.

**Both original incidents are the same single cause.** On this application I walked forward with `Next` *through*
Organisation Details after re-login **before** querying the database — so I destroyed the data I then measured. On the
NPC draft I went back to switch Legal Form. The "reload first" workaround worked only because it happened to avoid
re-saving Tab 2, not for the reason given.

**Consequence for this case:** because the draft reopens at Tab 1, *resuming a draft at all* forces the user through
Organisation Details and wipes their office bearers. **Fixing that defect removes most of TC-05-029's failure** — what
would remain is the wrong resume tab and the missing dashboard listing.

🔑 **Method lesson:** measure the database immediately before and immediately after the **single** action under test.
Every wrong diagnosis above came from checking state after several intervening navigations.

## Two corrections to my own findings in this run

1. **I first reported that office bearers are never persisted at all.** That was based on sorting the table by
   `creationTime desc` and seeing yesterday's date at the top. **The `sorting` parameter is silently ignored by these
   `Crud/GetAll` endpoints** — the query returned an arbitrary page, not the newest rows. Filtering on `creationTime`
   instead gave the true picture: they *are* normally persisted, and the loss is specific to the first-session case
   above. The finding survives but is much narrower than I first stated.
2. **I flagged the `Financial year end month` list as missing November and December, and the Nationality list as
   broken.** Both were wrong. The month list is virtualised (all 12 are present) and the Nationality select is
   server-paged at 10 with substring search — my own `Control+A` inside it put it into an empty state, and my repeated
   typing accumulated (`Botswana` + `Botswana`). Harness faults, not app faults.

## Observations
1. **Submit requires nine unmarked acknowledgement checkboxes.** The Declaration tab's `Capacity *` is properly
   asterisked, but the nine section-17/18 undertakings carry **no required marker** and `Submit` stays disabled until
   **all nine** are ticked. Third instance of the unmarked-mandatory pattern today (with Area of Operations and the
   Objectives `Sector`).
2. ✅ `Name of submitter` auto-populates (`Mpendulo ntshangase`) and `Capacity` is a dropdown of 10 values —
   Director · Incorporator · Secretary · Chairperson · Company Secretary · Member · Trustee · **Chief Executive
   Officer** · Officer · Manager. *(Note: `Chief Executive Officer`, where the earlier note recorded `CEO`.)*
3. ✅ **Submit works** — `POST /api/services/SheshaWorkflow/Process/UserTaskComplete` → 200, redirect to the NPO
   landing view, and the header finally updates to the new NPO name at that point.
4. **Admin & Operations is 27 checkbox categories**, none required individually, at least one needed to proceed.
5. ⚠️ *"Created by … 2 hours ago"* on a draft made seconds earlier — the UTC-rendered-as-SAST issue again.

## Questions for the test lead (Thabiso)
1. **Where is a submitter meant to find their draft?** The landing page's `Draft Application` panel never shows one.
   If `Organistions` is the intended route, TC-05-029 step 5 needs rewriting; if the panel is intended, it is broken.
2. **Should the wizard reopen at the furthest completed tab?** It currently always reopens at Tab 1 with the ticks
   cleared, which conflicts with #102159's *"opens at Tab 4"*.
3. **Is the stepper meant to be clickable?** TC-05-028 depends on it entirely. If it is a progress indicator by
   design, the case needs replacing with a `Back`/`Next` round-trip test — which passes.
4. **Is the auto-generated constitution correct for all Membership VAs?** It changes TC-05-006 and the plan's
   TC-02/TC-03 assumptions, and means the applicant never supplies their own constitution on this path.
