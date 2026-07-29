# BUG — LOGIS "Capture and Link": the "No / payment should not proceed" branch cannot be submitted

| | |
|---|---|
| **Logged** | 2026-07-29 |
| **Severity** | **High** — the whole No-branch is unreachable through the UI; and the one enabled control applies the *opposite* decision |
| **Environment** | **TEST** — https://dha-smartgov-adminportal-test.shesha.app |
| **Process / step** | LOGIS Request For Payment → **Capture and Link Invoice on LOGIS** |
| **Plan** | `test-plans/invoice-process/logis.md` **TC-11** (the "No" branch note) |
| **Item** | **PAY3086/2026**, instance `43beeae9-78bc-4ea7-a466-ef67300165b5` — Order OR-126152, invoice DHA-LOG-3086, R101.50 |
| **Actor** | `H23086050` (LESETJA JACK BAMBO), a member of `Capture Payment on LOGIS` |

## Symptom

With every field the form asks for completed:

- Payment Number **3086** typed and saved via the inline Save (`…/Crud/Update` → **200**)
- **"Should payment proceed?" = No**
- the sub-option revealed by No — **"Send to Business Unit"** — selected
- **"I confirm that l have captured this invoice on payment system."** ticked

…the **visible `Submit` button stays disabled**, and **no validation message is rendered** —
`.ant-form-item-explain` is empty, so there is nothing telling the user what is outstanding.
**A user simply cannot complete this branch.**

## The button states

The step renders three `Submit` buttons:

| Submit | `disabled` | width (px) |
|---|---|---|
| #1 | **false** | **0 — hidden** |
| #2 | true | 0 — hidden |
| #3 | true | **75 — visible** |

The only **enabled** Submit is **hidden**; the only **visible** Submit is **disabled**. That is inverted
from every other step in this workflow (Certify, Approve, Verify Invoice, Pre-Authorise, Capture Filing),
where the visible Submit is the enabled one and the hidden extras are the disabled ones.

## Second, related fault (found via automation)

Clicking the enabled *hidden* button programmatically **did** submit — but it recorded
**`outcome: 1`**, the *proceed* decision, and routed the item to **Pre-Authorise Payment**. In other
words the enabled control belongs to the **Yes** decision and ignores the "No / Send to Business Unit"
selection entirely.

A real user cannot click a zero-size button, so this is **not** a user-reachable path — it is evidence
that the decision-to-button wiring on this form is wrong: the Yes button is enabled while No is selected,
and the No button is the one being disabled.

## Cross-check that isolates the fault to the No outcome

Later in the same run the item came back to this step (via a Pre-Authorise *Send Back to Capture*). On that
pass, with **"Should payment proceed?" = Yes** and the same confirmation ticked, the **visible Submit was
enabled and submitted first time**. So the step itself is fine — the fault is specific to the **No**
outcome.

## Steps to reproduce

1. Drive a LOGIS invoice to *Capture and Link Invoice on LOGIS* (Register → Certify → Approve →
   Assign Responsible Official → Verify Invoice "Verification is complete").
2. Log in as `H23086050` / `123qwe` and open the task.
3. Type a Payment Number; **hover the field** to reveal the inline Save icon and click it (it has a zero
   bounding box until hover).
4. Select **"Should payment proceed?" = No**, then **"Send to Business Unit"** (or *Verify Invoice*).
5. Tick the confirmation.
6. Try to click `Submit`.

**Expected:** Submit is enabled; per TC-11 the No branch routes to *Verify Invoice* or
*Send to Business Unit*, each with a mandatory comment.
**Actual:** the visible Submit is permanently disabled with no explanation.

## Impact

- The **No / payment-should-not-proceed** branch of Capture and Link is completely unusable — a capturer
  who finds a problem on LOGIS cannot stop the payment at this step.
- Both No destinations (*Verify Invoice*, *Send to Business Unit*) and their mandatory-comment dialogs are
  therefore **untested and untestable** until this is fixed.

## Asks

1. Enable the correct `Submit` for the **No** outcome (or, if something is genuinely still required,
   surface it as a validation message instead of a silently disabled button).
2. Review the decision→button wiring on
   `…/SAGovRequestForPayment-wf-CaptureandLinkInvoiceonLOGIS-Details v7` — an enabled button that applies
   `outcome 1` while `No` is selected would post the wrong decision if it were ever clickable.

## Retest note

PAY3086/2026 has since been driven to completion (**PAID + Filed**) so it is no longer usable for a
retest — a fresh LOGIS item will be needed.

## Related

Full run detail: [../2026-07-29/logis-negative-branches.md](../2026-07-29/logis-negative-branches.md) §3.
