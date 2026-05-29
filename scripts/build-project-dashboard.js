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

// GitHub repo hosting the hub. The re-run button on each flow row opens
// .github/workflows/run-test.yml in this repo via workflow_dispatch.
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

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
  if (recent.length === 0) return `<span class="spark-empty">—</span>`;
  const cells = recent.map((r) => {
    const cls = resultPillClass(r.result);
    return `<span class="spark spark-${cls}" title="${escapeHtml(r.date)} — ${escapeHtml(r.result)} (${escapeHtml(r.duration)})"></span>`;
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

function rowFilterClass(planObj, last) {
  if (!last) return 'never';
  if (last.result === 'FAILED') return 'failing';
  if (last.result === 'PARTIAL') return 'partial';
  if (last.result === 'PASSED') return 'passing';
  return 'never';
}

function titleCaseSlug(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Group [planRel, runs] entries by the first folder segment under test-plans/.
// Plans directly under test-plans/ (no subfolder) fall into the '_root' bucket.
function groupBySection(entries) {
  const sections = new Map();
  for (const [planRel, runs] of entries) {
    const stripped = planRel.replace(/^test-plans\//, '');
    const slash = stripped.indexOf('/');
    const key = slash >= 0 ? stripped.slice(0, slash) : '_root';
    if (!sections.has(key)) sections.set(key, []);
    sections.get(key).push([planRel, runs]);
  }
  // Sort sections alphabetically, but '_root' first.
  return new Map([...sections.entries()].sort(([a], [b]) => {
    if (a === '_root') return -1;
    if (b === '_root') return 1;
    return a.localeCompare(b);
  }));
}

function html({ plans, reports, byPlan, heatmap, bugs, meta, projectName, projectRoot, hasAllure }) {
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

  function renderPlanRow([planRel, runs], { stripPrefix }) {
    const planObj = plans.find((p) => p.plan === planRel) || { plan: planRel, spec: null, mtime: new Date(0), mdMtime: new Date(0), specMtime: null };
    const last = runs[0];
    const status = last ? `<span class="pill pill-${resultPillClass(last.result)}">${escapeHtml(last.result)}</span>` : '<span class="pill pill-neutral">never run</span>';
    const lastDate = last ? escapeHtml(last.date) : '<span class="muted">—</span>';
    const dur = last ? escapeHtml(last.duration || '—') : '<span class="muted">—</span>';
    const bugLinks = bugsForPlan(planRel, bugs).map((b) => `<a href="test-reports/${escapeHtml(b.fileRel)}" title="${escapeHtml(b.name)}">bug</a>`).join(' · ');
    const planLink = `<a href="${escapeHtml(planRel)}" title="Open plan">plan</a>`;
    const reportLink = last ? `<a href="${escapeHtml(reportLinkHref(last, projectRoot))}">latest report</a>` : '<span class="muted">no report</span>';
    const links = [planLink, reportLink, bugLinks].filter(Boolean).join(' · ');
    const rowClass = rowFilterClass(planObj, last);
    const canRun = !!planObj.spec;
    const rerunBtn = canRun
      ? `<button type="button" class="btn-rerun" data-action="rerun" data-project="${escapeHtml(projectName)}" data-plan="${escapeHtml(planRel)}" title="Re-run this test in GitHub Actions">▶ Re-run</button>`
      : `<button type="button" class="btn-rerun" disabled title="No spec file — generate one with /create-test first">▶ Re-run</button>`;
    const displayName = stripPrefix && planRel.startsWith(stripPrefix)
      ? planRel.slice(stripPrefix.length)
      : planRel.replace(/^test-plans\//, '');
    return `
      <tr data-status="${rowClass}">
        <td class="plan-cell">
          <div class="plan-name">${escapeHtml(displayName)}</div>
          <div class="plan-badges">${badgesFor(planObj, runs)}</div>
        </td>
        <td>${status}</td>
        <td class="nowrap">${lastDate}</td>
        <td class="nowrap">${dur}</td>
        <td class="num">${runs.length}</td>
        <td>${sparklineHtml(runs)}</td>
        <td class="links">${links}</td>
        <td class="actions-cell">${rerunBtn}</td>
      </tr>`;
  }

  const sortedPlanEntries = [...byPlan.entries()].sort((a, b) => {
    const aDate = a[1][0]?.date || '0000';
    const bDate = b[1][0]?.date || '0000';
    if (aDate !== bDate) return bDate.localeCompare(aDate);
    return a[0].localeCompare(b[0]);
  });
  const sectionMap = groupBySection(sortedPlanEntries);

  const sectionsHtml = [...sectionMap.entries()].map(([sectionKey, entries]) => {
    const sectionTitle = sectionKey === '_root' ? 'General' : titleCaseSlug(sectionKey);
    const stripPrefix = sectionKey === '_root' ? 'test-plans/' : `test-plans/${sectionKey}/`;
    const planCount = entries.length;
    const failingInSection = entries.filter(([, runs]) => runs[0]?.result === 'FAILED').length;

    const rows = entries.map((e) => renderPlanRow(e, { stripPrefix })).join('');

    const runnablePlans = entries
      .filter(([planRel]) => plans.find((p) => p.plan === planRel)?.spec)
      .map(([planRel]) => planRel);
    const sectionBtn = runnablePlans.length > 0
      ? `<button type="button" class="btn-rerun btn-rerun-section"
               data-action="rerun-section"
               data-project="${escapeHtml(projectName)}"
               data-section="${escapeHtml(sectionTitle)}"
               data-plans='${escapeHtml(JSON.stringify(runnablePlans))}'
               title="Run every plan in this section that has a spec">▶ Run section <span class="meta">${runnablePlans.length}</span></button>`
      : `<button type="button" class="btn-rerun btn-rerun-section" disabled title="No runnable specs in this section">▶ Run section</button>`;

    const stats = [];
    stats.push(`<span class="muted">${planCount} plan${planCount === 1 ? '' : 's'}</span>`);
    if (failingInSection > 0) stats.push(`<span class="pill pill-fail">${failingInSection} failing</span>`);

    return `
      <section class="panel section-panel" data-section="${escapeHtml(sectionKey)}">
        <div class="panel-head section-head">
          <div class="section-title-group">
            <h3 class="section-title">${escapeHtml(sectionTitle)}</h3>
            <span class="section-stats">${stats.join('')}</span>
          </div>
          <div class="section-actions">${sectionBtn}</div>
        </div>
        <div class="panel-body no-pad" style="overflow-x:auto;">
          <table class="flows">
            <thead><tr>
              <th>Plan</th><th>Last result</th><th>Last run</th><th>Duration</th><th>Runs</th><th>History</th><th>Links</th><th>Actions</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>`;
  }).join('');

  const passingCount = [...byPlan.entries()].filter(([, runs]) => runs[0] && runs[0].result === 'PASSED').length;
  const partialCount = [...byPlan.entries()].filter(([, runs]) => runs[0] && runs[0].result === 'PARTIAL').length;
  const neverCount = [...byPlan.entries()].filter(([, runs]) => !runs[0]).length;

  const byDate = new Map();
  for (const r of reports) {
    if (!r.date) continue;
    if (!byDate.has(r.date)) byDate.set(r.date, []);
    byDate.get(r.date).push(r);
  }
  const timelineGroups = [...byDate.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([date, list]) => {
    const items = list.map((r) => `
      <li class="timeline-run">
        <span class="pill pill-${resultPillClass(r.result)}">${escapeHtml(r.result)}</span>
        <a class="run-link" href="${escapeHtml(reportLinkHref(r, projectRoot))}">${escapeHtml(r.plan ? r.plan.replace(/^test-plans\//, '') : path.basename(r.file))}</a>
        <span class="muted">${escapeHtml(r.duration || '')}${r.mode ? ` · ${escapeHtml(r.mode)}` : ''}</span>
      </li>`).join('');
    return `
      <section class="timeline-day">
        <header><h3>${escapeHtml(formatDateLabel(date))}</h3><span class="muted">${list.length} run${list.length === 1 ? '' : 's'}</span></header>
        <ul>${items}</ul>
      </section>`;
  }).join('');

  const generated = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const displayName = meta.displayName || projectName;
  const envChip = meta.environment ? `<span class="env-chip">${escapeHtml(meta.environment)}</span>` : '';
  const appUrlLink = meta.appUrl
    ? `<a href="${escapeHtml(meta.appUrl)}" target="_blank" rel="noreferrer">${escapeHtml(meta.appUrl)}</a>`
    : '';

  const failingKpiClass = failingFlows > 0 ? 'kpi-warn' : 'kpi-good';
  const passKpiClass = recentRuns.length === 0
    ? 'kpi-muted'
    : (recentPass / recentRuns.length >= 0.8 ? 'kpi-good' : (recentPass / recentRuns.length === 0 ? 'kpi-warn' : ''));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(displayName)} · Test Reports Hub</title>
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

  <main class="container">
    <div class="crumbs"><a href="../../index.html">Projects</a> / <span>${escapeHtml(displayName)}</span></div>

    <div class="project-header">
      <div>
        <div class="title-row">
          <h1>${escapeHtml(displayName)}</h1>
          ${envChip}
        </div>
        <div class="subtitle">${appUrlLink || '&nbsp;'}</div>
      </div>
      <div class="actions">
        ${hasAllure
          ? `<button type="button" id="allure-toggle" class="btn btn-primary">Open Allure visualisation<span class="meta">run-by-run breakdown</span></button>`
          : `<span class="btn disabled" aria-disabled="true">Allure report not generated<span class="meta">run a test to produce it</span></span>`}
      </div>
    </div>

    ${hasAllure ? `
    <div id="allure-panel" class="allure-modal" aria-hidden="true" role="dialog" aria-label="Allure visualisation">
      <div class="dialog">
        <div class="head">
          <span class="title">Allure visualisation</span>
          <span class="right">
            <a class="popout" href="allure-report/index.html" target="_blank" rel="noopener">open in new tab ↗</a>
            <button type="button" class="close" id="allure-close">Close (Esc)</button>
          </span>
        </div>
        <div class="allure-frame-wrap">
          <div class="loader" id="allure-loader">Loading Allure report (3MB)…</div>
          <iframe id="allure-frame" title="Allure report" loading="lazy"></iframe>
        </div>
      </div>
    </div>` : ''}

    <section class="kpis" aria-label="Overview">
      <div class="kpi"><span class="label">Test flows</span><span class="num">${totalPlans}</span><span class="meta">tracked plans</span></div>
      <div class="kpi"><span class="label">Total runs</span><span class="num">${totalRuns}</span><span class="meta">all time</span></div>
      <div class="kpi ${passKpiClass}"><span class="label">7-day pass rate</span><span class="num">${recentPassPct}</span><span class="meta">${recentRuns.length} run${recentRuns.length === 1 ? '' : 's'} in the last 7 days</span></div>
      <div class="kpi ${failingKpiClass}"><span class="label">Currently failing</span><span class="num">${failingFlows}</span><span class="meta">flow${failingFlows === 1 ? '' : 's'} with a failing last run</span></div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2>Activity — last ${HEATMAP_WEEKS} weeks</h2>
        <div class="legend">
          <div class="group"><span>less</span>
            <span class="swatch" style="background:#ebedf0"></span>
            <span class="swatch" style="background:#9be9a8"></span>
            <span class="swatch" style="background:#40c463"></span>
            <span class="swatch" style="background:#30a14e"></span>
            <span class="swatch" style="background:#216e39"></span>
            <span>more</span>
          </div>
          <div class="group">fail
            <span class="swatch" style="background:#ef4444"></span>
            <span class="swatch" style="background:#b91c1c"></span>
            <span class="swatch" style="background:#7f1d1d"></span>
          </div>
          <div class="group">partial
            <span class="swatch" style="background:#f59e0b"></span>
          </div>
        </div>
      </div>
      <div class="panel-body">${heatmapSvg}</div>
    </section>

    <div class="flows-toolbar">
      <h2>Flows by section</h2>
      <div class="chips" id="flow-filter" role="tablist" aria-label="Filter flows by status">
        <button type="button" class="chip active" data-filter="all">All<span class="count">${totalPlans}</span></button>
        <button type="button" class="chip" data-filter="failing">Failing<span class="count">${failingFlows}</span></button>
        <button type="button" class="chip" data-filter="partial">Partial<span class="count">${partialCount}</span></button>
        <button type="button" class="chip" data-filter="passing">Passing<span class="count">${passingCount}</span></button>
        <button type="button" class="chip" data-filter="never">Never run<span class="count">${neverCount}</span></button>
      </div>
    </div>
    <div id="sections-wrap">
      ${sectionsHtml || '<div class="empty"><strong>No test plans found.</strong>Add a <code>.md</code> file under <code>test-plans/&lt;section&gt;/</code> to see it here.</div>'}
    </div>

    <h2>Run timeline</h2>
    ${timelineGroups || '<div class="empty"><strong>No runs recorded yet.</strong>Reports will appear here once tests are executed.</div>'}

    <footer class="page-footer">
      <span>Generated ${generated} · project <code>${escapeHtml(projectName)}</code></span>
      <span><code>node scripts/build-project-dashboard.js --project=${escapeHtml(projectName)}</code></span>
    </footer>
  </main>

  <script>
    (function () {
      var chips = Array.prototype.slice.call(document.querySelectorAll('#flow-filter .chip'));
      var sections = Array.prototype.slice.call(document.querySelectorAll('.section-panel'));
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          var f = chip.getAttribute('data-filter');
          sections.forEach(function (section) {
            var visible = 0;
            Array.prototype.slice.call(section.querySelectorAll('tbody tr[data-status]')).forEach(function (r) {
              var show = (f === 'all' || r.getAttribute('data-status') === f);
              r.style.display = show ? '' : 'none';
              if (show) visible++;
            });
            section.style.display = visible === 0 ? 'none' : '';
          });
        });
      });
    })();
  </script>

  ${hasAllure ? `<script>
    (function () {
      var btn = document.getElementById('allure-toggle');
      var panel = document.getElementById('allure-panel');
      var frame = document.getElementById('allure-frame');
      var loader = document.getElementById('allure-loader');
      var closeBtn = document.getElementById('allure-close');
      if (!btn || !panel || !frame) return;
      var loaded = false;
      function open() {
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        if (!loaded) {
          frame.addEventListener('load', function () { loader.classList.add('hidden'); }, { once: true });
          frame.src = 'allure-report/index.html';
          loaded = true;
        }
      }
      function close() {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
      }
      btn.addEventListener('click', open);
      if (closeBtn) closeBtn.addEventListener('click', close);
      panel.addEventListener('click', function (e) { if (e.target === panel) close(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && panel.classList.contains('open')) close();
      });
    })();
  </script>` : ''}

  <div id="toast-stack" class="toast-stack" aria-live="polite"></div>

  <script>
    (function () {
      var WORKFLOW_URL = ${JSON.stringify(RUN_TEST_WORKFLOW)};
      var stack = document.getElementById('toast-stack');
      if (!stack) return;

      function copyToClipboard(text, btn) {
        var done = function () {
          if (!btn) return;
          var original = btn.textContent;
          btn.textContent = 'copied';
          btn.classList.add('copied');
          setTimeout(function () { btn.textContent = original; btn.classList.remove('copied'); }, 1200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {
            window.prompt('Copy:', text);
          });
        } else {
          window.prompt('Copy:', text);
        }
      }

      function showToast(project, plan) {
        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML =
          '<div class="toast-head">' +
            '<div class="toast-title"><span class="dot"></span>Re-run triggered</div>' +
            '<button type="button" class="toast-close" aria-label="Close">×</button>' +
          '</div>' +
          '<div class="toast-body">' +
            '<p>A new GitHub Actions tab just opened. Click <strong>Run workflow</strong> there and paste these values:</p>' +
            '<div class="input-row"><span class="label">project</span><code data-val="' + project.replace(/"/g, '&quot;') + '">' + project + '</code><button type="button" class="copy" data-copy="' + project.replace(/"/g, '&quot;') + '">copy</button></div>' +
            '<div class="input-row"><span class="label">plan</span><code data-val="' + plan.replace(/"/g, '&quot;') + '">' + plan + '</code><button type="button" class="copy" data-copy="' + plan.replace(/"/g, '&quot;') + '">copy</button></div>' +
            '<div class="toast-foot">When the run finishes, GitHub auto-commits the report back to this hub. Refresh this page in ~1–2 min to see the updated row.</div>' +
          '</div>';
        stack.appendChild(toast);
        requestAnimationFrame(function () { toast.classList.add('in'); });

        toast.querySelector('.toast-close').addEventListener('click', function () {
          toast.classList.remove('in');
          setTimeout(function () { toast.remove(); }, 250);
        });
        Array.prototype.slice.call(toast.querySelectorAll('button.copy')).forEach(function (b) {
          b.addEventListener('click', function () { copyToClipboard(b.getAttribute('data-copy'), b); });
        });

        // Auto-dismiss after 30s
        setTimeout(function () {
          if (!toast.parentNode) return;
          toast.classList.remove('in');
          setTimeout(function () { toast.remove(); }, 250);
        }, 30000);
      }

      function handleRerun(btn) {
        var project = btn.getAttribute('data-project');
        var plan = btn.getAttribute('data-plan');
        if (!project || !plan) return;
        // Visual feedback on the row
        btn.classList.add('is-pending');
        setTimeout(function () { btn.classList.remove('is-pending'); }, 3000);
        // Open the GitHub Actions workflow_dispatch UI in a new tab
        window.open(WORKFLOW_URL, '_blank', 'noopener');
        // Show the toast with copy-ready input values
        showToast(project, plan);
      }

      function escAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

      function showSectionToast(project, section, plans) {
        var toast = document.createElement('div');
        toast.className = 'toast toast-section';
        var planRows = plans.map(function (p, i) {
          return '<div class="input-row"><span class="label">plan ' + (i + 1) + '/' + plans.length + '</span>' +
                 '<code>' + escAttr(p) + '</code>' +
                 '<button type="button" class="copy" data-copy="' + escAttr(p) + '">copy</button></div>';
        }).join('');
        toast.innerHTML =
          '<div class="toast-head">' +
            '<div class="toast-title"><span class="dot"></span>Section: ' + escAttr(section) + '</div>' +
            '<button type="button" class="toast-close" aria-label="Close">×</button>' +
          '</div>' +
          '<div class="toast-body">' +
            '<p>A GitHub Actions tab opened. The workflow only accepts one plan at a time, so dispatch it ' + plans.length + ' time' + (plans.length === 1 ? '' : 's') + ' — copy each plan in turn:</p>' +
            '<div class="input-row"><span class="label">project</span><code>' + escAttr(project) + '</code><button type="button" class="copy" data-copy="' + escAttr(project) + '">copy</button></div>' +
            '<div class="section-plans-list">' + planRows + '</div>' +
            '<div class="toast-foot">Each run auto-commits its report back to this hub. Refresh after they finish to see the updated rows.</div>' +
          '</div>';
        stack.appendChild(toast);
        requestAnimationFrame(function () { toast.classList.add('in'); });

        toast.querySelector('.toast-close').addEventListener('click', function () {
          toast.classList.remove('in');
          setTimeout(function () { toast.remove(); }, 250);
        });
        Array.prototype.slice.call(toast.querySelectorAll('button.copy')).forEach(function (b) {
          b.addEventListener('click', function () { copyToClipboard(b.getAttribute('data-copy'), b); });
        });

        // Section toasts stay longer than single-plan toasts.
        setTimeout(function () {
          if (!toast.parentNode) return;
          toast.classList.remove('in');
          setTimeout(function () { toast.remove(); }, 250);
        }, 60000);
      }

      function handleRerunSection(btn) {
        var project = btn.getAttribute('data-project');
        var section = btn.getAttribute('data-section');
        var raw = btn.getAttribute('data-plans');
        if (!project || !raw) return;
        var plans;
        try { plans = JSON.parse(raw); } catch (e) { plans = []; }
        if (!Array.isArray(plans) || plans.length === 0) return;
        btn.classList.add('is-pending');
        setTimeout(function () { btn.classList.remove('is-pending'); }, 3000);
        window.open(WORKFLOW_URL, '_blank', 'noopener');
        showSectionToast(project, section, plans);
      }

      Array.prototype.slice.call(document.querySelectorAll('[data-action="rerun"]')).forEach(function (btn) {
        btn.addEventListener('click', function (e) { e.preventDefault(); handleRerun(btn); });
      });
      Array.prototype.slice.call(document.querySelectorAll('[data-action="rerun-section"]')).forEach(function (btn) {
        btn.addEventListener('click', function (e) { e.preventDefault(); handleRerunSection(btn); });
      });
    })();
  </script>

  <script src="../../assets/markdown-viewer.js"></script>
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
  const hasAllure = fs.existsSync(path.join(projectRoot, 'allure-report', 'index.html'));

  const out = html({ plans, reports, byPlan, heatmap, bugs, meta, projectName, projectRoot, hasAllure });
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
