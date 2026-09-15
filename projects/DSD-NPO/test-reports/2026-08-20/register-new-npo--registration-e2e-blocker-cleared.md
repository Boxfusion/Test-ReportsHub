# Report: Registration E2E — the "registration is blocked" regression is withdrawn; appeal path diagnosed

**Date:** 2026-08-20 17:35 UTC
**Plan:** test-plans/npo-registration/register-new-npo.md
**Execution Mode:** ai-driven (Playwright MCP, live QA public + admin portals)
**Result:** PASSED — full registration E2E completed and submitted; the 08-20 "registration blocked" High defect is **withdrawn**; 3 new defects raised (1 High POPIA, 1 High usability-pattern, 1 High appeals gap)
**Duration:** ~1400s
**Cases:** exploratory — registration wizard steps 1–7, admin OB Compliance + Document Verification reject, appeal-eligibility check
**Environment:** QA · public portal (`create-npo` v62, **Latest** view mode) · admin portal (`npoapplication-details` v46)

## Summary
| Objective | Verdict |
|---|---|
| Retest the lat/long "slow load" hypothesis | ✅ **Disproven** — still blank after 15 s |
| Is registration actually blocked? | ✅ **No** — withdrawn; APPL26-01494 submitted end-to-end |
| Reach an appeal-eligible NPO | 🔴 **Not reachable** — reject lands on status 3, appeals need 7/9 |
| Office bearer capture (3 OBs, RSA-ID mode) | ✅ PASS, with a High POPIA finding |
| Admin OB Compliance → Document Verification → Reject | ✅ PASS (once a hidden required field was found) |

**Application built:** **APPL26-01494** — "Nomfanelo QA Appeal NPO 2026-08-20", VA / Non-Membership, 3 office bearers,
instance `4ec56d13-414f-4fed-a65b-d95a5012da9b`, NPO `db7d5cc6-fac2-442c-a1a8-83e9a2ccb0f4`. Final state:
**Application Failed**.

## The headline: the registration blocker was a misdiagnosis
The 08-20 High defect said the Google Places autocomplete failed to populate Latitude/Longitude and that this left
**Next** disabled, so no new NPO could be registered. The user's hypothesis was that lat/long might simply be a slow
async lookup that I hadn't waited for.

**Neither held.** Lat/long are still blank after a deliberate 15-second wait (previous observation was ~1.2 s) — so
the slow-load hypothesis is disproven. But lat/long was **never the gate**: Next enabled the instant I filled
**National (SA)**, the area-of-operations province select, **with lat/long still empty**. The wizard then ran cleanly
through all 7 steps to submission.

So:
- `bugs/2026-08-20-registration-address-latlong-not-populated-blocks-next.md` → renamed to
  `…-registration-address-latlong-not-populated.md`, **downgraded High → Low–Medium**, blocker claim withdrawn.
  What survives is real but minor: coordinates are never captured, and the fields are display-only so there's no
  manual fallback — meaning the **Spatial Map dashboard has nothing to plot**.
- The long-standing CLAUDE.md note that *"the address is the registration blocker"* should be **retired**.

That is two retracted claims on this one bug in two days (first "no suggestions render" — my `.pac-container`
selector error; now "lat/long blocks Next"). The lesson worth keeping: **a disabled button is not evidence about the
field you happen to be looking at.**

## New defect 1 (High, POPIA) — ID lookup returns real identities, masking is cosmetic
`bugs/2026-08-20-id-number-lookup-returns-real-identities-masking-is-cosmetic.md`

Ticking *Is RSA ID Number* and typing **any** valid 13-digit ID returns that person's **name, DOB and gender** on the
**public** portal. Three independently generated Luhn-valid numbers each returned a distinct, plausible real identity,
so this is a live register lookup, not a stub. The name inputs *display* it masked with underscores — but the
**unmasked name is in plaintext in the DOM at the same time**, and the saved office-bearer grid shows the full name
**and** full ID number unmasked. The identities carry through to the admin portal's OB Compliance picker.

Per our standing rule, **no ID number or returned identity is transcribed** in the bug or here — described only, with
reproduction steps. Follow-up for us: the ID I had recorded in my notes as a "test ID" resolves to a real identity and
must be scrubbed.

## New defect 2 (High, pattern) — unstarred mandatory fields silently gate the forward action
`bugs/2026-08-20-unstarred-mandatory-fields-silently-gate-next-and-save.md`

Found **three** instances in one session, in three unrelated forms:

| # | Form | Hidden gate |
|---|---|---|
| 1 | Registration → Organisation Details | **National (SA)** — no star; all 9 starred fields satisfied, Next still disabled |
| 2 | Registration → Office Bearer modal | **duplicate mobile number** across office bearers |
| 3 | Admin → Document Verification | **Additional Reasons for rejection** — its radio renders *pre-set to Yes and disabled*, so it reads as already answered |

In each case: no red star, no inline error, no `aria-invalid`, no persistent message — just a greyed button on a
form that looks complete. Instance 2 is partly mitigated by a **transient** toast (*"OB With same mobile number
exists"*) which I initially missed because it had already faded; verified deterministically in both directions.

Because it recurs across unrelated forms it looks like a **form-builder convention issue** rather than three point
bugs — probably the red-star metadata and the validation rule are configured independently. Worth an audit, not three
fixes.

This also **corrects** part of `2026-08-18-no-application-incomplete-first-reject-denies-outright.md`: its "Case A
dead state where no outcome button ever enables" is, on the refuse=Yes branch, this hidden-required-field pattern, not
a permanently dead form. The refuse=**No** + verification-No branch has **not** been re-tested against this discovery
and should be.

## New defect 3 (High) — reject lands on a status that is not appeal-eligible
`bugs/2026-08-20-rejected-application-has-no-appeal-route.md`

The whole point of building APPL26-01494 was to reach an appeal-eligible NPO. Rejecting it at Document Verification
produces **NPO Status "Application Failed" (status 3)**, and the applicant's only action is **"Submit Query"**.
The *Initiate Appeal* action is already known to exist and to be gated on OrgStatus **7 (Cancelled)** or
**9 (Not Registered)** (see the suite 11 row in `skipped-blocked-register.md`) — so it is correctly hidden here.
**What is new is the confirmation that the reject path produces 3**, i.e. the only refusal an assessor can reach is
not appeal-eligible. With the admin Cancel action absent, Investigations blocked, and deregistration yielding 6, every
route to an appealable NPO is now accounted for and shut.

**Suite 11 (Appeals) stays BLOCKED — but now with a diagnosed cause rather than an unknown.** I deliberately cannot
say whether Initiate Appeal *works* given a status-7/9 NPO, only that nothing in the product gets an NPO there. This
raises the priority of the seeded-record ask: it is the only way to separate "appeal feature is broken" from "appeal
precondition is unreachable".

Combined with the 08-18 finding, a single correctable error on a registration application is **terminal** for the
applicant: no resubmission cycle, no appeal, only "Submit Query".

## Confirmed working
- Registration wizard steps 1–7 end-to-end on a **resumed draft** (`/shesha/workflow-action?id=…&todoid=…`).
- Address autocomplete via the app's own **`div.suggestion`** dropdown — populates Province / Metro / Area Code.
- ID-mode office bearer capture, 3-OB minimum enforced, positions Chairperson / Secretary / Treasurer.
- **VA + Non-Membership auto-generates the constitution** (`ApplicationNonMembershipConstitution.pdf`, 79.36 kB) at
  step 6 — no upload needed.
- Declaration: Capacity + all 9 acknowledgement checkboxes → Submit → status **Application In Progress**, and the
  item lands in the admin Workflow Inbox as **Doc Verification** within seconds.
- Admin **OB Compliance** (No + named OB + reason) correctly carries into Document Verification as read-only
  *Are OBs Compliant? = No* with the reason text, and auto-sets *Additional Reasons for rejection = Yes*.
- The XSS-named NPO from 08-18 still renders **escaped** in the public portal's Organisations menu.

## Minor findings
| What | Where |
|---|---|
| **"View NPO Profile"** link has an empty id → dead link | Public NPO landing view |
| Menu item spelt **"Organistions"** | Public portal header |
| Header's active-organisation label doesn't follow the *Organistions* switcher | Public portal header |
| Org mobile echoed under a **"WhatsApp number"** label (left blank on the form) and again as "Cellphone Number" | Admin → Organisation Details |
| **District / Metropolitan Municipality blank** although Metro was captured publicly — possibly the same "display-only, never bound" defect as lat/long | Admin → Organisation Details |
| Console error *"Failed to execute action 'shesha.common:Show Dialog', error: undefined"* on every modal save; save succeeds | Registration wizard |
| Reference-list typos **"Vacational"**, **"Adult Continuiing Education"** still present | Admin & Operations step |
| Inbox *Period In Possession* read "2 hours ago" seconds after submission — consistent with `2026-08-18-submission-date-stamped-at-draft-creation.md` | Admin Workflow Inbox |

## Scope of these results
Everything above was executed against the **QA** environment on the **Latest** view mode, driving the live public and
admin portals by hand. It covers the registration wizard end-to-end and the Document-Verification reject branch
only — it does **not** cover the approve branch, the refuse=No/verification-No branch, resubmission, or anything
behind an appeal, and it is all on the single broadly-privileged shared dev account, so nothing here says anything
about role-scoped behaviour.

## Evidence
- `evidence/registration-latlong-blank-after-15s.png` — full form, lat/long blank after a 15 s wait
- *(screenshot withheld — POPIA, see `audits/2026-08-21-evidence-popia-sweep.md`)* — completed OB form with Save greyed (duplicate mobile)
- `evidence/address-works-but-next-disabled.png` (08-20, earlier) — the state that caused the misdiagnosis

## Questions for the test lead (Thabiso)
1. **Is the QA ID lookup hitting live population-register data?** If yes, QA is processing live personal data and that
   needs raising on its own, separately from the defect.
2. **Which OrgStatus is a refusal meant to set?** If a Document-Verification reject should produce 7/9 rather than 3,
   defect 3 is a status-mapping bug; if 3 is correct, the appeal feature is missing its trigger.
3. **A seeded NPO at status 7 or 9** is now the single highest-value unblocker — it is the only way to test appeals at all.
4. **Is the red star driven off the same metadata as the validation rule?** If not, every mandatory field in the module
   is a candidate for defect 2 and it is worth an audit.
5. Is capturing NPO **lat/long** in scope, and is the Spatial Map expected to plot registered NPOs? Determines whether
   the downgraded lat/long bug is Low or Medium.

---

## Addendum — "how do we CANCEL an NPO, not reject it?"
Follow-up investigation after the reject above. Full detail in
`bugs/2026-08-20-no-way-to-cancel-an-npo-and-decline-is-the-real-appeal-route.md`.

**Short answer: you can't cancel an NPO — and cancellation is not the route we need anyway.**

### Cancellation is modelled but has no action
`NpoOrganisation` carries `canBeCancelled`, `dateCancelled`, `formOfCancellation`. Our own **Registered** NPO
**333-019** has **`canBeCancelled = true`** — and its admin detail view (`npo-details-view2`) still offers exactly one
action: **"Invite to Organisation"**, across all 15 tabs. So this is not us looking at the wrong record type.

Database-wide: **OrgStatus 7 (Cancelled) = 0 NPOs**, 8 (Appealed Npo) = 0, 5 (Outstanding Report) = 0, while
4 (Registered) = 62 543 and **9 (Not Registered) = 3**. Yet **~37 600 NPOs carry `dateCancelled`/`formOfCancellation`**
— historical cancellations recorded in data that never reach status 7, so the appeal gate could never fire for them
either. That is a data-semantics question for Thabiso, not just a missing button.

The Investigation route is dead too: our own `INV1283/13/08/2026` (NPO 333-018, *Non-Compliance to NPO Act*) sits at
**"Awaiting Investigation Outcome"** with no outcome action on the record and **0 matching tasks in the Workflow Inbox**.

### 🔑 The real route is **Decline**, and it is the 08-18 blocker wearing a different hat
All **3** NPOs at the appeal-eligible status **9** trace back to applications carrying a
**`documentVerificationDeclineComment`** — they were **Declined**, not Rejected. Ours, rejected, has `rejectionReason`
and landed on **3**. And of the **8** applications ever declined, **8/8 also have an `incompletenessLetterFile`**.

```
intended:  Doc Verification → Letter of Incompleteness → [resubmission] → Decline → Unsuccessful (7) → NPO 9 → APPEAL
reachable: Doc Verification → Reject → NPO 3 (App Failed) → no appeal, ever
```

Since the **"Application Incomplete" outcome does not exist in this build** (08-18 bug), **Decline** is unreachable,
so status 9 is unreachable, so appeals can't be tested. One blocker, seen from two directions.

### Revised recommendation
- ▶ **Stop chasing "cancel".** Chase **Decline** / the Incomplete path — fixing it also fixes the 08-18 fairness defect.
- ▶ **Cheapest unblocker to ask for:** the 3 status-9 NPOs already exist but belong to other users, and an appeal is
  raised by the NPO's own portal user. **Being linked to one of them would unblock the appeal-form tests with no code
  change at all** — worth asking Thabiso for directly, ahead of a fresh seeded record.

### Additional defects found while investigating
- Admin **All NPOs** and **Annual Compliance** grids never finish loading (`loading...` forever), even filtered — both unusable.
- **Workflow Inbox renders its pager but no rows** when unfiltered ("1-10 of 2480 items", zero rows); rows appear only
  under a narrow quick-search. This resolves the previously "unconfirmed" empty-inbox note — it is a rendering fault.
- A boolean filter (`canBeCancelled == true`) returns **HTTP 500** on the NPO entity, while `!= null` filters work.

---

## Addendum 2 — "what if you create an NPO and don't finish it?" (the *unregistered* NPO idea)
Tested directly. Full detail in `bugs/2026-08-20-initiate-appeal-is-ungated-and-creates-invisible-orphan-appeals.md`.

### An unfinished registration is status 1, not 9
Started a fresh registration, accepted POPIA, filled Organisation Details, saved, then **stopped**:
- Accepting POPIA alone creates the application (**APPL26-01522**) with **`npo = null`** — no NPO record yet.
- The **NPO record is created when Organisation Details is saved**: "Nomfanelo QA Unfinished NPO 2026-08-20"
  (`1b217af3-07df-41ec-bbbf-c5d06b6b2055`), **OrgStatus 1 (Application In Progress)**, `npoNumber = null`,
  **`canBeCancelled = false`**.
- Public portal shows *NPO Status: Application In Progress* with a **"Draft Application"** marker; the only action is
  **Submit Query**. No appeal.

⇒ **An abandoned registration never becomes "Not Registered".** It stays at status 1 indefinitely. So "unregistered"
in the lead's sense means **OrgStatus 9 "Not Registered"**, which is a **refusal outcome** (Decline → Unsuccessful),
not an unfinished application. This is consistent with the appeal form's own banner, which cites **NPO Act s.14(1) and
s.22(1)** — appeal against **Refusal to Register** or **Cancellation of Registration**.

### 🔑 But the Appeal button IS appearing — and that is a defect, not a route
The register's "the Appeal button only shows at OrgStatus 7/9" note is **wrong for the `portal-appeals-table` route**.
That button is **always present and enabled**. Clicking it created real appeals — **APPEAL1415/20/08/2026** and, on a
second click, **APPEAL1417/20/08/2026** — for an account with **no** appealable NPO. Each one is an orphan:

- Organisation **Name blank** (`npo: null`), **Nature of Appeal radios disabled** (neither *Refusal To Register* nor
  *Cancellation Of Registration* selectable), office-bearer picker **"No data"**.
- With Preferred Representation Mode and all three Declaration fields filled, **Submit stays disabled** — no error, no message.
- The appeals table shows **"0 items found"** — the appeals are **invisible**, so the on-screen instruction to
  "complete and submit it or delete it" cannot be carried out.
- The **"only one active appeal may exist at a time"** notice is **not enforced** — two were created 2 minutes apart.

So the button is not gated; the **form's content** is, and it fails silently by minting junk instead of blocking.

### Ownership check — we do NOT have access to the status-9 NPOs
Our account is **user 15918**. **Every appeal 15918 has ever created has `npo: null`** (3 of them, including an
unreferenced one from 2026-08-13). **Every properly-bound appeal belongs to dev user 3230**, against the three status-9
NPOs, and only those reached statuses 2 and 3. One was created today at 12:01 (**APPEAL1389**) — but by 3230, not us.

⇒ The **"link us to one of the 3 status-9 NPOs" ask stands** — it is still the cheapest unblocker for suite 11, and
this addendum confirms we cannot reach them today.

---

## Addendum 3 — "Submit Query" is the CRM enquiry channel, not an appeal route
Tested the suggested path: public portal → profile dropdown → *Organistions* → one of our NPOs → **Submit Query**.
Used the refused NPO **"Nomfanelo QA Appeal NPO 2026-08-20"** (APPL26-01494, OrgStatus 3 Application Failed).

**Submit Query opens `public-case-create` — "Submit A Query" — and it does have an Appeals path:**
- **Category** options: Application · Annual Compliance · **Appeals** · Voluntary Deregistration · Post Registration ·
  Investigation · Education and Awareness.
- Choosing **Appeals** reveals a required **Case type** with exactly two options: **"Appeal outcome"** and
  **"Appeal Status"**.

Both are queries *about* an appeal — they presuppose one already exists. Completed it end-to-end (Category = Appeals,
Case type = Appeal Status, description) and it **submitted successfully**, creating an `NpoCase`:

| | Result |
|---|---|
| `NpoCase` created | ✅ category **3 (Appeals)**, case type **"Appeal Status"**, bound to our NPO |
| `DeregistrationAppeal` count | **29 → 29** — unchanged, **no appeal created** |
| NPO OrgStatus | **3 → 3** — unchanged |

⇒ **Submit Query lodges a CRM case, not an appeal.** It does not create a `DeregistrationAppeal`, does not change the
NPO's status, and cannot serve as the appeal-lodging route. The conclusion from Addendum 2 stands: the only route to a
genuinely appealable NPO is **Decline → Unsuccessful → OrgStatus 9**.

### ✅ One positive worth recording
The **authenticated** Submit Query **works and binds `npoOrganisation` correctly**. That is a useful contrast with
`bugs/2026-08-18-public-enquiry-submit-broken-npoorganisation-null.md`, where the **anonymous/public** Enquiry
submitted with `npoOrganisation = null`. So that defect is **specific to the unauthenticated path** — worth adding to
its scope rather than leaving it as "enquiry submit is broken".

### ⚠️ And it forced a third correction to the lat/long bug
This screen displays the NPO's address as
*"134 Pretorius Street, Pretoria Central, Pretoria, South Africa, 0002, **(28.18467, -25.7479)**"*.

Checking the stored record for the very NPO whose wizard fields were blank: `DsdAddress 7827cc2f-…` holds
**`latitude: -25.7479`, `longitude: 28.18467`**. **The coordinates are captured and persisted correctly.**

So my earlier claims that coordinates "cannot be captured" and that "the Spatial Map has no data to plot" are both
**withdrawn**. `bugs/2026-08-20-registration-address-latlong-not-populated.md` is retitled and downgraded to
**Low (cosmetic)** — the wizard's two Latitude/Longitude display fields are simply not bound to the resolved values.
That bug has now been wrong three times, each time by inferring a back-end failure from the UI without reading the
persisted entity; the lesson is recorded in the bug file.

---

## Addendum 4 — asked to appeal today's NPO: **not possible**, and now we know exactly why

Attempted it properly: selected the refused NPO **"Nomfanelo QA Appeal NPO 2026-08-20"** (APPL26-01494, OrgStatus **3
Application Failed**) as the **active organisation** first — ruling out the earlier orphan being a stale-active-org
artefact — then `portal-appeals-table` → **Initiate Appeal**. Also checked the NPO's own public profile
(`public-npo-details-view`): 8 tabs, **no Appeals section, no buttons at all**.

Result: **APPEAL1419/20/08/2026** — another orphan. Organisation Name blank, Nature of Appeal both radios disabled.

### 🔑 Root cause: a server-side gate surfacing as an unhandled 500
```
GET /api/services/dsdnpo/AppealActions/GetAppealInitialData?appealId=453deb44-…
→ HTTP 500   {"message":"No Appeal or NPO found"}
```
then a cascade of `Cannot read properties of null (reading 'id')` / `(reading 'nationality')` script errors as the form
rendered from the failed response.

**Control test proves the endpoint is fine and the gate is real** — same call for the two properly-bound appeals:

| Appeal | NPO | HTTP | Result |
|---|---|---|---|
| APPEAL1389 | Test Unsuccessful Letter 01 | **200** | `{npoId, organisationStatus: 9, failedApplication: 1f65a550-…}` |
| APPEAL498 | Test Unsuccessful 03 | **200** | `{npoId, organisationStatus: 9, failedApplication: 99857fe3-…}` |
| **APPEAL1419 (ours)** | — | **500** | `"No Appeal or NPO found"` |

`GetAppealInitialData` is the call that binds the NPO and drives the form — it returns **`organisationStatus`** (which
selects *Refusal To Register* for 9 / *Cancellation Of Registration* for 7) and **`failedApplication`**. It succeeds
when the user has an NPO at OrgStatus 7 or 9 and **throws when they don't**.

### So the answer is: no, today's NPO cannot be appealed
It sits at **OrgStatus 3**, and the appeal backend accepts only **7** or **9**. It *does* have a `failedApplication`
(APPL26-01494) — **the status is the only missing piece**, and no admin action in the product sets 7 or 9. This is not
a portal-side limitation that can be worked around.

### What this adds to the defect
The gate **is** enforced — but server-side, as an unhandled 500, **after** the UI has already created the appeal record:

1. UI lets anyone click **Initiate Appeal** (no gate) → **creates a real appeal**.
2. Server rejects with a **500** carrying a developer-facing message.
3. SPA doesn't handle it → blank form, disabled radios, dead Submit, **nothing shown to the user**.

Eligibility should be checked **before** creating anything, and refused with a handled message
(*"you have no refused or cancelled registration to appeal"*), not a 500.

⚠️ **Orphan count is now 4** (`APPEAL1415`, `APPEAL1417`, `APPEAL1419`, plus the unreferenced 2026-08-13 one) — all
`npo: null`, all invisible in the appeals table, none deletable through the UI. Cleanup needs a dev.

📌 Minor: the public NPO profile renders **Primary Contact as a raw GUID** (`9c4ba029-ee…`) instead of a name.
