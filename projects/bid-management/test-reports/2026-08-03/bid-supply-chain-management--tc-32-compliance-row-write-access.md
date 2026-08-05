# Report: BID-SCM — TC-32 Compliance-row write access for a non-participant (NEGATIVE)

**Date:** 2026-08-03
**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Cases:** TC-32
**Method:** driven live via Playwright MCP — **UI level only** (the direct-endpoint probe was deliberately not run)
**Environment:** QA — `https://pd-supplychainmanagement-adminportal-qa.shesha.app`
**Non-participant:** **MoshadiM / 123qwe** (holds no task on this tender) · view mode **Latest**
**Legitimate assignee:** **TumisangM** — the tender sits in their inbox at *Verify Compliance*
**Tender:** **REF2026-2561** (90/10, `run-mq4v7dtp`), untouched by this test
**Result:** PARTIAL — ✅ **passes at the UI level: compliance data is properly protected.** The document hole from
TC-24 is still present on the same page. Not a full pass: the **step-3 direct-endpoint probe was never run**, so
API-level write protection for compliance rows remains unverified.

## Why this test exists

TC-24 established an asymmetry: on a tender where the user holds **no task**, the `workflow-action` URL returns a
read-only fallback and the workflow **decisions are protected** — but **documents are not**
(`PUT /api/StoredFile` → 200, `DELETE /api/StoredFile/Delete` → 200, persisting across reload). TC-32 asks whether
that gap extends to **compliance data**, where a write would change an evaluation outcome rather than a file.

## Result — compliance rows are NOT writable through the UI

Opening `workflow-action?id=2cadb802-…&todoid=66f9d5e0-…` (TumisangM's task) as **MoshadiM**:

| Observation | Result |
|---|---|
| Fallback message | ✅ *"Requested action is not available"* |
| Form served | **`tender-wf-details-view v27`** — a read-only details view, **not** the Verify Compliance form |
| Compliance rows (Manual Responses: Telkom, BOXFUSION, A & A Stationers) | Only a **magnifier** per row. **No row edit icon**, no inline checkbox |
| Page-level checkbox (*Is On Procurement Plan*) | **`disabled`** |
| Per-supplier **"Supplier compliance"** dialog (`response-wf-reviewsuppliercompliance-dialog-details v14`) | **Every control disabled** — 5 file inputs `disabled: true`, both compliance-status radios (values 2 and 3) `disabled: true` |
| Dialog buttons | **Close only.** No Save, no Submit |

So a non-participant can *view* the compliance detail but has no affordance to change it. The two "edit" icons on
the page are Shesha's **form-designer** buttons in the header chrome, not row editors — worth noting because a
naive DOM count makes the page look editable when it is not.

**Nothing was modified.** The dialog was opened and closed; the tender remains at *Verify Compliance* in
TumisangM's inbox.

## 🔴 But the TC-24 document hole is still on this page

On the same read-only fallback, the **Procurement Plan "(press to upload)" button is rendered and clickable**
(158 × 32, not disabled), alongside Download Batch and Download Zip.

So within one read-only view the app **disables every compliance control and leaves the document control live** —
which is exactly the inconsistency TC-24 reported, now sharpened: it is not that the fallback fails to protect
anything, it is that **document components are missing the read-only treatment that the compliance components
get**. That is a useful, narrow pointer for dev.

## Not tested — server-side enforcement

**Step 3 of the plan (a direct write against the compliance CRUD endpoint) was deliberately skipped** on the test
lead's instruction to keep this run UI-only.

This matters for how the result is read: **the UI does not offer the write, but we have not established that the
server would refuse it.** TC-24's attachment finding only surfaced at the API level — the UI hid nothing there
either until the request was made directly. So:

- ✅ Proven: no UI path for a non-participant to alter compliance data.
- ❓ Unproven: whether `FlatResponseDocument` / compliance CRUD endpoints authorise by task assignment.

Until that is run, this should not be reported as "compliance data is secure" — only as "the UI does not expose it".

## Assertions

- [x] ASSERT a non-participant cannot change Is Compliant? via the UI — **PASSES**: all controls disabled, no Save
- [ ] ASSERT the server rejects the write directly — **NOT TESTED** (deferred by instruction)
- [x] ASSERT nothing persists for the legitimate assignee — **PASSES trivially**: nothing could be changed
- [x] ASSERT the TC-24 document gap on the same fallback — **CONFIRMED still present** (upload control live)

## Note on test data — ref numbers appear to be reused

While locating this fixture, **REF2026-0890 appeared in TumisangM's inbox** at an evaluation stage, while the
REF2026-0890 created today for TC-27 is an unsubmitted **draft**. Earlier notes also record "0890 at Calculate
SGP". That points to **reference numbers being recycled**, so a REF is not a unique identifier — **use the workflow
instance GUID** when pinning a tender.
