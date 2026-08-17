# Report: ADMIN-USER — TC-01 Register a new user

**Date:** 2026-08-12
**Plan:** test-plans/administration/create-user.md
**Cases:** TC-01
**Execution Mode:** ai-driven (Playwright via Node)
**Result:** PASSED — user created and verified retrievable; register count 8,773 → 8,774
**Duration:** not instrumented

## Summary
| Total Assertions | Passed | Failed | Skipped |
|---|---|---|---|
| 6 | 6 | 0 | 0 |

Run on the developer's account (`mpenduloizwelinuk@gmail.com`), in **Latest** view mode.
**The first end-to-end flow completed successfully on DSD-NPO.**

## Step Results

### TC-01 — Register a new user
**Mode:** ai-driven · **Result:** PASSED 6/6

- [PASS] View mode switched Live → Latest
- [PASS] User register renders — *"1-10 of **8773** items"*, columns Creation Time · User Name · First Name · Last Name · Email Address · Mobile Number · Type of User
- [PASS] (BLOCKING) **Register New User** modal opened; actions **Cancel** / **Ok**
- [PASS] All **8** fields present and mandatory, all populated and read back:

  | Field | Value |
  |---|---|
  | First Name | `QA` |
  | Last Name | `Tester0812` |
  | Mobile Number | `0818400512` |
  | Email Address | `qa.tester0812@example.org` |
  | Type | `Internal` (options: Internal · Office Bearer · Public Portal User) |
  | User Name | `qa.tester0812@example.org` |
  | Password / Confirmation | `Boxfusion@2026` |

- [PASS] Modal closed on **Ok**
- [PASS] (BLOCKING) **The user is retrievable** — top row of the register:
  `12/08/2026 11:47 · qa.tester0812@example.org · QA · Tester0812 · qa.tester0812@example.org · 0818400512 · Internal`
- [PASS] Register count increased by exactly one: **8773 → 8774**

Clean API chain: `200 POST /api/services/app/UserManagement/Create` → `200 GET Person/Crud/Get` →
`200 PUT Person/Crud/Update` → `200 PUT User/Crud/Update`. Only the module-wide
`404 POST /signalr-timeline/negotiate` appeared, as everywhere else.

## 🔴 Defect found on the way — validation errors are silently discarded

The first attempt at this test **failed**, and it failed invisibly. With `Mobile Number` set to `0818400598` — the
number this hub uses by convention — the create was **rejected with HTTP 400**:

```json
{"success": false,
 "error": {"message": "Your request is not valid!",
           "details": " - Specified mobile number already used by another person",
           "validationErrors": [{"message": "Specified mobile number already used by another person"}]}}
```

**The UI discarded that message entirely, closed the modal, and showed nothing.** The register count stayed at
8,773. To a user it is indistinguishable from a successful save.

The server had a precise, human-readable reason ready. Only the front end failed to display it.
Raised as `test-reports/bugs/2026-08-12-validation-errors-not-surfaced.md`.

## Test data created
**User `qa.tester0812@example.org`** (QA Tester0812, Internal, mobile `0818400512`, password `Boxfusion@2026`),
person id `5c36b380-e666-4f99-b8ea-2bfca998a25c`. **Reuse this account rather than creating more** — and note it may
serve as the role-scoped internal DSD user we have been lacking, instead of borrowing the developer's account.

## Notes
- ⚠️ **Deviation from convention:** the hub's standard test number `0818400598` could not be used — it is already
  held by another person on this environment, and the API enforces uniqueness. `0818400512` was used instead. No SMS
  is expected for an `Internal` user, so the reason for that convention does not apply here.
- **`User Name` should be an email address** — every existing user's username is one.
- ⚠️ `/dynamic/boxfusion.dsdnpo/user-management-table` **404s on direct navigation**. Reach it via the menu; a
  `page.reload()` on it breaks the page and empties the caption.
- The create button is **`Register New User`**, not Add/Create/New. A first attempt at this run searched for
  Add/Create/New, never opened a form, and produced four meaningless passes — retracted, and the plan now names the
  button explicitly.
