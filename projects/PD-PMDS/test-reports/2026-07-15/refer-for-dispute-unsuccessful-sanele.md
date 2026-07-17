# Test Report — Refer for Dispute / Mediation UNSUCCESSFUL (Sanele Sithole PA) (PMDS)

- **Date:** 2026-07-15
- **App:** HCM Admin Portal — PMDS module (QA) — https://pd-hcm-adminportal-qa.shesha.app/
- **Cycle:** SL 1-12 Performance Agreement — FY2026/27
- **Workflow ref:** PA2026/5945
- **ADO plan:** #101517 — suites 101920, 102065, 102112, 102115 (see Notes on ADO access)
- **Result:** ✅ PASS — full **Refer for Dispute → Mediation → UNSUCCESSFUL** path exercised for the last remaining created employee; dispute remains unsuccessful ("Under appeal"), reproducing the Adam Apple result

## Roles / routing
- **Employee:** Sanele Sithole (`SaneleS`) — Intern 5, Salary Level 7
- **Supervisor:** Lungile Nhleko (`LungileN`) — HOD SALES, SL10 — Review + Refer for Dispute
- **Mediator:** Tania Smith (`Tester97`) — MEC, SL13 — marks the dispute **not resolved**

## Steps executed
1. **Employee draft & submit** (`SaneleS` / `123qwe`) — completed the 5-step Initiate Performance Agreement wizard for PA2026/5945: 4 KRAs @ 25% (total 100%); 4 GAFs ticked (Team Work, Management Of Financial Resources, Technical Skills, Planning And Execution); 2 key activities per KRA (8 total); 1 PDP (Financial Management Delegations of Authority / On the job training / 31-07-2026); both attestations → **Submit**. Status **Draft → Review** (routed to supervisor).
2. **Supervisor refer for dispute** (`LungileN`) — Review task → comment → **Refer for Dispute** → confirm-mediation dialog (comment gates **Yes**) → **Yes**. Status **Review → Under appeal**; routed to the mediator.
3. **Mediator marks unresolved** (`Tester97` = Tania Smith) — opened "Mediator Review Disagreement and attempt to resolve" (Under appeal). Selected **"The disagreement has not been resolved"** → the extra mandatory **Mediator Dispute Resolution Outcome** sub-form (Comments\* + Attachments\*) appeared; filled the comment and uploaded a PDF → **Submit**.

## Outcome
- PA2026/5945 remains at status **"Under appeal"** (confirmed in the mediator's Sent Items). The dispute **remains unsuccessful** as requested.
- **No downstream active task** was produced by the unsuccessful mediation — the mediator's inbox is empty after Submit (verified). This reproduces the Adam Apple unsuccessful run exactly: an unresolved dispute parks at "Under appeal" with no further task in the standard participant chain (mediator / HR / employee / supervisor), i.e. the appeal is handled outside the standard workflow.
- Screenshots (hub root): `pmds-sanele-inbox.png`, `pmds-sanele-draft-details.png`, `pmds-sanele-mediator-sent.png`.

## Notes
- This is the **last of the created employees** taken through the dispute path. Full set for 2026-07-15: Jabu Hadebe (resolved → back to employee, "Update Performance Agreement"/Review), Adam Apple (unsuccessful → "Under appeal"), Sanele Sithole (unsuccessful → "Under appeal", this report). Simmy Mthalane was the happy-path Sign+Verify run.
- **Correction during the run:** initially logged in as `SalesHR` by mistake — that account is the HR-role user (does the HR *Verify* step), not a created test employee. The user flagged it; switched to `SaneleS`.
- **ADO access:** the four Azure DevOps suite URLs are behind Microsoft sign-in and the Azure DevOps MCP server was not connected, so the individual test-case steps could not be read. Driven from the live app's known flow. New suite this round: **102115** (vs the Adam run's 102090) — expected to cover the not-resolved outcome/appeal step; to be re-mapped once ADO access is available. Behaviourally, no extra in-app step was observed beyond the mediator's not-resolved submission.
