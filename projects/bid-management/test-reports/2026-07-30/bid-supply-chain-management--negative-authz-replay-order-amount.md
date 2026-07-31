# Report: BID-SCM — replay, non-participant writes, order-amount validation (NEGATIVE)
**Date:** 2026-07-30 17:45 SAST
**Variants:** 80/20 (REF2026-1053, 2573) · 90/10 (REF2026-0890→2561, 0944)
**Plan:** test-plans/tender-process/bid-supply-chain-management.md (TC-24 extended, TC-25)
**Spec:** not encoded
**Execution Mode:** live via Playwright MCP
**Result:** MIXED — replay defence **holds**; **2 new High bugs** (non-participant writes, order amount)
**Tenders:** all **reused** — no new tenders created

## Summary
| Check | Result |
|---|---|
| Replay a **completed** todoid, as the user who completed it | **PASS** — refused |
| Non-participant **upload** of a tender attachment | 🔴 **FAIL** — `PUT /api/StoredFile` 200, persists |
| Non-participant **delete** of a tender attachment | 🔴 **FAIL** — `DELETE` 200 |
| **Negative** Purchase Order Amount (−R 5 000 on a R 30 000 award) | 🔴 **FAIL** — accepted → AWARDED |
| **10× over-commitment** (R 300 000 on a R 30 000 award) | 🔴 **FAIL** — accepted → AWARDED |

## 1. Replay of a completed task — PASS

Re-opened REF2026-1053's **finished** BAC todoid (`f96a7a67…`) as **MoshadiM — the very user who had
completed it**.

- [PASS] The page shows **"Requested action is not available"** and falls back to the read-only
  `tender-wf-details-view v27`
- [PASS] **No BAC decision buttons** — the decision cannot be re-taken

So the guard is "is this task actionable by you *now*", which covers both the wrong-user case (tested earlier
as TC-24) and the already-completed case. Good.

## 2. Non-participant can upload AND delete tender attachments — 🔴 FAIL

This was the open question left hanging from TC-24, and it turns out to be a real defect.

As **MoshadiM** — the BAC adjudicator, with **no task at all** on **REF2026-2561** (a tender sitting at
*Verify Compliance*, assigned to TumisangM) — on the very page that says *"Requested action is not
available"*:

- 🔴 **Upload succeeded.** `PUT /api/StoredFile` → **200**. The Procurement Plan field showed
  `supporting-doc.txt (81 B)` and it **survived a full page reload**, so it is persisted server-side.
- 🔴 **Delete succeeded.** `DELETE /api/StoredFile/Delete?fileId=…&propertyName=model.requisitionDoc` → **200**,
  through a normal "Delete Attachment → Are you sure?" confirm.

**The workflow's decisions are protected; its documents are not.** Attachments are the procurement evidence
(procurement plan, tax clearance, BBBEE certificates, bid documents, the specific-goal spreadsheet), so this
allows planting or removing evidence outside the workflow and outside its audit trail. The `propertyName` is
per-control, so this is not confined to the Procurement Plan field.

Logged: `bugs/2026-07-30-non-participant-can-upload-and-delete-tender-attachments.md`.
**TC-24's conclusion is corrected** from "authorisation holds" to "holds for decisions, fails for attachments".

**Cleanup:** the uploaded file was removed while testing the delete path, so REF2026-2561 is back to its
original state (it had no Procurement Plan document beforehand).

**Not tested:** the same write path against a *completed* tender, and against the compliance document rows
(`RfxResponseDocument`) — the latter matters more, since Verify Compliance decisions hang off those documents.

## 3. Purchase Order Amount is unvalidated — 🔴 FAIL

Both tenders were awarded to **A & A Stationers at R 30 000**.

- 🔴 **REF2026-0944:** amount **−5 000**. No inline error, Submit enabled, submit accepted → **AWARDED**.
- 🔴 **REF2026-2573:** amount **300 000** (10× the awarded price). Same — no validation at all → **AWARDED**.

The award is decided on price (A & A won on 80/90 price points at R 30 000), so an unconstrained order amount
defeats the upstream price scoring; and with **no footer Send Back at TC-16**, a wrong amount captured here
cannot be corrected through the workflow. Logged:
`bugs/2026-07-30-purchase-order-amount-not-validated.md`.

**Both tenders were deliberately consumed** for this — they were idle, parked test tenders at the final stage.
Neither should be cited as an example of a well-formed completed tender.

**Not tested:** zero, non-numeric, overflow values, and a Purchase Order Date before the award date.

## Tender states after this batch

| Tender | State |
|---|---|
| REF2026-0944 | **AWARDED** — invalid order (−R 5 000) |
| REF2026-2573 | **AWARDED** — invalid order (R 300 000) |
| REF2026-2561 | Verify Compliance — restored, attachment test cleaned up |
| REF2026-1053 | Approve Recommendation from BAC |
| REF2026-0890 | Calculate Specific Goal Points |
| REF2026-1106 / 1110 | Review and Approve — untouched, Disapprove retest data |
| REF2026-0999 | Consolidate Responses |

## Still outstanding after this batch

**Testable from this UI, not yet done:**
- **TC-01 validation batch** — date order, required fields per step, briefing conditional fields, field length
  limits. Untouched across the whole plan; the abandoned drafts REF2026-1059/1062 make it cheap.
- **No supplier meets the functionality minimum** (whole-tender case) and the **exact-boundary** score —
  needs one fresh chain to TC-09.
- **TC-12 "Recommend another Supplier" / "Bid is non-responsive"** — same fresh chain can cover these.
- **BAC Cancel Tender / Bid is Non-Responsive** — likely terminal; one chain each.
- **Zero responses / late response after closing date** at Consolidate (REF2026-0999 is parked).
- **Tie-breaks** (equal score or equal price), **score out of range**, **quorum** rules.
- **Double-submit** at other stages; **concurrency** (two actors on one todo); **session expiry**.
- Compliance-row (`RfxResponseDocument`) write access from the read-only view.

**Not closeable by testing alone — needs someone else:**
- The **double `RfxResponse` create** on every Add-Response dialog open — needs a **dev DB/API check**.
- The **supplier portal** side (registration, briefing, response submission) — a separate app, no access here.
- BA rulings: backup-evaluator-blocks-calibration, the TC-23 approve-only gap, non-participant read access,
  the order-amount rule, and one consolidated **copy review**.
