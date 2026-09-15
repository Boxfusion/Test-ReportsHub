# Report: NPO-06 — Office Bearer Self-Confirmation (Ryno Koen, APPL26-00817)

**Date:** 2026-08-13 12:08 UTC
**Plan:** test-plans/npo-registration/06-office-bearer-self-confirmation.md
**Spec:** test-plans/npo-registration/06-office-bearer-self-confirmation.spec.ts
**Execution Mode:** ai-repair
**Result:** PARTIAL — the notification and consent journey work; the confirmation is not recorded
**Duration:** 300s
**Cases:** TC-06-001 (ADO #101703), TC-06-002 (ADO #101704) — smoke suite 101863
**Environment:** QA · tokenised email link (no login) + admin portal
**Application:** **APPL26-00817** · office bearer **Ryno Koen** (Chairperson)

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 9 | 7 | 1 | 1 |

## 🔓 This suite was unblocked by the successful submission
NPO-06 was previously marked *"blocked twice over"* — no submitted application, and no reachable mailbox for the
office bearers. **Both conditions were resolved today:** `APPL26-00817` submitted, and OB1's email was set to the
tester's own address so the notification was genuinely receivable.

## TC-06-001 — each OB receives a self-confirmation notification (ADO #101703)
**Mode:** manual (tester's own inbox) · [PASS]
- ✅ **The tester received the self-confirmation email for `Ryno Koen`**, containing a link allowing him to
  consent to being an office bearer at *Nomfanelo QA NPO 2026-08-13*.
- ⚠️ **Partially verified only.** The case requires **each** OB to receive one. Only OB1's address was
  tester-readable; OB2 and OB3 used `qa.ob2.2026@example.org` / `qa.ob3.2026@example.org`, which nobody can read.
  **1 of 3 confirmed.** To close this case properly we need three readable mailboxes — see the ask below.
- 📌 Not verified: whether the SMS leg also fired (the OB mobile numbers were `0818400598` / `…591` / `…592`).

## TC-06-002 — OB confirms and the status updates (ADO #101704)
**Mode:** manual (tester) + admin verification · [PARTIAL]

### ✅ The consent journey works
- The link opened and offered consent to being an office bearer at the named NPO
- The tester consented
- ✅ **A thank-you screen was displayed**, stating that should there be any issues the Department of Social
  Development will be in touch, and giving contact details **0123227500** / **npoinquiry@dsd.gov.za**

That satisfies the *"thank-you screen shown (FDS Fig.14)"* half of the case.

### 🔴 The confirmation is NOT recorded — the substantive half fails
Verified on the admin portal at
`/dynamic/boxfusion.dsdnpo/npoapplication-details?id=6c45a022-6cc8-4696-93bf-e1fdf41ce4f3&mode=edit`
→ **Particulars Of Office Bearers**, read **after a full page reload**:

| Office bearer | Route | Is ID Verified? | **Is OB Self-Verified?** |
|---|---|---|---|
| **Ryno Koen** | SA ID (DHA) | **Yes** ✅ | 🔴 **No** |
| Thabo Molefe | Passport | No | No |
| Lerato Dlamini | Passport | No | No |

- [FAIL] **(BLOCKING)** ASSERT the self-confirmation is recorded against the office bearer — `Is OB Self-Verified?`
  is still **`No`**.

**Why this is convincing rather than a caching artefact:** `Is ID Verified? = Yes` on the *same row*. The row is
being written to; it is specifically the self-confirmation flag that is not updating. Re-read after a full
reload, roughly ten minutes after the consent.

⚠️ **Not ruled out:** a delayed or batch job that sets the flag. **Ask the developer before accepting this as a
defect.** Bug: `test-reports/bugs/2026-08-13-ob-self-confirmation-not-recorded.md`.

## 🔑 Correction — the `ID Verified` status DOES exist
An earlier report today claimed the OB grid has **no verification-status column**, treating ADO #101655's
prescribed `ID Verified` as missing. **That was wrong.** It is absent from the **public wizard's** grid, but the
**admin** view carries a full set:

`Is On Un Sanctions List · Is ID Verified? · Dha Verification Invalidation Reason · Is OB Self-Verified? ·
Is Cpr Valid`

`Is ID Verified?` correctly reads **Yes** for the DHA-verified office bearer and **No** for the two passport
ones — so that mechanism works as intended. The earlier finding is **downgraded to a question**: should the
*applicant* see verification status in their own wizard, or is it deliberately admin-only?

## Other observations
1. ⚠️ **Location fields look blank on the admin application view.** *Province · District Municipality ·
   Metropolitan Municipality · Area Code* render empty under both Physical and Postal Address, even though they
   populated correctly on the public wizard (Gauteng · City of Tshwane · 0149). **Worth a dedicated check** — it
   may be a display issue on the admin subform, or the derived values may not persist. If the latter, it changes
   the severity of the address finding significantly.
2. **Application header reads:** `Nomfanelo QA NPO 2026-08-13 - APPL26-00817 · APPLICATION IN PROGRESS ·
   NOT RECOGNISED · MEMBERSHIP`. *"NOT RECOGNISED"* is a status we have not seen documented — worth asking what
   it means and what clears it.
3. 🔑 **Admin application-details URL pattern:**
   `/dynamic/boxfusion.dsdnpo/npoapplication-details?id=<applicationId>&mode=edit`
   Tabs: *Application Details · Organisation Details · Objectives · Particulars Of Office Bearers · Particulars Of
   Control Structure · NPO Admin and Operations · Area of Operation · Declarations*.
4. ⚠️ **`All Applications` grid hung on load** — spinner (`aria-busy="true"`) for 30 s+ with zero populated rows,
   blocking clicks. It had loaded earlier the same session, so this is intermittent. The underlying
   `GetAll?entityType=Npo.Application&quickSearch=APPL26-00817` call returned **200**, so the API is answering —
   the fault appears to be client-side rendering. Relevant to **TC-07-002 / TC-07-003**; needs its own run.
5. SA ID and passport numbers are **masked** in the admin grid (`800101*******`, `A98765***`) — good POPIA
   behaviour, worth noting positively for suite 14Y.

## ❓ Asks for the test lead / developer
1. **Is there a delayed job that sets `Is OB Self-Verified?`** — decides whether this is a defect or a timing artefact.
2. **Can we get 3 QA-readable mailboxes** for office bearers, so TC-06-001 can be closed for *each* OB rather than one?
3. Does the SMS leg of the OB notification fire, and to which number?
4. What is **`Is Cpr Valid`**, and what does the application status **`NOT RECOGNISED`** mean?
5. Should office-bearer verification status be visible to the applicant, or admin-only by design?

## ▶ Next
- Resolve the self-confirmation question with the developer.
- **Process `APPL26-00817` on the admin side** — NPO-07 TC-05/06/07 (OB Compliance → Document Verification →
  approval → NPO number + certificate). It is our own record, so it is safe to action. ⚠️ Note OB Compliance may
  gate on all three office bearers having self-confirmed, which the defect above would block.
