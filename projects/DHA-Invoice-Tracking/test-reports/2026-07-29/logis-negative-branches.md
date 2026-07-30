# Report: LOGIS Negative Branches — DHA Invoice Tracking on TEST

**Date:** 2026-07-29 06:46 UTC
**Plan:** test-plans/invoice-process/logis.md (TC-04, TC-06, TC-08 branches, TC-11 "No", TC-12 send-back)
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-test.shesha.app/ (**TEST**)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ⚠️ MIXED — 3 branches PASS, **2 defects found** (1 blocker-class, 1 dead end)
**Duration:** ~35 min
**Items driven:** PAY3076/2026, PAY3082/2026, PAY3086/2026 (three fresh LOGIS registrations)

## Summary
| # | Branch | Item | Result |
|---|---|---|---|
| 1 | Certify → **"I am the wrong person to confirm the delivery"** (TC-04 re-route) | PAY3076 | ⛔ **DEAD END** — re-route task has no assignee |
| 2 | Verify Invoice → **Reject Invoice** | PAY3082 | ✅ PASS |
| 3 | Review Invoice Rejection → **Send for Invoice Verification** (send-back) | PAY3082 | ✅ PASS |
| 4 | Review Invoice Rejection → **Approve Rejection** (terminal) | PAY3082 | ✅ PASS — workflow **REJECTED**, Completed |
| 5 | Capture & Link → **"No / should payment not proceed"** | PAY3086 | ⛔ **NOT SUBMITTABLE** — visible Submit stays disabled |
| 6 | Pre-Authorise → **Send Back to Capture** | PAY3086 | ✅ PASS |
| 7 | **Recovery after send-back** — re-capture → drive to completion | PAY3086 | ✅ PASS — **PAID + Filed**, Completed |

Every negative outcome opened its own modal with a **mandatory comment** (`Ok`/`OK` disabled until text
is entered) — consistent with BAS.

---

## 1. ⛔ DEFECT — the "wrong person" re-route branch is a dead end (PAY3076/2026)

**Instance** `8f089a43-7cc4-4bd1-b54e-2c91a95c70c2` — Order OR-126151, invoice DHA-LOG-3076, R207.

Certifying with *"I am the wrong person to confirm the delivery"* behaves correctly up to a point:
the dialog *"I am the wrong person to confirm delivery"* appears, demands a comment (`Ok` disabled until
typed), and on OK the workflow records **outcome 3** on *Certify Invoice* and activates a new step
**"Re-route to Correct Business Unit"** (activated 08:14:19, overdue 31/07). No 4xx/5xx anywhere.

**But nobody can action it.** `Process/Progress` reports the active re-route step with
**`assignedTo: []`** — whereas every *other* active step in this project resolves real names in that
same field (e.g. Certify → `["Thabiso Maake"]`, Capture & Link → its five role members).

Verified against **all eight** logins we hold, by two independent means each — the Inbox list **and**
`Process/Details.activeTodoItems` (which is scoped to the calling user):

| Login | Person | In inbox? | `activeTodoItems` |
|---|---|---|---|
| `Admin` | System Administrator (the capturer) | No | `[]` |
| `ThabisoM` | Thabiso Maake (the certifier) | No | `[]` |
| `Mutshutshut` | Mutshutshu Tshithukhe | No | `[]` |
| `00000000` | Melissa Ndlovu | No | `[]` |
| `H18433740` | Monicca J Kabini | No | `[]` |
| `H19234198` | Tshianeo M Maboya | No | `[]` |
| `H10226923` | Susanna M Erasmus | No | `[]` |
| `H23086050` | Lesetja J Bambo | No | `[]` |

**PAY3076 is now stuck** — it cannot be progressed or completed by any available account.

### Ruled out before logging
- **Not the harness** — driven through the real UI; the decision persisted (outcome 3 recorded) and the
  step activated, so the submission itself succeeded.
- **Not a stale page** — re-queried the API after each login.
- **Not an admin-visibility quirk** — Admin, who initiated the item, also has nothing, and
  `canReassign: false`.

### The one thing I could not rule out
The task may be assigned to a **person or role outside our eight accounts** (the same shape as the
HLEKANEI ROSE MATHE query-role gap). The empty `assignedTo` from the API is the strongest counter-signal,
since the same field resolves names for every other active step — but a definitive answer needs someone
with DB/config access to say what `Re-route to Correct Business Unit` is assigned to.

➡️ **Ask:** confirm the intended assignee for *Re-route to Correct Business Unit*. Per plan TC-04 this
step selects the correct Business Unit/End-User, so it most likely belongs to the **invoice capturer**
(`Admin` here) — who does not have it.

---

## 2. ✅ Reject Invoice → Review Invoice Rejection → Approve Rejection (PAY3082/2026)

**Instance** `6e3ae8c7-a452-414d-b904-926b8587073a` — Order **OR-126052**, invoice DHA-LOG-3082,
**R78 520**, supplier **GOVERNMENT PRINTING WORKS (A1960)**.

Driven Register → Certify → Approve → Assign Official → Verify Invoice, then:

| Step | Action | Result |
|---|---|---|
| Verify Invoice | outcome **Reject Invoice** + 7 × Yes | *Reject Invoice* dialog, mandatory comment → routed to **Review Invoice Rejection** (assignees MAHLATSE MAZWI, MONICCA KABINI) |
| Review Invoice Rejection | **Send for Invoice Verification** | *"Send back to review rejection decision"* dialog + comment → returned to **Verify Invoice**; the send-back comment appears as an in-form banner *"Message from MONICCA … to MONICCA …"* |
| Verify Invoice (2nd pass) | **Reject Invoice** again | → Review Invoice Rejection |
| Review Invoice Rejection | **Approve Rejection** | *"Approve payment rejection"* dialog + comment → **status 3 (Completed), subStatus 13 (REJECTED)**, `activeTodoItems: []` |

Final outcomes recorded: Verify Invoice **outcome 2**, Review Invoice Rejection **outcome 2**.

**Finding (minor):** the **send-back clears the Verify Invoice answers** — on the second pass the outcome
radio and all seven Business Unit Response questions were blank and had to be re-entered. Worth knowing
for the plan; arguably correct behaviour, but not documented.

---

## 3. ⛔ DEFECT — Capture & Link "No" branch cannot be submitted (PAY3086/2026)

**Instance** `43beeae9-78bc-4ea7-a466-ef67300165b5` — Order **OR-126152**, invoice DHA-LOG-3086,
R101.50 (PEN BALLPOINT MEDIUM RED).

At *Capture and Link Invoice on LOGIS*, with everything the form asks for completed:

- Payment Number **3086** typed and saved (inline Save, `Update` → 200)
- **"Should payment proceed?" = No**
- the revealed sub-option **"Send to Business Unit"** selected
- **"I confirm that l have captured this invoice on payment system."** ticked

…the **visible `Submit` button remains disabled**. No inline validation errors are rendered
(`.ant-form-item-explain` is empty), so there is nothing to tell the user what is missing. **A real user
cannot complete this branch at all.**

Inspecting the DOM, the step renders three `Submit` buttons:

| Submit | disabled | width |
|---|---|---|
| #1 | **false** | **0 (hidden)** |
| #2 | true | 0 (hidden) |
| #3 | true | **75 (visible)** |

So the only *enabled* Submit is **hidden**, and the only *visible* Submit is **disabled** — inverted from
every other step in this workflow, where the visible one is the enabled one.

**Secondary observation (automation only):** clicking the enabled hidden button *did* submit — but it
recorded **outcome 1** (the *proceed* decision) and routed the item to **Pre-Authorise Payment**,
i.e. it committed the opposite of the "No / Send to Business Unit" selection. A real user cannot click a
zero-size button, so this is not a user-reachable path; it is evidence that the enabled control belongs to
the **Yes** decision and the No-branch control is the one wrongly disabled.

➡️ **Two asks:** (a) enable the correct `Submit` for the No outcome (or surface why it is blocked);
(b) check the decision-to-button wiring on this form, since the enabled button applies `outcome 1`
regardless of the No selection.

**Consequence:** the No-branch destinations (*Verify Invoice* / *Send to Business Unit*, each with its own
mandatory comment) remain **untested** — they are unreachable until this is fixed.

---

## 4. ✅ Pre-Authorise Payment → Send Back to Capture (PAY3086/2026)

Because the item had (incorrectly) landed on *Pre-Authorise Payment*, the last branch could be driven
there. `Send Back` opens **`Shesha.Workflow/user-task-send-back v11`** with two mandatory fields —
**Step** (a "Select a User Task" picker) and **Comments**.

Selected **Capture and Link Invoice on LOGIS** + comment → OK:

- *Pre-Authorise Payment* → **status 5** (reverted/withdrawn)
- *Capture and Link Invoice on LOGIS* → **active again**, assigned back to all five `Capture Payment on
  LOGIS` members

**Plan correction:** `logis.md` TC-12 says Send Back "can return the item … to Register and Upload Invoice
or Certify Invoice **only**". On TEST the picker offers **every completed step** — all six were listed
(Register, Certify, Approve, Assign Responsible Official, Verify Invoice, Capture and Link), each showing
its completion metadata and assignee. The plan needs updating.

---

## 5. ✅ Recovery after the send-back — driven through to Paid + Filed (PAY3086/2026)

The sent-back item was then taken forward from *Capture and Link* to completion, to prove a send-back
leaves the item fully recoverable:

| # | Step | Actor | Completed (SAST) |
|---|---|---|---|
| 6 | Capture and Link (re-capture) | Lesetja Bambo (`H23086050`) | 08:48:32 |
| 7 | Pre-Authorise Payment | Monicca Kabini (`H18433740`) | 08:49:36 |
| 8 | Verify Voucher | Tshianeo Maboya (`H19234198`) | 08:50:37 |
| 9 | Final Authorise Payment (BAS report, INV, supplier **HB821**) | auto | 08:51:50 |
| 10 | Attach Payment Stub (PO **OR-126152**) | auto | 08:52:32 → **PAID** |
| 11 | Capture Filing (BATCH/BOX/FILE-3086) | Mutshutshu Tshithukhe (`Mutshutshut`) | 08:54:20 → **Completed** |

Final state: `status: 3` (Completed), `subStatus: 12` (Paid), `activeTodoItems: []`. No 4xx/5xx.

**What the send-back preserved vs cleared:** the **Payment Number `3086` survived** the send-back (still
populated on re-open), but the **"Should payment proceed?" selection was cleared** and had to be re-answered —
the same "decision fields reset, data fields kept" behaviour seen on the Review-Rejection send-back.

**Corroborates defect §3:** on this second pass, choosing **Yes** left the visible `Submit` **enabled** and
it submitted first time. So the disabled-Submit fault is specific to the **No** outcome, not to the step.

**Note on supplier:** OR-126152 belongs to **MUBVUMO MEDIA SERVICES (HB821)**, not ATLANTIS — the BAS
report and stub were built with `--supplier HB821` and matched (`Payments Authorised 1`,
`Payments Confirmed 1`).

---

## 6. State left behind

| Item | Order | Where it sits | Note |
|---|---|---|---|
| PAY3076/2026 | OR-126151 | **Stuck** at *Re-route to Correct Business Unit* | unactionable — defect §1 |
| PAY3082/2026 | OR-126052 | **Completed — REJECTED** | terminal, nothing to do |
| PAY3086/2026 | OR-126152 | **Completed — PAID + Filed** | send-back recovery proven end-to-end |

## 7. Still outstanding on LOGIS

- **Capture & Link "No" destinations** — blocked by defect §3.
- **The TC-04 re-route form itself** (selecting the correct Business Unit/End-User) — blocked by §1.
- **Over-commitment / Motivation-required rule** on registration — still untested (all runs so far had
  variance ≤ 0).
- **Query branches** (business/supplier) — still blocked on the missing HLEKANEI ROSE MATHE login.

## 8. Bugs logged

- [bugs/2026-07-29-logis-reroute-wrong-person-no-assignee.md](../bugs/2026-07-29-logis-reroute-wrong-person-no-assignee.md)
- [bugs/2026-07-29-logis-capture-link-no-branch-submit-disabled.md](../bugs/2026-07-29-logis-capture-link-no-branch-submit-disabled.md)
