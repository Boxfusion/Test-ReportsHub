# 2026-08-27 — notes and questions for the test lead (DSD-NPO)

Observations from today's run. Nothing here is a raised defect — the defects from this session are in
`test-reports/bugs/2026-08-27-*`.

## Questions for Thabiso

1. **Why is `UserTaskSave` authorised for one workflow task and refused for another, on the same account?**
   Today the change-request decision (`Activity_1jo5xu9` "Review Change request Submission") completed normally on
   `mpenduloizwelinuk@gmail.com` and moved the record to Completed with a letter. The annual-compliance Quality
   Assure decision (`Activity_0gtemvi`) returns **403 "You are not authorized to perform this action"** on the same
   account, minutes apart. This narrows the 08-26 conclusion considerably — it is a **per-task** authorisation
   problem, not "no account can complete a workflow decision".

2. **Where is the Quality Assure form's outcome meant to come from?** Its `UserTaskSave` body carries neither the
   `reportMatches` Yes/No answer nor either decision uid, although the client fetches `Approved` /
   `Declined` uids from `GetUserDecisions` immediately beforehand. Approve and Decline post the same shape. Even with
   the 403 lifted, nothing in the request says which way the decision went.

3. **Is one submit supposed to create 15 todo items?** Submitting `POST1424` created **15** identical
   `WorkflowTodoItem` rows for the same task, all stamped at the same millisecond. The 08-26 session saw 20 on one
   annual-compliance submission. If this is per-recipient fan-out it is expected; if not, it is the likely reason the
   register holds ~80 000 todo items, and it makes the (already empty) Workflows inbox unusable even if it were
   fixed.

4. **Is `changesApproved` or `changeRequestStatus` the field of record for a change-request outcome?** After a
   successful approval they disagree: `changeRequestStatus = 4` (APPROVED) but `changesApproved = false`. Reports
   built on the boolean will contradict reports built on the status.

5. **Who should receive the change-request outcome email?** Ours went to the NPO's contact address and an office
   bearer, **not** to the account that submitted the request. ADO #101771 says *"user gets notification with
   outcome"* without saying which user, so I have recorded it rather than judged it.

6. **Is `submissionDate` meant to be stamped at creation?** `POST1424` still reads `2026-08-21` after being submitted
   on `2026-08-27`. Any deadline measured from `submissionDate` is therefore measured from when the draft was
   created. This matters directly for the appeals 30-day window (11P TC-01) and the deregistration 30-day clock.

## Smaller things, recorded not raised

- **The Change Requests grid's quick-search does not filter.** Typing a ref number leaves all 90 rows and the pager
  unchanged, and typing again **appends** to the previous text rather than replacing it. I have not confirmed that
  control is intended as a search, so it is not raised.
- **`SUBMITED`** (one T) on the change-request detail status chip.
- **`Organistions`** (sic) in the public-portal user menu — the NPO switcher.
- **`Compliane`** (sic) in the annual-compliance QA success toast — noted 08-26, still present.
- The XSS-named NPO from suite 03 (`<script>alert(1)</script>QA XSS NPO`) renders as **inert text** in the
  organisation switcher. That is correct behaviour and consistent with the suite 03 close-out.
- `WorkflowTask/Crud/GetAll` returns **500** unfiltered — `No row with the given identifier exists
  [WorkflowInstance#723b40a3-…]`, i.e. at least one workflow task points at a deleted workflow instance. Selecting
  explicit properties avoids the dereference and the call succeeds. Data-integrity noise rather than a user-facing
  defect, but it means the task list cannot be read without a workaround.

## Coverage bookkeeping

`coverage-baseline.js` had been **over-counting by 3**. Three suite-14T cases were counted twice because the 08-24
report's verdict table cites the ADO **work-item** number (`#101839`) while the 08-25 close-out used per-case
headings carrying the **case id** (`TC-14T-012`) — the two hashed to different keys. The script now builds an alias
map from the plans and canonicalises before de-duplicating.

**Corrected figure: 203 / 314 = 64.6 %** (was published as 206 / 314 = 65.6 %). Per
[[report-the-conservative-coverage-number]] the lower figure is the one to quote. The fix also repaired the
per-suite attribution — suite 14T now reads 22 verdicted instead of 4, suite 06 and 13 appear correctly, and the
bogus "suite local" bucket of 28 is gone.

## ⚠️ Correction — TC-14T-011 was NOT blocked, and I mis-scoped it

Earlier today I recorded TC-14T-011 as *"newly unblocked, not yet run"*. **Wrong.** It has been **✅ PASS since
2026-08-24**; only its *UI Correspondence cross-check* was left BLOCKED on 08-25. My gap analysis picked the word
`BLOCKED` out of the **plan heading** rather than out of a report — which is also why the alias-fixed coverage script
already showed suite 14T at 22 verdicted / 0 excluded.

I re-ran it anyway and it was worth doing, but **it adds no coverage**:
- the case is now re-verified on a **second change type** (*General Change*, vs the 08-24 Foundational Change) and on
  a record we submitted ourselves — the merge fields resolve correctly for both;
- **the 08-25 BLOCKED sub-assertion is now CLOSED, not carried forward.** `change-request-details` has **never** had
  a Correspondence / notification-audit / Re-Send section — zero occurrences across all 24 versions of the form
  markup, v25 being LIVE. So the plan's 🔑 note claiming that section exists is wrong and is corrected in the plan.
  ADO #101838 never asked for it, so the verdict is unaffected.

Report: `2026-08-27/14t-notification-templates-functional--change-request-acknowledgement.md`.

## Genuinely still open

- **TC-10-005** (cancel an *assigned* request) — still deferred. Ours went from submitted straight to Completed, so
  no "assigned" state was ever reachable.
- **TC-14T-012** (CR Approved + conditional documents) — best next 14T target: today's run produced
  `ApprovalLetter.pdf` and an `Email Approved Change Request` on a change type we control.

## Observation — one dispatch, two enquiry addresses
The change-request acknowledgement gives the applicant **`NPOEnquiry@socdev.gov.za`** in the covering email footer
and **`npoenquiry@dsd.gov.za`** in the attached PDF. Outside TC-14T-011's prescribed field list so not raised, but
this suite is about template content and the applicant is told two different places to write to.

---

# Second sitting, 2026-08-27 — the five remaining runnable functional cases

Ran the cases the gap analysis identified as genuinely runnable black-box: **TC-01-011/012, TC-02-008, TC-04-019,
TC-14W-006/007, TC-07-020**. Reports are under `2026-08-27/`. Coverage moves **205 → 210 of 314 (66.9%)**.

## Questions for the test lead

### 1. Four suite-01 cases appear to be written against a different design
TC-01-010 (08-18), **TC-01-011**, **TC-01-012** and TC-01-013/014 all assume an SA ID captured at *account creation*.
There is no ID field anywhere in the sign-up journey — proven from the **form definitions**, not just the rendered
screens: `signUp-public-portal` and `dsd-public-portal-send-otp` declare six data properties between them
(`mobileNumber`, `firstName`, `lastName`, `emailAddress`, `password`, `passwordConfirmation`) and **zero** ID-number
properties. The build captures identity at **office-bearer** level instead.

**These read as cases needing a rewrite, not as defects.** Should they be retargeted at the office-bearer dialog, or
withdrawn? That is your call — I have recorded them *not executable — case does not match the build* rather than
failing them.

### 2. How widely are the low-privilege internal roles assigned in production?
Account D holds **`Dsd.Npo.Registry Clerk` and nothing else** and reads the entire applications register
(10 349 records, incl. `Email Address` and `Whatsapp Number`) by direct URL, with no 403. That role showed **6**
holders on 08-26. If low-privilege roles are handed out freely in production this is a live data-exposure issue, not
a QA curiosity. Filed as 🔴 High.

This also means the **11A TC-06 wording should be widened**: it is not only the tribunal forms that lack route
authorisation. Route auth demonstrably *works* elsewhere (Account C gets a clean 403 on `user-management-table`), so
it is a per-page omission across CRUDS.

### 3. Should a public applicant ever land on a Shesha workflow inbox?
Signing in with no linked NPO drops the user on `Shesha.Workflow/workflows-inbox` — an empty framework grid with an
`Export` button — instead of the purpose-built empty-state page, which exists, is correct, and carries both CTAs
(`no-existing-npo-landing-page` v7). Possibly the same root cause as the standing **"every Workflows inbox renders
empty"** question: if unlinked users default to the framework inbox, is the DSD landing route configured as the
post-login destination at all?

### 4. Is `Additional Documents File` meant to accept only one file?
The upload trigger disappears after the first attachment, on a tab whose own note says *"Please download/Upload all
required documents"*.

## Observations

### The only reason sign-up is testable is a live security defect
SMS delivery on QA is dead (credit), so the OTP has to be read from
`npoOtpStressTesting/GetOtpByEmailAddressOrPhoneNumber` — which **answers anonymous callers**. That is already filed
(`bugs/2026-08-18-api-reachable-without-authentication.md`). Worth flagging the dependency: **if that endpoint is
fixed before SMS credit is restored, suites 01 and 15D become untestable.** No pin values are ever recorded, and all
test numbers use unallocated `09x` prefixes so nothing can reach a real subscriber.

### ⚠️ Retraction — my "address autocomplete renders no suggestions" note was a harness error (again)
I searched for Google's **`.pac-container`**, found none, and concluded the address autocomplete was dead and that
`Province` / `District Municipality` / `Metropolitan Municipality` / `Area Code` could never be populated on QA.
**That is wrong, and it repeats a mistake already retired on 2026-08-20** — this app does not use Google's suggestion
container, it renders its **own `div.suggestion`** list, which is recorded in `projects/DSD-NPO/CLAUDE.md`. I never
checked `div.suggestion`, so I have **no evidence either way** about whether suggestions render. The geo fields
stayed empty in my run simply because I typed a raw address and never picked a suggestion.

**Nothing should be concluded from today's run about the address resolver or the geography fields.** The genuine,
already-filed finding in this area is `bugs/2026-08-20-registration-address-latlong-not-populated.md` (lat/long never
populated, display-only, no manual fallback) — untouched by anything I did.

One thing I did observe, separate and unproven: the console carries *"You have included the Google Maps JavaScript
API multiple times on this page. This may cause unexpected errors."* on wizard tab 2. That is a real console error,
but I have **not** shown it causes any user-visible defect, so it is a question, not a finding.

### ⚠️ Not a new finding — `Area of operations → National (SA)` is already filed
`Next` on wizard tab 2 was disabled with all nine starred fields satisfied and no error anywhere; the cause was the
unstarred **National (SA)** field. This is **already** instance 1 of three in
`bugs/2026-08-20-unstarred-mandatory-fields-silently-gate-next-and-save.md` — same field, same behaviour, filed a
week earlier. I drafted a duplicate bug and deleted it; a re-confirmation note is appended to the 08-20 bug instead.

Worth stating plainly, because it is the useful part: it cost ~15 minutes today on a fresh application, which is an
independent re-confirmation of that bug's central claim — **the pattern is what makes this build expensive to test,
not any single field.**

### A 403 on admin sign-in shows the user nothing
Account B's admin-portal sign-in was rejected — `POST /api/TokenAuth/Authenticate` → **403**, visible only in the
console. The UI shows **no alert, no toast, no field error**; the user is just left on `/login`. Same
"client swallows the error" pattern as the `UserTaskSave` 403. Minor, but it is the second instance of the pattern.

### Further confirmation that the `UserTaskSave` 403 is per-task, not per-user
Advancing the registration wizard as an **ordinary applicant** (Account B) fired
`POST /api/services/SheshaWorkflow/Process/UserTaskSave` → **200**. That strengthens the 08-27 narrowing: the 403 on
annual-compliance Quality Assure is specific to that task, not a blanket "no account can complete a workflow
decision". Worth putting to the developer alongside the original 403.

### One near-miss worth recording as method
On first inspection the public-portal nav appeared to have **zero** items for an unlinked user, which would have made
TC-02-008 a hard onboarding blocker — no route to *Register NPO* at all. It was a **render-timing artefact**; after a
3-second settle the nav had four items. Re-checking before concluding is what stopped a false High going out.

## Automation notes worth keeping
- **AntD number fields accumulate.** `Office Bearer Term` took a `fill('3')` *and* a `pressSequentially('3')` and
  held `33`. Worse, `document.querySelector('input.ant-input-number-input')` resolved to a *different, hidden*
  element and read `""` while the real control held `33` — read the value back through the **spinbutton's accessible
  node**.
- **Synthetic clicks confirmed unreliable again.** A JS loop calling `.click()` four times on the date panel's
  decade-back control advanced it **once**; real clicks worked every time.
- **`localStorage.clear()` does not sign you out** of either portal — the token is not held there. An apparent
  "anonymous" probe can silently still be the shared dev account with full admin rights. Use the user-menu Logout.
- **CRUDS is a flyout** that renders no anchors until clicked. The real applications route is
  `boxfusion.dsdnpo/npoapplication`; the menu label is *"All Apllications"* (product typo). My first probe used a
  guessed `all-applications` and got a 404 — which, per the standing rule, proves nothing.

## Records created this sitting
| Record | Detail |
|---|---|
| **APPL26-01570** (`be7125b8-…` NPO, `6c02e52c-…` workflow) | Full registration submitted E2E by Account B. Status **APPLICATION IN PROGRESS**. 3 office bearers — one deliberately has **no surname** (the TC-04-019 defect specimen). |

⚠️ **Accounts A and B are no longer unlinked.** A picked up an NPO via *Invite to Organisation* during the 08-26
appeals work; B now owns APPL26-01570. A future TC-02-008 re-run needs a fresh sign-up. Both remain **unprivileged**,
so suite 14Z Class B is unaffected.

---

# Third sitting, 2026-08-27 — TC-07-008 and TC-01-022

Both were on the "not runnable" list. **Both were runnable, and for the same reason: the ⛔ reason was stale, not
true.** Coverage **210 → 212 / 314 = 67.5%**.

| Case | Was recorded as | Actually needed |
|---|---|---|
| TC-07-008 | "needs another submitted app" | an application at the OB Compliance step — **we submitted one an hour earlier** |
| TC-01-022 | "requires developer DB access" | a deletion, which is a **per-row icon in User Management**; only step 5 needs DB |

🔑 **Standing lesson: re-read the precondition before trusting a ⛔.** Two of the last seven "blocked" cases were
blocked by an assumption. Worth a sweep of the remaining 43 not-run verdicts on the same basis.

## Questions for the test lead

### 1. The 'OB Failed Compliance' resubmission email does not fire
Status machinery is correct — `applicationStatus` = **10**, `OB Compliance` disables, `Verification` unlocks. But
**nothing was written to the notification store** after the transition (validated with controls: 24 000 rows total,
108 today, latest 10:24; zero after 10:50 against a transition at ~11:05). FDS 8.4 rule 2b promises the applicant a
resubmission email. Without it, an NPO whose office bearers all failed compliance is never told to resubmit.
Related: `numOfResubmissions` stays `null` — should entering this state increment it, or only an actual resubmission?

### 2. Are the User Management deletes hard or soft?
TC-01-022's expected result says Person and User rows are *"soft-deleted"*, but the action calls
`Person/Crud/Delete` and `User/Delete` and that is not observable from the client. The answer changes whether
#107678's expected result is wrong, or whether the re-registration behaviour needs a ruling.

### 3. TC-01-022 needs its acceptance criterion authored before anything here is a defect
It is `L1-draft`; the FDS entry is *"Scope gap — no FDS clause; BA to author acceptance criterion."* So this is
recorded as observation, not defect. The substantive finding for the BA: **deleting an account frees its email and
mobile for immediate silent re-registration.** A live duplicate email *is* blocked (*"Email Address Already Exist"*),
so the guard exists — deletion just releases the address with no error and no reactivation route.

📌 Also for the BA: the blocking assertion is worded *"no `Crud/Get` with `id=null`"*. That **passes** — but the
behaviour it exists to prevent is present on three neighbouring endpoints (`npoId=undefined` → 400 ×3, all swallowed).
If the intent is "never query with an unresolved NPO id", the criterion should name `npoId=` too.

### 4. 10 349 orphaned application rows make the primary admin register unreadable
`boxfusion.dsdnpo/npoapplication` claims 10 349 items but renders **blank in 7 of 8 columns**, because every row on
the default page returns `"npo": null` and those columns project through `npo { … }`. Sorting is ignored too. This is
the main screen for triaging applications.

## ⚠️ Corrections to my own earlier reports today

### The TC-07-020 data-exposure claim was overstated — withdrawn
I wrote that a Registry Clerk can read applicant `Email Address` and `Whatsapp Number` across the register, and
called it a POPIA exposure. **Withdrawn.** Those column *values* do not render at all (`npo: null`). What survives is
the real and unchanged authorisation defect: a role-scoped non-admin gets **200, no 403**, and can see the register's
existence, total count, GUIDs, `Date Received` and an `Export` control. Corrections applied to both the report and
the bug file.

🔑 The lesson: I read column **headers** and a row count and inferred the data. Read the response body.

### A cross-account leak I nearly reported, then disproved
After re-registering, the Dashboard resolved to `npo-landing-view?id=be7125b8…` — **Account B's NPO**. That looked
like a cross-tenant leak. It was **my own browser state**: `localStorage.currentOrganisation` still held B's org id
from an earlier session. The href is clean, the app redirected to the empty state, and no other user's data was ever
displayed.

⚠️ It also **retracts a small inference from my TC-02-008 report**: I noted the `Dashboard` nav item appears only for
accounts with a linked NPO. It appeared for an account with none, driven by that stale value. Two samples, not a rule.

### The Workflows inbox is NOT empty on the admin portal
The standing question (*"every inbox we hold renders empty, so no user can find their queue"*) is **wrong as
written**. The admin inbox rendered **2 476 items**, with our APPL26-01570 at row 1, and each row exposes the
`workflow-action?id=…&todoid=…` link the standing rule requires. Re-scope the question to the **applicant** portal.
Corrected in `test-data/qa-accounts.md`.

## Observations

### An IDOR I did not file, because it is already filed
Signed in as a brand-new account with no NPO links, `NpoOrganisation/Crud/Get?id=<guid>` returns 200 with another
org's data. **Not a new bug** — the same endpoint answers a **fully anonymous** caller identically, so it is subsumed
by `bugs/2026-08-18-api-reachable-without-authentication.md`, and 14Z Class B already logged `NpoOrganisation` as
anonymously readable. Two details appended to that bug instead:
1. it affects **read-by-id**, not only `GetAll` — one known GUID is enough;
2. 🔑 the exposure is **per-endpoint, not blanket** — `Entities/GetAll?entityType=Npo.Application` correctly returns
   **401** anonymously, so there is a working reference for the guard inside the same codebase. Stop saying "the API
   is anonymously readable" without naming the endpoint.

### Small data-quality things
- `applicationRef` is stored with a **leading space**: `" APPL26-01570"`. Likely defeats exact-match search.
- The status chip renders **`OBFAILED COMPLIANCE`** — missing space between "OB" and "FAILED".
- Relative timestamps are **~2 hours ahead**: a draft created at 11:09 displayed *"Created by … 2 hours ago"*, and
  APPL26-01570 (09:56) read *"3 hours ago"* at 11:02. Looks like UTC/SAST rendering, consistently off.
- The `Office Bearer Compliance` multi-select **closes after every pick**, so selecting 3 office bearers takes 3
  reopen cycles. Minor, but it is on a form that requires multi-select by design.
- The office-bearer picker listed **`"Johannes "`** — a trailing space where the surname belongs. That is the
  empty-surname defect from TC-04-019 surfacing downstream, exactly as that bug predicted.

### Credit where due — this dialog validates properly
`Office Bearer Compliance` keeps `Submit` disabled until **both** the office-bearer selection and the reason are
supplied, in both directions. That is the behaviour missing from the forms in
`bugs/2026-08-20-unstarred-mandatory-fields-silently-gate-next-and-save.md`, so it is worth citing as the in-build
example of how it should look.

## Automation notes
- 🔑 **The bearer token IS in `localStorage`** — as **base64-encoded JSON**, not a raw JWT:
  `JSON.parse(atob(localStorage.getItem('<random key>'))).accessToken`. Scanning for `xxx.yyy.zzz` finds nothing,
  which is why an earlier attempt concluded there was no token.
- **Instrumenting `fetch`/XHR does not survive a navigation.** My first pass at the `id=null` check returned an empty
  log and looked like "no requests fired" — the hook had been wiped. Use the MCP's own network capture, which is
  independent of page JS, or re-install after every navigation.
- **A 404 on a guessed route still proves nothing** — I did it twice today. `all-applications` and
  `Shesha/user-management-table` both 404; the real routes are `boxfusion.dsdnpo/npoapplication` and
  `boxfusion.dsdnpo/user-management-table`. Read them from the flyout menus.
- The applications grid's quick-search did **not** filter, but User Management's **did** (`quickSearch=` in the
  request) — and its term **persists across a full page reload**, visibly, in the box. That produced a momentary
  "0 items found — did I delete everything?" scare; the Person count (1 834 054) confirmed nothing was lost.

## Records created / destroyed this sitting
| Record | State |
|---|---|
| **APPL26-01570** | driven to **OB Failed Compliance** (`applicationStatus` 10). Owned by Account B. |
| Account H `npo.qa.delete.h@example.org` | ⛔ **deleted** deliberately (TC-01-022 precondition) |
| Draft **APPL26-01572** (`8dd2fdde-…`) | orphaned — survives its deleted owner |
| `npo.qa.delete.h@example.org` re-registered as `NpoQaRerego IndiaTest` | live, no NPO links |

All on unallocated `09x` mobiles and RFC-2606 `example.org` addresses, so nothing can reach a real person.
