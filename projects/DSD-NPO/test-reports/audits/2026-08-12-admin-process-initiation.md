# Audit — what can be initiated from the admin portal (2026-08-12)

Not a test run. Characterisation of the admin side, carried out because the public registration wizard is blocked
(`bugs/2026-08-12-address-autocomplete-renders-no-suggestions.md`) and because the module's standing practice is to
**work on records we created ourselves**, never to action the 2,470 existing inbox items belonging to other testers.

## Where create actions exist

| Area | URL | Create action |
|---|---|---|
| Workflows → My Items | `/dynamic/Shesha.Workflow/workflows-my-items` | **Create New** |
| CRM → Case | `/dynamic/boxfusion.dsdnpo/cases-table` | **Create Case** · Pick Up · Close |
| CRUDS → Annual Compliance | `/dynamic/boxfusion.dsdnpo/annual-compliance` | **Add** |
| Education & Awareness → Interventions | `/dynamic/boxfusion.dsdnpo/interventions` | **Add Intervention** |
| All NPOs · All Applications · Appeals · Change Request · Investigation · Voluntary Deregistration · Inbox · Sent · Drafts | see below | Export only — read-only lists |

Read-only list URLs, for future direct navigation: `npos` · `npoapplication` · `appeal-table` · `change-requests` ·
`investigation-table-view` · `allDeregistrationApplications-table` · `assigned-cases` ·
`case-resolution-performance` · `Shesha.Workflow/workflows-{inbox,sent,drafts}`.

## Processes offered by My Items → Create New

11 workflow definitions can be initiated:

1. Deregistration Appeal Definition
2. Annual Compliance Submission Definition
3. Appeal Definition
4. Change Request Definition
5. `deregistration-appeal`
6. Investigation Process
7. **Npo Application Create**
8. **Registration Definition**
9. **Registration Definition2**
10. **Registration Process**
11. Voluntary Deregistration Process

**This means the whole CRUDS lifecycle is reachable from the admin side**, and we can own every record we test
instead of touching seed data.

### ❓ Question for Thabiso — four registration-ish definitions, and duplicates
**Npo Application Create · Registration Definition · Registration Definition2 · Registration Process** all appear in
the same picker, as do both **Deregistration Appeal Definition** and a lowercase slug-style **`deregistration-appeal`**,
alongside **Appeal Definition**. `Registration Definition2` and `deregistration-appeal` read like leftovers from
development.

- Which definition is the **live** one for each process?
- Are the others obsolete, and should they be unpublished so testers cannot initiate the wrong workflow?

This matters before any coverage is written: a plan that drives *Registration Definition2* would be testing something
that may never run in production.

## What was initiated

**Deregistration Appeal Definition** → workflow `id=b6c2fe9e-57cc-4d8c-b73c-5dfc7f261ee9`,
`todoid=71b11747-ad8e-4ea9-9fc7-e31048d10449`, titled **"Initiate Appeal:"**. Left as an unsubmitted draft.

⚠️ *Chosen by accident* — the selection rule preferred anything matching `/registration/`, and **De**registration
matched first. A registration process was intended. Not a finding about the app.

Form shape — **single page, no wizard stepper**; buttons `(press to upload)` · `Cancel` · `Submit`. 19 form items:

| Required | Field | Control |
|---|---|---|
| | Nature of Appeal | radio |
| ✱ | Preferred Representation Mode | radio |
| | Supporting Documents | upload |
| | *(unlabelled)* | select |
| ✱ | Name | text |
| ✱ | Surname | text |
| ✱ | Capacity | select |

Plus a repeated read-only-looking block — Name, Last Name, ID Number, Passport Number, Cellphone number, Email,
Nationality, Position — that my probe could not classify. Given the `sha-react-table` lesson below, **do not assume
these are broken**; they are more likely a person-lookup subform rendered with custom components.

## 🔴 Errors observed on that form
- **`500 GET /api/StoredFile/FilesList?ownerId=b6c2fe9e…&ownerType=Npo.DeregistrationA…`** — the file list backing the
  **Supporting Documents** upload fails with a server error. Any upload test on this form should expect trouble.
- **`400 GET /api/dynamic/boxfusion.dsdnpo/DeregistrationAppeal/Crud/Get?properties=appealStatus,declarationCap…`**
- `404 POST /signalr-timeline/negotiate` — the usual, module-wide.

## 🔑 Automation note recorded during this audit
Admin grids are **`sha-react-table` / `sha-table` / `sha-index-table-full`**, exposed as **`[role=table]` /
`[role=row]`** with an `.ant-pagination` and a caption like *"1-10 of 361068 items"*. They are **not** AntD tables:
an `.ant-table`-based sweep reported 21 of 24 admin areas as "not rendering", and **every one of those was a false
negative**. Read totals from the caption and rows from `[role=row]`.

## Recommended next steps
1. **Initiate `Registration Process`** (and/or `Npo Application Create`) from the admin side. If its address control
   behaves, the public blocker is form-specific rather than platform-wide — and we get a usable registration path.
2. **CRM → Create Case** as the first flow we can complete end to end today: create → Pick Up → Case Resolution →
   Close, verified against the CRM Dashboard counts.
3. Get Thabiso's answer on which definitions are live before writing plans against any of them.
