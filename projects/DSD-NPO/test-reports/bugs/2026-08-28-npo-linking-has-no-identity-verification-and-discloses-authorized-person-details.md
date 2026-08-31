# Bug: Link-to-Existing-NPO has no identity verification and discloses authorized-person details

**Raised:** 2026-08-28
**Severity:** 🔴 High (authorisation + POPIA)
**Found in:** NPO-02-F TC-02-003/004/005 (ADO #101830/#101831/#101832)
**Environment:** QA · public portal · `boxfusion.dsdnpo/dsd-link-existing-npo` v13 + `dsd-link-npo-details-subform` v4
**Reported to test lead:** pending — route to Thabiso (security)

## Summary
The *Link to an Existing NPO* flow lets any authenticated user link (take control of) **any** registered NPO by its
number, with **no identity verification of any kind**, and in the process **displays that NPO's authorized-person
contact details** to the requester — even when the requester has no prior association with the NPO.

## Steps
1. Sign in as any public account. Dashboard → *Register NPO* → **Link to an Existing NPO**.
2. Enter the `npoNumber` of a registered NPO the account is **not** associated with.
3. The flow returns *"Npo number found"* and renders the NPO name plus an **Authorized Person** subform
   (name, cell, email), then offers a **Confirm Link to NPO** button.

## Observed
- **No verification step.** No security questions, no OTP to the authorized person, no admin approval — regardless of
  whether the NPO's authorized-person details are blank or populated. For a blank-details NPO the UI even states
  *"authorized person info is blank, but you can proceed with linking."*
- **Authorized-person PII is disclosed** to the unverified requester: for a populated legacy NPO the subform shows a
  real person's name, cell number, and email address (a government address was observed). **The specific values are
  intentionally not recorded here** — see the working rule on never transcribing real personal identifiers. The
  finding is the *mechanism of disclosure*, which is fully established without the values.
- **Confirm Link was NOT clicked** during testing — completing it would associate the tester's account with a
  third-party NPO. The exposure and the absence of verification are both established at the pre-confirm step.

## Expected (per ADO #101830/#101831/#101832 and FDS)
A mismatch between requester and the NPO's legacy details should trigger a **security-questions / identity
challenge**; only a correct match should permit the link (as Authorised Admin), and a mismatch should route to
cancel / Change Request. None of that exists.

## Impact
1. **Account takeover / unauthorised control** — any NPO can be linked to an arbitrary account by number, with no
   check, granting the linker submitter control over that NPO's post-registration actions.
2. **POPIA disclosure** — authorized-person contact details (incl. government email) are shown to unauthorised
   parties on a public portal, by NPO number alone.

## Fix direction
Add an identity-verification gate before the link (security questions matched against legacy data, or an OTP to the
authorized person's on-file contact, or admin approval), and do not disclose authorized-person contact details to a
requester who has not passed it. This is the branch #101830/101831/101832 were written to exercise.

## Related
- `bugs/2026-08-18-api-reachable-without-authentication.md` — the broader unauthenticated-access / missing-guard theme.
- Report: `test-reports/2026-08-28/02-npo-linking-functional--security-questions-branch-absent.md`.
