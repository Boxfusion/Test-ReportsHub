# Report: Smoke plan 101541 — re-run of the FAILED cases before reporting

**Date:** 2026-08-20 17:15 UTC
**Plan:** test-plans/npo-registration/register-new-npo.md
**Execution Mode:** ai-driven (Playwright MCP, live QA public + admin portals)
**Result:** PARTIAL — 7 of 13 failed cases re-run: **1 now PASSES (TC-12-004)**, 6 confirmed still failing; 6 not yet re-run (setup-bound). Bonus: a REGISTERED NPO (333-022-NPO) now exists, unblocking the TC-10 and TC-13 families
**Duration:** ~1100s
**Cases:** TC-01-009, TC-04-001, TC-07-006, TC-07-010, TC-12-004, TC-14-007, TC-15-003 (plus TC-01-010 and TC-07-013 re-confirmed incidentally)
**Environment:** QA · public portal signed-out **and** signed-in · admin portal

## Why this run
The 13 smoke FAILs were recorded 08-13 → 08-18. Before they are reported externally they were re-verified against
today's build, since three separate claims were retracted earlier today after re-testing.

## Summary
| Case | Recorded | Re-run verdict | Change |
|---|---|---|---|
| **TC-12-004** Investigations list filterable by status | 🔴 FAIL | ✅ **PASS** | **CHANGED — withdraw the failure** |
| TC-01-009 Create User Account screen | 🔴 FAIL | 🔴 FAIL (refined) | confirmed |
| TC-14-007 Public NPO search | 🔴 FAIL | 🔴 FAIL | confirmed |
| TC-15-003 Add + submit an Intervention | 🔴 FAIL | 🔴 FAIL (root cause found) | confirmed, better diagnosed |
| TC-04-001 OB with DHA-verified SA ID | 🔴 FAIL | 🔴 FAIL (2 of 3 assertions pass) | confirmed |
| TC-07-006 OB Compliance dialog | 🔴 FAIL | 🔴 FAIL (1 of 3 assertions passes) | confirmed |
| TC-07-010 Document Verification dialog | 🔴 FAIL | 🔴 FAIL (3 of 4 assertions fail) | confirmed, + no Certificate generated |
| TC-01-010 Create account with SA ID / DHA | ⛔ NOT EXECUTABLE | ⛔ NOT EXECUTABLE | confirmed |

## ✅ TC-12-004 — now PASSES. Withdraw the failure.
Full cycle verified on **CRUDS → Investigation**:
1. Unfiltered list: **1-10 of 164 items**.
2. Filter panel → **Filter by** offers 10 columns, **including `Status`** (`status`).
3. Status value list: **Draft · In Progress · Completed · Cancelled · Suspended**.
4. Applied `Status = In Progress` → **164 → 30 items**, and **every visible row read "In Progress"**.
5. **Clear** → back to **164**.

That satisfies all three assertions (list shown · filter works · clear restores). Either it has been fixed since
08-13, or the original run hit the grid-render fault (see the caution below).

> ⚠️ **Caution that nearly cost me this result.** On first load the grid showed *"1-1 of 1 items"* and I almost
> recorded "only one investigation exists". The **quick-search box had retained `Nomfanelo` from a previous session**
> and my JS-based clear did not reset React state — only clicking the **close-circle** button did, revealing 164.
> **Always clear the quick search via its own control and re-read the count before trusting any grid total.**

## 🔴 TC-01-009 — FAIL confirmed, step by step, with two new findings
Re-run deliberately against the case's own steps (screenshots in `evidence/`):

| Step | Prescribed | Actual |
|---|---|---|
| 1–2 | Sign-In page, signed out | ✅ renders — Email address · Password · Forgot Password · Login · *"Don't have an account?"* Home / Register — `evidence/tc01-009-step2-signin-page.png` |
| 3 | CLICK **"Create user account"** | ❌ **no such control.** Full enumeration of every `a`/`button`/`[role=button]`: Forgot Password · Login · Home · Register · Sign Up **(hidden)**. The phrase "create user account" appears **nowhere** in the page text. |
| 4 | Create User Account screen **(FDS Fig.7)** displayed | ❌ unreachable. *Register* → **"Verify Mobile Number"** (single Mobile Number field) — `evidence/tc01-009-step4-register-route.png`. Hidden *Sign Up* → **"Sign Up"** — `evidence/tc01-009-step5-signup-screen.png`. Neither is Fig.7. |
| 5 | Form carries **Email · ID Number · Password · Confirm Password** | ❌ only **Email** present. **ID Number, Password and Confirm Password are all absent.** |

### Two findings not in the original report
1. **There are two sign-up entry points, and one is hidden.** The login page carries the visible `Register` →
   `dsd-public-portal-send-otp` *and* `Sign Up` → `signUp-public-portal`, the latter present in the DOM with
   `visible: false`. Worth asking which is intended — a hidden route is either dead config or an unfinished cutover.
2. 🔴 **The Sign Up screen has a `Mobile Number` label with no input field.** The form renders **4 labels
   (Mobile Number · First Name · Last Name · Email Address) but only 3 `<input>` elements** — the control under
   *Mobile Number* is missing entirely, and **`Next` is permanently disabled** on that route. Visible in the
   screenshot. So even the hidden sign-up path cannot be completed.

⇒ TC-01-009 **FAILS** on step 3 and step 5, and **TC-01-010 remains NOT EXECUTABLE** (no ID Number field anywhere in
the journey).

## 🔴 TC-14-007 — FAIL confirmed
Signed-out public landing page (`no-auth/.../landing-page`): **zero `<input>` elements**, and the word "search" does
not appear anywhere in the page text. Nav is only *Education and Awareness · Contact Us · FAQs · Login*. There is no
public NPO search to reach, authenticated or not.

📌 **New minor finding on the same page:** two footer links point at a **different environment** —
`https://dsd-npo-publicportal-test.azurewebsites.net/...` for *Contact Us* and *FAQ* — from the QA portal. A
cross-environment link leak.

## 🔴 TC-15-003 — FAIL confirmed, and now root-caused
Save **never enables**, but the reason is more specific than "cannot save":

**1. The mandatory-field set spans 4 tabs.** Section 1 has 6 (Intervention Type, Risk Status, Date Start, Date End,
Province, District); **Section 4 has 9 more** (3 attendance counts, Reporter name/surname/email, Reviewer
name/surname/email). Sections 2 and 3 have no starred fields. All **15** were filled with real interactions —
**Save stayed disabled.**

**2. 🔑 The District reference list is effectively unseeded — this alone blocks the case.** District is **mandatory**,
and the `District` entity holds **only 2 rows in the entire system**:

| Name | Parent area |
|---|---|
| Ugu | KwaZulu-Natal |
| uThungulu | **(none)** |

South Africa has 52 districts/metros. So for **8 of the 9 provinces** the District dropdown returns **"No data"** and
the form can never be completed. Selecting **KwaZulu-Natal** does yield one option (`Ugu`) — so the cascade itself
works; the data behind it does not. And `uThungulu` has **no parent province at all**, so it is unreachable from any
province.

⚠️ **Honest limit on this one:** after filling Sections 1 and 4 I also ticked one Section-2 checkbox and populated
Section 3, but **Section 3 was filled with synthetic events**, which this build is known to ignore
(`shesha-forms-use-real-clicks`). So I cannot fully exclude an additional Section-2/3 gate. What is certain: **15/15
starred fields satisfied and Save disabled**, and the District data gap is real and independently blocking.

## 🔴 TC-04-001 — FAIL confirmed, but **2 of its 3 assertions PASS**
Re-run step by step on draft **APPL26-01522** (screenshots in `evidence/`). Per-assertion:

| # | Assertion | Result |
|---|---|---|
| 1 | Add Office Bearer form opens | ✅ **PASS** |
| 3 | The DHA call returned 2xx | ✅ **PASS** — `POST /api/services/dsdnpo/IdentificationVerificationActions/IdentityVerification` → **200** (captured on the wire) |
| 2 | **(BLOCKING)** OB listed with status **`ID Verified`** | 🔴 **FAIL** |

The blocking assertion fails comprehensively:
- the grid has **16 columns, ending at `Position`**, and **none is a status column** (Full Name · Nationality ·
  SAIDNumber · Passport Number · Passport Expiry Date · Date Of Birth · Gender · Has Disability · Type Of Disability ·
  Residential Address · Work Address · Mobile Number · Home Number · Whatsapp Number · Email Address · Position) —
  verified with the grid **scrolled fully right**, see `evidence/tc04-001-step9-no-status-column.png`;
- the exact string **`ID Verified` appears nowhere**;
- a regex sweep for **any** `verif…` text on the page returns **nothing** — so there isn't even a near-match to argue
  about (the case's 📌 note asks specifically about near-matches).

### 🔑 The nuance that changes who owns this
**The integration works.** The lookup fires, returns 200, and correctly derives name, date of birth and gender. What is
absent is only the **status display** — and critically, the **DHA response contains no verification flag of any kind**
for the UI to derive `ID Verified` from. Its payload is a `personProfile` (`personIdentityProfile`,
`personNameSurname`, `personBirthDate`, `personLivingIndicator`, `upid`, `dhA_Transaction`) with no verified/status
field.

⇒ This is a **spec-vs-build gap, not a broken integration.** Worth asking Thabiso whether the prescribed `ID Verified`
status is derivable at all from what the DHA integration returns, rather than raising it as a dev defect.

### 📌 Upgrades the POPIA finding
This run **confirms the identity lookup is a live Home Affairs integration on QA, not a stub**, and names the endpoint
(`IdentificationVerificationActions/IdentityVerification`). That materially strengthens
`bugs/2026-08-20-id-number-lookup-returns-real-identities-masking-is-cosmetic.md`. **No identity values transcribed**,
per [[never-record-real-personal-identifiers]].

## 🔴 TC-07-006 — FAIL confirmed (1 of 3 assertions passes)
Built a **fresh application APPL26-01522** for this (3 office bearers, submitted 2026-08-20 ~17:56), then opened it at
**Doc Verification** → **OB Compliance**. Screenshot: `evidence/tc07-006-ob-compliance-dialog.png`.

| # | Assertion | Result |
|---|---|---|
| 1 | **(BLOCKING)** dialog lists **every OB** | 🔴 **FAIL** — **zero** OB rows, **zero** OB names rendered in the dialog |
| 2 | all three checks offered per OB — **UN Sanctions · Dept of Justice · Child Protection DB** | 🔴 **FAIL** — **none of the three strings appears** anywhere in the dialog |
| 3 | status advances after submit | ✅ **PASS** — `applicationStatus` **2 → 9**, `areOfficeBearerCompliant: true`, and **Verification** unlocked |

What the dialog actually is: a single **"Are all office bearers compliant? Yes / No"**, plus a *"Select office bearers
which are not compliant"* picker and a *"Reason for non-compliance"* box. So compliance is captured as **one
all-or-nothing attestation with an exception list**, not per-OB verification against three named databases.

⇒ Same verdict as recorded on 08-14, now with the dialog's full text quoted. **The open question in the plan still
stands and is the real blocker to verdicting this properly:** are those three checks meant to be *manual attestations*
or *live integrations*? Right now neither is present in any form.

## 🔴 TC-07-010 — FAIL confirmed (3 of 4 assertions fail)
Same application, **Verification** button. Screenshot: `evidence/tc07-010-doc-verification-dialog.png`.

| # | Assertion | Result |
|---|---|---|
| 1 | **(BLOCKING)** every uploaded document listed with **Yes/No + Reason** | 🔴 **FAIL** — **no documents are listed at all**; "Constitution" and `.pdf` appear nowhere in the dialog |
| 2 | status string exactly **`Successful Document Verification`** | 🔴 **FAIL** — the application displays **`APPLICATION SUCCESSFUL`**; `applicationStatus` 9 → **6** |
| 3 | **Certificate + Constitution + OB list** generated | 🔴 **FAIL** — `certificateOfRegistrationFile` **false**, `letterOfRegistration` **false**; the Constitution pre-existed from registration rather than being generated here; **no OB-list artefact found** |
| 4 | chairperson notification carries the attachments | ⚠️ **PARTIAL** — **"Email Registration Application Successful" → status 1 (Sent)** at 18:01:04. The paired **SMS → status 8 (Failed)**, consistent with the known Vodacom-credit issue. **Attachments not verified** (and the Certificate does not exist to attach). |

What the dialog actually is: **three fixed questions about organisation attributes** — *Name of the organisation
verified? · Organisation services verified? · The financial year end verified?* — each with Yes/No and a comment box,
plus the refuse/reject question and the read-only *Are OBs Compliant?*. It verifies **attributes, not documents**,
which is a different thing from what ADO #101720 prescribes.

📌 **Assertion 3 is the substantive one to report.** Even though the approval succeeds and the NPO is registered, **no
registration Certificate is produced** — worth raising on its own, independently of the dialog-shape mismatch.

### ✅ Valuable side-effect: we now own a REGISTERED NPO
Driving the approve path to completion worked end to end:

- `applicationStatus` 9 → **6**, displayed **APPLICATION SUCCESSFUL**
- **NPO 333-022-NPO** — *Nomfanelo QA Unfinished NPO 2026-08-20*, `1b217af3-07df-41ec-bbbf-c5d06b6b2055`,
  **OrgStatus 4 (Registered)**, `dateRegistered` 2026-08-20T18:01:01
- This also **re-confirms TC-07-013** (approval issues the NPO Registration Number), which passed on 08-18.

▶ **This unblocks several previously-blocked cases** that needed "a registered NPO we own": **TC-10-001/002/006/007**
(post-registration change request) and **TC-13-002/005/007** (voluntary deregistration) — and it is a cleaner candidate
than 333-019, which still carries a stuck In-Progress deregistration. Worth using it before it changes state.

📌 **Observation:** the inbox quick search returned **0 items** for `APPL26-01522` but found the task when searched by
NPO name — while `APPL26-01494` searched fine by ref earlier the same day. Possibly indexing lag; recorded as an
observation, not asserted as a defect.

## ⏳ Not yet re-run — 6 cases, all setup-bound
| Case | What it needs |
|---|---|
| TC-05-029 (+ TC-05-028) | A fresh draft driven to the data-loss assertion |
| TC-08-007, TC-08-011 | An annual reporting period — **nothing in the product creates one** (`dsd-npo-annual-report-precondition`), so these are likely still blocked rather than failing. **Now worth retrying against the new registered NPO 333-022-NPO** |
| TC-10-006 | A change request in the right state |
| TC-13-005 | The deregistration wizard on a compliant NPO — **use the new 333-022-NPO**, which is clean (333-019 carries a stuck In-Progress dereg) |
| TC-14W-001 | A keyboard-only pass over the wizard |

**Recommendation for tomorrow:** report TC-12-004 as **fixed/withdrawn**, report the 4 confirmed FAILs with the
refinements above, and mark the remaining 8 as *"failure recorded 08-13→08-18, not re-verified today"* rather than
presenting them as current. The two TC-08 cases in particular are probably **blocked, not failed**.

## Evidence
- `evidence/tc01-009-step2-signin-page.png` — Sign-In page, no "Create user account" control
- `evidence/tc01-009-step4-register-route.png` — Register → "Verify Mobile Number"
- `evidence/tc01-009-step5-signup-screen.png` — hidden Sign Up screen; note the **Mobile Number label with no input**
- *(screenshot withheld — POPIA, see `audits/2026-08-21-evidence-popia-sweep.md`)* — Office Bearer tab, grid at left edge
- `evidence/tc04-001-step9-no-status-column.png` — grid scrolled fully right: last column is **Position**, no status column

All other assertions are DOM/API reads quoted inline.
