/*
 * DSD-NPO functional coverage re-baseline, v2.
 *
 * Reads verdicts in priority order:
 *   1. per-case HEADINGS   "### TC-01 — title (#101626 · TC-03-002) — PASSED"
 *                          -> canonical ADO case id + verdict. Highest fidelity.
 *   2. verdict TABLE rows  "| TC-01 ... | #101828 | PARTIAL | ..."
 *   3. **Cases:** line     (assumed run — flagged, never silently counted)
 *
 * Canonical key = the ADO case id (TC-03-002) wherever present; that kills the
 * TC-03 / TC-03-002 double count. Otherwise plan-namespaced local id.
 *
 * Counted = PASS | FAIL | PARTIAL. BLOCKED / NOT EXECUTED excluded, matching the
 * construction of the earlier "53 pass · 51 fail · 26 partial = 130" baseline.
 */
const fs = require('fs'), path = require('path');
const root = process.argv[2];
const rdir = path.join(root, 'test-reports');
const DENOM = 314;

const VERDICT = /\b(PASSED|PASS|FAILED|FAIL|PARTIAL|BLOCKED|NOT\s*EXECUTED|NOT\s*RUN|SKIPPED|DEFERRED)\b/i;
const isReal = v => /^(PASSED|PASS|FAILED|FAIL|PARTIAL)$/i.test(v.replace(/\s+/g, ' ').trim());

function front(text) {
  const m = {};
  for (const line of text.split(/\r?\n/).slice(0, 30)) {
    const mm = line.match(/^\*\*([A-Za-z ]+):\*\*\s*(.+?)\s*$/);
    if (mm && !(mm[1].trim().toLowerCase() in m)) m[mm[1].trim().toLowerCase()] = mm[2].trim();
  }
  return m;
}

/* Alias map, from the plans themselves: a plan-namespaced local id -> its ADO case id.
 * Needed because a report whose verdict TABLE cites the ADO *work item* (#101839) rather
 * than the case id (TC-14T-012) keys as "<plan>#TC-12", while a report using per-case
 * headings keys as "TC-14T-012" — the same case counted twice. Cost 3 phantom cases
 * (206 vs the true 203) before this was added. */
const alias = new Map();
(function buildAlias(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) buildAlias(p);
    else if (/-functional\.md$/.test(e.name)) {
      const rel = path.relative(root, p).split(path.sep).join('/');
      for (const m of fs.readFileSync(p, 'utf8').matchAll(/^###\s+(TC-[0-9]+[A-Z]?)\b.*$/gm)) {
        const ado = m[0].match(/\bTC-[0-9]{1,2}[A-Z0-9]{0,3}-[0-9]{3}\b/i);
        if (ado) alias.set(rel + '#' + m[1].toUpperCase(), ado[0].toUpperCase());
      }
    }
  }
})(path.join(root, 'test-plans'));

const cases = new Map();     // canonical key -> {verdict, src}
const prov = [];
const crosscheck = [];

function add(rawKey, verdict, src) {
  const key = alias.get(rawKey) || rawKey;
  const prev = cases.get(key);
  if (!prev || (isReal(verdict) && !isReal(prev.verdict))) cases.set(key, { verdict, src });
}

for (const d of fs.readdirSync(rdir).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x)).sort()) {
  for (const f of fs.readdirSync(path.join(rdir, d)).filter(x => x.endsWith('.md')).sort()) {
    const text = fs.readFileSync(path.join(rdir, d, f), 'utf8');
    const fm = front(text);
    const plan = (fm.plan || '').replace(/\\/g, '/');
    if (!/-functional\.md$/.test(plan)) continue;
    const tag = d + '/' + f;

    // ---- 1. headings carrying a trailing verdict
    let n1 = 0;
    for (const m of text.matchAll(/^###\s+(.+)$/gm)) {
      const h = m[1];
      const ado = h.match(/\bTC-[0-9]{1,2}[A-Z0-9]{0,3}-[0-9]{3}\b/i);
      const local = h.match(/\b(TC-[0-9]+[A-Z]?)\b/i);
      const vm = h.match(/[—-]\s*(PASSED|PASS|FAILED|FAIL|PARTIAL|BLOCKED|NOT\s*EXECUTED|NOT\s*RUN|SKIPPED|DEFERRED)\s*$/i);
      if (!vm) continue;
      const key = ado ? ado[0].toUpperCase() : (local ? plan + '#' + local[1].toUpperCase() : null);
      if (!key) continue;
      add(key, vm[1].toUpperCase(), tag);
      n1++;
    }
    if (n1) { prov.push([n1, 'headings', tag]); }

    // ---- 2. verdict-table rows (only if headings gave nothing)
    let n2 = 0;
    if (!n1) {
      for (const r of text.matchAll(/^\|\s*(TC-[0-9A-Za-z-]+)[^|]*\|([^|]*)\|([^|]*)\|/gm)) {
        const cells = r[2] + ' ' + r[3];
        const vm = cells.match(VERDICT);
        if (!vm) continue;
        const tok = r[1].toUpperCase();
        const ado = tok.match(/^TC-[0-9]{1,2}[A-Z0-9]{0,3}-[0-9]{3}$/) ? tok : null;
        const adoCell = cells.match(/\bTC-[0-9]{1,2}[A-Z0-9]{0,3}-[0-9]{3}\b/i);
        const key = ado || (adoCell ? adoCell[0].toUpperCase() : plan + '#' + tok);
        add(key, vm[1].toUpperCase(), tag);
        n2++;
      }
      if (n2) prov.push([n2, 'table', tag]);
    }

    // ---- 3. fallback
    if (!n1 && !n2) {
      const cs = fm.cases ? [...fm.cases.matchAll(/TC-[0-9A-Za-z-]+/g)].map(x => x[0].toUpperCase()) : [];
      for (const t of cs) add(/^TC-[0-9]{1,2}[A-Z0-9]{0,3}-[0-9]{3}$/.test(t) ? t : plan + '#' + t, 'ASSUMED', tag);
      prov.push([cs.length, cs.length ? 'CASES-LINE (assumed)' : 'NO DATA', tag]);
    }

    // ---- cross-check against the report's own summary row
    const sum = text.match(/^\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|(?:\s*(\d+)\s*\|)?(?:\s*(\d+)\s*\|)?\s*$/m);
    if (sum) crosscheck.push({ tag, total: +sum[1], real: (+sum[2]) + (+sum[3]) + (+sum[4]) });
  }
}

let real = 0, assumed = 0, notrun = 0;
const bySuite = new Map();
for (const [k, v] of cases) {
  const s = k.match(/^TC-([0-9]{1,2}[A-Z0-9]{0,3})-/) ? k.match(/^TC-([0-9]{1,2}[A-Z0-9]{0,3})-/)[1] : 'local';
  if (!bySuite.has(s)) bySuite.set(s, { r: 0, a: 0, n: 0 });
  const b = bySuite.get(s);
  if (v.verdict === 'ASSUMED') { assumed++; b.a++; }
  else if (isReal(v.verdict)) { real++; b.r++; }
  else { notrun++; b.n++; }
}

console.log('HOW EACH REPORT WAS READ');
for (const [n, mode, tag] of prov) console.log('   ' + String(n).padStart(3) + '  ' + mode.padEnd(22) + tag);

console.log('');
console.log('PER ADO SUITE   verdicted / assumed / not-run');
for (const [s, b] of [...bySuite.entries()].sort()) {
  console.log('   ' + String(b.r).padStart(3) + ' / ' + String(b.a).padStart(3) + ' / ' + String(b.n).padStart(3) + '   suite ' + s);
}

console.log('');
console.log('CROSS-CHECK against each report\'s own summary row (total | real)');
let sumReal = 0;
for (const c of crosscheck) { console.log('   total ' + String(c.total).padStart(3) + '  real ' + String(c.real).padStart(3) + '   ' + c.tag); sumReal += c.real; }
console.log('   sum of self-reported real verdicts: ' + sumReal + '  (before de-duplication across reports)');

console.log('');
console.log('=== RESULT ===');
console.log('Verdicted (PASS/FAIL/PARTIAL), de-duplicated : ' + real + ' / ' + DENOM + ' = ' + (100 * real / DENOM).toFixed(1) + '%');
console.log('Still only assumed (no verdict parsed)       : ' + assumed);
console.log('Excluded as blocked / not executed           : ' + notrun);
