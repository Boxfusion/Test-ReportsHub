# DSD-NPO — reconciliation of the 44 unattributed functional cases (2026-08-28)

**Type:** audit / non-run analysis
**Purpose:** close the one real hole in a "done on our end" claim — the cases in functional plan 101543 that carried
neither a verdict nor a recorded blocker. Previously estimated in [[dsd-npo-import-reconciliation]] as "~23 explained
+ ~22 assumed duplicates." This replaces the estimate with a **fact-based attribution of all 44**, built from a full
Azure DevOps pull.

## Method
An interactive Azure DevOps sign-in was completed (the `ado` MCP was unreachable; browser + REST same-origin, per
[[read-ado-via-browser-rest-api]]). Pulled:
- **All 36 functional suites of plan 101543 → exactly 314 test cases**, every one carrying a `TC-NN-NNN` id
  (`test-data/ado-functional-101543/ado-all-cases-314.json`).
- **Work-item State + Tags** for the 44 unattributed.
- **The full smoke plan 101541 → 70 cases, 70 distinct TC ids**
  (`test-data/ado-functional-101543/ado-smoke-101541-caseids.json`).

The 44 = 314 minus the 270 case ids that appear in our reports (218 verdicted + 52 blocked), computed by
`scripts/coverage-baseline.js`. **Zero keying mismatches** — every counted id maps to a real plan case, so the 44 is
exact, not approximate.

## The attribution — all 44 accounted for

| Bucket | Count | Cases | Status |
|---|---|---|---|
| **ADO State = Closed** | 3 | TC-05-014, TC-05-024, TC-05-025 | Retired in ADO — correctly outside the numerator |
| **Smoke-owned duplicate** | 9 | TC-01-001, TC-03-031, TC-03-032, TC-04-023, TC-05-026, TC-05-027, TC-05-028, TC-05-029, TC-14W-001 | Same TC id in smoke plan 101541, which closed 70/70 on 2026-08-13 — **covered** |
| **Out of black-box remit — code-review / source-only** | 6 | TC-14Z-001, 002, 008, 011, 030, 032 | Plaintext secrets in `appsettings`, k6 harness creds, Android keystore, Pulumi IaC password, HttpClient anti-pattern, CIPC JSON-injection — all `Src:Code`, require the source tree. Route to security/dev. |
| **Out of black-box remit — transport / logging** | 4 | TC-14Z-010, TC-15Y-001, 002, 003 | HSTS, `AbpAuthorize` gating, PII-not-logged, bulk-notification internals — server headers/logs/attributes, not UI. |
| **API / endpoint — needs a source-bug route** | 11 | TC-07-021, 022; TC-08-019, 020; TC-14Z-006, 009, 014, 015, 016, 024, 026 | `BackfillDocuments`, `ResendAnnualComplianceLetters`, `Reallocation`, `ValidateApiKey`, SignalR token, OTP internals, `DocumentStamp`, `OrgLocation` IDOR — direct API cases; same "route unknown without the source bug" class as the 14Z Class B set already recorded blocked. |
| **Calendar / time-driven — blocked** | 5 | TC-08-001, 002, 003, 004, 005 | Annual-compliance reminders (1 month before / 3 months after), notice letter after 2 unanswered, cancellation after ignored notice, 30-day extension — all fire on real elapsed time. |
| **Not executable as written** | 2 | TC-01-013, TC-01-014 | Both test account creation gated on **DHA ID verification**; the build has **no ID-number field anywhere in sign-up** (confirmed repeatedly). Not executable as written — same disposition as TC-01-010/011/012. |
| **Genuinely runnable black-box — not previously done** | 2 | **TC-05-021, TC-08-021** | See below — these are the only real testing gap the exercise surfaced. |
| **Not confirmable from the test env** | 1 | TC-14Z-028 | Hardcoded test-env URL in a **PROD** email — a PROD-only symptom; the 08-18 14Z run already recorded this class as not confirmable from QA. |
| **Blocked — needs an investigation case we own** | 1 | TC-12-011 | Third-party-routing creates/deletes a temp person; depends on an open investigation, which the intake/NPO-number constraint still blocks (see the 08-28 re-sweep). |
| **Total** | **44** | | |

## The honest bottom line

The reconciliation's old framing — "~22 assumed duplicates" — was **too generous in one direction and too vague in
the other**. Only **9** are smoke-owned duplicates (not ~22), and **3** more are ADO-Closed. The rest are **not**
duplicates: they are **out-of-remit** (21: code/transport/API), **blocked** (6: calendar + investigation),
**not-executable** (2: DHA), **not-confirmable** (1), and **2 genuinely runnable cases that were simply missed**.

So the true "we could test this black-box and didn't" gap across the whole 44 is **2 cases**, not 22. That is the
number that matters for a "done" claim, and it is small and named:

- **TC-05-021** — wizard document upload allowlist (ADO: `.docx` → Rejected, `.jpg/.png` → Rejected, `.pdf` →
  Accepted; allowlist is `.pdf`/`.doc` per `StoredFileCheckerAppService.cs:47`).
- **TC-08-021** — annual-compliance conditional (ADO: Audited = Yes + blank Auditing Firm Name/Contact → required
  error; Audited = No + blank → accepted).

**Attempted this session — both need setup state we do not currently hold; recorded as a soft blocker, not a quick
miss:**
- **TC-05-021:** reaching the wizard **Documents** step requires a draft application progressed past steps 1–5.
  The wizard gates step navigation (Documents renders `ant-steps-item-wait` and is not clickable), and our only
  editable draft (QA Test NPO, APPL26-00793) sits at step 1; APPL26-01570 is submitted (status 10), not editable.
- **TC-08-021:** reaching the **Audited** conditional requires an annual submission in an *editable* state. On
  333-019 (the one registered NPO with annual compliance we can reach) **both** existing reports (ANN2363
  "Initiated", ANN2119 "In Progress") open to a **read-only** `Portal-Annual-Compliance-Details` view with no Edit
  control, and a new report cannot be initiated (*"a report may already be in progress"*).

**So the true residual is:** every one of the 314 is verdicted, recorded-blocked, ADO-Closed, smoke-owned, or
out-of-black-box-remit — **except these 2**, which are black-box-runnable but each require first constructing a
fresh in-progress draft/submission (a full wizard pass / a fresh annual initiation). They are the entire "genuinely
untested and doable" surface of the plan: **2 cases out of 314.**

⚠️ **This corrects an earlier draft of this file that said the two were "being run this session."** They were
attempted and are blocked on setup state; they are **not** verdicted.

## Coverage framing this supports
- **Denominator integrity:** of 314, **12** are legitimately outside a QA-black-box numerator (3 Closed + 9 smoke),
  and **~28** are out-of-remit / not-confirmable / not-executable-as-written (code, transport, API, DHA, PROD-only).
- The **67–69% verdicted** figure remains the conservative floor per [[report-the-conservative-coverage-number]];
  this reconciliation simply proves the *unverdicted* remainder is explained, not ignored.

Related: [[dsd-npo-import-reconciliation]], [[dsd-npo-coverage-baseline-method]], [[read-ado-via-browser-rest-api]],
[[black-box-ui-only-no-api-testing]].
