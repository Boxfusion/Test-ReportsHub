/*
 * Per-project dashboard renderer.
 *
 * Reads window.__DATA__ (inlined by data.js, written by build-project-data.js)
 * and paints the project header, KPIs, 52-week heatmap, sectioned flow tables
 * and run timeline. Re-run buttons open the hub's run-test workflow_dispatch
 * URL in a new tab and show a copy-ready toast — the workflow runs the test
 * in GitHub Actions and auto-commits the resulting report back to the hub.
 */
(function () {
  const HEATMAP_WEEKS = 52;
  const SPARKLINE_RUNS = 12;
  const FALLBACK_WORKFLOW = 'https://github.com/Boxfusion/Test-ReportsHub/actions/workflows/run-test.yml';

  // ────── DOM helpers ──────
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function pillClass(result) {
    switch (result) {
      case 'PASSED': return 'pass';
      case 'FAILED': return 'fail';
      case 'PARTIAL': return 'partial';
      default: return 'neutral';
    }
  }

  function badgeClass(kind) {
    if (kind === 'updated') return 'badge-updated';
    if (kind === 'new') return 'badge-new';
    if (kind === 'no-spec') return 'badge-no-spec';
    return '';
  }

  // ────── Heatmap ──────
  function heatColor(d) {
    if (!d.runs) return '#ebedf0';
    if (d.failed > 0) {
      if (d.failed >= 3) return '#7f1d1d';
      if (d.failed >= 2) return '#b91c1c';
      return '#ef4444';
    }
    if (d.partial > 0) return '#f59e0b';
    if (d.runs >= 4) return '#216e39';
    if (d.runs >= 3) return '#30a14e';
    if (d.runs >= 2) return '#40c463';
    return '#9be9a8';
  }

  function renderHeatmap(heatmap) {
    if (!heatmap || !Array.isArray(heatmap.days) || heatmap.days.length === 0) {
      return '<div class="muted">No activity yet.</div>';
    }
    const cols = heatmap.weeks || Math.ceil(heatmap.days.length / 7);
    const cells = [];
    const monthLabels = [];
    let lastMonth = -1;

    for (let col = 0; col < cols; col++) {
      const colStart = heatmap.days[col * 7];
      if (colStart) {
        const d = new Date(colStart.iso + 'T00:00:00Z');
        const m = d.getUTCMonth();
        if (m !== lastMonth) {
          monthLabels.push(`<text x="${col * 14}" y="10" class="month">${d.toLocaleString('en', { month: 'short', timeZone: 'UTC' })}</text>`);
          lastMonth = m;
        }
      }
      for (let row = 0; row < 7; row++) {
        const idx = col * 7 + row;
        const d = heatmap.days[idx];
        if (!d) continue;
        const fill = heatColor(d);
        const tooltip = d.runs === 0
          ? `${d.iso} — no runs`
          : `${d.iso} — ${d.runs} run(s) · ${d.passed} passed · ${d.failed} failed · ${d.partial} partial`;
        cells.push(`<rect x="${col * 14}" y="${row * 14}" width="12" height="12" rx="2" fill="${fill}"><title>${esc(tooltip)}</title></rect>`);
      }
    }

    const dayLabels = ['Mon', 'Wed', 'Fri']
      .map((l, i) => `<text x="-30" y="${[1, 3, 5][i] * 14 + 10}" class="day">${l}</text>`)
      .join('');

    return `
      <svg class="heatmap" viewBox="0 0 ${cols * 14 + 10} 110" preserveAspectRatio="xMidYMid meet">
        <g transform="translate(36, 14)">
          ${monthLabels.join('')}
          <g transform="translate(0, 16)">
            ${dayLabels}
            ${cells.join('')}
          </g>
        </g>
      </svg>`;
  }

  // ────── Sparklines / pills / badges ──────
  function sparkline(history) {
    if (!history || history.length === 0) return '<span class="spark-empty">—</span>';
    const recent = history.slice(0, SPARKLINE_RUNS).reverse();
    const cells = recent.map((r) => {
      const cls = pillClass(r.result);
      return `<span class="spark spark-${cls}" title="${esc(r.date)} — ${esc(r.result)} (${esc(r.duration || '')})"></span>`;
    }).join('');
    return `<span class="sparkline">${cells}</span>`;
  }

  function pillFor(result) {
    if (!result) return '<span class="pill pill-neutral">never run</span>';
    return `<span class="pill pill-${pillClass(result)}">${esc(result)}</span>`;
  }

  function badgesHtml(badges) {
    if (!badges || badges.length === 0) return '';
    return badges.map((b) => `<span class="badge ${badgeClass(b.kind)}">${esc(b.text)}</span>`).join(' ');
  }

  // ────── Section + plan rows ──────
  function planRow(p, stripPrefix, projectName) {
    const displayName = stripPrefix && p.plan.startsWith(stripPrefix)
      ? p.plan.slice(stripPrefix.length)
      : p.plan.replace(/^test-plans\//, '');
    const last = p.last;
    const lastDate = last ? esc(last.date) : '<span class="muted">—</span>';
    const dur = last ? esc(last.duration || '—') : '<span class="muted">—</span>';
    const planLink = `<a href="${esc(p.planHref || p.plan)}" title="Open plan">plan</a>`;
    const reportLink = last
      ? `<a href="${esc(last.reportHref)}">latest report</a>`
      : '<span class="muted">no report</span>';
    const bugLinks = (p.bugs || [])
      .map((b) => `<a href="${esc(b.href)}" title="${esc(b.name)}">bug</a>`)
      .join(' · ');
    const links = [planLink, reportLink, bugLinks].filter(Boolean).join(' · ');

    const rerunBtn = p.canRun
      ? `<button type="button" class="btn-rerun" data-action="rerun" data-project="${esc(projectName)}" data-plan="${esc(p.plan)}" title="Re-run this test in GitHub Actions">▶ Re-run</button>`
      : `<button type="button" class="btn-rerun" disabled title="No spec file — generate one with /create-test first">▶ Re-run</button>`;

    return `
      <tr data-status="${esc(p.rowStatus)}">
        <td class="plan-cell">
          <div class="plan-name">${esc(displayName)}</div>
          <div class="plan-badges">${badgesHtml(p.badges)}</div>
        </td>
        <td>${pillFor(last ? last.result : null)}</td>
        <td class="nowrap">${lastDate}</td>
        <td class="nowrap">${dur}</td>
        <td class="num">${p.runCount || 0}</td>
        <td>${sparkline(p.history)}</td>
        <td class="links">${links}</td>
        <td class="actions-cell">${rerunBtn}</td>
      </tr>`;
  }

  function sectionPanel(section, projectName) {
    const rows = section.plans.map((p) => planRow(p, section.stripPrefix, projectName)).join('');
    const failing = section.plans.filter((p) => p.rowStatus === 'failing').length;
    const stats = [`<span class="muted">${section.plans.length} plan${section.plans.length === 1 ? '' : 's'}</span>`];
    if (failing > 0) stats.push(`<span class="pill pill-fail">${failing} failing</span>`);

    const runnable = section.plans.filter((p) => p.canRun).map((p) => p.plan);
    const sectionBtn = runnable.length > 0
      ? `<button type="button" class="btn-rerun btn-rerun-section"
               data-action="rerun-section"
               data-project="${esc(projectName)}"
               data-section="${esc(section.title)}"
               data-plans='${esc(JSON.stringify(runnable))}'
               title="Run every plan in this section that has a spec">▶ Run section <span class="meta">${runnable.length}</span></button>`
      : `<button type="button" class="btn-rerun btn-rerun-section" disabled title="No runnable specs in this section">▶ Run section</button>`;

    return `
      <section class="panel section-panel" data-section="${esc(section.key)}">
        <div class="panel-head section-head">
          <div class="section-title-group">
            <h3 class="section-title">${esc(section.title)}</h3>
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
  }

  // ────── Timeline ──────
  function formatDateLabel(iso) {
    const d = new Date(iso + 'T00:00:00Z');
    return d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  }

  function timelineHtml(timeline) {
    if (!timeline || timeline.length === 0) {
      return '<div class="empty"><strong>No runs recorded yet.</strong>Reports will appear here once tests are executed.</div>';
    }
    return timeline.map((day) => {
      const items = day.runs.map((r) => `
        <li class="timeline-run">
          <span class="pill pill-${pillClass(r.result)}">${esc(r.result)}</span>
          <a class="run-link" href="${esc(r.reportHref)}">${esc(r.planDisplay)}</a>
          <span class="muted">${esc(r.duration || '')}${r.mode ? ` · ${esc(r.mode)}` : ''}</span>
        </li>`).join('');
      return `
        <section class="timeline-day">
          <header><h3>${esc(formatDateLabel(day.date))}</h3><span class="muted">${day.runs.length} run${day.runs.length === 1 ? '' : 's'}</span></header>
          <ul>${items}</ul>
        </section>`;
    }).join('');
  }

  // ────── Toolbar counters ──────
  function countByStatus(sections, status) {
    let n = 0;
    for (const s of sections) for (const p of s.plans) if (p.rowStatus === status) n++;
    return n;
  }

  // ────── Main render ──────
  function render(data) {
    const root = document.getElementById('dashboard-root');
    if (!root) return;

    const meta = data.meta || {};
    const kpis = data.kpis || {};
    const displayName = data.displayName || meta.displayName || data.project;
    const envChip = meta.environment ? `<span class="env-chip">${esc(meta.environment)}</span>` : '';
    const appUrlLink = meta.appUrl
      ? `<a href="${esc(meta.appUrl)}" target="_blank" rel="noreferrer">${esc(meta.appUrl)}</a>`
      : '&nbsp;';

    const failingKpiClass = (kpis.failingFlows || 0) > 0 ? 'kpi-warn' : 'kpi-good';
    const last7Pct = kpis.last7PassPct == null ? '—' : `${kpis.last7PassPct}%`;
    let passKpiClass = '';
    if ((kpis.last7Runs || 0) === 0) passKpiClass = 'kpi-muted';
    else if (kpis.last7PassPct === 0) passKpiClass = 'kpi-warn';
    else if (kpis.last7PassPct >= 80) passKpiClass = 'kpi-good';

    const sections = data.sections || [];
    const totalPlans = kpis.totalPlans || sections.reduce((n, s) => n + s.plans.length, 0);
    const failing = kpis.failingFlows || countByStatus(sections, 'failing');
    const partial = kpis.partialFlows == null ? countByStatus(sections, 'partial') : kpis.partialFlows;
    const passing = kpis.passingFlows == null ? countByStatus(sections, 'passing') : kpis.passingFlows;
    const never = kpis.neverFlows == null ? countByStatus(sections, 'never') : kpis.neverFlows;

    const sectionsHtml = sections.length === 0
      ? `<div class="empty"><strong>No test plans found.</strong>Add a <code>.md</code> file under <code>test-plans/&lt;section&gt;/</code> to see it here.</div>`
      : sections.map((s) => sectionPanel(s, data.project)).join('');

    const allureButton = data.hasAllure
      ? `<button type="button" id="allure-toggle" class="btn btn-primary">Open Allure visualisation<span class="meta">run-by-run breakdown</span></button>`
      : `<span class="btn disabled" aria-disabled="true">Allure report not generated<span class="meta">run a test to produce it</span></span>`;

    const allurePanel = data.hasAllure ? `
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
      </div>` : '';

    const generated = (data.generated || '').replace('T', ' ').slice(0, 16);

    root.innerHTML = `
      <div class="crumbs"><a href="../../index.html">Projects</a> / <span>${esc(displayName)}</span></div>

      <div class="project-header">
        <div>
          <div class="title-row">
            <h1>${esc(displayName)}</h1>
            ${envChip}
          </div>
          <div class="subtitle">${appUrlLink}</div>
        </div>
        <div class="actions">${allureButton}</div>
      </div>

      ${allurePanel}

      <section class="kpis" aria-label="Overview">
        <div class="kpi"><span class="label">Test flows</span><span class="num">${totalPlans}</span><span class="meta">tracked plans</span></div>
        <div class="kpi"><span class="label">Total runs</span><span class="num">${kpis.totalRuns || 0}</span><span class="meta">all time</span></div>
        <div class="kpi ${passKpiClass}"><span class="label">7-day pass rate</span><span class="num">${last7Pct}</span><span class="meta">${kpis.last7Runs || 0} run${(kpis.last7Runs || 0) === 1 ? '' : 's'} in the last 7 days</span></div>
        <div class="kpi ${failingKpiClass}"><span class="label">Currently failing</span><span class="num">${failing}</span><span class="meta">flow${failing === 1 ? '' : 's'} with a failing last run</span></div>
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
        <div class="panel-body">${renderHeatmap(data.heatmap)}</div>
      </section>

      <div class="flows-toolbar">
        <h2>Flows by section</h2>
        <div class="chips" id="flow-filter" role="tablist" aria-label="Filter flows by status">
          <button type="button" class="chip active" data-filter="all">All<span class="count">${totalPlans}</span></button>
          <button type="button" class="chip" data-filter="failing">Failing<span class="count">${failing}</span></button>
          <button type="button" class="chip" data-filter="partial">Partial<span class="count">${partial}</span></button>
          <button type="button" class="chip" data-filter="passing">Passing<span class="count">${passing}</span></button>
          <button type="button" class="chip" data-filter="never">Never run<span class="count">${never}</span></button>
        </div>
      </div>
      <div id="sections-wrap">${sectionsHtml}</div>

      <h2>Run timeline</h2>
      ${timelineHtml(data.timeline)}

      <footer class="page-footer">
        <span>Generated ${esc(generated)} UTC · project <code>${esc(data.project)}</code></span>
        <span><code>node scripts/build-all.js</code></span>
      </footer>
    `;

    wireFilters();
    if (data.hasAllure) wireAllure();
    wireRerunButtons(data.workflowUrl || FALLBACK_WORKFLOW);
  }

  // ────── Filter chips ──────
  function wireFilters() {
    const chips = Array.from(document.querySelectorAll('#flow-filter .chip'));
    const sections = Array.from(document.querySelectorAll('.section-panel'));
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        const f = chip.getAttribute('data-filter');
        sections.forEach((section) => {
          let visible = 0;
          section.querySelectorAll('tbody tr[data-status]').forEach((r) => {
            const show = f === 'all' || r.getAttribute('data-status') === f;
            r.style.display = show ? '' : 'none';
            if (show) visible++;
          });
          section.style.display = visible === 0 ? 'none' : '';
        });
      });
    });
  }

  // ────── Allure modal ──────
  function wireAllure() {
    const btn = document.getElementById('allure-toggle');
    const panel = document.getElementById('allure-panel');
    const frame = document.getElementById('allure-frame');
    const loader = document.getElementById('allure-loader');
    const closeBtn = document.getElementById('allure-close');
    if (!btn || !panel || !frame) return;
    let loaded = false;

    function open() {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (!loaded) {
        frame.addEventListener('load', () => { if (loader) loader.classList.add('hidden'); }, { once: true });
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
    panel.addEventListener('click', (e) => { if (e.target === panel) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('open')) close();
    });
  }

  // ────── Re-run buttons → open workflow in new tab + show toast ──────
  function wireRerunButtons(workflowUrl) {
    const stack = document.getElementById('toast-stack') || (() => {
      const s = document.createElement('div');
      s.id = 'toast-stack';
      s.className = 'toast-stack';
      document.body.appendChild(s);
      return s;
    })();

    function copyToClipboard(text, btn) {
      const done = () => {
        if (!btn) return;
        const original = btn.textContent;
        btn.textContent = 'copied';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => window.prompt('Copy:', text));
      } else {
        window.prompt('Copy:', text);
      }
    }

    function showToast(project, plan) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML =
        '<div class="toast-head">' +
          '<div class="toast-title"><span class="dot"></span>Re-run triggered</div>' +
          '<button type="button" class="toast-close" aria-label="Close">×</button>' +
        '</div>' +
        '<div class="toast-body">' +
          '<p>A new GitHub Actions tab just opened. Click <strong>Run workflow</strong> there and paste these values:</p>' +
          '<div class="input-row"><span class="label">project</span><code>' + esc(project) + '</code><button type="button" class="copy" data-copy="' + esc(project) + '">copy</button></div>' +
          '<div class="input-row"><span class="label">plan</span><code>' + esc(plan) + '</code><button type="button" class="copy" data-copy="' + esc(plan) + '">copy</button></div>' +
          '<div class="toast-foot">When the run finishes, GitHub auto-commits the report back to this hub. Refresh this page in ~1–2 min to see the updated row.</div>' +
        '</div>';
      stack.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('in'));

      toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('in');
        setTimeout(() => toast.remove(), 250);
      });
      toast.querySelectorAll('button.copy').forEach((b) => {
        b.addEventListener('click', () => copyToClipboard(b.getAttribute('data-copy'), b));
      });
      setTimeout(() => {
        if (!toast.parentNode) return;
        toast.classList.remove('in');
        setTimeout(() => toast.remove(), 250);
      }, 30000);
    }

    function showSectionToast(project, section, plans) {
      const toast = document.createElement('div');
      toast.className = 'toast toast-section';
      const planRows = plans.map((p, i) =>
        '<div class="input-row"><span class="label">plan ' + (i + 1) + '/' + plans.length + '</span>' +
        '<code>' + esc(p) + '</code>' +
        '<button type="button" class="copy" data-copy="' + esc(p) + '">copy</button></div>'
      ).join('');
      toast.innerHTML =
        '<div class="toast-head">' +
          '<div class="toast-title"><span class="dot"></span>Section: ' + esc(section) + '</div>' +
          '<button type="button" class="toast-close" aria-label="Close">×</button>' +
        '</div>' +
        '<div class="toast-body">' +
          '<p>A GitHub Actions tab opened. The workflow only accepts one plan at a time, so dispatch it ' + plans.length + ' time' + (plans.length === 1 ? '' : 's') + ' — copy each plan in turn:</p>' +
          '<div class="input-row"><span class="label">project</span><code>' + esc(project) + '</code><button type="button" class="copy" data-copy="' + esc(project) + '">copy</button></div>' +
          '<div class="section-plans-list">' + planRows + '</div>' +
          '<div class="toast-foot">Each run auto-commits its report back to this hub. Refresh after they finish to see the updated rows.</div>' +
        '</div>';
      stack.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('in'));

      toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('in');
        setTimeout(() => toast.remove(), 250);
      });
      toast.querySelectorAll('button.copy').forEach((b) => {
        b.addEventListener('click', () => copyToClipboard(b.getAttribute('data-copy'), b));
      });
      setTimeout(() => {
        if (!toast.parentNode) return;
        toast.classList.remove('in');
        setTimeout(() => toast.remove(), 250);
      }, 60000);
    }

    document.querySelectorAll('[data-action="rerun"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const project = btn.getAttribute('data-project');
        const plan = btn.getAttribute('data-plan');
        if (!project || !plan) return;
        btn.classList.add('is-pending');
        setTimeout(() => btn.classList.remove('is-pending'), 3000);
        window.open(workflowUrl, '_blank', 'noopener');
        showToast(project, plan);
      });
    });

    document.querySelectorAll('[data-action="rerun-section"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const project = btn.getAttribute('data-project');
        const section = btn.getAttribute('data-section');
        const raw = btn.getAttribute('data-plans');
        if (!project || !raw) return;
        let plans;
        try { plans = JSON.parse(raw); } catch (_) { plans = []; }
        if (!Array.isArray(plans) || plans.length === 0) return;
        btn.classList.add('is-pending');
        setTimeout(() => btn.classList.remove('is-pending'), 3000);
        window.open(workflowUrl, '_blank', 'noopener');
        showSectionToast(project, section, plans);
      });
    });
  }

  // ────── Boot ──────
  function showError(msg) {
    const root = document.getElementById('dashboard-root');
    if (root) root.innerHTML = `<div class="dashboard-error">Couldn't load <code>data.json</code>: ${esc(msg)}</div>`;
  }

  if (window.__DATA__) {
    render(window.__DATA__);
  } else {
    fetch('data.json', { cache: 'no-store' })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(render)
      .catch((e) => showError(`${e.message} — run \`node scripts/build-all.js\` or open via \`node scripts/serve.js\`.`));
  }
})();
