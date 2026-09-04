#!/usr/bin/env node
/**
 * Pull an Azure DevOps test suite without a PAT.
 *
 * Method (see projects/PD-CRM/CLAUDE.md and projects/DSD-NPO/CLAUDE.md): open a headed browser at
 * dev.azure.com, sign in interactively if needed, then call the REST API with fetch() from inside the
 * page. Cookies authenticate automatically because the page origin IS dev.azure.com.
 *
 * A PERSISTENT profile keeps the session, so sign-in is a one-time cost and later pulls run unattended.
 * That profile holds live session cookies — it lives outside the repo and must never be committed.
 *
 * Usage (from hub root):
 *   node projects/PD-CRM/scripts/ado-pull.js <suiteId> [planId]
 *   node projects/PD-CRM/scripts/ado-pull.js 112754
 *
 * Writes <out>/ado-suite-<suiteId>.json and .txt (a readable digest).
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.resolve(__dirname, '../../../node_modules/playwright-core'));

const ORG = process.env.ADO_ORG || 'boxfusion';
const PROJECT = process.env.ADO_PROJECT || 'PD-Dep';
const PLAN_ID = process.argv[3] || process.env.ADO_PLAN || '112718';
const SUITE_ID = process.argv[2];

const PROFILE = process.env.ADO_PROFILE
  || path.join(process.env.LOCALAPPDATA || process.env.HOME, 'claude-ado-profile');
const OUT = process.env.ADO_OUT || process.cwd();
const SIGNIN_TIMEOUT_MS = 6 * 60 * 1000;

if (!SUITE_ID) {
  console.error('Usage: node projects/PD-CRM/scripts/ado-pull.js <suiteId> [planId]');
  process.exit(2);
}

const PLAN_URL = `https://dev.azure.com/${ORG}/${PROJECT}/_testPlans/define?planId=${PLAN_ID}&suiteId=${SUITE_ID}`;

(async () => {
  fs.mkdirSync(PROFILE, { recursive: true });
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    viewport: { width: 1500, height: 950 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log(`Opening plan ${PLAN_ID}, suite ${SUITE_ID}…`);
  await page.goto(PLAN_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });

  // The ADO SPA redirects while loading, which destroys the execution context mid-evaluate. That is
  // expected, not an error — swallow it and probe again on the next tick.
  const probe = async () => {
    try { return await probeOnce(); } catch { return { ok: false }; }
  };
  const probeOnce = async () => page.evaluate(async ({ org, project, planId }) => {
    try {
      const r = await fetch(`https://dev.azure.com/${org}/${project}/_apis/testplan/Plans/${planId}/suites?api-version=7.1`,
        { credentials: 'include', headers: { Accept: 'application/json' } });
      if (!(r.headers.get('content-type') || '').includes('application/json')) return { ok: false };
      const j = await r.json();
      return { ok: true, count: j.count ?? (j.value || []).length };
    } catch { return { ok: false }; }
  }, { org: ORG, project: PROJECT, planId: PLAN_ID });

  const deadline = Date.now() + SIGNIN_TIMEOUT_MS;
  let authed = false;
  let announced = false;
  while (Date.now() < deadline) {
    const p = await probe();
    if (p.ok) { console.log(`Authenticated. Plan ${PLAN_ID} has ${p.count} suite(s).`); authed = true; break; }
    if (!announced) {
      console.log('\n>>> Sign in to Azure DevOps in the browser window (password + MFA). Waiting…\n');
      announced = true;
    }
    process.stdout.write('.');
    await page.waitForTimeout(5000);
  }
  if (!authed) { console.error('\nTimed out waiting for sign-in.'); await ctx.close(); process.exit(1); }

  const data = await page.evaluate(async ({ org, project, planId, suiteId }) => {
    const getJson = async (url, body) => {
      const r = await fetch(url, {
        credentials: 'include',
        method: body ? 'POST' : 'GET',
        headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!r.ok) return { __error: `${r.status} ${r.statusText}`, __url: url };
      return r.json();
    };

    const base = `https://dev.azure.com/${org}/${project}/_apis/testplan`;
    const suites = await getJson(`${base}/Plans/${planId}/suites?api-version=7.1`);
    const cases = await getJson(`${base}/Plans/${planId}/Suites/${suiteId}/TestCase?api-version=7.1`);
    const ids = (cases.value || []).map(c => c.workItem?.id).filter(Boolean);

    let details = { value: [] };
    if (ids.length) {
      details = await getJson(`https://dev.azure.com/${org}/_apis/wit/workitemsbatch?api-version=7.1`, {
        ids: ids.slice(0, 200),
        fields: [
          'System.Id', 'System.Title', 'System.State', 'System.Tags', 'System.Description',
          'System.WorkItemType', 'System.AreaPath', 'Microsoft.VSTS.TCM.Steps',
          'Microsoft.VSTS.TCM.LocalDataSource', 'Microsoft.VSTS.Common.Priority',
        ],
      });
    }

    // Steps XML is DOUBLE-escaped: parse the XML, then parse each parameterizedString's textContent
    // AS HTML. Unescape before stripping tags or "&lt;P&gt;" survives as a literal "<P>".
    const htmlToText = (html) => {
      const d = new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html');
      return (d.body.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
    };
    const parseSteps = (xml) => {
      if (!xml) return [];
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const out = [];
      doc.querySelectorAll('step').forEach((s, i) => {
        const ps = s.querySelectorAll('parameterizedString');
        out.push({
          index: i + 1,
          action: htmlToText(ps[0] ? ps[0].textContent : ''),
          expected: htmlToText(ps[1] ? ps[1].textContent : ''),
        });
      });
      return out;
    };

    return {
      suites: (suites.value || []).map(s => ({ id: s.id, name: s.name, parent: s.parentSuite?.id ?? null })),
      caseCount: (cases.value || []).length,
      casesError: cases.__error || null,
      cases: (details.value || []).map(w => ({
        id: w.id,
        title: w.fields?.['System.Title'] || '',
        state: w.fields?.['System.State'] || '',
        tags: w.fields?.['System.Tags'] || '',
        priority: w.fields?.['Microsoft.VSTS.Common.Priority'] ?? null,
        description: htmlToText(w.fields?.['System.Description'] || ''),
        steps: parseSteps(w.fields?.['Microsoft.VSTS.TCM.Steps']),
      })),
    };
  }, { org: ORG, project: PROJECT, planId: PLAN_ID, suiteId: SUITE_ID });

  fs.writeFileSync(path.join(OUT, `ado-suite-${SUITE_ID}.json`), JSON.stringify(data, null, 2));

  const lines = [`SUITE ${SUITE_ID} — ${data.caseCount} CASE(S)`];
  if (data.casesError) lines.push(`  cases error: ${data.casesError}`);
  data.cases.forEach(c => {
    lines.push('', `#${c.id} — ${c.title}`, `  state=${c.state} priority=${c.priority} tags=${c.tags || '-'}`);
    if (c.description) lines.push(`  description: ${c.description}`);
    c.steps.forEach(s => {
      lines.push(`   ${s.index}. ACTION:   ${s.action}`);
      if (s.expected) lines.push(`      EXPECTED: ${s.expected}`);
    });
  });
  const digest = lines.join('\n');
  fs.writeFileSync(path.join(OUT, `ado-suite-${SUITE_ID}.txt`), digest);
  console.log('\n' + digest);

  await ctx.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
