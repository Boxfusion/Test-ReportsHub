# Test Execution Rules

> **Multi-project hub note.** All `scripts/...` commands in this file refer to scripts at the **hub root** (two levels up from this file). Run commands from the hub root, passing this project's plan path explicitly, e.g.:
> ```
> node scripts/run-plan.js projects/PD-CRM/test-plans/<folder>/<plan>.md
> node scripts/build-project-data.js --project=PD-CRM
> ```
> ⚠️ **`build-project-dashboard.js` is RETIRED — do not run it.** It pre-renders a ~63 KB static `index.html`
> that overwrites the thin shell, and because `build-project-data.js` only writes the shell **if missing**, a
> stale pre-rendered page never heals. The canonical pipeline is `build-project-data.js` (per project) →
> `build-hub-data.js`, or `node scripts/build-all.js` for everything at once, **plus
> `node scripts/build-landing.js`** — `build-all.js` does not regenerate the root landing page.

> ⚠️ **Always run headed.** Set `HEADED=1` before `run-plan.js` (the hub's `playwright.config.ts` reads it at
> `use.headless`). Ad-hoc exploration scripts must launch with `{ headless: false }`. Headless is for CI only.

## 1. Step Execution Model

| Prefix | Meaning |
|--------|---------|
| `NAVIGATE` | Go to a URL |
| `CLICK` | Click an element |
| `TYPE` | Type text into a field |
| `SELECT` | Choose a dropdown option |
| `WAIT` | Wait for a condition |
| `SNAPSHOT` | Take an accessibility snapshot |
| `ASSERT` | Verify something — must produce PASS or FAIL |
| `API` | Make an HTTP request |
| `EXTRACT` | Pull a value from the page or API response |

## 2. Snapshot Rule
Before every CLICK or TYPE, take a snapshot to confirm the element exists. If not found after two attempts, mark FAILED.

## 3. Assertion Rules
- Every ASSERT appears in the report as `[PASS]` or `[FAIL]`
- Include the actual value observed next to every assertion
- A `(BLOCKING)` assertion failure stops the entire test

## 4. Report Format
Reports saved to `test-reports/YYYY-MM-DD/<plan-name>.md` (relative to the project root, i.e. `projects/PD-CRM/test-reports/...`):
```
# Report: <Plan Title>
**Date:** YYYY-MM-DD HH:MM UTC
**Plan:** test-plans/<folder>/<filename>.md
**Spec:** test-plans/<folder>/<filename>.spec.ts
**Execution Mode:** playwright-script | ai-repair | hybrid
**Result:** PASSED | FAILED | PARTIAL
**Duration:** Xs

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|

## Step Results
### TC-NN — <Title>
**Mode:** playwright-script | ai-repair (patched <step>)
**Duration:** Xs
- [PASS] / [PASS (repaired)] / [FAIL] <assertion or step summary>
```

## 5. Pass / Fail Criteria
- **PASSED** — all assertions pass
- **FAILED** — one or more `(BLOCKING)` assertions fail, OR >50% fail
- **PARTIAL** — some non-blocking assertions fail but majority pass
- **BLOCKED** — the flow could not be driven to a conclusion

### 5.1 Report front-matter is machine-read — two rules
The dashboard parses each report's front-matter. Break either rule and the run silently vanishes from the
dashboard instead of erroring.

1. **`**Result:**` MUST begin with one bare status token** from the list above. The builder's `normStatus()`
   matches `/PASSED|FAILED|PARTIAL|SKIPPED|BLOCKED/`; anything else (`PASS`, `MIXED`, `✅ NO DEFECTS`, a leading
   emoji or `~~strikethrough~~`) falls through to `UNKNOWN`, renders grey and **counts as a non-pass**. Put the
   prose after the token: `**Result:** PARTIAL — happy path proven except the final step, blocked by a 500`.
   ⚠️ **`PASS` is not `PASSED`** — the regex needs the full token.
2. **`**Plan:**` MUST be the bare plan path, nothing else.** Runs are indexed by that exact string, so
   `…/<plan>.md (TC-20)` creates a *phantom flow* — the run detaches from its real plan and inflates the flow
   counts. Put the case list on a separate **`**Cases:**`** line instead.

Report filenames follow the same convention `run-plan.js` generates:
`test-reports/<YYYY-MM-DD>/<plan-basename>--<label>.md`. A document that is **not a test run** (an audit, a
consistency pass) does **not** belong in a dated folder — it will be counted as a run with an `UNKNOWN` result
and, if it is the newest file, it will define the whole flow's status. Put those under `test-reports/audits/`.
Narrative documents belong outside `test-reports/` entirely — keep them in `observations/` and `daily-reports/`.

## 6. Dashboard Update
After every test run, regenerate the project dashboard (from hub root):
```bash
node scripts/build-project-data.js --project=PD-CRM
```
The dashboard (`projects/PD-CRM/index.html`) is auto-generated from every plan in this project's `test-plans/` and every report under `test-reports/`. **Never hand-edit it.**

## 7. Allure Report Generation
After every test run, regenerate the per-project Allure report (from hub root):
```bash
rm -rf projects/PD-CRM/allure-results
node scripts/generate-allure-results.js --project=PD-CRM
npx allure generate projects/PD-CRM/allure-results --clean -o projects/PD-CRM/allure-report
```
⚠️ On this machine `npx` is broken (`ComSpec` misconfigured). Either prefix with
`$env:ComSpec="C:\Windows\System32\cmd.exe";` or call the binary directly via `node`.

## 8. Hybrid Execution Model (Playwright-first, AI-repair fallback)

Every plan has a paired `.spec.ts` beside it (`test-plans/<folder>/<name>.spec.ts`). The plan is canonical; the spec is a derived, self-healing artefact.

### Scaffold conventions
Specs are written by `/CreateTest` using `@playwright/test`. Selectors are **captured live** at create time. Each TC becomes one `test()` block; each plan step becomes a labelled section:
```ts
// STEP 3: TYPE username field with `Admin`
await page.getByPlaceholder('Username').fill('Admin');
```
Markers and their meaning:
- `// STEP N: <verbatim step text>` — maps the spec line back to plan step N. Required on every action.
- `// TODO[selector]: <hint>` — appears **only** when recording couldn't locate the element after 2 retries; AI-repair resolves it on first run.
- `// TODO[assertion]: <hint>` — same, for non-trivial `expect(...)` calls.
- `// FRAGILE: <reason>` — appears when only a 3-level CSS chain matched.

### Execution flow
1. `node scripts/run-plan.js projects/PD-CRM/test-plans/<folder>/<plan>.md` — runs Playwright, emits a JSON summary.
2. If `status === "no-spec"` → Claude scaffolds the spec from the plan, then re-invokes the runner.
3. If `status === "passed"` → report is already written; proceed to Allure.
4. If any test failed → for each failure: replay in the browser, snapshot, resolve real selector, **edit only the failing line** in the .spec.ts, re-run that single test with `--grep "TC-NN" --no-report`. Up to 2 repair attempts per failing test.
5. After repairs settle, run the full plan once more to write the final report, then run Allure.

### Repair logging
- Each test that succeeded only after repair is reported as `**Mode:** ai-repair (patched STEP N)`.
- Each repaired line should still match its `// STEP N:` comment so the diff is auditable.

### When to regenerate vs repair
| Situation | Action |
|---|---|
| One selector drifted | AI-repair patches that line only |
| New step added to the .md plan | Regenerate the scaffold for that TC |
| Whole page restructured | Regenerate the spec; AI-repair re-anchors selectors on next run |

## 9. App-specific notes (PD-CRM / Shesha)
- This is a **Shesha dynamic-form** app. Routes are `/dynamic/<Module>/<view>` and pages render asynchronously —
  prefer `waitForLoadState('networkidle')` plus an explicit `expect(...).toBeVisible()` anchor over fixed sleeps.
- Login: username `input[placeholder="Username"]`, password `input[type="password"]`, submit `button:has-text("Sign In")`.
  Credentials are `Admin / P@ssword1` — **not** the legacy `admin / 123qwe` used by `projects/dep/`.
- After login the app lands on `/dynamic/Boxfusion.ServiceManagement/service-requests` (the Cases list), not a dashboard.
  Assert against that route rather than a generic "dashboard is visible".
