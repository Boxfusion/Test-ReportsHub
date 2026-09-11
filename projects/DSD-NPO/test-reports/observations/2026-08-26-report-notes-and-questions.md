# DSD-NPO — 2026-08-26 · notes and questions for the test lead

## What moved today
The appeals module went from **entirely unreachable** to **driven end to end**, and the standing *"waiting on an
administrator"* list was retired. Neither needed a code change or a seeded record.

1. **We now own an appealable NPO.** Admin → NPO → **Invite to Organisation** attaches a QA applicant to a
   **status-9 (Not Registered)** organisation; the invitation's magic link is readable from the notification store.
   Once accepted, the public portal shows *NPO Status: NOT REGISTERED*, a **Draft Appeals** panel and an **Appeals**
   action — a published, **Live-mode** journey. Nothing had to be run in *Latest*.
2. **An appeal was submitted end to end** — `APPEAL1447/26/08/2026` — and is visible on both portals.
3. **QA can create role-scoped staff accounts** without an administrator, via
   Administration → User Management → `Register New User` → `Assign Role`.

## Questions for Thabiso

### Cases that need rewriting
- **#101777 (TC-11-005)** requires a submitted appeal to record status **`Initiated` (6)**. Ours recorded
  **`Case Preparation` (1)**, and no appeal in the register has ever held 6. Should the case be rewritten, or should
  the workflow genuinely pass through `Initiated`?
- **#101781 (TC-11-009)** and step 3 of **#101780 (TC-11-008)** both describe typing a chairperson's email address.
  **There is no such field** — *Send to Arbitration Tribunal Chairperson* is a bare *"Are you sure?"* confirmation.
  Where does the chairperson's address come from?
- **#101773 (TC-11-001)** says *"open the denied application → click Appeal"*. There is no Appeal control on an
  application; the route is NPO landing → Appeals → Initiate Appeal.

### Behaviour we could not settle from the outside
- **Why is the Workflows inbox empty for every account we hold** — the shared `Authorised Admin` included — when the
  system holds **80 054** workflow todo items and **1 621 235** workflow instances? This one question sits underneath
  two separate blockers: the appeals module cannot move past *Case Preparation*, and the annual-compliance QA form
  stays disabled even for a user holding `Annual Compliance Quality Assurer`.
- **Is *Send to Arbitration Tribunal Chairperson* meant to run from the appeal screen, or only from a workflow task?**
  It currently issues no HTTP request at all and reports nothing to the user.
- **Should the tribunal forms carry a role restriction?** `appeal-outcome` and `forward-arbitration-tribunal` open
  for an account holding only `Dsd.Npo.Registry Clerk`. Notably the rest of the portal *is* scoped correctly — the
  same account gets a clean 403 on User Management — so this looks like a missing declaration on those forms rather
  than an absent capability.
- **Should the appeal acknowledgement reach the person who submitted it?** It currently goes only to the office
  bearer named on the form, and it is sent **twice** on each channel.
- **Should Supporting Documents be mandatory on an appeal?** Submit is enabled without them.

### Data questions
- `SubmissionDate` on an appeal is stamped at **creation**, not at submission. The portal's *Submitted date* column
  is therefore a created-date — which is why appeals that were never submitted still display one. **If the 30-day
  refusal-appeal window is measured from this field, it is measuring from the wrong instant.**
- Three appeals still carry a **null** status that the reference list does not model.

## Routed to you rather than into the daily report
Per the standing rule that security findings are not ours to publish:

- **Any broadly-privileged admin can create an internal user and self-assign all 46 roles**, `Authorised Admin`
  included, from User Management. This is how today's role blocker was cleared, so it is useful to us — but it is
  worth confirming it is intended.
- **The organisation-invitation acceptance link is a `/no-auth/` route** keyed only on `invitationId` + `personId`,
  and it is served on the **admin portal host** even when the invitee is an NPO applicant. Anyone holding the link
  joins the organisation.
- The tribunal-view access finding above.

## Housekeeping
- **Coverage is unchanged at 197 / 314 (62.7 %)**, script-derived. Today's appeals verdicts land on *smoke* cases
  (TC-11-001 / 005 / 008), which sit outside the 314-case functional plan, and 11A TC-06 was already counted. The
  gain today is capability and defect detection, not a bigger number — stated per the conservative-number rule.
- **Suite 14R is mid-flight.** Both cohorts were snapshotted at T0 = 04:49:31 UTC; the case requires a **>1 hour**
  observation window before it can be verdicted.
- Four QA accounts now exist (A, B applicants; C, D staff). **A and B must stay unprivileged** — suite 14Z Class B
  depends on it. **D must keep only `Dsd.Npo.Registry Clerk`** — it is the sole restricted control account.
