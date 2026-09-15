#!/usr/bin/env node
/**
 * Backfill a full Allure report for a project from its already-recorded run
 * history (projects/<name>/data.json, built by build-project-data.js from
 * the markdown test-reports). Use this when a project's committed
 * allure-report/ only reflects a handful of ad-hoc runs instead of the full
 * flow inventory, and re-running everything live isn't practical.
 *
 * This does NOT execute any tests — it synthesizes Allure result files from
 * known PASSED/FAILED/PARTIAL/NEVER outcomes, so per-step detail and
 * screenshots are only as rich as the source markdown report.
 *
 * Usage: node scripts/build-allure-from-history.js --project=eRecruitment
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const HUB_ROOT = path.resolve(__dirname, '..');

function arg(name, def) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : def;
}

const project = arg('project');
if (!project) {
  console.error('Usage: node scripts/build-allure-from-history.js --project=<name>');
  process.exit(1);
}

const PROJECT_DIR = path.join(HUB_ROOT, 'projects', project);
const DATA_FILE = path.join(PROJECT_DIR, 'data.json');
const RESULTS_DIR = path.join(PROJECT_DIR, 'allure-results--backfill');
const REPORT_DIR = path.join(PROJECT_DIR, 'allure-report');

if (!fs.existsSync(DATA_FILE)) {
  console.error(`No data.json for project "${project}". Run build-project-data.js first.`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

const STATUS_MAP = {
  PASSED: 'passed',
  FAILED: 'failed',
  PARTIAL: 'broken',
  NEVER: 'skipped',
};

function humanize(planPath) {
  const base = path.basename(planPath, '.md');
  return base.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseDurationMs(duration) {
  if (!duration) return 1000;
  const m = /([\d.]+)\s*s/.exec(duration);
  return m ? Math.round(parseFloat(m[1]) * 1000) : 1000;
}

fs.rmSync(RESULTS_DIR, { recursive: true, force: true });
fs.mkdirSync(RESULTS_DIR, { recursive: true });

let written = 0;
for (const section of data.sections || []) {
  for (const plan of section.plans || []) {
    const historyId = crypto.createHash('sha1').update(plan.plan).digest('hex');
    const name = humanize(plan.plan);
    const fullName = `${section.title} > ${name}`;
    const runs = plan.history && plan.history.length ? plan.history : [{ date: null, result: 'NEVER', duration: null }];

    for (const run of runs) {
      const status = STATUS_MAP[run.result] || 'unknown';
      const start = run.date ? Date.parse(`${run.date}T09:00:00Z`) : Date.now();
      const durationMs = parseDurationMs(run.duration);
      const stop = start + durationMs;

      const result = {
        uuid: crypto.randomUUID(),
        historyId,
        name,
        fullName,
        status,
        stage: 'finished',
        start,
        stop,
        description:
          run.result === 'NEVER'
            ? '_Backfilled: no run has been recorded for this flow yet._'
            : `_Backfilled from recorded run history (${run.date}) — not a live Allure execution._`,
        labels: [
          { name: 'parentSuite', value: data.displayName || project },
          { name: 'suite', value: section.title },
          { name: 'framework', value: 'playwright' },
          { name: 'language', value: 'typescript' },
        ],
      };

      if (status === 'failed' || status === 'broken') {
        result.statusDetails = { message: `Last recorded result: ${run.result}` };
      }

      const file = path.join(RESULTS_DIR, `${result.uuid}-result.json`);
      fs.writeFileSync(file, JSON.stringify(result, null, 2));
      written++;
    }
  }
}

console.log(`[allure-backfill:${project}] wrote ${written} result(s) from ${(data.sections || []).reduce((n, s) => n + s.plans.length, 0)} flow(s)`);

// Invoke the allure-commandline JAR directly with java rather than its
// .cmd/.bat wrapper — Node's spawnSync can't reliably launch .cmd files
// (esp. from paths containing spaces) without shell-quoting footguns.
const allureCliRoot = path.join(HUB_ROOT, 'node_modules', 'allure-commandline', 'dist');
const libDir = path.join(allureCliRoot, 'lib');
const classpath = fs.readdirSync(libDir)
  .filter((f) => f.endsWith('.jar'))
  .map((f) => path.join(libDir, f))
  .concat([path.join(libDir, 'config')])
  .join(path.delimiter);

const javaHome = process.env.JAVA_HOME;
const javaBin = javaHome
  ? path.join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java')
  : 'java';

const gen = spawnSync(javaBin, ['-classpath', classpath, 'io.qameta.allure.CommandLine', 'generate', RESULTS_DIR, '--clean', '-o', REPORT_DIR], {
  stdio: 'inherit',
  cwd: HUB_ROOT,
});
if (gen.error) {
  console.error(gen.error.message);
  console.error('Is Java installed and JAVA_HOME set? Allure report generation requires a JRE.');
  process.exit(1);
}
if (gen.status !== 0) process.exit(gen.status || 1);

console.log(`[allure-backfill:${project}] report → ${path.relative(HUB_ROOT, REPORT_DIR)}`);
