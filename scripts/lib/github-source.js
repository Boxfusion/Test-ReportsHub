/**
 * GitHub source adapter for build-project-data.js.
 *
 * Given a meta.json `source: { repo, branch? }` field, exposes the same
 * shape the local-disk scanner produces: a flat list of files (POSIX paths
 * relative to repo root + mtime) plus a readFile(path) and viewerUrl(path).
 *
 * Auth: reads GITHUB_TOKEN or GH_TOKEN from env. Falls back to unauthenticated
 * requests (60 req/hour limit, fine for public repos with infrequent rebuilds).
 *
 * mtime caveat: the GitHub trees API doesn't return per-file timestamps. We
 * use the HEAD commit timestamp for every file. That makes the "plan edited
 * after last run" badge coarse — it fires when *anything* in the repo has
 * been edited since the last run, not specifically the plan. Per-file mtime
 * would require a commits?path= call per file, which blows the rate limit
 * on big repos. Revisit if it becomes annoying.
 */

const API_BASE = 'https://api.github.com';

function parseRepoUrl(url) {
  if (!url) throw new Error('source.repo is required');
  const cleaned = String(url).trim().replace(/\.git$/, '').replace(/\/+$/, '');
  const match = cleaned.match(/github\.com[:/]+([^/]+)\/([^/]+?)$/i);
  if (!match) throw new Error(`Not a recognised GitHub URL: ${url}`);
  return { owner: match[1], repo: match[2] };
}

function authHeaders() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'Test-ReportsHub-build',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function ghJson(url) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const rate = res.headers.get('x-ratelimit-remaining');
    const hint = rate === '0' ? ' (rate limit exhausted — set GITHUB_TOKEN)' : '';
    throw new Error(`GitHub API ${res.status} for ${url}${hint}\n${body.slice(0, 300)}`);
  }
  return res.json();
}

async function ghText(url) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub raw ${res.status} for ${url}\n${body.slice(0, 300)}`);
  }
  return res.text();
}

async function resolveBranch({ owner, repo, branch }) {
  if (branch) return branch;
  const meta = await ghJson(`${API_BASE}/repos/${owner}/${repo}`);
  return meta.default_branch || 'main';
}

async function ghJsonAllowing({ url, allow }) {
  const res = await fetch(url, { headers: authHeaders() });
  if (allow && allow.includes(res.status)) return { __status: res.status };
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const rate = res.headers.get('x-ratelimit-remaining');
    const hint = rate === '0' ? ' (rate limit exhausted — set GITHUB_TOKEN)' : '';
    throw new Error(`GitHub API ${res.status} for ${url}${hint}\n${body.slice(0, 300)}`);
  }
  return res.json();
}

async function getHeadCommitDate({ owner, repo, branch }) {
  const commits = await ghJsonAllowing({
    url: `${API_BASE}/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=1`,
    allow: [409, 404],
  });
  if (commits.__status) return new Date(0);
  const iso = commits?.[0]?.commit?.committer?.date || commits?.[0]?.commit?.author?.date;
  return iso ? new Date(iso) : new Date();
}

async function getTree({ owner, repo, branch }) {
  // recursive=1 returns the full tree in one request (up to 100k entries / 7MB).
  // Empty repos return 409 — treat as "no files yet" so a freshly-registered
  // project renders an empty dashboard instead of failing the hub build.
  const tree = await ghJsonAllowing({
    url: `${API_BASE}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    allow: [409, 404],
  });
  if (tree.__status) {
    console.warn(`[github-source] ${owner}/${repo}@${branch} returned ${tree.__status} — treating as empty.`);
    return [];
  }
  if (tree.truncated) {
    console.warn(`[github-source] WARNING: tree for ${owner}/${repo}@${branch} was truncated by GitHub.`);
  }
  return tree.tree || [];
}

async function createGithubSource({ repo, branch }) {
  const { owner, repo: name } = parseRepoUrl(repo);
  const resolvedBranch = await resolveBranch({ owner, repo: name, branch });
  const [entries, headDate] = await Promise.all([
    getTree({ owner, repo: name, branch: resolvedBranch }),
    getHeadCommitDate({ owner, repo: name, branch: resolvedBranch }),
  ]);

  const files = entries
    .filter((e) => e.type === 'blob')
    .map((e) => ({ path: e.path, mtime: headDate }));

  const rawBase = `https://raw.githubusercontent.com/${owner}/${name}/${resolvedBranch}/`;
  const blobBase = `https://github.com/${owner}/${name}/blob/${resolvedBranch}/`;

  return {
    kind: 'remote',
    owner,
    repo: name,
    branch: resolvedBranch,
    files,
    headDate,
    async readFile(pathRel) {
      return ghText(rawBase + pathRel.split('/').map(encodeURIComponent).join('/'));
    },
    viewerUrl(pathRel) {
      return blobBase + pathRel.split('/').map(encodeURIComponent).join('/');
    },
  };
}

module.exports = { createGithubSource, parseRepoUrl };
