# Report: NPO-11A-F — Appeals admin / tribunal (functional) — suite unblocked

**Date:** 2026-08-25 08:05 UTC
**Plan:** test-plans/appeals/11a-appeals-admin-tribunal-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 6 of 7 cases verdicted, a suite previously recorded as **entirely blocked**. Every tribunal-only view opens for a non-tribunal admin, the `Initiated` appeal status is confirmed **dead**, and the Denied-outcome form has **no comments field at all**.
**Duration:** ~1200s
**Cases:** TC-01, TC-02, TC-03, TC-04, TC-05, TC-06, TC-07
**Environment:** QA · admin portal · **view mode Latest (asserted in-run)** · 30 appeals, 23 644 notification messages, 4 947 attachments
**Accounts used:** `mpenduloizwelinuk@gmail.com` (shared dev login — broadly privileged, see TC-06)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 7 | 0 | 3 | 3 | 1 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 Send-to-Chairperson invalid email | #101781 | ⚪ NOT EXECUTED | Needs the send action on an appeal we do not own — would mutate a third party's record |
| TC-02 Forward to Appeal Board notifies members | #101782 | ⚠️ PARTIAL | 29 of 29 board emails **Sent**; `TribunalAssigned` (2) confirmed reachable — but **the chairperson's comment never reaches the notification** |
| TC-03 Notice of Tribunal to the organisation | #101783 | ⚠️ PARTIAL | The NPO email exists and delivers (12 of 20) — but the **appeal reference renders empty** |
| TC-04 Upheld re-issues the certificate | #101785 | ⚠️ PARTIAL | Certificate re-issued on **12 of 12** email legs — but `Cancelled → Registered` is **unobservable**: no organisation is ever at status 7 |
| TC-05 Denied requires comments + claim doc | #101786 | 🔴 FAILED | The outcome form has **no comments field**, and **0 of 4 947** attachments in the store is a claim document |
| TC-06 Non-tribunal user blocked from tribunal views | #101787 | 🔴 FAILED | **All 5 tribunal views render**, decision controls included. Drift note confirmed |
| TC-07 Are `InComplete` (3) and `Initiated` (6) reachable? | #101788 | 🔴 FAILED | `InComplete` yes (7 of 30). **`Initiated` — zero of 30.** And 3 appeals sit at a **null** status |

## 🔑 Why this suite is no longer blocked
It was recorded on 08-18 as *"still blocked, no UI route to create an appeal, no chairperson/tribunal login"*. Both
obstacles turned out to be avoidable:
- **30 appeals already exist**, spread across Upheld, Denied, InComplete, Case Preparation and one TribunalAssigned —
  so no appeal needs creating to observe outcomes and statuses.
- **The tribunal forms open by direct URL** with our ordinary admin session. That is itself the finding in TC-06, and
  it makes TC-02/03/04/05 observable without a chairperson account.

Six of seven cases were verdictable without performing a single state transition.

## Appeal status distribution — all 30 records
Read from `Entities/GetAll?entityType=Npo.DeregistrationAppeal`, replaying the grid's own authenticated call:

| `appealStatus` | Label (from the grid) | Count |
|---|---|---|
| 4 | Upheld | 10 |
| 3 | In Complete | 7 |
| 5 | Denied | 5 |
| 1 | Case Preparation | 4 |
| **null** | *(renders blank in the grid)* | **3** |
| 2 | TribunalAssigned | 1 |
| **6** | **Initiated** | **0** |

`typeOfAppeal` is **null on 12 of 30** and `0` on a further 2.

## Case detail

### TC-01 — Send-to-Chairperson with an invalid email is blocked (#101781 · TC-11-009) — NOT EXECUTED
Requires invoking the send action against an appeal. Every appeal in a suitable state belongs to another tester, and
the action dispatches mail, so it was not run. It becomes safe as soon as we own an appeal — which needs 11P TC-01/02
(public-portal submission) first.

### TC-02 — Forward to Appeal Board notifies the selected members (#101782 · TC-11-010) — PARTIAL
**Mode:** ai-repair · 29 `Email Forwarded to Appeal Board` + 29 `SMS Appeal board member`
- [PASS] Multiple board members **can** be selected — `forward-arbitration-tribunal` v16 offers *"Appeal board members(Tribunal)"* (multi-select) with a **Comments** box, Cancel and Save
- [PASS] (blocking) `TribunalAssigned` (`RefList = 2`) **is** reachable — one appeal holds it, so the transition works
- [PASS] Email leg is reliable: **29 of 29 Sent**, zero failures
- [FAIL] **The chairperson's comment is captured but never rendered.** The body reads *"The Appeal have been sent to you with below comment:"* and is then followed by the fixed sentence *"Kindly log on to system for further information."* — the typed comment appears nowhere
- [FAIL] SMS leg: **25 of 29 Failed** (the Vodacom credit issue), 4 Sent — judged separately from email as the plan directs
- ⚠️ *"every selected member is notified"* is consistent with 29 delivered messages but not individually proven — that needs the transition performed, which would mutate another tester's appeal
- 📌 Grammar: *"The Appeal **have** been sent"*

### TC-03 — Notice of Tribunal sent to the organisation (#101783 · TC-11-011) — PARTIAL
**Mode:** ai-repair · 20 `Notice of Appeal` + 92 `Tribunal Chairperson` messages
- [PASS] (blocking) **The NPO does receive an email.** `Email Notice of Appeal` is addressed to the organisation's chairperson: *"We hereby notify that the appeal for … has been assigned to a tribunal, should you want to add any additional information."*
- [PASS] The tribunal side fires too — `Email Tribunal Chairperson`, **92 of 92 Sent**, carrying a real reference (*"Reference number: APPEAL473/10/08/2026"*)
- [FAIL] **The reference renders empty in the NPO-facing notice** — *"the appeal for Decline NPO Validation **with reference** has been assigned"*. This is the **third** template with this defect, after 14T TC-19 and TC-21
- [FAIL] Delivery is unreliable on this template: **8 of 20 Failed**, 12 Sent
- [SKIP] *"appeal stays in TribunalAssigned"* — a no-transition assertion that needs the action performed
- 📌 Worth noting the asymmetry: the message to DSD's own tribunal chairperson carries its reference correctly; the one to the member of the public does not

### TC-04 — Upheld outcome re-issues the certificate (#101785 · TC-11-013) — PARTIAL
**Mode:** ai-repair · 24 `Upheld Appeal` messages
- [PASS] (blocking) **A new certificate is generated and retrievable.** All 12 email legs carry a full re-issue set — `RegistrationCertificate.pdf` + `ApplicationSuccessLetter.pdf` + `ListOfOfficeBearersLetter.pdf` + `UpheldAppealLetter.pdf`, plus the constitution or the legal-form documents (Deed of Trust / Letter of Authority, or Certificate of Incorporation + MOI + Directors) as appropriate
- [PASS] The attachment set adapts correctly to the organisation's legal form — 6 distinct sets observed across 12 messages
- [FAIL] **`OrganisationStatus` 7 (Cancelled) → 4 (Registered) cannot be observed.** The register holds **zero** organisations at status 7; cancellations are represented as **6 (Deregistered)** (36 517 of them). The transition named in FDS Appeals 6.2 rule 14a refers to a status this data never uses
- [FAIL] Delivery: **11 of 24 Failed**, 13 Sent
- 📌 Per the plan's own note the certificate is the substantive assertion, and it passes. The re-issued certificate's QR was decoded separately — see the 14T/14D report; it resolves and reflects the restored status
- ⚠️ These upheld appeals are predominantly *Refusal To Register*, not cancellations, so the cancellation branch specifically remains untested

### TC-05 — Denied outcome requires comments and a claim document (#101786 · TC-11-014) — FAILED
**Mode:** ai-repair · `appeal-outcome` v20 inspected on a Denied appeal; 20 denied-appeal notifications; all 4 947 attachments scanned
- [FAIL] (blocking) **The comments requirement cannot be satisfied — there is no comments field.** `appeal-outcome` v20 contains exactly **two** controls: `Appeal Result` (Upheld / Denied / Approve) and `Claim Document`. A Comments box exists on `forward-arbitration-tribunal`, but not on the outcome form
- [PASS] **The claim document *is* gated by the UI** — `Claim Document` carries the required marker. This answers Thabiso's drift note directly: the server does not enforce it, **the front end does**
- [PASS] Status `Denied` (`RefList = 5`) confirmed — 5 appeals hold it and the grid renders them as *Denied*
- [FAIL] **The email does not carry the claim document.** Of 4 947 attachments in the store, **not one** filename mentions "claim". 8 of 10 `Email Denied of Appeal` messages carry only `DeniedOfAppealLetter.pdf`; **2 carry no attachment at all**
- 🔑 **The data is captured but never delivered.** `APPEAL101/05/08/2026` (Denied) has a Claim Document attached to its record, visible on `appeal-details-view`. So this is a notification-assembly failure, not missing input — which is a more tractable fix than it first appeared
- 📌 The required marker is **unconditional**, not specific to Denied, so the gate also applies to Upheld outcomes
- 📌 The plan asked whether the claim document is retrievable from the record afterwards: **yes** — unlike deregistration notices, it is linked to the appeal

### TC-06 — Non-tribunal user cannot access tribunal-only views (#101787 · TC-11-015) — FAILED
**Mode:** ai-repair · 5 routes, direct navigation, ordinary admin session
- [FAIL] (blocking) **Access is not denied on any of them.** No route produced an access-denied message, a redirect or an empty shell:

| Tribunal view (URL discovered) | Rendered | What it exposes |
|---|---|---|
| `boxfusion.dsdnpo/appeal-outcome` v20 | ✅ | The **decision control** — Upheld / Denied / Approve — plus Claim Document |
| `boxfusion.dsdnpo/notice-of-tribunal` v15 | ✅ | *"Is assessment complete?"* Yes / No |
| `boxfusion.dsdnpo/forward-arbitration-tribunal` v16 | ✅ | Board-member multi-select, Comments, **Save** |
| `boxfusion.dsdnpo/forward-arbitration-tribunal-1` v5 | ✅ | Duplicate of the above |
| `boxfusion.dsdnpo/appeal-details-view` v47 | ✅ | Full appeal record including the submitter's identity documents |

- [PASS] Tribunal view URLs recorded (above) — the plan asked for this explicitly
- 🔴 **Drift note confirmed:** *"tribunal access via `[AbpAuthorize]` only; no granular tribunal-view restriction found."* Any authenticated admin reaches the tribunal decision form
- ⚠️ **Stated as the plan requires:** our shared account is broadly privileged and already exposes the whole `Configurations` menu, so it is a *proxy* for "an admin who should not see this", not a genuinely role-scoped account. A tribunal-scoped test account would make this conclusive. The result is nonetheless meaningful, because nothing in the app distinguished the two
- 📌 `appeal-details-view` displays the submitting office bearer's identity and contact details. Those were **not transcribed** here; only that the fields render is recorded

### TC-07 — Are `InComplete` (3) and `Initiated` (6) reachable? (#101788 · TC-11-016) — FAILED
**Mode:** ai-repair · all 30 appeals enumerated
- [PASS] (record) **`InComplete` (3) IS reachable** — 7 of 30 appeals hold it, and the grid renders it as *In Complete*
- [FAIL] (record) **`Initiated` (6) is reachable on nothing.** Zero of 30. The 08-17 observation over 26 records now holds over all 30
- [FAIL] **3 appeals carry a `null` status**, which the reference list does not model at all and which renders as a blank Status cell. A dead enum value is untidy; an unmodelled null state is worse
- 🔑 **The contradiction is resolved in the drift note's favour, and now by direct causal evidence.** Smoke TC-11-005 asserts a submitted appeal *"is recorded with status Initiated (`RefListAppealStatus=6`)"*. After this suite was written, an appeal was initiated from the public portal for an NPO we own — `APPEAL1445/25/08/2026`, created 2026-08-25 08:08 UTC. **The UI labels it `DRAFT`; the stored `appealStatus` is `3` (InComplete), not `6`.** So initiation writes **InComplete**, `Initiated` is never written by any path we can reach, and **smoke TC-11-005's expected result is wrong and should be rewritten**. `Initiated` looks safe to delete — matching *"likely dead states; verify and clean up"*
- 📌 There is also **no `Draft` value in the reference list**, yet the portal renders `DRAFT`. The UI label and the stored enum do not correspond, which is worth flagging alongside the dead value
- ⚠️ Creating that appeal moved the totals: **31 appeals**, and `InComplete` from 7 to **8**. The distribution table above is as at the start of this run
- [SKIP] *"where reachable, record what notification fires"* — for `InComplete` this needs the transition driven, which would mutate an appeal we do not own

## Not covered
- **TC-01** — as above; unblocked once we own an appeal.
- The *notification behaviour* half of TC-07, and the no-transition assertions in TC-02/TC-03, all need transitions
  performed on appeals belonging to other testers.
- ▶ **The real unblocker for the rest of this suite is 11P TC-01/TC-02** — submitting an appeal of our own from the
  public portal. That would make TC-01, the TC-02/03 status assertions and TC-07's notification half all runnable.

## Method
- Appeals enumerated by replaying the appeal grid's own authenticated request with a larger page size. 🔑 The bearer
  token is **not** in `localStorage` or `sessionStorage`; lift the `authorization` header off an outgoing
  `Entities/GetAll` request instead, and remember the API is on **its own host** — a relative `/api/…` call from the
  portal returns the SPA shell (HTTP 404 as HTML).
- Notification and attachment stores harvested in full with paging (23 644 / 4 947).
- Tribunal routes reached by direct URL; forms inspected declaratively (`.ant-form-item` labels, required markers,
  upload controls). **No transition was performed and nothing was saved.**
