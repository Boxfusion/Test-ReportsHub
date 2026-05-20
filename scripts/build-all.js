#!/usr/bin/env node
/**
 * Regenerate every project dashboard and the landing page.
 * Usage: node scripts/build-all.js
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const HUB_ROOT = path.resolve(__dirname, '..');
const PROJECTS_ROOT = path.join(HUB_ROOT, 'projects');

function listProjects() {
  if (!fs.existsSync(PROJECTS_ROOT)) return [];
  return fs.readdirSync(PROJECTS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function run(script, args) {
  const result = spawnSync(process.execPath, [path.join(__dirname, script), ...args], {
    stdio: 'inherit',
    cwd: HUB_ROOT,
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

const projects = listProjects();
if (projects.length === 0) {
  console.log('[build-all] No projects yet under projects/. Skipping project dashboards.');
} else {
  for (const name of projects) {
    run('build-project-dashboard.js', [`--project=${name}`]);
  }
}
run('build-landing.js', []);
console.log('[build-all] done.');
