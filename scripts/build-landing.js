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

function pillFor(result) {
  if (!result) return '<span class="pill pill-neutral">—</span>';
  const cls = { PASSED: 'pass', FAILED: 'fail', PARTIAL: 'partial' }[result] || 'neutral';
  return `<span class="pill pill-${cls}">${result}</span>`;
}

function projectCard(name) {
  const projectDir = path.join(PROJECTS_ROOT, name);
  const meta = readJsonSafe(path.join(projectDir, 'meta.json')) || {};
  const summary = readJsonSafe(path.join(projectDir, 'summary.json')) || {
    totalPlans: 0, totalRuns: 0, last7Runs: 0, last7Pass: 0, last7PassPct: null, failingFlows: 0, lastRun: null,
  };
  const displayName = meta.displayName || name;
  const env = meta.environment ? `<span class="env">${meta.environment}</span>` : '';
  const appUrl = meta.appUrl ? `<a class="app-url" href="${meta.appUrl}" target="_blank" rel="noreferrer">${meta.appUrl}</a>` : '';
  const passPct = summary.last7PassPct == null ? '—' : `${summary.last7PassPct}%`;
  const lastRun = summary.lastRun
    ? `${pillFor(summary.lastRun.result)} <span class="muted">${summary.lastRun.date}</span>`
    : '<span class="muted">no runs yet</span>';

  return `
    <a class="project-card" href="projects/${name}/index.html">
      <header>
        <h2>${displayName} ${env}</h2>
        ${appUrl}
      </header>
      <dl class="stats">
        <div><dt>Last run</dt><dd>${lastRun}</dd></div>
        <div><dt>Flows</dt><dd>${summary.totalPlans}</dd></div>
        <div><dt>Total runs</dt><dd>${summary.totalRuns}</dd></div>
        <div><dt>Last 7d pass rate</dt><dd>${passPct} <span class="muted">(${summary.last7Runs} run${summary.last7Runs === 1 ? '' : 's'})</span></dd></div>
        <div><dt>Failing</dt><dd>${summary.failingFlows} <span class="muted">flow${summary.failingFlows === 1 ? '' : 's'}</span></dd></div>
      </dl>
      <footer class="cta">Open dashboard →</footer>
    </a>`;
}

function main() {
  const projects = listProjects();
  const cards = projects.length === 0
    ? '<div class="empty">No projects yet. Add one under <code>projects/&lt;name&gt;/</code>.</div>'
    : projects.map(projectCard).join('');

  const totalPlans = projects.reduce((acc, n) => {
    const s = readJsonSafe(path.join(PROJECTS_ROOT, n, 'summary.json'));
    return acc + (s?.totalPlans || 0);
  }, 0);
  const totalRuns = projects.reduce((acc, n) => {
    const s = readJsonSafe(path.join(PROJECTS_ROOT, n, 'summary.json'));
    return acc + (s?.totalRuns || 0);
  }, 0);
  const totalFailing = projects.reduce((acc, n) => {
    const s = readJsonSafe(path.join(PROJECTS_ROOT, n, 'summary.json'));
    return acc + (s?.failingFlows || 0);
  }, 0);

  const generated = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  const out = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Test Reports Hub</title>
<style>
  :root {
    --bg: #f6f8fa; --card: #ffffff; --ink: #0f172a; --muted: #64748b; --border: #e2e8f0;
    --pass: #15803d; --pass-bg: #dcfce7; --fail: #b91c1c; --fail-bg: #fee2e2;
    --partial: #b45309; --partial-bg: #fef3c7; --neutral: #475569; --neutral-bg: #f1f5f9;
    --accent: #2563eb;
  }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 2rem; background: var(--bg); color: var(--ink); line-height: 1.45; }
  h1 { margin: 0 0 .25rem 0; font-size: 2rem; }
  .subtitle { color: var(--muted); margin-bottom: 1.5rem; }
  .summary { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 2rem; color: var(--muted); font-size: .9rem; }
  .summary strong { color: var(--ink); font-size: 1.1rem; margin-right: .25rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
  .project-card { display: block; background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem 1.5rem; text-decoration: none; color: var(--ink); transition: border-color .15s, transform .15s; }
  .project-card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .project-card header { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; }
  .project-card h2 { margin: 0 0 .25rem 0; font-size: 1.15rem; display: flex; align-items: center; gap: .5rem; }
  .project-card .env { font-size: .65rem; font-weight: 600; letter-spacing: .05em; padding: .1rem .45rem; background: var(--neutral-bg); color: var(--muted); border-radius: 4px; text-transform: uppercase; }
  .app-url { font-size: .75rem; color: var(--muted); text-decoration: none; word-break: break-all; }
  .project-card:hover .app-url { color: var(--accent); }
  dl.stats { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem 1rem; margin: 1rem 0 .75rem; }
  dl.stats > div { display: flex; flex-direction: column; }
  dl.stats dt { font-size: .65rem; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); margin-bottom: .15rem; }
  dl.stats dd { margin: 0; font-size: .95rem; font-weight: 500; }
  .pill { display: inline-block; padding: .1rem .5rem; border-radius: 999px; font-size: .7rem; font-weight: 600; letter-spacing: .03em; }
  .pill-pass { color: var(--pass); background: var(--pass-bg); }
  .pill-fail { color: var(--fail); background: var(--fail-bg); }
  .pill-partial { color: var(--partial); background: var(--partial-bg); }
  .pill-neutral { color: var(--neutral); background: var(--neutral-bg); }
  .muted { color: var(--muted); font-size: .8rem; }
  .cta { color: var(--accent); font-size: .85rem; font-weight: 500; }
  .empty { background: var(--card); border: 1px dashed var(--border); border-radius: 12px; padding: 2rem; text-align: center; color: var(--muted); }
  footer { color: var(--muted); font-size: .8rem; margin-top: 2.5rem; }
</style>
</head>
<body>
  <h1>Test Reports Hub</h1>
  <div class="subtitle">Centralised test report dashboards across Boxfusion projects.</div>

  <div class="summary">
    <span><strong>${projects.length}</strong> project${projects.length === 1 ? '' : 's'}</span>
    <span><strong>${totalPlans}</strong> test flow${totalPlans === 1 ? '' : 's'}</span>
    <span><strong>${totalRuns}</strong> total run${totalRuns === 1 ? '' : 's'}</span>
    <span><strong>${totalFailing}</strong> currently failing</span>
  </div>

  <div class="grid">${cards}</div>

  <footer>Generated ${generated} · <code>node scripts/build-landing.js</code></footer>
</body>
</html>`;

  fs.writeFileSync(OUT_FILE, out);
  console.log(`[landing] ${projects.length} project(s) → index.html`);
}

main();
