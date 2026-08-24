#!/usr/bin/env node
/**
 * Build the top-level landing data:
 *   - hub.json  ← list of projects + per-project rollup (pretty-printed)
 *   - hub.js    ← same data as window.__HUB__ so the page works over file://
 *
 * index.html is tracked in git and is never touched by this script.
 * Reads each project's meta.json + summary.json (written by build-project-data.js).
 *
 * Usage: node scripts/build-hub-data.js
 */

const fs = require('fs');
const path = require('path');

const HUB_ROOT = path.resolve(__dirname, '..');
const PROJECTS_ROOT = path.join(HUB_ROOT, 'projects');
const HUB_JSON = path.join(HUB_ROOT, 'hub.json');
const HUB_JS = path.join(HUB_ROOT, 'hub.js');

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

function healthOf(summary) {
  if (!summary || !summary.lastRun) return 'unknown';
  if (summary.failingFlows > 0) return 'failing';
  if (summary.lastRun.result === 'PARTIAL') return 'partial';
  if (summary.lastRun.result === 'PASSED') return 'healthy';
  return 'unknown';
}

function build() {
  const names = listProjects();

  const projects = names.map((name) => {
    const projectDir = path.join(PROJECTS_ROOT, name);
    const meta = readJsonSafe(path.join(projectDir, 'meta.json')) || {};
    const summary = readJsonSafe(path.join(projectDir, 'summary.json')) || {
      totalPlans: 0, totalRuns: 0, last7Runs: 0, last7Pass: 0, last7PassPct: null, failingFlows: 0, lastRun: null,
    };
    return {
      name,
      displayName: meta.displayName || name,
      appUrl: meta.appUrl || null,
      environment: meta.environment || null,
      sourceRepo: meta.sourceRepo || meta.source?.repo || null,
      description: meta.description || null,
      health: healthOf(summary),
      summary,
      href: `projects/${encodeURIComponent(name)}/index.html`,
    };
  });

  // Sort: failing → partial → healthy → unknown, alpha within group
  const healthOrder = { failing: 0, partial: 1, healthy: 2, unknown: 3 };
  projects.sort((a, b) => {
    const ha = healthOrder[a.health];
    const hb = healthOrder[b.health];
    if (ha !== hb) return ha - hb;
    return a.displayName.localeCompare(b.displayName);
  });

  const totals = projects.reduce((acc, p) => {
    acc.totalPlans += p.summary.totalPlans || 0;
    acc.totalRuns += p.summary.totalRuns || 0;
    acc.last7Runs += p.summary.last7Runs || 0;
    acc.failingFlows += p.summary.failingFlows || 0;
    return acc;
  }, { totalPlans: 0, totalRuns: 0, last7Runs: 0, failingFlows: 0 });

  const hub = {
    generated: new Date().toISOString(),
    projects,
    totals: {
      totalProjects: projects.length,
      ...totals,
    },
  };

  fs.writeFileSync(HUB_JSON, JSON.stringify(hub, null, 2));
  fs.writeFileSync(HUB_JS, `window.__HUB__ = ${JSON.stringify(hub)};\n`);

  console.log(`[hub] ${projects.length} project(s) → hub.json + hub.js`);
}

if (require.main === module) build();

module.exports = { build };
