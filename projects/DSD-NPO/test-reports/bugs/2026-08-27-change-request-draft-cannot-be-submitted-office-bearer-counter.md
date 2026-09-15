# 🔴 High — A saved Change Request draft can never be submitted: the office-bearer gate counts a variable that is never initialised

**Raised:** 2026-08-27
**Found in:** NPO-10-F TC-04/TC-05 preparation (ADO #101771 / #101772)
**Environment:** QA · public portal · `boxfusion.dsdnpo/create-change-request` v47
**Specimen:** our own `POST1424/21/08/2026` (`c89899f6-0d76-4dcf-bf12-6ffdc9fa1f33`) on our own `333-022-NPO`
**Severity:** 🔴 High — blocks the entire post-registration submission path for any returning submitter

## What happens

Open a saved Change Request draft that already carries enough office bearers. Step 3 (**Update → Office Bearer
Change**) lists them, and `Next` is **disabled** under a warning:

> Please Office Bearers should be 3 or more before you proceed

Three office bearers were listed (1 `UPDATED`, 2 `ADDED`). The record's own `requiredNumberOfOfficeBears` read **3**.
`Next` stayed disabled regardless.

The submitter has no way to tell what is wrong, because by the form's own message the requirement is already met.

## Root cause — confirmed from the form configuration

The `Next` gate in `create-change-request` v47:

```js
const officeBearerWasChanged = Boolean(
    globalState?.officeEdited || globalState?.officeDeleted ||
    globalState?.officeBearerAdd || globalState?.updatedAndAdded
);
const requiredOfficeBearers    = Number(data?.requiredNumberOfOfficeBears ?? 3);
const currentOfficeBearerCount = Number(globalState?.numberOfOfficeBearer ?? 0);

rules.push({ name: "Office bearers",
    isValid: officeBearerWasChanged && currentOfficeBearerCount >= requiredOfficeBearers });
```

`globalState.numberOfOfficeBearer` is assigned in **exactly one place** — the success handler of the
add/edit-office-bearer dialog:

```js
const count = globalState?.dataTableContext3?.tableData?.filter(
    (item) => item.changeType === 1 || item.changeType === 2 || item.changeType === 6).length ?? 0;
setGlobalState({ key: "numberOfOfficeBearer", data: count + 1 });
```

So:

1. **`numberOfOfficeBearer` is never seeded on load.** On a freshly opened draft it is `undefined` → `0`, and
   `0 >= 3` is false. It is never derived from the office bearers actually on the record.
2. **`officeBearerWasChanged` is also only set by an in-session mutation.** Even a correct count would not pass
   without adding, editing or deleting an office bearer in the current session.

The identical alert has its own separate condition, `return (globalState.numberOfOfficeBearer >= 3)`, with the
threshold **hardcoded to 3** while the gate reads the per-record `requiredNumberOfOfficeBears` — so the message and
the rule can disagree on any NPO whose requirement is not 3.

## Reproduction

1. Public portal → an NPO with a saved, complete Post Registration draft → **Draft Post Registration → Submit**.
2. `Next` through to step 3 **Update → Office Bearer Change**.
3. Observe three office bearers listed and `Next` disabled with "should be 3 or more".
4. **Workaround that unblocks it:** add or edit any office bearer. The success handler then sets the counter and
   `Next` enables immediately — no other change required.

Verified: after adding a fourth office bearer the warning cleared, `Next` enabled, and the wizard completed to
submission (`status` 1 → 2). `requiredNumberOfOfficeBears` also moved 3 → 4, confirming the field tracks the count
rather than acting as a fixed configured minimum.

## Impact

Any submitter who saves a draft and returns to it — the normal way this multi-step form is used — is permanently
blocked with a message that describes a condition already satisfied. This is why NPO-10-F TC-10-010 and TC-10-011
sat deferred from 2026-08-18 to today.

## Suggested fix

Seed `numberOfOfficeBearer` from the office-bearer table on form load (and after any refresh), and drop
`officeBearerWasChanged` from the gate — whether the user touched an office bearer *this session* is not a
statement about whether the submission is valid. Also drive the alert from `requiredNumberOfOfficeBears` instead of
a hardcoded 3, and word it against what the user can see.
