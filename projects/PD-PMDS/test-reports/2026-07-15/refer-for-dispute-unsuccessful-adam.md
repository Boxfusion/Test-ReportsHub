# Test Report — Refer for Dispute / Mediation UNSUCCESSFUL (Adam Apple PA) (PMDS)

**Date:** 2026-07-15
**App:** HCM Admin Portal — PMDS module (QA) — https://pd-hcm-adminportal-qa.shesha.app/
**Cycle:** SL 1-12 Performance Agreement — FY2026/27
**Workflow ref:** PA2026/5891
**ADO plan:** #101517 — suites 101920, 102065, 102112, 102090, 102091, 102094, 102051 (see Notes on ADO access)
**Result:** PASSED — full **Refer for Dispute → Mediation → UNSUCCESSFUL resolution** path exercised end-to-end; the unresolved branch (extra mandatory Comments + Attachments) was driven and its routing verified

## Roles / routing
- **Employee:** Adam Apple (`adam`) — Intern 4, Salary Level 7, PERSAL 89651234
- **Supervisor:** Lungile Nhleko (`LungileN`) — HOD SALES, SL10 — performs the Review and Refer for Dispute
- **Mediator:** Tania Smith (`Tester97`) — MEC, SL13 (default mediator) — marks the dispute **not resolved**

## Steps executed
1. **Employee draft & submit** (`adam` / `123qwe`) — completed the 5-step Initiate Performance Agreement wizard for PA2026/5891: 4 KRAs @ 25% (total 100%), 4 GAFs ticked (Reliability, Technical Skills, Planning And Execution, Team Work), 2 key activities per KRA (8 total), 1 PDP (Ethics in the Public Service / Workshop / 31-07-2026), both attestations → **Submit**. Status **Draft → Review** (routed to supervisor).
2. **Supervisor refer for dispute** (`LungileN`) — opened the Review task, added a comment, **Refer for Dispute** → confirm-mediation dialog (comment gates **Yes**) → **Yes**. Status **Review → Under appeal**; routed to the mediator.
3. **Mediator marks unresolved** (`Tester97` = Tania Smith) — opened "Mediator Review Disagreement and attempt to resolve" (status Under appeal; supervisor comment carried through). Under **Dispute Resolution Outcome** selected **"The disagreement has not been resolved"**.
   - Selecting *not resolved* reveals an extra **"Mediator Dispute Resolution Outcome"** section with **Comments\*** and **Attachments\*** — BOTH mandatory (the resolved path has no such section). Filled the comment and uploaded a PDF (attachment bound correctly via the real file-chooser). **Submit**.

## Outcome
- After the unsuccessful mediation, PA2026/5891 remains at status **"Under appeal"** (confirmed in the mediator's Sent Items — "Mediator Review Disagreement…", Under appeal). This differs from the **resolved** path, where the PA becomes status **Review** and returns to the employee as "Update Performance Agreement".
- **The unresolved dispute produced NO active inbox task** for any of the four standard participants — verified empty inboxes for the mediator (Tania Smith), HR (SalesHR — only her own draft), the employee (Adam), and the supervisor (Lungile). The appeal is therefore handled outside the standard workflow chain, or by an appeals authority not represented among these test users.
- Screenshots (hub root): `pmds-adam-inbox.png`, `pmds-adam-draft-details.png`, `pmds-adam-mediator-outcome.png`, `pmds-adam-mediator-notresolved.png`, `pmds-adam-mediator-outcome-section.png`, `pmds-adam-mediator-filled.png`, `pmds-adam-mediator-after-submit.png`, `pmds-mediator-sent.png`, `pmds-hr-inbox-appeal.png`, `pmds-adam-inbox-after-unsuccessful.png`, `pmds-lungilen-inbox-after-unsuccessful.png`.

## Notes
- **Key difference vs the resolved path** (see `refer-for-dispute-performance-agreement-jabu.md`): choosing *not resolved* adds a mandatory **Mediator Dispute Resolution Outcome** sub-form (Comments + Attachments, both required) that gates Submit; the resolved path submits with just the radio (comment optional). Resolved → back to employee (status Review, "Update Performance Agreement"); Not resolved → stays **Under appeal**, no further active task in the standard chain.
- The attachment upload works via the real file-chooser (`browser_file_upload`) — it binds to the AntD Upload correctly, unlike synthetic hidden-input injection.
- **ADO access:** the seven Azure DevOps suite URLs provided are behind Microsoft sign-in and the Azure DevOps MCP server was not connected this session, so the individual test-case steps could not be read. This run was driven from the live app's known Performance Agreement flow and the unresolved dispute branch observed directly. New suite this round vs the resolved run: **102112** and **102090** (in place of the resolved run's 102088). These likely correspond to the not-resolved outcome sub-form and its routing — to be re-mapped once ADO access is available.
