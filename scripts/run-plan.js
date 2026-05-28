#!/usr/bin/env node
/**
 * Multi-project Playwright runner for the hub.
 *
 * Resolves the project slug from the plan path (projects/<slug>/test-plans/...).
 * Runs Playwright with HUB_PROJECT=<slug> so playwright.config.ts writes JSON/JUnit/Allure
 * outputs inside projects/<slug>/. Writes the markdown report to projects/<slug>/test-reports/.
 *
 * Usage (from hub root):
 *   node scripts/run-plan.js projects/dispatcher/test-plans/service-requests/create-service-request.md
 *   node scripts/run-plan.js <plan.md> --check
 *   node scripts/run-plan.js <plan.md> --grep "TC-02"
 *   node scripts/run-plan.js <plan.md> --no-report
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const HUB_ROOT = path.resolve(__dirname, '..');

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function utcStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

function emit(payload) {
  process.stdout.write(JSON.stringify(payload, null, 2) + '\n');
}

function fail(msg, extra = {}) {
  emit({ status: 'error', error: msg, ...extra });
  process.exit(2);
}

function resolveProjectSlug(planAbs) {
  const rel = path.relative(HUB_ROOT, planAbs).replace(/\\/g, '/');
  const m = rel.match(/^projects\/([^/]+)\//);
  if (!m) fail(`Plan must live under projects/<slug>/test-plans/... — got: ${rel}`);
  return { slug: m[1], projectRoot: path.join(HUB_ROOT, 'projects', m[1]), planRel: rel };
}

function resolveSpec(planAbs) {
  if (!fs.existsSync(planAbs)) fail(`Plan not found: ${planAbs}`);
  if (!planAbs.endsWith('.md')) fail(`Plan must be a .md file: ${planAbs}`);
  return planAbs.replace(/\.md$/, '.spec.ts');
}

function parseArgs(argv) {
  const opts = { plan: null, check: false, grep: null, noReport: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--check') opts.check = true;
    else if (a === '--no-report') opts.noReport = true;
    else if (a === '--grep') opts.grep = argv[++i];
    else if (!opts.plan) opts.plan = a;
  }
  if (!opts.plan) fail('Usage: run-plan.js <plan.md> [--check] [--grep <pattern>] [--no-report]');
  return opts;
}

function runPlaywright(specPath, slug, grep) {
  const specArg = path.relative(HUB_ROOT, specPath).replace(/\\/g, '/');
  const args = ['playwright', 'test', specArg, '--reporter=json,list,allure-playwright'];
  if (grep) { args.push('-g', grep); }
  const resultsJson = path.join(HUB_ROOT, 'projects', slug, 'test-results', 'results.json');
  if (fs.existsSync(resultsJson)) fs.unlinkSync(resultsJson);
  const res = spawnSync('npx', args, {
    cwd: HUB_ROOT,
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      HUB_PROJECT: slug,
      PLAYWRIGHT_JSON_OUTPUT_NAME: resultsJson,
    },
  });
  return { exitCode: res.status ?? 1 };
}

function flattenSuites(suites, acc = []) {
  for (const s of suites || []) {
    if (Array.isArray(s.specs)) {
      for (const spec of s.specs) {
        for (const test of spec.tests || []) {
          for (const result of test.results || []) {
            acc.push({ title: spec.title, file: spec.file, line: spec.line, result });
          }
        }
      }
    }
    if (Array.isArray(s.suites)) flattenSuites(s.suites, acc);
  }
  return acc;
}

function summariseResults(slug) {
  const resultsJson = path.join(HUB_ROOT, 'projects', slug, 'test-results', 'results.json');
  if (!fs.existsSync(resultsJson)) {
    return { tests: [], passed: 0, failed: 0, duration: 0 };
  }
  const raw = JSON.parse(fs.readFileSync(resultsJson, 'utf8'));
  const flat = flattenSuites(raw.suites || []);
  const tests = flat.map(({ title, file, line, result }) => {
    const failed = result.status !== 'passed';
    const firstError = (result.errors && result.errors[0]) || result.error;
    return {
      title,
      file: file ? path.relative(HUB_ROOT, file).replace(/\\/g, '/') : null,
      specLine: line,
      status: result.status,
      durationMs: result.duration ?? 0,
      error: failed && firstError ? {
        message: firstError.message || String(firstError),
        stack: firstError.stack,
        location: firstError.location || null,
        snippet: firstError.snippet || null,
      } : null,
    };
  });
  return {
    tests,
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status !== 'passed').length,
    duration: (raw.stats?.duration ?? tests.reduce((a, t) => a + t.durationMs, 0)) / 1000,
  };
}

function classifyOverall({ passed, failed }) {
  if (failed === 0 && passed > 0) return 'PASSED';
  const total = passed + failed;
  if (total === 0) return 'FAILED';
  if (failed / total > 0.5) return 'FAILED';
  return 'PARTIAL';
}

function planTitle(planPath) {
  const raw = fs.readFileSync(planPath, 'utf8');
  const m = raw.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : path.basename(planPath, '.md');
}

function writeReport({ projectRoot, planPath, specPath, summary, overall, executionMode }) {
  const day = todayStr();
  const reportsRoot = path.join(projectRoot, 'test-reports');
  const dir = path.join(reportsRoot, day);
  fs.mkdirSync(dir, { recursive: true });
  const name = path.basename(planPath, '.md');
  const reportPath = path.join(dir, `${name}.md`);
  const planRel = path.relative(projectRoot, planPath).replace(/\\/g, '/');
  const specRel = path.relative(projectRoot, specPath).replace(/\\/g, '/');

  const lines = [];
  lines.push(`# Report: ${planTitle(planPath)}`);
  lines.push(`**Date:** ${utcStamp()}`);
  lines.push(`**Plan:** ${planRel}`);
  lines.push(`**Spec:** ${specRel}`);
  lines.push(`**Execution Mode:** ${executionMode}`);
  lines.push(`**Result:** ${overall}`);
  lines.push(`**Duration:** ${summary.duration.toFixed(1)}s`);
  lines.push('');
  lines.push('## Summary');
  lines.push('| Total Steps | Passed | Failed | Skipped |');
  lines.push('|-------------|--------|--------|---------|');
  const total = summary.passed + summary.failed;
  lines.push(`| ${total} | ${summary.passed} | ${summary.failed} | 0 |`);
  lines.push('');
  lines.push('## Step Results');
  for (const t of summary.tests) {
    const ok = t.status === 'passed';
    lines.push(`### ${t.title}`);
    lines.push(`**Mode:** ${t.repairedBy ? `ai-repair (patched ${t.repairedBy})` : 'playwright-script'}`);
    lines.push(`**Duration:** ${(t.durationMs / 1000).toFixed(1)}s`);
    lines.push(`- [${ok ? 'PASS' : 'FAIL'}] ${t.title}`);
    if (!ok && t.error) {
      lines.push('');
      lines.push('**Error:**');
      lines.push('```');
      lines.push(String(t.error.message).slice(0, 1500));
      lines.push('```');
      if (t.error.location) {
        lines.push(`**Location:** ${t.error.location.file}:${t.error.location.line}:${t.error.location.column}`);
      }
    }
    lines.push('');
  }
  fs.writeFileSync(reportPath, lines.join('\n'));
  return reportPath;
}

function main() {
  const opts = parseArgs(process.argv);
  const planAbs = path.resolve(opts.plan);
  const { slug, projectRoot, planRel } = resolveProjectSlug(planAbs);
  const specPath = resolveSpec(planAbs);

  if (opts.check) {
    emit({ status: fs.existsSync(specPath) ? 'spec-exists' : 'no-spec', project: slug, planPath: planRel });
    return;
  }
  if (!fs.existsSync(specPath)) {
    emit({ status: 'no-spec', project: slug, planPath: planRel, specPath: path.relative(HUB_ROOT, specPath).replace(/\\/g, '/') });
    return;
  }

  runPlaywright(specPath, slug, opts.grep);
  const summary = summariseResults(slug);
  const overall = classifyOverall(summary);
  const executionMode = summary.failed === 0 ? 'playwright-script' : 'playwright-script (failures pending AI-repair)';

  let reportPath = null;
  let allureReportPath = null;
  if (!opts.noReport) {
    reportPath = writeReport({ projectRoot, planPath: planAbs, specPath, summary, overall, executionMode });
    allureReportPath = buildAllureReport(slug);
  }

  emit({
    status: overall.toLowerCase(),
    project: slug,
    planPath: planRel,
    specPath: path.relative(HUB_ROOT, specPath).replace(/\\/g, '/'),
    reportPath: reportPath ? path.relative(HUB_ROOT, reportPath).replace(/\\/g, '/') : null,
    allureReportPath: allureReportPath ? path.relative(HUB_ROOT, allureReportPath).replace(/\\/g, '/') : null,
    duration: summary.duration,
    tests: summary.tests,
  });
}

function buildAllureReport(slug) {
  const resultsDir = path.join(HUB_ROOT, 'projects', slug, 'allure-results');
  const reportDir = path.join(HUB_ROOT, 'projects', slug, 'allure-report');
  if (!fs.existsSync(resultsDir) || fs.readdirSync(resultsDir).length === 0) {
    return null;
  }
  const res = spawnSync('npx', ['allure', 'generate', resultsDir, '--clean', '--single-file', '-o', reportDir], {
    cwd: HUB_ROOT,
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: process.platform === 'win32',
  });
  if (res.status !== 0) return null;
  return path.join(reportDir, 'index.html');
}

main();
