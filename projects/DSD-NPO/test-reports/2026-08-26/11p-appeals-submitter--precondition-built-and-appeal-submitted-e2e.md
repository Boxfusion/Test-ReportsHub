# Report: NPO-11P — Appeals: NPO Submitter (smoke) — the precondition was built, and an appeal ran end-to-end

**Date:** 2026-08-26 05:10 UTC
**Plan:** test-plans/appeals/11p-appeals-submitter.md
**Execution Mode:** ai-repair
**Result:** FAILED — the suite's standing blocker is **cleared**: we now own an NPO at OrganisationStatus 9 and submitted a real appeal, `APPEAL1447/26/08/2026`, through the public portal end to end. Both cases are verdicted for the first time. The terminal case fails on its blocking assertion — a submitted appeal records **`appealStatus = 1` (Case Preparation)**, never **`6` (Initiated)**.
**Duration:** ~1500s
**Cases:** TC-01, TC-02
**Environment:** QA · public portal · **Live mode (the portal exposes no view-mode control to an applicant)** · NPO `Test Unsuccessful 03`, OrganisationStatus 9
**Accounts used:** `npo.qa.applicant.a@example.org` (self-registered QA applicant) · `mpenduloizwelinuk@gmail.com` (admin, for the invitation and the cross-check)

## Summary
| Total attempted | Passed | Failed | Partial | Blocked |
|---|---|---|---|---|
| 2 | 0 | 1 | 1 | 0 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 Initiate a 'Refusal to Register' appeal from a denied application | #101773 | ⚠️ PARTIAL | Form opens with org details prefilled and the correct nature — but the nature is **system-derived and disabled**, not selected by the user, and the entry point is the NPO's Appeals table, not the denied application |
| TC-02 Submit an appeal with the required fields | #101777 | 🔴 FAILED | Submitted successfully and is retrievable admin-side, acknowledgement sent — but status is **`1` Case Preparation**, not the required **`6` Initiated** |

## 🔑 How a blocker that stood since 2026-08-14 was cleared
Every appeals case needed *"an appeal we own"*, which needed an NPO at **OrganisationStatus 7 (Cancelled)** or
**9 (Not Registered)**. Sessions on 08-14, 08-18, 08-20 and 08-25 all ruled out every route to those statuses:
Decline never enables, Voluntary Deregistration yields 6, and status 7 has **zero records** in the whole register.

The 08-20 note recommended *"link us to one of the 3 existing status-9 NPOs"*. **That route is closed** — all three
status-9 organisations have **`npoNumber = null`**, and `Link to an Existing NPO` keys on the NPO number.

The route that works is a different one, and it needs no code change and no seeding:

| Step | Where | Result |
|---|---|---|
| 1 | Admin → `npo-details-view2` for a status-9 NPO → **Invite to Organisation** | `POST /api/services/Enterprise/OrganisationalAccount/InviteToOrganisation` → **200**; Person = our QA applicant, Role = **`NPO Users`** |
| 2 | Admin → NPO → **Authorised User → Invitations** | Row appears: *Invited*, not expired |
| 3 | Read the acceptance link from the notification store (QA email delivery is unreliable) | `.../no-auth/Shesha.Enterprise/process-account-invitation-accept?invitationId=…&personId=…` |
| 4 | Open the link | **"Success! You have successfully joined the organisation."** |
| 5 | Sign in on the public portal as the applicant | Lands **directly** on `npo-landing-view` for the status-9 NPO |

**The appeals entry point then appears on its own.** The landing view renders **NPO Status: NOT REGISTERED**, a
**Draft Appeals** panel and an **Appeals** action under *Additional Actions*, which opens
`portal-appeals-table` — **at `v10 LIVE`**, not the `v11 DRAFT` recorded on 08-25.

⚠️ **This corrects the 08-25 finding.** The submitter journey is not reachable only in *Latest* view mode via an
unpublished form. For an NPO in an appealable status it is a **published, navigable, Live-mode journey**. What was
missing was never the form — it was the precondition.

## 🔑 And it corrects the framing of the `GetAppealInitialData` 500
That call was recorded as *"the critical path — fix it and roughly six cases become runnable"*. Tested directly
against four appeals from the applicant's own session:

| Appeal | `npo` | `GetAppealInitialData` |
|---|---|---|
| `APPEAL180/05/08/2026` | Test Unsuccessful 03 | **200** — `{npoId, organisationStatus: 9, failedApplication}` |
| `APPEAL498/10/08/2026` | Test Unsuccessful 03 | **200** — same |
| `APPEAL473/10/08/2026` | Test Unsuccessful 03 | **200** — same |
| `APPEAL1445/25/08/2026` (ours, 08-25) | **null** | **500** *"No Appeal or NPO found"* |

**The call is not defective.** It refuses an orphan appeal that has no NPO bound. The defect is upstream — the
`Initiate Appeal` button creating those orphans in the first place, and surfacing the refusal as an unhandled 500
instead of a handled message. Recorded against the existing bug
`bugs/2026-08-20-initiate-appeal-is-ungated-and-creates-invisible-orphan-appeals.md` rather than re-raised.

## Test Cases

### TC-01 — Initiate an appeal of type 'Refusal to Register' from a denied application (#101773 · TC-11-001) — PARTIAL

The form opens and is correctly bound. `npo-appeal-application v35 LIVE`, quoting *"Section 14(1) and 22(1) of the
NPO Act"*.

**Organisation details are prefilled** — assertion 2 passes:

| Field | Value |
|---|---|
| Name | Test Unsuccessful 03 |
| Application Reference | APPL26-00139 |

**📌 Every Nature option offered — the list the plan asked for, and it is exactly two:**

| Value | Label |
|---|---|
| 1 | Refusal To Register |
| 2 | Cancellation Of Registration |

Confirmed against `ReferenceList/GetByName?name=boxfusion.dsdnpo.Domain.Enums.TypeOfAppeal`, so the labels and the
underlying numbers both match. That closes the note carried by **both** appeals plans that *"neither plan enumerates
the full list"*.

**Why this is PARTIAL, not PASSED.** The case says *"SELECT Nature = 'Refusal to Register'"* and *"the selection is
accepted"*. On screen the user selects nothing:

- `Refusal To Register` is **pre-checked and `disabled`**
- `Cancellation Of Registration` is **`disabled`**

The nature is derived server-side from `organisationStatus 9` and locked. That is sensible behaviour — a
not-registered NPO can only appeal a refusal — but it is **not what the case describes**, so it is recorded as
observed rather than forced into a pass.

🔑 **This also retires an earlier observation.** The 08-25 note *"only 2 of 4 radios became enabled"* was read as a
symptom of the 500. It is not — the two disabled radios are the **Nature** pair, correctly locked, and the two
enabled ones are the **Mode** pair. Intended gating, not a defect.

**Entry point drift.** The case says *"Open the denied application → CLICK Appeal"*. There is no Appeal control on
the application. The real route is **NPO landing → Appeals → Initiate Appeal**. Worth a plan rewrite.

---

### TC-02 — Submit an appeal with the required fields (#101777 · TC-11-005) — FAILED

Submitted end to end as the applicant. `APPEAL1447/26/08/2026`, id `20124dcc-70fb-44a9-82d7-4c286ebeab6a`.

| Step | Result |
|---|---|
| Nature | Refusal To Register (system-set, see TC-01) |
| Mode | **Written Submission** |
| Office bearer | Selected from the NPO's own office bearers |
| Name / Surname / Capacity | Typed; Capacity = *Chairperson* |
| Supporting documents | **Not uploaded — and Submit enabled without them** |
| Submit | Accepted; redirected to the landing view, no error |

**🔴 The blocking assertion fails.** The case requires status **exactly `Initiated`, `RefListAppealStatus = 6`**.
Read back from the record:

```
refNumber      "  APPEAL1447/26/08/2026"
appealStatus   1        <-- Case Preparation
status         2
typeOfAppeal   1        Refusal To Register
modeOfAppeal   2        Written Submission
description    "QA written submission, appeal APPEAL1447."
```

The portal grid renders it as **Case Preparation** and the admin `appeal-details-view` header reads
**CASE PREPARATION**. Numeric value and label agree — the status is simply not the one the case specifies.

🔑 **This is now proven on an appeal we created and submitted ourselves.** The 08-25 conclusion that `Initiated` is
dead rested on 30 records belonging to other users; this is direct evidence. **`Initiated` (6) is unreachable — the
case needs rewriting to `Case Preparation` (1).** Cross-references 11A functional TC-07.

**Assertion 3 — acknowledgement sent: PASSES**, with two defects attached. At `05:01:46`, four messages fired for one
submission:

| Time | Channel | Recipient | Status |
|---|---|---|---|
| 05:01:46.523 | Email Acknowledgement Appeal | office bearer's address | **1 Sent** |
| 05:01:46.623 | Email Acknowledgement Appeal | office bearer's address | **1 Sent** |
| 05:01:46.473 | SMS Acknowledgement Appeal | office bearer's mobile | **8 Failed** |
| 05:01:46.593 | SMS Acknowledgement Appeal | office bearer's mobile | **8 Failed** |

- 🔴 **Every acknowledgement is duplicated** — two emails and two SMS for a single submit.
- 🔴 **It is addressed to the office bearer, never to the submitter.** The account that filed the appeal
  (`npo.qa.applicant.a@example.org`) receives nothing at all.
- Both SMS legs failed, consistent with the known QA credit issue.

Bug: `../bugs/2026-08-26-appeal-acknowledgement-duplicated-and-never-reaches-the-submitter.md`

**Assertion 4 — retrievable admin-side: PASSES.** `APPEAL1447` appears in `appeal-table` (CRUDS → Appeals) and
opens on `appeal-details-view v47` with the written submission text rendering correctly.

**📌 Mode options RECORDED**, as the case asks: **`Oral`** and **`Written Submission`**, under the field label
*Preferred Representation Mode*, with the note *"The panel reserve the right to approve the Oral submission"*.
This confirms Thabiso's drift note — the code enum says **Oral**, not the FDS's *Verbal*.

## Observations for the test lead
- **The one-active-appeal rule is not enforced.** With three active appeals on the NPO and the banner *"You already
  have an existing Appeal… Only one active appeal may exist at a time"* displayed, a fourth was created. The only
  guard is the `Initiate Appeal` button being collapsed to **0×0 pixels** — it is `visibility: visible` and **not
  disabled**, so it still activates. Nothing is enforced server-side.
- **`SubmissionDate` is stamped at creation, not at submission.** `APPEAL1447` records `04:58:32` for both
  `creationTime` and `submissionDate`; the actual submit was at `05:01:46`. The portal's *Submitted date* column is
  therefore a created-date, which is why appeals that were never submitted still show one. **This matters for the
  30-day appeal window in 11P functional TC-01**, which would be measured from the wrong instant.
- **The "Draft Appeals" panel reads *"All Done! You're all caught up"*** while an appeal sits at *In Complete* and
  the same screen warns that an active appeal exists.
- The appeal form header shows *"Created by … 2 hours ago"* for a record created seconds earlier — a UTC/SAST
  display offset.
- The portal header shows a different organisation name (`Nomfanelo QA Test NPO 2026-08-13`) from the NPO the page
  is actually bound to. Cosmetic, but confusing when several NPOs are in play.

## Questions for Thabiso
- **TC-11-005 specifies `Initiated` (6), which no appeal has ever held.** Should the case be rewritten to
  `Case Preparation` (1), or should the workflow actually pass through `Initiated`?
- Should the appeal acknowledgement reach the **person who submitted** the appeal as well as the office bearer?
- Should **Supporting Documents** be mandatory on submit? They are currently optional.
- The appeal *nature* is locked by organisation status. Is a Cancellation appeal expected to be selectable by the
  user at all, given no organisation has ever reached status 7?
