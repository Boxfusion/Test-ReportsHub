# Report: Future-Dated Delegation Is Blocked Today — E2E Verification

Date: 2026-06-15
Plan: eLeave delegation — negative/timing check (future-dated delegation grants no access yet)
Spec: none — live MCP-driven
Execution Mode: mcp-live
Result: PASS
Duration: ~2 min

App: HCM SaGov — `https://pd-hcm-adminportal-qa.shesha.app/`
Delegator: Thabo Musa Victor Mthembu (GOV003)
Delegate tested: Andrew Smith (GOV005)
Delegation under test: **Thabo → Andrew Smith, 30/06/2026** (future-dated; today is 15/06/2026)

## Summary

| Total | Passed | Failed | Skipped |
|-------|--------|--------|---------|
| 1     | 1      | 0      | 0       |

## Step Results

### TC-01: Future-dated delegate has no access today
- [PASS] Logged in as **Andrew Smith** (GOV005)
- [PASS] Opened the user menu → entries are only: **My Profile**, **Andrew Smith – Business Analyst** (his own appointment), **Logout**
- [PASS] **No "Thabo Musa Victor Mthembu" delegated appointment** is present — confirming the 30/06 delegation grants no switchable identity / access today

## Contrast (control)

- **Active window** (Kavitha, 14→17 June): her menu DID show the switchable "Thabo Musa Victor Mthembu – Infra Intern" identity and she could act on Thabo's items (see `delegate-can-act-on-delegators-items-e2e.md`).
- **Future window** (Andrew, 30/06): no identity, no access today.

## Conclusion

Delegated access is gated by the delegation's **date window**, not just the existence of the delegation record. A future-dated delegation is correctly dormant until its start date — verified the delegate sees no delegated identity and therefore cannot act on the delegator's items today.

## Notes
- Browser closed after the check.
