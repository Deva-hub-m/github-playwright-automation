# HANDOFF.md — GitHub Playwright Automation

> **📌 Agent / Contributor Notice**
> This file is the single source of truth for what has been built, what is in progress,
> and what still needs to be done. **If you are an agent or team member working on any
> part of this project, you MUST update this file when your work is complete.**
> Add a new entry under [Completed Work](#completed-work), update
> [Pending Work](#pending-work), and keep the [File Status Table](#file-status-table)
> accurate. This ensures every agent that picks up work next has a clean handoff.

---

## Project Overview

**Project:** GitHub Playwright Automation (JavaScript)
**Framework:** Playwright + `@playwright/test` + Page Object Model
**Language:** JavaScript (CommonJS / Node.js)
**Target app:** [https://github.com](https://github.com)
**Team:** Group 5 — IBM QE Training

This is a direct Playwright port of the Java Selenium automation project located at
`C:\Users\MuhammadSulthanSulth\Downloads\Github-Selenium-Automation`.
Each team member owns the same functional area they owned in the Selenium project,
now re-implemented in JavaScript with Playwright.

---

## How to Run

```bash
# Install dependencies
npm install

# Install Playwright browser binaries
npx playwright install --with-deps

# Copy environment config
cp .env.example .env          # then fill in GITHUB_USERNAME / GITHUB_PASSWORD

# Run all tests (headless)
npm test

# Run all tests (headed browser visible)
npm run test:headed

# Run a single spec
npx playwright test tests/login.spec.js

# Open Playwright built-in HTML report
npm run test:report

# Open custom HTML artifact report (dark-theme, standalone file)
# After a run, see: test-results/reports/PlaywrightReport_<timestamp>.html
```

---

## Completed Work

---

### ✅ Sulthan — Reporting & Screenshots
**Branch:** `Sulthan`
**Completed:** 2025-01

#### Files Created / Modified

| File | Action | Description |
|---|---|---|
| [`utils/ScreenshotUtils.js`](utils/ScreenshotUtils.js) | **Created** | Full Playwright port of Java `ScreenshotUtils.java` |
| [`utils/ReportManager.js`](utils/ReportManager.js) | **Created** | Full Playwright port of Java `ReportManager.java` + HTML artifact writer |
| [`utils/index.js`](utils/index.js) | **Updated** | Exports `ScreenshotUtils` and `ReportManager` alongside all other utils |
| [`reporters/HtmlArtifactReporter.js`](reporters/HtmlArtifactReporter.js) | **Created** | Custom Playwright reporter that feeds per-worker results to the teardown |
| [`tests/globalSetup.js`](tests/globalSetup.js) | **Created** | Clears screenshot directory before the suite starts (mirrors `@BeforeAll cleanScreenshotFolder()` in `Hooks.java`) |
| [`tests/globalTeardown.js`](tests/globalTeardown.js) | **Created** | Merges worker result shards and writes the final HTML artifact (mirrors `ReportManager.flushReports()`) |
| [`playwright.config.js`](playwright.config.js) | **Updated** | Wired `globalSetup`, `globalTeardown`, custom reporter, screenshot/trace/video settings |
| [`package.json`](package.json) | **Updated** | Added `test:report:open` script; patched `@faker-js/faker` from `^9.3.0` → `^10.6.0` (GHSA-qxc2-j82w-r537, high severity) |

#### What Each File Does

**`utils/ScreenshotUtils.js`**
Captures and stores screenshots during test runs. Mirrors the Java `ScreenshotUtils`
written by Sulthan for the Selenium project.

```
ScreenshotUtils.capture(page, name)               → viewport PNG to test-results/screenshots/
ScreenshotUtils.captureFullPage(page, name)        → full scrolling-page PNG
ScreenshotUtils.captureElement(locator, name)      → element-cropped PNG
ScreenshotUtils.captureOnFailure(page, info, lbl)  → saves only when test is failing (_FAILED suffix)
ScreenshotUtils.attachToReport(page, info, name)   → saves PNG + embeds inline in Playwright HTML report
ScreenshotUtils.attachFullPageToReport(...)        → full-page version of the above
ScreenshotUtils.captureStep(page, info, stepNum)   → per-step screenshot (mirrors @AfterStep in Hooks.java)
ScreenshotUtils.cleanScreenshotDir()               → deletes all .png from previous run
ScreenshotUtils.getScreenshotDir()                 → returns the output directory path
```

**Filename format:** `<sanitized-name>_<yyyyMMdd_HHmmss_mmm>.png`
**Output directory:** `test-results/screenshots/`

---

**`utils/ReportManager.js`**
Per-test reporting lifecycle + self-contained HTML artifact writer.
Mirrors Java `ReportManager.java` (ExtentReports 5) in the Playwright ecosystem.

```
ReportManager.startTest(testInfo)         → starts a test node, auto-resolves feature + author
ReportManager.logStep(message)            → logs a step message for the current test
ReportManager.logPass(testInfo)           → marks current test PASSED
ReportManager.logFail(testInfo, error)    → marks current test FAILED with error detail
ReportManager.getResults()                → returns accumulated results for this worker
ReportManager.writeHtmlArtifact(results)  → writes PlaywrightReport_<timestamp>.html
```

The HTML artifact is a dark-themed, self-contained file (no server needed) that includes:
- Summary cards (Total / Passed / Failed / Pass Rate)
- Per-test table (Feature, Test Name, Author, Browser, Status, Duration, Steps/Error)
- System metadata bar (Project, Team, Environment)

Output: `test-results/reports/PlaywrightReport_<timestamp>.html`

---

**`reporters/HtmlArtifactReporter.js`**
Custom Playwright reporter class registered in `playwright.config.js`.
Collects `onTestEnd` results per worker and writes a JSON shard to
`test-results/reports/.worker-<pid>.json`.
`globalTeardown.js` reads all shards, merges them, and calls
`ReportManager.writeHtmlArtifact()`.

---

**`tests/globalSetup.js`**
Runs once before all workers start. Calls `ScreenshotUtils.cleanScreenshotDir()`
to wipe `.png` files from the previous run. Registered via `globalSetup` in
`playwright.config.js`.

---

**`tests/globalTeardown.js`**
Runs once after all workers finish. Reads all `.worker-*.json` shards from
`test-results/reports/`, merges them, and calls `ReportManager.writeHtmlArtifact()`
to produce the final consolidated HTML report. Registered via `globalTeardown` in
`playwright.config.js`.

---

**`playwright.config.js` changes (Sulthan)**
```js
globalSetup:    './tests/globalSetup.js'
globalTeardown: './tests/globalTeardown.js'

reporter: [
  ['html',  { open: 'never', outputFolder: 'playwright-report' }],  // Playwright built-in
  ['list'],                                                           // console output
  ['./reporters/HtmlArtifactReporter.js'],                           // custom artifact feed
]

use: {
  screenshot: 'only-on-failure',   // automatic baseline failure shot
  trace:      'on-first-retry',    // trace zip for CI debugging
  video:      'retain-on-failure', // video on failure only
}
```

#### Java → JavaScript Mapping

| Java (Selenium project) | JavaScript (Playwright project) |
|---|---|
| `ScreenshotUtils.capture(name)` | `ScreenshotUtils.capture(page, name)` |
| `_FAILED` suffix pattern in `Hooks.java` | `ScreenshotUtils.captureOnFailure(page, testInfo, label)` |
| `@AfterStep` per-step screenshot | `ScreenshotUtils.captureStep(page, testInfo, stepNumber)` |
| `@BeforeAll cleanScreenshotFolder()` | `globalSetup.js` → `ScreenshotUtils.cleanScreenshotDir()` |
| `ReportManager.startTest(name, desc)` | `ReportManager.startTest(testInfo)` |
| `ReportManager.getTest().info(msg)` | `ReportManager.logStep(message)` |
| `ReportManager.getTest().pass(...)` | `ReportManager.logPass(testInfo)` |
| `ReportManager.getTest().fail(...)` | `ReportManager.logFail(testInfo, error)` |
| `ReportManager.flushReports()` | `globalTeardown.js` → `ReportManager.writeHtmlArtifact()` |
| `ExtentSparkReporter` dark HTML output | `ReportManager.writeHtmlArtifact()` self-contained HTML |
| `ThreadLocal<ExtentTest>` | Not needed — Playwright workers are isolated processes |

#### How to Use in a Test Spec

```js
const { ScreenshotUtils } = require('../utils/ScreenshotUtils');
const { ReportManager }   = require('../utils/ReportManager');

test.beforeEach(({}, testInfo) => {
  ReportManager.startTest(testInfo);
});

test('my test', async ({ page }, testInfo) => {
  ReportManager.logStep('Navigate to login page');
  await page.goto('/login');

  // Attach screenshot inline to Playwright HTML report
  await ScreenshotUtils.attachToReport(page, testInfo, 'login_page_loaded');

  // ... test steps ...

  ReportManager.logPass(testInfo);
});

test.afterEach(async ({ page }, testInfo) => {
  // Auto-capture on failure (saves <title>_FAILED_<timestamp>.png)
  await ScreenshotUtils.captureOnFailure(page, testInfo);

  if (testInfo.status === 'failed') {
    ReportManager.logFail(testInfo, testInfo.error);
  }
});
```

---

## Pending Work

> **Agents / team members: claim a row, fill in your name, and update this section
> when your work is complete. Move finished items to [Completed Work](#completed-work).**

| Owner | Area | Files | Status |
|---|---|---|---|
| **Deva Vignan** | Framework Foundation | `pages/BasePage.js`, `pages/index.js`, `package.json`, `README.md` | 🟡 In Progress |
| **Jothi Sri** | Authentication & Profile | `pages/LoginPage.js`, `pages/ProfilePage.js`, `tests/login.spec.js` | 🟡 In Progress |
| **Sujin** | Repository Management | `pages/NewRepoPage.js`, `pages/RepoHomePage.js`, `tests/repository.spec.js` | ⚪ Not Started |
| **Nitheesh** | Issues & Pull Requests | `pages/IssuePage.js`, `pages/PullRequestPage.js`, `tests/issue.spec.js`, `tests/pullrequest.spec.js` | ⚪ Not Started |
| **Yazeen** | Search & Explore | `pages/SearchPage.js`, `pages/ExplorePage.js`, `tests/search.spec.js` | ⚪ Not Started |
| **Naveen** | GitHub Gists | `pages/GistCreatePage.js`, `pages/GistViewPage.js`, `tests/gist.spec.js` | ⚪ Not Started |
| **Neil Joe** | Code Browser & Commits | `pages/CodeBrowserPage.js`, `pages/FileViewPage.js`, `pages/CommitHistoryPage.js`, `tests/codeviewer.spec.js` | ✅ Done |
| **Arsath** | Config, Data & Utilities | `utils/ConfigReader.js`, `utils/ExcelUtils.js`, `utils/FakerDataFactory.js`, `utils/WaitUtils.js`, `.env.example` | 🟡 In Progress |
| **Nitin K M** | CI/CD Pipeline | `.github/workflows/playwright-ci.yml`, `.github/workflows/playwright-scheduled.yml`, `.github/PULL_REQUEST_TEMPLATE.md` | ✅ Done |

---

## File Status Table

> Keep this table up to date. Mark `✅ Done` only when the file is implemented,
> locally tested, and the PR is merged to the main branch.

| File | Owner | Status | Notes |
|---|---|---|---|
| `playwright.config.js` | Deva Vignan / Sulthan | ✅ Done | globalSetup, globalTeardown, reporters, screenshot/trace wired |
| `package.json` | Deva Vignan / Sulthan | ✅ Done | faker patched to 10.6.0 (security fix) |
| `pages/BasePage.js` | Deva Vignan | ✅ Done | Core page interactions |
| `pages/LoginPage.js` | Jothi Sri | ✅ Done | Login / logout page actions |
| `tests/login.spec.js` | Jothi Sri | ✅ Done | Valid login, invalid password, empty password |
| `tests/globalSetup.js` | Sulthan | ✅ Done | Clears screenshots before suite |
| `tests/globalTeardown.js` | Sulthan | ✅ Done | Writes HTML artifact after suite |
| `utils/ScreenshotUtils.js` | Sulthan | ✅ Done | Full screenshot utility — 9 public methods |
| `utils/ReportManager.js` | Sulthan | ✅ Done | Test lifecycle logging + HTML artifact writer |
| `utils/index.js` | Deva Vignan / Sulthan | ✅ Done | Exports all utils |
| `reporters/HtmlArtifactReporter.js` | Sulthan | ✅ Done | Custom reporter feeding globalTeardown |
| `pages/ProfilePage.js` | Jothi Sri | 🟡 In Progress | — |
| `pages/NewRepoPage.js` | Sujin | ⚪ Not Started | — |
| `pages/RepoHomePage.js` | Sujin | ⚪ Not Started | — |
| `pages/IssuePage.js` | Nitheesh | ⚪ Not Started | — |
| `pages/PullRequestPage.js` | Nitheesh | ⚪ Not Started | — |
| `pages/SearchPage.js` | Yazeen | ⚪ Not Started | — |
| `pages/ExplorePage.js` | Yazeen | ⚪ Not Started | — |
| `pages/GistCreatePage.js` | Naveen | ⚪ Not Started | — |
| `pages/GistViewPage.js` | Naveen | ⚪ Not Started | — |
| `pages/CodeBrowserPage.js` | Neil Joe | ✅ Done | File-tree browsing — openRepo, openDirectory, getFileNames, entryExists, clickEntry, getBreadcrumbText |
| `pages/FileViewPage.js` | Neil Joe | ✅ Done | File content viewer — openFile, getCodeLines, getCodeContent, isFileContentVisible, getRawUrl, clickRaw |
| `pages/CommitHistoryPage.js` | Neil Joe | ✅ Done | Commit log — openCommitHistory, openBranchCommits, openFileCommits, getCommitMessages, getCommitAuthors, hasCommits, clickCommitByMessage |
| `tests/repository.spec.js` | Sujin | ⚪ Not Started | — |
| `tests/issue.spec.js` | Nitheesh | ⚪ Not Started | — |
| `tests/pullrequest.spec.js` | Nitheesh | ⚪ Not Started | — |
| `tests/search.spec.js` | Yazeen | ⚪ Not Started | — |
| `tests/gist.spec.js` | Naveen | ⚪ Not Started | — |
| `tests/codeviewer.spec.js` | Neil Joe | ✅ Done | 10 tests across 3 suites (CodeBrowser, FileView, CommitHistory) — targets public microsoft/vscode repo, no login required |
| `utils/ConfigReader.js` | Arsath | 🟡 In Progress | — |
| `utils/ExcelUtils.js` | Arsath | 🟡 In Progress | — |
| `utils/FakerDataFactory.js` | Arsath | 🟡 In Progress | — |
| `utils/WaitUtils.js` | Arsath | 🟡 In Progress | — |
| `.env.example` | Arsath | ✅ Done | — |
| `.github/workflows/playwright-ci.yml` | Nitin K M | ✅ Done | Push/PR trigger, 3-browser matrix, artifact upload, Actions summary |
| `.github/workflows/playwright-scheduled.yml` | Nitin K M | ✅ Done | Nightly cron at 00:00 UTC, 3-browser matrix, 30-day artifact retention |
| `.github/PULL_REQUEST_TEMPLATE.md` | Nitin K M | ✅ Done | Checklist enforcing HANDOFF.md update + no-secrets policy |

---

## Known Issues / Notes

| # | Severity | Description | Owner |
|---|---|---|---|
| 1 | ⚠️ High | `xlsx@0.18.5` has known vulnerabilities (GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9). No non-breaking fix available upstream — monitor for a patched release or replacement library. | Arsath / Deva Vignan |
| 2 | ℹ️ Info | `@faker-js/faker` was upgraded from `^9.3.0` → `^10.6.0` to resolve GHSA-qxc2-j82w-r537 (arbitrary code execution via `helpers.fake`). Verify your `FakerDataFactory.js` code is still compatible with the v10 API. | Arsath |
| 3 | ℹ️ Info | `ReportManager.logPass` / `logFail` must be called explicitly per test — there is no automatic teardown hook built into ReportManager. Use a `test.afterEach` fixture or Playwright fixture to call them consistently. | All spec owners |

---

## Agent / Contributor Update Instructions

When you finish your area, update this file as follows:

1. **Move your row** in [Pending Work](#pending-work) to [Completed Work](#completed-work).
2. **Add a new sub-section** under [Completed Work](#completed-work) titled
   `✅ <YourName> — <Your Area>` describing:
   - Files created or modified
   - What each file does (a short paragraph or bullet list is fine)
   - Any deviations from the original Selenium project design
   - Any decisions other agents should know about
3. **Update your rows** in [File Status Table](#file-status-table) from
   `⚪ Not Started` / `🟡 In Progress` → `✅ Done`.
4. **Add any new Known Issues** to the table above.
5. Commit `HANDOFF.md` together with your code changes in the same PR so the
   history stays linked.

---

---

### ✅ Nitin K M — CI/CD & Execution
**Completed:** 2025-01

#### Files Created

| File | Description |
|---|---|
| [`.github/workflows/playwright-ci.yml`](.github/workflows/playwright-ci.yml) | Primary CI pipeline — triggers on push/PR to master and on manual dispatch |
| [`.github/workflows/playwright-scheduled.yml`](.github/workflows/playwright-scheduled.yml) | Nightly scheduled run at 00:00 UTC every day |
| [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) | PR checklist enforcing HANDOFF.md updates and no-secrets policy |

#### What Each File Does

**`.github/workflows/playwright-ci.yml`**
Four-job pipeline:
1. **install** — `npm ci`, reads Playwright version, caches `node_modules` and browser binaries (`~/.playwright-browsers`) keyed to the exact PW version.
2. **lint** — fast pre-gate: verifies `playwright.config.js` parses, `utils/index.js` loads, and lists registered projects.
3. **test** — `matrix: [chromium, firefox, webkit]` with `fail-fast: false` so all browsers report independently. Writes `.env` from GitHub Secrets (never echoed). Runs `npx playwright test --project=<browser>`. Uploads `playwright-report-<browser>` and `test-results-<browser>` artefacts (retained 14 days).
4. **summary** — downloads all browser reports and writes a consolidated markdown table to the GitHub Actions step summary page.

Manual dispatch exposes two inputs: `browser` (single browser or `all`) and `headed` (`true`/`false`).

**`.github/workflows/playwright-scheduled.yml`**
Same structure as the CI pipeline but triggered by cron (`0 0 * * *` = 00:00 UTC / 05:30 IST). Artefacts retained for 30 days (longer than CI's 14) so nightly results survive across a working week.

#### GitHub Secrets Required

| Secret name | Maps to `.env` key | Notes |
|---|---|---|
| `GITHUB_USERNAME` | `GITHUB_USERNAME` | GitHub account used in authenticated tests |
| `GITHUB_PASSWORD` | `GITHUB_PASSWORD` | Account password — store as an encrypted secret |
| `GH_TOKEN` | `GITHUB_TOKEN` | Personal Access Token for REST API tests (optional) |

> Set these under **Settings → Secrets and variables → Actions** in the repository.

#### Design Decisions

- **Browser caching** — Playwright binaries are cached per OS + exact Playwright version. On cache hit only OS-level deps are re-installed (`playwright install-deps`), saving ~2 min per run.
- **`fail-fast: false`** — a WebKit failure does not cancel Chromium/Firefox; all three results are always available.
- **Secrets never echo** — `.env` is constructed with `printf '%s\n'` so secret values never appear in the Actions log even with debug logging enabled.
- **`npm ci --prefer-offline || npm install`** — falls back gracefully when there is no lock file (team convention omits `package-lock.json` from `.gitignore`).
- **`actions/checkout@v4`, `setup-node@v4`, `cache@v4`, `upload-artifact@v4`** — all pinned to the latest major version (v4) per GitHub's recommended practice.

---

*Last updated by: **Neil Joe Augustine** — Code Browser, File View & Commit History area*

---

### ✅ Neil Joe Augustine — Code Browser, File View & Commit History
**Branch:** `neil`
**Completed:** 2025-01

#### Files Created / Modified

| File | Action | Description |
|---|---|---|
| [`pages/CodeBrowserPage.js`](pages/CodeBrowserPage.js) | **Created** | Page object for browsing a repository's file tree |
| [`pages/FileViewPage.js`](pages/FileViewPage.js) | **Created** | Page object for viewing an individual file (blob view) |
| [`pages/CommitHistoryPage.js`](pages/CommitHistoryPage.js) | **Created** | Page object for the commit history / log pages |
| [`tests/codeviewer.spec.js`](tests/codeviewer.spec.js) | **Created** | 10 Playwright tests across 3 suites — no login required |
| [`pages/index.js`](pages/index.js) | **Updated** | Exports `CodeBrowserPage`, `FileViewPage`, `CommitHistoryPage` |

#### What Each File Does

**`pages/CodeBrowserPage.js`**
Wraps interactions with the GitHub repository file-tree view (`/<owner>/<repo>`).

```
CodeBrowserPage.openRepo(owner, repo)              → navigates to repo root
CodeBrowserPage.openDirectory(owner, repo, path)   → navigates to a sub-directory
CodeBrowserPage.getFileNames()                      → returns string[] of visible file/folder names
CodeBrowserPage.entryExists(name)                   → boolean — checks if a name is in the tree
CodeBrowserPage.clickEntry(name)                    → clicks a file or folder by exact name
CodeBrowserPage.getBreadcrumbText()                 → returns breadcrumb navigation text
```

**`pages/FileViewPage.js`**
Wraps interactions with GitHub's blob / file viewer (`/<owner>/<repo>/blob/<branch>/<path>`).

```
FileViewPage.openFile(owner, repo, branch, path)   → navigates to a file
FileViewPage.getFileName()                          → returns the file name from breadcrumb
FileViewPage.getCodeLines()                         → returns string[] of rendered code lines
FileViewPage.getCodeContent()                       → returns the full file text (joined lines)
FileViewPage.isFileContentVisible()                 → boolean — checks code area is visible
FileViewPage.getRawUrl()                            → returns the href of the Raw button
FileViewPage.clickRaw()                             → clicks Raw and returns the resulting URL
```

**`pages/CommitHistoryPage.js`**
Wraps interactions with GitHub's commit log (`/<owner>/<repo>/commits`).

```
CommitHistoryPage.openCommitHistory(owner, repo)          → navigates to default commits page
CommitHistoryPage.openBranchCommits(owner, repo, branch)  → navigates to branch commit log
CommitHistoryPage.openFileCommits(owner, repo, branch, p) → navigates to file commit log
CommitHistoryPage.getCommitMessages()                     → returns string[] of commit titles
CommitHistoryPage.getCommitAuthors()                      → returns string[] of author names
CommitHistoryPage.getCommitCount()                        → returns number of visible commits
CommitHistoryPage.hasCommits()                            → boolean — at least one commit found
CommitHistoryPage.clickCommitByMessage(message)           → clicks a commit by message text
CommitHistoryPage.getCommitSha()                          → returns SHA from commit detail page
```

#### Design Decisions

- **No login required** — all tested pages are publicly accessible; avoids credential dependency.
- **Target repo `microsoft/vscode`** — large, stable, always-public repo. `src/` folder and `package.json` are permanent fixtures; `README.md` always exists on `main`.
- **Multi-selector locators** — each locator uses comma-separated CSS fallbacks to handle GitHub's periodic UI updates gracefully without test breakage.
- **`.catch(() => {})` on waitFor** — optional waits degrade gracefully when a selector is absent rather than throwing; the test assertion itself fails meaningfully.
- **`pages/index.js` updated** — Neil's three page classes are now re-exported from the barrel file so other specs can import them via `require('../pages')`.
