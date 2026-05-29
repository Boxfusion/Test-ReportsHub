#!/usr/bin/env node
/**
 * Scan one project and emit:
 *   - projects/<name>/data.json     ← everything the dashboard needs
 *   - projects/<name>/summary.json  ← per-project rollup (consumed by build-hub-data)
 *   - projects/<name>/index.html    ← thin shell that fetches data.json (only written if missing)
 *
 * Source resolution:
 *   - If projects/<name>/meta.json has `source: { repo, branch? }`, scan the
 *     external GitHub repo (no test-plans/ or test-reports/ needed locally).
 *   - Otherwise, scan projects/<name>/test-plans + test-reports on disk.
 *
 * Usage:
 *   node scripts/build-project-data.js --project=<name>
 */

const fs = require('fs');
const path = require('path');
const pathPosix = path.posix;
const { createGithubSource } = require('./lib/github-source');

const HUB_ROOT = path.resolve(__dirname, '..');
const HEATMAP_WEEKS = 52;
const SPARKLINE_RUNS = 12;

const HUB_REPO_URL = 'https://github.com/Boxfusion/Test-ReportsHub';
const RUN_TEST_WORKFLOW = `${HUB_REPO_URL}/actions/workflows/run-test.yml`;

function parseArgs(argv) {
  const out = {};
  for (const a of argv.slice(2)) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
    else if (a.startsWith('--')) out[a.slice(2)] = true;
  }
  return out;
}

function dateOnly(s) {
  const m = String(s).match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

// ───────── Source adapters ─────────

function createLocalSource(projectRoot) {
  const files = [];
  function walk(absDir, relDir) {
    if (!fs.existsSync(absDir)) return;
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      const abs = path.join(absDir, entry.name);
      const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(abs, rel);
      else files.push({ path: rel, mtime: fs.statSync(abs).mtime });
    }
  }
  walk(projectRoot, '');
  return {
    kind: 'local',
    files,
    async readFile(pathRel) {
      return fs.readFileSync(path.join(projectRoot, pathRel), 'utf8');
    },
    viewerUrl(pathRel) {
      // Same shape as before: relative path the project's index.html can resolve.
      return pathRel;
    },
  };
}

// ───────── Plan / report / bug collection ─────────

function collectPlans(source) {
  const md = source.files.filter((f) =>
    f.path.startsWith('test-plans/') &&
    f.path.endsWith('.md') &&
    !f.path.endsWith('RULES.md'),
  );
  const specPaths = new Set(
    source.files.filter((f) => f.path.startsWith('test-plans/') && f.path.endsWith('.spec.ts')).map((f) => f.path),
  );
  const specMtime = new Map(
    source.files
      .filter((f) => f.path.startsWith('test-plans/') && f.path.endsWith('.spec.ts'))
      .map((f) => [f.path, f.mtime]),
  );
  return md.map((f) => {
    const specPath = f.path.replace(/\.md$/, '.spec.ts');
    const hasSpec = specPaths.has(specPath);
    const sMtime = hasSpec ? specMtime.get(specPath) : null;
    const effectiveMtime = sMtime && sMtime > f.mtime ? sMtime : f.mtime;
    return {
      plan: f.path,
      spec: hasSpec ? specPath : null,
      mtime: effectiveMtime.toISOString(),
      mdMtime: f.mtime.toISOString(),
      specMtime: sMtime ? sMtime.toISOString() : null,
    };
  });
}

function parseReportText(text, fileRel) {
  const meta = {};
  for (const line of text.split(/\r?\n/).slice(0, 30)) {
    const m = line.match(/^\*\*([A-Za-z ]+):\*\*\s*(.+?)\s*$/);
    if (m) meta[m[1].trim().toLowerCase()] = m[2].trim();
  }
  const titleLine = text.match(/^#\s+(.+)$/m);
  const planRel = meta.plan ? meta.plan.replace(/\\/g, '/') : null;
  // Date order: explicit `Date:` line, then YYYY-MM-DD/ folder name.
  const folderDate = dateOnly(pathPosix.basename(pathPosix.dirname(fileRel)));
  const reportDate = dateOnly(meta.date) || folderDate;
  return {
    fileRel,
    title: titleLine ? titleLine[1].trim().replace(/^Report:\s*/i, '') : pathPosix.basename(fileRel, '.md'),
    plan: planRel,
    spec: meta.spec ? meta.spec.replace(/\\/g, '/') : null,
    result: (meta.result || 'UNKNOWN').toUpperCase(),
    duration: meta.duration || '',
    date: reportDate,
    mode: meta['execution mode'] || null,
  };
}

async function collectReports(source) {
  const reportFiles = source.files.filter((f) => {
    if (!f.path.startsWith('test-reports/')) return false;
    if (!f.path.endsWith('.md')) return false;
    // Match test-reports/YYYY-MM-DD/<file>.md
    return /^test-reports\/\d{4}-\d{2}-\d{2}\/[^/]+\.md$/.test(f.path);
  });
  const reports = [];
  for (const f of reportFiles) {
    const text = await source.readFile(f.path);
    reports.push(parseReportText(text, f.path));
  }
  return reports.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function collectBugs(source) {
  return source.files
    .filter((f) => /^test-reports\/bugs\/[^/]+\.md$/.test(f.path))
    .map((f) => ({
      fileRel: f.path,
      name: pathPosix.basename(f.path),
      date: dateOnly(pathPosix.basename(f.path)) || '',
    }));
}

// ───────── Aggregations (no source/IO) ─────────

function indexRunsByPlan(plans, reports) {
  const byPlan = new Map();
  for (const p of plans) byPlan.set(p.plan, []);
  for (const r of reports) {
    if (!r.plan) continue;
    if (!byPlan.has(r.plan)) byPlan.set(r.plan, []);
    byPlan.get(r.plan).push(r);
  }
  return byPlan;
}

function buildHeatmap(reports) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const anchor = new Date(today);
  anchor.setDate(today.getDate() + (6 - dow));
  const cols = HEATMAP_WEEKS;
  const startDate = new Date(anchor);
  startDate.setDate(anchor.getDate() - (cols * 7 - 1));

  const cellMap = new Map();
  for (const r of reports) {
    if (!r.date) continue;
    if (!cellMap.has(r.date)) cellMap.set(r.date, { runs: 0, passed: 0, failed: 0, partial: 0 });
    const c = cellMap.get(r.date);
    c.runs += 1;
    if (r.result === 'PASSED') c.passed += 1;
    else if (r.result === 'FAILED') c.failed += 1;
    else if (r.result === 'PARTIAL') c.partial += 1;
  }

  const days = [];
  for (let i = 0; i < cols * 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const data = cellMap.get(iso) || { runs: 0, passed: 0, failed: 0, partial: 0 };
    days.push({ iso, ...data });
  }

  return { weeks: cols, startDate: startDate.toISOString().slice(0, 10), days };
}

function bugsForPlan(planRel, bugs, source) {
  const kebab = pathPosix.basename(planRel, '.md');
  return bugs
    .filter((b) => b.name.includes(kebab))
    .map((b) => ({ name: b.name, href: source.viewerUrl(b.fileRel) }));
}

function titleCaseSlug(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function groupBySection(planEntries) {
  const sections = new Map();
  for (const entry of planEntries) {
    const stripped = entry.plan.replace(/^test-plans\//, '');
    const slash = stripped.indexOf('/');
    const key = slash >= 0 ? stripped.slice(0, slash) : '_root';
    if (!sections.has(key)) sections.set(key, []);
    sections.get(key).push(entry);
  }
  return [...sections.entries()]
    .sort(([a], [b]) => (a === '_root' ? -1 : b === '_root' ? 1 : a.localeCompare(b)))
    .map(([key, plans]) => ({
      key,
      title: key === '_root' ? 'General' : titleCaseSlug(key),
      stripPrefix: key === '_root' ? 'test-plans/' : `test-plans/${key}/`,
      plans,
    }));
}

function buildPlanEntry(plan, runs, bugs, source) {
  const last = runs[0] || null;
  const badges = [];
  if (!last) {
    badges.push({ kind: 'new', text: 'NEW · never run' });
  } else {
    const lastRunMs = Date.parse(`${last.date}T23:59:59Z`);
    const mtimeMs = Date.parse(plan.mtime);
    if (mtimeMs > lastRunMs) {
      const specMs = plan.specMtime ? Date.parse(plan.specMtime) : 0;
      const mdMs = Date.parse(plan.mdMtime);
      const which = specMs > mdMs ? 'spec' : 'plan';
      badges.push({ kind: 'updated', text: `UPDATED · ${which} edited after last run` });
    }
  }
  if (!plan.spec) badges.push({ kind: 'no-spec', text: 'no .spec.ts yet' });

  const status = last ? last.result : 'NEVER';
  let rowStatus;
  if (!last) rowStatus = 'never';
  else if (last.result === 'FAILED') rowStatus = 'failing';
  else if (last.result === 'PARTIAL') rowStatus = 'partial';
  else if (last.result === 'PASSED') rowStatus = 'passing';
  else rowStatus = 'never';

  const history = runs.slice(0, SPARKLINE_RUNS).map((r) => ({
    date: r.date,
    result: r.result,
    duration: r.duration,
  }));

  return {
    plan: plan.plan,
    planHref: source.viewerUrl(plan.plan),
    spec: plan.spec,
    specHref: plan.spec ? source.viewerUrl(plan.spec) : null,
    canRun: !!plan.spec,
    badges,
    rowStatus,
    status,
    last: last ? {
      date: last.date,
      result: last.result,
      duration: last.duration,
      reportHref: source.viewerUrl(last.fileRel),
    } : null,
    runCount: runs.length,
    history,
    bugs: bugsForPlan(plan.plan, bugs, source),
  };
}

function buildKpis(plans, reports, byPlan) {
  const recent = reports.filter((r) => {
    if (!r.date) return false;
    const ms = Date.parse(`${r.date}T00:00:00Z`);
    return Date.now() - ms <= 7 * 24 * 3600 * 1000;
  });
  const recentPass = recent.filter((r) => r.result === 'PASSED').length;
  const failingFlows = [...byPlan.entries()].filter(([, runs]) => runs[0] && runs[0].result === 'FAILED').length;
  const passingFlows = [...byPlan.entries()].filter(([, runs]) => runs[0] && runs[0].result === 'PASSED').length;
  const partialFlows = [...byPlan.entries()].filter(([, runs]) => runs[0] && runs[0].result === 'PARTIAL').length;
  const neverFlows = [...byPlan.entries()].filter(([, runs]) => !runs[0]).length;
  return {
    totalPlans: plans.length,
    totalRuns: reports.length,
    last7Runs: recent.length,
    last7Pass: recentPass,
    last7PassPct: recent.length === 0 ? null : Math.round((recentPass / recent.length) * 100),
    failingFlows,
    passingFlows,
    partialFlows,
    neverFlows,
  };
}

function buildTimeline(reports, source) {
  const byDate = new Map();
  for (const r of reports) {
    if (!r.date) continue;
    if (!byDate.has(r.date)) byDate.set(r.date, []);
    byDate.get(r.date).push({
      plan: r.plan,
      planDisplay: r.plan ? r.plan.replace(/^test-plans\//, '') : pathPosix.basename(r.fileRel),
      result: r.result,
      duration: r.duration,
      mode: r.mode,
      reportHref: source.viewerUrl(r.fileRel),
    });
  }
  return [...byDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, runs]) => ({ date, runs }));
}

const SHELL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Test Reports Hub · Boxfusion</title>
<link rel="stylesheet" href="../../assets/dashboard.css" />
</head>
<body>
  <header class="topbar">
    <div class="inner">
      <a class="brand" href="../../index.html">
        <span class="mark">TR</span>
        <span class="name">Test Reports Hub<span class="org">Boxfusion</span></span>
      </a>
      <nav>
        <a href="../../index.html">← All projects</a>
      </nav>
    </div>
  </header>

  <main class="container" id="dashboard-root">
    <div class="dashboard-loading">Loading dashboard…</div>
  </main>

  <div id="toast-stack" class="toast-stack" aria-live="polite"></div>

  <script src="data.js"></script>
  <script src="../../assets/dashboard.js"></script>
  <script src="../../assets/markdown-viewer.js"></script>
</body>
</html>
`;

async function build(projectName) {
  const projectRoot = path.join(HUB_ROOT, 'projects', projectName);
  if (!fs.existsSync(projectRoot)) {
    throw new Error(`Project not found: ${projectRoot}`);
  }
  const metaFile = path.join(projectRoot, 'meta.json');
  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};

  const source = meta.source
    ? await createGithubSource(meta.source)
    : createLocalSource(projectRoot);

  const hasAllure = source.files.some((f) => f.path === 'allure-report/index.html');

  const plans = collectPlans(source);
  const reports = await collectReports(source);
  const bugs = collectBugs(source);
  const byPlan = indexRunsByPlan(plans, reports);
  const heatmap = buildHeatmap(reports);

  const planEntries = plans.map((p) => buildPlanEntry(p, byPlan.get(p.plan) || [], bugs, source));

  planEntries.sort((a, b) => {
    const aDate = a.last?.date || '0000';
    const bDate = b.last?.date || '0000';
    if (aDate !== bDate) return bDate.localeCompare(aDate);
    return a.plan.localeCompare(b.plan);
  });

  const sections = groupBySection(planEntries);
  const kpis = buildKpis(plans, reports, byPlan);
  const timeline = buildTimeline(reports, source);

  const data = {
    project: projectName,
    displayName: meta.displayName || projectName,
    meta: {
      displayName: meta.displayName || projectName,
      appUrl: meta.appUrl || null,
      environment: meta.environment || null,
      sourceRepo: meta.sourceRepo || (meta.source?.repo ?? null),
      description: meta.description || null,
      source: source.kind === 'remote'
        ? { kind: 'remote', repo: meta.source.repo, branch: source.branch }
        : { kind: 'local' },
    },
    hasAllure,
    workflowUrl: RUN_TEST_WORKFLOW,
    kpis,
    heatmap,
    sections,
    timeline,
    generated: new Date().toISOString(),
  };

  const summary = {
    totalPlans: kpis.totalPlans,
    totalRuns: kpis.totalRuns,
    last7Runs: kpis.last7Runs,
    last7Pass: kpis.last7Pass,
    last7PassPct: kpis.last7PassPct,
    failingFlows: kpis.failingFlows,
    lastRun: reports[0] ? { date: reports[0].date, result: reports[0].result, plan: reports[0].plan } : null,
  };

  fs.writeFileSync(path.join(projectRoot, 'data.json'), JSON.stringify(data, null, 2));
  // Sibling .js so the dashboard loads over file:// (browsers block fetch
  // from file origins, but <script src> works fine).
  fs.writeFileSync(path.join(projectRoot, 'data.js'), `window.__DATA__ = ${JSON.stringify(data)};\n`);
  fs.writeFileSync(path.join(projectRoot, 'summary.json'), JSON.stringify(summary, null, 2));

  const shellPath = path.join(projectRoot, 'index.html');
  if (!fs.existsSync(shellPath) || fs.readFileSync(shellPath, 'utf8') !== SHELL_TEMPLATE) {
    fs.writeFileSync(shellPath, SHELL_TEMPLATE);
  }

  console.log(`[project:${projectName}] source=${source.kind} ${plans.length} flow(s), ${reports.length} run(s) → projects/${projectName}/data.json`);
  return summary;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.project) {
    console.error('Usage: node scripts/build-project-data.js --project=<name>');
    process.exit(2);
  }
  try {
    await build(args.project);
  } catch (err) {
    console.error(`[project:${args.project}] ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { build };
