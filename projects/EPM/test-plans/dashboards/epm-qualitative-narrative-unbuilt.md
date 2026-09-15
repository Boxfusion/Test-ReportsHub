# EPM — Qualitative KPI narrative

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109535 — *34 · Qualitative KPI narrative*
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app` / API
**Login:** admin.PrincessH (data checks), stage1 / 123qwe (live form check)

## TC-108804 / TC-108890 / TC-108891 / TC-108892 — all confirmed unbuilt, one shared root cause

**ADO IDs:** 108804 (Positive), 108890 (Negative), 108891 (Edge), 108892 (Integration)

### Preconditions / Steps (ADO literal, summarized)
- TC-108804: a Qualitative KPI's narrative field should capture Achieved/Not Achieved/Partially Achieved
  outcomes, with numeric Target/Actual remaining null.
- TC-108890: submitting a Qualitative KPI with an empty Achievements narrative should be rejected.
- TC-108891: multi-paragraph rich text in Achievements should persist with formatting intact.
- TC-108892: the narrative should render read-only across Stage 2-6 review forms and preview
  (truncated, click-to-expand) on a dashboard tile.

### Result — CONFIRMED UNBUILT, checked at the data layer first

1. A real `achievements` field exists on `ComponentProgressReport` (confirmed via a full field dump).
   Sampled all 1000 real CPR records tenant-wide: **zero** have ever had this field populated, by any
   real workflow submission, ever.
2. A `ComponentDefinition` literally named `"Qualitative"` exists (`methodOfCalculation`: "Qualitative:
   measured by narrative report") but has **zero** live Components linked to it — an orphaned scaffold,
   never configured into a usable KPI.
3. Live-drove the Stage 1 Capture form for a real KPI whose `methodOfCalculation` text says
   "Qualitative" (`CPR2026/0888`, "Human Settlements Grants Frameworks Approved"): the form is
   **identical** to a normal quantitative KPI — real numeric Quarter Target (100), a required numeric
   Actual Target input, the standard 3-value Achievement Status radio (no "Partially Achieved" — that
   reflist value doesn't exist at all, per [[epm-performance-dashboard-page-does-not-exist]]). No
   "Achievements" text anywhere on the page.

**Conclusion:** the `achievements` field was scaffolded on the entity but never wired into any UI form,
never used in any real submission, and there is no way to configure a KPI that actually exercises it.
All 4 cases share this one root cause — none can be exercised through any UI, and there's no live data
anywhere to fall back on either.

### Unique inputs
| Field | Value |
|---|---|
| Entity field checked | `ComponentProgressReport.achievements` |
| Real CPR records sampled | 1000 (tenant-wide) |
| Orphaned ComponentDefinition | `af68978f-0473-44cf-af3e-8d07310a2c17` ("Qualitative") |
| Fixture used for live form check | `CPR2026/0888`, `cprId=b70a5484-7acc-41a4-82fa-1b21560c7077` |

### Notes
- Read-only for the data-layer checks; the live form check did not submit or mutate anything.
- Same "field exists, zero UI surface" pattern as
  [[epm-audit-trail-write-path-clean-no-before-after-fields]] and [[epm-component-qa-config-no-ui]].
- Closes out suite 109535 in full, and with it the entire "Dashboards & Calculations" batch (suites
  109535, 109536, 109537 remainder) requested this session.
