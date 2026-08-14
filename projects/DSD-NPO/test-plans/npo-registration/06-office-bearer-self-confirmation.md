# Test Plan: NPO-06 — Office Bearer Self-Confirmation (smoke)

> **Status:** Imported from Azure DevOps — ⛔ **blocked**, not yet executable
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App URL | Tokenised email/SMS link — **no login** |
| Environment | QA |
| Login As | n/a — this flow is deliberately unauthenticated |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101863) |
| ADO Suite | 101863 — *06 - Office Bearer Self-Confirmation* (2 cases) |

## Objective
> Verify that each office bearer named on a submitted application receives a self-confirmation notification, and that following its tokenised link lets them confirm membership of the NPO without signing in.

## ⛔ Blocked — twice over
1. **No submitted application exists.** The notifications in this flow are triggered by TC-05-016 (Submit), which is blocked by the address autocomplete defect.
2. **No checkable mailbox is agreed.** Both cases are *"check the OB inbox"* cases. Without real mailboxes for the OB addresses, neither can be executed at all.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO cases; both state `Design`.

**Portal: `Email-Link`.** This is the only suite in the smoke plan that runs entirely **outside both portals**, on a tokenised link with no authentication — which makes it the most security-interesting flow in the set. See the questions below.

## Preconditions
- [ ] An application has been submitted (plan NPO-05, TC-05)
- [ ] Every OB on it has a valid email address and phone number
- [ ] QA has access to the OB mailboxes — **not yet arranged**
- [ ] Use `0818400598` for at least one OB so the SMS leg can be checked on the handset

## Test Cases

### TC-01 — Each OB receives a self-confirmation email/SMS with a confirm link (ADO #101703 · TC-06-001)

*Priority 1 · Positive · Email-Link.*

- **Type:** Notification
- **Steps:**
  1. Submit an application naming at least 3 office bearers (the statutory minimum — see NPO-04 TC-03)
  2. Check **each** OB's inbox and SMS
  3. ASSERT (BLOCKING) every OB receives a notification containing a link to self-confirm membership of the NPO
  4. EXTRACT each tokenised link — TC-02 needs them
- **Expected result:** *"Each OB receives a notification with link to self-confirm membership in the NPO"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) every named OB receives a notification
  - [ ] ASSERT each notification carries a self-confirmation link
  - [ ] ASSERT the SMS leg arrives as well as the email
- **📌** The count matters: assert **one notification per OB**, not merely that at least one arrived.

---

### TC-02 — OB confirms 'Yes, I belong to this NPO' and the status updates (ADO #101704 · TC-06-002)

*Priority 1 · Positive · Email-Link. Depends on TC-01.*

- **Type:** Happy path
- **Steps:**
  1. Open an OB's tokenised link **in a clean, signed-out browser context** — the flow must not depend on a session
  2. SNAPSHOT
  3. CLICK the confirmation — *"Yes I am part of this organisation"*
  4. ASSERT (BLOCKING) the self-confirmation is recorded
  5. ASSERT the thank-you screen is shown *(FDS Fig.14)*
  6. Cross-check on the admin portal that the OB's confirmation status has changed
- **Expected result:** *"OB self-confirmation recorded; thank-you screen shown (FDS Fig.14)"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the confirmation is recorded against the right OB
  - [ ] ASSERT the thank-you screen is displayed
  - [ ] ASSERT the change is visible to DSD staff on the admin side
- **📌 Use a fresh browser context.** If this works only while a session exists, that is itself a finding — the case's whole premise is that an OB who has no portal account can confirm.

---

## ❓ Questions for Thabiso — this flow needs rules before it can be tested properly

The smoke suite covers only the happy path, and the Functional plan's suite 101889 has just 6 cases. For an unauthenticated, token-addressed flow that mutates application state, these are worth settling early:

1. **Can an OB decline?** Both cases only cover *"Yes"*. What is the negative path, and what does it do to the application?
2. **Is the token single-use, and does it expire?** Nothing in either plan tests replay or expiry.
3. **What stops the submitter confirming on the OBs' behalf** by opening all three links themselves? As specified, nothing does — and the confirmation is the control that proves the named people really are office bearers.
4. Which mailboxes should QA use?

These are **questions, not defects** — none has been observed, because the flow is unreachable.

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101703 | TC-06-001 | ⛔ blocked · needs a submitted application **and** mailboxes |
| TC-02 | #101704 | TC-06-002 | ⛔ blocked on TC-01 |

**Not in this plan** (Functional suite 101889, 6 cases, to import later): TC-06-003 → 008.
