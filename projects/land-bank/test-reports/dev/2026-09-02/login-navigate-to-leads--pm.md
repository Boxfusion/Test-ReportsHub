# Report: Test Plan: AUTH-1.1 — Login and Navigate to Leads — pm
**Date:** 2026-09-02 16:29 UTC
**Variant:** pm
**Plan:** test-plans/dev/auth/login-navigate-to-leads.md
**Spec:** test-plans/dev/auth/login-navigate-to-leads.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 951.8s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 2 | 0 | 2 | 0 |

## Step Results
### TC-01: Log in to Land Bank CRM as an Admin
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-01: Log in to Land Bank CRM as an Admin

**Error:**
```
TimeoutError: browserType.launch: Timeout 180000ms exceeded.
Call log:
[2m  - <launching> /Users/Sanele/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable
```

### TC-02: Navigate to Leads from the side menu
**Mode:** playwright-script
**Duration:** 0.7s
- [FAIL] TC-02: Navigate to Leads from the side menu

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-landbankcrmdev.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-landbankcrmdev.shesha.app/login", waiting until "load"[22m


  47 | async function loginAs(page: Page, role: string = 'ADMIN') {
  48 |   const { user, password } = credsFor(role);
> 49 |   await page.goto('/login');
     |              ^
  50 |   // STEP login.1: TYPE the Username field with the admin username (from `.env`)
  51 |   await page.getByPlaceholder('Username').fill(user);
  52 |   // STEP login.2: TYPE the Password field with the admin password (from `.env`)
    at loginAs (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/dev/auth/login-navigate-to-leads.spec.ts:49:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/dev/auth/login-navigate-to-leads.spec.ts:97:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/dev/auth/login-navigate-to-leads.spec.ts:49:14
