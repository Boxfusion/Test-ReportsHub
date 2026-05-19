/**
 * Shared design system for the Test Reports Hub.
 * Inlined into every generated HTML page so the site stays a pile of
 * self-contained static files (no external CSS fetch at runtime).
 */

const SHARED_CSS = `
  :root {
    --bg: #f7f8fb;
    --surface: #ffffff;
    --surface-2: #f1f5f9;
    --ink: #0b1220;
    --ink-2: #334155;
    --muted: #64748b;
    --muted-2: #94a3b8;
    --border: #e4e8ee;
    --border-strong: #cbd5e1;

    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --accent-bg: #eff6ff;

    --pass: #15803d; --pass-bg: #dcfce7; --pass-line: #16a34a;
    --fail: #b91c1c; --fail-bg: #fee2e2; --fail-line: #dc2626;
    --partial: #b45309; --partial-bg: #fef3c7; --partial-line: #d97706;
    --neutral: #475569; --neutral-bg: #f1f5f9;

    --updated: #1d4ed8; --updated-bg: #dbeafe;
    --new: #6d28d9; --new-bg: #ede9fe;

    --shadow-sm: 0 1px 2px rgba(15,23,42,.04);
    --shadow-md: 0 4px 12px rgba(15,23,42,.06);
    --shadow-lg: 0 12px 32px rgba(15,23,42,.10);

    --radius: 10px;
    --radius-lg: 14px;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif;
    background: var(--bg);
    color: var(--ink);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  a { color: var(--accent); }
  a:hover { text-decoration: underline; }

  /* ───── Topbar ───── */
  .topbar {
    position: sticky; top: 0; z-index: 50;
    background: rgba(255,255,255,.88);
    backdrop-filter: saturate(180%) blur(10px);
    -webkit-backdrop-filter: saturate(180%) blur(10px);
    border-bottom: 1px solid var(--border);
  }
  .topbar .inner {
    max-width: 1200px; margin: 0 auto;
    padding: .85rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  }
  .brand { display: flex; align-items: center; gap: .65rem; color: var(--ink); text-decoration: none; }
  .brand:hover { text-decoration: none; }
  .brand .mark {
    width: 30px; height: 30px; border-radius: 8px;
    background: linear-gradient(135deg, #2563eb, #6366f1);
    color: #fff; display: grid; place-items: center;
    font-weight: 700; font-size: .8rem; letter-spacing: -.02em;
    box-shadow: var(--shadow-sm);
  }
  .brand .name { font-size: .92rem; font-weight: 600; line-height: 1.1; }
  .brand .name .org { display: block; color: var(--muted); font-weight: 400; font-size: .7rem; letter-spacing: .04em; text-transform: uppercase; margin-top: 1px; }
  .topbar nav { display: flex; align-items: center; gap: 1.25rem; font-size: .85rem; color: var(--muted); }
  .topbar nav a { color: var(--muted); text-decoration: none; }
  .topbar nav a:hover { color: var(--ink); text-decoration: none; }
  .topbar nav .sep { width: 1px; height: 16px; background: var(--border); }

  /* ───── Container ───── */
  .container { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
  .page-head { margin-bottom: 1.75rem; }

  /* ───── Headings ───── */
  h1 { margin: 0 0 .35rem; font-size: 1.8rem; font-weight: 700; letter-spacing: -.02em; }
  h2 { margin: 2rem 0 1rem; font-size: 1.05rem; font-weight: 600; letter-spacing: -.005em; color: var(--ink); }
  h3 { margin: 0; font-size: .95rem; font-weight: 600; }
  .subtitle { color: var(--muted); font-size: .92rem; margin: 0; }
  .subtitle a { color: var(--muted); }
  .subtitle a:hover { color: var(--accent); }

  /* ───── Breadcrumb ───── */
  .crumbs { color: var(--muted); font-size: .8rem; margin-bottom: .5rem; }
  .crumbs a { color: var(--muted); text-decoration: none; }
  .crumbs a:hover { color: var(--accent); text-decoration: none; }

  /* ───── KPI cards ───── */
  .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: .9rem; margin-bottom: 1.75rem; }
  .kpi {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 1.1rem 1.25rem; box-shadow: var(--shadow-sm);
    display: flex; flex-direction: column; gap: .25rem;
    position: relative; overflow: hidden;
  }
  .kpi .label { color: var(--muted); font-size: .7rem; text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
  .kpi .num { font-size: 1.85rem; font-weight: 600; line-height: 1.05; color: var(--ink); letter-spacing: -.02em; }
  .kpi .meta { color: var(--muted); font-size: .76rem; }
  .kpi.kpi-warn .num { color: var(--fail); }
  .kpi.kpi-good .num { color: var(--pass); }
  .kpi::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--accent); opacity: .85; }
  .kpi.kpi-warn::before { background: var(--fail-line); }
  .kpi.kpi-good::before { background: var(--pass-line); }
  .kpi.kpi-muted::before { background: var(--border-strong); opacity: 1; }

  /* ───── Panels ───── */
  .panel {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
    box-shadow: var(--shadow-sm); margin-bottom: 1.5rem; overflow: hidden;
  }
  .panel-head { padding: .9rem 1.25rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .panel-head h2 { margin: 0; }
  .panel-head .actions { display: flex; align-items: center; gap: .5rem; }
  .panel-body { padding: 1.25rem; }
  .panel-body.no-pad { padding: 0; }

  /* ───── Pills ───── */
  .pill { display: inline-flex; align-items: center; gap: .4rem; padding: .15rem .55rem .15rem .5rem; border-radius: 999px; font-size: .7rem; font-weight: 600; letter-spacing: .02em; line-height: 1.4; white-space: nowrap; }
  .pill::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: .9; }
  .pill-pass { color: var(--pass); background: var(--pass-bg); }
  .pill-fail { color: var(--fail); background: var(--fail-bg); }
  .pill-partial { color: var(--partial); background: var(--partial-bg); }
  .pill-neutral { color: var(--neutral); background: var(--neutral-bg); }
  .pill-neutral::before { display: none; }

  /* ───── Badges ───── */
  .badge { display: inline-block; padding: .15rem .5rem; border-radius: 4px; font-size: .62rem; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; line-height: 1.5; }
  .badge-updated { color: var(--updated); background: var(--updated-bg); }
  .badge-new { color: var(--new); background: var(--new-bg); }
  .badge-no-spec { color: var(--muted); background: var(--neutral-bg); }

  /* ───── Env chip ───── */
  .env-chip {
    display: inline-block; padding: .15rem .55rem;
    background: var(--accent-bg); color: var(--accent);
    border-radius: 6px; font-size: .65rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
    vertical-align: middle;
  }

  /* ───── Buttons ───── */
  .btn {
    display: inline-flex; align-items: center; gap: .5rem;
    padding: .55rem .95rem; border-radius: 8px; text-decoration: none; font-size: .87rem; font-weight: 500;
    border: 1px solid var(--border); background: var(--surface); color: var(--ink); cursor: pointer;
    font-family: inherit; transition: border-color .15s, background .15s, color .15s;
    line-height: 1.2;
  }
  .btn:hover { border-color: var(--border-strong); background: var(--surface-2); text-decoration: none; }
  .btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
  .btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); color: #fff; }
  .btn-sm { padding: .35rem .65rem; font-size: .78rem; }
  .btn .meta { font-size: .7rem; font-weight: 400; opacity: .85; margin-left: .35rem; }
  .btn[disabled], .btn.disabled { opacity: .55; cursor: not-allowed; }

  /* ───── Filter chips (toggle group) ───── */
  .chips { display: inline-flex; align-items: center; gap: .35rem; flex-wrap: wrap; }
  .chip {
    padding: .3rem .7rem; border-radius: 999px; font-size: .78rem; font-weight: 500;
    border: 1px solid var(--border); background: var(--surface); color: var(--ink-2); cursor: pointer;
    font-family: inherit; transition: all .15s ease;
  }
  .chip:hover { border-color: var(--border-strong); background: var(--surface-2); }
  .chip.active { background: var(--ink); color: #fff; border-color: var(--ink); }
  .chip .count { opacity: .65; margin-left: .25rem; font-variant-numeric: tabular-nums; }

  /* ───── Search ───── */
  .search {
    position: relative; flex: 1; max-width: 360px;
  }
  .search input {
    width: 100%; padding: .55rem .85rem .55rem 2.1rem;
    border: 1px solid var(--border); border-radius: 8px;
    font-family: inherit; font-size: .87rem; color: var(--ink); background: var(--surface);
    transition: border-color .15s, box-shadow .15s;
  }
  .search input::placeholder { color: var(--muted-2); }
  .search input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
  .search svg { position: absolute; left: .65rem; top: 50%; transform: translateY(-50%); color: var(--muted-2); pointer-events: none; }

  /* ───── Muted utility ───── */
  .muted { color: var(--muted); font-size: .85rem; }

  /* ───── Empty state ───── */
  .empty {
    background: var(--surface); border: 1px dashed var(--border-strong); border-radius: var(--radius);
    padding: 3rem 2rem; text-align: center; color: var(--muted);
  }
  .empty strong { color: var(--ink); display: block; font-size: 1rem; margin-bottom: .35rem; font-weight: 600; }
  .empty code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: var(--surface-2); padding: .1rem .4rem; border-radius: 4px; font-size: .8rem; color: var(--ink-2); }

  /* ───── Footer ───── */
  footer.page-footer {
    color: var(--muted); font-size: .78rem; margin-top: 3rem; padding-top: 1.25rem;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
  }
  footer.page-footer code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    background: var(--surface-2); padding: .12rem .4rem; border-radius: 4px; font-size: .72rem; color: var(--ink-2);
  }

  /* ───── Responsive ───── */
  @media (max-width: 640px) {
    .container { padding: 1.25rem 1rem 3rem; }
    .topbar .inner { padding: .75rem 1rem; }
    h1 { font-size: 1.5rem; }
    .kpi .num { font-size: 1.55rem; }
    .panel-head { padding: .85rem 1rem; }
    .panel-body { padding: 1rem; }
  }
`;

function topbar({ nav = [] } = {}) {
  const navHtml = nav.length === 0 ? '' : `<nav>${nav.map((n, i) => {
    if (n.sep) return `<span class="sep"></span>`;
    return `<a href="${n.href}">${n.label}</a>`;
  }).join('')}</nav>`;
  return `
  <header class="topbar">
    <div class="inner">
      <a class="brand" href="${escapeAttr(getBrandHref())}">
        <span class="mark">TR</span>
        <span class="name">Test Reports Hub<span class="org">Boxfusion</span></span>
      </a>
      ${navHtml}
    </div>
  </header>`;
}

function getBrandHref() {
  return '/';
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

module.exports = { SHARED_CSS, topbar };
