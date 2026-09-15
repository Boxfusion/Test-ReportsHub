# Bug: "Link to an Existing NPO" offers to link legacy NPOs with no authorisation check

**Date:** 2026-08-13
**Severity:** High (security / authorisation)
**Status:** Open — **needs developer confirmation; the final step was deliberately not executed**
**Portal:** Public
**Found in:** NPO-02 TC-02-002 (ADO #101617)
**Page:** `/dynamic/boxfusion.dsdnpo/no-existing-npo-landing-page` → *Link to an Existing NPO*
(`boxfusion.dsdnpo/dsd-link-existing-npo v13`)

## Summary
A signed-in user can search **any** NPO by number and is invited to link it to their own account. Where the
legacy record has **no authorised-person details** — which appears common for migrated NPOs — the app **says so
explicitly and offers to proceed anyway**.

## Steps to reproduce
1. Sign in to the public portal as any user
2. Go to `/dynamic/boxfusion.dsdnpo/no-existing-npo-landing-page`
3. Click **Link to an Existing NPO**
4. Enter a legacy NPO number you have no relationship with — e.g. **`000-333 NPO`**
5. Click the **magnifier** search button

## Actual
The modal returns:

> *"Npo number found please confirm details below and click "Confirm Link to NPO" button to complete the linking
> process"*
>
> **Npo Number:** `000-333 NPO`
> **Name:** `The Southern Africa Portuguese Fund Raising Association`
> **"Please note that authorized person info is blank, but you can proceed with linking."**
> Authorized Person Name: *(blank)* · Cell: *(blank)* · Email: *(blank)*
>
> **[ Confirm Link to NPO ]**

## Expected
Linking should require the requester to match the legacy contact. ADO #101617's own expected result is
conditional: *"**If user details match the legacy contact**, link is granted and NPO Dashboard is displayed."*
With all contact fields blank, no match is possible, so the link should be **refused or routed for manual
verification** — not offered with an explanatory note encouraging the user onward.

## Why this matters
- Thabiso's drift note states the code matches via `GetMatchingNpoAsync` on **2-of-3 of name + mobile + email**.
  **With all three blank, that check cannot succeed — yet the UI presents Confirm as available.**
- NPO numbers are **sequential and publicly quoted** (on certificates, letterheads, funding applications), so the
  only thing resembling a secret here is not secret.
- The register holds **361,068 NPOs**, many migrated. If blank contact data is widespread, the exposure is broad.
- A successful link grants the NPO's dashboard — Annual Reports, Post Registration and **Voluntary
  Deregistration** (confirmed on a registered NPO in the same run).

## ⛔ Not fully verified — deliberately
**`Confirm Link to NPO` was not clicked for `000-333 NPO`.** Doing so would attach a real third party's NPO to a
test account. **What is confirmed is that the application offers the action with no authorisation data present**;
what is *not* confirmed is that the server completes it.

**To close this out, one of:**
- a developer confirms server-side behaviour in `GetMatchingNpoAsync` when all three match fields are null; or
- DSD nominates a legacy NPO that may be sacrificed for a live test.

## Related
- On an NPO **already linked** to the account, `Confirm Link to NPO` fires **no request at all** and gives no
  feedback — see `2026-08-13-failed-login-gives-no-feedback.md` for the same silent-failure pattern.
- The lookup itself is sound and returns the four prescribed fields; **the search is not the problem.**
