# Office-bearer self-confirmation shows a thank-you screen but is NOT recorded

**Date found:** 2026-08-13
**Severity:** 🔴 **High** — the office-bearer confirmation is the control that proves the named people really are
office bearers of the NPO. If it silently fails to record, an application can never satisfy the OB-confirmation
gate, and DSD assessors have no evidence the office bearers ever agreed.
**Fails:** **ADO #101704 / TC-06-002** — *"OB self-confirmation recorded; thank-you screen shown (FDS Fig.14)"*.
The thank-you screen shows; **the recording does not happen.**
**Module:** DSD-NPO · tokenised email link (no login) → admin portal
**Environment:** QA
**Application:** **APPL26-00817** (`id=6c45a022-6cc8-4696-93bf-e1fdf41ce4f3`)
**Office bearer:** `Ryno Koen` — Chairperson, SA ID `8001015009087`, email `Nomfanelo.Nhleko@boxfusion.io`

## Steps to reproduce
1. Submit an NPO registration application naming at least 3 office bearers (here: `APPL26-00817`)
2. The chairperson receives the self-confirmation email — ✅ this works (**TC-06-001 passes**)
3. Open the tokenised link from that email and consent to being an office bearer
4. **A thank-you screen is displayed**, reading that should there be any issues the Department of Social
   Development will be in touch, with contact details **0123227500** / **npoinquiry@dsd.gov.za**
5. On the admin portal open the application →
   `/dynamic/boxfusion.dsdnpo/npoapplication-details?id=<applicationId>&mode=edit`
   → tab **Particulars Of Office Bearers**

## Observed
`Ryno Koen`'s row, read after a **full page reload** roughly ten minutes after the confirmation:

| Column | Value |
|---|---|
| Position | Chairperson |
| Is On Un Sanctions List | No |
| **Is ID Verified?** | **Yes** ✅ *(DHA verification did record correctly)* |
| Dha Verification Invalidation Reason | *(blank)* |
| **Is OB Self-Verified?** | 🔴 **No** |
| Is Cpr Valid | No |

**`Is OB Self-Verified?` remains `No`** despite the confirmation having been completed and acknowledged on screen.

The contrast with `Is ID Verified? = Yes` on the same row is what makes this convincing: the DHA verification
flag **did** persist for this office bearer, so the row is being written to — it is specifically the
self-confirmation flag that is not.

For comparison, the two passport-captured office bearers (`Thabo Molefe`, `Lerato Dlamini`) show `No` for both
flags, which is expected — neither was DHA-verified and neither has confirmed yet.

## Expected
Per ADO #101704: the self-confirmation is **recorded** against that office bearer. `Is OB Self-Verified?` should
become `Yes`.

## Notes and caveats
- The confirmation was performed **by the tester in their own browser**, from the real email — not automated. So
  this is not a harness artefact.
- ⚠️ **Not ruled out:** a scheduled/batch job that updates the flag on a delay. If such a job exists, this
  report should be re-checked after it runs before the defect is accepted. **Worth asking the developer first.**
- The thank-you screen gives the applicant every reason to believe the step is done, which is what makes a silent
  failure here damaging — nobody would know to retry.

## 🔑 Correction to an earlier finding in this project
An earlier report claimed the office-bearer grid has **no `ID Verified` status**, and treated ADO #101655's
prescribed status as missing. **That was wrong** — it is missing from the **public wizard's** OB grid, but the
**admin** application-details view carries a full set of verification columns:

`Is On Un Sanctions List · Is ID Verified? · Dha Verification Invalidation Reason · Is OB Self-Verified? ·
Is Cpr Valid`

So the status exists; it is simply **not surfaced to the applicant**. The remaining question for the test lead is
whether the *applicant* should see verification status on their own wizard, or whether that is deliberately
admin-only. Reduce that earlier finding to a **question**, not a defect.

## ❓ Asks
1. Is there a **delayed/batch job** that sets `Is OB Self-Verified?` If not, this is a straightforward defect.
2. Should the applicant see office-bearer verification status in the wizard, or is it admin-only by design?
3. What is `Is Cpr Valid`? It reads `No` for all three office bearers, including the DHA-verified one.
