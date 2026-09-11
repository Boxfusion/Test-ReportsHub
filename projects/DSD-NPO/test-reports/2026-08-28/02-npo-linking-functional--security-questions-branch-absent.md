# Report: NPO-02-F — Link to Existing NPO — the security-questions branch does not exist; linking is unconditional

**Date:** 2026-08-28 08:45 UTC
**Plan:** test-plans/npo-registration/02-npo-linking-and-landing-functional.md
**Execution Mode:** ai-mcp
**Result:** FAILED — the three link-flow cases deferred since 2026-08-18 (they needed an NPO we are **not** linked to, with mismatched legacy details) were approached with explicit one-time authorisation to use a not-owned NPO as the *lookup input only*. **TC-02-003 FAILS: there is no security-questions branch.** The *Link to an Existing NPO* flow, given any registered NPO number the account is not associated with, goes straight to a **"Confirm Link to NPO"** step with **no identity challenge** — whether the NPO's authorized-person details are blank or fully populated. TC-02-004 and TC-02-005 describe outcomes of answering security questions that the build never asks, so they are **not executable as written**. A security concern (unverified linking + authorized-person PII disclosure) is routed to the test lead — details deliberately withheld from this report.
**Duration:** ~600s
**Cases:** TC-02-003 (#101830) FAILED · TC-02-004 (#101831) / TC-02-005 (#101832) not executable as written
**Environment:** QA · public portal · view mode Latest
**Accounts used:** shared dev account (as the linking party)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 3 | 0 | 1 | 0 | 2 |

Coverage: **219 → 220** (TC-02-003 newly verdicted). 004/005 recorded as not-executable-as-written.

---

### 🔴 TC-02-003 — Mismatch should trigger security questions (#101830) — FAILED

The case (and the 08-18 deferral) assumes: linking an NPO whose legacy details differ from the requester triggers a
**security-questions challenge** before the link completes. **That branch does not exist.**

Tested with two registered NPOs the account is not associated with — one with **blank** authorized-person details,
one with **fully populated** authorized-person details:

| Lookup input | What the flow did |
|---|---|
| Legacy NPO, **blank** authorized-person info | Message: *"authorized person info is blank, but you can proceed with linking."* → **Confirm Link to NPO** offered directly. No questions. |
| Legacy NPO, **populated** authorized-person info (name, cell, gov email) | The details were **displayed back**, then **Confirm Link to NPO** offered directly. **No security questions, no OTP, no verification of any kind.** |

- **[FAIL] (BLOCKING)** No security-questions step appears on a mismatch — in either data condition. The expected
  challenge is simply absent; the flow is *lookup → confirm → linked*, unconditionally.
- **The link was NOT completed** in either case. Confirming would associate the shared account with a third-party
  NPO (a hijack + a mutation on a record we do not own), which is out of bounds even under the one-time
  use-not-ours authorisation — that authorisation covered using the NPO as a **lookup input**, not taking it over.

### ⚪ TC-02-004 — Security match → linked as Authorised Admin (#101831) — NOT EXECUTABLE AS WRITTEN
The case's step 1 is *"answer security questions correctly."* There are no security questions, so the "match" path
it describes does not exist in the build. It cannot be executed as written, and confirming the (unconditional) link
to observe the resulting role would hijack a non-owned NPO. Recorded as not-executable rather than guessed.

### ⚪ TC-02-005 — Security mismatch → cancel / Change Request (#101832) — NOT EXECUTABLE AS WRITTEN
Same reason — the "mismatch answer" branch does not exist. The flow offers no cancel-vs-proceed decision gated on a
security answer; it only offers Confirm Link.

---

## 🔴 Security concern — routed to the test lead, NOT for the daily report

The Link-to-Existing-NPO flow, for **any** registered NPO number, to **any** authenticated user who is not
associated with that NPO:

1. **Displays the NPO's authorized-person details** (name, cell number, email) back to the requester — for a
   populated legacy NPO this is a real person's contact data, including a government email address. **The specific
   values are deliberately not recorded here** (POPIA — see the working rule on never transcribing real personal
   identifiers). The mechanism is the finding, not the individual.
2. Offers an immediate **Confirm Link to NPO** with **no verification** — no security questions, no OTP to the
   authorized person, no admin approval. So any account could link (take control of) any NPO by number.

This is both an **authorisation defect** (unverified linking / account takeover vector) and a **POPIA disclosure**
(authorized-person PII shown to an unauthorised party). It sits alongside the standing unauthenticated-API findings.
**A bug file is raised describing the class of exposure without any real identifiers**:
`bugs/2026-08-28-npo-linking-has-no-identity-verification-and-discloses-authorized-person-details.md`.

## Method notes
- Only two lookups were performed; **no link was confirmed**, so no association was created on any NPO.
- No real person's name, cell, or email is stored in this report, the bug, or any artefact.
- NPO numbers were resolved from their exact `npoNumber` string (the field uses a space before "NPO", e.g.
  `NNN-NNN NPO`); a hyphenated guess returned "Not Found!" (the same dead-end noted for TC-02-006).

## ❓ Question for Thabiso
Was a security-questions / identity-verification step intended on *Link to an Existing NPO*? As built there is none,
and the flow both discloses authorized-person contact details and permits an unverified link — #101830/101831/101832
either need a rewrite (if verification was descoped) or the flow needs the verification added.
