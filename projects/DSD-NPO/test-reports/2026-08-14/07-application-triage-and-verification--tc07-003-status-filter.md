# Report: Application Processing 07 — Backend Triage and Verification

**Date:** 2026-08-14 07:25 UTC
**Plan:** test-plans/application-processing/07-application-triage-and-verification.md
**Spec:** test-plans/application-processing/07-application-triage-and-verification.spec.ts
**Execution Mode:** ai-repair
**Result:** PASSED — TC-07-003 passes on all three assertions; the refusal path also driven end to end
**Duration:** ~420s
**Cases:** TC-07-003
**Assessed-not-executed:** TC-07-001, TC-07-002, TC-07-004, TC-07-006, TC-07-010, TC-07-013
**Environment:** QA · admin portal · view mode **Latest**
**Application under test:** APPL26-01106 (`QA Smoke NPO 2026-08-14`) — our own record

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 5 | 5 | 0 | 0 |

## Step Results

### TC-03 — Filter applications by status (ADO #101713 · TC-07-003)
**Mode:** ai-repair
**Duration:** ~180s

- [PASS] Step 1 — unfiltered grid caption records **`1-10 of 10318 items`**
- [PASS] Step 2 — applied `APPLICATION IN PROGRESS`
- [PASS] **(BLOCKING)** Step 3 — count narrows to **`1-10 of 2055 items`**
- [PASS] Step 3 — **every one of the 10 visible rows carries `APPLICATION IN PROGRESS`** (asserted per row, not just
  on the count, per the plan's note)
- [PASS] Step 4–5 — cleared the filter; caption returns to **exactly `1-10 of 10318 items`**

**Caveat on how the filter was applied.** There is **no status-specific filter control**. The two funnel icons in the
toolbar open nothing at all — clicked at their real screen coordinates, no dropdown, popover, modal or filter panel
appears. Filtering works only through the free-text **`.sha-global-table-filter`** quick-search. It produced a
correct result here, but it is a substring match across all columns rather than a status filter, so the case passes
on outcome while the prescribed control does not exist. Consistent with every other grid in this module.

## ⚠️ Yesterday's "All Applications search appears to hang" is explained — and retracted as a defect

The quick-search value **persists in `localStorage` across sessions**. On arriving at All Applications today the box
still contained **`APPL26-00817`** from yesterday's session, so the grid rendered pre-filtered with no caption. That
is exactly the symptom recorded yesterday as a possible hang. It is **stale persisted filter state, not a hang** —
clearing the box restored the full 10,318 immediately.

📌 It is still arguably a usability problem: the filter persists with no visible indication that a filter is active,
and the row-count caption disappears rather than showing a filtered count. But **the hang finding is withdrawn.**

## The refusal path, driven end to end on our own record

Recorded because it is new ground for suite 07 (previous runs only exercised the approval path):

1. `Workflows → Inbox` lists the submitted application with **Action Required = `Doc Verification`**
2. **`OB Compliance` must be actioned first** — `Verification` is disabled until it is. Submitting
   *"Are all office bearers compliant? = Yes"* enables it and disables `OB Compliance`.
3. The **Document Verification** dialog (`document-verification-copied v13` — the leftover clone again) asks:
   *Do you want to refuse/reject this application?* · *Name of the organisation verified?* ·
   *Organisation services verified?* · *The financial year end verified?* · *Directors/OBs verified?* ·
   *Additional Reasons for rejection* · *Are OBs Compliant?* (read-only, correctly carrying `Yes` through from step 2)
4. Answering **refuse/reject = Yes** reveals two conditional controls — a free-text
   **`What is the reason for application rejection?`** and an **`Additional Reasons for rejection`** Yes/No.
   `Reject` only enables once both are supplied.
5. `Reject` raises a nested `.ant-modal-confirm` — *"Reject application — Are you sure you want to reject application
   for QA Smoke NPO 2026-08-14. No/Yes"*. Actioned; `UserTaskComplete` returned 200 and the task left the inbox.
6. Result: **`APPLICATION UNSUCCESSFUL`** on admin, NPO `status: 3`, no NPO number, no registration date.

### 🔴 Finding — `Approve` stays enabled on an application marked for refusal
With *"Do you want to refuse/reject this application? = **Yes**"* **and** a rejection reason captured, **`Approve`
remains enabled** alongside `Reject`. Nothing prevents an assessor from approving an application they have just
recorded as one to refuse, with the refusal reason stored against it. `Decline` stayed disabled throughout, so the
three outcome buttons do not map cleanly onto the answers given. Worth a rule from Thabiso — this is a decision
control on a statutory process.

## Observations
1. **The submitter and the assessor see different words for the same state** — admin says
   **`APPLICATION UNSUCCESSFUL`**, the public portal says **`APPLICATION FAILED`**. Same record, same moment.
2. **`Risk Status` is still absent** from All Applications (ADO #101712) — re-confirmed.
3. **Location fields render blank on the admin application view** (Province · District Municipality · Metropolitan
   Municipality · Area Code) while the address text is present — consistent with the address blocker upstream rather
   than a separate display fault.
4. The header showed **no `NOT RECOGNISED` tag** on this application, where yesterday's carried one throughout.
   Worth knowing what triggers it.
5. **The refusal notification IS raised.** Four notifications were created on rejection at 07:21:31 —
   `Registration Application Unsuccessful` by **email to two recipients, both status 1 (Sent)** and by **SMS to two
   numbers, both status 8 (Failed)**. The SMS failures carry a real cause:
   `Vodacom SMS not enqueued: Not enough credits to send` — an environment/account issue, not a code fault. **No
   SMS-dependent case can pass on QA until that is topped up.**
   ⚠️ **Email delivery of the refusal notice is UNCONFIRMED.** The tester confirmed receiving the
   `Registration Application Acknowledgment` email raised at 07:12 to the same address with the same status, but
   whether the 07:21 `Unsuccessful` email arrived is not yet settled. **Status 1 means the app dispatched it, not
   that it was delivered** — so if it did not arrive this is a mail-relay question, not a missing-notification
   defect. Confirm before reporting either way.
6. 🔴 **The application details page has no Correspondence and no Notification-audit section**, so none of point 5 is
   visible to staff — the evidence had to come from querying `NotificationMessage` directly. The **change request**
   form has both sections plus a Re-Send action, so this is an inconsistency between forms. This is the same gap
   recorded on the voluntary-deregistration form, and it strengthens the systemic
   "produced but not surfaced" question already open with Thabiso.

## Questions for the test lead (Thabiso)
1. **Should `Approve` be available once refuse/reject is answered Yes?** And what is `Decline` for — it never
   enabled in any combination tried.
2. **Is `APPLICATION FAILED` vs `APPLICATION UNSUCCESSFUL` deliberate?** If not, which is the correct public wording?
3. **Should the application record show its correspondence?** Staff currently cannot confirm that a refusal letter
   went out, or re-send it, from the record.
