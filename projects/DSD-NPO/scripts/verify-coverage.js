#!/usr/bin/env node
/**
 * Verify DSD-NPO smoke-plan coverage from the reports themselves.
 *
 * Why this exists: coverage was counted by hand twice and was wrong twice (45/70 reported when it was 52/70).
 * The causes were compressed front matter (`TC-10-001/002/006/007`, which the `**Cases:**` regex cannot parse)
 * and a prose mention of a TC id in one report being counted as executed.
 *
 * Rules enforced here:
 *   - `**Cases:**` must be a comma-separated list of FULL TC ids (TC-NN-NNN / TC-NNX-NNN).
 *   - Ids that were assessed but not run belong on a separate `**Assessed-not-executed:**` line and are NOT counted.
 *   - Only reports inside a dated folder (test-reports/YYYY-MM-DD/) count as runs.
 *
 * Usage:  node projects/DSD-NPO/scripts/verify-coverage.js
 */
const fs = require('fs');
const path = require('path');

const PROJECT = path.resolve(__dirname, '..');
const PLANS = path.join(PROJECT, 'test-plans');
const REPORTS = path.join(PROJECT, 'test-reports');

const TC = '(TC-\\d{2}[A-Z]?-\\d{3})';

function walk(dir, filter) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, filter));
    else if (filter(p)) out.push(p);
  }
  return out;
}

// ---- 1. the universe of cases, taken from the plans' ADO annotations -------------------------------
const planned = new Map(); // tcId -> plan file
for (const f of walk(PLANS, p => p.endsWith('.md') && !p.endsWith('RULES.md'))) {
  const txt = fs.readFileSync(f, 'utf8');
  for (const m of txt.matchAll(new RegExp(`ADO #\\d+\\s*·\\s*${TC}`, 'g'))) {
    planned.set(m[1], path.relative(PROJECT, f));
  }
}

// ---- 2. what the run reports claim ----------------------------------------------------------------
const executed = new Map();      // tcId -> [report...]
const assessedOnly = new Map();  // tcId -> [report...]
const problems = [];

const dated = /test-reports[\\/]\d{4}-\d{2}-\d{2}[\\/]/;
for (const f of walk(REPORTS, p => p.endsWith('.md'))) {
  const rel = path.relative(PROJECT, f);
  const txt = fs.readFileSync(f, 'utf8');
  const isRun = dated.test(f);

  if (!isRun) continue; // audits/, bugs/, observations/ are not runs

  // front matter must not be bulleted, and Result must start with a bare status token
  const resultLine = txt.match(/^\*\*Result:\*\*\s*(.+)$/m);
  if (!resultLine) {
    problems.push(`${rel}: no parseable **Result:** line (bulleted front matter?)`);
  } else if (!/^(PASSED|FAILED|PARTIAL|SKIPPED|BLOCKED)\b/.test(resultLine[1].trim())) {
    problems.push(`${rel}: **Result:** does not start with a bare status token → "${resultLine[1].slice(0, 40)}"`);
  }
  const planLine = txt.match(/^\*\*Plan:\*\*\s*(.+)$/m);
  if (!planLine) problems.push(`${rel}: no **Plan:** line`);
  else if (!/^test-plans\/[\w\-/]+\.md$/.test(planLine[1].trim())) {
    problems.push(`${rel}: **Plan:** is not a bare plan path → "${planLine[1].trim()}"`);
  }

  const casesLine = txt.match(/^\*\*Cases:\*\*\s*(.+)$/m);
  if (!casesLine) {
    problems.push(`${rel}: no **Cases:** line — its cases cannot be counted`);
  } else {
    const raw = casesLine[1].trim();
    if (/\/\d{3}/.test(raw)) {
      problems.push(`${rel}: **Cases:** uses compressed ids ("${raw.slice(0, 40)}") — write full ids, comma-separated`);
    }
    for (const m of raw.matchAll(new RegExp(TC, 'g'))) {
      if (!executed.has(m[1])) executed.set(m[1], []);
      executed.get(m[1]).push(rel);
    }
  }

  const naLine = txt.match(/^\*\*Assessed-not-executed:\*\*\s*(.+)$/m);
  if (naLine) {
    for (const m of naLine[1].matchAll(new RegExp(TC, 'g'))) {
      if (!assessedOnly.has(m[1])) assessedOnly.set(m[1], []);
      assessedOnly.get(m[1]).push(rel);
    }
  }
}

// ---- 3. report ------------------------------------------------------------------------------------
const plannedIds = [...planned.keys()].sort();
const executedIds = [...executed.keys()].sort();
const notRun = plannedIds.filter(id => !executed.has(id));
const unknown = executedIds.filter(id => !planned.has(id));

console.log('DSD-NPO smoke coverage');
console.log('='.repeat(58));
console.log(`Cases found in plans      : ${plannedIds.length}`);
console.log(`Cases marked executed     : ${executedIds.length}`);
console.log(`Cases still to run        : ${notRun.length}`);
console.log('');

if (notRun.length) {
  console.log('Not yet executed:');
  const bySuite = {};
  for (const id of notRun) {
    const suite = id.slice(3, id.lastIndexOf('-'));
    (bySuite[suite] ||= []).push(id);
  }
  for (const [suite, ids] of Object.entries(bySuite).sort()) {
    console.log(`  suite ${suite.padEnd(4)} (${ids.length})  ${ids.join(', ')}`);
  }
  console.log('');
}

if (unknown.length) {
  console.log('⚠️  Reported as executed but not found in any plan (typo, or a Functional-plan case):');
  for (const id of unknown) console.log(`  ${id} — ${executed.get(id).join(', ')}`);
  console.log('');
}

const dupes = executedIds.filter(id => executed.get(id).length > 1);
if (dupes.length) {
  console.log('Executed in more than one report (fine, but check it is intentional):');
  for (const id of dupes) console.log(`  ${id} — ${executed.get(id).join(', ')}`);
  console.log('');
}

if (problems.length) {
  console.log('🔴 Front-matter problems — these silently detach runs from the dashboard:');
  for (const p of problems) console.log(`  ${p}`);
  process.exitCode = 1;
} else {
  console.log('✅ All run reports have parseable front matter.');
}
