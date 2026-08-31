# Report: NPO-14Z — Security, Class B (IDOR / BOLA with two owned accounts)

**Date:** 2026-08-25 15:40 UTC
**Plan:** test-plans/cross-cutting/14z-security-functional.md
**Execution Mode:** ai-repair (API-read verification of UI-observable auth behaviour)
**Result:** FAILED — 3 of 11 verdicted FAILED, 1 PARTIAL, 7 NOT EXECUTED. The per-user access guards these cases were written to confirm **do not hold — the dynamic CRUD API answers anonymous callers**, so "can user B read user A's record" is moot: *anyone with no account at all* reads every Person, Office Bearer and Partner record. This is the **same root** as the already-filed unauthenticated-API critical, now demonstrated across the Class B entity set.
**Duration:** ~600s
**Cases:** TC-14Z-012, 013, 018, 019, 021, 022, 023, 025, 026, 027, 029
**Environment:** QA · public portal + API · two self-registered applicant accounts (A userId 15944, B userId 15945)
**Accounts used:** `npo.qa.applicant.a@example.org`, `npo.qa.applicant.b@example.org`

## Summary
| Total | Failed | Partial | Not executed |
|---|---|---|---|
| 11 | 3 | 1 | 7 |

| Case | Resource | Verdict | One-liner |
|---|---|---|---|
| TC-14Z-012 account info requires auth | Person | 🔴 FAILED | **anonymous** read of 1 834 038 Person records incl. name/email/mobile |
| TC-14Z-021 Partner access guard | NpoPartner | 🔴 FAILED | anonymous read of 1 550 partner records |
| TC-14Z-022 OB–NPO read guard | NpoOfficeBearer | 🔴 FAILED | anonymous read of 2 181 679 office-bearer records |
| TC-14Z-029 OB identity takeover | NpoOfficeBearer | ⚠️ PARTIAL | read side open; the takeover **write** was not attempted (mutation on shared QA) |
| TC-14Z-013 DeleteMyAccount session check | delete | ⬜ NOT EXECUTED | a delete mutation — untestable without risking a real deletion |
| TC-14Z-018 / 019 StoredFile guard | StoredFile | ⬜ NOT EXECUTED | served by a dedicated download route (unknown); not guessed |
| TC-14Z-023 DocumentStamp IDOR | DocumentStamp | ⬜ NOT EXECUTED | no such entity in config; real mechanism unknown |
| TC-14Z-025 / 026 OrgLocation read/update | Location | ⬜ NOT EXECUTED | not exposed via generic CRUD; route unknown (026 also a mutation) |
| TC-14Z-027 CPR criminal record | QueryCprUsRecord | ⬜ NOT EXECUTED | most sensitive; needs a synthetic query, routed to Thabiso |

## The harness (what "two accounts" bought us)

Two applicant accounts were self-registered on 2026-08-25 precisely so a resource **owned by A** could be requested
from **B's session** — the standard BOLA/IDOR test. Both authenticate cleanly (200, tokens issued).

🔑 One gotcha worth recording: `TokenAuth/Authenticate` returns **401 even with correct credentials** unless the
request carries the header **`sha-frontend-application: public-portal`**. The first attempt failed on this and looked
like a bad password. It is not — it is a required header.

## What the test found — the guard isn't per-user, it's absent

The intended test was *B reads A*. Run against A's own Person record it confirms exactly that:

| Caller | A's Person record (`Person/Crud/Get?id=<A>`) | |
|---|---|---|
| A (owner) | 200 — name, surname, email, mobile | expected |
| B (other user, valid token) | **200 — same fields** | 🔴 BOLA: cross-account read succeeds |
| **No token at all** (`credentials:'omit'`) | **200 — same fields** | 🔴 the guard is missing entirely, not just cross-tenant |

So the case's premise — "does user B improperly reach user A's data" — is overtaken by a bigger fact: **no
authentication is required at all.** Confirmed at collection scale, anonymously, counts only:

| Entity | Anonymous `Crud/GetAll` | totalCount |
|---|---|---|
| `Shesha/Person` | 200 | **1 834 038** |
| `boxfusion.dsdnpo/NpoOfficeBearer` | 200 | **2 181 679** |
| `boxfusion.dsdnpo/NpoPartner` | 200 | **1 550** |
| `boxfusion.dsdnpo/NpoOrganisation` | 200 | 320 595 |

These were `credentials:'omit'`, no `Authorization` header, and the API is a different origin from the portal so no
cookie is sent — the access is genuinely unauthenticated.

**On PII discipline:** the name/email/mobile I saw returned were **our own test accounts' A and B**. Their
`identityNumber` is null because our accounts genuinely have no SA ID (matches the known sign-up finding). I did **not**
pull a stranger's record to check whether a real person's SA ID comes back — that would mean handling someone's
identity number to prove a point already proven. The class is confirmed on our own data; I stopped there, per the
suite's safety rule.

## Cases verdicted

### 🔴 TC-14Z-012 — account info requires auth (FAILED)
The Person entity — which is exactly "account info" — is readable with no authentication. The guard this case exists
to confirm does not hold.

### 🔴 TC-14Z-021 — Partner access guard (FAILED)
`NpoPartner` is anonymously enumerable (1 550 rows). No per-owner check reached.

### 🔴 TC-14Z-022 — OB–NPO read guard (FAILED)
`NpoOfficeBearer` is anonymously enumerable (2 181 679 rows). The office-bearer↔NPO relationship is fully exposed.

### ⚠️ TC-14Z-029 — Office Bearer identity takeover (PARTIAL)
The **read/enumeration** half is confirmed open (see TC-022). The **takeover itself is a write** — overwriting an
office bearer's identity — and I did **not** attempt it: it is a mutation against a shared QA environment holding real
office-bearer records. The exposure that *enables* the takeover is demonstrated; the destructive step is left for a
controlled environment. Handed to Thabiso as a confirmation with the read evidence attached.

## Cases not executed, and precisely why (so they are not silently dropped)

- **TC-14Z-013 (DeleteMyAccount)** — a delete mutation. There is no safe way to test whether the session guard holds
  without risking an actual account deletion on shared QA. Needs a throwaway account on an environment where deletion
  is acceptable.
- **TC-14Z-018 / 019 (StoredFile)** — `StoredFile` is **not** exposed through the generic `Crud/GetAll` accessor (404
  on both candidate namespaces); it is served by a dedicated file-download endpoint whose exact route is in a source
  bug I have not pulled. I did **not** guess the route — a guessed 404 would prove nothing, and a guessed 200 would be
  worse. Also, A owns no uploaded file, so the "A-owned resource" side does not yet exist.
- **TC-14Z-023 (DocumentStamp)** — there is **no entity named `DocumentStamp`** among the 448 in the entity config;
  the nearest are `InquiryDocument`, `FoundingDocumentsChecklist`, `AppealAttachedDocument`. The real mechanism is
  unknown without the source bug. Not guessed.
- **TC-14Z-025 / 026 (OrgLocation)** — `Location` is not exposed via generic CRUD (404); the route is unknown, and 026
  is additionally a mutation.
- **TC-14Z-027 (CPR criminal record)** — the most sensitive case in the suite. It requires a query against
  `QueryCprUsRecord` crafted so it **cannot** return a real person's criminal record. I have not wired that safely this
  pass and will not fire it blind. Routed to Thabiso.

## 🔑 Method note that matters for the next pass
Entity namespaces were resolved from **`GET /api/services/app/EntityConfig/GetMainDataList`** (448 entities), not
guessed. That is the entity-layer equivalent of the form-registry rule: to test whether an entity's auth guard holds,
get its real accessor from the config first — otherwise a wrong-path 404 gets misread as "guard present, access
denied", which is the exact false-pass this suite must avoid.

## Relationship to existing findings — NOT a new bug
This did not discover a new defect. It demonstrated that the **already-filed critical**
(`bugs/2026-08-18-api-reachable-without-authentication.md`, TC-14Z-005 / TC-01-021 — the dynamic CRUD API answers
anonymous callers) **removes the per-user authorization guard that Class B's 012/021/022/029 were written to confirm.**
The Class B cases are not independently broken; they are all downstream of that one root. Cross-referenced rather than
re-raised, so the defect count is not inflated.

## Open questions / asks for Thabiso
1. The IDOR cases assume authentication works and only the *per-owner* check is in question. It isn't — **there is no
   authentication on the dynamic CRUD API at all.** Should Class B be re-scoped once that root is fixed, since the
   per-user guards can't be meaningfully tested until anonymous access is closed?
2. For **018/019/023/025/026/027** — can you share the source bugs (#102957/102958/102964/102966/102967/102968) so the
   exact endpoints are known? Without them these are unreachable by black-box probing, not passing.
3. **013** and **029** both need a mutation. Is there a throwaway environment where a delete / an OB-identity write can
   be exercised, or should these stay code-review items?

## Evidence
- `14z-classb-idor-evidence.json` — tokens, the A/B/anon Person read matrix, the anonymous collection counts, the
  entity-config resolution, and the per-case verdict map.
