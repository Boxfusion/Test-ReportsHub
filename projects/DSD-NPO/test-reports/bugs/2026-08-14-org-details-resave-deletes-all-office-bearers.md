# Re-saving the Organisation Details step silently deletes every office bearer

**Date raised:** 2026-08-14
**Severity:** **Blocker** — unrecoverable loss of user-entered data, with no warning and no feedback
**Environment:** QA · public portal · form `boxfusion.dsdnpo/create-npo v61`
**Affects:** the NPO registration wizard (Tab 2 *Organisation Details* ↔ Tab 4 *Office Bearer*)
**Status:** ⚠️ **NOT REPRODUCING as of 2026-08-18** — retested deliberately on two applications and the office bearers survived; see *Retest 2026-08-18* at the foot of this file. Do **not** close until Thabiso confirms a fix went in.

## Summary

Navigating back to **Organisation Details** and clicking **Next** deletes **all** office bearers already captured on
the application. **No field has to be changed** — an unmodified `Next` is enough. Nothing is shown to the user, no
confirmation is requested, and the office-bearer grid still displays the rows until the step is re-rendered from the
server.

A real applicant who returns to Tab 2 to correct a typo loses every office bearer they have entered, silently, and can
only discover it by navigating forward to Tab 4 again.

## Reproduction (measured against the database, not the UI)

Draft `APPL26-00592` / NPO `b67cd226-a51b-4fb1-97f9-782206a4b63c` (`QA OB Payload Probe 2026-08-14`):

| Step | `NpoOfficeBearer` rows for the NPO |
|---|---|
| 1. Add one office bearer on Tab 4, `Save` | **1** |
| 2. Click `Back` twice to reach Organisation Details | **1** — back-navigation alone is harmless |
| 3. Click `Next` **without changing any field** | **0** |

Verified with:
```
GET /api/dynamic/boxfusion.dsdnpo/NpoOfficeBearer/Crud/GetAll
    ?filter={"==":[{"var":"organisation"},"b67cd226-a51b-4fb1-97f9-782206a4b63c"]}
```

## Cause

Step 3 issues exactly two calls:

```
POST /api/services/dsdnpo/NpoApplicationActions/CreateAndUpdateApplicationAsync?applicationId=1c4cab6f-…
POST /api/services/SheshaWorkflow/Process/UserTaskSave
```

`CreateAndUpdateApplicationAsync` is a **full-object update**, and its request body carries only the
Organisation Details fields:

```json
{"name":"QA OB Payload Probe 2026-08-14","contactMobileNo":"0818400581",
 "emailAddress":"…","financialPeriod":3,
 "physicalAddress":{"addressLine1":"18 South Street, Zwartkop, Centurion"},
 "postalAddress":{"addressLine1":"…"},"operationProvi…"}
```

**There is no office-bearer collection in the payload, and no `DELETE` call is made.** The server appears to treat the
absent collection as an instruction to empty it. So the deletion is a side effect of a partial payload being applied as
a full replacement — a classic full-vs-partial update mismatch.

## Why this was misdiagnosed twice, and what that cost

Both earlier sightings were attributed to the wrong cause, and the record is worth keeping because the wrong causes
were plausible:

1. **"Office bearers are never persisted"** — from sorting `Crud/GetAll` by `creationTime desc` and seeing yesterday's
   date on top. **`sorting` is silently ignored on these endpoints**; the query returned an arbitrary page. Filtering on
   `creationTime` gives the truth.
2. **"Office bearers added in the same session the NPO is created are not persisted"** — refuted here. The very first
   save in a fresh session posts the **correct** `organisationId` and returns `200`:
   ```
   POST NpoOfficeBearer/Crud/Create {"organisationId":"b67cd226-…","personId":"de8faf40-…",…} → 200
   ```
   and the row is present in the database. `localStorage.currentOrganisation` being stale (it still pointed at an
   unrelated NPO throughout) is **irrelevant** — the wizard passes the id from the application context, not storage.
3. **"Changing the Legal Form wipes the office bearers"** — nearly right, but too specific. The legal-form change was
   incidental; it merely happened to require a re-save of Tab 2.

The two original incidents are both explained by this one cause: on `APPL26-01106` I walked forward with `Next`
*through* Organisation Details after re-login before querying the database, and so destroyed the data I then measured;
on `APPL26-00599` I went back to switch Legal Form.

🔑 **Lesson for this project: measure the database immediately before and immediately after the single action under
test.** Every wrong diagnosis above came from checking state after several intervening navigations.

## Impact

- **TC-05-029** (ADO #102159, *draft survives logout and re-login*) fails partly because of this: the draft reopens at
  Tab 1, so resuming a draft at all forces the user through Organisation Details, which wipes their office bearers.
  **Fixing this defect would remove most of that case's failure.**
- Any wizard journey that revisits Tab 2 — correcting a typo, changing Legal Form, or simply resuming a draft — is
  affected.
- The office-bearer grid keeps showing the deleted rows from client state, so the loss is invisible until the step is
  re-rendered. That is what makes it a blocker rather than an annoyance.

## Suggested fix direction (for the devs to judge)

Either include the office-bearer collection in `CreateAndUpdateApplicationAsync`, or change the endpoint to a partial
update that leaves untouched collections alone. The second is safer — the same shape of bug will exist for any other
child collection the payload omits (objectives and area-of-operations survive today, but that may be incidental).

## Questions for the test lead
1. Is `CreateAndUpdateApplicationAsync` intended to replace child collections? If so, the wizard must send them.
2. Are any **other** child collections at risk from the same endpoint? Objectives and province operations survived
   this test, but I have not proven they always will.

---

## ⚠️ Retest 2026-08-18 — DOES NOT REPRODUCE

Retested explicitly because the "never revisit Tab 2" workaround shapes the sequencing of every run. Measured against
the database **immediately before and immediately after the single action**, per the method lesson from the original
diagnosis, on two different applications and two different legal forms:

| Application | Legal form | OBs before | Action | OBs after |
|---|---|---|---|---|
| APPL26-00793 | Voluntary Association | **1** | `Next` on Organisation Details, **nothing changed** | **1** — same row id `1be56de2-…`, `isOfficeBearerDeleted:false` |
| APPL26-01270 | Trust | **3** | `Next` on Organisation Details, ×2 during the run | **3** — same three row ids |

The VA case is *exactly* the original recipe (1 OB saved → `Next` with nothing changed → 0). It now returns 1.
Counting the incidental Trust observation on 2026-08-17, that is **three non-reproductions**.

### The payload has NOT changed — so the fix is server-side
Captured from the live `CreateAndUpdateApplicationAsync` request during the retest. The body still carries **no
office-bearer collection**, only the scalar `officeBearerTerm` — i.e. the condition originally blamed for the wipe is
still present:

```
name, shortName, contactMobileNo, emailAddress, whatsappNumber, telephone, incomeTaxNumber,
financialPeriod, physicalAddress, postalAddress, operationProvinces, operationCountries,
isCipcRegNumberVerified, type, itRegistrationNo, npcRegistrationNo, membership,
approvedConstitutionalDate, officeBearerTerm
```

So the server no longer empties the absent collection. Something changed **behind** the endpoint between 08-14 and
08-17/18.

### What this does and does not establish
- The original finding was **DB-measured** and reproduced at the time, so this is not a retraction of the 08-14 result.
- Three clean non-reproductions across VA and Trust is strong evidence the defect is **fixed**, not merely dormant.
- It has **not** been re-tested on an **NPC**, which is the form involved in the separate "resumed draft cannot leave
  Tab 2" blocker. Worth one more pass there before declaring it closed.

▶ **Action: ask Thabiso whether a fix was deployed.** If yes, close this and retire the "never revisit Tab 2" rule that
currently constrains every test run. If no, treat the wipe as **intermittent**, which would make it harder to trust,
not easier.
