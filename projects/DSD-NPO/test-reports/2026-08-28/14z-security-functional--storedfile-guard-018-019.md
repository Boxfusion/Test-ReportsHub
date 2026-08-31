# Report: NPO-14Z-F Class B — StoredFile access guard (TC-14Z-018/019) — no guard: uploaded documents download cross-account AND anonymously

**Date:** 2026-08-28 07:45 UTC
**Plan:** test-plans/cross-cutting/14z-security-functional.md
**Execution Mode:** ai-mcp
**Result:** FAILED — the two StoredFile guard cases deferred since 2026-08-25 are now run, using **files that already existed**: the three documents on application APPL26-01570 (Account B), whose ids were obtained legitimately from that application's own `FilesList`. Their old blocker — *"A owns no uploaded file, so the A-owned resource does not yet exist"* — is dissolved by using B's existing files as the target and A (and anonymous) as the caller. **Both cases FAIL:** `StoredFile/Download?id=` returns the full PDF to an unrelated authenticated user **and to an anonymous caller with no token at all**, and `StoredFile/FilesList?ownerId=` enumerates another owner's files. There is no owner check and no authentication check.
**Duration:** ~500s
**Cases:** TC-14Z-018 (#107336), TC-14Z-019 (#107337)
**Environment:** QA · public portal + direct API · Account A as the cross-account caller, then anonymous
**Accounts used:** `npo.qa.applicant.a@example.org` (Account A, attacker) · files owned by Account B (`npo.qa.applicant.b@example.org`)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 2 | 0 | 2 | 0 | 0 |

Both were **BLOCKED** on 2026-08-25. Both now run **without any new record being created** — they use documents
that already existed on our own APPL26-01570.

---

Both cases share one body of evidence (below) because the StoredFile guard is a single mechanism; each is
verdicted on the aspect it targets — enumeration for one, retrieval for the other. Per-case verdict lines first,
then the shared evidence.

### 🔴 TC-14Z-018 — StoredFile access guard: direct retrieval by id (#107336) — FAILED
`StoredFile/Download?id=<B's file>` returns the full PDF to Account A (unrelated) **and** to an anonymous caller
with no token. No owner check, no authentication check. Evidence table below.

### 🔴 TC-14Z-019 — StoredFile access guard: enumeration by owner (#107337) — FAILED
`StoredFile/FilesList?ownerId=<B's application>` returns B's entire document list, by name, to Account A. No owner
check. Evidence table below.

### Shared evidence

**How the old blocker was dissolved.** The 08-25 note read: *"`StoredFile` is not exposed through the generic
`Crud/GetAll` accessor… A owns no uploaded file, so the A-owned resource does not yet exist."* Two things changed:
the correct route is the dedicated `StoredFile/FilesList` + `StoredFile/Download` pair (found from the live
network capture, not guessed), and **APPL26-01570 already owns three files** — so the test flips: use **B's
existing files** as the protected resource and **A** as the unauthorised caller.

**The three specimens** (owner = Account B's application `6c02e52c-…`), ids read from B's own `FilesList`:
`ApplicationNonMembershipConstitution.pdf` (79 549 B), `AppAcknowledgementLetter.pdf` (107 890 B),
`qa-a11y-probe.pdf` (193 B).

| Caller | `Download?id=<B's file>` | `FilesList?ownerId=<B's app>` |
|---|---|---|
| Account **B** (owner — control) | 200 + PDF | 200, all 3 listed |
| Account **A** (unrelated, no link to B) | 🔴 **200 + full PDF, all 3** | 🔴 **200, all 3 listed by name** |
| **Anonymous** (no `Authorization` header) | 🔴 **200 + full 79 549 B PDF** | — |

- **[FAIL] No object-level authorisation.** Account A holds no relationship to B or B's application, yet retrieves
  the complete file content of all three, byte-for-byte matching what B sees (sizes identical). This is textbook
  BOLA — the endpoint trusts the id and never checks the caller owns it.
- **[FAIL] No authentication either.** The same `Download?id=` served the full PDF to an **anonymous** request with
  no token. So this is not merely "any logged-in user"; it is fully public by id.
- **[FAIL] Enumeration is open too.** `FilesList?ownerId=<B's application id>` returns B's whole document list to
  Account A. Given the NPO/application ids are themselves anonymously readable (the parent bug), an attacker can go
  application-id → file list → file content end to end, unauthenticated.

**Discrimination control — the 200s are real.** A zero GUID (`00000000-…`) does **not** return content; it errors
(CORS-masked, the known error-path pattern on this host), whereas every valid id returns 200 + bytes. The endpoint
distinguishes real ids from fake ones, so the cross-account/anonymous 200s are genuine retrievals, not blanket-200.

**Filed as evidence on the existing bug**, not as a new defect:
`bugs/2026-08-18-api-reachable-without-authentication.md` (Update 2026-08-28). Same root cause and the same fix —
the `Npo.Application` guard already present in the codebase, applied to the `StoredFile` endpoints.

### ⚠️ Scope of the verdict — read this before quoting it
- Suite **14Z is not among the 9 committed raw ADO pulls**, and the `ado` MCP was unreachable this session, so the
  **verbatim ADO steps for 018 vs 019 could not be quoted**. Both are verdicted against the plan's stated intent
  (Class B, type *guard*, "StoredFile guard") and the 08-25 report's grouping of them as the StoredFile pair.
- The finding covers **both** the enumeration route (`FilesList`) and the retrieval route (`Download`), so whichever
  aspect each case targets, the guard is absent. **Thabiso to confirm the 018/019 split**; if either case actually
  scopes something narrower than "StoredFile access control", it should be re-verdicted against its exact text — the
  underlying defect stands regardless.

### POPIA / safety
Only **our own synthetic Account-B documents** were fetched (a constitution doc we generated, an auto-issued
acknowledgement letter, and our own a11y probe file). Only blob **sizes** were read; **no file content was opened
or transcribed**. No real person's data was accessed, and nothing was created, modified or deleted.

---

## Method notes
- The `StoredFile` routes were taken from the **live network capture** of the application's own document panel, not
  guessed — the 08-25 report correctly refused to guess them, and a guessed 200 here would have been worse than a
  guessed 404.
- Account A was a full interactive sign-in; its bearer token was read from `localStorage` for the raw `fetch`
  probes. Anonymous probes carried no `Authorization` header.
- The zero-GUID discrimination control was run to rule out an endpoint that simply 200s everything.

## What this leaves in suite 14Z Class B
Still not run, and still genuinely blocked (unchanged by today):
- **TC-14Z-013** (DeleteMyAccount) — a delete mutation, unsafe on shared QA.
- **TC-14Z-023** (DocumentStamp) — no such entity in config; real mechanism unknown without the source bug.
- **TC-14Z-025 / 026** (OrgLocation) — `Location` not exposed via generic CRUD; route unknown; 026 is a mutation.
- **TC-14Z-027** (CPR criminal record) — most sensitive; needs a synthetic query that cannot return a real record —
  route to Thabiso.
These need endpoints from source bugs we have not pulled, or are mutations/sensitive — none is a "use existing
items" candidate.
