#!/usr/bin/env node
/**
 * Build a single project's dashboard at projects/<project>/index.html.
 *
 * Scans:
 *   - projects/<project>/test-plans/**\/*.md  — every known plan
 *   - projects/<project>/test-reports/<YYYY-MM-DD>/*.md — every historical run
 *   - projects/<project>/test-reports/bugs/*.md — linked bugs
 *
 * Usage:
 *   node scripts/build-project-dashboard.js --project=<name>
 */

const fs = require('fs');
const path = require('path');

const HUB_ROOT = path.resolve(__dirname, '..');
const HEATMAP_WEEKS = 52;
const SPARKLINE_RUNS = 12;

function parseArgs(argv) {
  const out = {};
  for (const a of argv.slice(2)) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
    else if (a.startsWith('--')) out[a.slice(2)] = true;
  }
  return out;
}

function walk(dir, predicate) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, predicate));
    else if (predicate(full, entry)) out.push(full);
  }
  return out;
}

function dateOnly(s) {
  const m = String(s).match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function parseReport(file, reportsRoot) {
  const raw = fs.readFileSync(file, 'utf8');
  const meta = {};
  for (const line of raw.split(/\r?\n/).slice(0, 30)) {
    const m = line.match(/^\*\*([A-Za-z ]+):\*\*\s*(.+?)\s*$/);
    if (m) meta[m[1].trim().toLowerCase()] = m[2].trim();
  }
  const titleLine = raw.match(/^#\s+(.+)$/m);
  const planRel = meta.plan ? meta.plan.replace(/\\/g, '/') : null;
  const reportDate = dateOnly(meta.date) || dateOnly(path.basename(path.dirname(file)));
  return {
    file,
    fileRel: path.relative(reportsRoot, file).replace(/\\/g, '/'),
    title: titleLine ? titleLine[1].trim().replace(/^Report:\s*/i, '') : path.basename(file, '.md'),
    plan: planRel,
    spec: meta.spec ? meta.spec.replace(/\\/g, '/') : null,
    result: (meta.result || 'UNKNOWN').toUpperCase(),
    duration: meta.duration || '',
    date: reportDate,
    mode: meta['execution mode'] || null,
  };
}

function collectPlans(plansRoot, projectRoot) {
  const planFiles = walk(plansRoot, (p) => p.endsWith('.md') && !p.endsWith('RULES.md'));
  return planFiles.map((p) => {
    const rel = path.relative(projectRoot, p).replace(/\\/g, '/');
    const specPath = p.replace(/\.md$/, '.spec.ts');
    const stat = fs.statSync(p);
    const specMtime = fs.existsSync(specPath) ? fs.statSync(specPath).mtime : null;
    const effectiveMtime = specMtime && specMtime > stat.mtime ? specMtime : stat.mtime;
    return {
      plan: rel,
      spec: fs.existsSync(specPath) ? path.relative(projectRoot, specPath).replace(/\\/g, '/') : null,
      mtime: effectiveMtime,
      mdMtime: stat.mtime,
      specMtime,
    };
  });
}

function collectReports(reportsRoot) {
  if (!fs.existsSync(reportsRoot)) return [];
  const reports = [];
  for (const d of fs.readdirSync(reportsRoot, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    if (d.name === 'bugs') continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.name)) continue;
    for (const f of fs.readdirSync(path.join(reportsRoot, d.name))) {
      if (f.endsWith('.md')) reports.push(parseReport(path.join(reportsRoot, d.name, f), reportsRoot));
    }
  }
  return reports.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function collectBugs(bugsRoot, reportsRoot) {
  if (!fs.existsSync(bugsRoot)) return [];
  const out = [];
  for (const f of fs.readdirSync(bugsRoot)) {
    if (!f.endsWith('.md')) continue;
    out.push({
      file: path.join(bugsRoot, f),
      fileRel: path.relative(reportsRoot, path.join(bugsRoot, f)).replace(/\\/g, '/'),
      name: f,
      date: dateOnly(f) || '',
    });
  }
  return out;
}

function buildIndex(plans, reports) {
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
  const anchor = new Date(today); anchor.setDate(today.getDate() + (6 - dow));
  const cols = HEATMAP_WEEKS;
  const startDate = new Date(anchor); startDate.setDate(anchor.getDate() - (cols * 7 - 1));

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
    const d = new Date(startDate); d.setDate(startDate.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const data = cellMap.get(iso) || { runs: 0, passed: 0, failed: 0, partial: 0 };
    days.push({ iso, data, date: d });
  }

  const monthLabels = [];
  let lastMonth = -1;
  for (let col = 0; col < cols; col++) {
    const first = days[col * 7];
    if (first.date.getMonth() !== lastMonth) {
      monthLabels.push({ col, label: first.date.toLocaleString('en', { month: 'short' }) });
      lastMonth = first.date.getMonth();
    }
  }

  return { days, cols, monthLabels };
}

function cellColor({ runs, passed, failed, partial }) {
  if (runs === 0) return '#ebedf0';
  if (failed > 0) {
    if (failed >= 3) return '#7f1d1d';
    if (failed >= 2) return '#b91c1c';
    return '#ef4444';
  }
  if (partial > 0) return '#f59e0b';
  if (runs >= 4) return '#216e39';
  if (runs >= 3) return '#30a14e';
  if (runs >= 2) return '#40c463';
  return '#9be9a8';
}

function resultPillClass(result) {
  switch (result) {
    case 'PASSED': return 'pass';
    case 'FAILED': return 'fail';
    case 'PARTIAL': return 'partial';
    default: return 'neutral';
  }
}

function sparklineHtml(runs) {
  const recent = runs.slice(0, SPARKLINE_RUNS).reverse();
  if (recent.length === 0) return `<span class="spark-empty">no runs yet</span>`;
  const cells = recent.map((r) => {
    const cls = resultPillClass(r.result);
    return `<span class="spark spark-${cls}" title="${r.date} — ${r.result} (${r.duration})"></span>`;
  }).join('');
  return `<span class="sparkline">${cells}</span>`;
}

function badgesFor(plan, runs) {
  const out = [];
  const lastRun = runs[0];
  if (!lastRun) {
    out.push('<span class="badge badge-new">NEW · never run</span>');
  } else {
    const lastRunMs = Date.parse(`${lastRun.date}T23:59:59Z`);
    if (plan.mtime.getTime() > lastRunMs) {
      const which = plan.specMtime && plan.specMtime > plan.mdMtime ? 'spec' : 'plan';
      out.push(`<span class="badge badge-updated">UPDATED · ${which} edited after last run</span>`);
    }
  }
  if (!plan.spec) out.push('<span class="badge badge-no-spec">no .spec.ts yet</span>');
  return out.join(' ');
}

function bugsForPlan(planRel, bugs) {
  const kebab = path.basename(planRel, '.md');
  return bugs.filter((b) => b.name.includes(kebab));
}

function formatDateLabel(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function reportLinkHref(r, projectRoot) {
  // r.file is absolute. We want a path relative to projects/<name>/index.html.
  return path.relative(projectRoot, r.file).replace(/\\/g, '/');
}

function html({ plans, reports, byPlan, heatmap, bugs, meta, projectName, projectRoot }) {
  const totalPlans = plans.length;
  const totalRuns = reports.length;
  const recentRuns = reports.filter((r) => {
    if (!r.date) return false;
    const ms = Date.parse(`${r.date}T00:00:00Z`);
    return Date.now() - ms <= 7 * 24 * 3600 * 1000;
  });
  const recentPass = recentRuns.filter((r) => r.result === 'PASSED').length;
  const recentPassPct = recentRuns.length === 0 ? '—' : `${Math.round((recentPass / recentRuns.length) * 100)}%`;
  const failingFlows = [...byPlan.entries()].filter(([, runs]) => runs[0] && runs[0].result === 'FAILED').length;

  const heatCells = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < heatmap.cols; col++) {
      const idx = col * 7 + row;
      const d = heatmap.days[idx];
      if (!d) continue;
      const color = cellColor(d.data);
      const tooltip = d.data.runs === 0
        ? `${d.iso} — no runs`
        : `${d.iso} — ${d.data.runs} run(s) · ${d.data.passed} passed · ${d.data.failed} failed · ${d.data.partial} partial`;
      heatCells.push(`<rect x="${col * 14}" y="${row * 14}" width="12" height="12" rx="2" fill="${color}"><title>${tooltip}</title></rect>`);
    }
  }
  const monthLabels = heatmap.monthLabels.map((m) => `<text x="${m.col * 14}" y="10" class="month">${m.label}</text>`).join('');
  const dayLabels = ['Mon', 'Wed', 'Fri'].map((l, i) => `<text x="-30" y="${[1, 3, 5][i] * 14 + 10}" class="day">${l}</text>`).join('');
  const heatmapSvg = `
    <svg class="heatmap" viewBox="0 0 ${heatmap.cols * 14 + 10} 110" preserveAspectRatio="xMidYMid meet">
      <g transform="translate(36, 14)">
        ${monthLabels}
        <g transform="translate(0, 16)">
          ${dayLabels}
          ${heatCells.join('')}
        </g>
      </g>
    </svg>`;

  const flowsRows = [...byPlan.entries()]
    .sort((a, b) => {
      const aDate = a[1][0]?.date || '0000';
      const bDate = b[1][0]?.date || '0000';
      if (aDate !== bDate) return bDate.localeCompare(aDate);
      return a[0].localeCompare(b[0]);
    })
    .map(([planRel, runs]) => {
      const planObj = plans.find((p) => p.plan === planRel) || { plan: planRel, spec: null, mtime: new Date(0), mdMtime: new Date(0), specMtime: null };
      const last = runs[0];
      const status = last ? `<span class="pill pill-${resultPillClass(last.result)}">${last.result}</span>` : '<span class="pill pill-neutral">—</span>';
      const lastDate = last ? last.date : '—';
      const dur = last ? last.duration : '—';
      const bugLinks = bugsForPlan(planRel, bugs).map((b) => `<a href="test-reports/${b.fileRel}" title="${b.name}">bug</a>`).join(' · ');
      const reportLink = last ? `<a href="${reportLinkHref(last, projectRoot)}">latest report</a>` : '<span class="muted">no report</span>';
      const links = [reportLink, bugLinks].filter(Boolean).join(' · ');
      return `
        <tr>
          <td class="plan-cell">
            <div class="plan-name">${planRel.replace(/^test-plans\//, '')}</div>
            <div class="plan-badges">${badgesFor(planObj, runs)}</div>
          </td>
          <td>${status}</td>
          <td>${lastDate}</td>
          <td>${dur}</td>
          <td>${runs.length}</td>
          <td>${sparklineHtml(runs)}</td>
          <td class="links">${links}</td>
        </tr>`;
    }).join('');

  const byDate = new Map();
  for (const r of reports) {
    if (!r.date) continue;
    if (!byDate.has(r.date)) byDate.set(r.date, []);
    byDate.get(r.date).push(r);
  }
  const timelineGroups = [...byDate.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([date, list]) => {
    const items = list.map((r) => `
      <li class="timeline-run">
        <span class="pill pill-${resultPillClass(r.result)}">${r.result}</span>
        <a href="${reportLinkHref(r, projectRoot)}">${r.plan ? r.plan.replace(/^test-plans\//, '') : path.basename(r.file)}</a>
        <span class="muted">${r.duration}${r.mode ? ` · ${r.mode}` : ''}</span>
      </li>`).join('');
    return `
      <section class="timeline-day">
        <header><h3>${formatDateLabel(date)}</h3><span class="muted">${list.length} run${list.length === 1 ? '' : 's'}</span></header>
        <ul>${items}</ul>
      </section>`;
  }).join('');

  const generated = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const displayName = meta.displayName || projectName;
  const envLine = [meta.appUrl ? `<a href="${meta.appUrl}" target="_blank" rel="noreferrer">${meta.appUrl}</a>` : null, meta.environment ? `env: ${meta.environment}` : null].filter(Boolean).join(' · ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Test Report Dashboard — ${displayName}</title>
<style>
  :root {
    --bg: #f6f8fa; --card: #ffffff; --ink: #0f172a; --muted: #64748b; --border: #e2e8f0;
    --pass: #15803d; --pass-bg: #dcfce7; --fail: #b91c1c; --fail-bg: #fee2e2;
    --partial: #b45309; --partial-bg: #fef3c7; --neutral: #475569; --neutral-bg: #f1f5f9;
    --updated: #1d4ed8; --updated-bg: #dbeafe; --new: #6d28d9; --new-bg: #ede9fe;
  }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 2rem; background: var(--bg); color: var(--ink); line-height: 1.45; }
  .crumbs { color: var(--muted); font-size: .85rem; margin-bottom: .25rem; }
  .crumbs a { color: var(--muted); text-decoration: none; }
  .crumbs a:hover { color: #2563eb; text-decoration: underline; }
  h1 { margin: 0 0 .25rem 0; font-size: 1.75rem; }
  h2 { margin: 2rem 0 .75rem 0; font-size: 1.15rem; color: var(--ink); }
  h3 { margin: 0; font-size: 1rem; }
  .subtitle { color: var(--muted); margin-bottom: 1.5rem; font-size: .9rem; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
  .card { background: var(--card); padding: 1rem 1.25rem; border-radius: 10px; border: 1px solid var(--border); }
  .card .num { font-size: 1.8rem; font-weight: 600; margin: .25rem 0; }
  .card .label { color: var(--muted); font-size: .8rem; text-transform: uppercase; letter-spacing: .04em; }
  .panel { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; overflow: hidden; }
  .heatmap { width: 100%; height: auto; max-height: 130px; }
  .heatmap .month { font-size: 9px; fill: var(--muted); }
  .heatmap .day { font-size: 9px; fill: var(--muted); }
  .legend { display: flex; align-items: center; gap: .35rem; font-size: .75rem; color: var(--muted); margin-top: .5rem; justify-content: flex-end; }
  .legend span.swatch { display: inline-block; width: 12px; height: 12px; border-radius: 2px; }
  table { border-collapse: collapse; width: 100%; }
  thead th { text-align: left; padding: .65rem .75rem; background: var(--neutral-bg); font-size: .8rem; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); border-bottom: 1px solid var(--border); }
  tbody td { padding: .75rem .75rem; border-bottom: 1px solid var(--border); vertical-align: top; font-size: .9rem; }
  tbody tr:last-child td { border-bottom: none; }
  .plan-cell .plan-name { font-weight: 500; color: var(--ink); margin-bottom: .25rem; }
  .plan-badges { display: flex; gap: .35rem; flex-wrap: wrap; }
  .pill { display: inline-block; padding: .15rem .55rem; border-radius: 999px; font-size: .75rem; font-weight: 600; letter-spacing: .03em; }
  .pill-pass { color: var(--pass); background: var(--pass-bg); }
  .pill-fail { color: var(--fail); background: var(--fail-bg); }
  .pill-partial { color: var(--partial); background: var(--partial-bg); }
  .pill-neutral { color: var(--neutral); background: var(--neutral-bg); }
  .badge { display: inline-block; padding: .1rem .5rem; border-radius: 4px; font-size: .65rem; font-weight: 600; letter-spacing: .05em; }
  .badge-updated { color: var(--updated); background: var(--updated-bg); }
  .badge-new { color: var(--new); background: var(--new-bg); }
  .badge-no-spec { color: var(--muted); background: var(--neutral-bg); }
  .sparkline { display: inline-flex; gap: 2px; align-items: center; }
  .spark { width: 10px; height: 14px; border-radius: 2px; }
  .spark-pass { background: #4ade80; }
  .spark-fail { background: #f87171; }
  .spark-partial { background: #fbbf24; }
  .spark-neutral { background: #cbd5e1; }
  .spark-empty { color: var(--muted); font-size: .75rem; font-style: italic; }
  .muted { color: var(--muted); font-size: .85rem; }
  .links a { color: #2563eb; text-decoration: none; }
  .links a:hover { text-decoration: underline; }
  .timeline-day { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: .75rem; }
  .timeline-day header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: .5rem; }
  .timeline-day ul { list-style: none; margin: 0; padding: 0; }
  .timeline-run { display: flex; align-items: center; gap: .75rem; padding: .4rem 0; border-top: 1px solid var(--border); }
  .timeline-run:first-child { border-top: none; }
  .timeline-run a { color: var(--ink); text-decoration: none; font-weight: 500; }
  .timeline-run a:hover { color: #2563eb; }
  footer { color: var(--muted); font-size: .8rem; margin-top: 2rem; }
</style>
</head>
<body>
  <div class="crumbs"><a href="../../index.html">← All projects</a></div>
  <h1>${displayName}</h1>
  <div class="subtitle">${envLine || '&nbsp;'}</div>

  <div class="cards">
    <div class="card"><div class="label">Test Flows</div><div class="num">${totalPlans}</div></div>
    <div class="card"><div class="label">Total Runs</div><div class="num">${totalRuns}</div></div>
    <div class="card"><div class="label">Last 7 days · pass rate</div><div class="num">${recentPassPct}</div><div class="muted">${recentRuns.length} run${recentRuns.length === 1 ? '' : 's'}</div></div>
    <div class="card"><div class="label">Currently failing</div><div class="num">${failingFlows}</div><div class="muted">flow${failingFlows === 1 ? '' : 's'}</div></div>
  </div>

  <div class="panel">
    <h2>Activity — last ${HEATMAP_WEEKS} weeks</h2>
    ${heatmapSvg}
    <div class="legend">
      <span>less</span>
      <span class="swatch" style="background:#ebedf0"></span>
      <span class="swatch" style="background:#9be9a8"></span>
      <span class="swatch" style="background:#40c463"></span>
      <span class="swatch" style="background:#30a14e"></span>
      <span class="swatch" style="background:#216e39"></span>
      <span>more</span>
      <span style="margin-left:1rem;display:inline-flex;align-items:center;gap:.35rem;">fail
        <span class="swatch" style="background:#ef4444"></span>
        <span class="swatch" style="background:#b91c1c"></span>
        <span class="swatch" style="background:#7f1d1d"></span>
      </span>
      <span style="margin-left:1rem;display:inline-flex;align-items:center;gap:.35rem;">partial
        <span class="swatch" style="background:#f59e0b"></span>
      </span>
    </div>
  </div>

  <div class="panel">
    <h2>Flows</h2>
    <table>
      <thead><tr><th>Plan</th><th>Last result</th><th>Last run</th><th>Duration</th><th>Runs</th><th>History</th><th>Links</th></tr></thead>
      <tbody>${flowsRows || '<tr><td colspan="7" class="muted">No test plans found.</td></tr>'}</tbody>
    </table>
  </div>

  <h2>Run timeline</h2>
  ${timelineGroups || '<div class="panel muted">No runs recorded yet.</div>'}

  <footer>Generated ${generated} · project <code>${projectName}</code> · <code>node scripts/build-project-dashboard.js --project=${projectName}</code></footer>
</body>
</html>`;
}

function summaryFor(plans, reports, byPlan) {
  const recentRuns = reports.filter((r) => {
    if (!r.date) return false;
    const ms = Date.parse(`${r.date}T00:00:00Z`);
    return Date.now() - ms <= 7 * 24 * 3600 * 1000;
  });
  const recentPass = recentRuns.filter((r) => r.result === 'PASSED').length;
  const failingFlows = [...byPlan.entries()].filter(([, runs]) => runs[0] && runs[0].result === 'FAILED').length;
  return {
    totalPlans: plans.length,
    totalRuns: reports.length,
    last7Runs: recentRuns.length,
    last7Pass: recentPass,
    last7PassPct: recentRuns.length === 0 ? null : Math.round((recentPass / recentRuns.length) * 100),
    failingFlows,
    lastRun: reports[0] ? { date: reports[0].date, result: reports[0].result, plan: reports[0].plan } : null,
  };
}

function build(projectName) {
  const projectRoot = path.join(HUB_ROOT, 'projects', projectName);
  if (!fs.existsSync(projectRoot)) {
    throw new Error(`Project not found: ${projectRoot}`);
  }
  const plansRoot = path.join(projectRoot, 'test-plans');
  const reportsRoot = path.join(projectRoot, 'test-reports');
  const bugsRoot = path.join(reportsRoot, 'bugs');
  const metaFile = path.join(projectRoot, 'meta.json');
  const outFile = path.join(projectRoot, 'index.html');
  const summaryFile = path.join(projectRoot, 'summary.json');

  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
  const plans = collectPlans(plansRoot, projectRoot);
  const reports = collectReports(reportsRoot);
  const bugs = collectBugs(bugsRoot, reportsRoot);
  const byPlan = buildIndex(plans, reports);
  const heatmap = buildHeatmap(reports);

  const out = html({ plans, reports, byPlan, heatmap, bugs, meta, projectName, projectRoot });
  fs.mkdirSync(projectRoot, { recursive: true });
  fs.writeFileSync(outFile, out);

  const summary = summaryFor(plans, reports, byPlan);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  console.log(`[project:${projectName}] ${plans.length} flow(s), ${reports.length} run(s) → projects/${projectName}/index.html`);
  return summary;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.project) {
    console.error('Usage: node scripts/build-project-dashboard.js --project=<name>');
    process.exit(2);
  }
  build(args.project);
}

if (require.main === module) main();

module.exports = { build };
