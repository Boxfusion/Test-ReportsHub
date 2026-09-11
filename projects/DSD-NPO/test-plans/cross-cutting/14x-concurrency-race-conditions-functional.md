# Test Plan: NPO-14X-F — Concurrency & race conditions (functional)

> **Status:** Imported from Azure DevOps 2026-08-25
> **Owner:** QA
> **Last Updated:** 2026-08-25
> **Estimated Duration:** 480s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe (admin) + the two QA applicant accounts A/B |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101908) |
| ADO Suite | 101908 — *14X - Concurrency & race conditions* (8 cases) |

## Objective
> Verify that when two actors reach the same decision point at the same instant, the system records exactly one
> transition — no double-processing, no orphan records, no lost update — and that the loser is told why.

## Provenance
Imported from the ADO functional plan on 2026-08-25; raw pull at `test-data/ado-functional-101543/ado-suite-101908.json`.
Expected results quoted verbatim. **All 8 cases are `Src:Code` and `Drift-Risk`** — the expected behaviour was read off
the implementation (with code anchors like `PersonIdVerifier.cs:48-49`, `ApplicationManager.cs:278-283`), not a spec.

## ⚠️ Scope boundary — read before verdicting, this suite is mostly not black-box observable
Every case here is a **backend concurrency guard**. A black-box tester can reach only a few of them, and only by
proxy. Be honest about which:
- **Genuinely runnable** with the resources we have: **TC-14X-003** (two owned accounts A + B link the same NPO). This
  is the one real concurrency test in the suite for us.
- **Runnable by proxy** (two browser tabs on the *same* admin login, fired close together): **TC-14X-001, 002, 005,
  006** — this tests the optimistic-concurrency / stale-state guard, which is the observable half. It is **not** a true
  two-*identity* race, and the report must say so.
- **NOT black-box testable** — pure backend timing with no UI trigger we can align: **TC-14X-004** (PersonIdVerifier
  lock), **TC-14X-008** (BackgroundJob vs in-flight transaction). These need a code/integration harness. Name them
  NOT EXECUTED; do not simulate.
- **Feature-dependent:** **TC-14X-007** (bulk reallocation Excel upload) is runnable only if the bulk-upload screen
  exists and accepts a crafted file. Check the form registry first.
- 🔑 **Never fire a destructive double-write to "win" a race on shared QA.** Where the loser's branch would mutate or
  orphan a real record, establish the guard's *presence* (the second actor gets a stale-state error / 409 / disabled
  control) and stop. Do not push both writes through to see what breaks.

## Preconditions
- [ ] Admin portal sign-in; ability to open two tabs / two fetch contexts
- [ ] 🔑 View mode **Live → Latest**, asserted via the toggler menu (`ant-dropdown-menu-item-selected`)
- [ ] Accounts A (`npo.qa.applicant.a@example.org`) and B (`npo.qa.applicant.b@example.org`), both authenticating —
      confirmed 2026-08-25. `TokenAuth/Authenticate` needs header `sha-frontend-application: public-portal`.
- [ ] A known NPO number that neither A nor B is yet linked to, for the TC-003 link race

## Test Cases

### TC-01 — Two admins act on the same Document Verification dialog (ADO #101850 · TC-14X-001)

*Priority 2 · Edge · `Src:Code` · `Drift-Risk` · Admin.*

- **Steps (ADO):** 1. Set up two concurrent actors with their own sessions · 2. Trigger both actions within a small
  window (two tabs) · 3. Verify final DB state: only one transition recorded
- **Expected result (ADO):** *"Admin1 submits 'all docs valid'; before Admin2 submits, Admin2 should see a stale-state
  error OR the second submission is rejected with 409. The application status changes once, not twice."* · *"No
  double-transition; no orphan records"*
- **Assertions:**
  - [ ] ASSERT the second submit is refused (stale-state error / 409 / the control disables) rather than silently
        applying a second transition
  - [ ] RECORD the actual mechanism observed (which of the three)
  - [ ] ⚠️ Two tabs on the **same** admin login is the available proxy — it tests the concurrency guard, not two
        distinct identities. Say so.

---

### TC-02 — Submitter resubmits while admin is making a decision (ADO #101851 · TC-14X-002)

*Priority 2 · Edge · `Src:Code` · `Drift-Risk` · Admin.*

- **Expected result (ADO):** *"If submitter submits first, admin's decision attempt detects the resubmission and
  refuses to overwrite. No data loss."*
- **Assertions:**
  - [ ] ASSERT the admin's decision is refused / warned when the submitter's resubmission landed first
  - [ ] RECORD whether any data is lost or overwritten
  - [ ] 📌 Needs a submitter-owned application in a decidable state + an admin on the same application. Blocked unless
        such a pairing can be constructed without a full fresh registration.

---

### TC-03 — Two users try to Link the same NPO simultaneously (ADO #101852 · TC-14X-003)

*Priority 2 · Edge · `Src:Code` · `Drift-Risk` · Both portals.* **← the one real, runnable concurrency test for us.**

- **Expected result (ADO):** *"Only one user becomes Authorised Admin; the other sees an 'already linked' message."*
- **Assertions:**
  - [ ] (BLOCKING) Fire A's Link and B's Link at the **same NPO number** as close to simultaneously as two fetch
        contexts allow
  - [ ] ASSERT exactly **one** succeeds and becomes Authorised Admin
  - [ ] ASSERT the other gets an **"already linked"** style refusal — not a second success, not a silent 500
  - [ ] RECORD what the loser actually sees
  - [ ] ⚠️ Linking asserts ownership of a real NPO. Use an NPO number we are entitled to test with, or one already
        associated with our test data — do **not** hijack a stranger's organisation. If no safe NPO is available,
        record the harness is ready and the case is blocked on a test NPO, rather than linking something we shouldn't.

---

### TC-04 — PersonIdVerifier concurrency lock holds under simultaneous trigger (ADO #101853 · TC-14X-004)

*Priority 2 · Edge · `Src:Code` · `Drift-Risk` · Both portals.*

- **Expected result (ADO):** *"Only one PersonIdVerifier processes; the other logs 'already processing' and skips
  (PersonIdVerifier.cs:48-49). Verify no double DHA call for any single OB."*
- **Assertions:**
  - [ ] **NOT EXECUTED** — the lock is internal, keyed on a backend verifier with no UI trigger we can align to the
        millisecond, and "no double DHA call" is only visible in logs/integration we do not have
  - [ ] Name it and hand to Thabiso as a code/integration-test item

---

### TC-05 — Two admins assign different investigators to the same case (ADO #101854 · TC-14X-005)

*Priority 2 · Edge · `Src:Code` · `Drift-Risk` · Admin.*

- **Expected result (ADO):** *"First assignment wins; second admin sees stale state and is refused with a clear message."*
- **Assertions:**
  - [ ] ASSERT the second assignment is refused with a clear message
  - [ ] 📌 Needs an investigation case in an assignable state; runnable by proxy via two tabs if such a case exists

---

### TC-06 — OB confirmation race vs an unrelated admin update (ADO #101855 · TC-14X-006)

*Priority 2 · Edge · `Src:Code` · `Drift-Risk` · Admin.*

- **Expected result (ADO):** *"OB confirmation succeeds independently; admin's update does not erase the OB confirmation status."*
- **Assertions:**
  - [ ] ASSERT the OB confirmation and the admin update do not clobber each other
  - [ ] 📌 Needs a pending OB confirmation link + an admin editing the same application. Blocked unless such a pairing
        can be built

---

### TC-07 — Bulk reallocation Excel upload: duplicate NPO rows handled gracefully (ADO #101856 · TC-14X-007)

*Priority 2 · Edge · `Src:Code` · `Drift-Risk` · Both portals.*

- **Expected result (ADO):** *"Second occurrence either ignored, deduped, or processed idempotently. No partial-failure
  crash; result report lists each row's outcome."*
- **Assertions:**
  - [ ] Check the **form registry** for a bulk-reallocation upload screen before concluding it is absent
  - [ ] If present, upload a file with a deliberately **duplicated** NPO row and ASSERT no crash + a per-row outcome report
  - [ ] If absent, record NOT EXECUTED with the registry evidence
  - [ ] ⚠️ Reallocation mutates ownership across NPOs — only run against test NPOs, never live seed data

---

### TC-08 — BackgroundJob runs while a transaction is in flight (ADO #101857 · TC-14X-008)

*Priority 2 · Edge · `Src:Code` · `Drift-Risk` · Both portals.*

- **Expected result (ADO):** *"Certificate generation reads NpoNumber via projection query (cache-bypass workaround at
  ApplicationManager.cs:278-283). Certificate PDF shows the freshly-issued NpoNumber, not a stale value."*
- **Assertions:**
  - [ ] **NOT EXECUTED** — a background-job-vs-transaction timing race with no client-alignable trigger; the assertion
        is about a cache-bypass in certificate generation, verifiable only by inspecting a freshly issued certificate
        against a job that we cannot deterministically interleave from the UI
  - [ ] Hand to Thabiso as a code/integration-test item

## Open questions for Thabiso
- Can you provide a **test NPO number** that A and B are entitled to link, so TC-003 can be run without touching a real
  organisation?
- **004 and 008** are backend timing guards with code anchors — should these live in a unit/integration suite rather
  than a black-box plan? A UI tester cannot align them.
- Does a **bulk reallocation upload** screen exist, and where? (TC-007)
