# NC Dispatch — Administrative Functions Create/Edit (CRUD smoke)

> **Source of truth.** This markdown plan is canonical; the paired `admin-functions-crud.spec.ts` is the
> derived runtime artefact. The spec **verifies** the records created/edited live on 2026-06-17 still
> persist on QA (it does not re-create them, to avoid duplicate test data).

| App | URL | Environment |
|-----|-----|-------------|
| NC Dispatch (Dispatcher Admin Portal) | https://ncdoh-dispatcher-adminportal-qa.shesha.app/login | QA |

**Credentials:** Admin / 123qwe
**ADO:** Administrative Functions — plan #65099 / suite #65100

## Scope
Each Administrative-Functions entity was **created** with `Auto Test …` naming and then **edited** during the
2026-06-17 session. This plan confirms both operations persisted by searching each entity's grid for the
record and asserting the row (and, where the edit changed a grid-visible field, the new value).

## Test Cases

- **TC-00 — Log in to NC Dispatch** — sign in as Admin; redirected away from `/login`.
- **Incident Type** — Add (`Broken Arm` present) · Edit (row persists, edit pencil opens).
- **Vehicle Type** — Add (`Auto Test Ambulance` present) · Edit (persists after marker-URL edit).
- **Device** — Add (`Auto Test Device` present) · Edit (persists).
- **Vehicle** — Add (`AUTO TEST NC` present) · Edit (persists).
- **Agent** — Add (**creates a fresh agent** via Add-New: Name/Surname/Mobile/Email/Username + Role *Call Taker* + Region *Frances Baard* + Password; unique username/mobile/email per run, then searches + asserts the new row — `RegisterAgent` 200) · Edit (persists; Station set on edit).
- **Resource** — Add (`Auto Test Resource` present) · Edit (persists).
- **Station** — Add (`Auto Test Station` present) · Edit (persists).
- **Crew** — Add (`AutoTestCrew 003` present).
- **Shift** — Add (`Auto Test Shift` present) · Edit (persists).
- **Shift Assignment** — Add (assignment for `AUTO TEST NC` / `Auto Test Shift` present) · Edit (persists).
- **Site Type** — Add (`Auto Test Site Type` present) · Edit (Levels changed **1 → 2**, grid shows `2`).
- **Point of Interest** — Add (`Auto Test Point of Interest` present) · Edit (Contact changed to `0987654321`).

## Notes
- The Shesha app never reaches `networkidle` (background polling), so the spec waits on concrete
  elements, not load-state. Same fix as `incident-types.spec.ts`.
- Grids are reached by direct URL (collapsed sidebar flyouts don't open under automation).
