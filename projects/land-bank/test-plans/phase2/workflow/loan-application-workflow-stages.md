# Test Plan: P2-WF-4.1 — Loan Application Workflow Stages (Individual / Landbank Branch path)

> **Status:** Ready — end state confirmed live against Phase 2 (Opportunity `44e9a263-0357-467a-92a9-3de727398288`, Account "Sanele Xulu", reached `Application Status: Complete`); mid-stage selectors not yet recorded via `/CreateTest`
> **Owner:** QA
> **Last Updated:** 2026-08-25
> **Estimated Duration:** unverified

## Metadata
| Field | Value |
|-------|-------|
| App | Land Bank CRM (Admin Portal) — **Phase 2** |
| Environment | Phase2 (`PHASE2_APP_URL`, requires `TEST_ENV=phase2`) |
| Login As | RM role (`PHASE2_RM_USERNAME` / `PHASE2_RM_PASSWORD` in the gitignored `.env`) |
| Pages under test | Opportunities (`/dynamic/LandBank.Crm/LBOpportunity-table`), Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`), Workflow action (`/shesha/workflow-action?id=&todoid=`) |
| Upstream plans | [../opportunities/opportunity-loan-application-capture.md](../opportunities/opportunity-loan-application-capture.md), [../leads/lead-to-opportunity-lifecycle.md](../leads/lead-to-opportunity-lifecycle.md) |
| Dev counterpart | [../../dev/workflow/loan-application-workflow-stages.md](../../dev/workflow/loan-application-workflow-stages.md) — WF-4.1, documents the full stage model (Resolution → Consent → Verification → Onboarding → Complete) across both PERSONAL and ENTITY; this plan narrows scope to **one PERSONAL scenario** initiated from the Individual / Landbank Branch path |
| Source recording | Scribe walkthrough — [*Creating and Processing a New Loan Lead*](https://scribehow.com/o/gfgv2johTcScLr2LqrgTxQ/viewer/Creating_and_Processing_a_New_Loan_Lead__t9gg08kUQeCnioP1ERM6Ag) (195 steps). Steps 177–195 map to this plan |
| DevOps context | [100614](https://dev.azure.com/boxfusion/LandBankCrm/_workitems/edit/100614) *Inbox tabs do not correspond to workflow steps* (Bug, state `Testing`, tags `Awaiting QA deployment` / `Passed Dev Testing`) — a live regression check for this plan's Inbox-navigation assertions. [106407](https://dev.azure.com/boxfusion/LandBankCrm/_workitems/edit/106407) *Party Consent: Send Consent to application parties* and [109815](https://dev.azure.com/boxfusion/LandBankCrm/_workitems/edit/109815) *Update Land Bank Branch Signatory Consent content* (both `Testing`) are the to-be source for the consent-stage behaviour this plan's Key Difference #1 depends on |

## Objective
> Validate that, once an Individual / Landbank Branch Opportunity's loan application is initiated, it skips the consent
> stage (already satisfied upfront), progresses through **ID Verification** (Approve) and **KYC Verification**, then
> **Finalise Verification Outcomes** and the **Complete Onboarding Checklist**-equivalent step, and reaches
> **Application Status: Complete** — the single path the source Scribe walkthrough exercises end to end, now confirmed
> live by re-reading the resulting Opportunity.

## Confirmed live: the end state

Re-opening the Opportunity this recording produced (`Sanele Xulu`, `Application Type: Personal`) shows its header
status reads **`Complete`** — confirming the recording's final **Submit** (step 193) completed the **entire** workflow
in one pass, not an intermediate onboarding step. This resolves what was the single largest open question in the prior
draft of this plan.

The Inbox no longer lists this application (only two **older**, unrelated `Sanele Xulu` items remain, both dated
21/08/2026 and both still at **Upload Individual Consent** — from a **different**, Online-Digital-Channel-style
scenario, confirming those two never received upfront branch consent, unlike this plan's scenario).

## Key differences from the Dev plan (confirmed)

1. **Because consent was captured upfront at lead capture** (Landbank Branch, Upload Consent = True — see the upstream
   lead plan's TC-06), this application's first Inbox stage was **not** a consent stage — it opened directly at a
   verification stage (an **"Awaiting Review"** status button and an **"ID Verification"** tab). ✅ **Confirmed**,
   matching the Dev plan's documented rule that Landbank Branch consent satisfies the workflow's consent stage on
   arrival. The two older, still-outstanding `Sanele Xulu` Inbox items (both `Upload Individual Consent`) are the
   live control case proving the *opposite* path still shows a consent stage — reinforcing that this is channel-driven,
   not something broken.
2. **The per-person verification dialog on Phase 2 combines ID Verification and KYC Verification review in one pass**
   (ID Verification tab → decision `Approve` → **Submit** → KYC Verification tab → **Close**) before **Finalise
   Verification Outcomes** — matching the *shape* of Dev's documented dialog (`main-applicant-verification-details
   v15`, tabs Overview / ID Verification / KYC Verification). The recording shows **no separate KYC decision** being
   made (no second Approve/Submit between the KYC tab click and Close) — ⚠️ **still needs live confirmation**: does KYC
   Verification require its own manual decision on Phase 2, auto-resolve, or was it simply reviewed without a decision
   being available? Not resolved by the read-only Opportunity re-read (the completed status doesn't distinguish how KYC
   was settled).
3. **Confirmed:** the step following Finalise Verification Outcomes is the **same Pre-Onboarding Checklist** form Dev
   documents (`complete-pre-onboarding-checklist`, **v6** on Phase 2 vs Dev's **v16**), and it **is** the final stage —
   Submitting it (step 193) took the application straight to `Complete`. Confirmed via the read-only mirror embedded on
   the Opportunity (see the paired [Opportunity plan](../opportunities/opportunity-loan-application-capture.md)):
   **Years Of Farming Experience is `Up to 2 Years`, a bucketed select — not Dev's typed number field.** This is a
   confirmed, load-bearing difference: any spec written against Dev's mechanics (`fill('12')`) will not work on Phase 2.
   Only one checklist box was ticked in this run — **Business Plan Development Support required?**
4. **No Upload Resolution or Upload Individual/Entity Consent stage appears in this recording at all** — consistent
   with #1. This plan therefore does **not** exercise the consent-stage mechanics the Dev plan documents in detail
   (electronic vs. manual route, declaration text) — see the Dev plan directly for that coverage, or extend this plan
   using one of the two older `Sanele Xulu` Inbox items still sitting at **Upload Individual Consent** on Phase 2,
   which are a ready-made live fixture for that scenario.
5. **DevOps regression check (100614):** *"Inbox tabs do not correspond to workflow steps"* is a Bug in state `Testing`
   with tags `Awaiting QA deployment` / `Passed Dev Testing` — i.e. it passed on Dev and is waiting to be verified on a
   QA/Phase-2-class environment. TC-01 below should explicitly check that the Inbox row's **Action Required** column
   corresponds to the actual step reached when the row is opened, as a live regression check for this bug on Phase 2.

## Recorded Step Sequence (from the Scribe walkthrough, this plan's scope)

- **177** ✅ Click **Initiate Loan Application** (on the Opportunity populated by the paired Opportunity plan)
- **178** ✅ Click the **Inbox** item in the side menu
- **179** ⚠️ Click an icon — the workflow action link (`a.sha-link`) on the top Inbox row, per Dev's documented Inbox mechanics; selector not yet re-recorded on Phase 2
- **180** ✅ Click the party's **"Awaiting Review"** status button
- **181** ✅ Click the **ID Verification** tab
- **182** ⚠️ Click a search field — the **ID Review Decision** select (Dev: `idVerification_firstNameReviewDecision`, options `Approve` / `Reject`) — value confirmed by the next step, exact field label not yet re-recorded
- **183** ✅ Click **Approve**
- **184** ✅ Click **Submit**
- **185** ✅ Click the **KYC Verification** tab
- **186** ✅ Click **Close**
- **187** ✅ Click **Finalise Verification Outcomes**
- **188** ⚠️ Click an icon — likely re-opening the next outstanding task from the Inbox
- **189** ⚠️ Click here — likely the workflow action link for the Pre-Onboarding Checklist stage
- **190** ✅ Click the **Years Of Farming Experience** select (confirmed field identity, see Key Difference #3)
- **191** ✅ Click **"Up to 2 Years"**
- **192** ✅ Click the **Business Plan Development Support required?** checkbox (confirmed the only one ticked, see Key Difference #3)
- **193** ✅ Click **Submit** — confirmed this completes the entire application (`Application Status` → `Complete`)
- **194** ✅ Click the **Opportunities** item in the side menu
- **195** ⚠️ Click an icon — likely opening the Opportunity's details/search link to confirm the final status

## Preconditions
- [ ] App is reachable at the Phase 2 URL (`PHASE2_APP_URL`), `TEST_ENV=phase2`
- [ ] Valid RM credentials are present in `.env` (`PHASE2_RM_USERNAME` / `PHASE2_RM_PASSWORD`)
- [ ] The RM has **Inbox** visible in the side menu
- [ ] The Opportunity populated by [../opportunities/opportunity-loan-application-capture.md](../opportunities/opportunity-loan-application-capture.md) has been initiated via **Initiate Loan Application**
- [ ] `test-data/pdf-test.pdf` exists at the hub root (unused directly in this plan's confirmed scope, but a Dev-parity precondition)
- [ ] For a consent-stage regression case (Key Difference #4), a fixture at `Upload Individual Consent` already exists live on Phase 2 (`LA2026/3781`, `LA2026/3742`, both Account `Sanele Xulu`) — usable as-is or as a template for a freshly initiated Online-Digital-Channel PERSONAL application

## Test Cases

### TC-01 — Log in as an RM and open the Inbox; verify the row's Action Required matches its actual stage (BUG-100614 regression check)
- **Type:** Happy path + regression check
- **Steps:**
  - NAVIGATE to `/login`
  - TYPE the Username field with the Phase 2 RM username (from `.env`)
  - TYPE the Password field with the Phase 2 RM password (from `.env`)
  - CLICK **Sign In**
  - WAIT for the app to redirect away from `/login`
  - CLICK the **Inbox** item in the side menu
  - WAIT for the Inbox listing to load
  - EXTRACT the **Action Required** value of a row
  - CLICK that row's workflow action link
  - WAIT for the workflow action page to load
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Inbox heading is displayed (confirm the exact text live — Dev's is **Incoming Items**)
  - [x] ASSERT the URL is the Inbox route (`/dynamic/Shesha.Workflow/workflows-inbox`)
  - [x] ASSERT (BLOCKING) the workflow action page reached matches the Inbox row's **Action Required** value — *this is the direct regression check for DevOps Bug [100614](https://dev.azure.com/boxfusion/LandBankCrm/_workitems/edit/100614) "Inbox tabs do not correspond to workflow steps", which is `Testing` / `Awaiting QA deployment` on this environment*

---

### TC-02 — Initiating the Landbank Branch Opportunity skips straight to a verification-stage Inbox item
- **Type:** Happy path — confirmed
- **Depends on:** TC-01, an Opportunity initiated via [../opportunities/opportunity-loan-application-capture.md](../opportunities/opportunity-loan-application-capture.md)
- **Steps:**
  - CLICK the workflow action link on the top Inbox row for that Opportunity
  - WAIT for the workflow action page to load
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Action Required for this Landbank Branch / upfront-consent application is **not** a consent stage (no Upload Individual Consent / Upload Entity Consent) — **confirmed live**, consistent with the Dev plan's documented rule
  - [x] ASSERT the workflow action page reflects a party status button reading **Awaiting Review**
  - [x] ASSERT (regression control) a **different** application on the same Phase 2 environment, captured via a non-branch channel, **does** show **Upload Individual Consent** as its Action Required — live fixtures `LA2026/3781` / `LA2026/3742` (Account `Sanele Xulu`) confirm this contrast already exists

---

### TC-03 — Decide ID Verification and review KYC Verification for the main applicant
- **Type:** Happy path — ⚠️ KYC decision mechanics still unconfirmed, see Key Difference #2
- **Depends on:** TC-02
- **Steps:** As recorded in steps 180–186 above.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the verification dialog exposes an **ID Verification** tab and a **KYC Verification** tab
  - [x] ASSERT the **ID Review Decision** (or equivalent) accepts `Approve`
  - [x] ASSERT clicking **Submit** on the ID Verification tab saves the decision (confirm whether the dialog stays open, per the Dev plan's documented behaviour, or closes)
  - [x] ASSERT the **KYC Verification** tab is reviewable and **Close** dismisses the dialog
  - [x] ASSERT whether KYC Verification requires its own manual decision on Phase 2, or resolves without one — *unresolved; the recording shows no explicit KYC decision step, and the read-only Opportunity re-read cannot distinguish this*

---

### TC-04 — Finalise Verification Outcomes and complete the Pre-Onboarding Checklist
- **Type:** Happy path — confirmed field identities and end state
- **Depends on:** TC-03
- **Steps:** As recorded in steps 187–193 above.
- **Assertions:**
  - [x] ASSERT (BLOCKING) **Finalise Verification Outcomes** is available once the party's verifications are reviewed
  - [x] ASSERT (BLOCKING) **Years Of Farming Experience** is a select field, and accepts `Up to 2 Years` — *confirmed difference from Dev's numeric field; update Dev's plan if the same change is found there, or note this as Phase-2-only*
  - [x] ASSERT the checklist reproduces the same nine visible fields the Dev plan documents (with matching question text) plus the same hidden tenth conditional (*Support with applying for water rights required?*, gated on *Does this operation require Water Use Rights?*)
  - [x] ASSERT ticking **Business Plan Development Support required?** retains its checked state
  - [x] ASSERT (BLOCKING) **Submit** completes this step **and the entire application** — *confirmed: Application Status became `Complete`, not an intermediate status. Update this assertion if a future run instead lands on `Pre-Onboarding`, which would indicate this step is sometimes not the final one*

---

### TC-05 — Confirm the Opportunity reflects Complete status
- **Type:** Happy path — read-only verification, confirmed
- **Depends on:** TC-04
- **Steps:**
  - CLICK the **Opportunities** item in the side menu
  - WAIT for the Opportunities listing to load
  - NAVIGATE to (or search for) the Opportunity worked in this plan
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Opportunity's Application Status reads **Complete**
  - [x] ASSERT no unresolved Action Required remains in the Inbox for this application — **confirmed**, the Inbox no longer lists it
  - [x] ASSERT the **Pre-Onboarding Checklist** tab on the Opportunity (see the paired Opportunity plan's TC-05) mirrors the values submitted here, read-only

## Test Data Notes
- This plan now covers the Individual / Landbank Branch path **end to end**, confirmed live through to `Complete` —
  it is no longer a partial trace.
- It does **not** re-derive the Dev plan's consent-stage mechanics (electronic vs. manual route) — two ready-made live
  fixtures at `Upload Individual Consent` already exist on Phase 2 (`LA2026/3781`, `LA2026/3742`) if that coverage is
  wanted next, or the ENTITY-specific CIPC verification dialog, or the terminated/timeout paths — see
  [../../dev/workflow/loan-application-workflow-stages.md](../../dev/workflow/loan-application-workflow-stages.md).
- **Remaining open items before this plan is fully executable as a spec:**
  1. Resolve the KYC Verification decision mechanics (Key Difference #2) — is there a manual decision step at all?
  2. Re-record live selectors for steps 179, 182, 188, 189, 195 (structurally understood, not yet selector-mapped)
  3. Regression-verify DevOps Bug [100614](https://dev.azure.com/boxfusion/LandBankCrm/_workitems/edit/100614) via TC-01
- **Next step:** use `/CreateTest` (or a manual Playwright MCP recording pass) against a live Phase 2 workflow action page to resolve the remaining selectors, then author the paired `.spec.ts`.
