# Report: NPO-03 / NPO-04 — Public-portal registration (supported path)

**Date:** 2026-08-13 11:24 UTC
**Plan:** test-plans/npo-registration/03-wizard-org-details-objectives.md
**Spec:** test-plans/npo-registration/03-wizard-org-details-objectives.spec.ts
**Execution Mode:** ai-repair
**Result:** PARTIAL — Tabs 1–4 complete; 3 office bearers captured; stopped at Admin & Operations
**Duration:** 900s
**Cases:** TC-03-001, TC-03-006, TC-03-008, TC-03-016, TC-03-031 · TC-04-001, TC-04-023 (smoke suites 101860 / 101861)
**Environment:** QA · **public portal** · view mode **Latest**
**Application:** Ref **APPL26-00817** · `id=6c45a022-6cc8-4696-93bf-e1fdf41ce4f3` · `todoid=ce6d9b72-227e-485f-b29c-f1e6e97a3798`

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 32 | 27 | 2 | 3 |

## 🔑 Scope correction from the dev — this run uses the SUPPORTED path
Mpendulo confirmed that **`Workflows → My Items → Create New → Registration Process` is NOT to be used.** That
explains why it appears in neither ADO plan.

Consequences applied here:
- **`APPL26-00793` (created via that route on 2026-08-13) is not a valid test record** and is abandoned.
- This run creates **`APPL26-00817`** through the supported public-portal route:
  *Register NPO → Register a new NPO → POPIA consent → Initiate Registration.*
- The **admin-portal address failure drops in significance** — it only affects a path we are not meant to use.
  See the rescoped bug file.

## ✅ What passed

### TC-03-001 — POPI Act consent gate (ADO #101625)
- [PASS] Landing page offers *Register a new NPO* / *Link to an Existing NPO* / *Enquiry*
- [PASS] 🔑 3 DOM matches for "Register a new NPO", **only 1 visible** — the hidden-duplicate trap, exactly as documented
- [PASS] POPIA page displayed with **2 consent checkboxes, both unticked** on arrival
- [PASS] **Next disabled** with zero consents
- [PASS] **Next still disabled with only ONE consent ticked** — partial consent correctly rejected
- [PASS] Next enables with both ticked, and creates the workflow instance **APPL26-00817**
- 📌 Live differs from the case wording: a **full page** at `/popi-act` with **2** checkboxes and a **Next**
  action, where ADO #101625 describes a **dialog** with **1** checkbox and an **OK** button. Behaviour is right;
  the case text is stale.

### TC-03-008 — Address search (ADO #101632) — **PASSES on the public portal**
- [PASS] Typing returns suggestions in `.location-search-input-wrapper > .dropdown-container`
- [PASS] Selecting one populates the address **and every derived field**:

| Field | Value |
|---|---|
| Full Address (physical + postal) | `18 South Street, Zwartkop, Centurion, South Africa` |
| Province | **Gauteng** |
| Metropolitan Municipality | **City of Tshwane Metropolitan Municipality** |
| Area Code | **0149** |
| District Municipality | *(empty — correct; Tshwane is a metro, so metro and district are mutually exclusive)* |

**This case should be marked PASSED.** It is tagged `Portal: Public`, and on that portal it works.

### TC-03-031 / TC-03-016 — Read This, and Objectives
- [PASS] Tab 1 *Read This* active, informational, **no Back button**; Next advances
- [PASS] **Add Objective** opens (FDS Fig.15) and saves; the objective renders under *"The Organisation Main Objectives"*
- 📌 It is a **three-level cascade**: **Sector → Objective → Service**. Save stays disabled until all three are
  set, and each level filters the next. Recorded values: `Social Services → Emergency and Relief →
  Disaster/emergency prevention and control`. Neither field is marked required, and there is a
  *"Do you want to add a secondary objective?"* toggle.
- [PASS] Data survived a **Back → forward** round trip (relevant to TC-05-028)

### TC-04-001 — Office Bearer with a DHA-matched SA ID (ADO #101655)
- [PASS] SA ID `8001015009087` auto-derived **Date of Birth `01/01/1980`** and **Gender `Male`** — correct parsing
- [PASS] DHA returned the verified identity and **overwrote the typed name** with **`Ryno Koen`**, and set
  **Nationality `South Africa`**
- [PASS] Saved and **retrievable** — grid reads `1-1 of 1 items`
- [FAIL] ⚠️ **No `ID Verified` status.** ADO #101655 prescribes *"OB appears in list with status 'ID Verified'"*.
  The grid columns are: *Full Name · Nationality · SAIDNumber · Passport Number · Passport Expiry Date · Date Of
  Birth · Gender · Has Disability · Type Of Disability · Residential Address · Work Address · Mobile Number ·
  Home Number · Whatsapp Number · Email Address · Position* — **there is no verification-status column at all**,
  so a verified and an unverified OB are indistinguishable in the list.

### TC-04-023 — minimum 3 office bearers ✅ RESOLVED, and Tab 4 is PASSED
**All three office bearers captured and the wizard advanced to Admin & Operations.** The four preceding steps are
marked `finish` in the stepper.

| # | Name | Route | Nationality | Position | Mobile |
|---|---|---|---|---|---|
| 1 | **Ryno Koen** *(DHA-verified)* | SA ID `8001015009087` | South Africa | Chairperson | `0818400598` |
| 2 | **Thabo Molefe** | Passport `A98765432` | Zimbabwe | Secretary | `0818400591` |
| 3 | **Lerato Dlamini** | Passport `B11223344` | Zimbabwe | Treasurer | `0818400592` |

- [PASS] Next **disabled** at 1 and 2 office bearers
- [PASS] Next **enables at exactly 3** and advances to Tab 5
- [FAIL] ⚠️ **No validation error is raised** on the blocked action. ADO #102155 prescribes the exact string
  *"Minimum 3 office bearers required"*. What exists is a **static note** permanently displayed above the grid —
  informative, but not raised **in response to** the blocked click.

🔑 **Office bearers need a UNIQUE mobile number and email each.** Reusing one raises a transient toast
— **"OB With same mobile number exists"** — and leaves Save disabled. That is why the project convention of always
using `0818400598` can only apply to **one** office bearer (used here for the chairperson).
⚠️ Plus-addressed emails (`name+ob2@domain`) are **rejected** as invalid.

## 🔴 The one real defect at this step — DHA non-match is silent

**TC-04-023 needs 3 office bearers.** Adding a second with a **checksum-valid SA ID that DHA has no record for**
(`9001015009086`) produces this:

| Behaviour | Observed |
|---|---|
| Date of Birth | ✅ derived — `01/01/1990` |
| Gender | ✅ derived — `Male` |
| First Name / Last Name | 🔴 **empty, and CANNOT be typed into** — real keystrokes produce nothing, sampled over 4 s |
| Validation message | 🔴 **none** — `.ant-form-item-explain-error`, `.ant-message-error`, `.ant-alert-error`, `.ant-notification-*` all empty |
| Save button | 🔴 **disabled**, with no indication why |

**The name fields are populated solely by the DHA lookup and are otherwise locked.** So when DHA has no match the
user faces a permanently disabled Save, two blank mandatory fields they cannot fill, and **no explanation
anywhere**.

**The control is arguably correct** — an unverifiable person should not be registrable as an office bearer. **The
feedback is the defect.** ADO #101607 / TC-01-013 prescribes the shape for the account-creation equivalent:
*"Inline error indicates DHA verification failed … user is offered to retry or use passport instead."* Nothing of
the sort appears here.

📌 This also explains the earlier passport-variant puzzle on `APPL26-00793`, where Save stayed disabled with all
16 fields apparently populated: the same silent lookup was blanking the name fields after they were read.

## TC-04-023 — minimum 3 office bearers (ADO #102155)
- [PASS] The rule **is** enforced — `Next` is disabled with 1 OB
- [FAIL] ⚠️ **No validation error is raised.** ADO #102155 prescribes the exact string
  *"Minimum 3 office bearers required"* on clicking Next. What exists instead is a **static note** permanently
  displayed above the grid: *"An office bearer means a director, trustee or person holding executive position. A
  minimum of 3 Office Bearers to be captured."* Better than nothing, but it is not the prescribed feedback, and it
  does not appear **in response to** the blocked action.

## Skipped
- [SKIP] OB2 and OB3 — no second DHA-matched SA ID available (see the question below)
- [SKIP] Admin & Operations, Control Structure, Documents, Declaration, Submit
- [SKIP] NPC / Trust legal-form variants

## Other observations
1. **The stepper is dynamic — 8 steps, not 7.** `Control Structure` appears between *Admin & Operations* and
   *Documents* once **Objectives** is complete. **The ADO cases were right**; our 7-step note is withdrawn.
2. **`National (SA)` and `International` are MULTI-SELECTS** under the heading *"Area of operations: List of
   countries"* — so they **are** the Area of Operations field. `National (SA)` = the 9 SA provinces;
   `International` = countries. ⚠️ **Neither is marked required**, though ADO #101636 / #101654 make Area of
   Operations mandatory.
3. ⚠️ **`South Africa` appears in the `International` list** — arguably wrong for a field capturing *international*
   areas of operation, since `National (SA)` already covers SA.
4. ⚠️ **The nationality list is incomplete** — no Botswana, Angola or Namibia — and contains the typo **`Cryprus`**.
5. **Office Bearer positions:** Director · Secretary · Chairperson · Trustee · Trust · President · Deputy
   Chairperson · Treasurer · Additional Member. *(Both "Trustee" and "Trust" appear — likely a duplicate.)*
6. **Gender options:** Male · Female · Not Disclosed.
7. On the OB form, **`Is RSA ID Number` defaults to UNTICKED**, so the passport variant shows first. Ticking it
   swaps Passport Number/Expiry/Nationality for SAIDNumber and turns **Date of Birth and Gender into derived
   fields** — TC-03-032's prescribed behaviour, confirmed.
8. Login landed on `/dynamic/boxfusion.dsdnpo/npo-landing-view` this time, **not** the workflows inbox as on
   earlier runs. The landing route appears to vary with account state.

## ❓ Questions for the test lead
1. 🔑 **Which SA ID numbers does DHA resolve on QA?** We have exactly one (`8001015009087` → Ryno Koen). Without
   two more, the 3-office-bearer minimum cannot be met and **the entire journey beyond Tab 4 is unreachable** —
   which blocks TC-05-016 (Submit) and, through it, suites 06→13.
2. Should a **DHA non-match** show an inline error and offer the passport route, as ADO #101607 describes?
3. Should the OB grid carry an **`ID Verified`** status column per ADO #101655?
4. Is **Area of Operations** meant to be mandatory? It is not marked required in the build.
5. Are **"Trustee"** and **"Trust"** both intended as office-bearer positions?

## Artefacts
- **APPL26-00817** left resumable at **Office Bearer** with 1 saved OB. Resume rather than creating another.
- `APPL26-00793` abandoned — created via the unsupported admin route.
- No records were deleted or actioned; the OB2 dialog was cancelled.
