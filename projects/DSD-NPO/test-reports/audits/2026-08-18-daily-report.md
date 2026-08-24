# DSD-NPO — Daily QA Report · 2026-08-18

**QA:** Nomfanelo Nhleko · **Environment:** QA
**Shareable version (Teams):** https://claude.ai/code/artifact/365b5b42-33a2-41dd-8ffa-866eca79797d

## Progress
| Module | New scripts (today) | Overall functional progress |
|---|---|---|
| DSD-NPO | 15 functional test plans authored/updated; 14 suites executed; **Education & Awareness area completed end-to-end** (public + admin) | **131 / 314 executed (~42%)** · 224 imported · smoke **68/70** |

## Suites executed today
- **15C** E&A Dashboard & Analytics — ✅ pass 4/4 (engagement counts + drill-down correct)
- **15E** E&A public Library/FAQ/Contact — 2 fail (enquiry submit broken; no Like; FAQ empty)
- **15B** E&A library content lifecycle (admin) — create pass; content upload disabled (blocker)
- **15A** E&A Interventions (admin) — index/form/discard pass; create blocked (District list empty)
- **12** Investigations (public+admin) — public intake creates no case; admin lifecycle blocked
- **14D** Document/PDF — no QR / `/verify` 404; cert-visual deferred
- **14W** Accessibility — 4 fail (labels, contrast, live regions)
- **14Z** Security — **not QA scope**; code/security review, for the dev & security team (not QA to action)
- **07** Triage & doc verification — 5 pass, 3 fail
- **13** Voluntary deregistration (submitter) — 3 pass; admin deferred
- **01/02/03/05/10** Auth, linking, wizard, post-registration — core paths run; OTP/role cases deferred

Per-run detail and evidence are in `test-reports/2026-08-18/`; the running skipped/blocked register keeps the full 314 accounted for.
