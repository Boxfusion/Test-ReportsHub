# ~~BUG-LB-010~~ — WITHDRAWN 2026-08-21: NOT A DEFECT (tester error)

> ## ⚠️ This bug report was WRONG. Closed as invalid on 2026-08-21.
>
> The Landbank Branch manual upload mechanism **works correctly**. Re-tested end to end on
> 2026-08-21 and a lead saved successfully (`LBLead-details?id=5fab2b14-12c5-4f20-af10-f81ec44a3935`,
> Close Corporation (Entity) / Landbank Branch).
>
> **What I got wrong.** Every reproduction below clicked **Upload** *before* all the required fields
> were populated. The commit is **conditional on the form being complete** — it will not fire until
> the client-detail block, Entity Name, Mobile Number and Email Address are all filled in. With them
> filled, clicking Upload fires
> `POST /api/services/app/LBLead/PopulateFromCompanyRegistration → 200`, which returns
> `{"success":true,"leadId":"…","isNewLead":true,"companyName":"BOXFUSION (PTY)LTD"}`, populates
> Entity Name from CIPC, normalises the registration number to `K2012/225386/07`, reveals the
> client-detail block, and enables **Save**.
>
> The absence of a network request — which I read as "the button does nothing" — was the form
> correctly declining to submit an incomplete payload.
>
> **The real fault was in the test plan's step order**, not the app. Corrected in
> `../../../test-plans/leads/branch-manual-document-upload.md`: all required fields must be populated
> **while the toggle is off**, before it is switched on and the documents attached.
>
> **Retained for the record only.** The original (incorrect) report follows.

---

# BUG-LB-010 — Landbank Branch "Upload" commit is a silent no-op; manual-upload leads can never be saved *(WITHDRAWN — see above)*

**Logged:** 2026-08-20
**Plan:** `projects/land-bank/test-plans/leads/branch-manual-document-upload.md`
**Failing TCs:** TC-03 (Individual), TC-04, TC-05, TC-06, TC-07, TC-08, TC-09, TC-10 (all seven entity types) — **8 of 11 tests**
**Suspected category:** `business-logic`
**Severity:** **Blocker** — the Landbank Branch manual document upload route cannot complete for any client type.

## Step

Both capture processes fail at the same step. Verbatim from the spec:

- **Process A (Individual)** — `// STEP 4: CLICK **Upload**`
- **Process B (all 7 entity types)** — `// STEP 9: CLICK **Upload**`

## Expected

From the plan's recorded behaviour (verified live 2026-07-31 and 2026-08-05):

- **Process A:** clicking **Upload** reveals the client-detail block (`title`, `firstName`, `lastName`, `territory`, `preferredCommunication`), re-enables **Save**, and clears the previously typed Mobile / Email / ID.
- **Process B:** clicking **Upload** runs a **CIPC lookup keyed off the Company Registration Number**, auto-populating **Entity Name** (`2012/225386/07` → `BOXFUSION (PTY)LTD`), normalising the registration number to its `K`-prefixed form (`K2012/225386/07`), re-revealing the client-detail block and re-enabling **Save**.

## Actual

Clicking **Upload** stores the file(s) and **does nothing else**. No CIPC lookup, no field population, no reveal, no error.

Reproduced manually via MCP on 2026-08-20, on a clean modal, with a single Upload click:

**Process B — Close Corporation (Entity)**, Signatory ID `9207125001083`, Company Registration Number `2012/225386/07`, both documents attached:

| Observation | Result |
|---|---|
| Network | `PUT /api/StoredFile → 200` ×2 (the file uploads) — **and nothing else** |
| CIPC lookup request | **never fired** |
| `organisation` (Entity Name) | **empty** |
| `companyRegistrationNumber` | unchanged `2012/225386/07` — **not** normalised to `K2012/225386/07` |
| Client-detail block (`firstName`) | **absent from the DOM** (0 elements) |
| Toast / inline error | **none** |

**Process A — Individual (Individual)**, consent document attached:

| Observation | Result |
|---|---|
| Network | `PUT /api/StoredFile → 200` ×1 — **and nothing else** |
| Client-detail block (`firstName` / `lastName` / `territory`) | **absent from the DOM** (0 elements) |
| **Save** button | **still disabled** |
| Toast / inline error | **none** |

Because **Save never becomes enabled** on Process A, and the required client details are never revealed on either process, **a lead cannot be created through the Landbank Branch manual upload route at all**.

## Playwright error

Representative, from the post-repair full run (`projects/land-bank/test-results/results.json`):

```
TC-04: Close Corporation (Entity) — resolution + consent upload
Error: expect(locator).toHaveValue(expected) failed

Locator: locator('.ant-modal-content')
  .locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])')
  .locator('input.ant-input')
Expected: "BOXFUSION (PTY)LTD"
Timeout: 60000ms

Call log:
  6 × locator resolved to <input value="" type="text" maxlength="200" class="ant-input"/>
    - unexpected value ""
```

```
TC-03: Individual — consent-only upload
Error: firstName should be present
expect(locator).toHaveCount(expected) failed
Expected: 1
Received: 0
Timeout:  60000ms
  123 × locator resolved to 0 elements
```

## Snapshot / screenshot

Playwright artifacts (screenshot, video, trace) per failing test under:

```
projects/land-bank/test-results/artifacts/projects-land-bank-test-pl-*-chromium/
```

e.g. `…-32b3f-—-resolution-consent-upload-chromium/{test-failed-1.png, trace.zip, video.webm}`

## Suspected cause

The **Upload** commit handler appears to have stopped invoking the downstream document-processing / CIPC-lookup action. The file-storage call (`PUT /api/StoredFile`) still succeeds, so the regression is in whatever ran *after* storage — the step that previously performed the CIPC lookup, populated the entity fields and re-revealed the client-detail block. No request is issued at all, so this looks client-side (an action that is no longer wired or is failing before dispatch) rather than a server error.

## Regression window

Working on **2026-08-05** (recorded in `../../test-plans/leads/lead-to-opportunity-lifecycle.md` and `../../test-plans/workflow/loan-application-workflow-stages.md`, where the CIPC auto-populate produced `BOXFUSION (PTY)LTD`). Broken on **2026-08-20**. The lead-create form version moved from `LandBank.Crm/LBLead-create v62` to a later build in that window.

## Not a test defect

The failing assertions were re-verified by hand through the UI on 2026-08-20 with the exact field order the spec uses (signatory ID and registration number typed **before** the documents were attached, then a single Upload click on a freshly opened modal). The behaviour reproduces identically outside Playwright.

Two genuine spec defects *were* found and repaired in the same run, and are **not** part of this bug:
1. `expectFieldShown` / `expectFieldHidden` assumed every conditional field hides via `ant-form-item-hidden`; the client-detail block is instead **removed from the DOM**.
2. The option-inventory read matched two dropdowns at once, because a stale dropdown only gains `-hidden` asynchronously.

## Related

- **BUG-LB-007** — `Sole Proprietor (Individual)` filtered out of the Client Type dropdown (TC-02's expected fail; separate issue, still open).
- This is the **fifth** silent-failure defect in this project, alongside BUG-LB-001 (validation as HTTP 500 with no message), BUG-LB-005 (save blocked by an unrelated field error with no summary), and BUG-LB-006 (Finalise Verification Outcomes no-op). Worth raising the pattern with the team: user-facing actions that fail without surfacing anything.
