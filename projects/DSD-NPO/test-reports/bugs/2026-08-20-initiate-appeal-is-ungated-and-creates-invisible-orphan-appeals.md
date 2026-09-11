# Bug: "Initiate Appeal" is ungated and silently creates orphan appeals that cannot be submitted, seen or deleted

**Date:** 2026-08-20
**Severity:** **High** — the appeal entry point works for users who have no appealable NPO, and every appeal it creates
for them is permanently unusable and invisible. Real applicants would be left believing they had lodged an appeal.
**Area:** Public portal → `portal-appeals-table` → **Initiate Appeal** → `npo-appeal-application`
**Environment:** QA
**Found by:** testing whether an *unfinished* registration produces an appeal-eligible ("unregistered") NPO

> ### This corrects the earlier "the Appeal button is status-gated" note
> The register's suite 11 row said the Appeal button "only shows when the NPO is Cancelled (7) or Not Registered (9)".
> **That is wrong for this route.** On `portal-appeals-table` the **Initiate Appeal button is always present and
> enabled**, regardless of NPO status — and our account holds **no** NPO at status 7 or 9. What is actually gated is
> the *content* of the form it opens, and it fails silently rather than blocking.

## Summary
Clicking **Initiate Appeal** immediately creates a real `Npo.DeregistrationAppeal` record with a reference number.
For an account with no appeal-eligible NPO, that record is an **orphan**:

| | Observed |
|---|---|
| Organisation Details → **Name** | **blank** — no NPO bound (`npo: null` in the record) |
| **Nature of Appeal** (*Refusal To Register* / *Cancellation Of Registration*) | **both radios disabled and unchecked** — cannot be set |
| **Submitting Office Bearer** picker | **"No data"** — no NPO, so no office bearers to search |
| **Submit** | **permanently disabled**, even with every starred field filled |
| Appeals table listing | **"0 items found" / "No data"** — the appeal never appears |

I filled every required field — Preferred Representation Mode = *Written Submission*, Declaration Name, Surname and
Capacity = *Chairperson* — and **Submit stayed disabled**, with no inline error and no message. The form cannot be
completed because `natureOfAppeal` and the NPO binding are derived from an NPO at OrgStatus 7 or 9, and neither is
user-settable.

## The "only one active appeal" rule is not enforced
The page displays: *"You already have an existing Appeal that is either in Draft or In Progress status. Only one active
appeal may exist at a time. If your appeal is in Draft status, please complete and submit it or delete it before
creating a new appeal."*

That text is **static and the rule is not enforced.** Two consecutive clicks created two separate appeals —
**APPEAL1415/20/08/2026** and **APPEAL1417/20/08/2026** — 2 minutes apart. Every click mints another orphan. And
because the table lists none of them, the instruction to "complete and submit it or delete it" is impossible to follow:
there is no UI route to either.

## Ownership evidence — this is specific to accounts without an eligible NPO
Of the 29 appeals in QA, sorted by creation:

| Ref | NPO bound | Creator | Status |
|---|---|---|---|
| APPEAL1417/20/08/2026 | **null** | **15918 (us)** | 1 |
| APPEAL1415/20/08/2026 | **null** | **15918 (us)** | 1 |
| APPEAL1389/20/08/2026 | Test Unsuccessful Letter 01 | 3230 (dev) | 1 |
| *(no ref)* 2026-08-13 | **null** | **15918 (us)** | 1 |
| APPEAL498/10/08/2026 | Test Unsuccessful 03 | 3230 (dev) | 1 |
| APPEAL473/10/08/2026 | Test Unsuccessful 03 | 3230 (dev) | **2** |
| APPEAL357/07/08/2026 | Decline NPO Validation | 3230 (dev) | **2** |
| APPEAL355/07/08/2026 | Decline NPO Validation | 3230 (dev) | **3** |

**Every appeal our account (15918) has ever created has `npo: null`** — including one from 2026-08-13 that has no
reference number at all. **Every properly-bound appeal belongs to dev user 3230**, against the three status-9 NPOs, and
those are the only ones that progressed past status 1.

⚠️ Note for us: APPEAL1389 was created **today at 12:01** against a status-9 NPO, but by **user 3230, not us** — so we
do **not** have working access to those NPOs, and they are absent from our portal's *Organistions* list. The
"link us to one of the 3 status-9 NPOs" ask stands.

## Steps to reproduce
1. Log in to the public portal as a user with **no** NPO at OrgStatus 7 or 9.
2. Go to `/dynamic/boxfusion.dsdnpo/portal-appeals-table` → the **Initiate Appeal** button is present and enabled.
3. Click it → an appeal is created with a reference (e.g. `APPEAL1415/20/08/2026`) and the form opens.
4. Note **Organisation Name blank**, **Nature of Appeal disabled**, office-bearer picker **"No data"**.
5. Fill Preferred Representation Mode + Declaration Name/Surname/Capacity → **Submit stays disabled**.
6. Return to the appeals table → **"0 items found"**; the appeal is invisible.
7. Click **Initiate Appeal** again → a **second** appeal is created, despite the one-active-appeal notice.

## Expected
- If the user has no NPO in an appealable state, **Initiate Appeal should be hidden or disabled with an explanation**
  ("you have no refused or cancelled NPO to appeal"), and **no record should be created**.
- Appeals in Draft must be **listed** in the appeals table so they can be completed or deleted.
- The one-active-appeal rule should actually be enforced, or the notice removed.
- If the form is opened without a bound NPO, it should let the user **choose** the NPO, not present a dead form.

## Actual
Ungated button → real record created → unusable, invisible, undeletable → repeatable without limit.

## Impact
- A refused applicant who clicks Appeal gets a form they can fill in but never submit, and no feedback explaining why.
  They would reasonably believe an appeal had been lodged. For a statutory appeal right this is serious.
- Junk `DeregistrationAppeal` rows accumulate silently — **4 of the 30 appeals in QA are now our orphans** (see the root-cause section below).
- The appeals table being unable to list Draft appeals means the documented remedy ("complete and submit it or delete
  it") cannot be performed at all.

## Questions for the test lead (Thabiso)
1. Should **Initiate Appeal** be visible at all to a user with no appealable NPO? If it must stay visible, should it
   offer an NPO picker rather than relying on a derived binding?
2. **Why does the appeals table never list Draft appeals?** Is it filtered on submitted-only, and if so how is the user
   meant to delete a Draft as the notice instructs?
3. Is the one-active-appeal rule intended to be enforced server-side? It currently is not.
4. Can the **4** orphan appeals on our account (`APPEAL1415`, `APPEAL1417`, `APPEAL1419`, and the unreferenced
   2026-08-13 one) be cleaned up? There is no UI route to remove them.
5. **Should `GetAppealInitialData` return 500 for an ineligible NPO?** A handled 400/404 plus a user-facing message
   would turn this whole defect into a one-line explanation on screen.

---

## 🔑 ROOT CAUSE FOUND (2026-08-20, later) — `GetAppealInitialData` returns HTTP 500 "No Appeal or NPO found"

Retried the appeal deliberately against **our own refused NPO**, with that NPO set as the **active organisation**
(profile → *Organistions* → "Nomfanelo QA Appeal NPO 2026-08-20", OrgStatus **3 Application Failed**) — to rule out the
earlier orphan being caused by a stale active-org. Same result: **APPEAL1419/20/08/2026**, Organisation Name blank,
Nature of Appeal both disabled.

The console then gave the actual cause:

```
GET /api/services/dsdnpo/AppealActions/GetAppealInitialData?appealId=453deb44-…
→ HTTP 500
{"success":false,"error":{"message":"No Appeal or NPO found","details":"No Appeal or NPO found"}}
```

followed by a cascade of `TypeError: Cannot read properties of null (reading 'id')` and
`... (reading 'nationality')` script errors as the form tried to render from the failed response.

### Control test — the endpoint is NOT broken, the gate is real
Called the same endpoint for the two properly-bound appeals (dev user 3230's, against status-9 NPOs):

| Appeal | NPO | HTTP | Result |
|---|---|---|---|
| APPEAL1389/20/08/2026 | Test Unsuccessful Letter 01 | **200** | `{npoId, organisationStatus: 9, failedApplication: 1f65a550-…}` |
| APPEAL498/10/08/2026 | Test Unsuccessful 03 | **200** | `{npoId, organisationStatus: 9, failedApplication: 99857fe3-…}` |
| APPEAL1419/20/08/2026 (ours) | — | **500** | `"No Appeal or NPO found"` |

So `GetAppealInitialData` is what binds the NPO and drives the form: it returns **`organisationStatus`** (which selects
*Refusal To Register* for 9 / *Cancellation Of Registration* for 7) and **`failedApplication`**. It works correctly when
the user has an NPO at OrgStatus 7 or 9, and **throws when they do not**.

### Revised diagnosis
The appeal gate **is enforced — but server-side, as an unhandled 500, after the UI has already created the record.**
That is the whole defect in one line:

1. UI lets anyone click **Initiate Appeal** (no gate) → **creates a real appeal record**.
2. Server rejects it with a **500** and a developer-facing message.
3. SPA doesn't handle the 500 → blank form, disabled radios, "No data" office bearers, dead Submit, **no message to the user**.

Correct behaviour would be to check eligibility **before** creating anything, and to tell the user
*"you have no refused or cancelled registration to appeal"* — a **400/404 with a handled message**, not a 500.

### Bearing on our NPO specifically
**The NPO refused today cannot be appealed.** It sits at **OrgStatus 3 (Application Failed)**, and the appeal backend
recognises only **7 (Cancelled)** or **9 (Not Registered)**. It does have a `failedApplication` (APPL26-01494) — the
only missing piece is the status, and **no admin action in the product sets 7 or 9** (see
`2026-08-20-no-way-to-cancel-an-npo-and-decline-is-the-real-appeal-route.md`). This is not a UI limitation that can be
worked around from the portal.

### Orphan count now 4
`APPEAL1415`, `APPEAL1417`, `APPEAL1419` (all today) plus the unreferenced 2026-08-13 one — all `npo: null`, all
invisible in the appeals table, none deletable through the UI.
