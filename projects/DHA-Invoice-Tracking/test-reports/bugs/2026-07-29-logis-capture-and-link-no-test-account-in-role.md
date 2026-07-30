# BLOCKER (test-data / config) — LOGIS "Capture and Link Invoice on LOGIS" has no test-accessible account

> ## ✅ RESOLVED same day — a usable login exists
> **`H23086050` (LESETJA JACK BAMBO) works with the standard `123qwe`.** PAY3055 was in his inbox and the
> step completed normally; the LOGIS chain then ran to **Paid + Filed** —
> [../2026-07-29/logis-full-chain-PAY3055.md](../2026-07-29/logis-full-chain-PAY3055.md).
>
> **Add `H23086050` to the project credentials for this role.** Note `H22262270` (tried first) is **not** a
> `123qwe` account (403), so not every member of the role is test-accessible — use `H23086050`.
>
> The wider point in *"this is a pattern"* below still stands: the query-response roles remain unusable,
> so a one-pass audit of ITS role → test-account coverage is still worth asking for.

| | |
|---|---|
| **Logged** | 2026-07-29 (resolved the same day) |
| **Environment** | **TEST** — https://dha-smartgov-adminportal-test.shesha.app (API `https://dha-smartgov-api-test.shesha.app`) |
| **Severity** | **Blocker** for LOGIS steps 6–11 (not a product defect — an environment/role-membership gap) |
| **Affects** | LOGIS Request For Payment → **Capture and Link Invoice on LOGIS** (step 6 of 11) |
| **Role** | `Capture Payment on LOGIS` |
| **Item** | **PAY3055/2026** — parked at this step, instance `7756a1cf-c1b4-45d5-a8d7-f0a2ff768d80` |
| **Status on QA** | Not reproducible — on QA this step is actioned by `ThabisoM` via the SCM group (`2026-07-16/logis-full-chain-PAY3128.md`, step 6) |

## Summary

The LOGIS chain now clears *Certify Invoice* (that blocker is fixed) and runs cleanly through *Approve
Invoice*, *Assign Responsible Official* and *Verify Invoice*. It then stops at **Capture and Link Invoice
on LOGIS**, because the `Capture Payment on LOGIS` role on TEST contains **only five real DHA staff
accounts and none of the six ITS test users**.

## Role membership on TEST

Resolved from the active todo's `assignedTo` (`Process/Progress`), usernames looked up via
`Entities/GetAll` on `Shesha.Domain.Person` as `Admin`:

| Assignee | Username | Active |
|---|---|---|
| DUDUZILE FRANCINAH NTULI | `H22262270` | Yes |
| LESETJA JACK BAMBO | `H23086050` | Yes |
| KAIZER JERRY NDHLOVU | `H16431294` | Yes |
| STEVENS FANI SIBANYONI | `H23087781` | Yes |
| SARAH MOLOGADI MOHLALA | `h28454774` | Yes |

For comparison, the six ITS test users we hold logins for: `ThabisoM`, `Mutshutshut`, `00000000`
(Melissa Ndlovu), `H18433740` (Monicca Kabini), `H19234198` (Tshianeo Maboya), `H10226923` (Susanna
Erasmus). **No overlap.**

## What was checked

| Check | Result |
|---|---|
| PAY3055 in `ThabisoM`'s inbox (the QA actor for this step) | **No** |
| PAY3055 in `Admin`'s inbox | **No** — and `Process/Details` gives `activeTodoItems: []` for Admin, so no UI override |
| `H22262270` + standard TEST password `123qwe` | **403** `POST /api/TokenAuth/Authenticate` → *"Invalid user name or password"* |

The five accounts are **real staff accounts, not seeded test users**, so the shared `123qwe` test
password does not apply to them. **The other four were deliberately not attempted** — repeated failed
logins against real staff accounts risk locking them out.

## Impact

LOGIS is blocked at step 6 of 11. Unreachable as a result:

- *Pre-Authorise Payment*, *Verify Voucher*, *Final Authorise Payment* (LOGIS BAS import with
  Source Doc Type = `INV`), *Attach Payment Stub* (LOGIS stub matches on the **PO number**, not the
  payment number), *Capture Filing*
- The LOGIS negatives that branch off *Verify Invoice* — business query, supplier query, Reject Invoice
- The *Capture and Link* "No / should payment not proceed" branch (TC-11 note)

## Ask — either of these unblocks it

1. **Add an existing ITS test user to the `Capture Payment on LOGIS` role** on TEST, ideally
   **Thabiso Maake** so TEST matches how QA is configured; **or**
2. supply a working password for one of the five accounts listed above.

PAY3055/2026 is parked at exactly this step and is fully resumable — no re-registration will be needed.

## Related — this is a pattern, not a one-off

The same class of gap already blocks the four query-response branches:
*"Manage Supplier Related Queries"* and *"Resolve Queries"* are assigned to **HLEKANEI ROSE MATHE**
alone, with no login available
([2026-07-28/bas-negative-supplier-related-query-PAY3039.md](../2026-07-28/bas-negative-supplier-related-query-PAY3039.md)).

➡️ **Suggestion:** rather than fixing one role at a time, audit **every ITS role on TEST** for at least
one test-accessible account in a single pass. Roles known to need it so far: `Capture Payment on LOGIS`,
plus whichever roles own *Manage Supplier Related Queries* and *Resolve Queries*.
