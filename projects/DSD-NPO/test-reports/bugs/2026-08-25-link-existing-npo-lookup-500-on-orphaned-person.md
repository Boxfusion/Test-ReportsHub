# Bug: "Link to an Existing NPO" lookup returns HTTP 500 for the majority of NPOs — orphaned Person reference is unhandled

**Date:** 2026-08-25
**Severity:** 🔴 **High** (a primary onboarding flow — linking an existing NPO to a new account — fails for ~58% of NPOs in QA)
**Area:** Public portal — `Link to an Existing NPO` (`boxfusion.dsdnpo/dsd-link-existing-npo v13`) → `GET /api/services/dsdnpo/Organisations/GetNPOByNpoNumber`
**Environment:** QA · public portal · signed in as an applicant (`npo.qa.applicant.a@example.org`)
**Found by:** building the two-account harness for suite 14X TC-14X-003 (simultaneous-link race)

## What happens

The Link-Existing-NPO modal takes an NPO registration number and calls
`GET /api/services/dsdnpo/Organisations/GetNPOByNpoNumber?npoNumber=<number>` to resolve the organisation before
linking it. For a large share of real, existing NPO numbers this call returns **HTTP 500** with a raw internal error:

```
500  "No row with the given identifier exists[Shesha.Domain.Person#<GUID>]"
```

The NPO **is** found — the failure is downstream: resolving the organisation eagerly loads a linked **Person** record
(a contact / office bearer) whose row no longer exists, and the code throws instead of handling the missing reference.

## How widespread

Sampled 12 real NPO numbers pulled straight from the register, exact format, with a valid applicant token:

| Outcome | Count |
|---|---|
| Lookup succeeds (linkable) | 5 / 12 |
| **HTTP 500 — orphaned `Person` reference** | **7 / 12** |
| Clean "Npo Not Found" | 0 / 12 |

So roughly **58%** of the NPOs sampled cannot be looked up at all — a user entering their own valid NPO number has a
better-than-even chance of hitting a 500.

## A second, lower-severity issue in the same endpoint

A **non-existent** number (`000-000 NPO`) also returns **HTTP 500**, with `"Npo Not Found"` in the details — a
not-found condition surfaced as an internal-server-error rather than a handled 404. **The UI does catch this one** and
shows a friendly *"NPO Number Not Found!"* message, so the user impact here is limited to log noise and an incorrect
status code. The orphaned-Person 500 above is the serious one.

## Verification performed before raising

| Check | Result |
|---|---|
| Reproducible? | **Yes** — 7 of 12 distinct numbers, deterministic per number |
| Harness / format artifact? | **No** — tested the exact `###-###-NPO` format from the register plus variants; the exact format is what triggers the orphaned-Person 500 (a truncated format gives the separate "Npo Not Found") |
| Auth-related? | **No** — the endpoint correctly requires auth (401 anonymous); the 500 occurs *with* a valid token |
| Data missing? | The NPO exists (found by number); the failure is a missing **linked Person** row, i.e. a data-integrity gap the code doesn't tolerate |

## Steps to reproduce

1. Sign in to the public portal as an applicant not yet linked to any NPO.
2. On the landing page choose **Link to an Existing NPO**.
3. Enter a valid registered NPO number (several in QA trigger this; the lookup succeeds for only ~5 in 12).
4. Observe the search fails. At the API: `GET …/Organisations/GetNPOByNpoNumber?npoNumber=<number>` → **500**,
   `"No row with the given identifier exists[Shesha.Domain.Person#<GUID>]"`.

## Expected

The lookup resolves the NPO regardless of whether an associated Person row is present, or fails gracefully with a
handled message and a correct status code. A missing linked record must not 500 a core onboarding flow, and an
internal entity type + GUID should never reach the client.

## Suggested fix

1. In the `GetNPOByNpoNumber` path, null-guard the linked `Person` load (or use a projection that tolerates a missing
   reference) rather than an eager `Get` that throws `No row with the given identifier`.
2. Return a handled not-found (404 / structured result) for an unknown number instead of a 500.
3. Investigate the underlying data-integrity gap — why 7 of 12 sampled NPOs reference a `Person` row that does not
   exist. This may be fallout from the same rename/migration behind the `Npo.AnnualCompliance` alias bug filed today.
