# Report: Agents — Add New Call Taker + Dispatcher (Management CRUD)

**Date:** 2026-07-06 11:22 UTC
**Plan:** (ad-hoc live run — no paired plan yet) Management → Agents → Add New
**Spec:** n/a
**Execution Mode:** live-mcp (Playwright MCP, manual drive)
**Result:** PASSED
**Duration:** ~3 min

## Environment
| Key | Value |
|-----|-------|
| App | PD-Dispatch (Dispatcher Admin Portal — master/PD site) |
| URL | https://pd-dispatcher-v2-adminportal-qa.shesha.app |
| Environment | QA |
| User | Admin (System Administrator) |
| View mode | Latest |
| Admin table | `/dynamic/Boxfusion.Dispatcher/agent-roles-table` (form `create-agent-roles v16`) |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 2 | 2 | 0 | 0 |

Created **2 Agents** — one **Call Taker** and one **Dispatcher**. Both verified persisted via table search.

## Step Results

### TC-01 — Create Call Taker
**Mode:** live-mcp
- [PASS] Name = **QA Call Taker**; Surname = **Test**; Mobile = **0821111111**; Email = **qa.calltaker@test.com**; Username = **QACallTaker**.
- [PASS] Roles = **Call Taker**; Dispatch Area = **City of Mbombela Local Municipality**; Password/Verify = Password@1.
- [PASS] Saved; confirmed via search. ID `154f1751-b490-420a-b206-1efa20ead73e`.

### TC-02 — Create Dispatcher
**Mode:** live-mcp
- [PASS] Name = **QA Dispatcher**; Surname = **Test**; Mobile = **0822222222**; Email = **qa.dispatcher@test.com**; Username = **QADispatcher**.
- [PASS] Roles = **Dispatcher**; Dispatch Area = **City of Mbombela Local Municipality**; Password/Verify = Password@1.
- [PASS] Saved; confirmed via search. ID `f81dbdbf-6295-4afa-aeb4-8d75797069a0`.

## Notes / Observations
- Form `create-agent-roles v16` fields (all required*): Name, Surname, Mobile Number, Email Address, Username, Roles (multi-select combobox: Call Taker/Dispatcher/Management/Response Team/System Administrator), Dispatch Area (combobox of municipalities/districts), Password, Verify Password.
- ⚠️ **Username pre-fills with the logged-in user's name ("Admin"), and on the second Add-New it retained the previous entry ("QACallTaker") — always overwrite it with a unique username or it will clash.**
- **Password** pre-fills with `Password@1`; Verify Password must be typed to match.
- **Agents have NO Station field** — they use **Dispatch Area** instead. The "choose the Station you created" instruction applied to the Vehicle form (done there); for agents, Dispatch Area = City of Mbombela (the station's municipality) was used.
- After OK the grid's total-count display can lag / not show the new row on page 1 — confirm via search rather than the visible count.

## Test Data Created (cleanup candidates)
`QA Call Taker` (QACallTaker) and `QA Dispatcher` (QADispatcher).
