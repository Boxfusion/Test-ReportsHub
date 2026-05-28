# Test Execution Rules

> **Multi-project hub note.** All `scripts/...` commands in this file refer to scripts at the **hub root** (two levels up from this file). The hub already provides `scripts/build-project-dashboard.js` (project-aware). Run commands from the hub root, passing this project's plan path explicitly, e.g.:
> ```
> node scripts/run-plan.js projects/dep/test-plans/<folder>/<plan>.md
> node scripts/build-project-dashboard.js --project=dep
> ```

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
Reports saved to `test-reports/YYYY-MM-DD/<plan-name>.md` (relative to the project root, i.e. `projects/dep/test-reports/...`):
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

## 6. Dashboard Update
After every test run, regenerate the project dashboard (from hub root):
```bash
node scripts/build-project-dashboard.js --project=dep
```
The dashboard (`projects/dep/index.html`) is auto-generated from every plan in this project's `test-plans/` and every report under `test-reports/`. **Never hand-edit it.**

## 7. Allure Report Generation
After every test run, regenerate the per-project Allure report (from hub root):
```bash
rm -rf projects/dep/allure-results
node scripts/generate-allure-results.js --project=dep
npx allure generate projects/dep/allure-results --clean -o projects/dep/allure-report
```

## 8. Hybrid Execution Model (Playwright-first, AI-repair fallback)

Every plan has a paired `.spec.ts` beside it (`test-plans/<folder>/<name>.spec.ts`). The plan is canonical; the spec is a derived, self-healing artefact.

### Scaffold conventions
Specs are written by `/CreateTest` using `@playwright/test`. Selectors are **captured live** via MCP browser recording at create time. Each TC becomes one `test()` block; each plan step becomes a labelled section:
```ts
// STEP 3: TYPE username field with `admin`
await page.getByRole('textbox', { name: 'Username' }).fill('admin');
```
Markers and their meaning:
- `// STEP N: <verbatim step text>` — maps the spec line back to plan step N. Required on every action.
- `// TODO[selector]: <hint>` — appears **only** when MCP recording couldn't locate the element after 2 retries; AI-repair resolves it on first run.
- `// TODO[assertion]: <hint>` — same, for non-trivial `expect(...)` calls.
- `// FRAGILE: <reason>` — appears when only a 3-level CSS chain matched.

### Execution flow
1. `node scripts/run-plan.js projects/dep/test-plans/<folder>/<plan>.md` — runs Playwright, emits a JSON summary.
2. If `status === "no-spec"` → Claude scaffolds the spec from the plan, then re-invokes the runner.
3. If `status === "passed"` → report is already written; proceed to Allure.
4. If any test failed → for each failure: replay via MCP, snapshot, resolve real selector, **edit only the failing line** in the .spec.ts, re-run that single test with `--grep "TC-NN" --no-report`. Up to 2 repair attempts per failing test.
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
