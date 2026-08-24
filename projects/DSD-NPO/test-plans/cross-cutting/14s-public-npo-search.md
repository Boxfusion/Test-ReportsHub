# Test Plan: NPO-14S — Cross-Cutting: Public NPO Search & Anonymous Endpoints (smoke)

> **Status:** Imported from Azure DevOps — ✅ **reachable now**
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 45s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app |
| Environment | QA |
| Login As | **none** — public search should be anonymous |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101880) |
| ADO Suite | 101880 — *14S - Cross-Cutting - Public NPO Search & Anonymous Endpoints* (1 case) |

## Objective
> Verify that a member of the public can search the NPO register by name or category and see a registered NPO with its status.

## Reachability
✅ **Runnable today** — needs no login and no NPO of our own. The register is fully populated (**361,068 NPOs**), so there is plenty to search against. Prioritise this while registration is blocked.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected result quoted from the ADO case; state `Design`.

⚠️ **Drift-Risk case — Thabiso's own note:** *"Code: NISPIS endpoints exist but **API-key gated, not pure anonymous-by-name search**."*

So the case may not be satisfiable as written. If the public search requires an API key, then either the FDS's anonymous NPO Database search is not implemented, or it is served by a different route. **Establish which before calling it a defect.**

## Preconditions
- [ ] Public portal reachable
- [ ] **Run signed out**, in a clean browser context — an authenticated session would hide the very thing this case tests
- [ ] A known registered NPO to search for. Take one from `admin → All NPOs` (format `NNN-NNN-NPO`, e.g. `333-010-NPO`) — note that requires an admin login **in a separate context**, not this one

## Test Cases

### TC-01 — Public NPO search finds a registered NPO by name or category (ADO #101819 · TC-14-007)

*Priority 2 · Positive · Public, unauthenticated.*

- **Type:** Happy path (search)
- **Steps:**
  1. In a **clean, signed-out** browser context, NAVIGATE to the public portal
  2. Open the **public NPO search**
  3. SNAPSHOT — RECORD where the search lives and whether it is reachable at all without signing in
  4. TYPE the name of a known registered NPO
  5. ASSERT the typed text landed (`inputValue()`) before reading any result
  6. WAIT for results
  7. ASSERT (BLOCKING) the matching registered NPO is returned
  8. ASSERT its **status is visible** in the result *(FDS 7 — NPO Database search)*
  9. Repeat the search **by category**
  10. API — capture the search request and note whether it carries an **API key** or any auth header
- **Expected result:** *"Registered NPO matching is returned with status visible (FDS 7 - NPO Database search)"*
- **Assertions:**
  - [ ] ASSERT the search is reachable **without signing in**
  - [ ] ASSERT (BLOCKING) a known registered NPO is returned by name
  - [ ] ASSERT the NPO's status is displayed in the result
  - [ ] ASSERT search by category also returns results
  - [ ] 🔑 RECORD whether the underlying request is anonymous or API-key gated
- 🔑 **Step 10 is what resolves the drift note**, and it is not in the ADO case. Capture the network request: if it carries a key the page supplies, the search is anonymous *to the user* but not *to the API* — which is a meaningful distinction for the FDS claim and for suite 14Z (Security).
- **📌 This is a search, not a rendered list.** Do not conclude anything from what the page shows before you have typed.
- **❓ Question for Thabiso:** what should a public searcher be able to see about an NPO? Name and status are prescribed — but if contact details or office bearers are exposed anonymously, that is a POPIA question, and suite 14Y (POPIA Data Protection, Functional) is where it belongs.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101819 | TC-14-007 | ✅ **yes — run this one** |

**Not in this plan** (Functional suite 101905, 3 cases, to import later). The Functional plan also carries the wider cross-cutting suites with no smoke equivalent at all: **14C** session/access control · **14D** document & PDF generation · **14N** notifications & delivery tracking · **14R** integration retries (DHA/CIPC) · **14T** notification template content (22 cases) · **14U** audit trail · **14X** concurrency & race conditions · **14Y** POPIA · **14Z** security (32 cases).
