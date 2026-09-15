# DSD-NPO — Skipped & Blocked Register (functional plan 101543, against the full 314)

> Purpose: the functional plan has **314 cases**. This register keeps the full 314 as the denominator and accounts for
> every case that has **not** been executed as a genuine black-box verdict — each with a reason. It complements the
> per-suite run reports and the coverage script (`scripts/verify-coverage.js`).
> **Last updated:** 2026-08-28.

> ### ✅ 2026-08-28 — TWO BLOCKERS RETIRED, BOTH STALE. Coverage **212 → 214 / 314 (68.2%)**, blocked **57 → 55**.
> Neither case needed anything from the environment; both had been excluded on assumptions that had already expired.
> | Case | ADO | Was | Now | Why the old reason was wrong |
> |---|---|---|---|---|
> | TC-14-009 | #101821 | ⚪ NOT EXECUTED (08-25) | ✅ **PASSED** | Never blocked — only *unreached*. The 08-25 report itself said *"Cheap; it simply was not reached."* |
> | TC-14C-005 | #107430 | ⛔ BLOCKED — "needs a read-only role account" (08-25) | 🔴 **FAILED** | The obstacle was never our accounts. The **"Read only" role does not exist**: 46 roles, no match, verified with a working search as control. Step 1's *"Role seed present"* is simply false. |
> Report: `2026-08-28/14c-session-access-control-functional--edit-block-and-missing-readonly-role.md`.
> ⚠️ **Narrow the old 14Z claim.** The 08-25 note that this missing role *"blocks ~10 cases in suite 14Z (Class B)"*
> is wrong: 14Z Class B needs **ordinary unprivileged** users (Accounts A and B), not a "Read only" role. Those
> cases stay blocked for their own reasons — missing endpoints, unsafe mutations, one sensitive case.
> 🔑 **Lesson, now three times over:** a blocker recorded before a precondition changed is not evidence. Re-read the
> stated reason against today's environment before trusting any ⛔ in this register.

> ### ✅ 2026-08-28 (later) — SUITE 14U: its blocker was **factually wrong**. Coverage **214 → 215 / 314 (68.5%)**, blocked **55 → 54**.
> The 08-25 reason was *"there is no route to read an audit entry from"*. There is — `EntityHistory/GetAuditTrail`
> answers **200** for any entity given `entityId` + `entityTypeFullName`. The **audit store is populated and
> attributed**; only `entity-change-audit-log` is broken, and it is broken because it sends **both parameters empty**.
> | Case | ADO | Was | Now |
> |---|---|---|---|
> | TC-14U-004 | #107427 | ⛔ BLOCKED | ⚠️ **PARTIAL** — state transition carries before/after + actor ✅; file upload entry carries **no hash** ❌ |
> | TC-14U-003 | #107426 | ⛔ BLOCKED ("no route to read audit") | ⚪ **UNBLOCKED, not yet run** — needs the OB→application filter property; entity type is `boxfusion.dsdnpo.Domain.OfficeBearers.NpoOfficeBearer` |
> | TC-14-003 | #101815 | — | 🔴 already **FAILED 08-25**; re-verified, **adds no coverage** |
> Report: `2026-08-28/14u-audit-trail-functional--store-is-readable-screen-is-not.md`.
> ⚠️ **I re-ran TC-14-003 believing it was blocked — it was not.** I read *"⛔ blocked"* from the **plan's** coverage
> table instead of the report. **Third instance this month** (after TC-14T-011 and 14S). The plan table now carries
> an explicit warning that it is not a verdict source.
> 🔑 **"The screen that shows X is broken" ≠ "X cannot be observed."** Check whether the data is reachable another
> way before recording a case blocked on a broken view.

> ### 🔄 2026-08-28 (later) — BLOCKER RE-SWEEP: 4 of 5 blocker descriptions were OUT OF DATE. Coverage unchanged at **215 / 314**.
> Ten cases re-examined across three clusters. **None became runnable**, but the reasons recorded against them were
> mostly wrong. Report: `2026-08-28/12-15b-15e2e-blocker-resweep--intake-rebuilt-two-blockers-moved.md`.
>
> **Investigations — TC-12-005 / 007 / 008 / 010 / TC-12P-004.** ⚠️ The 08-18 reason
> *"public intake broken, submit is a silent no-op, the whistleblowing channel is down"* is **SUPERSEDED — do not
> quote it.** The intake has been **rebuilt**: a dedicated **Whistleblowing** entry point opens
> `boxfusion.dsdnpo/create-investigation-workflow` v14 and **mints a case reference on entry**
> (`INV1694/28/08/2026` created during this check). Anonymity logic works.
> 🔑 **New blocker:** `Npo Number*` is mandatory and resolves **only against the registered NPO register**.
> `NpoQa` → 0, `Test` → 0; our own NPO has no number yet. Submitting therefore means **naming a real registered
> organisation in a misconduct allegation**, which QA should not do unilaterally. **Needs a seeded synthetic NPO —
> question for Thabiso.**
>
> **Interventions — TC-15E2E-002.** ⚠️ The 08-20 reason *"District list empty"* is **PARTLY FIXED**. `Dsd.District`
> still holds only **2** rows, but `Ugu` is now linked to **KwaZulu-Natal**, and the UI cascade populates for that
> one province (0 for the other 8). **New blocker:** with all **15** starred fields satisfied across all four
> sections, **Save stays disabled** with no error, no `aria-invalid`, no explain text — an instance of the standing
> *unstarred mandatory field* defect.
>
> **Content lifecycle — TC-15B-007 / 009 / 010, TC-15E2E-001.** ⛔ **UNCHANGED, third reproduction.** The library
> **Add File** upload is `ant-upload-disabled` with `input[type=file] disabled`. 🔑 New detail: it is **not** gated
> on the other fields — filling Name does not unlock it. `bugs/2026-08-18-library-add-file-upload-disabled.md`
> remains open.
>
> 🔑 **The headline for this register: blocker text decays fast on this build. Four of five descriptions had moved
> in 8–10 days.** Re-read a ⛔ against the live environment before quoting it in a report or using it to scope work.

> ### 🔴 2026-08-28 (later still) — TC-14Z-018 / 019 run with EXISTING files. Coverage **215 → 217 / 314 (69.1%)**, blocked 54 → 53.
> Prompted by *"what can we action using existing items?"* The 08-25 blocker was *"A owns no uploaded file, so the
> A-owned resource does not exist."* **Dissolved by flipping the test:** APPL26-01570 (Account B) already owns **3**
> files, so use B's existing files as the target and **A** (then anonymous) as the caller.
> 🔴 **Both FAILED — StoredFile has no access guard.** `StoredFile/Download?id=` returns the full PDF to unrelated
> Account A **and to an anonymous caller with no token**; `StoredFile/FilesList?ownerId=` enumerates B's documents
> for A. Zero-GUID control errors, so the 200s are genuine retrievals. Evidence appended to
> `bugs/2026-08-18-api-reachable-without-authentication.md` (Update 2026-08-28); report
> `2026-08-28/14z-security-functional--storedfile-guard-018-019.md`.
> ⚠️ **Verbatim ADO steps not quotable** (14Z not in the 9 committed raw pulls; `ado` MCP down) — verdicted against
> the plan's *guard* intent; Thabiso to confirm the 018/019 enumeration-vs-retrieval split. Only our own synthetic
> Account-B files were touched; sizes only, no content read.
> 🔑 **The method generalises:** a "needs a B-owned resource" blocker is runnable the moment *any* record we already
> hold can play the B role. Check existing records before calling such a case blocked.

> ### ✅ 2026-08-28 (final sitting) — TC-14U-003 closed with existing OBs. Coverage **217 → 218 / 314 (69.4%)**, blocked 53 → 52.
> **TC-14U-003 (#107426) FAILED** — office-bearer **self-confirmation is never audited**. Ryno Koen
> (`…eba499877cad`, an OB we already hold, `isVerified = true`) carries **only a `Created` audit entry** — no
> SelfConfirm, no Update. Application updates *are* audited (with diffs), office-bearer updates are not. Verdicted
> entirely from **reads on existing records**, no mutation. Report `2026-08-28/14u-audit-trail-functional--ob-crud-tc14u003.md`.
>
> ### ⛔ TC-06-005 / TC-06-006 — checked, and NOT closable with existing items
> Status **13 (OB Partially Confirm)** and **16 (OB Confirmed)** each need a *live* application in that state.
> Re-measured today: **0 applications at status 13, 0 at status 16** across the whole register (unchanged from
> 08-25), and legacy NPOs carry no confirm-workflow audit transition to read. 333-018 (one OB confirmed of three)
> went to status **7 (Failed)**, not 13. Verdicting these requires **driving a fresh OB self-confirmation cycle**
> (partial → 13, all → 16) via the email-link mechanism — a create-new-state task, **not** reuse of existing
> records. Stays as the 08-25 disposition. **Needs a live cycle, or route to Thabiso to confirm 13/16 ever fire.**

> ### ✅ 2026-08-27 (later) — **THE FUNCTIONAL PLAN IS NOW FULLY IMPORTED: 36 of 36 suites.**
> Suite **14S (101905)** was pulled and authored as `test-plans/cross-cutting/14s-public-npo-search-functional.md`.
> Raw ADO pull committed at `test-data/ado-functional-101543/ado-suite-101905.json` — **no further ADO sign-in needed**.
> **All 3 cases are dispositioned, none yields a verdict** (as predicted — coverage stayed 212/314):
> | Case | ADO | Disposition |
> |---|---|---|
> | TC-14-008 | #101820 | ⛔ public NPO search **does not exist** — 3rd confirmation (08-13, 08-20, 08-27 signed-out: 0 `<input>`) |
> | TC-14-011 | #101823 | 🚫 partner API `POST /api/npo/verify`, no UI path, **no API key held** → dev/security |
> | TC-14-012 | #101824 | 🚫 two `[AbpAllowAnonymous]` endpoints → security. **200 is intended**; the real assertion is *no PII* |
> 📌 TC-14-008 has a **second** unmet precondition: `Cancelled` (status 7) has **0 records** across 104 000+ orgs.
> Report: `2026-08-27/14s-public-npo-search-functional--imported-and-dispositioned.md`.
>
> ⛔ **Every functional case now has a recorded disposition. There is nothing left to import.**

> ### ⬜ 2026-08-27 — IMPORT RECONCILIATION (superseded above): 35 of 36 functional suites imported.
> **`14S — Public NPO Search & Anonymous Endpoints`, ADO suite `101905`, 3 cases — never imported.** Only the
> **smoke** counterpart exists (`test-plans/cross-cutting/14s-public-npo-search.md`, suite 101880, 1 case), and it
> carries the note *"Not in this plan (Functional suite 101905, 3 cases, **to import later**)"* — which never happened.
> ⚠️ **CORRECTION — do NOT expect this to be runnable.** An earlier note here said "readily runnable, expect 3 cheap
> cases", quoting the smoke plan's *"✅ Runnable today"* **reachability** line. That line was written **before
> execution**. The smoke case itself — **TC-14-007 (#101819)** — has **FAILED twice**:
> `2026-08-13` *"no public search exists"*, retested and **confirmed FAIL** on `2026-08-20` — the signed-out public
> landing page has **zero `<input>` elements** and the word "search" does not appear.
> 🔑 So the headline 14S behaviour is **absent from the build**, and its functional cases will most likely record as
> *not executable — case does not match the build* (same disposition as TC-01-011/012) rather than adding coverage.
> ⚠️ I do **not** know what the other 2 of the 3 cases assert — suite `101905`'s contents have never been pulled.
> Some may be anonymous-**endpoint** checks, which would be 🚫 out of black-box remit like TC-15Y-002.
> **Import it for traceability, not for coverage.**
> ⚠️ Importing needs the ADO case text, which needs an **interactive ADO sign-in** (the `ado` MCP times out) — see
> `test-data/ado-functional-101543/README.md` for the working REST recipe.
>
> **Everything else reconciles.** Every apparent per-suite shortfall is deliberate and documented, not a dropped case:
> | Suite | Cases with no case-entry | Why — verified in the plan text |
> |---|---|---|
> | 05 | 8 | TC-05-002/026/027/028/029 **smoke-owned**; TC-05-014/024/025 are **`State: Closed` in ADO** |
> | 03 | 4 | TC-03-001/005 **smoke-owned**; TC-03-031/032 sit in both suites, **executed by smoke 2026-08-13** |
> | 04 | 3 | TC-04-001/008/023 **smoke-owned** |
> | 15Y | 3 | TC-15Y-001/002/003 **🚫 out of black-box remit** — transport headers, swagger/API, server logs |
> | 08 · 14Z | 19 · 32 | **Not missing** — these two plans declare cases in tables/classes rather than `###` headings. Both suites have been run. |
> 🔑 So the 314 denominator includes ~18 smoke-owned/ADO-closed/out-of-remit items that are correctly *not* functional
> cases. Do not treat them as coverage debt.

> ### 2026-08-27, second sitting — two more left this register, both "blocked" for reasons that were wrong
> `TC-07-008` (PARTIAL) and `TC-01-022` (PARTIAL) are now executed. **Neither needed what it claimed to need.**
> TC-07-008 only needed an application at the OB Compliance step — we had submitted one ourselves an hour earlier.
> TC-01-022 was marked *"requires developer DB access"*, but **account deletion is available in the admin UI**
> (User Management, per-row delete icon), so four of its five steps ran black-box; only the
> `Core_OrganisationPersons` query still needs DB access.
> 🔑 Lesson worth keeping: **two of the last seven "blocked" cases were blocked by a stale assumption, not by the
> build.** Re-read the precondition before trusting the ⛔.
> Coverage now **212 / 314 = 67.5%**.

> ### 2026-08-27 — five cases left this register
> `TC-02-008` (PARTIAL), `TC-04-019` (FAILED), `TC-14W-006` (FAILED), `TC-14W-007` (PASSED) and `TC-07-020` (FAILED)
> are now executed. Two of the unblockers were **accounts we self-served on 08-26**, not code changes:
> Account B (unlinked applicant) made TC-02-008 runnable, and Account D (`Dsd.Npo.Registry Clerk` only) made
> TC-07-020 runnable. `TC-01-011` / `TC-01-012` stay here but are now **proven** rather than assumed.
> 🔑 Run `scripts/coverage-baseline.js`, not `verify-coverage.js`, for the number — **210 / 314 = 66.9%**.

## Status legend
| Status | Meaning |
|---|---|
| ✅ **Executed** | Driven through the UI; genuine pass / fail / partial verdict. |
| 🚫 **Excluded** | Outside black-box QA remit — API / code / infrastructure / security-internals. Belongs to dev, security or DevOps. |
| ⛔ **Blocked** | Ours to test, but unreachable now — no UI route, missing capability, OTP/mailbox, or third-party/real data. |
| ⏸ **Deferred** | Reachable, but needs manufactured setup or a case rewrite first. |
| ⬜ **Not imported** | Not yet pulled from ADO. |

## Coverage against the full 314
| Bucket | Count | Notes |
|---|---|---|
| ✅ Executed | ~91 | genuine black-box verdicts (pass / fail / partial) |
| 🚫 Excluded | ~45 | out of remit — Suite 14Z (32) + the API/infra/dev-DB cases in 01/04/07/08 |
| ⛔ Blocked | ~24 | no route (appeals), OTP/mailbox, third-party records, build mismatch |
| ⏸ Deferred | ~6 | need setup (another submitted app, a fresh reporting period) |
| ⬜ Not yet imported | ~148 | 24 suites not yet pulled from ADO |
| **Total** | **314** | |

⚠️ The coverage script currently reports **109 executed of 166 imported** because it counts blocked/deferred/assessed
verdicts (e.g. "not executable", "deferred") as "executed". Roughly **18** of those 109 are really skipped/blocked
items listed here, so the genuine black-box figure is ~91. This register is the authoritative "why not run" list;
the script number is the raw tally.

---

## ⛔ Skipped / blocked — grouped by reason

### R1 · 🚫 EXCLUDED — out of black-box scope: API / code / infrastructure (dev, security or DevOps must verify)
These have no UI to drive; they are repository, deployment, or direct-API facts. See `test-reports/` security reports
and the scope-exceptions artifact.
| Cases | Reason |
|---|---|
| **Suite 14Z — all 32** (TC-14Z-001…032) | Code-review security register (`Src:Code`). Secrets in appsettings/IaC/keystore, IDOR/BOLA, OTP internals, CORS, CPR exposure. 7 client-observable ones were probed read-only (003/004/005 confirmed defects); the other 25 need source access, role-scoped users, or fault-injection. |
| TC-01-021 | OTP-stress endpoint security — API; needs a non-admin user to verdict the gate (confirmed unauthenticated in the API bug). |
| ~~TC-01-022~~ | ✅ **RESOLVED 2026-08-27 — mostly runnable, now PARTIAL.** The "developer database delete" was wrong: **User Management has a per-row delete icon**, so steps 1–4 ran black-box. Blocking assertion PASSES; re-registration on the same email + mobile is silently allowed (FAIL). **Only step 5** (`Core_OrganisationPersons` table read) still needs DB access. Report: `2026-08-27/01-authentication-account-creation-functional--re-register-after-deletion.md`. |
| TC-01-014 | Requires DHA forced to a 5xx error (fault injection). |
| TC-04-006 | Requires the DHA service forced down. |
| TC-04-009 | Requires the CIPC service forced down. |
| TC-04-017 | Two app instances + a background job triggered on both — developer check. |
| TC-04-020 (step 2) | Explicit `POST` to the API with an out-of-range value (step 1 is UI and was run). |
| ~~TC-07-020~~ | ✅ **RESOLVED 2026-08-27 — no longer blocked, and now verdicted FAILED.** Account D (`Dsd.Npo.Registry Clerk` only, self-served 08-26) is exactly the role-scoped non-admin this case needed. It reads all 10 349 applications by direct URL with **no 403**. Report: `2026-08-27/07-triage-ob-compliance-doc-verification-functional--non-admin-admin-view-access.md`; bug: `bugs/2026-08-27-registry-clerk-reads-entire-applications-register-by-direct-url.md`. |
| TC-07-021 | `BackfillDocuments` — direct admin API POST. |
| TC-07-022 | Bulk reallocation via Excel upload — admin API endpoint. |
| TC-08-019 | `BackfillDocuments` regenerates letters — API POST. |
| TC-08-020 | `ResendAnnualComplianceLetters` — API POST. |

### R2 · ⛔ BLOCKED — needs system-clock control (time-based triggers)
| Cases | Reason |
|---|---|
| TC-08-001, TC-08-002, TC-08-003, TC-08-004 | Annual-compliance reminder/timer cases (`NineMonthsAfterFYE`, `ThirtyDaysAfterIncomplete`) — require controlling the system clock on QA. |

### R3 · ⛔ BLOCKED — no UI route / missing product capability (legitimately ours, but unreachable)
| Cases | Reason |
|---|---|
| **Suite 11 — all** (functional TC-11-002/003/004/006/009/010/011/013/014/015/016; smoke TC-11-008/012) | ⚠️ **Corrected AGAIN 2026-08-20 (late) — the button is NOT status-gated:** on `portal-appeals-table` **Initiate Appeal is always present and enabled**, and clicking it creates a REAL but **orphan** appeal (no NPO bound, Nature-of-Appeal radios disabled, Submit permanently disabled, and the table lists "0 items found" so it is invisible/undeletable); the one-active-appeal rule is not enforced (2 created 2 min apart). **We are user 15918 and every appeal we have ever created has `npo:null`; every NPO-bound appeal belongs to dev user 3230.** Also: **an unfinished registration is OrgStatus 1, never 9** — "unregistered" means 9 Not Registered, a refusal outcome. See `bugs/2026-08-20-initiate-appeal-is-ungated-and-creates-invisible-orphan-appeals.md`. 🔑🔑 **ROOT CAUSE (2026-08-20, later):** `GET /api/services/dsdnpo/AppealActions/GetAppealInitialData?appealId=` returns **HTTP 500 "No Appeal or NPO found"** for our appeals; **control test** on dev-bound appeals returns **200** with `{npoId, organisationStatus:9, failedApplication}`. That call binds the NPO and drives Nature-of-Appeal, and only succeeds for OrgStatus **7/9** ⇒ **the gate is enforced server-side as an unhandled 500 AFTER the record is created**. Our refused NPO has a valid `failedApplication` but sits at OrgStatus 3, so **it cannot be appealed** — confirmed by direct attempt with it set as active org, and its public profile has no Appeals section at all. ⚠️ **Earlier note (partly superseded):** the create route DOES exist — public portal **profile dropdown → Organisations → the NPO → "Initiate Appeal"** (form `npo-appeal-application`); 26 appeals already exist. **The real blocker is status-gating:** the Appeal button only appears when the NPO is **Cancelled (OrgStatus 7)** or **Not Registered (9)**. We hold none — our refused apps sit at **Application Failed (3)**, which does not qualify, and there is **no direct admin "Cancel NPO" action** (npo-details-view2 offers only "Invite to Organisation"). Cancellation (7) is an **Investigation/compliance outcome** — blocked (suite 12: intake broken, admin lifecycle unreachable); "Not Registered" (9) is a registration-decision outcome we've never produced. ⚠️ **Voluntary Deregistration yields Deregistered (6), NOT Cancelled (7)** — so it can't feed the appeal. Tribunal/chairperson steps also need role-scoped logins we don't have. **Unblocker: an NPO seeded at OrgStatus 7 or 9 (+ chairperson/tribunal users).** ✅ **Confirmed end-to-end 2026-08-20 (late):** a purpose-built application (APPL26-01494) was registered, submitted and rejected at Document Verification — it lands on **Application Failed (3)**, appeal action correctly hidden. Every route to 7/9 is now ruled out by test, not assumption. See `bugs/2026-08-20-rejected-application-has-no-appeal-route.md`. 🔑 **AND the route is `Decline`, not cancel (2026-08-20 late):** all 3 status-9 NPOs came from applications carrying a `documentVerificationDeclineComment`; 8/8 ever-declined applications also have an `incompletenessLetterFile`, so **Decline sits after the Letter of Incompleteness** — which does not exist in this build, hence Decline never enables. **Cancellation (7) has NEVER been set on any of 62 543+ NPOs and has no UI action even on an NPO flagged `canBeCancelled = true`.** ▶ **Cheapest unblocker: link us to one of the 3 existing status-9 NPOs** (they belong to other users; an appeal is raised by the NPO's own portal user) — zero code change. See `bugs/2026-08-20-no-way-to-cancel-an-npo-and-decline-is-the-real-appeal-route.md`. |
| TC-07-015 | Submitter edit-mode on resubmission — unreachable because **no "Application Incomplete" state exists** (a first reject denies outright; see the 2026-08-18 doc-verification bug). |
| TC-10-005 | Cancel an **assigned** change request — needs an admin to assign it first; and cancel is broken even unassigned (bug filed). |
| TC-10-010, TC-10-011 | Admin Accept/Decline of a change request — need a **submitted, typed** change request in the queue; the only one is an empty auto-draft that can't be completed. |

### R4 · ⛔ BLOCKED — case does not match the build (needs a case rewrite)
| Cases | Reason |
|---|---|
| TC-01-011, TC-01-012, TC-01-013, TC-01-015, TC-01-016 | Describe a *Create User Account* screen with SA-ID + password fields. The build uses a **mobile-OTP sign-up** with no SA-ID and no password — those controls don't exist. Needs the cases rewritten (Thabiso). Mirrors smoke TC-01-010. |
| TC-01-011, TC-01-012 — **now proven, 2026-08-27** | These two were walked properly and confirmed *not executable*, so they no longer rest on the 08-13 inventory alone. Evidence is the **form definitions**, not just the rendered screens: `signUp-public-portal` (31 818 chars) and `dsd-public-portal-send-otp` (24 378 chars) declare six data properties between them — `mobileNumber`, `firstName`, `lastName`, `emailAddress`, `password`, `passwordConfirmation` — and **zero** matches for `idNumber\|identityNumber\|saId\|passport\|nationalId`. There is no hidden, conditional or role-gated ID capture. ⚠️ **Correction to the row above: a password step DOES exist** (step 3b, found 08-26) — only the SA-ID half of that reason still holds. Report: `2026-08-27/01-authentication-account-creation-functional--sa-id-field-absent-confirmed.md`. |

### R5 · ⛔ BLOCKED — OTP delivery / a readable mailbox
| Cases | Reason |
|---|---|
| TC-01-017, TC-01-018 | Need a completed account creation via OTP; SMS delivery is dead (QA Vodacom out of credit) and all held numbers are taken. |
| **Suite 06 — all 6** (TC-06-003…008) | OB self-confirmation is a tokenised email-link flow; needs an OB mailbox we can read for the link, and the confirmation-recording bug (2026-08-13) blocks the status-transition cases regardless. Assessed, not imported. |

### R6 · ⛔ BLOCKED — needs third-party / seeded records we don't own
| Cases | Reason |
|---|---|
| TC-02-003, TC-02-004, TC-02-005 | The linking security-questions branch only triggers for an NPO the user **neither owns nor is linked to**, with mismatched legacy details — we have no such record (ours short-circuit to "already Primary Contact"). |
| TC-04-010 (partial), TC-03-014 | Need a **real registered CIPC number** to exercise the enterprise lookup's primary assertion. |

### R7 · ⏸ DEFERRED — reachable but needs manufactured setup
| Cases | Reason |
|---|---|
| ~~TC-07-008~~ | ✅ **RESOLVED 2026-08-27 — run in full, verdict PARTIAL.** Ran against **APPL26-01570**, which we submitted ourselves the same morning, so APPL26-01270 was left intact. `applicationStatus` = **10** confirmed; **no resubmission notification created** (validated against the notification store, with controls). Report: `2026-08-27/07-triage-ob-compliance-doc-verification-functional--all-obs-non-compliant.md`. |
| TC-08-005 | Request-Extension in the due-but-not-initiated state — needs a fresh reporting period. |

---

## ⬜ Not yet imported (~148 cases across 24 suites)
These simply haven't been pulled from ADO yet — the remaining runway toward the full 314. Many are black-box UI
suites (E&A 15-series, deregistration, investigations, accessibility); some overlap R1–R6 reasons above.

| Suite | n | Likely disposition |
|---|---|---|
| 09 Annual Compliance backend/QA | 3 | admin UI |
| 12A / 12P Investigations (admin / public) | 6 / 4 | admin + public UI. **Run 2026-08-18: public intake BROKEN (2 fail, regression); admin lifecycle blocked by it; TC-04 no upload control; anonymity flag now present ✅** |
| 13A / 13P Voluntary Deregistration (admin / submitter) | 4 / 3 | UI — runnable on our registered NPO |
| 14C Session / read-only / access control | 5 | mixed (some need role-scoped users) |
| 14D Document / PDF (QR, cache) | 4 | UI + generated-PDF checks. **Run 2026-08-18: /verify route 404 → no QR-verify flow (FAIL); QR absence corroborated; cert-visual/PDF-A deferred (couldn't source a registered NPO cert)** |
| 14N Notifications & delivery | 3 | needs mailbox/NotificationMessage |
| 14R Integration retries (DHA/CIPC) | 2 | R1 — fault injection |
| 14S Public search / anon endpoints | 3 | R1 — API/anon |
| 14T Notification template content | 22 | needs delivered notifications |
| 14U Audit trail & resubmission diff | 4 | blocked — no audit trail exists (bug) |
| 14X Concurrency & race conditions | 8 | R1 — developer/perf |
| 14W Accessibility & WCAG | 10 | UI — fully runnable |
| 14Y POPIA (transport + logging) | 6 | R1 — mostly infra |
| 15D/15A/15B/15C/15E/15E2E/15W/15Y Education & Awareness | 6/8/10/4/6/2/4/4 | public + admin UI. **15E ✅ run (2 pass,1+note,1 partial,2 fail).** **15B ✅ run (create PASS; content upload DISABLED — blocker).** **15A ✅ run (index/form/discard PASS; District list empty blocks create).** **15C ✅ run 2026-08-18 (dashboard+drill-down PASS; no time/library filter; no Likes metric)** |
| 06 OB Self-Confirmation | 6 | R5 (assessed, skipped) |

---

## How to read this with the run reports
- A case in **R1–R6** should be reported to Thabiso as **skipped/blocked with the reason above**, not as a QA gap.
- **R1** (out of scope) → route to dev / security / DevOps.
- **R3/R6** (no route / third-party records) and the role-scoped-user cases across R1/R3 → the two biggest unblockers
  are **role-scoped test users** and **seeded third-party records / an appeal we own**.
- The genuine QA progress figure is **~91 executed of the ~118 black-box-runnable cases imported so far**; suites
  **03, 04, 05** are complete, and **01, 02, 07, 08, 10** are complete as far as our access allows.

---

## Update — 2026-08-26 (appeals unblocked, roles self-served)

⚠️ The counts in the table above are **stale** (dated 08-18). Always take the current figure from
`scripts/coverage-baseline.js`, not from this file. At the time of writing: **197 / 314 = 62.7 %**, 0 assumed,
62 excluded as blocked / not executed.

### Blockers RETIRED today
| Blocker | Standing since | How it was cleared |
|---|---|---|
| **"No appeal we own"** — gated all 16 appeals cases | 2026-08-14 | Admin → NPO → **Invite to Organisation** attaches a QA applicant to a **status-9** NPO. Accept the magic link from the notification store. The submitter journey then appears natively in **Live** mode. |
| **"Waiting on an administrator" for 3 roles** | 2026-08-18 | **Administration → User Management → `Register New User`**, then **`Assign Role`** on the user's page — QA can self-assign **all 46 roles**. Accounts C and D created; see `../test-data/qa-accounts.md`. |
| **11A TC-06 lacked a role-scoped control account** | 2026-08-25 | Account **D** (`Dsd.Npo.Registry Clerk` only) built. TC-06's FAILED verdict is now conclusive. |

### Corrections to earlier entries in this register
- **`GetAppealInitialData` 500 is NOT a defect to fix.** It returns **200** for every NPO-bound appeal; it 500s only
  on orphan appeals with `npo: null`. The defect is upstream — `Initiate Appeal` creating orphans. The line above
  describing it as *"ROOT CAUSE"* should be read as *symptom*, not cause.
- **"Link us to one of the 3 existing status-9 NPOs" is not viable** — all three have `npoNumber = null`, and the
  link flow keys on the NPO number. Use **Invite to Organisation** instead.
- **The one-active-appeal rule is not enforced**, but the earlier note that the button is *"always present and
  enabled"* is now precise: it is collapsed to **0 × 0 px**, `visibility: visible`, **not disabled**, and still fires.

### Blockers that CHANGED reason (still blocked)
| Case(s) | Old reason | Correct reason |
|---|---|---|
| ~~**Suite 09** (3 cases)~~ | *"blocked on the `Annual Compliance Quality Assurer` role"* | 🔴 **BOTH READINGS RETRACTED — suite 09 is NOT blocked.** Neither the role nor a missing workflow task gates it. The QA form must be opened via `/shesha/workflow-action?id=<instance>&todoid=<todo>` → the **Quality Assurance** action, not by its own URL. **Its 3 cases are runnable.** See the CORRECTION section at the foot of this file. |
| **11P TC-01** (#101774) | *"needs a refusal notice we own"* | We own one. Blocked **only by the calendar** — our refusal dates 05/08/2026, so the out-of-window branch opens ~**2026-09-13**. |
| **11A functional TC-01** (#101781) | *"needs an appeal we own"* | We own one. The case is premised on a **chairperson email field that does not exist** — the dialog is a bare Yes/No confirmation. **Needs a rewrite, not a run.** |
| **11A functional TC-02/03/04/05** | *"needs a chairperson / tribunal login"* | The tribunal forms open for **any** account (TC-06). The real blocker is that **no admin action can move an appeal forward** — *Send to Arbitration Tribunal Chairperson* fires no request at all. See `bugs/2026-08-26-send-to-arbitration-chairperson-fires-no-request.md`. |

### Still genuinely blocked, unchanged
- **11P TC-02** (#101775) — needs an organisation at **OrganisationStatus 7 (Cancelled)**. Re-confirmed today:
  **0 records** at status 7 against 36 517 at status 6.
- **11P TC-04** (#101778) — nothing in any drivable flow flags an organisation *Compulsory Register*.
- **14Z Class B**, 7 of 11 — need source-bug endpoints or a mutation-safe environment.
- **14X**, 8 cases — code-level concurrency; recommend re-homing as a unit/integration suite.

---

## ⚠️ CORRECTION — 2026-08-26 (later, after re-verification)

Three conclusions from earlier the same day were re-tested. **One was wrong.**
Full audit: `audits/2026-08-26-reverification-of-three-uncertain-conclusions.md`.

### 🔴 RETRACTED — "Suite 09 is blocked"
The entry above stating suite 09 is blocked (whether on the `Annual Compliance Quality Assurer` role **or** on a
missing workflow task) is **wrong on both counts. Suite 09 is NOT blocked — its 3 cases are runnable.**

- The QA form is reached via **`/shesha/workflow-action?id=<workflowInstanceId>&todoid=<todoItemId>`** → the
  **Quality Assurance** action, **not** by its own URL. Opened directly it renders dead and disabled, which is what
  produced the false conclusion — twice.
- The tasks existed all along: **49** `Quality Assurance` tasks at `Activity_0gtemvi`; **20** open todo items on a
  single submission.
- **The role is irrelevant** — account C behaves identically to the privileged admin.
- 🔑 The earlier test also used a specimen at **`Status = 3`**. `Status` is Shesha's **WorkflowStatus**
  (1 Draft · 2 In Progress · **3 Completed** · 4 Cancelled · 5 Suspended) — a finished workflow *should* be inert.
  **Filter `status == 2`.**

**What survives:** the **Workflows inbox renders empty** for every account we hold, so the QA queue is unreachable the
way a real assurer would find it. Narrower than "blocked", and still worth raising.

### ✅ CONFIRMED — tribunal forms carry no role restriction (11A TC-06)
Now settled by permission set rather than by what the menu renders:
`Dsd.Npo.Registry Clerk` has **`permissions: []`**, while `Appeal Tribunal Member` holds `Appeal-Outcome`,
`tribunal.view`, `NPO-Details-View`, `Appeal-tribunal-member`. Account D — holding the **empty** role — still opens
the Upheld/Denied decision form. TC-06's FAILED verdict stands with its caveat removed.

### ✅ CONFIRMED — appeals still have no forward exit
`Send to Arbitration Tribunal Chairperson` was re-driven **with** a valid `todoid` that resolves 200. It still issues
**no POST**, and nothing changes. So 11A functional TC-02/03/04/05 remain blocked for a now-proven reason.

---

## Update — 2026-08-26 (suite 09 run, and a 14R correction)

### ✅ Suite 09 — CLOSED, 3 of 3 verdicted
No longer blocked, and no longer partially unexecuted.
Report: `2026-08-26/09-annual-compliance-backend-qa-functional--qa-form-validates-but-never-persists.md`.

| Case | Verdict | Why |
|---|---|---|
| TC-09-004 | 🔴 FAILED | Validation gate works both ways — but **neither Decline nor Approve persists anything**. No POST, record untouched, no notification, yet a success toast (*"Compliane declined."*). Reproduced across 3 todo ids and both decision paths. Bug: `bugs/2026-08-26-annual-compliance-quality-assure-never-persists.md` |
| TC-09-005 | ⚠️ PARTIAL | The 30-day wait is still not executed — but both `RECORD` assertions are satisfied, which is what lifts it off NOT EXECUTED |
| TC-09-006 | 🔴 FAILED | Unchanged from 08-25 (no trends view) |

🔑 **The plan's precondition "the account needs the `Annual Compliance Quality Assurer` role" is WRONG and should be
struck.** The role makes no difference; the real precondition is a live workflow task plus a submission at
`status == 2`.

### 🔑 TC-09-005 — the mechanism exists and is switched on
`NpoCancellationAfter30DaysNonComplianceJob`, cron `0 22 * * *`, **enabled**:
*"Cancels NPO registration after: (1) 30 days from non-compliance notice without extension, OR (2) extension deadline
has passed without submission."* The whole annual-compliance chain is registered and enabled alongside it.

**And yet:** `Outstanding Report` (status 5) = **0 records** and `Cancelled` (status 7) = **0 records**, out of
104 000+ organisations. The path is unobservable from its *first* step, not just its last. That is the question for
Thabiso.

### ⚠️ 14R — the drift notes are CONTRADICTED, not confirmed
The 14R report originally concluded "no retry job exists". **Wrong.** Three are registered and **enabled**:
`IdUnverifiedOfficeBearersJob` (`0 * * * *`, hourly) · `VerifyUnverifiedOfficeBearersJob` (`*/5 * * * *`, 3
records/run) · `VerifyUnverifiedDirectorsJob` (`0 */2 * * *`, NPC directors).
**Both 14R verdicts still FAIL** — but because enabled jobs move nothing, which is far more actionable. Report
corrected in place.

⚠️ `ScheduledJobExecution` cannot be read (`GetAllAsync is not implemented`), so "not executing" vs "executing and
matching nothing" is unresolved and needs developer log access.

---

## 2026-08-27 — NPO-10-F admin decisions come OFF the deferred list

Report: `2026-08-27/10-post-registration-change-request-functional--admin-decisions.md`.

| Case | Was | Now | Why |
|---|---|---|---|
| TC-10-010 (TC-04) | ⚪ DEFERRED since 08-18 | ⚠️ PARTIAL | Approval records status + letter; `changeDecision`, `changesApproved`, `comments`, `actionedBy` all left unset. Bug: `bugs/2026-08-27-change-request-approval-does-not-persist-decision-or-actioner.md` |
| TC-10-011 (TC-05) | ⚪ DEFERRED since 08-18 | ✅ PASSED | Required `Comment` gates `Decline` both ways (disabled-button style) |
| TC-10-005 (TC-03) | ⚪ DEFERRED | ⚪ **still DEFERRED** | Needs a request in "assigned" state; ours went submitted → Completed with no assignment step |

🔑 **Neither was ever blocked on the admin side.** The blocker was in the *submitter* wizard: a saved Change Request
draft can never be submitted, because the office-bearer gate tests `globalState.numberOfOfficeBearer`, which is only
ever set by the add/edit-office-bearer success handler and is `undefined` on load. Three office bearers were listed
and `Next` still refused, under the message "should be 3 or more". Adding a fourth unblocked it immediately.
Bug: `bugs/2026-08-27-change-request-draft-cannot-be-submitted-office-bearer-counter.md`.

### 🔑 The 08-26 "no workflow decision can complete" claim is NARROWED
That conclusion is **too broad**. The change-request decision (`Activity_1jo5xu9`) completed normally today on the
same account that gets **403** on the annual-compliance Quality Assure decision (`Activity_0gtemvi`), minutes apart.
The `UserTaskSave` 403 is **per-task, not per-user**. Retest: `2026-08-27/09-annual-compliance-backend-qa-functional--403-retest.md`.

### 🔴 The Quality Assure 403 survived the outage — and the payload carries no decision
Retested 2026-08-27 07:50 UTC on the privileged account: **403 unchanged**, record untouched
(`lastModificationTime` still 2026-08-22T22:01:32.683). **New:** Approve and Decline post the same body and neither
carries `reportMatches` nor either decision uid from `GetUserDecisions`. So the outcome would not be recorded even
with the 403 fixed. The failure is invisible because the 403 handler's `Show Dialog` action itself throws.

### Newly reachable, deliberately not verdicted
**TC-14T-011** (Change Request Acknowledgement, Submitted) — was BLOCKED, now reachable: submitting `POST1424`
produced `AcknowledgementLetter.pdf` plus a sent acknowledgement email. Left for a focused 14T content pass.

### ⚠️ CORRECTION — TC-14T-011 was never on this register as a blocked *case*
The 08-27 entry above originally listed TC-14T-011 as "newly reachable". **That was a mis-read.** The case has been
**✅ PASS since 08-24**; only its *UI Correspondence cross-check* was BLOCKED (08-25). The word `BLOCKED` was read out
of the **plan heading**, not a report — the same reason the alias-fixed coverage script already showed suite 14T at
22 verdicted / 0 excluded. **Re-running it added no coverage.**

**✅ But that 08-25 blocked cross-check is now CLOSED, not carried forward.** `change-request-details` has **never**
had a Correspondence / notification-audit / Re-Send section — **zero** occurrences of any of those tokens across all
**24** versions of the form markup (v25 is LIVE). Not a rendering fault, not permissions, not a regression. The
plan's 🔑 note asserting that section exists is wrong and is corrected in the plan; ADO #101838 never required it, so
TC-14T-011 stands as PASS — re-verified today on a **second change type** (*General Change*) and our own record.
Report: `2026-08-27/14t-notification-templates-functional--change-request-acknowledgement.md`.

> ### 📋 2026-08-28 — THE 44 UNATTRIBUTED ARE NOW FULLY ATTRIBUTED (ADO pull). Audit: `audits/2026-08-28-unattributed-44-reconciliation.md`.
> Interactive ADO sign-in completed; pulled all 314 functional cases + the 70 smoke case ids. The 44 break down as:
> **3 ADO-Closed** (TC-05-014/024/025) · **9 smoke-owned duplicates** (covered by smoke 70/70) · **21 out of
> black-box remit** (6 code-review, 4 transport/logging, 11 API-endpoint) · **5 calendar-blocked** (TC-08-001..005)
> · **2 not-executable** (TC-01-013/014, no DHA/ID field) · **1 not-confirmable from test env** (TC-14Z-028) · **1
> blocked** needing an investigation case (TC-12-011) · **2 genuinely runnable black-box** (TC-05-021, TC-08-021).
> 🔑 **The reconciliation's old "~22 assumed duplicates" was wrong — only 9 are duplicates.** The true
> untested-but-doable surface of the whole plan is **2 cases**.
> STOP TC-05-021 / TC-08-021 attempted 08-28, blocked on setup state: the wizard Documents step is gated behind a
> progressed draft (ours is at step 1 / submitted), and the annual-compliance form opens read-only on the only
> reachable registered NPO with no way to initiate a fresh editable report. Runnable in principle; each needs a
> fresh in-progress draft/submission first. Raw ADO data committed under `test-data/ado-functional-101543/`.

> ### 2026-08-28 (using existing items, incl. one not-ours as lookup input) — coverage 218 -> 220 / 314 (70.1%), blocked -> 50
> Authorised by the user, one time, to use existing not-owned records to close actionable items.
> - INV/TC-12-005 CLOSED (PASS): filed a synthetic whistleblowing case INV1696 against OUR OWN 333-018 (the intake
>   picker resolves our own NPO by number - the earlier "0 results" was a search-by-NAME mistake). Validated Not Valid
>   -> case terminal ("INVESTICATION COMPLETE"), comment persisted. THE 08-18 "intake broken" CASCADE IS RETIRED.
>   Case-processing actions live on the WORKFLOW TASK (admin Workflows inbox -> workflow-action?id=&todoid=), not the
>   read-only investigation-details view. TC-12-007/008/010 now route-known (each needs a case down a Valid branch);
>   Not-Valid path spawns NO feedback todo, so 010 needs a Valid/Under-Investigation case.
> - TC-02-003 FAILED: the Link-to-Existing-NPO security-questions branch DOES NOT EXIST - link is unconditional
>   ("Confirm Link to NPO", no verification) for blank OR populated authorized-person details. TC-02-004/005 not
>   executable as written (their security-question premise is absent). Did NOT confirm any link (would hijack a
>   not-owned NPO). 
> - SECURITY (Thabiso): unverified linking + authorized-person PII disclosure by NPO number. Bug (no real identifiers):
>   bugs/2026-08-28-npo-linking-has-no-identity-verification-and-discloses-authorized-person-details.md
> ROUTE REUSE for next time: investigation lifecycle = file (public, own NPO by number) -> admin Workflows inbox ->
> workflow-action -> Validate Case. Repeat down Valid branch to close 007/008/010.

---

> ### 🔴 2026-08-31 — suite 12: BOTH case-creation routes are down. Coverage unchanged at 222/314.
> Attempted TC-12-007 / TC-12-008 / TC-12-010 (the three left route-known on 08-28). **None verdicted.** Every old
> blocker reason for these three is now REPLACED by a tested one. Report:
> `2026-08-31/12-investigations-functional--both-creation-routes-down.md`
>
> **1. Public whistleblowing intake — DOWN, and it is a REGRESSION.** The landing **Whistleblowing** button calls
> `POST /api/services/SheshaWorkflow/Process/StartByName` → **404**
> `workflow-definition boxfusion.dsdnpo\investigaton-definition not found`. The endpoint is healthy; the **definition
> name is wrong and misspelt** — all **169** existing investigations carry **`investigation-process`**. Reproduced on
> retry and from both landing routes. ⚠️ **This route WORKED on 08-28** (INV1696/INV1698 filed through it) and a case
> was created 08-29, so the break landed on/after 08-29. Bug:
> `bugs/2026-08-31-whistleblowing-intake-cannot-start-its-workflow.md`
> 🔑 **And the form does NOT work standalone either** — opened directly at
> `/no-auth/boxfusion.dsdnpo/create-investigation-workflow`, **5 required fields (First/Last/Email/Mobile/Npo Number)
> render as labels with NO input control**, Remain Anonymous is disabled, Submit is disabled (4 inputs on the page).
> ⚠️ **An intermediate reading of "the form is fine, only the button is broken" is RETRACTED** — that came from
> reading labels instead of checking for controls. **Do not requote it.**
>
> **2. Admin `Create Case` is SILENTLY INERT for Category = Investigation.** CRM → Cases → Create Case
> (`case-create-two v4`): fully valid form, click **Ok** → click lands (`clicks:1`, capturing listener), issues **one
> GET** to `CaseRouting/Crud/GetAll?caseCategory==6`, then **nothing**. No POST, **no validation error** (0 error
> items), no toast, no console error, Ok stays enabled. Instrumented via patched `fetch`/`XHR.open`, not a filtered
> log. **ROOT CAUSE + CONTROL:** `CaseRouting` rows are Application 6 · Annual Compliance 3 · Appeals 2 · Vol Dereg 1
> · Post Registration 2 · **Investigation 0** · Ed&Awareness 1 — Investigation is the ONLY category with none. Same
> form + same data with **only Category changed to Post Registration** created immediately (**119 → 120** cases). So
> causation, not correlation. Bug:
> `bugs/2026-08-31-create-case-silently-inert-for-investigation-category.md`
> ⇒ **Combined with (1) there is currently NO route of any kind to create an investigation case in QA.**
>
> **3. TC-12-008 / TC-12-010 — identity-gated AND un-routable.** The plan was to assign investigator/reviewer to
> accounts we create (no impersonation of the real assignees). **Not possible:** on INV1698's live *Investigation
> Outcome* task, opened correctly via `workflow-action?id=&todoid=` on **2 of its 9 todo ids**, **`Assign Case` is
> DISABLED** and `Save` is disabled; the **Case Outcome** tab exposes only a **read-only `Investigator` label** — no
> outcome field, no attachment, no Close action. So the shared admin can neither complete the step nor reassign.
>
> **4. 🔑 NEW — Reviewer Feedback has NO surface for the statuses TC-12-009/010 require.** Open-todo counts on our own
> 333-018 cases: **INV1694 (draft) 0 · INV1698 (Under Investigation) 9 · INV1283 (reviewer assigned) 0 · INV1696
> (closed) 0.** **Only *Under Investigation* has a workflow task at all.** Closed/Referred cases have zero todos, so
> the only surface left is read-only `investigation-details`, which carries no Feedback control. ⚠️ **This REPLACES
> TC-12-009's recorded reason** *("actions not on the CRUD view; needs the case-processing view")* — that view was
> found on 08-26/08-28, so the old reason is STALE. The real obstacle is that closed cases carry no task.
>
> **Observations:** INV1698's single Investigation Outcome step holds **9 duplicate todos** (all `08-28T09:01`);
> `case-create-two` throws `executeScriptSync ... Cannot read properties of null (reading 'id')` **once per
> keystroke** (25+ per field).
> **Records:** one synthetic **Post Registration** case on our own 333-018 (`08-31T07:45:01`) — created as the
> control test for defect 2 and left as its evidence. Nothing else created or modified; no workflow decision taken.

---

> ### ✅ 2026-08-31 (later) — SUITE 11 RECONCILED. The R3 "Suite 11 — all BLOCKED" entry above is **STALE — do not requote it.**
> Report: `2026-08-31/11-appeals-suite-11-reconciliation.md`. Coverage unchanged **222/314**.
>
> **7 of the 11 functional cases already carry verdicts** (matches the coverage script's own `suite 11 → 7 / 0 / 4`):
> TC-11-004 ✅ PASSED · TC-11-010/011/013 ⚠️ PARTIAL · TC-11-014/015/016 🔴 FAILED.
> **Residue is 4, not 13** — and all four were checked individually this session. **None is actionable:**
> - **TC-11-009 — NOT EXECUTABLE, already dispositioned 08-26.** The case says *"TYPE chairperson email = invalid"*;
>   **there is no email field** — Send-to-Chairperson is a confirmation dialog. 🔑 It reads as an unexplained gap only
>   because that write-up is filed against the **SMOKE** plan, and `coverage-baseline.js:68` reads only
>   `-functional.md` plans. **Bookkeeping gap, not a testing gap.** ▶ #101781 needs a rewrite (Thabiso).
> - **TC-11-002 — precondition DESTROYED 08-29.** `Test Unsuccessful 03` is no longer OrganisationStatus 9: it now
>   holds `npoNumber 333-027-NPO`, `dateRegistered 2026-08-29T10:52`, a registration certificate, and
>   `lastModifierUserId 15932`. **Another user registered our appeals fixture.** No refusal left to appeal.
> - **TC-11-003** — still needs OrganisationStatus 7; never set on any NPO; `canBeCancelled=true` on 333-027 with
>   still no UI action. Unchanged.
> - **TC-11-006** — no Compulsory-Register org with a denied application found; the plan already calls the
>   precondition possibly unbuildable.
>
> ### ⚠️ FIVE claims made earlier the same session are RETRACTED — all from reading THIS REGISTER instead of report tables
> | Claimed | Actually |
> |---|---|
> | Case TC-15A-004 reclassifiable to FAILED | **already 🔴 FAIL since 08-18** (District list empty) |
> | Case TC-15A-005 reclassifiable | **already ⚠️ PARTIAL since 08-18** |
> | Case TC-15B-005 reclassifiable to FAILED | **already 🔴 FAIL since 08-18** (upload control disabled) |
> | Case TC-10-005 verdictable from "cancel broken unassigned" | case tests the **assigned** path; observation does not verdict it |
> | Cases TC-14Z-021/022 unlockable via accounts A/B | both are **`Src:Code`** naming C# methods — out of black-box remit |
> **Suite 15A is 8/0 · suite 15B is 6/4** (006 time-travel; 007/009/010 depend on the broken upload). **Nothing to
> reclaim.** 🔑 **THE REGISTER IS NOT A VERDICT SOURCE.** It is prose about why a run was hampered. A case can be
> verdicted FAIL *because* of the very blocker described here. **Read the report verdict tables.** Second occurrence
> this month.
>
> ### 🔧 Parser fragility found while writing that report
> The verdict-table regex uses `[^|]`, which **matches newlines**, so a **two-column** row starting with `TC-` eats the
> line break and matches the next row's pipe. The reconciliation table registered **9** phantom rows and the
> corrections table **2** more (total unmoved — keys deduped). **For any report that REPORTS rather than PRODUCES
> verdicts: keep case ids out of the first column** (lead with the ADO number, or prefix `Case TC-…`) and confirm the
> report shows `0  NO DATA` before publishing. Suggested fix if the script is ever revised: `[^|]` → `[^|\n]`.
>
> ### 📌 QA state is drifting — 3 instances dated on/after 08-29
> whistleblowing intake broken · Create Case inert for Investigation · **appeals fixture registered away**.
> **Re-read every precondition immediately before use.**
