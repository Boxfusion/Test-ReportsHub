# DSD-NPO — observations and questions for the test lead, 2026-08-28

Not defects. These are the things worth Thabiso's eye from today's close-out run, plus the notes that belong with
the reports rather than in a daily summary.

## Questions for Thabiso

1. **Was a "Read only" role ever seeded?** ADO #107430 (TC-14C-005) opens with *"Precondition: user with 'Read only'
   role signed in → Role seed present."* The registry holds exactly **46** roles and none matches — verified with a
   working search as a control (`Registry` → 2, `Reviewer` → 3, `read` → 0). If the concept has been superseded by
   the per-role permission model, the case needs a rewrite rather than a re-run.
2. **`entity-change-audit-log` has never been able to render.** It calls
   `EntityHistory/GetAuditTrail?entityId=&entityTypeFullName=` — both required parameters **empty** — and takes a
   400. Was it intended to be opened only from a record's own detail view, with the entity passed in? The data
   behind it is healthy, so this looks like a one-parameter wiring fix rather than a missing feature.
3. **Should an audit entry carry a comment?** ADO #101815 prescribes *"actor, timestamp, from-state, to-state,
   comment"*. The record carries the first four; there is no comment field at all.
4. **Should a file-upload audit entry carry a file hash?** ADO #107427 step 1 says so. Today the entry records the
   actor and the event but nothing identifying the file — `extendedDescription` is empty.
5. **At `applicationStatus 10` (OB Failed Compliance), what is the applicant supposed to see?** Today they get
   *"All Done! You're all caught up, there's no new actions."* Editing is correctly refused, but no
   fix-and-resubmit route is offered either, which sits alongside the 08-27 finding that no resubmission
   notification is raised at this transition.

## Questions from the afternoon blocker re-sweep

6. **Can a synthetic NPO be seeded into the registered register?** The rebuilt Whistleblowing form makes
   `Npo Number*` mandatory and resolves it only against registered NPOs. Ours has no number, and there is no test
   NPO. Without one, five TC-12 cases cannot run unless QA names a **real** organisation in a misconduct
   allegation — which we have not done and should not do without your instruction.
7. **Should opening the Whistleblowing form persist a draft case?** Simply clicking the entry point created
   `INV1694/28/08/2026` before anything was entered. Abandoned visits will accumulate referenced empty drafts.
8. **Is the full `Dsd.District` seed still coming?** 2 of ~52 districts exist and only `Ugu` is linked to a
   province, so interventions can currently be captured for KwaZulu-Natal only.
9. **What disables Save on Add Intervention?** All 15 starred fields across all four sections were filled and Save
   stayed disabled, with no error state exposed anywhere in the modal.
10. **Is the library Add File upload switched off deliberately in QA?** It has been unconditionally disabled since
    08-18 — three reproductions — and is not gated on the other fields.

## 🔴 Security — routed here, NOT for the daily report

11. **Uploaded documents download with no authentication, by id.** Closing TC-14Z-018/019, `StoredFile/Download?id=`
    returned the full PDF of Account B's application documents to an unrelated Account A **and to an anonymous
    caller with no token**; `StoredFile/FilesList?ownerId=` enumerated them. Combined with the already-known
    anonymous readability of NPO/application ids, that is an unauthenticated path from an application id to its
    document contents. Appended to `bugs/2026-08-18-api-reachable-without-authentication.md`; same fix (the guard
    already on `Npo.Application`). **Which of 018/019 targets enumeration vs retrieval — please confirm; the finding
    covers both.**

## Observations, not raised as defects

- **`npo-landing-view` fires a 404 on every load.** It issues `NpoApplication/Crud/Get?id=<npoId>` — the **NPO** id
  against an **application** lookup — then recovers with a correct `GetAll`. Invisible to the user, but it is noise
  in the logs and a sign the page is holding the wrong id.
- **The applicant dashboard briefly renders *"Draft Application"* and *"Resubmit Annual Compliance Submission"***
  during hydration before settling to *"All Done!"*. The settled state is the true one.
- **The applicant's Workflows inbox renders `0 items found`.** Consistent with the standing open question about
  empty inboxes; not re-raised here.

## 🔑 Method notes worth keeping

- **A Shesha grid's `quickSearch` persists in `localStorage` per table and survives a full reload while the input
  box renders empty.** A stale value made the Roles grid read *"No Data"* across several reloads and looked exactly
  like a broken screen. It is browser-local — it never touches server state or another user. Two false findings were
  nearly filed off it ("the roles search is broken", "changing page size empties the grid"); both were wrong.
- **`pressSequentially` appends to whatever the field already holds** (the search box became `Registryread`), and
  `fill()` leaves React state stale. Clear with a real click → `Ctrl+A` → `Delete`, and confirm against the grid's
  **outgoing request**, not the input's value.
- **Never conclude a zero from a search you have not proved works.** Every "0 results" today was paired with a
  control term that returns a known non-zero count.
- **A rendered attribute is not evidence.** `View NPO Profile` renders `?id=` empty pre-hydration; the id is present
  by click time and the link works.

## ⚠️ A mistake to not repeat — third instance this month

I re-ran **TC-14-003** believing it was blocked. It had been **FAILED since 2026-08-25**. I read *"⛔ blocked"* from
the **plan's** coverage table instead of from the report. This is the same failure mode as TC-14T-011 (08-27) and
suite 14S (08-27).

**Read verdicts from `test-reports/`, never from plan prose or a plan's coverage table.** The 14U plan table now
carries an explicit warning to that effect. The re-run was not wasted — it produced the finding that the audit store
is readable — but it added no coverage, and I should have known that before starting.

## ⚠️ A second trap, this one in our own tooling

The re-sweep report first shipped with a summary table whose first column read `TC-12 ×5`. The coverage parser reads
a leading `TC-…` table cell as a case verdict, and the phrase *"blocked now by a different constraint"* two cells
later supplied the token — so a **phantom case** was registered and the blocked count moved 54 → 55. Caught by
re-running the script and reading the provenance line rather than trusting the total.

🔑 **Two rules for any report that verdicts nothing:** keep case ids out of the first column of a summary table, and
keep them out of the `**Cases:**` line. The provenance line should read **`NO DATA`** for such a report. Always
re-run the script after adding a report and check the provenance line, not just the headline number.

## Afternoon (existing-items) session — additional questions

12. **Not-Valid investigation lands in "Investigation Complete."** Should a case rejected at validation have a
    distinct closed/not-valid state rather than reading as an investigation that completed? Also banner typo
    "INVESTICATION COMPLETE".
13. **Link-to-Existing-NPO has no identity verification** and discloses authorized-person contact details (incl. a
    government email) to any authenticated requester by NPO number. Was a security-questions step intended?
    (#101830/101831/101832). Bug filed with no real identifiers.
