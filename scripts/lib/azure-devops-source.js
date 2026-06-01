/**
 * Azure DevOps Git source adapter for build-project-data.js.
 *
 * Sibling of github-source.js. Given a meta.json `source: { repo, branch? }`
 * pointing at an Azure DevOps Git repo, exposes the same shape the local-disk
 * scanner produces: a flat list of files (POSIX paths relative to repo root +
 * mtime) plus readFile(path) and viewerUrl(path).
 *
 * Recognised repo URLs:
 *   https://dev.azure.com/{org}/{project}/_git/{repo}
 *   https://{org}.visualstudio.com/{project}/_git/{repo}
 *
 * Auth: reads AZURE_DEVOPS_PAT or AZURE_DEVOPS_TOKEN from env and sends it as
 * HTTP Basic (username blank, password = PAT) — the standard ADO REST scheme.
 * Anonymous access works only for public projects.
 *
 * mtime caveat: same coarse approximation as github-source — the items API
 * doesn't cheaply return per-file timestamps, so we stamp every file with the
 * branch HEAD commit date. That makes the "plan edited after last run" badge
 * fire whenever *anything* in the repo changed since the last run. Per-file
 * dates would need a pushes/commits call per path. Revisit if it matters.
 */

const API_VERSION = '7.1';

function parseRepoUrl(url) {
  if (!url) throw new Error('source.repo is required');
  const cleaned = String(url).trim().replace(/\/+$/, '');
  // https://dev.azure.com/{org}/{project}/_git/{repo}
  let m = cleaned.match(/dev\.azure\.com\/([^/]+)\/([^/]+)\/_git\/([^/?#]+)/i);
  if (m) {
    return {
      org: decodeURIComponent(m[1]),
      project: decodeURIComponent(m[2]),
      repo: decodeURIComponent(m[3]),
    };
  }
  // https://{org}.visualstudio.com/{project}/_git/{repo}
  m = cleaned.match(/https?:\/\/([^.]+)\.visualstudio\.com\/([^/]+)\/_git\/([^/?#]+)/i);
  if (m) {
    return {
      org: decodeURIComponent(m[1]),
      project: decodeURIComponent(m[2]),
      repo: decodeURIComponent(m[3]),
    };
  }
  throw new Error(`Not a recognised Azure DevOps repo URL: ${url}`);
}

function isAzureDevopsUrl(url) {
  if (!url) return false;
  return /dev\.azure\.com\/[^/]+\/[^/]+\/_git\//i.test(url) ||
    /\.visualstudio\.com\/[^/]+\/_git\//i.test(url);
}

function authHeaders(extra) {
  const pat = process.env.AZURE_DEVOPS_PAT || process.env.AZURE_DEVOPS_TOKEN;
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'Test-ReportsHub-build',
    ...(extra || {}),
  };
  if (pat) {
    // ADO PAT auth is HTTP Basic with an empty username.
    headers['Authorization'] = 'Basic ' + Buffer.from(':' + pat).toString('base64');
  }
  return headers;
}

function apiBase({ org, project, repo }) {
  return `https://dev.azure.com/${encodeURIComponent(org)}/${encodeURIComponent(project)}` +
    `/_apis/git/repositories/${encodeURIComponent(repo)}`;
}

async function adoFetch(url, { headers, allow } = {}) {
  const res = await fetch(url, { headers: headers || authHeaders() });
  if (allow && allow.includes(res.status)) return { __status: res.status };
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const hint = res.status === 401 || res.status === 203
      ? ' (auth failed — set AZURE_DEVOPS_PAT with Code:Read scope)'
      : '';
    throw new Error(`Azure DevOps API ${res.status} for ${url}${hint}\n${body.slice(0, 300)}`);
  }
  return res;
}

async function adoJson(url, opts) {
  const res = await adoFetch(url, opts);
  if (res.__status) return res;
  return res.json();
}

async function resolveBranch(loc, branch) {
  if (branch) return branch;
  const meta = await adoJson(`${apiBase(loc)}?api-version=${API_VERSION}`);
  // defaultBranch looks like "refs/heads/main".
  return (meta.defaultBranch || 'refs/heads/main').replace(/^refs\/heads\//, '');
}

async function getHeadCommitDate(loc, branch) {
  const url = `${apiBase(loc)}/commits` +
    `?searchCriteria.itemVersion.version=${encodeURIComponent(branch)}` +
    `&searchCriteria.itemVersion.versionType=branch` +
    `&searchCriteria.$top=1&api-version=${API_VERSION}`;
  const data = await adoJson(url, { allow: [404] });
  if (data.__status) return new Date(0);
  const c = data.value && data.value[0];
  const iso = c?.committer?.date || c?.author?.date;
  return iso ? new Date(iso) : new Date(0);
}

async function getTree(loc, branch) {
  // recursionLevel=Full returns the whole tree in one call. A new/empty repo
  // (or missing branch) returns 404 — treat as "no files yet" so a freshly
  // registered project renders an empty dashboard instead of failing the build.
  const url = `${apiBase(loc)}/items` +
    `?scopePath=/&recursionLevel=Full` +
    `&versionDescriptor.version=${encodeURIComponent(branch)}` +
    `&versionDescriptor.versionType=branch` +
    `&api-version=${API_VERSION}`;
  const data = await adoJson(url, { allow: [404] });
  if (data.__status) {
    console.warn(`[azure-devops-source] ${loc.org}/${loc.project}/${loc.repo}@${branch} returned 404 — treating as empty.`);
    return [];
  }
  return data.value || [];
}

async function createAzureDevopsSource({ repo, branch }) {
  const loc = parseRepoUrl(repo);
  const resolvedBranch = await resolveBranch(loc, branch);
  const [entries, headDate] = await Promise.all([
    getTree(loc, resolvedBranch),
    getHeadCommitDate(loc, resolvedBranch),
  ]);

  const files = entries
    .filter((e) => e.gitObjectType === 'blob' && !e.isFolder)
    // ADO paths are absolute ("/test-plans/x.md"); the rest of the pipeline
    // expects repo-root-relative POSIX paths with no leading slash.
    .map((e) => ({ path: String(e.path).replace(/^\/+/, ''), mtime: headDate }));

  const base = apiBase(loc);
  const webBase = `https://dev.azure.com/${encodeURIComponent(loc.org)}/${encodeURIComponent(loc.project)}` +
    `/_git/${encodeURIComponent(loc.repo)}`;

  return {
    kind: 'remote',
    provider: 'azure',
    org: loc.org,
    project: loc.project,
    repo: loc.repo,
    branch: resolvedBranch,
    files,
    headDate,
    async readFile(pathRel) {
      const url = `${base}/items` +
        `?path=/${pathRel.split('/').map(encodeURIComponent).join('/')}` +
        `&versionDescriptor.version=${encodeURIComponent(resolvedBranch)}` +
        `&versionDescriptor.versionType=branch` +
        `&includeContent=true&api-version=${API_VERSION}`;
      const data = await adoJson(url);
      if (typeof data.content === 'string') return data.content;
      throw new Error(`Azure DevOps item ${pathRel} returned no content`);
    },
    viewerUrl(pathRel) {
      const p = '/' + pathRel.split('/').map(encodeURIComponent).join('/');
      return `${webBase}?path=${encodeURIComponent(p)}&version=GB${encodeURIComponent(resolvedBranch)}&_a=contents`;
    },
  };
}

module.exports = { createAzureDevopsSource, parseRepoUrl, isAzureDevopsUrl };
