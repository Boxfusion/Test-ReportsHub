# Test Report — Refer for Dispute / Mediation (Jabu Hadebe PA) (PMDS)

**Date:** 2026-07-15
**App:** HCM Admin Portal — PMDS module (QA) — https://pd-hcm-adminportal-qa.shesha.app/
**Cycle:** SL 1-12 Performance Agreement — FY2026/27
**Workflow ref:** PA2026/5905
**ADO plan:** #101517 — suites 101920, 102051, 102065, 102088, 102091, 102094 (see Notes on ADO access)
**Result:** PASSED — full **Refer for Dispute → Mediation → resolution** path exercised end-to-end across 3 roles

## Roles / routing
- **Employee:** Jabu Hadebe (`JabuH`) — Intern 2, Salary Level 5, PERSAL 35789564
- **Supervisor:** Lungile Nhleko (`LungileN`) — HOD SALES, Salary Level 10 — performs the Review and the Refer for Dispute
- **Mediator:** Tania Smith (`Tester97`) — MEC, Salary Level 13 (default mediator, auto-defaulted) — resolves the dispute

## Steps executed
1. **Employee draft & submit** (`JabuH` / `123qwe`) — completed the 5-step Initiate Performance Agreement wizard for PA2026/5905:
   - Confirm Details (default supervisor Lungile Nhleko, default mediator Tania Smith — no alternates needed).
   - Scoring: 4 KRAs @ 25% each (**total 100%**), each with a Batho Pele Principle (Service Standards / Access / Courtesy / Information); 4 GAFs ticked "Development Required" (Initiative, Flexibility, Planning And Execution, Technical Skills).
   - Workplan Agreement: 2 key activities per KRA (8 total), each with Target / Timeframe / Target Date / Resource Required / Enabling Condition / Source of Evidence.
   - PDP: 1 development area (Basic Project Management for the Public Service, Formal Course, commencement 31/07/2026).
   - Completed Summary: both attestation checkboxes ticked → **Submit**. Status **Draft → Review** (routed to supervisor); JabuH's inbox cleared.
2. **Supervisor refer for dispute** (`LungileN` / `123qwe`) — opened the "Review Performance Agreement" task, added a review comment (KRA weightings/targets not aligned to operational plan; no agreement reached) and saved it, then clicked **Refer for Dispute** (instead of Sign).
   - A confirmation dialog appeared: *"Are you sure you wish to refer this Performance Agreement for Mediation?"* with a Comments box; the **Yes** button is gated by a comment. Entered a dispute reason → **Yes**.
   - Status **Review → Under appeal**; item routed to the mediator; Lungile's inbox cleared.
3. **Mediator resolution** (`Tester97` / `123qwe` = Tania Smith) — inbox showed PA2026/5905, Action "Mediator Review Disagreement", status **Under appeal**. Opened the task ("Mediator Review Disagreement and attempt to resolve"). The supervisor's dispute comment carried through in the Comments thread.
   - Dispute Resolution Outcome offers two radios: **"The disagreement has been resolved"** / "The disagreement has not been resolved". Selected **resolved**, added a mediation note, saved it, then **Submit**.
   - Mediator's inbox cleared.

## Outcome
- After the mediator selected **"disagreement resolved"**, PA2026/5905 routed **back to the employee (Jabu Hadebe)** with Action Required **"Update Performance Agreement"**, status **Review** — the employee amends and re-submits, re-entering the review/sign path.
- Full dispute loop proven: employee Submit (Review) → supervisor **Refer for Dispute** (Under appeal) → mediator **resolve** → employee **Update Performance Agreement** (Review).
- Screenshots (hub root): `pmds-jabuh-draft.png`, `pmds-jabuh-scoring.png`, `pmds-jabuh-workplan-done.png`, `pmds-jabuh-pdp-filled.png`, `pmds-jabuh-attest.png`, `pmds-jabuh-after-submit.png`, `pmds-lungilen-review-jabu.png`, `pmds-refer-dispute-result.png`, `pmds-lungilen-after-refer.png`, `pmds-mediator-inbox.png`, `pmds-mediator-screen.png`, `pmds-mediator-outcome.png`, `pmds-mediator-resolved.png`, `pmds-mediator-after-submit.png`, `pmds-jabuh-post-resolution.png`.

## Notes
- Review screen actions: Close / Send back / **Refer for Dispute** (invokes the mediator) / View In PDF / Sign. Refer for Dispute pops a confirm-mediation dialog; the confirm (**Yes**) requires a comment.
- Mediator screen actions: Close / Send back / View in PDF / **Submit** (gated by selecting a Dispute Resolution Outcome radio).
- The Comments thread persists across all stages (employee → supervisor → mediator), giving a continuous audit trail of the dispute.
- **ADO access:** the six Azure DevOps suite URLs provided are behind Microsoft sign-in and the Azure DevOps MCP server was not connected this session, so the individual test-case steps could not be read. This run was driven from the live app's known Performance Agreement flow and the dispute branch was observed directly. Suites should be re-mapped against these steps once ADO access is available.
