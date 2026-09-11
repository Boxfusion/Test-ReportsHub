# Test Plan: NPO-14R-F — Integration retries: DHA & CIPC (functional)

> **Status:** Imported from Azure DevOps 2026-08-26 — executable by **observation window**, not by driving a form
> **Owner:** QA
> **Last Updated:** 2026-08-26
> **Estimated Duration:** ~4200s (dominated by a mandatory >1 hour wait)

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101904) |
| ADO Suite | 101904 — *14R Integration retries DHA-CIPC* (2 cases) |
| Raw pull | `test-data/ado-functional-101543/ado-suite-101904.json` |

## Objective
> Verify that a background job retries the DHA (office-bearer ID) and CIPC (company directors) integrations about an
> hour after a failure, and that the retry **updates the stored record**.

## 🔑 How this suite has to be executed
Both cases are one line long — *"Wait > 1 hour with DHA/CIPC back up"* — and neither can be driven through a form.
There is no user-facing "retry now" control, so the only honest black-box method is an **observation window**:

1. Establish that the integration is **currently up** (the stated precondition), by showing that records created
   recently *do* get verified.
2. Snapshot a named cohort of **not-yet-verified** records with their `lastModificationTime`, and stamp the capture
   time (**T0**).
3. Wait **more than one hour**.
4. Re-read the *same* cohort by id (**T1**) and diff.

**A retry that ran would have to leave a trace** — either the record flips to verified, or a failure reason is
recorded, or at minimum `lastModificationTime` moves. If nothing in the cohort changes across a window longer than
the stated retry interval, the retry did not run.

⚠️ **Do not verdict either case from the metadata shape alone.** The absence of a retry-counter column is
suggestive, not conclusive — a job could still update the record without one. The verdict comes from the T0→T1 diff.

## Preconditions
- [ ] Admin portal login; view mode **Live → Latest**
- [ ] TC-01: the DHA integration is up — demonstrated, not assumed
- [ ] TC-02: the CIPC integration is up — demonstrated, not assumed
- [ ] A cohort of unverified records that predates T0 by more than the retry interval

## Reference — where the state lives
Resolved from `EntityConfig/GetMainDataList`, never guessed (see `dsd-npo-form-registry-is-the-route-list`).

| Integration | Entity | Namespace | Fields that carry the outcome |
|---|---|---|---|
| DHA (office bearer ID) | `NpoOfficeBearer` | `boxfusion.dsdnpo.Domain.OfficeBearers` | `IsIdVerified`, `IdVerificationFailureReason`, `IsVerifiedComment` |
| CIPC (company / directors) | `NpoOrganisation` | `boxfusion.dsdnpo.Domain.NpoOrganisations` | `IsCipcRegNumberVerified`, `NPCRegistrationNo`, `NumberOfOfficeBearers` |

🔑 **Contrast worth recording:** the same `NpoOrganisation` entity carries a complete verification triplet for the
**Nispis** integration — `NispisVerificationStatus`, `NispisVerificationMessage`, `NispisVerificationTimestamp`,
`NispisVerifiedBy`. **DHA and CIPC have no equivalent.** So the build demonstrably knows how to record an
integration's outcome and attempt time; it simply does not do so for these two.

## Test Cases

### TC-01 — Background DHA verification retry runs after 1 hour and updates OB status (ADO #101817 · TC-14-005)

*Priority 2 · Edge · `Drift-Risk`.*

- **Type:** Positive (scheduled job)
- **Precondition (ADO):** *"OB saved while DHA was down."*
- **Steps:**
  1. Establish DHA is up: count office bearers created in the last few days that **are** `IsIdVerified = true`
  2. Snapshot the unverified cohort (id, `creationTime`, `lastModificationTime`) and stamp **T0**
  3. Wait **> 1 hour**
  4. Re-read the same ids (**T1**) and diff
- **Expected result:** *"Background job retries verification; OB status updates accordingly (per FDS 6.1 rule 2c(i))"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) at least one cohort member changes across the window — verified, or a failure reason set,
        or `lastModificationTime` moved
  - [ ] RECORD the cohort size and the count of members that predate T0 by more than an hour
- **🔴 Drift note (Thabiso, from code):** *"no 1-hour scheduled retry; DHA job halts on exception."*
  **So this case is expected to FAIL.** Confirm by execution — a code-review risk can clear as well as confirm.

---

### TC-02 — Background CIPC verification retry runs after 1 hour and updates application (ADO #101818 · TC-14-006)

*Priority 2 · Edge · `Drift-Risk`.*

- **Type:** Positive (scheduled job)
- **Precondition (ADO):** *"NPC application saved while CIPC was down."*
- **Steps:**
  1. Snapshot organisations that carry an `NPCRegistrationNo` but are **not** `IsCipcRegNumberVerified`, with
     `NumberOfOfficeBearers`, and stamp **T0**
  2. Wait **> 1 hour**
  3. Re-read the same ids (**T1**) and diff
- **Expected result:** *"Background job retries; directors are populated from CIPC (per FDS 6.1 rule 2b(ii))"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) at least one cohort member flips to `IsCipcRegNumberVerified`, **or** gains directors
        (`NumberOfOfficeBearers` increases), across the window
  - [ ] RECORD how many organisations in the whole register carry an `NPCRegistrationNo` versus how many are verified
- **🔴 Drift note (Thabiso, from code):** *"no 1-hour scheduled retry for CIPC; user re-submits manually."*
  **Expected to FAIL.**
- **📌 Note on "directors are populated from CIPC":** there is **no `Director` entity** in the 448-entity registry.
  Directors arrive as `NpoOfficeBearer` rows, and `NpoApplication.DirectorsVerified` is the assessor's manual
  checklist tick (it pairs with `DirectorsVerifiedComment`, exactly like `OrganisationNameVerified`), **not** an
  integration result. Record `NumberOfOfficeBearers` as the observable instead.

---

## ❓ Questions for Thabiso
- Is the 1-hour retry specified anywhere other than FDS 6.1 rules 2b(ii)/2c(i)? Nothing in the QA build schedules it.
- Should a failed DHA verification record a **reason**? `IdVerificationFailureReason` exists on the entity and is
  **null on every office bearer in the register**, so a failure is currently indistinguishable from "never attempted".
- DHA and CIPC have no attempt timestamp, while Nispis has a full one. Is that a deliberate difference?

## Coverage against ADO
| ADO case | Local | Notes |
|---|---|---|
| #101817 TC-14-005 | TC-01 | Observation window |
| #101818 TC-14-006 | TC-02 | Observation window |
