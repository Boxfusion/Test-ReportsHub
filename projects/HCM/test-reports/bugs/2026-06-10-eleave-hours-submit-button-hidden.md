# Bug: eLeave — Submit button hidden on the Leave Application form when Duration = Hours (half-day)

- **Date:** 2026-06-10
- **Status:** ❌ OPEN — confirmed app defect (client-side render/state). Reproduces on the **published/Live** config and across multiple users. Workaround exists (refresh the draft).
- **Module:** HCM — SaGov Leave Application (eLeave)
- **Environment:** QA — https://pd-hcm-adminportal-qa.shesha.app/
- **Form / component:** `SaGov.Leave/sagov-leave-application` (v76) — the "New Leave Application" capture form
- **Severity:** High — blocks submission of all **hourly / half-day** leave applications on first capture
- **Category:** App business-logic / UI render defect (NOT a test-harness artifact — reproduced manually by the user too)

## Summary
On the SaGov Leave Application capture form, selecting **Duration = Hours** and completing every required field (Category, Sub-Category, Date, Start Time, End Time, Address, supporting document, certification checkbox) leaves the **Submit button hidden**. The button exists in the DOM but its wrapping `ant-form-item` has **`display: none`**, so only **Close** is shown and the application cannot be submitted. With **Duration = Days**, Submit renders normally and the application submits fine.

The Submit button's form-item visibility fails to recompute during the initial Hours-capture session. **Refreshing the page** (reloading the saved Draft) re-renders the form with Submit present (disabled); re-entering the **Address** and re-ticking the **certification checkbox** then enables Submit and the application can be submitted successfully.

## Expected
With Duration = Hours and all required fields valid, the **Submit** button is visible and enables once the certification checkbox is ticked — same as the Days flow.

## Actual
- Duration = Hours, all fields valid, cert ticked → footer shows **only "Close"**. All 4 `Submit` buttons in the DOM are `offsetParent === null`; the wrapping `div.ant-form-item` computes `display: none`.
- Duration = Days, same form → **Submit** appears next to Close and works (e.g. LA2026/12731 submitted earlier on the Days flow).

## Reproduction
1. Log in, open **Workflows → My Items → + Create New → SaGov Leave Application**.
2. Category = **Annual Leave**, Sub-Category = **Annual Leave**.
3. Duration = **Hours**.
4. Pick a **Date**, **Start Time**, **End Time** (e.g. 08:00–12:00 or 12:00–16:00).
5. Fill **Address**, upload a **supporting document**, tick the **certification** checkbox.
6. → **Submit button is not shown** (only Close). Application cannot be submitted.

### Workaround (confirmed)
7. **Refresh the browser** on the same draft URL (`/shesha/workflow-action?id=<id>&todoid=<todoid>`). The draft reloads with Date/Time/document intact; the **Submit** button now renders (disabled), and the **Address** + **cert checkbox** have reset.
8. Re-enter the **Address**, re-tick the **certification** checkbox → **Submit enables** → submits successfully.

## Evidence matrix — isolation (rules out user / balance / date / view-mode)
| User | Role / leave balance | View mode | Date | Duration | Submit on first capture |
|---|---|---|---|---|---|
| Thabo Musa Victor Mthembu (GOV003) | Intern, 54 days | Latest | 03 Jun (backdated) | **Days** | **visible → submitted (LA2026/12731)** |
| Thabo (GOV003) | Intern, 54 days | Latest | 04 Jun (backdated) | Hours | hidden |
| Thabo (GOV003) | Intern, 54 days | Latest | 17 Jun (future) | Hours | hidden |
| Kavitha Naidoo (GOV012) | Manager, no balance | Latest | 17 Jun | Hours | hidden |
| **Test_User1 / Tiyiselani Makhuvele** | Employee, **29 days** | **Live (published)** | **10 Jun (today)** | Hours | **hidden → after refresh workaround, submitted (LA2026/12755)** |
| Test_User1 / Tiyiselani Makhuvele | Employee, 28.5 days | Live (published) | **04 Jun (backdated)** | Hours | **hidden (no refresh)** — LA2026/12777; confirms backdating doesn't change it |

Conclusions from the matrix:
- **Not user-specific** (intern, manager, and regular employee all affected).
- **Not leave-balance-related** (Thabo had 54 days and Tiyiselani 29 days; both blocked).
- **Not date-related** (backdated 4th, future 17th, and same-day 10th all blocked; Days on the backdated 3rd worked).
- **Not Latest-only** — reproduced on **Live/published** config for a regular employee (Test_User1 has no view-mode toggle, so was on Live).
- **Duration = Hours is the trigger.** Days works.

## Root-cause pointer (client-side)
The Submit button (`button.ant-btn-primary.sha-toolbar-btn`, label "Submit") is rendered but its ancestor `div.ant-form-item` has computed `display: none` during the initial Hours-capture session. Chain (from DOM inspection): `button → div.ant-form-item-control-input-content → … → div.ant-form-item [display:none]`. A page reload of the draft recomputes the visibility correctly (Submit then present). Strongly suggests a **stale visibility/condition evaluation** on the Submit toolbar item that isn't re-run when the Duration=Hours branch swaps the date controls for Date/Start Time/End Time.

## Related observation (separate, minor — not this bug)
The duration helper text miscalculates the **08:00–12:00** window as **"3.9833333333333334 hours off"** (≈239 min) instead of 4 hours, while **12:00–16:00** correctly reads **"4 hours off"**. Consistent across users for the 08:00–12:00 slot. Possible precision/rounding issue in the hours calculation — worth a separate look; does not block submission.

## Evidence
- Screenshot: `projects/HCM/.playwright-mcp/eleave-hours-LA2026-12755-submitted.png` (Test_User1's 4-hour Annual Leave, LA2026/12755, In Progress after the refresh workaround).
- DOM check (Playwright `browser_evaluate`): all four "Submit" buttons `offsetParent: null` pre-refresh; wrapping `ant-form-item` `display:none`. Post-refresh: one Submit `visible:true` (disabled→enabled after cert).
- Successfully submitted via workaround: **LA2026/12755 — "4 hours Annual Leave by T Makhuvele from Wed 10 Jun 26 to Wed 10 Jun 26" — In Progress**.

## Notes
- Investigated live via Playwright MCP **and** confirmed manually by the user (Submit hidden until refresh).
- The earlier "leaveTo/leaveFrom not valid" validation error was a separate, self-inflicted artifact from toggling Duration Hours↔Days on one contaminated form — not part of this defect; a clean Hours form does not produce it.
