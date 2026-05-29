/*
 * Landing page renderer.
 *
 * Loads hub.json (written by scripts/build-hub-data.js) and paints the
 * project grid + filter chips + KPI strip. Also hosts the "+ Add project"
 * modal that opens the register-project workflow_dispatch tab on github.com
 * with the form values shown in a toast so they can be pasted in.
 */
(function () {
  const HUB_REPO = 'Boxfusion/Test-ReportsHub';
  const REGISTER_WORKFLOW = `https://github.com/${HUB_REPO}/actions/workflows/register-project.yml`;

  const HEALTH_ORDER = { failing: 0, partial: 1, healthy: 2, unknown: 3 };

  // ────── DOM helpers ──────
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  // ────── Rendering ──────
  function pillFor(result) {
    if (!result) return '<span class="pill pill-neutral">no runs</span>';
    const cls = { PASSED: 'pass', FAILED: 'fail', PARTIAL: 'partial' }[result] || 'neutral';
    return `<span class="pill pill-${cls}">${esc(result)}</span>`;
  }

  function healthAccent(health) {
    return {
      healthy: 'card-accent-pass',
      failing: 'card-accent-fail',
      partial: 'card-accent-partial',
      unknown: 'card-accent-neutral',
    }[health] || 'card-accent-neutral';
  }

  function projectCardHtml(p) {
    const env = p.environment ? `<span class="env-chip">${esc(p.environment)}</span>` : '';
    const appUrl = p.appUrl
      ? `<div class="app-url" title="${esc(p.appUrl)}">${esc(p.appUrl)}</div>`
      : '';
    const passPct = p.summary.last7PassPct == null ? '—' : `${p.summary.last7PassPct}%`;
    const lastRun = p.summary.lastRun
      ? `${pillFor(p.summary.lastRun.result)} <span class="muted">${esc(p.summary.lastRun.date)}</span>`
      : '<span class="muted">no runs yet</span>';
    return `
      <a class="project-card ${healthAccent(p.health)}" href="${esc(p.href)}"
         data-name="${esc((p.displayName || '').toLowerCase())}" data-health="${esc(p.health)}">
        <div class="project-card-head">
          <div class="project-card-title">
            <h2>${esc(p.displayName || p.name)}</h2>
            ${env}
          </div>
          ${appUrl}
        </div>
        <dl class="stats">
          <div><dt>Last run</dt><dd>${lastRun}</dd></div>
          <div><dt>Flows</dt><dd>${p.summary.totalPlans || 0}</dd></div>
          <div><dt>Total runs</dt><dd>${p.summary.totalRuns || 0}</dd></div>
          <div><dt>7d pass rate</dt><dd>${passPct} <span class="muted">(${p.summary.last7Runs || 0} run${(p.summary.last7Runs || 0) === 1 ? '' : 's'})</span></dd></div>
          <div><dt>Failing</dt><dd>${p.summary.failingFlows || 0} <span class="muted">flow${(p.summary.failingFlows || 0) === 1 ? '' : 's'}</span></dd></div>
        </dl>
        <div class="project-card-foot">
          <span class="cta">Open dashboard →</span>
        </div>
      </a>`;
  }

  function countBy(projects, health) {
    return projects.filter((p) => p.health === health).length;
  }

  function render(hub) {
    const root = document.getElementById('landing-root');
    if (!root) return;

    const projects = [...(hub.projects || [])].sort((a, b) => {
      const ha = HEALTH_ORDER[a.health] ?? 9;
      const hb = HEALTH_ORDER[b.health] ?? 9;
      if (ha !== hb) return ha - hb;
      return (a.displayName || a.name).localeCompare(b.displayName || b.name);
    });

    const t = hub.totals || {};
    const failingClass = (t.failingFlows || 0) > 0 ? 'kpi-warn' : 'kpi-good';

    const cards = projects.length === 0
      ? `<div class="empty">
           <strong>No projects yet</strong>
           Click <strong>+ Add project</strong> above, or add a folder under <code>projects/&lt;name&gt;/</code> with a <code>meta.json</code> and run <code>node scripts/build-all.js</code>.
         </div>`
      : projects.map(projectCardHtml).join('');

    root.innerHTML = `
      <section class="kpis" aria-label="Overview">
        <div class="kpi"><span class="label">Projects</span><span class="num">${t.totalProjects || 0}</span><span class="meta">tracked here</span></div>
        <div class="kpi"><span class="label">Test flows</span><span class="num">${t.totalPlans || 0}</span><span class="meta">across all projects</span></div>
        <div class="kpi"><span class="label">Total runs</span><span class="num">${t.totalRuns || 0}</span><span class="meta">${t.last7Runs || 0} in the last 7 days</span></div>
        <div class="kpi ${failingClass}"><span class="label">Currently failing</span><span class="num">${t.failingFlows || 0}</span><span class="meta">flow${(t.failingFlows || 0) === 1 ? '' : 's'} with a failing last run</span></div>
      </section>

      <div class="toolbar">
        <div class="chips" role="tablist" aria-label="Filter projects by health">
          <button type="button" class="chip active" data-filter="all">All<span class="count">${projects.length}</span></button>
          <button type="button" class="chip" data-filter="failing">Failing<span class="count">${countBy(projects, 'failing')}</span></button>
          <button type="button" class="chip" data-filter="partial">Partial<span class="count">${countBy(projects, 'partial')}</span></button>
          <button type="button" class="chip" data-filter="healthy">Healthy<span class="count">${countBy(projects, 'healthy')}</span></button>
          <button type="button" class="chip" data-filter="unknown">Unknown<span class="count">${countBy(projects, 'unknown')}</span></button>
        </div>
        <div class="toolbar-right">
          <label class="search" aria-label="Search projects">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3-3"></path></svg>
            <input type="search" id="project-search" placeholder="Search projects…" autocomplete="off" />
          </label>
          <button type="button" class="btn btn-primary" id="add-project-btn">+ Add project</button>
        </div>
      </div>

      <section class="grid" id="project-grid">${cards}</section>
      <div id="no-results" class="no-results" hidden>No projects match your search.</div>

      <footer class="page-footer">
        <span>Generated ${esc((hub.generated || '').replace('T', ' ').slice(0, 16))} UTC</span>
        <span><code>node scripts/build-all.js</code></span>
      </footer>
    `;

    // Topbar nav: project count
    const nav = document.getElementById('topbar-nav');
    if (nav) nav.innerHTML = `<span>${projects.length} project${projects.length === 1 ? '' : 's'}</span>`;

    wireFilters();
    wireAddProject();
  }

  function wireFilters() {
    const grid = document.getElementById('project-grid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.project-card'));
    const chips = Array.from(document.querySelectorAll('.chip[data-filter]'));
    const search = document.getElementById('project-search');
    const noResults = document.getElementById('no-results');
    let currentFilter = 'all';
    let currentQuery = '';

    function apply() {
      let visible = 0;
      cards.forEach((c) => {
        const health = c.getAttribute('data-health') || '';
        const name = c.getAttribute('data-name') || '';
        const matchFilter = currentFilter === 'all' || health === currentFilter;
        const matchQuery = !currentQuery || name.indexOf(currentQuery) !== -1;
        const show = matchFilter && matchQuery;
        c.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (noResults) noResults.hidden = visible !== 0;
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.getAttribute('data-filter');
        apply();
      });
    });

    if (search) {
      search.addEventListener('input', () => {
        currentQuery = search.value.trim().toLowerCase();
        apply();
      });
    }
  }

  // ────── Add-project modal ──────
  function wireAddProject() {
    const btn = document.getElementById('add-project-btn');
    if (!btn) return;
    btn.addEventListener('click', openRegisterModal);
  }

  function slugify(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/[^a-z0-9-_ ]+/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function openRegisterModal() {
    if (document.getElementById('register-modal')) return;

    const modal = el(`
      <div class="modal-backdrop" id="register-modal" role="dialog" aria-modal="true" aria-labelledby="register-title">
        <div class="modal">
          <div class="modal-head">
            <h2 id="register-title">Register a project</h2>
            <button type="button" class="modal-close" aria-label="Close">×</button>
          </div>
          <div class="modal-body">
            <p class="modal-intro">
              Point the hub at a GitHub repo that contains <code>test-plans/</code> and
              <code>test-reports/</code> at its root. After you submit, a GitHub Actions tab
              opens with the values to paste — that workflow writes the project's
              <code>meta.json</code>, runs <code>build-all</code>, and commits the result.
            </p>
            <form id="register-form">
              <div class="form-grid">
                <label>
                  <span>Project slug <em>*</em></span>
                  <input name="slug" required pattern="^[a-z0-9][a-z0-9-]*$" placeholder="pd-telephony" autocomplete="off" />
                  <small>Folder name under <code>projects/</code>. Lowercase, kebab-case.</small>
                </label>
                <label>
                  <span>Display name <em>*</em></span>
                  <input name="displayName" required placeholder="PD Telephony" autocomplete="off" />
                </label>
                <label class="full">
                  <span>GitHub repo URL <em>*</em></span>
                  <input name="repo" type="url" required placeholder="https://github.com/Boxfusion/pd-telephony" autocomplete="off" />
                  <small>The repo where <code>test-plans/</code> and <code>test-reports/</code> live.</small>
                </label>
                <label>
                  <span>Branch</span>
                  <input name="branch" placeholder="main (default)" autocomplete="off" />
                </label>
                <label>
                  <span>Environment</span>
                  <input name="environment" placeholder="QA" autocomplete="off" />
                </label>
                <label class="full">
                  <span>App URL</span>
                  <input name="appUrl" type="url" placeholder="https://..." autocomplete="off" />
                </label>
                <label class="full">
                  <span>Description</span>
                  <textarea name="description" rows="2" placeholder="One-liner about what this app is."></textarea>
                </label>
              </div>
              <div class="form-actions">
                <button type="button" class="btn" id="register-cancel">Cancel</button>
                <button type="submit" class="btn btn-primary">Open registration workflow →</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `);

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    const close = () => {
      modal.remove();
      document.body.style.overflow = '';
    };

    modal.querySelector('.modal-close').addEventListener('click', close);
    modal.querySelector('#register-cancel').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
    });

    const slugInput = modal.querySelector('input[name="slug"]');
    const nameInput = modal.querySelector('input[name="displayName"]');
    let slugTouched = false;
    slugInput.addEventListener('input', () => { slugTouched = true; });
    nameInput.addEventListener('input', () => {
      if (!slugTouched) slugInput.value = slugify(nameInput.value);
    });

    modal.querySelector('#register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const values = {
        slug: String(fd.get('slug') || '').trim(),
        displayName: String(fd.get('displayName') || '').trim(),
        repo: String(fd.get('repo') || '').trim(),
        branch: String(fd.get('branch') || '').trim(),
        environment: String(fd.get('environment') || '').trim(),
        appUrl: String(fd.get('appUrl') || '').trim(),
        description: String(fd.get('description') || '').trim(),
      };
      close();
      openWorkflowAndToast(values);
    });

    setTimeout(() => nameInput.focus(), 50);
  }

  // ────── Toast + workflow handoff ──────
  function openWorkflowAndToast(values) {
    window.open(REGISTER_WORKFLOW, '_blank', 'noopener,noreferrer');

    const stack = document.getElementById('toast-stack') || (() => {
      const s = document.createElement('div');
      s.id = 'toast-stack';
      s.className = 'toast-stack';
      document.body.appendChild(s);
      return s;
    })();

    const rows = [
      ['slug', values.slug],
      ['displayName', values.displayName],
      ['repo', values.repo],
      ['branch', values.branch || '(leave blank)'],
      ['environment', values.environment || '(leave blank)'],
      ['appUrl', values.appUrl || '(leave blank)'],
      ['description', values.description || '(leave blank)'],
    ];

    const toast = el(`
      <div class="toast" role="status">
        <div class="toast-head">
          <div class="toast-title"><span class="dot"></span> Paste into the GitHub tab</div>
          <button type="button" class="toast-close" aria-label="Dismiss">×</button>
        </div>
        <div class="toast-body">
          <p>The <strong>register-project</strong> workflow just opened. Click <strong>Run workflow</strong> and paste each value into its input.</p>
          ${rows.map(([k, v]) => `
            <div class="input-row">
              <span class="label">${esc(k)}</span>
              <code data-copy="${esc(v)}">${esc(v)}</code>
              <button type="button" class="copy" data-copy-target>Copy</button>
            </div>
          `).join('')}
          <div class="toast-foot">After the workflow finishes (~30s), reload this page to see the new project card.</div>
        </div>
      </div>
    `);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.remove('in');
      setTimeout(() => toast.remove(), 200);
    });
    toast.querySelectorAll('[data-copy-target]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const code = btn.previousElementSibling;
        const text = code.getAttribute('data-copy') || code.textContent || '';
        try { await navigator.clipboard.writeText(text); } catch (_) { /* ignore */ }
        btn.classList.add('copied');
        btn.textContent = 'Copied';
        setTimeout(() => { btn.classList.remove('copied'); btn.textContent = 'Copy'; }, 1200);
      });
    });

    stack.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('in'));
  }

  // ────── Boot ──────
  function showError(msg) {
    const root = document.getElementById('landing-root');
    if (root) root.innerHTML = `<div class="dashboard-error">Couldn't load <code>hub.json</code>: ${esc(msg)}</div>`;
  }

  // Prefer the inlined data emitted by build-hub-data.js (works over file://).
  // Fall back to fetch for incremental dev where hub.js may be stale.
  if (window.__HUB__) {
    render(window.__HUB__);
  } else {
    fetch('hub.json', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(render)
      .catch((e) => showError(`${e.message} — open the page via http://localhost (\`node scripts/serve.js\`) or run \`node scripts/build-all.js\` to refresh hub.js.`));
  }
})();
