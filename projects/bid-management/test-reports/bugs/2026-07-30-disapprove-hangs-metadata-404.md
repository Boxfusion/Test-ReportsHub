# BUG: "Disapprove" hung indefinitely (2026-07-30 → 2026-08-03 09:29) — NOT REPRODUCIBLE from 09:35, cause unidentified

> # ⚠️⚠️ STATUS 2026-08-03: NOT REPRODUCIBLE. Cause never identified. Do not close — watch for recurrence.
>
> **What is certain:**
> - It hung **reproducibly 5/5** from 2026-07-30 to 2026-08-03 ~09:29 — permanent spinner, no dialog, no
>   commit, no message.
> - It has **worked every time since ~09:35**, in **both** view modes, committing properly to status
>   **Declined**:
>   - **Live** mode, REF2026-1106 (the same tender that hung 3× minutes earlier) → Declined
>   - **Latest** mode, fresh REF2026-0855 → Declined
> - The manual tester also disapproved successfully (REF2026-0843 today; REF2026-1199 back on 2026-07-31).
>
> **Three hypotheses have been tested and ELIMINATED:**
> 1. ❌ **"The `Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender` 404 causes it."**
>    The identical 404 fires in every **successful** run too, immediately before `UserTaskComplete` → 200.
>    It is a real config wart (also 404s ×3 on the healthy Capture-Functionality-Scores page) but **not the
>    cause**.
> 2. ❌ **"It's data / tender age."** A tender created minutes earlier failed identically (REF2026-0843, 09:29).
> 3. ❌ **"It's view mode — Latest serves a broken draft, Live serves working v8."** This looked compelling for
>    ~20 minutes and is **wrong**. Latest now works too. Decisive evidence: the form-config request in the run
>    that **hung** (09:29, Latest) and the run that **worked** (09:53, Latest) carry the **identical**
>    `md5=53F860F0DC3722155BE873A894ED4D63`, both answered **304**. Same form content, same view mode, opposite
>    outcomes — **the form version is not the variable.**
> 4. ❌ **"The md5/304 proves the current version is broken."** Invalid reasoning; a 304 only says the cached
>    copy of the requested version is current. Retracted.
>
> **What changed between 09:29 and 09:35 is UNKNOWN.** Candidates not yet ruled out:
> - **Network conditions.** The office connection was measurably degraded in that window — a `page.goto` to
>   `/login` timed out at 30 s during the 09:33–09:39 test run. A form-init that stalls on a never-returning
>   request looks *exactly* like this: permanent spinner, no error. This is currently the **leading**
>   hypothesis, but the 2026-07-30 failures were on a different day, which weakens it.
> - A server-side deploy, cache flush or `EntityConfig` resync we have no visibility of.
>
> **Recommendation:** keep this open as *not reproducible*. If it recurs, capture immediately: **view mode**,
> the **form version badge** on the dialog (or its absence), the **full network waterfall including pending
> requests**, and whether other pages are slow at the same moment.

| Field | Value |
|---|---|
| **Logged** | 2026-07-30 · **corrected 2026-08-03** |
| **Project** | PD Bid Management (`projects/bid-management`) |
| **App / Env** | Supply Chain Management Admin Portal — **QA** (`https://pd-supplychainmanagement-adminportal-qa.shesha.app`) |
| **Status** | **NOT REPRODUCIBLE** since ~09:35 on 2026-08-03. Works in **both** view modes. **Cause never identified — do not close.** |
| **Severity while it was occurring** | **Blocker** — unusable, no workaround. Per the test lead **users get `Latest`**, so this WAS user-facing for as long as it lasted. |
| **Priority** | Medium — nothing to fix until it recurs, but the silent-spinner failure mode below is worth fixing regardless |
| **Reproducibility** | **5/5 while broken** (REF2026-1106 ×3, REF2026-1110 ×1, fresh REF2026-0843 ×1 — all Latest) → **0/3 since** (Live: REF2026-1106 · **Latest: REF2026-0855** · manual: REF2026-0843) |
| **Stage** | Review and Approve Tender Details — `tender-wf-review-and-approve-details v27` |
| **Dialog form** | `tender-reason for disapproval v8` — **identical `md5=53F860F0DC3722155BE873A894ED4D63` (304) in BOTH a hanging run and a working run**, so the form version is **NOT** the variable |
| **Role** | Reviewer — **MhlotiM / 123qwe** |
| **Found by** | Negative-path testing (plan TC-20), live via Playwright MCP |

## Diagnosis: UNRESOLVED

**There is no confirmed root cause.** Every hypothesis raised so far has been eliminated — see the status block
at the top of this document. The failure signature was consistent: Disapprove enters a loading state, no dialog
renders, **no workflow request is ever sent**, the button never resets. The tender was left completely untouched
every time, so nothing was corrupted.

The `Boxfusion.BidManagement.Domain.Tenders.Tender` **404 is real but incidental** — it fires identically in
the successful runs. It remains worth dev's attention as a stale pre-rename namespace (it also 404s ×3 on the
healthy Capture-Functionality-Scores page, so working form configurations reference it too), but it does not
explain this defect.

**Leading unproven hypothesis: network conditions.** The office connection was measurably degraded during the
window — a `page.goto` to `/login` timed out at 30 s in the 09:33–09:39 test run. A form initialisation that
stalls on a request which never returns looks *exactly* like this: permanent spinner, no error, no request
logged as complete. Against it: the 2026-07-30 failures were on a different day. Not established either way.

## The one defect that is definitely real and still actionable

**A form-initialisation failure surfaces nothing to the user and never resets the button.** Whatever stalled,
the user got a permanent spinner with no message, no timeout, and no recovery short of reloading the page. That
failure mode is the reason this was mis-diagnosed three separate ways across five days. **Worth fixing
independently of the root cause:** a stalled init should time out, surface an error and re-enable the control.

## Behaviour of Disapprove, now that it has been observed (2026-08-03, confirmed in BOTH view modes)

- **It is TERMINAL, not a rework loop.** The dialog states: *"After clicking 'Submit', this Tender Request will
  be terminated. A notification will be sent to the Initiator with the disapproval message attached."*
- Resulting status is **Declined**; the item leaves the reviewer's Inbox and does not return to the initiator
  as an actionable task.
- **The reason is mandatory** — enforced by *hiding* the dialog's Submit button while the field is empty
  (verified both ways: cleared → Submit disappears; retyped → Submit returns). Not disabled, no validation
  message. Note the textarea itself carries neither `required` nor `aria-required`.
- The **dialog's** Submit is the commit; the page footer's Submit stays disabled throughout — same pattern as
  Send Back.
- 🔴 **The reason is NOT visible on the initiator's tender view** (`tender-wf-details-view v27` shows
  status DECLINED but no reason/disapproval text anywhere). Whether the promised notification actually carries
  it is **untested** — QA has no access to the notification channel. Worth raising separately.

---

# Original report (2026-07-30) — all observations below are **Latest mode only**

## Summary *(as originally written — severity and cause since corrected above)*

On the **Review and Approve Tender Details** stage, clicking **Disapprove** puts the button into a
**loading spinner that never resolves**. No dialog opens, no validation message appears, no workflow request
is ever sent, and the tender is left exactly where it was.

~~The cause is a **broken form configuration**… The metadata lookup 404s, form initialisation throws, and the
button is left spinning.~~ **← RETRACTED: the same 404 occurs in the working Live run. See the corrected
diagnosis above.**

## Steps to reproduce

1. Sign in as the reviewer **MhlotiM / 123qwe** and switch the view mode to **Latest**.
2. Go to **Workflows → Inbox** and open a tender at **Review and Approve Tender Details**
   (e.g. REF2026-1106 or REF2026-1110, both parked there now).
3. Confirm the page offers three decisions: **Approve**, **Disapprove** and (in the footer) **Send Back**.
4. Click **Disapprove**.

## Expected

The reason-for-disapproval form opens (its configuration exists — `tender-reason for disapproval`), the
reviewer captures a reason, and the tender moves to whatever terminal/rework state Disapprove is meant to
produce.

## Actual

- The **Disapprove** button switches to a **loading spinner and stays there indefinitely** (observed >50 s).
- **No dialog, no toast, no validation message** — nothing tells the user anything went wrong.
- **No workflow API call is made.** The last requests are the form fetch and the failed metadata lookup;
  there is no POST of any kind.
- The tender is **unchanged** — still in MhlotiM's Inbox at *Review and Approve Tender Details*, same
  `todoid`, status still *Submitted*. Nothing is corrupted, but nothing happens either.
- **Approve** and **Send Back** on the same page are unaffected and work normally.

## Root cause evidence

Network trace on the click (authenticated, same session):

```
[GET] /api/services/Shesha/FormConfiguration/GetByName
        ?name=tender-reason%20for%20disapproval&module=Shesha.SupplyChainManagement   → 304 Not Modified
[GET] /api/services/app/Metadata/Get
        ?container=Boxfusion.BidManagement.Domain.Tenders.Tender                      → 404 Not Found
```

Console on the click:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
  …/api/services/app/Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender
Failed to fetch metadata of type "Boxfusion.BidManagement.Domain.Tenders.Tender"
  AxiosError: Request failed with status code 404
    at Bv.getMetadata → b7.applyFormSettingsAsync → b7.loadFormByIdAsync → b7.initByFormId
```

So: the **form exists** (304 = cached and valid) but the **entity type it is bound to does not**.
`applyFormSettingsAsync` throws inside form initialisation, so the dialog never renders — and because the
throw is swallowed, the button's loading state is never cleared.

**Where the correct type is visible:** on the very same page, the working requests bind to
**`Shesha.SupplyChainManagement.Domain.RfxWorkflow`** —
e.g. `/api/dynamic/Shesha.SupplyChainManagement/RfxWorkflow/Crud/Get?...` → **200**, and
`/api/StoredFile/EntityProperty?...&ownerType=Shesha.SupplyChainManagement.Domain.RfxWorkflow` → **200**.

`Boxfusion.BidManagement.Domain.Tenders.Tender` looks like a **pre-rename namespace left behind** in this
one form's settings.

## Suggested fix (for dev)

Repoint the `tender-reason for disapproval` form's model type from
`Boxfusion.BidManagement.Domain.Tenders.Tender` to the entity this build actually exposes
(`Shesha.SupplyChainManagement.Domain.RfxWorkflow`, per the working calls on the same page), then re-test
Disapprove end-to-end. Worth grepping the other form configurations for the same stale
`Boxfusion.BidManagement.Domain.*` namespace — if one form still carries it, others may too.

**Separate, smaller issue worth raising with it:** a form-initialisation failure should surface to the user
and reset the button, rather than leaving a permanent spinner with no message.

## ⚠️ Scope update 2026-07-30 — a SECOND decision on a different stage *(⚠️ Latest-mode observation — NOT re-verified in Live)*

> **2026-08-03 caveat:** everything in this section was observed in **Latest** mode. Since Disapprove itself
> turned out to work in Live, **"Bid is non-responsive" must be re-tested in Live before any of the claims
> below are treated as real.** The "one mis-bound form disables two decisions" framing is very likely wrong in
> the same way the Disapprove framing was.

While testing the below-minimum functionality scenario (`bugs/2026-07-30-no-qualifying-bid-has-no-working-outcome.md`),
**"Bid is non-responsive"** on *BEC: Finalise recommendation* was found to hang identically. Its network trace
is the same two requests:

```
[GET] /FormConfiguration/GetByName?name=tender-reason%20for%20disapproval&module=Shesha.SupplyChainManagement → 200
[GET] /Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender                                  → 404
```

So **one mis-bound form disables at least two decisions on two stages**:

| Stage | Decision | State |
|---|---|---|
| Review and Approve Tender Details (TC-02) | **Disapprove** | dead |
| BEC: Finalise recommendation (TC-12) | **Bid is non-responsive** | dead |

This raises the impact considerably: "Bid is non-responsive" is the **only correct outcome** when no bid
qualifies technically, so its failure leaves such a tender with no legitimate exit at all.

**Retest both decisions together once the form's entity binding is fixed.** Also worth grepping the form
configurations for a related malformed namespace seen on the same page:
`Boxfusion.BidManagement.Domain.Domain.TenderEvaluations.EvaluationPanelMember` (note the doubled `.Domain.`)
→ also **404**.

## Notes

- Unrelated pre-existing console error on this page **at load** (present before any click, on both tenders,
  and it does not block the happy path):
  `executeScriptSync error TypeError: Cannot read properties of undefined (reading 'isOnProcurementPlan')`.
  Flagged only so it is not mistaken for part of this defect.
- **Retest data is ready:** **REF2026-1106** and **REF2026-1110** are both parked at *Review and Approve
  Tender Details* in MhlotiM's Inbox, untouched, specifically so this can be re-verified once fixed.
- Because Disapprove never commits, **what the decision is supposed to do is still unknown** — terminal
  rejection vs a rework loop. Plan **TC-20** documents the case but its expected outcome cannot be
  confirmed until the form loads.

---

## 🔴 RETEST 2026-08-03 — still broken, unchanged, and the scope is wider again

Re-driven live via Playwright MCP as **MhlotiM / 123qwe**, view mode **Latest**, on the parked retest tender
**REF2026-1106** (still sitting at *Review and Approve Tender Details*, status *Submitted*, same `todoid`,
"Received from Maand-awe Mamathuntsha 4 days ago"). **Nothing has changed. Reproduction is now 4/4.**

**Confirmed identical, step for step:**
- All three decisions render — **Approve**, **Disapprove**, footer **Send Back**; **Submit** disabled.
- Clicking **Disapprove** → the button becomes `loading Disapprove` and **stays spinning**. Waited **45+ s**
  (previously >50 s). No dialog, no toast, no validation message, no modal in the DOM.
- **Network — the same two requests, ending in the same 404:**
  ```
  [GET] /FormConfiguration/GetByName?name=tender-reason%20for%20disapproval&module=Shesha.SupplyChainManagement → 200
  [GET] /Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender                                  → 404
  ```
- **No workflow call is ever made.** The only POST in the whole session is the framework's
  `EntityConfig/SyncClientApi` (fired *before* the click). Nothing at all after the 404.
- **Console — the same throw chain:**
  `Failed to fetch metadata of type "Boxfusion.BidManagement.Domain.Tenders.Tender" AxiosError: 404`
  `at Bv.getMetadata → b7.applyFormSettingsAsync → b7.loadFormByIdAsync → b7.initByFormId`
- The tender is **unchanged** afterwards — reloaded the Inbox and REF2026-1106 is still at *Review and
  Approve Tender Details* / *Submitted* on the same `todoid`. **Still usable for the next retest.**
- The unrelated load-time error is also still present:
  `executeScriptSync error TypeError: Cannot read properties of undefined (reading 'isOnProcurementPlan')`.

### ⚠️ Scope widened AGAIN — the bad container also 404s on a working page

Independently of this retest, the **Capture Functionality Scores** page
(`tender-wf-capturefunctionalityscores`, TC-09) fires the **same** failing lookup **three times** on load:

```
[GET] /Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender → 404   (×3)
```

Evidence: Playwright trace captured during the 2026-08-03 80/20 chain runs. That page still *renders and
works*, so this is not a third dead decision — but it proves the stale
`Boxfusion.BidManagement.Domain.Tenders.Tender` binding is **not confined to the `tender-reason for
disapproval` form**. It is referenced from at least one healthy form's configuration too. **The grep across
form configurations suggested above is now strongly justified — this is a build-wide stale namespace, not a
single bad form.**

### Status of the sibling decision

**"Bid is non-responsive"** (*BEC: Finalise recommendation*, TC-26) was **not** re-driven today — no tender is
currently parked at that stage in the no-qualifying-bid state. It loads the **same** `tender-reason for
disapproval` form and 404s on the **same** container, so it is **almost certainly still dead** — but that is
an **inference from the shared form, not a fresh observation.** Retest it explicitly when the binding is fixed.

### What remains unknowable

Still **cannot** be established: whether Disapprove is a **terminal** rejection or a **rework** loop, whether
the reason is mandatory, and whether the initiator can see it. Plan TC-20 steps 6–9 stay provisional.
Also note a *second* tender named **REF2026-0968 "testing BID is non responsive"** sits at Review and Approve
in the same Inbox — **created by the manual tester, not ours; do not action it.**

---

## 🔴 RETEST 2026-08-03 (second pass) — reproduced on a BRAND-NEW tender. Now 5/5.

The first retest reused a tender parked on 2026-07-30, which left open the possibility that the defect was
somehow specific to older data or to a stale cached form on that browser profile. **Both explanations are now
ruled out.**

A **fresh tender was created from scratch** — `--grep "TC-01"`, `EVAL_CRITERIA=80/20`, passing in 36.6 s →
**REF2026-0843** ("TC-01 Automated Draft Tender run-msd0zw35 - 80/20 Compulsory Hybrid"). It was opened in a
**new browser session** as MhlotiM (view mode Latest) while the item read *"Received from Maand-awe
Mamathuntsha **a minute ago**"*.

**The behaviour is byte-for-byte identical:**
- Approve / Disapprove / footer Send Back all render; Submit disabled.
- **Disapprove → `loading Disapprove` spinner, still spinning after 30+ s.** No dialog, no modal in the DOM,
  no message of any kind.
- Same two requests, same terminal 404:
  ```
  [GET] /FormConfiguration/GetByName?name=tender-reason%20for%20disapproval&…  → 304 Not Modified
  [GET] /Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender  → 404 Not Found
  ```
- Same console throw chain (`getMetadata → applyFormSettingsAsync → loadFormByIdAsync → initByFormId`), and
  the same unrelated load-time `isOnProcurementPlan` error.
- Only POST in the session is the framework's `EntityConfig/SyncClientApi`, fired before the click.
- REF2026-0843 is **unchanged** afterwards — still at *Review and Approve Tender Details*, dated 03/08/2026,
  same `todoid`.

~~**A stale client cache is specifically excluded.**~~ **← RETRACTED 2026-08-03.** The md5 argument made here
was invalid: a `304` only confirms the client's cached copy of **the version that view mode requests** is
current. Both sessions were in **Latest**, so the 304 said nothing at all about the **published** version. It
does not support the conclusion it was used for.

~~**Conclusion: 5/5 … the fix is entirely in the form's model binding.**~~ **← SUPERSEDED.** The 5/5 figure is
accurate but applies **only to Latest mode**. In **Live** mode the same tender (REF2026-1106) disapproved
successfully on the first attempt minutes later. See the corrected diagnosis at the top of this document.

**What the fresh-tender pass DID legitimately establish:** the Latest-mode failure is not data-specific and
not tender-age related — a tender created minutes earlier fails identically. That part stands.

**Retest data status (2026-08-03):**
- **REF2026-1106 — CONSUMED.** Used for the Live-mode A/B; now **Declined**.
- **REF2026-0843 — CONSUMED.** Disapproved manually by the tester; now **Declined**.
- **REF2026-1110 — still parked** at Review and Approve, untouched.
