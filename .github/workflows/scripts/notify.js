// Read each changed report under projects/<project>/test-reports/<date>/<plan>.md,
// detect FAILED or PARTIAL results, look up the owner from projects/<project>/owners.yml,
// and POST an Adaptive Card to TEAMS_WEBHOOK_URL.
//
// The webhook URL is provided by the workflow as the WEBHOOK env var.
// If WEBHOOK is empty, this script no-ops cleanly (exit 0). It also never throws
// upward — Teams delivery problems do not fail the workflow.

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const webhook = process.env.WEBHOOK || '';
const changedRaw = process.env.CHANGED_FILES || '';
const hubBaseUrl = (process.env.HUB_BASE_URL || '').replace(/\/$/, '');
const ghRepoUrl = (process.env.GH_REPO_URL || '').replace(/\/$/, '');
const defaultBranch = process.env.GH_DEFAULT_BRANCH || 'main';

function bail(msg) {
  console.log(msg);
  process.exit(0);
}

if (!webhook) bail('TEAMS_WEBHOOK_URL not set — skipping notifications.');

const changedFiles = changedRaw.split(/\r?\n/).map(f => f.trim()).filter(Boolean);
if (changedFiles.length === 0) bail('No changed report files — nothing to do.');

const REPORT_PATH_RE = /^projects\/([^/]+)\/test-reports\/(\d{4}-\d{2}-\d{2})\/(.+)\.md$/;
const RESULT_RE = /^\*\*Result:\*\*\s*(PASSED|FAILED|PARTIAL)/m;
const PLAN_RE = /^\*\*Plan:\*\*\s*(.+)$/m;
const FAIL_TC_RE = /^- \[FAIL\]\s+(.+)$/gm;

function loadOwners(project) {
  const ownersPath = `projects/${project}/owners.yml`;
  try {
    return YAML.parse(fs.readFileSync(ownersPath, 'utf8')) || {};
  } catch (e) {
    console.log(`No usable ${ownersPath} (${e.code || e.message}) — falling back to empty owner config.`);
    return { default: [], plans: {} };
  }
}

function resolveOwners(owners, planKey) {
  if (!owners) return [];
  const plans = owners.plans || {};

  // 1. Exact plan match
  if (plans[planKey]) return arr(plans[planKey]);

  // 2. Folder wildcard match — most-specific (longest prefix) wins
  const wildcardMatches = Object.entries(plans)
    .filter(([k]) => k.endsWith('/*') && planKey.startsWith(k.slice(0, -1)))
    .sort((a, b) => b[0].length - a[0].length);
  if (wildcardMatches.length > 0) return arr(wildcardMatches[0][1]);

  // 3. Default
  return arr(owners.default);
}

function arr(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function buildCard({ project, date, planBase, planPath, result, fails, owners, reportFile }) {
  const ownerText = owners.length
    ? owners.map(d => `${d.name} <${d.email}>`).join(', ')
    : '(no owner configured — set projects/' + project + '/owners.yml)';

  const failSummary = fails.length
    ? fails.slice(0, 5).join('\n')
    : '(no per-TC failure lines in report — check the full file)';

  const dashboardUrl = `${hubBaseUrl}/projects/${project}/`;
  const ghReportUrl = `${ghRepoUrl}/blob/${defaultBranch}/${reportFile}`;

  // Bare AdaptiveCard JSON — Power Automate's "Post adaptive card in a chat or channel"
  // action takes this directly when its Adaptive Card field is set to @{string(triggerBody())}.
  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        size: 'Large',
        weight: 'Bolder',
        color: result === 'FAILED' ? 'Attention' : 'Warning',
        text: `${project.toUpperCase()} test ${result} — ${planBase}`,
        wrap: true,
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'Project', value: project },
          { title: 'Plan',    value: planPath },
          { title: 'Result',  value: result },
          { title: 'Date',    value: date },
          { title: 'Owner',   value: ownerText },
        ],
      },
      { type: 'TextBlock', wrap: true, text: 'Failing test(s):' },
      { type: 'TextBlock', wrap: true, isSubtle: true, text: failSummary },
    ],
    actions: [
      { type: 'Action.OpenUrl', title: 'Project dashboard', url: dashboardUrl },
      { type: 'Action.OpenUrl', title: 'Report (markdown)', url: ghReportUrl },
    ],
  };
}

async function postCard(card, tag) {
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
    const text = await res.text();
    console.log(`[${tag}] Teams webhook → HTTP ${res.status} ${text.slice(0, 200)}`);
  } catch (err) {
    console.log(`[${tag}] Teams webhook error: ${err.message}`);
  }
}

async function main() {
  console.log(`Scanning ${changedFiles.length} changed report file(s)...`);
  for (const file of changedFiles) {
    const m = file.match(REPORT_PATH_RE);
    if (!m) {
      console.log(`Skipping non-report path: ${file}`);
      continue;
    }
    const [, project, date, planBase] = m;
    const tag = `${project}/${planBase}`;

    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (e) {
      console.log(`[${tag}] Unreadable file (${e.code || e.message}) — skipping.`);
      continue;
    }

    const rm = content.match(RESULT_RE);
    if (!rm) {
      console.log(`[${tag}] No **Result:** line — skipping.`);
      continue;
    }
    const result = rm[1];
    if (result === 'PASSED') {
      console.log(`[${tag}] PASSED — no notification.`);
      continue;
    }

    const pm = content.match(PLAN_RE);
    const planPath = (pm && pm[1].trim()) || `test-plans/${planBase}.md`;
    const planKey = planPath.replace(/^test-plans\//, '').replace(/\.md$/, '');

    const fails = [];
    let fm;
    while ((fm = FAIL_TC_RE.exec(content)) !== null && fails.length < 5) {
      fails.push(fm[1]);
    }

    const owners = resolveOwners(loadOwners(project), planKey);
    const card = buildCard({
      project, date, planBase, planPath, result, fails, owners, reportFile: file,
    });

    await postCard(card, tag);
  }
}

main().catch(err => {
  console.error('notify.js failed unexpectedly:', err);
  // Never fail the workflow on notification problems.
  process.exit(0);
});
