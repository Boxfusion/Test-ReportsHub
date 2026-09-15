# Report: NPO-06-F — Office Bearer Self-Confirmation (functional)

**Date:** 2026-08-25 10:40 UTC
**Plan:** test-plans/npo-registration/06-office-bearer-self-confirmation-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 3 failed, 2 partial, 1 blocked of 6. **The decline path enforces nothing and records nothing**: 'No' needs no comment, submits to a success page, and leaves the OB unchanged. The link is **not single-use**. And no application in the register ever reached 'OB Confirmed' or 'OB Partially Confirmed' despite 8 900 verified OBs.
**Duration:** ~900s
**Cases:** TC-01, TC-02, TC-03, TC-04, TC-05, TC-06
**Environment:** QA · public portal (OB links) + register queries · **view mode Latest (asserted where admin used)**
**OB used:** `b3b587d8aa13` (Grace Dube) on **`QA_Smoke_NPO_2026-08-14`** — an application we own

## Summary
| Total attempted | Passed | Failed | Partial | Blocked |
|---|---|---|---|---|
| 6 | 0 | 3 | 2 | 1 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 Decline requires a comment + flags OB | #101705 | 🔴 FAILED | 'No' needs **no comment**, submits to a **success** page, and the OB record is **unchanged** — nothing captured |
| TC-02 Link is single-use | #101706 | 🔴 FAILED | An already-confirmed link still renders the consent form; a declined link still resolves |
| TC-03 Link is time-bound | #101707 | ⛔ BLOCKED | No expired link available to test |
| TC-04 All confirm → 'OB Confirmed' (16) | #101708 | ⚠️ PARTIAL | **0** applications ever at status 16, though 8 900 OBs are verified — transition unproven |
| TC-05 Some confirm → 'OB Partially Confirm' (13) | #101709 | ⚠️ PARTIAL | **0** applications ever at status 13 |
| TC-06 Any 'No' → 'OB Confirmation Failed' (7) | #101710 | 🔴 FAILED | The status exists (603 apps) but a **reason is never captured** — the case's own requirement |

## 🔴 TC-01 — the decline path enforces and records nothing
**Mode:** ai-repair · OB `b3b587d8aa13` (Grace Dube), unconfirmed, on `QA_Smoke_NPO_2026-08-14`
- [FAIL] (blocking) **'No' requires no comment.** Selecting *"No"* revealed **no comment field** (textarea count stayed at 1, the same generic one present for 'Yes'), added **no required marker**, and left **Submit enabled**
- [FAIL] **Submitting with an empty comment succeeded** — redirected to `ob-self-verification-thank-you?isSuccess=true`, the same success page a valid 'Yes' produces
- [FAIL] **Nothing was recorded.** Reading the OB back immediately after:
  ```
  isVerified: false   isVerifiedComment: null   idVerificationFailureReason: null   isIdVerified: false
  ```
  The decline is neither flagged ("Not part of NPO"), nor given a reason, nor counted. The OB looks exactly as it did
  before — but the office bearer was told "Thank You".
- 🔑 **This is worse than a missing validation.** A missing comment field is a gap; a decline that shows success while
  persisting nothing means an OB who says *"I am not part of this organisation"* is silently ignored, and the
  application proceeds as if they never objected.
- 📌 **Disclosure:** I intended to stop if a validation error appeared. None did, so the empty submit completed and
  this is a real state change on `QA_Smoke_NPO_2026-08-14` (ours). The absence of enforcement is the finding.

## 🔴 TC-02 — the link is not single-use
**Mode:** ai-repair
- [FAIL] (blocking) Re-opening an **already-confirmed** link (`eba499877cad`, confirmed 'Yes' earlier today) **still
  renders the full consent form** — *"Do you consent to being an Office Bearer at the Nomfanelo QA NPO 2026-08-13?
  Yes / No / Submit"*. No "already used" message
- [FAIL] The **declined** link (`b3b587d8aa13`) still resolves after submission —
  `GetOfficeBearerIdBySubstringId` returns its id with `success: true`
- 🔑 The API resolver *does* block a re-verified 'Yes' link with *"Office bearer has already verified themselves"*,
  but **the page never calls that gate before rendering** — so a holder of the link can re-open and re-submit. The
  single-use control exists at one layer and is not enforced at the layer that matters

## ⛔ TC-03 — time-bound link — BLOCKED
No expired OB link was available. The confirmation links harvested from the store are all recent and still resolve;
manufacturing an expired one needs either clock control or a link deliberately aged past the (unknown) expiry window.
📌 Worth pairing with TC-06-005's sibling question — the OB reminder emails have been re-firing daily for a link that
never expires (`bugs/2026-08-24-ob-reminder-link-host-does-not-resolve.md`), which already hints the links are **not**
time-bound. Recorded as a lead, not a verdict.

## ⚠️ TC-04 / TC-05 — the positive application-level transitions are unproven
**Mode:** ai-repair · `NpoApplication.applicationStatus` distribution across ~10 300 applications
- [FAIL evidence] **0 applications at status 16 (OB Confirmed)** and **0 at status 13 (OB Partially Confirm)**
- [PASS evidence] But OB-level confirmation clearly works: **8 900 OBs have `isVerified = true`** (8 974 false)
- ⚠️ **Verdicted PARTIAL, not FAILED, deliberately.** Status 16 "triggers the next workflow step" per the ADO case, so
  it may be **transient** — an application could pass through 16 and land on a later status, leaving 0 sitting *at* 16.
  I cannot distinguish "never fires" from "fires and moves on" without completing a live all-OB-confirm cycle on an
  application we own and watching the status in real time
- 🔑 **The asymmetry is the concern worth raising:** the *failure* status (7) is well-populated (603) and persists,
  while both *success* statuses (13, 16) are empty. Whether that is by design (transient) or a broken positive
  transition is the open question — and it is answerable with one controlled registration

## 🔴 TC-06 — 'OB Confirmation Failed' exists, but no reason is captured
**Mode:** ai-repair
- [PASS] The status is reachable — **603 applications at status 7 (OB Confirmation Failed)**, so the negative
  aggregate transition fires in the data
- [FAIL] (blocking) **The reason is never captured.** The ADO expected result requires *"reason captured; application
  flagged for resubmission"*. TC-01 showed the decline persists **no reason at all** (`isVerifiedComment` and
  `idVerificationFailureReason` both null), so a status-7 application cannot carry the reason the case demands
- ⚠️ My own decline did not visibly move `QA_Smoke_NPO_2026-08-14`'s status within the observation window — consistent
  with TC-01's finding that the decline persisted nothing. The 603 pre-existing status-7 applications got there by
  some path, but not one that records a reason

## What this suite establishes
The OB self-confirmation **thank-you page** works (proven as TC-14T-006). Everything *around* it is weak: the decline
is unenforced and unrecorded, the link is replayable, and the positive application-level rollup is unproven while the
negative one loses its reason. The one clean way to settle TC-04/05/06 is a **single controlled registration** where
we own every OB and confirm/decline them deliberately — that also needs the `Register NPO` flow the new applicant
accounts can now drive.

## Method
- OB links harvested from the notification store; verification state read via
  `NpoOfficeBearers/GetOfficeBearerIdBySubstringId` and `NpoOfficeBearer/Crud/Get`.
- Application-status distribution counted with per-status `filter` queries on `NpoApplication`.
- One decline was submitted on an OB of an application **we own**; its effect (or absence) is reported above. No third
  party's OB was touched.
