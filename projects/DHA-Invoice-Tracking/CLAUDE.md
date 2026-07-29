# CLAUDE.md — Hybrid Markdown + Playwright Testing (DHA Invoice Tracking project)

> **Multi-project hub.** This file describes the **DHA SmartGov Invoice Tracking (ITS)** project. Shared Playwright + Allure infrastructure (`package.json`, `playwright.config.ts`, `node_modules/`, `scripts/run-plan.js`) lives at the hub root one level up. Tests run from the hub root: `node scripts/run-plan.js projects/DHA-Invoice-Tracking/test-plans/<folder>/<plan>.md`.

> **Same ITS workflows as PD.** DHA is a separate SmartGov deployment for the Department of Home Affairs. The Invoice Tracking process definitions (BAS / LOGIS Request For Payment) are the same as the PD-Invoice-Tracking project — the plans were seeded from PD. Only the App URL, credentials, and role assignees differ. Confirmed live 2026-07-16: identical form schema, supplier picker, invoice grid, and submit routing.

This project uses **markdown plans as the source of truth** and **Playwright `.spec.ts` files as a derived runtime artefact**. Plans live in [test-plans/](test-plans/); each plan has a paired `.spec.ts` beside it that Playwright executes for speed. When a script step fails or hits a `TODO` marker, Claude falls back to AI-driven MCP browser execution, repairs the failing step in the spec, and re-runs.

> **The .md plan is canonical.** The .spec.ts is a generated, self-healing artefact. Edit the .md, not the spec — except for AI-repair patches, which Claude applies automatically.

## Mandatory Pre-Flight
Before executing ANY test plan:
1. Read this file (`projects/DHA-Invoice-Tracking/CLAUDE.md`) completely
2. Read [test-plans/RULES.md](test-plans/RULES.md) completely
3. Read the specific test plan file (`.md`)
4. Read the paired `.spec.ts` if it exists
5. Only then begin execution

## Application Under Test
| Key | Value |
|-----|-------|
| App | DHA SmartGov Invoice Tracking (ITS) Admin Portal |
| URL (QA) | https://dha-smartgov-adminportal-qa.shesha.app/ |
| URL (TEST) | https://dha-smartgov-adminportal-test.shesha.app/ (API `https://dha-smartgov-api-test.shesha.app`) |
| Environment | QA and TEST — same build family, same credentials, same form schema (verified live 2026-07-28) |

> ✅ **BAS re-verified green on TEST 2026-07-29** — PAY3061/2026, 11/11 steps → **PAID + Filed**
> (Completed) in ~12 min, both imports correct:
> [test-reports/2026-07-29/bas-full-chain-PAY3061.md](test-reports/2026-07-29/bas-full-chain-PAY3061.md).
> The 2026-07-28 Register & Upload `Submit` 500 is fixed for BOTH processes (it was 5/5 hard-failing);
> LOGIS registration routes correctly too (PAY3055/2026 → RECEIVED → Certify Invoice).
>
> ⚠️ **But that Submit 500 is INTERMITTENT, not gone.** On 2026-07-29 the first Submit on PAY3061
> returned the same `Activity_0e0c34w` / `TargetInvocationException` 500 and an identical retry 16 s
> later succeeded; a controlled second registration (PAY3065/2026) passed on its first Submit. 1 failure
> in 2 registrations, **with zero UI feedback** — the form just sits there. Retry clears it. Bug:
> [test-reports/bugs/2026-07-29-bas-register-upload-submit-500-intermittent.md](test-reports/bugs/2026-07-29-bas-register-upload-submit-500-intermittent.md).
> If a Submit appears to do nothing anywhere in this app, check the XHR before assuming a missed click.
>
> ✅ **LOGIS now runs GREEN END-TO-END on TEST (2026-07-29) — the first time ever, and proven twice.**
> PAY3055/2026 **11/11 → PAID + Filed** after the two blocker fixes
> ([report](test-reports/2026-07-29/logis-full-chain-PAY3055.md)), then **PAY3072/2026 registered and
> completed in one clean ~11 min pass** on a **2-line-item** order (OR-126120, R3 446), no 4xx/5xx
> ([report](test-reports/2026-07-29/logis-full-chain-PAY3072.md)).
>
> **Registration notes:** the **Order Line Items panel only appears AFTER the invoice row is committed**
> with the plus-circle button; the LOGIS invoice grid has **no Invoice Amount column** (the amount comes
> from the ticked line items); over-invoicing a line requires a **Motivation** upload (**untested**).
> Both blockers cleared: the Certify `SetPaymentApprover` 500 is fixed (routes to **Melissa Ndlovu**, as on
> QA — org structure populated), and the `Capture Payment on LOGIS` role gap is resolved by
> **`H23086050`** (see Credentials).
>
> **LOGIS specifics confirmed on TEST:** BAS report needs **`Source Doc Type = INV`**; the **FUNC NO match
> is lenient about zero-padding** (`00003055` matched the hand-captured payment number `3055`) and the
> stored payment number is **not** overwritten — on LOGIS the FUNC NO only *finds* the invoice, on BAS it
> *becomes* the payment number. The import completes **one** step here (no "Upload Captured Invoices
> Report" step on LOGIS). The payment stub matches on the **PURCHASE ORDER NUMBER** — use the new
> **`--po`** flag on `scripts/make-payment-stub.js`.
>
> **LOGIS form facts (2026-07-29):** *Verify Invoice* has **SEVEN** mandatory Yes/No questions (BAS's
> Prepare Voucher has four) — radio index map 0=business query, 1=supplier query, **2=Verification is
> complete**, 3=Reject, 4–17 = the seven Yes/No pairs. *Assign Responsible Official* is an **open person
> picker** (whole staff directory), so self-assign works there too. *Pre-Authorise Payment* shows those
> seven answers **read-only** — confirm tick only. LOGIS *Verify Voucher* has **no** Batch Number.
> On *Capture and Link*, the inline **Save icon for Payment Number only renders on row hover**.
> **Plan bug — `logis.md` TC-16 step 2 is wrong:** Batch Number at *Capture Filing* is **empty, editable
> and required** (LOGIS Capture Filing has 3 required fields: Batch Number, Box Number, File Range).
>
> ⛔ **Query-response steps still unrunnable** ("Manage Supplier Related Queries" / "Resolve Queries") —
> they route to **HLEKANEI ROSE MATHE** alone and we have no login for her. See
> [test-reports/2026-07-28/bas-negative-supplier-related-query-PAY3039.md](test-reports/2026-07-28/bas-negative-supplier-related-query-PAY3039.md).

### LOGIS test-data notes (2026-07-28)
- **`OR-124953` is unusable on TEST** — the order header exists but it has **no `SaGovOrderLineItem`
  records** (`GetOrderLineItems` → `{"result":[]}`), and LOGIS cannot be submitted without selecting a
  line item. Orders with confirmed capacity: **OR-125489** (R92, 1 item, Max 4), OR-126120 (R3 446, 2),
  OR-126151 (R14 607, 2), OR-126052 (R78 522, 1), **OR-126152** (R7 058.69, **20 items** — good for
  multi-line-item cases).
- The TEST register form is `…RegisterScanandUploadInvoices-Create **v13**` and **does** show the
  **Order Line Items** panel (tick `Select`, `(Max: n)` capacity, `Reset Order Line Items` =
  `button[title="Refresh Order Line Items"]`). QA had no such panel. Conversely the
  **"Submit Invoice with Order Line Items" confirmation dialog (plan TC-02 step 25) does NOT appear** —
  Submit routes straight through.
- **Never change the Order on a LOGIS draft that already has a committed invoice row** — the form goes
  inconsistent (Business Unit clears, row dropped, `onRowSave:error` / `Create failed` on re-commit).
  Start a fresh registration instead.

## Credentials
Passwords are the **same on QA and TEST**. Admin = `DHA@Admin_2026#xP4!`; every other account = `123qwe`.
All six downstream logins were re-verified against TEST on 2026-07-28.

| Person | Username | Role in the chain |
|---|---|---|
| System Administrator (initiator / BAS Report & Payment Stub imports) | `Admin` | `DHA@Admin_2026#xP4!` — import identity shows as MIRRIAM NELLY OTTO |
| Thabiso Maake | `ThabisoM` | Finance Unit — self-assign hand-off chain / certifier |
| Mutshutshu Tshithukhe | `Mutshutshut` | Internal Control (Capture Filing) + BAS query responder |
| Melissa Ndlovu | `00000000` | Approve Invoice (LOGIS) — resolved from Thabiso via the org structure |
| Monicca J Kabini | `H18433740` | SCM — Assign Responsible Official + Pre-Authorise |
| **Lesetja Jack Bambo** | **`H23086050`** | **LOGIS `Capture and Link Invoice on LOGIS`** (role `Capture Payment on LOGIS`) — **the only member of that role confirmed to take `123qwe`**; `H22262270` does **not** (403). Not available to `ThabisoM` on TEST, unlike QA |
| Tshianeo Moirah Maboya | `H19234198` | Internal Control: Verify Voucher (BAS **and** LOGIS) |
| Susanna Maria Erasmus | `H10226923` | Capture Filing (QA) — on **TEST** LOGIS Capture Filing routes to **`Mutshutshut`** instead |

> **Single-login self-assign technique.** The BAS/LOGIS chain is multi-role, but each assignment
> field names the person who owns the **next** step, so at every Finance-Unit hand-off you can
> self-assign **Thabiso Maake** and the next step re-opens directly (todoid changes, no inbox
> round-trip). Search by **full name** — partial names return a different top match.

### Assignees discovered live (2026-07-16, PAY3092/2026)
| Step / role | Candidate assignees (from workflow tooltip) | Login |
|---|---|---|
| Assign Branch Finance Admin to Assign Certifier | Thabiso Maake, Susanna Maria Erasmus, Hester Johanna Paulina Harding, Tshianeo Moirah Maboya | `ThabisoM` / `H10226923` / `H19234198` |

## Notes from first live run (2026-07-16), re-confirmed on TEST (2026-07-28)
- Login lands on `workflows-inbox`. Switch view mode Live → **Latest** right after login (header toggle).
  The toggle is `[title="Click to change view mode"]`; it opens an `.ant-dropdown` with
  Live / Ready / **Latest**. It **resets to Live on every fresh login**, so re-switch each time.
- Useful direct URLs (module `Shesha.SaGovInvoiceTracking`, both envs):
  `/dynamic/Shesha.Workflow/workflows-my-items`, `/dynamic/Shesha.Workflow/workflows-inbox`,
  `/dynamic/Shesha.SaGovInvoiceTracking/SaGov-BAS-report-import`,
  `/dynamic/Shesha.SaGovInvoiceTracking/SaGov-payment-stub-imports`.
  An initiated item can be viewed read-only at `/shesha/workflow?id=<instanceId>`.
- Selector notes for the Register form (stable on both envs): the Invoices panel is a
  `[role=table]` (not a real `<table>`, so `document.querySelectorAll('table input')` finds nothing);
  commit the row with `[role=table] button:has(span[aria-label="plus-circle"])`; Invoice No is
  `span.ant-input-affix-wrapper input.ant-input`; Invoice Amount is `input.ant-input-number-input`;
  both date cells are `input[placeholder="Select date"]` (nth 0 / 1) and accept typed `dd/mm/yyyy`.
- Attachments **do** bind via the real file chooser (click the "(press to upload)" button, then
  `browser_file_upload`) — the hidden-input injection gotcha does not apply with that flow.
- Sidebar flyout submenus (Workflows → Incoming Items / My Items / Sent / Drafts) intercept pointer events; hover a top-right toolbar button to dismiss the flyout before clicking `Create New`.
- Create New (My Items page) → **BAS Request For Payment** opens the Register & Upload form and assigns the Ref No immediately (PAY####/2026).
- Supplier picker = "Select Item" modal (340k+ suppliers); **double-click** a row to select.
- Invoice grid row: Invoice Date, Service Delivery Date, Invoice No, Invoice Amount, Invoice Attachment (upload) → commit row with the **plus-circle** button; Total Amount then sums.
- Submit redirects to My Items and routes the item to "Assign Branch Finance Admin to Assign Certifier".

### Per-step required fields discovered 2026-07-28 (BAS, TEST)
- **Verify Voucher** — required **Batch Number** (free text). Submit stays disabled until it is filled;
  the confirmation tick alone is not enough. Download Zip is *not* a gate on this step.
- **Capture Filing** — required **Box Number** and **File Range**, plus the confirmation tick.
- **Prepare Voucher** — the four *Business Unit Response* Yes/No questions are mandatory for **every**
  outcome (including the query and reject branches). Submit is not disabled — clicking it raises four
  inline "Please select an option" errors.
- Each **"I confirm …"** caption is a `<button>` acting as a label for its checkbox — it *toggles* the
  box, so clicking both the box and the caption cancels out.
- Every negative outcome (supplier query / business query / reject / send-back / approve-rejection)
  opens its own modal with a **mandatory comment**; `Ok` stays disabled until text is entered.
- Several steps render multiple `Submit` buttons, all but one hidden (zero bounding box) — filter to
  visible before clicking.
- `Attach Payment Stub` shows as never-activated in `Process/Progress` even after the chain passes
  through it (the stub import completes it programmatically). Cosmetic.
- Non-admin users have **no view-mode toggle** (header v25 vs v26) — Live → Latest is Admin-only.
- **Query-response steps are unrunnable on TEST:** "Manage Supplier Related Queries" (supplier query)
  and "Resolve Queries" (business query) are assigned to **HLEKANEI ROSE MATHE** alone — no login
  available, and not visible to `ThabisoM` or `Mutshutshut`. Needs a test account in that role.

## BAS Report Import — Excel vs Notepad setting (new, 2026-07-28)
The BAS Report Import now has a **setting for Excel or Notepad**. **TEST is currently set to
Notepad**, so the importer expects a fixed-width **RP0111BS "Register of Payments" `.txt`**, not the
`.xlsx` used on QA. Format reference, column geometry and the CSV-quote gotcha:
[test-data/README-bas-report-text-format.md](test-data/README-bas-report-text-format.md).
Build an import file by editing the known-good template in place:

```bash
node scripts/make-bas-text-report.js --payment 2952 --invoice DHA-INV-2952 \
  --supplier KL772 --amount 24500 --type SUNDRY --out test-data/bas-text-report-PAY2952.txt
```

Key points: detail line is always 170 chars; AMOUNT is right-aligned ending at col 169; a line is
quoted **iff** it contains a comma (so any amount ≥ 1 000), and the quote shifts every column by +1;
`SOURCE DOC TYPE` = `SUNDRY` for BAS / `INV` for LOGIS; `FUNC NO` becomes the Payment Number; match
key is Invoice No + Supplier No + Amount.

**Verified live on TEST 2026-07-28** (first successful `.txt` import): `Is Success = Yes`,
`Payments Authorised = 1`, and the one import completes **two** workflow steps (*Upload Captured
Invoices Report From BAS* **and** *Final Authorise Payment*). The template's `ENT TYPE` (`SUNDRY`)
**does not** have to match the supplier type — `KL772` matched and authorised with it unchanged.

## Payment Stub Import (RP007BS `.txt`)
Unaffected by the Excel/Notepad setting — always fixed-width `.txt`. Build one with:

```bash
node scripts/make-payment-stub.js --payment 00003035 --invoice DHA-INV-3035 \
  --amount 24500 --out test-data/payment-stub-PAY3035.txt
```

102-line template, only line 21 changes: invoice no at col 3, **payment number at col 71**, amount
right-aligned to col 128 (line is always 128 chars). **The payment number must be the zero-padded value
the BAS import stamped on the invoice** (e.g. `00003035`, not `3035`) — with the `.txt` BAS route the
`FUNC NO` keeps its leading zeros, unlike the older QA `.xlsx` route. A successful import reports
`invoicesConfirmedPaid = 1` and completes *Attach Payment Stub*, routing the item to *Capture Filing*.

## Azure DevOps
| Key | Value |
|-----|-------|
| Organization | boxfusion |
| Project | PD-Shesha 3 Migration |
| Test Plan | #102133 — ITS Automation Test Cases (shared with PD) |

## Test Artifacts (per-project)
| Artifact | Path (within this project) |
|---|---|
| **Allure raw** | `allure-results/*.json` |
| **Allure report** | `allure-report/index.html` |
| **Run report** | `test-reports/YYYY-MM-DD/<name>.md` |
| **Bug log** | `test-reports/bugs/<name>.md` |

## Core Constraints
- **Plans are markdown.** `.md` files in [test-plans/](test-plans/) are canonical.
- **Specs are derived.** Don't hand-edit `.spec.ts` outside of AI-repair flow.
- **Playwright-first.** Always try the script before falling back to AI.
- **Always create our own invoice**, never action one we didn't create.
- **Fail fast on blockers.** A failed `(BLOCKING)` assertion stops the test.
- **Close the browser after finishing.**
