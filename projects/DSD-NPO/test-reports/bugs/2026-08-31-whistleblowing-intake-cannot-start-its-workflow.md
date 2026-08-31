# 🔴 The public whistleblowing channel cannot be used — Start Workflow references a workflow definition that does not exist

**Date found:** 2026-08-31
**Environment:** QA — public portal (`dsd-npo-publicportal-1-qa.shesha.app`)
**Severity:** High — the entire public whistleblowing intake is unusable; there is no workaround for a member of the public
**Status:** Open · **REGRESSION** (this route worked on 2026-08-28)
**Found during:** suite 12 (Investigations) — attempting to file a case for TC-12-007
**Report:** `test-reports/2026-08-31/12-investigations-functional--both-creation-routes-down.md`

## What happens

The **Whistleblowing** button on the public landing page (both `/` and `/no-auth/boxfusion.dsdnpo/landing-page`)
fires the `workflows:Start Workflow` action, which issues:

```
POST https://dsd-npo-api-qa.shesha.app/api/services/SheshaWorkflow/Process/StartByName
request:  {"workflowDefinitionId":{"name":"investigaton-definition","module":"boxfusion.dsdnpo"}}
response: 404
{"result":null,"success":false,
 "error":{"code":404,
   "message":"workflow-definition `boxfusion.dsdnpo\\investigaton-definition` not found",
   "details":"workflow-definition `boxfusion.dsdnpo\\investigaton-definition` not found"}}
```

The page stays on the landing page. Nothing is created and **the user is shown no error** — only the console records
it (`Failed to execute action 'workflows:Start Workflow', error: AxiosError: Request failed with status code 404`).

## Why the definition name is wrong

The endpoint itself is healthy — it returns a structured "definition not found", not a route 404.

**All 169 investigations in the register carry workflow definition `investigation-process`.** The button asks for
**`investigaton-definition`** — a name no record has ever used, and misspelt (`investigaton` / `investigation`).

## This is a regression

INV1696/28/08/2026 and INV1698/28/08/2026 were both filed end to end through this exact button on **2026-08-28**, and
a further case (INV1710) was created on **2026-08-29**. The break therefore landed on or after 2026-08-29.

## Opening the form directly does not work either

`/no-auth/boxfusion.dsdnpo/create-investigation-workflow` renders the Whistleblowing form, but it is not usable:

| Field | Required | Input control present? |
|---|---|---|
| First Name | ✅ | ❌ **absent** |
| Last Name | ✅ | ❌ **absent** |
| Email Address | ✅ | ❌ **absent** |
| Mobile Number | ✅ | ❌ **absent** |
| Npo Number | ✅ | ❌ **absent** |
| Case Type | ✅ | ✅ |
| Description | ✅ | ✅ |
| NPO Address | — | ✅ |
| Remain Anonymous | — | ⚠️ present but **disabled** |
| Submit | — | ⚠️ **disabled** |

Four inputs exist on the whole page. The required fields render as labels with a `*` and no control. The form also
logs `TypeError: Cannot read properties of undefined (reading 'setFieldValue')`, consistent with it depending on a
workflow instance that the broken Start Workflow never creates.

⚠️ **Note for whoever picks this up:** an intermediate reading of "the form is fine, only the button is broken" was
**wrong** and is retracted here. Checking for input *controls* rather than labels shows the form cannot be completed
standalone. Both halves of the channel are down.

## Steps to reproduce

1. Open `https://dsd-npo-publicportal-1-qa.shesha.app/` (no sign-in needed).
2. Under *Report Anonymously*, click **Whistleblowing**.
3. Observe: no navigation, no visible error. Console shows the 404 above.
4. Retry — identical result (not intermittent).
5. Navigate directly to `/no-auth/boxfusion.dsdnpo/create-investigation-workflow`; observe the required fields have
   no inputs and **Submit** is disabled.

## Expected

Clicking **Whistleblowing** starts the investigation workflow and opens a completable intake form, as it did on
2026-08-28.

## Impact

- **No member of the public can report misconduct.** This is the statutory whistleblowing channel.
- The failure is **silent to the user** — no error message, so a reporter would believe the site is simply unresponsive.
- Blocks suite 12 test cases TC-12-007 (and, transitively, any case needing a fresh investigation).

## Questions for the test lead
1. Was the button's workflow definition, or the definition itself, renamed on/after 2026-08-29?
2. Should the correct name be `investigation-process`, and is the misspelling `investigaton` the whole of the defect?
3. Independently of the workflow break — should the intake form be completable when opened directly, or is it
   intended to be reachable only with a workflow instance?
