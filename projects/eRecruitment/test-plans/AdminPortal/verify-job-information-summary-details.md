# Test Plan: ADMINPORTAL-102865 — Verify Job Information Summary details

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-04
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Mphoh / 123qwe (Job Authoriser — different role from kamogelos, the Job Capturer used by the other AdminPortal specs) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #102865 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#102865](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/102865) — Verify Job Information Summary details |

## Objective
> Validate that a Job Authoriser, opening any Job Posting awaiting their "Authorise Job Posting" action from their Inbox, sees the Job Information Summary tab populated with the correct Job Reference Number, Province/Branch, Salary Range, Centre/Office Name, and Closing Date.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Authoriser credentials are valid (Mphoh / 123qwe)
- [ ] At least one item with Action Required "Authorise Job Posting" exists in the Inbox (confirmed live 2026-08-04: 41 such items present, seeded/accumulated from prior job postings — this is shared QA data under concurrent modification by other testers, so the spec opens whichever item is first in the unfiltered Inbox at run time rather than a hardcoded Ref No)

## Test Cases

### TC-01 — Login as Mphoh

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #102865 step 3)

- **Steps:**
  1. CLICK the Workflows sidebar icon
- **Expected result:** The submenus should be displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #102865 step 4)

- **Steps:**
  1. CLICK the Inbox submenu item
- **Expected result:** Inbox page is displayed with the Export button and Incoming Items index table
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button is visible
  - [x] ASSERT (BLOCKING) Incoming Items table headers (Ref No, Type, Action Required, etc.) are visible

---

### TC-04 — Open any Job with Authorize Job as action required (ADO #102865 step 5)

- **Steps:**
  1. CLICK the magnifying-glass icon on the first row whose Action Required is "Authorise Job Posting"
- **Expected result:** The Job should open in details view
- **Assertions:**
  - [x] ASSERT (BLOCKING) the details view (with a "Job Information Summary" tab) is displayed

---

### TC-05 — Click on Job Information Summary tab (ADO #102865 step 6)

- **Steps:**
  1. CLICK the "Job Information Summary" tab
- **Expected result:** Job information summary details should be displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Job Reference Number field is visible on the tab

---

### TC-06 — Check that Job Reference Number field is populated (ADO #102865 step 7)

- **Expected result:** Field shows the correct Ref Number
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Reference Number field is non-empty

---

### TC-07 — Check that Province/Branch field is populated (ADO #102865 step 8)

- **Expected result:** Field shows the correct branch
- **Assertions:**
  - [x] ASSERT (BLOCKING) Province / Branch field is non-empty

---

### TC-08 — Check that Salary Range field is populated (ADO #102865 step 9)

- **Expected result:** Field shows the correct Salary Range
- **Assertions:**
  - [x] ASSERT (BLOCKING) Salary Range is populated in the "R<amount> - R<amount>" shape

---

### TC-09 — Check that Centre/Office Name field is populated (ADO #102865 step 10)

- **Expected result:** Field shows the correct Centre/Office Name
- **Assertions:**
  - [x] ASSERT (BLOCKING) Centre / Office Name field is non-empty

---

### TC-10 — Check that Closing Date field is populated (ADO #102865 step 11)

- **Expected result:** Field shows the correct closing date
- **Assertions:**
  - [x] ASSERT (BLOCKING) Closing Date field is non-empty and formatted as a date (DD/MM/YYYY)

---

## Teardown
- No teardown required. This spec is read-only — it only opens and inspects an existing Inbox item, and never clicks "Authorise" or "Do Not Authorise", so it does not mutate the shared QA workflow state.
