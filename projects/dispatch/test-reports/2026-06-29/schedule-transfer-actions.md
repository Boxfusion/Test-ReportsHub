# Report: NC Dispatch — Schedule Transfer (3.3) record actions, live MCP run

**Date:** 2026-06-29
**ADO:** plan #65099 — suite **3.3 Schedule Transfer** (#65163), Call Taking Functions
**Plan/Spec:** n/a — driven live via Playwright MCP (headed); no `.spec.ts` recorded yet
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED
**Summary:** the 6 previously-skipped record actions (TC-06…TC-11) were each driven live and confirmed by API 200 + observed state change.
**Environment:** QA — https://ncdoh-dispatcher-adminportal-qa.shesha.app/
**Login:** Call Taker `autotestcalltaker`

## Goal
Turn the 6 skipped Schedule-Transfer action TCs green by exercising each record action live (Edit Patient, Edit, Clone, Merge, Close, Cancel). The 2026-06-25 run had created the scheduled transfer (REF:20266/000593) and confirmed the action buttons were *present*; this run actually *exercises* them.

## How the actions are reached (harness)
The Edit / Cancel / Close / Clone / Merge actions live on the **incidents-dashboard incident detail panel**, not the read-only `view-incident-details` admin page. To reach it under automation:
1. Search the dashboard for the ref (e.g. `000593`); the incident card renders in `.incident-list` at **negative x** (behind the collapsed Shesha sidebar).
2. Neutralise `pointer-events` on `.mapboxgl-map, aside, .sidebar-container, .complementary`, then **activate the card** (id = incident GUID) with a synthetic `pointerdown→mousedown→pointerup→mouseup→click` sequence.
3. The detail panel opens with the action row (`Edit | Cancel | Close | Clone | Merge`) at on-screen positive coords; clicks still hit the `.sha-components-container-inner` overlay, so each action button is also clicked via the synthetic sequence.
4. The **Merge Incidents** button is a **hover-reveal** action inside the candidate card's `incident-card-btns-container` (`display:none` until `:hover`, which can't be triggered synthetically) — force its display visible, then synthetic-click.

Records were created/reused this run: **593** (the real scheduled transfer, from 2026-06-25), **600** (clone of 593), **601** (clone of 600).

## Step results (mapped to ADO 3.3)
| TC | Action | Target | Endpoint | Result |
|----|--------|--------|----------|--------|
| **TC-06** (#65982) Edit patient details | Save Patient via patient-create-edit-form | 593 | `POST EmsIncidentPerson/Crud/Create` | **200** — patient "QA Transfer Patient250629" persisted; patient sub-tabs (Primary/Secondary Survey…) rendered |
| **TC-07** (#65983) Edit transfer details | Edit → set Incident Notes + Landmark → Save Incident | 593 | `PUT EmsIncidentActions/UpdateIncident` | **200** — values persisted (carried into the later clone, confirming write) |
| **TC-09** (#65985) Clone transfer | Clone → confirm "Clone Incident" | 593 → **600** | `POST EmsIncidentActions/CloneIncident` | **200** — new incident REF:20266/000600 (`isCloned:true`, status New, fields copied) |
| **TC-11** (#65987) Merge transfers | Merge → pick closest-duplicate → Merge Incidents | 593 + **592** | `GetIncidentPossibleMerges` 200 → `PUT EmsIncidentActions/MergeIncident` | **200** — `isMerged:true`, `mergedNote` set |
| **TC-10** (#65986) Close transfer | Close → confirm "Yes" | **600** | `PUT EmsIncidentActions/CloseIncident` | **200** — status → **Closed** (itemValue 4), `dateClosed` set, marker `closed.svg` |
| **TC-08** (#65984) Cancel transfer | Cancel → confirm "Yes" | **601** | `PUT EmsIncidentActions/CancelIncident` | **200** — status → **Cancelled** (itemValue 5), marker `cancelled.svg` |

### TC-12 — RESOLVED (not a bug)
The 2026-06-25 "doesn't appear in Upcoming Transfers" finding was **resolved on 2026-06-29**: the **Upcoming Transfers grid is a time-window view**. A scheduled transfer whose date **+ time** is **more than ~1 hour ahead** *does* appear; one due within the next hour (or effectively "now") is **intentionally excluded**. Our earlier transfers didn't show because they were captured with a near/now time — the **Transfer Date field is a date+TIME picker** (confirmed this run: the picker has a time panel and a "Now / OK" footer), and a date-only / start-of-day value falls in the excluded window. Confirmed by manual verification on the team side. **ADO TC-12 passes when the transfer is scheduled >1h out** — flipped failed → passed.

> Attempted a fresh automated re-drive to capture our own evidence (opened **NEW → Scheduled Transfer**, set Transfer Date = today + 3h = 29/06/2026 14:53, filled caller/pickup). Did **not** complete the save: the **Google-Places Address autocomplete** and the **Shesha AntD ref-list selects** on this dashboard form are not reliably automatable (transient suggestion portal; real clicks intercepted by the form, synthetic select-opens don't hold) — the same harness limitation that makes this the hardest flow in the app. Verification therefore rests on the manual confirmation above, not a fresh automated run.

### Still not exercised
- **TC-04 (#65980) Specify location manually (move map pin)** — left **skipped** (justified): map-pin drag is non-deterministic headless; location is set via the Google Places address field instead.

## Findings (this run)
1. **Merge cancels the merged duplicate.** Merging 593 with its closest duplicate (592) left **593 → Status "Cancelled"** with `isMerged:true`. So a merge consumes the incident you merge *from*. Worth confirming the intended survivor semantics with the team.
2. **Self-referential merge note (cosmetic).** On the merged incident the note reads *"Merged Incident: This incident has been merged with Incident 20266/000593"* — i.e. it references its **own** ref rather than the surviving ref. Minor display issue.
3. **Clone of a scheduled transfer is a plain incident.** The clone (600) came back with `isScheduleTransfer:false` / `scheduleDate:null` — the clone does not carry the scheduled-transfer flag forward. Flag for team (expected?).
4. The **Merge candidate list** only offered the closest geographic duplicate (592), not our freshly-created clone (600); merge candidates appear to be proximity-derived, not a free incident search.

## Allure
Suite **Call Taking Functions → Schedule Transfer (3.3)** updated to **11 passed / 1 skipped (TC-04 map-pin) / 0 failed** (was 4/7/1; TC-06…TC-11 driven live this run, TC-12 resolved). Single-file report regenerated at `allure-report/index.html`.

## Not done (deliberately)
- **Not pushed/committed.** Per standing note, the dispatch report look-and-feel cleanup is still pending and the Dispatch PR has an unresolved merge conflict — hold the push until those are addressed.
