# Test Plan: NPO-14N-F — Notifications & delivery status (functional)

> **Status:** Imported from Azure DevOps 2026-08-25
> **Owner:** QA
> **Last Updated:** 2026-08-25
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101903) |
| ADO Suite | 101903 — *14N - Notifications & delivery* (3 cases) |

## Objective
> Verify that delivery outcomes are tracked per recipient and surfaced to admin: that a bounce or invalid address is
> visible, that the retry job re-sends only to recipients who have not succeeded, and that the per-OB delivery status
> is displayed on the admin view.

## Provenance
Imported from the ADO functional plan on 2026-08-25 via the browser + REST route. Expected results quoted verbatim.
Raw pull retained at `test-data/ado-functional-101543/ado-suite-101903.json`. **All 3 cases carry `Drift-Risk`** and
all three are `Src:Code` — i.e. the expected behaviour was read off the implementation, not a spec.

## Preconditions
- [ ] Admin portal sign-in
- [ ] 🔑 View mode **Live → Latest**, asserted not assumed
- [ ] The notification store is readable — `GET /api/dynamic/Shesha/NotificationMessage/Crud/GetAll` (paged; the API
      is on its **own host** and the body field is `message`, not `body`)

## ⚠️ Read before verdicting — the vocabulary in the cases may not exist
The cases name **five** delivery states from `RefListDeliveryStatus.cs:9` — `AwaitingToBeSent | Sent |
DeliveryConfirmed | DeliveryRetry | DeliveryFailed`. Check which of those the data actually uses before asserting
against them; a case that assumes `DeliveryConfirmed` exists is unverifiable if nothing is ever written to it.

## Test Cases

### TC-01 — Bounced or invalid address surfaces to admin (ADO #101813 · TC-14-001)

*Priority 2 · Edge · `Src:Code` · `Drift-Risk` · Admin.*

- **Steps (ADO):** 1. Submit application; mail server returns bounce
- **Expected result (ADO):** *"Admin sees a 'notification delivery failed' indicator on application
  (RefListDeliveryStatus reflects)"*
- **Assertions:**
  - [ ] (BLOCKING) ASSERT an admin-visible indicator exists for a failed delivery
  - [ ] ASSERT the stored delivery status reflects the failure
  - [ ] RECORD what happens to a **syntactically invalid** recipient — an address that cannot resolve is the cheapest
        available proxy for a bounce, since we cannot make a real mail server bounce on demand
- **📌** Genuine bounce handling needs an inbound bounce, which QA cannot produce. Say so, and verdict on the
  observable half: does an undeliverable address end up marked failed, or marked sent?

---

### TC-02 — Retry re-sends only to recipients without success (ADO #101825 · TC-14-013)

*Priority 2 · Edge · `Src:Code` · `Drift-Risk` · Admin.*

- **Steps (ADO):** 1. Wait for retry job / trigger manually
- **Expected result (ADO):** *"Persons with DeliveryFailed/AwaitingToBeSent get a fresh send; persons with
  DeliveryConfirmed do not get duplicates"*
- **Assertions:**
  - [ ] ASSERT failed/pending recipients are re-sent
  - [ ] (BLOCKING) ASSERT recipients who already succeeded receive **no duplicate**
  - [ ] RECORD whether retries are capped
- **🔑 This is observable historically without triggering anything.** Group the store by
  *template + recipient*, order by time, and count re-sends that follow an earlier success. The daily OB
  Acknowledgement Reminder is the clearest natural experiment already running.
- **📌** Relates to `bugs/2026-08-24-ob-reminder-link-host-does-not-resolve.md`, which recommended a retry cap.

---

### TC-03 — Per-OB delivery status on the admin view (ADO #101827 · TC-14-015)

*Priority 2 · Positive · `Src:Code` · `Drift-Risk` · Admin.*

- **Steps (ADO):** 1. Open application detail or OB detail
- **Expected result (ADO):** *"Per OB: shows DeliveryStatus = AwaitingToBeSent | Sent | DeliveryConfirmed |
  DeliveryRetry | DeliveryFailed (RefListDeliveryStatus.cs:9)"*
- **Assertions:**
  - [ ] (BLOCKING) ASSERT a delivery status is shown **per office bearer**
  - [ ] RECORD which of the five values the UI can actually render
- **📌** Check the applications grid, the application detail view **and** the office-bearer grids. Use the form
  registry to enumerate candidate routes rather than guessing URLs.
- **⚠️** As of 2026-08-25 every notification screen in the `Shesha` module returns 400
  (`bugs/2026-08-25-notification-audit-screens-all-fail-on-stale-fields.md`), so if this case fails, distinguish
  "no such feature" from "the feature's screen is broken".

## Coverage against ADO
| Plan TC | ADO id | ADO TC | Drift-Risk | Runnable |
|---|---|---|---|---|
| TC-01 | #101813 | TC-14-001 | ⚠️ yes | ✅ observable half |
| TC-02 | #101825 | TC-14-013 | ⚠️ yes | ✅ from the store, historically |
| TC-03 | #101827 | TC-14-015 | ⚠️ yes | ✅ UI inspection |
