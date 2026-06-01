# Enterprise secrets — follow-up plan

> **Status:** planned, not yet implemented. This document is the agreed approach for
> getting credentials out of source. The Azure DevOps source integration (PR that
> added `scripts/lib/azure-devops-source.js`) is done; this is the next phase.

## Problem

App credentials are hardcoded and committed to git in ~13 places:

| Where | What |
|---|---|
| `projects/dep/CLAUDE.md`, `projects/HCM/CLAUDE.md` | `Admin / <password>` in a Credentials table |
| `projects/*/test-plans/**/*.md` | password inline in login steps |
| `projects/*/test-plans/**/*.spec.ts` | password as a string literal in `page.fill(...)` |

Two passwords are in history (`dep`: `123qwe`, `HCM`: `P@ssw0rd`). Anyone with read
access to the repo (it is public on GitHub Pages) has them. App URLs are also in
the clear, which is lower-risk but should move to config for consistency.

## Chosen approach — GitHub Secrets + env vars

No new infrastructure. Mirrors how `TEAMS_WEBHOOK_URL` is already consumed in
`.github/workflows/notify-failures.yml`, and how `AZURE_DEVOPS_PAT` / `GITHUB_TOKEN`
are now passed to the build steps.

### 1. Secret naming convention

One secret per project + role, namespaced by project slug so the hub can host many
apps without collision:

```
APP_PASSWORD__DEP          # dep admin password
APP_PASSWORD__HCM          # HCM admin password
APP_USERNAME__DEP          # optional, if usernames are sensitive
```

Stored as **GitHub Actions repository secrets** (or environment secrets if we want
per-environment approval gates) on `Boxfusion/Test-ReportsHub`.

### 2. Specs read from env, never literals

Replace literals in every `.spec.ts`:

```ts
// before
await page.getByLabel('Password').fill('123qwe');

// after
const password = process.env.APP_PASSWORD;
if (!password) throw new Error('APP_PASSWORD not set — see docs/enterprise-secrets.md');
await page.getByLabel('Password').fill(password);
```

`scripts/run-plan.js` resolves the per-project secret to the generic `APP_PASSWORD`
env var before invoking Playwright, using the project slug it already knows:

```js
// in run-plan.js, before spawning playwright
const slug = project.toUpperCase().replace(/-/g, '_');
process.env.APP_PASSWORD ||= process.env[`APP_PASSWORD__${slug}`];
process.env.APP_USERNAME ||= process.env[`APP_USERNAME__${slug}`];
```

So specs stay generic (`process.env.APP_PASSWORD`) and portable, while CI provides
the project-specific value.

### 3. Local developer experience

A gitignored `.env` at the hub root (already covered by `.gitignore`):

```dotenv
APP_PASSWORD__DEP=...
APP_PASSWORD__HCM=...
AZURE_DEVOPS_PAT=...
```

Add a committed `.env.example` documenting every variable name (no values). Load it
in `run-plan.js` via a tiny `require('dotenv').config()` (add `dotenv` as a dev dep)
or a 10-line hand-rolled parser to avoid the dependency.

### 4. CLAUDE.md / markdown plans

- Remove the password column from the Credentials table in each `projects/*/CLAUDE.md`;
  replace with: "Password: supplied at runtime via `APP_PASSWORD` (see
  `docs/enterprise-secrets.md`)."
- In `.md` plans, replace the literal password in login steps with the token
  `<APP_PASSWORD>` so the plan stays readable but carries no secret. The create-test
  skill should emit this token, and run-plan/AI-repair should treat `process.env`
  as the source of truth.

### 5. CI wiring

Add to the `Run a plan` step of `run-test.yml` and `nightly.yml` (alongside the
build env already added):

```yaml
env:
  APP_PASSWORD__DEP: ${{ secrets.APP_PASSWORD__DEP }}
  APP_PASSWORD__HCM: ${{ secrets.APP_PASSWORD__HCM }}
```

Or, cleaner as projects grow, a single JSON secret `APP_CREDENTIALS` mapping
slug→password, parsed once in `run-plan.js`.

### 6. Purge history (decide separately)

Rotating the two leaked passwords on the actual apps is the real fix — git history
rewriting (`git filter-repo`) is optional and disruptive. Recommend: **rotate the
app passwords**, then the committed values are dead and history rewrite is optional.

## Rollout order

1. Add `.env.example`, `.env` loader, and the `APP_PASSWORD__<SLUG>` resolution in
   `run-plan.js`.
2. Migrate one project's specs (`dep`) to `process.env.APP_PASSWORD`; verify a run
   still passes locally and in CI.
3. Migrate `HCM`, then any new projects.
4. Strip passwords from CLAUDE.md + `.md` plans; update the create-test skill to emit
   the `<APP_PASSWORD>` token.
5. Rotate the live app passwords.

## Why not Key Vault / SOPS (for now)

Azure Key Vault and SOPS/git-crypt were considered. Both are stronger for a large
org with central audit needs, but add a service principal / OIDC setup and a decrypt
step to every workflow. GitHub Secrets is zero-infra, already in use here, and
sufficient for this hub's threat model. Revisit Key Vault if credential count grows
beyond a handful of apps or if central rotation/audit becomes a requirement.
