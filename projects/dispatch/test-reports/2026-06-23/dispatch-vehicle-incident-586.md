# Report: NC Dispatch — Full Incident → Dispatch chain (live, headed)

**Date:** 2026-06-23 12:30 UTC
**Plan:** test-plans/operational/incident-creation.md (TC-01 + dispatch leg)
**Spec:** n/a — driven live via Playwright MCP (headed)
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED
**Summary:** incident created, owned, vehicle dispatched, and full status lifecycle driven to Released
**Environment:** QA — https://ncdoh-dispatcher-adminportal-qa.shesha.app/

## Scenario
End-to-end emergency flow using **records we created**: a Call Taker logs an incident, a Dispatcher takes ownership and dispatches an on-shift vehicle to it.

- **Incident:** **REF:20266/000586** (Broken Leg · P2-Amber · Kimberley Hospital)
- **Dispatched resource:** **AUTO TEST NC** (vehicle type *Auto Test Ambulance*) · Responder **Auto Test Resource** · status **CREW INFORMED**

## Step results
- [PASS] Login as Call Taker **`autotestcalltaker`** / 123qwe → **NEW enabled** (CCP Offline) → created incident **REF:20266/000586**
- [PASS] Login as Dispatcher **`qaagent2306`** / 123qwe → open incident 586
- [PASS] **Take Ownership** (initial → red danger confirm) → incident owned by *Auto QA Agent 2306*, view flips to dispatch/edit
- [PASS] **Available Resources** now lists **AUTO TEST NC / Auto Test Ambulance — AVAILABLE** (crew incl. our **QA-CREW-2306**), once the AUTO TEST NC shift assignment was set to **today (23/06/2026, 08:00–17:00, Auto Test Station)**
- [PASS] (BLOCKING) Click **DISPATCH** → panel flips to **Allocated Resources**; AUTO TEST NC status **CREW INFORMED**, *Assigned to Auto Test Resource*; incident status **NEW → OPEN**

## Dispatch status lifecycle (Update Dispatch Status → Time "Now" → Status → Update)
Each transition was stamped with the picker's **"Now"** time and committed; the resource card label updated live each time, finally moving from *Allocated Resources* to *Previously Allocated Resources* on Released.

| # | Status | Time stamped |
|---|---|---|
| 1 | Crew Informed | 2026-06-23 14:35 |
| 2 | Accepted | 2026-06-23 14:36 |
| 3 | Mobile To Scene | 2026-06-23 14:37 |
| 4 | On Scene | 2026-06-23 14:38 |
| 5 | Mobile From Scene | 2026-06-23 14:39 |
| 6 | At Hospital | 2026-06-23 14:40 |
| 7 | Released | 2026-06-23 14:41 |

- Status options offered: Crew Informed, Accepted, Mobile To Scene, Mobile From Scene, On Scene, At Hospital, Released, Cancelled, Redirected.
- The **Time** field is an AntD date-time picker; its **"Now"** link sets the current timestamp and closes the popup in one click (don't press Escape — it closes the whole modal).
- (Times display in the app's +2 timezone, i.e. 14:35 = the 12:35 UTC run time.)

## Close & Reopen
- Setting the resource status to **Released** **auto-closed the incident** — 586 dropped off the active dashboard list and showed status **CLOSED** (found via the incident search box).
- The incident detail exposes a **Reopen** button. Clicking it **reopened 586 (CLOSED → OPEN)** with no confirmation prompt; the resource panel reverted from *Previously Allocated Resources* back to **Allocated Resources** (AUTO TEST NC, still Released, with Update/Cancel/Redirect actions live again). **Reopen works.**
- Re-closing via the detail **Close** button prompts a confirm — *"Close Incident — Are you sure you want to close this incident?"* (**No / Yes**) — and **Yes** set 586 back to **CLOSED**. So the explicit **Close** action is gated by a confirm dialog, unlike the implicit auto-close on Released.

## Key finding — the real dispatch gate is the *shift assignment*, not telephony or the account
Earlier attempts showed **"There are currently no resources"** for every vehicle type. Root cause: **no resource was on an active shift today** — the only assignment was dated 17/06/2026. Once the **AUTO TEST NC** shift assignment was edited to **today's date** (within the 08:00–17:00 window), the vehicle immediately appeared as an **Available Resource** and dispatched successfully — **with the CCP still "Offline"**. So:
- Dispatch availability depends on a **current, active shift assignment** (date + time window), **not** on Amazon Connect/telephony being online.
- The earlier disabled-**NEW** button was **specific to `qaagent2306`** (it had been given a Dispatcher role + Station); the clean Call Taker `autotestcalltaker` creates incidents fine. There is nothing wrong with `qaagent2306` as a *dispatcher*.

## Notes
- Used our own records throughout: Call Taker `autotestcalltaker`, Dispatcher `qaagent2306`, our crew **QA-CREW-2306** among the AUTO TEST NC crew, and Call Type **Broken Leg**.
- Login footgun: the Username field pre-fills/duplicates (`qaagent2306qaagent2306`) — cleared the field before typing each login.
- **Take Ownership requires a double confirm** (button → red danger confirm).
- Allocated-resource lifecycle actions now available on the incident: **Update Dispatch Status** (En Route → On Scene → …), **Cancel Assignment**, **Redirect** — not exercised in this run.
- Vehicle dispatched is **AUTO TEST NC** (type *Auto Test Ambulance*); the AUTO TEST NC shift assignment was edited to today by the user before this run.
