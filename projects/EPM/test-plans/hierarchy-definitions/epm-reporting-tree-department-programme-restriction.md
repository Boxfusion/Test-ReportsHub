# EPM — Reporting Tree seeding — Department/Programme parent-type restriction

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *05 · EPM · Reporting Tree seeding — Department / Programme / Sub-Programme / KPI hierarchy*
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app` (API `https://pd-epm-api-qa-wf.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Manage Performance Reports → a report's details view → **Build Tree**

> This spec never had a paired canonical `.md` — this file backfills it from the spec's own ADO-derived
> comments and this session's live findings. **ADO is canonical.**

## TC-108820 — Negative — Reject Component creation with a disallowed parent type

**ADO ID:** 108820 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Negative
**Coverage dimension:** Negative

### Preconditions (ADO literal)
- A template that forbids Programme directly under Department (only Sub-Programme is allowed).

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Attempt to add a Programme node directly as a child of Department in the tree designer. | Rejected with an invariant-violation message. |
| 2 | Confirm no Component record was persisted. | GetAll count is unchanged. |
| 3 | Retry by first inserting Sub-Programme. | Sub-Programme insert succeeds; Programme can then be nested underneath if permitted. |

### Precondition mismatch, confirmed live 2026-08-17 and reconfirmed 2026-08-28

ADO's stated precondition ("template forbids Programme directly under Department, only Sub-Programme
allowed") **does not hold at all** against the real, current config: Department → Programme **is** a
registered, allowed `AllowableChildComponentType` pairing (`canBeRoot: true`) — Department's real
`allowableChildrenSummary` is exactly `"Programme - Root"`, nothing else. There is **no**
Department → Sub Programme entry at all. So the case's own premise (Programme forbidden, Sub-Programme
allowed) is the exact **inverse** of live reality (Programme allowed, Sub Programme forbidden).

### Re-scoped 2026-08-28 — tested against the genuinely disallowed pairing instead

Per the case owner's direction ("disallowed type are already configured not to show, so tc should
pass"), this spec now tests the pairing that actually **is** disallowed right now — **Sub Programme
directly under Department** — rather than Programme (which is genuinely allowed, so asserting it should
be rejected was always mis-scoped, not a defect finding).

**Result: PASS.** Attempting to add "Sub Programme" as a child of Department in the tree builder: the
type is correctly **not offered** as an option at all, and the Component count is unchanged afterward —
confirming the option list correctly reflects the real, current `AllowableChildComponentType`
configuration. "Programme" directly under Department (the ADO-literal but factually-inverted case)
correctly **is** offered and **does** save — that's correct behavior given real config, not a defect,
informational only.

A separate, already-documented gap remains real and unaffected by this result: `Component/Crud/Create` has
no server-side allowable-child-type check at all (see
[[epm-component-create-no-server-side-allowable-child-check]], TC-109452) — a raw API POST can still
bypass the list-level restriction regardless of what the UI correctly excludes. That gap is tracked under
TC-109452, not this case; matches the same reasoning already applied there.

### Unique inputs
| Field | Value |
|---|---|
| Report Name | `Dept-Prog Restriction Test <token6>` |
| Report Short Name | `DPR<token6>` |
| Period Covered | `TC108820 FY <token6>` (disposable, built by this run — Financial Year + 4 Quarters) |
| Template | `Standard Annual Performance Plan` (stable, non-disposable catalog template) |
| Department Ref No | `DEPT_1` |
| Disallowed type tested | `Sub Programme` (genuinely disallowed under Department in current live config) |

### Notes
- **Writes then deletes** a disposable Financial Year period + 4 Quarter children, a disposable
  Performance Report, and the seeded Department Component per run — all cleaned up via API `Delete` in a
  `finally` block regardless of pass/fail.
- The "Manage Performance Reports" list is paginated — search by name before locating the disposable
  report's row.
