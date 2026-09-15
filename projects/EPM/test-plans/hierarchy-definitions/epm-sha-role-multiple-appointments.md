# EPM/Shesha — Sha Role multiple appointments

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109512 · EPM/Shesha · Sha Role Appointment*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI: Assign Role modal) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** admin.PrincessH / 123qwe (administrator); then stage6 / 123qwe (the appointed Person)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108833 — Edge — Same Person can hold multiple Sha Roles

**ADO ID:** 108833 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; edge
**Coverage dimension:** Edge

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 0 (precondition) | A Person already holds one Sha Role. | True. |
| 1 | Appoint an additional role (Internal Audit / this tenant's "Auditor") to the same Person via Administration → User Management → Assign Role. | Neither appointment rejected as a duplicate. |
| 2 | Verify via `ShaRoleAppointedPerson` GetAll filtered by Person. | Two rows exist with distinct `roleId` values. |
| 3 | Sign in as the Person. | Both role capabilities honoured — workflow inbox access, and the Auditor read-only view becomes available. |

### Confirmed live 2026-08-18 — partial: data layer clean, UI-facing half is a gap

See [[epm-sha-role-multiple-appointments]]. "Stage 6 SPMR Director" already genuinely holds "SPMR
Director"; granted "Auditor" additionally via the real Assign Role UI. Result: exactly 2
`ShaRoleAppointedPerson` rows with 2 distinct `role.id` values, neither rejected — full clean pass on
the data layer. But after granting "Auditor" and logging back in fresh as `stage6`, the "Auditor view"
header button (a client-side mode toggle, no distinct route) never appears — the role grant does not
surface the corresponding capability. Workflow inbox access is trivially true for every user regardless
of role, so not meaningful RBAC coverage on its own.

### Unique inputs
| Field | Value |
|---|---|
| Target Person | "Stage 6 SPMR Director" (`3b03d9ec-...`, login `stage6`/`123qwe`) |
| Existing role | "SPMR Director" (`5c07cd31-...`) |
| Appointed role | "Auditor" (`dab1ee0b-...`) |

### Notes
- **Precondition-sensitive**: requires the Person to already hold ≥1 role and to NOT already hold
  Auditor. Originally asserted an exact count of 1, which broke once real tenant activity added an
  "EPM Users" base role to this Person and this test's own 2026-08-18 run left a stale "Auditor" row
  behind (its cleanup silently never ran) — relaxed 2026-08-31 to the actual invariant ADO cares about,
  after deleting the stale leftover row. See [[epm-sha-role-duplicate-appointment]] for the related
  duplicate-appointment gap.
- **Appoints via the real UI** (Assign Role modal), not a raw API call, matching ADO's own steps.
- **Cleans up** the newly-created "Auditor" appointment row in a `finally` block, re-authenticating as
  admin first (the test ends the run logged in as `stage6`).
