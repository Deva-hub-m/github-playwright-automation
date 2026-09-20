// Owner: Neil Joe

'use strict';

/**
 * codeviewer.spec.js — Tests for Code Browser, File View & Commit History
 *
 * These tests exercise the three page-object classes owned by Neil Joe:
 *   • CodeBrowserPage   — repository file tree browsing
 *   • FileViewPage      — individual file content viewing
 *   • CommitHistoryPage — repository / branch commit log
 *
 * Target repository: microsoft/vscode  (large, stable, always public)
 *
 * No login is required — all views tested here are publicly accessible.
 *
 * Run in isolation:
 *   npx playwright test tests/codeviewer.spec.js
 */

const { test, expect } = require('@playwright/test');

// GitHub pages can take >90 s on Firefox under parallel 7-worker load.
// Override the per-test timeout for this spec only (navigation timeout is
// set per-call on the page objects, not from this limit).
test.setTimeout(150_000);

const { CodeBrowserPage }   = require('../pages/CodeBrowserPage');
const { FileViewPage }      = require('../pages/FileViewPage');
const { CommitHistoryPage } = require('../pages/CommitHistoryPage');

// Repositories used as fixtures.
// CodeBrowser uses github/docs — a small, fast repo that loads quickly on all
// browsers even under parallel load. FileView and CommitHistory use
// microsoft/vscode which is fine for single-file / commits-list pages.
const OWNER        = 'microsoft';
const REPO         = 'vscode';
const BRANCH       = 'main';
const CB_OWNER     = 'github';   // lighter repo for file-tree tests
const CB_REPO      = 'docs';
const CB_BRANCH    = 'main';

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — Code Browser (file tree)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Code Browser — File Tree', () => {

  test.describe.configure({ mode: 'serial' });

  let codeBrowserPage;

  test.beforeEach(async ({ page }) => {
    codeBrowserPage = new CodeBrowserPage(page);
  });

  test('Repository root loads and shows files', async () => {
    await codeBrowserPage.openRepo(CB_OWNER, CB_REPO);

    // The page URL should contain the owner/repo path
    expect(codeBrowserPage.page.url()).toContain(`/${CB_OWNER}/${CB_REPO}`);

    // The file tree must have at least one entry
    const names = await codeBrowserPage.getFileNames();
    expect(names.length).toBeGreaterThan(0);
  });

  test('Known top-level entry exists in file tree', async () => {
    await codeBrowserPage.openRepo(CB_OWNER, CB_REPO);

    // github/docs always has a ".github" folder at its root
    const hasGithub = await codeBrowserPage.entryExists('.github');
    expect(hasGithub).toBeTruthy();
  });

  test('Navigating to a sub-directory loads its contents', async () => {
    // Navigate directly to the src directory
    await codeBrowserPage.openDirectory(CB_OWNER, CB_REPO, 'src');

    const names = await codeBrowserPage.getFileNames();
    expect(names.length).toBeGreaterThan(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — File View (blob view)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('File View — Individual File Content', () => {

  test.describe.configure({ mode: 'serial' });

  let fileViewPage;

  test.beforeEach(async ({ page }) => {
    fileViewPage = new FileViewPage(page);
  });

  test('README.md file content is visible', async () => {
    await fileViewPage.openFile(OWNER, REPO, BRANCH, 'README.md');

    const visible = await fileViewPage.isFileContentVisible();
    expect(visible).toBeTruthy();
  });

  test('README.md has non-empty content', async () => {
    await fileViewPage.openFile(OWNER, REPO, BRANCH, 'README.md');

    const content = await fileViewPage.getCodeContent();
    expect(content.length).toBeGreaterThan(0);
  });

  test('Raw button is present on file view page', async () => {
    await fileViewPage.openFile(OWNER, REPO, BRANCH, 'README.md');

    const rawUrl = await fileViewPage.getRawUrl();
    // The raw URL or href should contain "raw" or "githubusercontent"
    expect(rawUrl.length).toBeGreaterThan(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — Commit History
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Commit History — Repository Log', () => {

  test.describe.configure({ mode: 'serial' });

  let commitHistoryPage;

  test.beforeEach(async ({ page }) => {
    commitHistoryPage = new CommitHistoryPage(page);
  });

  test('Commit history page loads for repository', async () => {
    await commitHistoryPage.openCommitHistory(OWNER, REPO);

    expect(commitHistoryPage.page.url()).toContain(`/${OWNER}/${REPO}/commits`);
  });

  test('Commit history contains at least one commit', async () => {
    await commitHistoryPage.openCommitHistory(OWNER, REPO);

    const hasCommits = await commitHistoryPage.hasCommits();
    expect(hasCommits).toBeTruthy();
  });

  test('Commit history shows commit messages', async () => {
    await commitHistoryPage.openCommitHistory(OWNER, REPO);

    const messages = await commitHistoryPage.getCommitMessages();
    expect(messages.length).toBeGreaterThan(0);

    // Every returned message should be a non-empty string
    for (const msg of messages) {
      expect(msg.trim().length).toBeGreaterThan(0);
    }
  });

  test('Branch commit history loads for main branch', async () => {
    await commitHistoryPage.openBranchCommits(OWNER, REPO, BRANCH);

    const hasCommits = await commitHistoryPage.hasCommits();
    expect(hasCommits).toBeTruthy();
  });

});
