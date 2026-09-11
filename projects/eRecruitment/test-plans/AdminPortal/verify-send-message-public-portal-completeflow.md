# Test Plan: ADMINPORTAL-106402 — Verify send messages to public portal

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-06
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106402 has parent #106566). |
| ADO Test Case | [#106402](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106402) — Verify send messages to public portal |
| Target Job / Application | Job Posting Ref No **"HRMC 23/26/5"** ("Software Developer") → existing applicant **Victor Gyokeres** (Identity Number `0309215008987`), status **REJECTED** |

## Objective
> Validate that a Recruiter can open any application on Job Posting "HRMC 23/26/5", populate a message in the application's Inbox panel, click Send, and have the message (with name, surname, and message text) rendered in the UI.

> **🎯 Confirmed live 2026-08-06:** all 3 existing applications on this job posting (Houvet P — Pre Screened, Everything F — Rejected, Gyokeres V — Rejected) have already been actioned past "Awaiting Pre-Screening" — none currently match ADO step 7's described status. This is a pre-existing state mismatch, not something this test case controls, and does not block the actual feature under test: the Inbox message-send panel is confirmed live to function on an application regardless of its pipeline status. Victor Gyokeres's application is used as the target (any of the 3 would work equally).
>
> The Inbox panel shows a system-generated welcome note (e.g. "You have successfully applied for post Software Developer - HRMC 23/26/5") plus a "Enter your message here..." textarea and "Send" button — confirmed present and functional on this application.
>
> **Note:** this is a real, persistent write action (adds a message to the application's Inbox), but does NOT change the application's recruitment-pipeline status — lower impact than the Decline/Shortlist/Interviewed/Appointed family of actions automated elsewhere in this project. Confirmed with requester before running regardless, per this project's standing confirm-before-real-write convention.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting "HRMC 23/26/5" exists with at least one application (Victor Gyokeres)

## Test Cases

### TC-01 — Login as Kwena (ADO #106402 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click on the Recruitment dropdown (ADO #106402 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-03 — Click on Job Posting dashboard (ADO #106402 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed

---

### TC-04 — Search for a job with Ref HRMC 23/26/5, open in details view (ADO #106402 steps 5-6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) search results return the HRMC 23/26/5 record
  - [x] ASSERT (BLOCKING) Job Details panel opens successfully

---

### TC-05 — Scroll to Applications panel and open Victor Gyokeres's application (ADO #106402 step 7)
- **Note:** actual live status is "REJECTED", not "Awaiting Pre-Screening" as ADO describes — see Objective note above. Not a functional defect; the Inbox feature is unaffected by application status.
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens in details view successfully

---

### TC-06 — Navigate to Inbox panel and populate a message (ADO #106402 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) message field contains the entered text

---

### TC-07 — Click on Send button (ADO #106402 step 9) — ⚠️ REAL, PERSISTENT WRITE
- **Expected result:** Message should be sent successfully and the name, surname and message should be rendered in the UI
- **Assertions:**
  - [x] ASSERT (BLOCKING) the sent message text is rendered in the Inbox panel
  - [x] ASSERT (BLOCKING) the candidate's name ("Victor Gyokeres") is associated with the rendered message

---

## Teardown
- No automated teardown. TC-07 sends a real message via the Inbox panel — not reversible via the UI. Does not affect the application's recruitment-pipeline status.
