# Bug: Every notification audit / administration screen loads no data — the forms query fields that no longer exist on the entity

**Date:** 2026-08-25
**Severity:** 🔴 **High** (the entire notification administration UI is unusable)
**Area:** Admin portal — `Shesha` module notification screens
**Environment:** QA · admin portal · **view mode Latest (asserted in-run)**
**Found by:** TC-14T-011 (ADO #101838) — the UI ↔ store cross-check that suite 14T's method depends on
**Related:** explains why `14t-notification-templates-functional--store-harvest.md` had to verdict from the API

## Summary
Five notification screens in the admin portal render their column headers and then sit permanently empty. In every
case the grid's own data request comes back **HTTP 400 "Your request is not valid!"** because the form asks for
**properties that do not exist on the entity**.

The consequence is that there is **no working UI view of the notification store anywhere in the application**.

## The screens and their exact errors

### 1. `/dynamic/Shesha/notification-message-audit-table` — "Notification Message Audit Table"
Columns rendered: `Created On · Date Sent · Notification · Recipient · Send Type · Subject · Body · Status`
```
GET /api/services/app/Entities/GetAll?entityType=Shesha.Domain.NotificationMessage
    &properties=creationTime sendDate notification recipientText sendType subject body status id
→ 400
 - Cannot query field 'sendDate' on type 'NotificationMessage'.
 - Cannot query field 'notification' on type 'NotificationMessage'. Did you mean 'direction'?
 - Cannot query field 'sendType' on type 'NotificationMessage'.
 - Cannot query field 'body' on type 'NotificationMessage'.
```
**4 of its 8 columns are bound to dead properties.** `body` was renamed to `message` — the same rename the 08-24
store harvest ran into — and the form was never updated.

### 2. `/dynamic/StarterTemplate/notification-message-audit-table`
Byte-for-byte the same four errors. The broken form exists in two modules.

### 3. `/dynamic/Shesha/notifications-audit` — "Notification Message Audit Table" (the richer one)
Columns rendered: `Triggering Entity · Part Of · Creation Time · Date Sent · Notification · Recipient Text · Subject · Message · Status · Channel`
```
GET /api/services/app/Entities/GetAll?entityType=Shesha.Domain.NotificationMessage
    &properties=partOf { triggeringEntity { id _displayName } id _displayName name } creationTime dateSent … 
→ 400
 - Error trying to resolve field 'notificationMessageList'.
   Inner Exception: Type 'Shesha.EntityReferences.GenericEntityReference' does not have a default constructor (Parameter 'type')
```
A different, framework-level failure: the generic entity reference behind `partOf.triggeringEntity` cannot be
constructed. This one is a server-side crash, not a stale field name.

### 4 & 5. `/dynamic/Shesha/notifications-table-view` and `/dynamic/Shesha/notifications`
Columns rendered: `Name · Description`
```
→ 400  Cannot query field 'description' …
```
Two of two columns dead, so these grids can never show a row.

`/dynamic/Shesha/notification-templates` renders no grid at all (0 column headers).

## Expected
The Notification Message Audit screen lists notification messages, so that a tester or an administrator can see what
was sent, to whom, and whether delivery succeeded — and can re-send.

## Actual
Header row renders, an empty-state marker shows, no row ever loads. Nothing on any of these screens works. There is
no error surfaced to the user — the 400 is swallowed and the grid simply looks like an empty result set, which is
indistinguishable from "no notifications exist".

🔑 **A grid that shows "no data" because its own query is invalid is worse than an error**, because it reads as a true
empty set. The store actually holds **23 644 messages**.

## Impact on suite 14T's method
The 14T plan names the change-request form as *"the one place in the app where the UI corroborates the store"* and
made TC-11 the case that validates the whole suite's verification method. Two things turned out to be true:

1. `change-request-details` **v25** (checked in Latest mode) has **no Correspondence section, no notification-audit
   section and no Re-Send button** — only `Change Details · Declarations · Foundational Change · Documents · Notes`.
   The premise in the plan does not hold for this form version.
2. The standalone audit screens that *would* provide that independent view are all broken as above.

So the UI ↔ store cross-check is **not possible on this build**. Suite 14T's store-based verdicts are not
store-based by choice — the store is the only view of this data the application can currently produce. That should be
stated plainly rather than carried as an open methodological gap.

## Suggested fix
- Rebind the audit grids: `body` → `message`, and drop or re-map `sendDate`, `sendType`, `notification`
  (the entity offers `direction`), and `description` on the Notification grids.
- Fix `GenericEntityReference` construction for `partOf.triggeringEntity` on `notifications-audit`.
- Surface a failed grid query to the user instead of rendering an empty result set.
