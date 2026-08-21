# DSD-NPO — Skipped & Blocked Register (functional plan 101543, against the full 314)

> Purpose: the functional plan has **314 cases**. This register keeps the full 314 as the denominator and accounts for
> every case that has **not** been executed as a genuine black-box verdict — each with a reason. It complements the
> per-suite run reports and the coverage script (`scripts/verify-coverage.js`).
> **Last updated:** 2026-08-18.

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
| TC-01-022 | Requires developer **database delete** + direct table reads. |
| TC-01-014 | Requires DHA forced to a 5xx error (fault injection). |
| TC-04-006 | Requires the DHA service forced down. |
| TC-04-009 | Requires the CIPC service forced down. |
| TC-04-017 | Two app instances + a background job triggered on both — developer check. |
| TC-04-020 (step 2) | Explicit `POST` to the API with an out-of-range value (step 1 is UI and was run). |
| TC-07-020 | "Non-admin cannot access admin views" — needs a **role-scoped non-admin user** (we hold only the shared privileged login). |
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
| TC-07-008 | All-OBs-non-compliant outcome — needs another submitted app (ours went via the mixed path). Partly evidenced (status 10). |
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
