#!/usr/bin/env node
/**
 * Build the top-level landing page at index.html. Lists every project under
 * projects/<name>/ and links to its dashboard. Reads each project's
 * meta.json + summary.json (written by build-project-dashboard.js).
 *
 * Usage: node scripts/build-landing.js
 */

const fs = require('fs');
const path = require('path');
const { SHARED_CSS } = require('./theme');

const HUB_ROOT = path.resolve(__dirname, '..');
const PROJECTS_ROOT = path.join(HUB_ROOT, 'projects');
const OUT_FILE = path.join(HUB_ROOT, 'index.html');

function listProjects() {
  if (!fs.existsSync(PROJECTS_ROOT)) return [];
  return fs.readdirSync(PROJECTS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function readJsonSafe(file) {
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function pillFor(result) {
  if (!result) return '<span class="pill pill-neutral">no runs</span>';
  const cls = { PASSED: 'pass', FAILED: 'fail', PARTIAL: 'partial' }[result] || 'neutral';
  return `<span class="pill pill-${cls}">${escapeHtml(result)}</span>`;
}

function healthOf(summary) {
  if (!summary || !summary.lastRun) return 'unknown';
  if (summary.failingFlows > 0) return 'failing';
  if (summary.lastRun.result === 'PARTIAL') return 'partial';
  if (summary.lastRun.result === 'PASSED') return 'healthy';
  return 'unknown';
}

function healthAccentClass(health) {
  return {
    healthy: 'card-accent-pass',
    failing: 'card-accent-fail',
    partial: 'card-accent-partial',
    unknown: 'card-accent-neutral',
  }[health] || 'card-accent-neutral';
}

function projectCard(name) {
  const projectDir = path.join(PROJECTS_ROOT, name);
  const meta = readJsonSafe(path.join(projectDir, 'meta.json')) || {};
  const summary = readJsonSafe(path.join(projectDir, 'summary.json')) || {
    totalPlans: 0, totalRuns: 0, last7Runs: 0, last7Pass: 0, last7PassPct: null, failingFlows: 0, lastRun: null,
  };
  const displayName = meta.displayName || name;
  const env = meta.environment ? `<span class="env-chip">${escapeHtml(meta.environment)}</span>` : '';
  const appUrl = meta.appUrl
    ? `<div class="app-url" title="${escapeHtml(meta.appUrl)}">${escapeHtml(meta.appUrl)}</div>`
    : '';
  const passPct = summary.last7PassPct == null ? '—' : `${summary.last7PassPct}%`;
  const lastRun = summary.lastRun
    ? `${pillFor(summary.lastRun.result)} <span class="muted">${escapeHtml(summary.lastRun.date)}</span>`
    : '<span class="muted">no runs yet</span>';

  const health = healthOf(summary);
  const accent = healthAccentClass(health);

  return `
    <a class="project-card ${accent}" href="projects/${encodeURIComponent(name)}/index.html" data-name="${escapeHtml(displayName.toLowerCase())}" data-health="${health}">
      <div class="project-card-head">
        <div class="project-card-title">
          <h2>${escapeHtml(displayName)}</h2>
          ${env}
        </div>
        ${appUrl}
      </div>
      <dl class="stats">
        <div><dt>Last run</dt><dd>${lastRun}</dd></div>
        <div><dt>Flows</dt><dd>${summary.totalPlans}</dd></div>
        <div><dt>Total runs</dt><dd>${summary.totalRuns}</dd></div>
        <div><dt>7d pass rate</dt><dd>${passPct} <span class="muted">(${summary.last7Runs} run${summary.last7Runs === 1 ? '' : 's'})</span></dd></div>
        <div><dt>Failing</dt><dd>${summary.failingFlows} <span class="muted">flow${summary.failingFlows === 1 ? '' : 's'}</span></dd></div>
      </dl>
      <div class="project-card-foot">
        <span class="cta">Open dashboard →</span>
      </div>
    </a>`;
}

function main() {
  const projects = listProjects();

  const summaries = projects.map((n) => readJsonSafe(path.join(PROJECTS_ROOT, n, 'summary.json')) || {});
  const totalPlans = summaries.reduce((acc, s) => acc + (s.totalPlans || 0), 0);
  const totalRuns = summaries.reduce((acc, s) => acc + (s.totalRuns || 0), 0);
  const totalFailing = summaries.reduce((acc, s) => acc + (s.failingFlows || 0), 0);
  const last7Runs = summaries.reduce((acc, s) => acc + (s.last7Runs || 0), 0);

  // Sort: failing first, then partial, then healthy, then unknown — alpha within group
  const ordered = projects
    .map((name, i) => ({ name, summary: summaries[i] || {}, meta: readJsonSafe(path.join(PROJECTS_ROOT, name, 'meta.json')) || {} }))
    .sort((a, b) => {
      const order = { failing: 0, partial: 1, healthy: 2, unknown: 3 };
      const ha = order[healthOf(a.summary)];
      const hb = order[healthOf(b.summary)];
      if (ha !== hb) return ha - hb;
      return (a.meta.displayName || a.name).localeCompare(b.meta.displayName || b.name);
    });

  const cards = ordered.length === 0
    ? `<div class="empty">
         <strong>No projects yet</strong>
         Add one under <code>projects/&lt;name&gt;/</code> with a <code>meta.json</code>, then run <code>node scripts/build-all.js</code>.
       </div>`
    : ordered.map((p) => projectCard(p.name)).join('');

  const generated = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  const failingKpiClass = totalFailing > 0 ? 'kpi-warn' : 'kpi-good';

  const out = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Test Reports Hub · Boxfusion</title>
<style>
${SHARED_CSS}

  /* ───── Landing-specific ───── */
  .toolbar {
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    margin-bottom: 1.25rem; flex-wrap: wrap;
  }
  .toolbar .chips { gap: .4rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
  .project-card {
    display: flex; flex-direction: column; gap: .25rem;
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 1.1rem 1.25rem 1rem; text-decoration: none; color: var(--ink);
    box-shadow: var(--shadow-sm);
    transition: border-color .15s, box-shadow .15s, transform .15s;
    position: relative; overflow: hidden;
  }
  .project-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--border-strong);
  }
  .project-card.card-accent-pass::before { background: var(--pass-line); }
  .project-card.card-accent-fail::before { background: var(--fail-line); }
  .project-card.card-accent-partial::before { background: var(--partial-line); }
  .project-card.card-accent-neutral::before { background: var(--border-strong); }
  .project-card:hover {
    border-color: var(--border-strong); box-shadow: var(--shadow-md); transform: translateY(-1px);
    text-decoration: none;
  }
  .project-card-head {
    display: flex; flex-direction: column; gap: .25rem;
    margin-bottom: .75rem;
  }
  .project-card-title { display: flex; align-items: center; gap: .55rem; flex-wrap: wrap; }
  .project-card h2 { margin: 0; font-size: 1.05rem; font-weight: 600; letter-spacing: -.01em; }
  .project-card .app-url {
    font-size: .76rem; color: var(--muted);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;
  }
  .project-card:hover .app-url { color: var(--accent); }
  dl.stats {
    display: grid; grid-template-columns: 1fr 1fr; gap: .65rem 1rem;
    margin: 0 0 .85rem; padding: .75rem 0 0; border-top: 1px solid var(--border);
  }
  dl.stats > div { display: flex; flex-direction: column; min-width: 0; }
  dl.stats dt { font-size: .62rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); font-weight: 600; margin-bottom: .2rem; }
  dl.stats dd { margin: 0; font-size: .9rem; font-weight: 500; color: var(--ink); display: flex; align-items: center; gap: .35rem; flex-wrap: wrap; }
  .project-card-foot {
    display: flex; align-items: center; justify-content: flex-end;
    border-top: 1px solid var(--border); padding-top: .65rem; margin-top: auto;
  }
  .cta { color: var(--accent); font-size: .82rem; font-weight: 500; }

  .no-results {
    grid-column: 1 / -1;
    text-align: center; color: var(--muted); padding: 2rem 1rem;
    border: 1px dashed var(--border); border-radius: var(--radius); background: var(--surface);
  }
</style>
</head>
<body>
  <header class="topbar">
    <div class="inner">
      <a class="brand" href="index.html">
        <span class="mark">TR</span>
        <span class="name">Test Reports Hub<span class="org">Boxfusion</span></span>
      </a>
      <nav>
        <span>${projects.length} project${projects.length === 1 ? '' : 's'}</span>
      </nav>
    </div>
  </header>

  <main class="container">
    <div class="page-head">
      <h1>Test Reports Hub</h1>
      <p class="subtitle">Centralised test report dashboards across Boxfusion projects.</p>
    </div>

    <section class="kpis" aria-label="Overview">
      <div class="kpi"><span class="label">Projects</span><span class="num">${projects.length}</span><span class="meta">tracked here</span></div>
      <div class="kpi"><span class="label">Test flows</span><span class="num">${totalPlans}</span><span class="meta">across all projects</span></div>
      <div class="kpi"><span class="label">Total runs</span><span class="num">${totalRuns}</span><span class="meta">${last7Runs} in the last 7 days</span></div>
      <div class="kpi ${failingKpiClass}"><span class="label">Currently failing</span><span class="num">${totalFailing}</span><span class="meta">flow${totalFailing === 1 ? '' : 's'} with a failing last run</span></div>
    </section>

    <div class="toolbar">
      <div class="chips" role="tablist" aria-label="Filter projects by health">
        <button type="button" class="chip active" data-filter="all">All<span class="count">${projects.length}</span></button>
        <button type="button" class="chip" data-filter="failing">Failing<span class="count">${ordered.filter((p) => healthOf(p.summary) === 'failing').length}</span></button>
        <button type="button" class="chip" data-filter="partial">Partial<span class="count">${ordered.filter((p) => healthOf(p.summary) === 'partial').length}</span></button>
        <button type="button" class="chip" data-filter="healthy">Healthy<span class="count">${ordered.filter((p) => healthOf(p.summary) === 'healthy').length}</span></button>
        <button type="button" class="chip" data-filter="unknown">Unknown<span class="count">${ordered.filter((p) => healthOf(p.summary) === 'unknown').length}</span></button>
      </div>
      <label class="search" aria-label="Search projects">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3-3"></path></svg>
        <input type="search" id="project-search" placeholder="Search projects…" autocomplete="off" />
      </label>
    </div>

    <section class="grid" id="project-grid">${cards}</section>
    <div id="no-results" class="no-results" hidden>No projects match your search.</div>

    <footer class="page-footer">
      <span>Generated ${generated}</span>
      <span><code>node scripts/build-landing.js</code></span>
    </footer>
  </main>

  <script>
    (function () {
      var grid = document.getElementById('project-grid');
      if (!grid) return;
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.project-card'));
      var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
      var search = document.getElementById('project-search');
      var noResults = document.getElementById('no-results');
      var currentFilter = 'all';
      var currentQuery = '';

      function apply() {
        var visible = 0;
        cards.forEach(function (c) {
          var health = c.getAttribute('data-health') || '';
          var name = c.getAttribute('data-name') || '';
          var matchFilter = currentFilter === 'all' || health === currentFilter;
          var matchQuery = !currentQuery || name.indexOf(currentQuery) !== -1;
          var show = matchFilter && matchQuery;
          c.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        if (noResults) noResults.hidden = visible !== 0;
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          currentFilter = chip.getAttribute('data-filter');
          apply();
        });
      });

      if (search) {
        search.addEventListener('input', function () {
          currentQuery = search.value.trim().toLowerCase();
          apply();
        });
      }
    })();
  </script>
</body>
</html>`;

  fs.writeFileSync(OUT_FILE, out);
  console.log(`[landing] ${projects.length} project(s) → index.html`);
}

main();
