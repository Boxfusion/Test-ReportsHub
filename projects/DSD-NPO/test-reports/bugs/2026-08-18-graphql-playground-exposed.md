# Bug: GraphQL Playground IDE exposed unconditionally in a deployed environment

**Date:** 2026-08-18
**Severity:** Medium
**Area:** API (`dsd-npo-api-qa.shesha.app`) — `/ui/playground`
**Environment:** QA
**Found by:** TC-14Z-004 (ADO #107322, source bug #102941)

## Summary
The GraphQL Playground developer IDE is served unconditionally at `/ui/playground` and renders for an anonymous
visitor. Developer tooling should not be reachable in a deployed environment.

## Steps to reproduce
1. Signed out, open `https://dsd-npo-api-qa.shesha.app/ui/playground`.
2. The full Playground IDE renders — title *"Playground - https://dsd-npo-api-qa.shesha.app/graphql"*, with **Docs** and
   **Schema** explorer tabs. *(Evidence: v14)*

## Expected
The Playground / GraphQL IDE should be disabled outside local development (or gated behind admin auth).

## Actual
It loads for anyone.

## Caveat — scope of the exposure (recorded honestly)
The **IDE is exposed**, but the `/graphql` endpoint itself returns **401** to an anonymous introspection query, so an
anonymous caller cannot read the schema or data *through it*. The confirmed defect is therefore the **unconditional
exposure of the developer IDE**, not anonymous data access.

🔑 **Notable inconsistency:** `/graphql` is auth-gated, while the dynamic CRUD API is **not**
(`2026-08-18-api-reachable-without-authentication.md`). The auth posture is applied unevenly across the API surface —
which supports the theory that the anonymous CRUD access is a misconfiguration rather than intent.

## Fix direction
Disable the Playground/GraphQL IDE in deployed environments (or require admin auth to reach `/ui/playground`).
Source bug #102941 is "Startup config — GraphQL Playground exposed unconditionally", so the fix is in the API startup
configuration.

## Verdict
TC-14Z-004 **CONFIRMED** (IDE exposed); anonymous introspection blocked by the endpoint's 401.

## Evidence
`test-reports/2026-08-18/evidence/v14-graphql-playground-exposed-anonymously.png`
