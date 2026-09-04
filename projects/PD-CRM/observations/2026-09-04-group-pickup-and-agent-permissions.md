# Observation — Picking up a group-assigned case, and what a Customer Service Representative may do

**Date:** 2026-09-04
**Environment:** QA — https://pd-dep-adminportal-qa.shesha.app
**Build:** `Boxfusion.ServiceManagement/case-request-details`, `StarterTemplate/assign-case v15`
**Type:** Exploratory check, not an ADO case

## Why this was run

ADO #112778 ("Verify Agent Can Pick Up a Case Assigned to Another Agent") has always needed a second agent
account. Rather than reuse the known-good `MoshadiM`, we tested the more realistic path the Auto Testing
Group now makes possible: **assign a case to a group, then have group members compete for it.**

## Fixture

`REF001/04/09/2026` — created for this check, `Area Power Failure` / `Electrical`, address Heidelberg,
submitter `QAAuto681535 Tester`, description tagged `QA-AUTO`. Assigned to **Auto Testing Group**, whose two
members are Nomfanelo Nhleko (`b7e4c431`, user 28) and Lungile Nhleko (`1dc8e28b`, user 271).

## Results

### 1. A newly created case AUTO-ROUTES to an agent

Straight after creation the case already read `Assigned To Moshadi Mothiba`, with `assignedDate` set and a
populated `caseRouting`. **Nobody assigned it** — case routing did, on creation. Worth knowing before
reading any "assigned to" value as the result of a test step.

### 2. Assigning to a group CLEARS the individual assignee

Assigning to Auto Testing Group replaced `personAssigned` (Moshadi) with `null` and set
`organisationAssigned`. The action bar also lost **Mark In Progress**. So group assignment is exclusive with
individual assignment, not additive.

### 3. Pick Up works on a group-assigned case, and claims it exclusively

As `MoshadiM`, the case offered **Pick Up**, with the dialog:

> **Pickup Case** — *Are you sure you want to assign this case to yourself?*  **No** / **Yes**

After confirming:

| Field | Before | After |
|---|---|---|
| `organisationAssigned` | Auto Testing Group | **none** |
| `personAssigned` | none | **Moshadi Mothiba** |
| `pickUpDate` | null | 2026-09-04T09:00:40 |

So picking up converts a *group* assignment into an *individual* one and drops the group. Sensible, and it
means a group assignment is a queue, not a shared ownership.

### 4. The other group member cannot act on the case — and it is PERMISSIONS, not case state

As `nomfanelon` (Nomfanelo, the other group member) the case **was visible**, but the action bar offered
only *Turn On AI Assistant*: **no Pick Up, no Assign, no Merge, no Cancel, no Edit.** Moshadi saw all of
them on the same screen.

The difference is role, not case state:

| User | Role | Case actions |
|---|---|---|
| `MoshadiM` | **Customer Service Administrator** | full action bar |
| `nomfanelon` | **Customer Service Representative** | none |

**This settles a question the Roles screen could not answer.** That screen renders an identical permission
block for every role — Customer Service Supervisor has zero users and shows the same list — because the
checkbox state is not in the page text. Empirically: **Customer Service Representative does not grant
`Case-*` actions.** It matches the note that Thabitha (also CSR) could not act as Agent B.

## Consequences

- **#112778 still needs `MoshadiM` as Agent B.** The group-pickup route cannot substitute for it, because
  the second group member has no case permissions. Group membership drives *broadcast targeting*; it grants
  nothing else.
- **Lungile cannot be used as an agent at all** — her account (`1756891976`) has **zero** assigned roles.
- If the group-queue behaviour is meant to let any member claim a case, then Auto Testing Group is
  mis-staffed for that purpose: only one of its two members could ever claim anything, and neither holds a
  case-capable role except through Nomfanelo's separate CSR role, which does not suffice.

## Cleanup

`REF001/04/09/2026` remains in QA, now assigned to Moshadi Mothiba, and should be deleted with the other
`QA-AUTO` records.
