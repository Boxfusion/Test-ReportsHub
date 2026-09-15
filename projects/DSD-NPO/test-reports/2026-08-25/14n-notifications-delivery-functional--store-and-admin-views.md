# Report: NPO-14N-F — Notifications & delivery status (functional)

**Date:** 2026-08-25 09:30 UTC
**Plan:** test-plans/cross-cutting/14n-notifications-delivery-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 3 of 3. Delivery tracking has **no confirmation state at all** (3 of the 5 named statuses are never written), invalid addresses are recorded as **Sent**, **4 559 re-sends** went to recipients who had already received the message, and **no admin view shows a per-OB delivery status**.
**Duration:** ~900s
**Cases:** TC-01, TC-02, TC-03
**Environment:** QA · admin portal · **view mode Latest (asserted in-run)** · notification store harvested in full: 23 644 messages
**Accounts used:** `mpenduloizwelinuk@gmail.com` (shared dev login)

## Summary
| Total attempted | Passed | Failed | Partial | Blocked |
|---|---|---|---|---|
| 3 | 0 | 3 | 0 | 0 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 Bounce / invalid address surfaces to admin | #101813 | 🔴 FAILED | **70 undeliverable addresses recorded as `Sent`**, and no admin view exists to surface any of it |
| TC-02 Retry re-sends only to non-successes | #101825 | 🔴 FAILED | **4 559 re-sends followed an earlier success**; one recipient got the same email **24 times** |
| TC-03 Per-OB delivery status on admin view | #101827 | 🔴 FAILED | No delivery column on any application or office-bearer view |

## 🔑 The root cause under all three — there is no "delivered" state
The cases assert against five values from `RefListDeliveryStatus.cs:9` —
`AwaitingToBeSent | Sent | DeliveryConfirmed | DeliveryRetry | DeliveryFailed`. Across **all 23 644 messages** only
**three numeric values are ever written**:

| Stored value | Count | Reading |
|---|---|---|
| `1` | 22 252 | Sent — handed to the mail/SMS provider |
| `8` | 1 232 | Failed |
| `16` | 160 | **unidentified** — flagged on 08-24 and still unexplained |

**`DeliveryConfirmed`, `DeliveryRetry` and `AwaitingToBeSent` are never written.** That single gap explains TC-01,
TC-02 and TC-03 together: with no confirmation state, the system cannot distinguish "delivered" from "dispatched", so
it cannot suppress duplicates (TC-02), cannot mark a bounce (TC-01), and has nothing meaningful to display per
recipient (TC-03). ❓ **What is `16`?** It is the one value that might be a confirmation signal, and it is a direct
question for Thabiso.

## Case detail

### TC-01 — Bounced or invalid address surfaces to admin (#101813 · TC-14-001) — FAILED
**Mode:** ai-repair · 23 644 messages scanned for malformed recipients
- [FAIL] **173 email rows carry a recipient that cannot resolve** — and **70 of them are stored as `1` (Sent)**:

| Recipient (masked) | Messages | Stored status |
|---|---|---|
| `***@gmail.comL` | 16 | **all Sent** |
| `***@gmail.coml` | 12 | **all Sent** |
| `***@gmail.comHGF` | 4 | **all Sent** |
| `***@gmail.coms` | 1 | **Sent** |
| `***@gmail.comuhds` | 42 | Failed |
| `***@gmail.comhghg` | 40 | Failed |
| `***@boxfusion.iiiiiooo` | 15 | Failed |
| `fatiOld` *(not an address at all)* | 1 | Failed |

- [FAIL] (blocking) **No admin-visible indicator exists.** Every notification screen in the portal returns 400 (see `../bugs/2026-08-25-notification-audit-screens-all-fail-on-stale-fields.md`), and no application or office-bearer view carries a delivery column — so even a correctly-recorded failure would be invisible to an assessor
- ⚠️ **Scope stated honestly:** a true bounce requires an inbound bounce from a mail server, which QA cannot produce. This verdict rests on the observable proxy — a syntactically undeliverable address — plus the absence of any surfacing UI. The bounce-handling path itself remains **untested**, not passed
- 📌 The split is telling: `…gmail.comL` is Sent while `…gmail.comuhds` Failed. Both are undeliverable, so whatever distinguishes them is not address validity — most likely the provider accepted one and rejected the other at handoff. **Nothing validates the address before sending.**

### TC-02 — Retry re-sends only to recipients without success (#101825 · TC-14-013) — FAILED
**Mode:** ai-repair · grouped by *template + recipient*, ordered by time, across the full store
- [FAIL] (blocking) **The blocking assertion fails outright.** Of 2 620 template+recipient pairs sent more than once, **4 559 individual re-sends occurred where an earlier send to that same recipient had already succeeded**. The case requires that recipients with `DeliveryConfirmed` receive no duplicates
- [PASS] Failed recipients *are* retried — 730 re-sends followed only failures, so the retry mechanism itself works
- [FAIL] **Retries are uncapped.** The OB Acknowledgement Reminder is the clearest natural experiment: 428 messages to 110 recipients, and the worst cases run daily without a ceiling —

| Recipient (masked) | Messages | Succeeded | Window |
|---|---|---|---|
| `07109…` (SMS) | 32 | **0** | 2026-08-11 → 2026-08-25 |
| `***@gmail.com` | 32 | **32** | 2026-08-11 → 2026-08-25 |
| `07173…` (SMS) | 21 | 0 | 2026-02-05 → 2026-03-12 |
| `07601…` (SMS) | 20 | 2 | 2026-02-05 → 2026-08-18 |
| `***@boxfusion.io` | 13 | 13 | 2026-02-05 → 2026-08-18 |

- 🔑 **The second row is the defect in one line:** 32 emails, all 32 recorded as successfully sent, still re-sent every day. Success does not stop the reminder.
- 📌 Worst single case in the whole store: an `OfficeBearerRegistry` email sent **24 times** to one recipient between 2025-09-02 and 2026-08-07.
- 📌 This substantiates the retry-cap recommendation already made in `../bugs/2026-08-24-ob-reminder-link-host-does-not-resolve.md` — that bug asked for a cap on suspicion; this is the measurement.

### TC-03 — Per-OB delivery status on the admin view (#101827 · TC-14-015) — FAILED
**Mode:** ai-repair · applications grid, application detail and both office-bearer views inspected in Latest mode
- [FAIL] (blocking) **No view shows a delivery status per office bearer.** Checked and recorded:

| View | Columns / sections | Delivery status? |
|---|---|---|
| `npoapplication` grid | Application Ref · Organisation Name · Whatsapp Number · Email Address · Legal Form · No. of Office Bearers · Application Status · Date Received | ✗ |
| `npo-office-bearers` grid | Organisation + OB · Person · Organisation · Passport Number · Capacity · Position · Creation Time | ✗ |
| `npoapplication-details` v46 | 10 sections incl. *Particulars Of Office Bearers* | ✗ |
| all `Shesha` notification screens | — | ✗ — all return 400 |

- [FAIL] None of the seven probe terms (`Delivery`, `Awaiting`, `Confirmed`, `Retry`, `Failed`, `Notification`, `Sent`) appears anywhere on the applications grid
- [FAIL] Only **3 of the 5** named statuses are writable at all, so even a working view could not render `AwaitingToBeSent`, `DeliveryConfirmed` or `DeliveryRetry`

## ⚠️ Environment observation — two-thirds of the applications grid renders blank
Not a verdict on any case in this suite, and **deliberately not raised as an application defect.**

The admin Applications grid reports **10 345 items** and, on the default first page, shows a value in only one of its
eight columns (Date Received). Verified as **not a render race** — after 60 s of polling, still no non-date cell
content — and the grid's own request returns **HTTP 200**, not an error.

The cause is in the data: the grid binds its columns to `npo { applicationRef name whatsappNumber … }`, and the server
returns **`"npo": null`**. Sampling 1 200 rows: **792 (66 %) have a null `npo`** and **966 (80 %) carry
`applicationStatus: 0`**.

🔑 **Why this is not filed as a bug:** the QA database is plainly a production restore (320 595 organisations,
records back to 2004), and the grid is unsorted so page 1 is arbitrary legacy rows. Orphaned application→organisation
links are far more likely a migration artefact than an application fault — the same reasoning that correctly stopped
the "QA links to a prod host" alarm on the same day. **❓ For the test lead: is this expected in the QA restore, or
does it reflect production?** If it reflects production, an assessor's primary work queue is unusable for two-thirds
of its rows and it becomes a serious defect.
📌 Incidental: the correct field name is **`applicationNo`**, not `applicationRef` — the latter does not exist on
`NpoApplication`.

## Method
- Store harvested in full with paging (12 × 2 000) — `GET /api/dynamic/Shesha/NotificationMessage/Crud/GetAll`.
  The API is on **its own host**; the body field is **`message`**, not `body`.
- Retry analysis done offline over the harvest: grouped by template+recipient, sorted by `creationTime`, counting
  re-sends that follow an earlier `status: 1`. No job was triggered and nothing was mutated.
- Admin views inspected by direct URL with the view mode **asserted** as Latest.
- Recipient addresses are masked in this report; none was transcribed in full.
