# Report: NPO-14T-F — TC-14T-011 re-verified on a second change type, and its blocked UI cross-check is closed out

**Date:** 2026-08-27 08:40 UTC
**Plan:** test-plans/cross-cutting/14t-notification-templates-functional.md
**Execution Mode:** ai-repair
**Result:** PASSED — TC-14T-011 **was already PASS from 2026-08-24**; this run re-verifies it independently on a **different change type** (*General Change*, vs Foundational) and on a **record we submitted ourselves**, and every prescribed field is present again. **The substantive outcome is that the sub-assertion left BLOCKED on 08-25 — the UI Correspondence cross-check — is now closed:** proven from the form configuration that `change-request-details` has **never** had a Correspondence, notification-audit or Re-Send section, in any of its 24 versions. That retires the blocker rather than leaving it open. **No coverage change** — the case was already counted.
**Duration:** ~700s
**Cases:** TC-11
**Environment:** QA · admin portal · view mode Latest · notification `f17f06c1-…` (`partOf` = **ChangeRequest Acknowledgement Info**) against our own `POST1424/21/08/2026` on our own `333-022-NPO`
**Accounts used:** `mpenduloizwelinuk@gmail.com`

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 1 | 1 | 0 | 0 | 0 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-11 Change Request Acknowledgement, Submitted | #101838 | ✅ PASSED | Re-verified on *General Change*; the 08-25 BLOCKED UI cross-check is now **resolved, not blocked** |

## ⚠️ Correcting the reason this run was started

I picked this case up believing it was **BLOCKED and unverdicted**. It was not.

| Date | What was actually recorded |
|---|---|
| 08-24 | **✅ PASS** — *"PDF names the change type ('Foundational Change') and the submission date"*, with the note *"UI cross-check still not performed"* |
| 08-25 | The **UI Correspondence cross-check** alone recorded ⛔ BLOCKED — *"the form has no Correspondence section and every notification screen 400s"* |

So the **case** has been passing since 08-24; only a sub-assertion was outstanding. My gap analysis read the word
`BLOCKED` out of the **plan heading** rather than out of a report, which is why I mis-scoped it — and it is also why
the alias-fixed coverage script already showed suite 14T at 22 verdicted / 0 excluded. **This run adds no coverage.**
Corrected in `observations/`, the register and the resume note.

What it does add is below, and the blocker close-out is worth having on its own.

## Test Cases

### TC-11 — Change Request Acknowledgement, Submitted (ADO #101838 · TC-14T-011) — PASSED

**Value of the re-run:** the 08-24 pass was read off a **Foundational Change** on another tester's record. This one
is a **General Change** on a record we created and submitted ourselves, so the template is now confirmed to resolve
its merge fields correctly for a second change type and a second NPO.

#### The trigger demonstrably fired
| Field | Value |
|---|---|
| `id` | `f17f06c1-c63a-4576-aa51-d2146a0bafc4` |
| `partOf` | **ChangeRequest Acknowledgement Info** ← identifies the template |
| `subject` | `Email Post Registration` |
| `channel` | Email |
| `recipientText` | `mpendulosobethu@gmail.com` |
| `creationTime` | 2026-08-27T08:02:28.470 |
| 1 attachment | `AcknowledgementLetter.pdf` (StoredFile `cf22ad3c-…`, 106 181 bytes) |

#### ✅ Body confirms receipt and references the change type and the submission date: **PASSES**

The **email body is a covering note only** — it names the NPO and says a document is attached:

> Dear Sir/Madam  Kindly find the attached document/s for your attention regarding *Nomfanelo QA Unfinished NPO
> 2026-08-20*.  The attached document confirms acknowledgement of your change request submission. …

The prescribed content is in the **attached PDF**, extracted and read in full:

| ADO requires | Present in the letter |
|---|---|
| confirms receipt | **"ACKNOWLEDGEMENT OF GENERAL CHANGE REQUEST IN TERMS OF NONPROFIT ORGANISATIONS ACT, 1997 (ACT 71 OF 1997)"** |
| reference to the **change type** | **"Your request for General Change has been received on: …"** — and again in the heading |
| reference to the **submission date** | **"…has been received on: 27/08/2026"** |
| *(also present)* | Reference Number **POST1424/21/08/2026**; addressee resolved to **The Chairperson / Ryno Koen**; the NPO's physical address; DSD contact block; `DATE : 27/08/2026` |

🔑 Confirms the 08-24 finding for TC-01/TC-02: judging these templates on the email body alone produces a false
FAIL. **The PDF is the deliverable.**

🔑 **The date in the letter is the true submit date (27/08/2026), not the stale stored `submissionDate` (21/08).**
This refines the observation recorded earlier today — the *entity field* is stamped at creation, but the letter is
generated from the actual event, so the applicant is told the correct date. Anything reading `submissionDate` off the
record is still wrong; the letter is not.

#### ✅ No unresolved placeholders: **PASSES**
Searched the email body and the full extracted PDF text for `{{`, `}}`, `#NULL#`, `[object Object]` and bare field
names, per the plan's placeholder signature. **None present** — every merge field resolved, including the office
bearer's name and position and the NPO's address.

#### ✅ `status` is tracked: **PASSES**
| Field | Value |
|---|---|
| `status` | **1 (Sent)** |
| `dateSent` | 2026-08-27T08:02:30.907 — 2.4s after creation |
| `errorMessage` | null |
| `retryCount` | 0 |

Satisfies *"Delivery is tracked successfully"*. Arrival is out of scope for this suite.

## ✅ The 08-25 BLOCKED cross-check is now RESOLVED — the section does not exist

On 08-25 this was left blocked on two premises: the Correspondence section appeared absent, and every notification
audit screen 400s. The first premise is now settled definitively — and it is stronger than "absent today":

1. **On screen** — `change-request-details` v25 renders `Change Details · Declarations · Office Bearer Change ·
   Documents · Notes`. Nothing else.
2. **In the form configuration** — v25's markup (48 532 chars, the LIVE version; all **24** versions enumerated)
   contains **zero** occurrences of `Correspondence`, `NotificationMessage`, `Re-Send`, `ReSend` or `resend`.

So it is not a rendering fault, not a permissions fault and not a regression: **this form has never had that
section.** The 08-25 caveat about `Live Mode` view mode is therefore irrelevant to the outcome.

**Consequence:** the plan's 🔑 note on TC-11 — *"This form has both a Correspondence section and Re-Send, the one
place the UI can corroborate"* — is **factually wrong** and is corrected in the plan. It was written at import time
on 08-24 while the plan was still marked *"not yet executed"*.

🔑 **This does not weaken the verdict.** ADO #101838's expected result is *"Email confirms receipt; reference to the
change type and submission date"* and *"Delivery is tracked successfully"* — it says nothing about a Correspondence
section. That step was the plan author's scaffold, not the test lead's requirement. Per the project rule that
business rules come from the ADO case, the case passes and the plan gets fixed.

**What the UI *does* corroborate:** the record exposes the letter at **Documents → Acknowledgement Letter →
`AcknowledgementLetter.pdf (106.18 kB)`**, matching the store's attachment exactly, and the header reads
`COMPLETED` / `APPROVED` — which independently corroborates the NPO-10-F TC-04 result.

## Observation — two different enquiry addresses in one dispatch

| Where | Address |
|---|---|
| Covering **email** footer | `NPOEnquiry@socdev.gov.za` |
| Attached **PDF** letter | `npoenquiry@dsd.gov.za` |

The same notification gives the applicant two different addresses. Not part of TC-14T-011's prescribed field list,
so **not raised as a defect and not counted against the verdict** — but this suite is specifically about template
content, so it is recorded for the test lead in `observations/2026-08-27-report-notes-and-questions.md`. The PDF also
cites `www.npo.gov.za`.

## Suite 14T standing
All 22 cases carry a real verdict; 21 of the 22 are content verdicts and TC-06 remains the one not executed.
**TC-14T-012** (CR Approved + conditional documents) is the best next target — today's run produced
`ApprovalLetter.pdf` and an `Email Approved Change Request` on our own record, so it can now get the same
PDF-content treatment on a change type we control.

## Method note
The PDF was extracted by pulling the `StoredFile` via `/api/StoredFile/Download?id=<fileId>`, then inflating its
`FlateDecode` streams and reading the `Tj`/`TJ` text operands in order (6 of 8 streams compressed). Script kept in
the session scratchpad — worth promoting to `scripts/` if more 14T PDF cases are run.
