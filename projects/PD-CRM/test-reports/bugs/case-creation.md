# Bugs — Case Creation (ADO suite 112754)

**Plan:** test-plans/case-management/case-creation.md
**ADO:** Plan 112718 › PD-CRM (112719) › Case Management (112720) › Case Creation (112754), cases #112757–#112772
**Environment:** QA — https://pd-dep-adminportal-qa.shesha.app/login
**Found:** 2026-09-01, re-verified 2026-09-02
**Build:** `Boxfusion.ServiceManagement/case-add v9`, `Boxfusion.Dep/update-submitter v31`, `Boxfusion.ServiceManagement/service-requests v55`, `Boxfusion.ServiceManagement/Matching-contacts v1`

## Result against ADO

Run of 2026-09-02 — **15 of 16 passed**, one failed. (The 2026-09-01 run showed 13/16; the two extra
failures were test-selector faults, not application faults — see "Corrected from the first run" below.)

| ADO | Case | Verdict | Reason |
|---|---|---|---|
| #112757 | Verify successful case creation using valid details | ✅ PASSED | Case created, modal closed, record appears in the list. Account Number step not applicable — see BUG-101. |
| #112758 | Verify mandatory Channel validation | ✅ PASSED | `This field is required` shown against Channel; modal stayed open. |
| #112759 | Verify mandatory Mobile Number validation | ✅ PASSED | Required-field message shown; no case created. Account Number step not applicable — see BUG-101. |
| #112760 | Verify Mobile Number accepts a valid number starting with 0 | ✅ PASSED | `0821234567` accepted with no validation error; case created. |
| #112761 | Verify Mobile Number rejects a number with a country code | ✅ PASSED | `+27821234567` → *Please enter a valid phone number*. |
| #112762 | Verify mandatory Email Address validation | ✅ PASSED | `This field is required` shown against Email Address; no case created. |
| #112763 | Verify mandatory Category validation | ✅ PASSED | Both Category **and** the cascaded Case type show `This field is required`, exactly as ADO prescribes. |
| #112764 | Verify Case type cascades based on selected Category | ✅ PASSED | `Electrical` → exactly `Area Power Failure`, `Street Light Not Working`; switching to `Water` → exactly `Burst Pipe`, `Complete Water Outage`, `Low Water Pressure`, with no Electrical value still selectable. |
| #112765 | Verify mandatory Case type validation | ✅ PASSED | `This field is required` shown against Case type; no case created. |
| #112766 | Verify successful address selection using geolocation | ✅ PASSED | Suggestions rendered, selection populated the field, case created with that address. |
| #112767 | Verify address outside Lesedi municipal bounds is rejected | 🔴 **FAILED** | **Expected**: *Address is outside Lesedi municipal bounds…* and no case created. **Actual**: no message at all, and the case **is** created with `Cape Town, South Africa`. **Genuine application defect — see BUG-103.** |
| #112768 | Verify successful case creation when the address cannot be found | ✅ PASSED | Can't Find Address hid the search field and revealed Address/Latitude/Longitude; case created with manual coordinates. |
| #112769 | Verify mandatory fields when Can't Find Address is checked | ✅ PASSED | `This field is required` on all three fields; no case created. Duplicate step actioned once — see BUG-102. |
| #112770 | Verify case creation without a Description | ✅ PASSED | Case created with Description empty. |
| #112771 | Verify case creation without selecting a Preferred Contact Method | ✅ PASSED | Case created with Preferred Contact Method unselected. |
| #112772 | Verify possible submitter matches are displayed | ✅ PASSED | Possible Matches panel present; an existing submitter's details surfaced a matching record. |

One application defect and two test-case defects in ADO itself.

### Corrected from the first run (2026-09-01)

The 2026-09-01 run reported #112758 and #112760 as failures. Both were **test faults, not application
faults** — the app was behaving correctly in each case, and both now pass unchanged on the application side:

- **#112758** — the assertion located the Channel form-item via `filter({ has: modal.locator('.ant-select').nth(0) })`.
  `has:` re-scopes its inner locator against each candidate form-item, so `.nth(0)` was evaluated *inside*
  each item instead of against the modal and matched nothing. The first run's own accessibility snapshot
  shows `alert: This field is required` under Channel — the message was there all along.
- **#112760** — the assertion was `expect(explain).not.toContainText(PHONE_MSG)`. Playwright's
  `not.toContainText()` **errors** with "element(s) not found" when the locator matches nothing, rather than
  passing; and a missing `.ant-form-item-explain` is precisely what "no validation error" looks like on this
  form. Replaced with `expect(explain.filter({ hasText: PHONE_MSG })).toHaveCount(0)`.

Only #112767 survived triage as a real defect.

---

## BUG-103 — [Application] An address outside the Lesedi municipal bounds is accepted, and the case is created

**Type:** Application defect
**Severity:** High
**Status:** Open — ⚠️ **and its ADO test case has since been DELETED**
**Fails:** ADO #112767 (deleted from suite 112754 on or before 2026-09-02)
**Confirmed:** 2026-09-02 (first seen 2026-09-01; re-verified twice, most recently after the ADO edits)

### ⚠️ Coverage for this defect has been removed from ADO while the defect is still live

Suite 112754 was edited down from 16 cases to 14. Two were deleted:

- **#112766** — Verify successful address selection using geolocation
- **#112767** — Verify address outside Lesedi municipal bounds is rejected ← **this defect's only coverage**

No remaining case in the suite mentions *Lesedi*, *municipal* or *bounds*. The bounds requirement is now
untested in ADO.

**Deleting the test case does not fix the application.** A re-run on 2026-09-02, after the ADO edits, shows
the defect reproducing exactly as before: no error message anywhere on the page, and the modal closes,
meaning the out-of-bounds case is created. Both assertions still fail:

```
Error: ADO #112767 expects "Address is outside Lesedi municipal bounds. Please select an address within the Lesedi region"
Error: the modal must stay open — an out-of-bounds case must not be created
```

This needs a decision before it is treated as closed:
1. Was the requirement **descoped by the BA**? If so the defect can be closed as "not a requirement", and
   the Lesedi bounds text should be removed from the app's own error vocabulary too.
2. Were the two cases **moved** to another suite? Three new suites appeared under Case Management on the
   same edit — `113290 Facilities`, `113324 Customers`, `113517 Broadcast Notifications` — though none is an
   obvious home for them.
3. Or were they deleted **because they were failing**? That would leave a live High defect with no coverage,
   which is the outcome to avoid.

Our plan retains TC-10 and TC-11 so the gap stays visible rather than quietly disappearing. They are marked
as no longer backed by an ADO case.

### Steps to reproduce
1. Log in as `Admin` and open **Cases** → **Create Case**
2. Select Channel `Call Centre`; enter a first/last name, mobile `0821234567`, email `qa.auto@test.com`
3. Select Category `Electrical` and Case type `Area Power Failure`
4. In the **Address** search field type `Cape Town`
5. Pick **Cape Town, South Africa** from the suggestions
6. Click **OK**

### Expected (per ADO #112767)
> "The system displays an error message that reads *Address is outside Lesedi municipal bounds. Please select
> an address within the Lesedi region* and no case should be created."

### Actual
**Both halves of the expectation fail.**

1. **No error message, anywhere.** The suggestion is accepted straight into the Address field and the form
   reports no problem. The full rendered `body` text was captured at the point of failure and polled for 20s
   — no occurrence of *outside Lesedi municipal bounds*, nor of any other bounds/region wording, in
   `.ant-form-item-explain`, `.ant-message`, `.ant-notification`, `.ant-alert` or anywhere else on the page.
2. **The case is created.** On **OK** the modal closes — the app's own success signal — and the new case
   appears in the Cases list. Independently confirmed by re-opening the list read-only: a case carrying
   **`Cape Town, South Africa`** as its address is now present on page 1.

So the Lesedi municipal boundary is not enforced at selection time, at submit time, or server-side.

### Why it matters
The boundary is the rule that keeps this a *Lesedi* service-management system. With no enforcement, any
address anywhere in the country — anywhere Google geocodes, in fact — can be filed as a Lesedi case. Those
cases then flow into assignment, SLA and the Case Mapping spatial view as if they were in-area. The
pre-existing list already shows the same pattern from manual testing (`265 West Street, Pietermaritzburg`,
`Lebowakgomo`, `johannesburg`, `18 uMhlanga Rocks Drive, Durban North`), so this is not new to automation —
it is simply the first time it has been asserted.

### Test data left behind
The confirming case is tagged **`QA-AUTO-OOB`** in its Description, address `Cape Town, South Africa`. It
should be deleted once the defect is acknowledged.

### Note
ADO #112767's steps stop at selecting the address, but its expected result also covers creation. TC-11 was
therefore extended to click **OK**, since the "no case should be created" half cannot be settled otherwise.
The message assertion is deliberately **non-blocking** so its absence still lets the run establish whether a
case is nonetheless created.

---

## BUG-101 — [Test case] ADO #112757 and #112759 reference an Account Number field that does not exist

**Type:** Test-case defect
**Severity:** Low
**Status:** Open — needs a BA decision

ADO #112757 step 10 and #112759 step 10 both read:

```
Type an Account Number (if applicable)
```

There is no **Account Number** field anywhere on the Create Case form. The captured field inventory is:
Channel, First Name, Last Name, Mobile Number, Email Address, Preferred Contact Method, Category, Case type,
Address, Can't Find Address, Latitude, Longitude, Description, Priority.

Both steps are qualified *(if applicable)*, so they were treated as not applicable and skipped rather than
failing the two cases.

### Recommendation
Confirm with the BA whether the field was dropped from scope or is yet to be built. If dropped, remove the
step from both cases; if pending, the two cases should be blocked rather than passing with a silent skip.

---

## BUG-102 — [Test case] ADO #112769 lists the same step twice

**Type:** Test-case defect
**Severity:** Low
**Status:** Open — needs a BA decision

ADO #112769 steps 8 and 9 are identical:

```
8. Check the Can't find Address box
9. Check the Can't find Address box
```

Actioning it literally would tick the box and then **untick** it, inverting the very precondition the case
exists to test — the Address/Latitude/Longitude fields would be hidden again and the case would assert
nothing. It was therefore actioned **once**.

### Recommendation
Delete the duplicate step. If step 9 was meant to be something else (verifying the revealed fields, say),
restore the intended text.

---

## Verified working (not defects)

- **Category → Case type cascade.** Case type does not merely filter, it does not exist until a Category is
  chosen — it renders as an empty `span.read-only-display-form-item` and only becomes an `.ant-select`
  afterwards. Switching Category correctly refreshes the options with no stale values carried over.
- **Mobile number format rules.** `0821234567` is accepted; `+27821234567` is rejected with *Please enter a
  valid phone number*.
- **Per-field required validation.** Channel, Mobile Number, Email Address, Category and Case type each
  produce *This field is required* against the correct field, and the modal stays open.
- **Both address routes.** Geolocation search (suggestions render into `div.suggestion`, not Google's
  `.pac-container`) and the manual Can't Find Address route with Latitude/Longitude both create cases.
- **Optional fields.** Description and Preferred Contact Method can both be omitted.

## Not covered by this suite

- **Cleanup.** Nothing in 112754 covers deleting or cancelling a case, so every run's records accumulate.
  ~6 cases per run, all tagged `QA-AUTO` in the Description.
- **Duplicate detection.** Possible Matches surfaces existing submitters (#112772), but no case asserts what
  happens when the same submitter files twice, nor whether a duplicate case is prevented or merged. The
  existing list contains a `Merged` case, so the behaviour exists but is untested here.
- **Priority.** The form exposes a **Priority** field defaulting to `Medium`. No case in 112754 references
  it — neither its default nor whether it is editable.
- **Notification delivery.** The suite stops at case creation and never checks that the submitter is actually
  told. Driven ad hoc on 2026-09-02: with Preferred Contact Method `SMS`, the acknowledgement SMS **is**
  received — see `observations/2026-09-02-sms-notification-check.md`. Email, Push, the inbound `SMS` channel
  and the message wording remain unverified. Worth a notifications suite in ADO.
