# Bug: "Close" button on Job Posting workflow-action screens inconsistently fails to navigate back to Inbox

**Date logged:** 2026-08-04 (Authoriser role); extended 2026-08-05 (confirmed on Advertiser role too)
**Logged by:** QA (automated run)
**Plans:**
- test-plans/AdminPortal/verify-close-button-authoriser.md (ADO #103649, Authoriser role, user Mphoh)
- test-plans/AdminPortal/verify-close-button-advertiser.md (ADO #104252, Advertiser role, user Moshadih)
**Failing TC / step:** TC-05, final step (`CLICK the Close button`) in both plans
**Severity:** Medium — no data loss or corruption, but the documented navigation is unreliable across at least two roles, sometimes forcing the user to navigate back manually
**Environment:** QA — https://pd-recruitment-adminportal-qa.shesha.app/
**Users:** Mphoh (Job Authoriser role), Moshadih / "Moshadi Houvet" (Job Advertiser role)

## Expected
Per ADO test cases #103649 and #104252: clicking the **Close** button on a Job Posting's workflow-action details view (Authorise or Advertise stage) should close the details view and navigate back to the Incoming Items (Inbox) page.

## Actual
Behaviour is **inconsistent across runs on the Authoriser role**, and **consistently failing so far on the Advertiser role**:

### Authoriser role (Mphoh, ADO #103649) — job Ref No 5475686 ("box")
- **Runs 1-2** (short waits, ~2-5s after the click): stayed on the same job-details URL/page both times. No confirmation modal appeared; a hard reload of the same record confirmed no data was mutated (Closing Date still `04/08/2026` — a transient blank "Select date" render was seen once right after Close but disappeared on reload, a client-side hydration quirk rather than a real data change).
- **Run 3** (waited a full 3 minutes after the click, per QA guidance that the system might be auto-refreshing): still on the same job-details page/URL after 3 minutes. Same in a follow-up standalone debug script that also waited 3 minutes.
- **Run 4** (same 3-minute wait, different spec invocation): this time the browser HAD navigated to the Incoming Items (Inbox) page by the time the assertion ran — confirmed via the test's failure screenshot, which shows the Inbox list (10 rows, "1-10 of 41 items"). The initial assertion for this run was written to check for zero occurrences of the phrase "Authorise Job Posting" anywhere on the page — which is the wrong check, since that exact phrase is also the "Action Required" column value for every Inbox row, so successfully landing on the Inbox produces MORE matches (10), not zero. Assertion corrected to check for the Inbox's own "Incoming Items" heading instead.
- **Run 5** (re-run with the corrected "Incoming Items" assertion, same 3-minute wait): back to staying on the job-details page — did NOT navigate within 3 minutes.
- **Run 6** (identical re-run, same 3-minute wait, no code changes): stayed on the job-details page again.

Net for the Authoriser role: across 6 runs with waits ranging from ~2s to 3 minutes, the Close button navigated away successfully in only 1 of 6 attempts, and even that one success's timing within the 3-minute window is unknown (not instrumented for exact timing).

### Advertiser role (Moshadih, ADO #104252) — job Ref No "2TestingJobSummaryData"
- A quick live check with a 10s wait: no navigation.
- **Run 1** (full 3-minute wait, matching the Authoriser investigation's approach): did NOT navigate — stayed on the job-details page.
- **Run 2** (identical re-run, same 3-minute wait): did NOT navigate again.

Net for the Advertiser role: 0 of 2 attempts succeeded so far (smaller sample than the Authoriser role, but consistent with the same failure mode).

## Repro
1. Log in as either `Mphoh / 123qwe` (Authoriser) or `Moshadih / 123qwe` (Advertiser) at https://pd-recruitment-adminportal-qa.shesha.app/.
2. Expand the Workflows menu → Inbox.
3. Open any row whose Action Required is "Authorise Job Posting" (Authoriser) or "Advertise Job Posting" (Advertiser).
4. Confirm the workflow-action buttons are shown (Close/View in PDF, plus Do Not Authorise/Authorise for the Authoriser role).
5. Click **Close**.
6. Observe: navigation back to the Incoming Items list is unreliable — for the Authoriser it sometimes happens (timing unclear, up to 3 minutes observed) and sometimes doesn't within 3 minutes; for the Advertiser it has not been observed to happen within 3 minutes across 2 attempts.

## Suspected cause
Since this reproduces (with different success rates) across two distinct workflow-action pages built on what is very likely the same shared "Close" component/handler, this points to a common root cause in that shared component rather than something specific to either the Authorise or Advertise stage's form definition. Possibilities: a race condition in the navigation call, a dependency on some external/session state (e.g. a stale todo/session token) that resolves unpredictably, or a silently-failing async step (e.g. a debounced save) that's supposed to precede the navigation.

## Recommendation
Engineering to investigate the shared Close-button handler used across workflow-action detail views (confirmed affected: Authorise Job Posting, Advertise Job Posting — worth checking Do Not Authorise's dialog-level Close too, though that one was confirmed reliable in ADO #103712/#108069's testing, so the bug is likely specific to the page-level Close rather than every Close button in the app). If Close is meant to be instant, the handler likely has a race condition or silently-failing async step that should complete synchronously (or with explicit loading feedback) instead of leaving the user on an apparently-frozen details page for an indeterminate amount of time. Until fixed, users may need to use the sidebar to return to their Inbox after viewing a job's details, since the Close button's own navigation cannot be relied on within a reasonable time.

## Next steps for a future test run
- Instrument the exact elapsed time between the Close click and the navigation actually occurring (e.g. poll every 5-10s instead of one large wait) to characterise the real distribution, rather than a single pass/fail at the 3-minute mark.
- Run more Advertiser-role attempts to build a comparable sample size to the Authoriser role's 6 runs.
- Try reproducing manually (non-automated) to rule out anything specific to headless/headed Chromium timing.
