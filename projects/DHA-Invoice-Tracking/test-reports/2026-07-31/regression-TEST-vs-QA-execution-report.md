# Execution Report: DHA ITS regression — pre-deployment (TEST) vs post-deployment (QA)

**Compiled:** 2026-07-31
**Application:** DHA SmartGov Invoice Tracking (ITS)
**Pre-deployment baseline:** **TEST** — https://dha-smartgov-adminportal-test.shesha.app · runs of 2026-07-28 and 2026-07-29
**Post-deployment run:** **QA** — https://dha-smartgov-adminportal-qa.shesha.app · runs of 2026-07-31 (view mode **Latest**)
**Purpose:** compare what the deployment changed, in both directions — what it fixed and what it broke.

---

## Verdict

**The deployment is a net improvement, with one regression that should be fixed before go-live.**

Both payment chains now complete end to end on QA, which is the first time BAS *and* LOGIS have both
been green in the same environment. Three defects that blocked or degraded TEST are gone. One control
that demonstrably worked on TEST is broken on QA, and it fails silently.

| | Pre-deployment (TEST) | Post-deployment (QA) |
|---|---|---|
| BAS full chain | ✅ Paid + Filed | ✅ Paid + Filed |
| LOGIS full chain | ✅ Paid + Filed *(after blocker fixes)* | ✅ Paid + Filed |
| Register `Submit` reliability | ⚠️ intermittent 500 | ✅ no failures observed |
| Mandatory response checklist | ✅ present and enforced | ⛔ **fails to load, silently skipped** |

---

## Execution matrix

Legend — ✅ pass · ⚠️ partial · ⛔ blocked or defective · — not run

| # | Scenario | TEST (pre-deploy) | QA (post-deploy) | Delta |
|---|---|---|---|---|
| 1 | **BAS** full chain → Paid + Filed | ✅ PAY3035 (28th), re-run ✅ PAY3061 (29th) | ✅ PAY3306 — 11/11 | no change |
| 2 | **LOGIS** full chain → Paid + Filed | ⛔ 28th blocked at Certify; ✅ 29th PAY3055 + PAY3072 | ✅ PAY3326 — 11/11 | **holds after deploy** |
| 3 | BAS **Reject** → Review Rejected Invoice → *Approve Rejection* (terminal) | ✅ PAY3047 | ✅ PAY3338 | no change |
| 4 | BAS Reject → *Send for Invoice Verification* (recovery) | ✅ PAY3047 | ✅ PAY3338 | no change |
| 5 | BAS **business-related query** | ⚠️ PAY3043 — routed correctly, response step **not executable** (no login for assignee) | — not run | still blocked |
| 6 | BAS **supplier-related query** | ⚠️ PAY3039 — routed correctly, response step **not executable** | — not run | still blocked |
| 7 | LOGIS **Reject** → Approve Rejection (terminal) | ✅ PAY3082 | — not run | untested on QA |
| 8 | LOGIS **Pre-Authorise → Send Back to Capture** | ✅ PAY3086, driven on to Paid + Filed | — not run | untested on QA |
| 9 | LOGIS **re-route** ("wrong person to confirm delivery") | ⛔ PAY3076 — task created with **no assignee**, permanently stuck | ✅ PAY3330 — assignee added mid-run, re-routes and completes to Paid + Filed | **FIXED on QA** |
| 10 | LOGIS **Capture & Link "No"** branch | ⛔ visible Submit disabled; only enabled control applies the *opposite* decision | — not run | still open |
| 11 | LOGIS query branches (business / supplier) | ⚠️ routed only — assignee not test-accessible | — not run | still blocked |
| 12 | Register & Upload `Submit` stability | ⛔ 28th: 5/5 hard 500s, 0 of 8 chains executable · ⚠️ 29th: intermittent, 1 failure in 2 | ✅ no 500 across 3 registrations + 1 manual | **improved** |
| 13 | **Business Unit Response checklist** | ✅ rendered and **mandatory** — 4 × Yes on BAS, 7 questions on LOGIS | ⛔ **`CheckList/Initialise` 404 — never renders, step submits without it** | **REGRESSION** |

---

## The one regression

**Mandatory response questions have stopped being enforced.**

On TEST the checklist was demonstrably working. Every Prepare Voucher submission in the TEST reports
records the answers being supplied — `Outcome = Verification is complete + 4 × Yes checklist` on
PAY3035 and PAY3061, and the same on the negative paths PAY3043, PAY3047 and PAY3039. The LOGIS run of
2026-07-29 records all seven Business Unit Response questions being blank after a send-back and
**having to be re-entered**. `CheckList/Initialise` does not appear as a failure anywhere in the TEST
reports.

On QA the panel never resolves past “Loading checklist items…” and the supporting call fails:

```
POST /api/services/Enterprise/CheckList/Initialise   →  404
GET  /api/services/Enterprise/CheckList/Initialise   →  405  (Method Not Allowed)
```

The `GET` returning 405 rather than 404 shows the route is registered, so the missing piece is the
**checklist definition** — consistent with configuration or seed data that did not ship with the
deployment, rather than a code fault.

**Impact is silent, not blocking.** With only the Outcome radio set, Submit stayed enabled, the post
succeeded, and invoices routed onward and reached Paid + Filed. It affects:

- BAS *Prepare Voucher* — 4 questions skipped
- LOGIS *Verify Invoice* — 7 questions skipped
- LOGIS *Pre-Authorise Payment* — displays those 7 answers read-only for the approver to check; now shows none
- The **reject path too** — both rejections on PAY3338 submitted with no validation errors at all, where TEST recorded these questions as mandatory for the reject outcome specifically

So a payment can now be prepared, rejected, or paid with no Business Unit Response on record. It is a
data-integrity and auditability problem rather than a throughput one, which is exactly why it needs
raising before go-live: nothing fails, so nobody notices.

→ `test-reports/bugs/2026-07-31-prepare-voucher-checklist-initialise-404.md`

---

## What the deployment fixed

1. **Register & Upload `Submit`.** On 2026-07-28 this returned 500 on both BAS and LOGIS, making 0 of 8
   planned chains executable. By 2026-07-29 it was intermittent (1 failure in 2, silent to the user).
   On QA it did not fail once across three spec/manual registrations plus the negative-path runs.
2. **LOGIS Certify → Approve routing.** On 2026-07-28 LOGIS was blocked at step 2 by a silent 500 (no
   supervisor in the TEST org structure). Resolved by 2026-07-29 and stable on QA.
3. **LOGIS re-route assignee.** *Re-route to Correct Business Unit* was created with `assignedTo: []` on
   TEST — verified invisible to all eight test accounts, leaving PAY3076 permanently stuck. On QA an
   assignee was configured during this run, after which the branch worked correctly: it re-targeted the
   certifier to the newly chosen Business Unit and the invoice completed to Paid + Filed.

**Follow-up:** the TEST environment has *not* had the re-route assignee fix applied as far as we know —
PAY3076 is likely still stuck there.

---

## Coverage gaps, unchanged by the deployment

- **All four query branches remain unrun end to end** (BAS business + supplier, LOGIS business +
  supplier). On TEST they routed correctly but the response step was not executable — the assignee had
  no test-accessible login. They were not attempted on QA.
  **Note:** these may now be *unreachable* rather than merely unrun, because the query outcomes
  previously depended on the checklist answers that no longer render. Worth attempting to establish
  which.
- **LOGIS Capture & Link "No"** branch — open defect from TEST, not retested on QA.
- **LOGIS reject and Pre-Authorise send-back** — passed on TEST, not retested on QA.
- **Over-invoicing / Motivation-required** rule — untested in both environments; every run had variance 0.

---

## Evidence index

| Environment | Report |
|---|---|
| TEST 07-28 | `test-reports/2026-07-28/test-env-bas-logis-blocked.md` — the 5/5 Submit 500 blocker |
| TEST 07-28 | `bas-full-chain-PAY3035.md`, `bas-negative-reject-invoice-PAY3047.md`, `bas-negative-business-related-query-PAY3043.md`, `bas-negative-supplier-related-query-PAY3039.md`, `logis-full-chain-PAY3055.md` |
| TEST 07-29 | `bas-full-chain-PAY3061.md`, `logis-full-chain-PAY3055.md`, `logis-full-chain-PAY3072.md`, `logis-negative-branches.md` |
| QA 07-31 | `bas-post-deployment-QA-PAY3306.md`, `logis-post-deployment-QA-PAY3326.md`, `logis-negative-reroute-QA-PAY3330.md`, `bas-negative-reject-QA-PAY3338.md` |

## Allure coverage — partial, and not comparable between environments

| Environment | Allure |
|---|---|
| TEST 07-28 | `allure-report--test-env-2026-07-28/` — 9 results |
| TEST 07-29 | `allure-report--test-env-2026-07-29/` — 14 results |
| QA 07-31 | **incomplete** — `allure-results/` holds only 4 passing TCs (TC-01→TC-04) from a spec run interrupted at 07:53 |

The completed QA regression was driven live via MCP, and Allure output is produced only by the
Playwright spec runner, so there is no Allure artefact representing the full QA chain. Generating one
would mean re-running `bas.spec.ts` against QA — which covers TC-01→TC-05, TC-07, TC-10 and TC-11 only,
since the imports, filing and every negative branch are `test.skip` in that spec. LOGIS has no spec at
all. Treat the markdown reports above as the authoritative execution record for QA.
