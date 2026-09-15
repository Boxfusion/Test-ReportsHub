# 🟠 Medium-High — Deleting a user account takes one click, with no confirmation, and is not transactional

**Raised:** 2026-08-27
**Found in:** NPO-01-F TC-19 (ADO #107678 · TC-01-022) — incidental to building that case's precondition
**Environment:** QA · admin portal · `boxfusion.dsdnpo/user-management-table` **v7** (LIVE) · view mode Latest
**Specimen:** our own throwaway Account H `npo.qa.delete.h@example.org` (Person `7c18ac90-e34a-462c-92ee-b315467020a9`), deleted deliberately
**Severity:** 🟠 Medium-High — an irreversible, unconfirmed destructive action on a grid of 8 790 live user accounts, one mis-click away at all times

## What happens

**Administration → User Management** renders a delete icon on **every row**. Clicking it once:

- shows **no confirmation dialog** — no `.ant-modal-confirm`, no "are you sure"
- deletes the **Person** and the **User** immediately
- offers **no undo**

The row is gone on the next render. Verified: after deleting Account H, a search for its username returns
**"0 items found"**, and the account can no longer sign in.

There is no guard between a mis-aimed click in a 10-row grid and the permanent deletion of a real user account.

## Corroboration from the form definition, not just observation

The delete is an inline **"Execute Script"** action bound to a grid column icon. The form markup (v7, 19 776 chars)
contains **zero** occurrences of any `confirm*` string, and the action is:

```js
const deletePersonApi = `/api/dynamic/Shesha/Person/Crud/Delete?id=${data.id}`;
const deleteUserApi   = `/api/services/app/User/Delete?id=${data.user.id}`;

Promise.all([
  http.delete(deletePersonApi),
  http.delete(deleteUserApi)
])
.then(([personResponse, userResponse]) => {
  console.log("Person deleted:", personResponse);
  message.success("Successfully Deleted")
  …
```

So the absence of a confirmation is a configuration fact, not an artefact of how it was clicked.

## Two further problems visible in that snippet

### 1. It is not transactional
Two independent deletes are fired in parallel via `Promise.all` with no compensating action. If one succeeds and the
other fails, the result is a **half-deleted account** — a Person with no User, or a User with no Person — and nothing
rolls back or reports it. `Promise.all` rejects on the first failure, so the `.then` never runs and the operator sees
neither the success toast nor a specific error.

This matters beyond tidiness: TC-01-022's whole premise is about orphaned rows left behind by deletion, and this is a
mechanism that can create them.

### 2. Only the caller's console records what happened
The outcome is written with `console.log`, and success is a transient `message.success` toast. There is no audit entry
surfaced in the UI. For a destructive action on user accounts, "who deleted whom, and when" should be recoverable —
the Audit Logs screen is already broken for other reasons (14U TC-003/004 are blocked), so nothing covers this today.

📌 The success toast was **not observed** during this run (checked ~3 s after the click, no `.ant-message-notice`
present). It may have rendered and auto-dismissed inside that window — the config clearly emits one — so this is
noted, not asserted.

## Reproduction

⚠️ **Destructive. Only ever do this against a throwaway account you created.**

1. Sign in to the admin portal with a broadly-privileged account.
2. **Administration → User Management** (`/dynamic/boxfusion.dsdnpo/user-management-table`).
   🔑 Note the module is `boxfusion.dsdnpo`, **not** `Shesha` — `/dynamic/Shesha/user-management-table` 404s.
3. Click the delete icon on any row.
4. Observe: no confirmation, row gone, account unusable.

## Suggested fix

A standard `Modal.confirm` naming the account being deleted (username + email), and the two deletes moved behind a
single server-side operation so the Person/User pair cannot diverge.

## Question for the test lead

Are these **hard** deletes or soft deletes? The endpoints are `Person/Crud/Delete` and `User/Delete`, and
TC-01-022's expected result says rows should be *"soft-deleted"* — but that is not observable from the client, and the
case's own step 5 needs DB access to confirm. If they are hard deletes, the expected result in #107678 is wrong; if
they are soft, the re-registration behaviour (a freed email address, silently reusable) still needs a ruling.
