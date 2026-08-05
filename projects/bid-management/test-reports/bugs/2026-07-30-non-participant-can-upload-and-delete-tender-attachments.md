# BUG: The "Requested action is not available" read-only view still lets ANY authenticated user upload and delete tender attachments

> **⚠️ Checked against the test cases, 2026-08-03 — and deliberately KEPT at High.** No ADO case in suite #57473
> covers direct-URL authorisation, so there is no documented expectation to cite. **This one is still reported as a
> defect**, because an unauthorised, unaudited write to procurement evidence is a **security property**, not a
> business-rule interpretation: `PUT /api/StoredFile` → **200** and `DELETE /api/StoredFile/Delete` → **200** for a
> user with **no task on the tender**, persisting across reload. That is wrong whether or not a case mentions it.
>
> Flagged for the test lead: if the standing rule (nothing outside the test cases) is meant to apply here too, say
> so and it will be demoted — but the recommendation is to keep it **and add a case**.
>
> ⚠️ **Not re-verified since 2026-07-30** (2/2 then: upload, then delete, as MoshadiM on REF2026-2561).

| Field | Value |
|---|---|
| **Logged** | 2026-07-30 |
| **Project** | PD Bid Management (`projects/bid-management`) |
| **App / Env** | Supply Chain Management Admin Portal — **QA** (`https://pd-supplychainmanagement-adminportal-qa.shesha.app`) |
| **Type** | **Authorisation / data integrity** |
| **Severity** | **High** — an unauthorised, unaudited write to procurement evidence |
| **Reproducibility** | **2/2** (upload, then delete) |
| **Form** | `Shesha.SupplyChainManagement/tender-wf-details-view v27` (the read-only fallback) |
| **Tender** | **REF2026-2561** (at *Verify Compliance*, assigned to **TumisangM**) |
| **Actor** | **MoshadiM / 123qwe** — the BAC adjudicator, who has **no task on this tender at all** |
| **Plan / TC** | `test-plans/tender-process/bid-supply-chain-management.md` — **TC-24** |

## Summary

Opening another user's `workflow-action?id=…&todoid=…` URL correctly refuses the *decision*: the page shows
**"Requested action is not available"** and renders no Approve / Disapprove / Send Back / Submit. **But the
same read-only page still renders a live document-upload control** — and it works.

As **MoshadiM**, with no task on REF2026-2561:

- **Upload succeeded** — `PUT /api/StoredFile` → **200**; the Procurement Plan field showed
  `supporting-doc.txt (81 B)`, and it **survived a full page reload**, so it is persisted server-side, not a
  client-side illusion.
- **Delete succeeded** —
  `DELETE /api/StoredFile/Delete?fileId=…&ownerId=…&ownerType=…RfxWorkflow&propertyName=model.requisitionDoc`
  → **200**, via a normal "Delete Attachment → Are you sure?" confirm.

So the workflow's *decisions* are protected while its *documents* are not.

## Steps to reproduce

1. From user A's inbox, copy a tender's action URL (`/shesha/workflow-action?id=…&todoid=…`).
2. Sign in as user B — any authenticated SCM user who is **not** the assignee and has no task on that tender.
3. Navigate to the URL. Confirm the page shows **"Requested action is not available"** and no action buttons.
4. On the **Tender Details** tab, click the **Procurement Plan → "(press to upload)"** control and pick a file.
5. Reload the page — the file is still attached.
6. Click the attachment's **delete** icon → **Yes**. It is removed.

## Expected

A user with no actionable task on a tender should not be able to modify any part of it. The read-only fallback
view should render attachments as **download-only** — no upload control, no delete/replace icons — and the
`StoredFile` endpoints should reject the write regardless of what the UI renders.

## Actual

Upload and delete both succeed, on a page that simultaneously tells the user the action is not available.

## Impact

The attachments on a tender *are* the procurement evidence — procurement plan, tax clearance certificates,
BBBEE certificates, bid documents, the specific-goal calculation spreadsheet. This lets any authenticated user:

- **plant** a document on a tender they are not party to, and
- **remove** a document that a compliance decision was based on — after that decision was taken

with no task, no workflow step, and therefore nothing in the workflow's audit trail to explain the change.
Note the `propertyName` in the delete call is arbitrary per control, so this is not limited to the Procurement
Plan field.

**Not tested (deliberately):** whether the same works against a *completed* tender, and whether the compliance
document rows (`RfxResponseDocument`) are equally writable from this view. Both are worth checking — the
compliance rows are the higher-value target since Verify Compliance decisions hang off them.

## Suggested fix (for dev)

Two layers, and the server-side one is the one that matters:

1. **Server:** authorise `PUT /api/StoredFile` and `StoredFile/Delete` against the caller's relationship to
   the owning entity — not merely on being authenticated.
2. **UI:** when `tender-wf-details-view` is rendered as the not-available fallback, bind its file components
   read-only so no upload/delete/replace affordance appears at all.

## How this was found, and the correction it forces

Found while closing out TC-24, which had recorded only an *open question* about non-participants having read
visibility. The read access is arguably by design; **the write access is not.** TC-24's conclusion has been
corrected: **authorisation holds for workflow decisions (including replay of a completed todoid) but fails for
document attachments.**

**Cleanup:** the uploaded test file was deleted in the course of testing the delete path, so REF2026-2561 is
back to its original state (it had no Procurement Plan document before this test).
