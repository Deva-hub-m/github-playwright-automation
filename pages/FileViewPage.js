// Owner: Neil Joe

'use strict';

const { BasePage } = require('./BasePage');

/**
 * FileViewPage — actions for viewing an individual file on GitHub.
 *
 * Covers:
 *   - Navigating directly to a file
 *   - Reading the file's raw text content
 *   - Reading the displayed line count
 *   - Verifying the file name shown in the heading
 *   - Navigating to the raw view
 */
class FileViewPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // File content area — covers both rendered-markdown (article/.markdown-body)
    // and raw-code blob views (.react-code-lines, table.highlight).
    this.contentArea = page.locator(
      'article, ' +
      '.markdown-body, ' +
      '[data-hpc], ' +
      '.react-code-lines, ' +
      'table.highlight td.blob-code'
    ).first();

    // File name shown in the breadcrumb / heading area
    this.fileName = page.locator(
      '[data-testid="breadcrumb-item"]:last-child, ' +
      '.final-path, ' +
      '.breadcrumb strong'
    ).first();

    // Line count badge (e.g. "42 lines")
    this.lineCountBadge = page.locator(
      '[data-testid="blob-stats-overview"], ' +
      '.file-info .text-mono'
    ).first();

    // "Raw" button / link
    this.rawButton = page.locator('a[data-testid="raw-button"], a[href*="/raw/"]').first();

    // Copy raw contents button
    this.copyRawButton = page.locator('button[data-testid="copy-raw-button"], clipboard-copy').first();
  }

  /**
   * Navigate directly to a file within a repository.
   *
   * @param {string} owner   GitHub username or org
   * @param {string} repo    Repository name
   * @param {string} branch  Branch name (e.g. 'main', 'master')
   * @param {string} path    File path relative to repo root (e.g. 'README.md')
   */
  async openFile(owner, repo, branch, path) {
    await this.navigate(`/${owner}/${repo}/blob/${branch}/${path}`);
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  /**
   * Return the displayed file name from the breadcrumb.
   *
   * @returns {Promise<string>}
   */
  async getFileName() {
    const el = this.fileName;
    const visible = await el.isVisible().catch(() => false);
    if (!visible) return '';
    return (await el.innerText()).trim();
  }

  /**
   * Return all visible code lines as an array of strings.
   * For rendered-markdown files this returns a single-element array
   * containing all the markdown text.
   *
   * @returns {Promise<string[]>}
   */
  async getCodeLines() {
    await this.contentArea.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const text = await this.contentArea.innerText().catch(() => '');
    return text.split('\n').map(l => l.trim()).filter(Boolean);
  }

  /**
   * Return all visible code joined into a single string.
   *
   * @returns {Promise<string>}
   */
  async getCodeContent() {
    await this.contentArea.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    return await this.contentArea.innerText().catch(() => '');
  }

  /**
   * Check whether the file content area is rendered and visible.
   *
   * @returns {Promise<boolean>}
   */
  async isFileContentVisible() {
    return await this.contentArea.isVisible().catch(() => false);
  }

  /**
   * Click the "Raw" button and return the raw URL the browser navigates to.
   *
   * @returns {Promise<string>} The URL of the raw view
   */
  async clickRaw() {
    await this.rawButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    return this.page.url();
  }

  /**
   * Return the href of the "Raw" link without navigating.
   *
   * @returns {Promise<string>}
   */
  async getRawUrl() {
    return await this.rawButton.getAttribute('href') || '';
  }
}

module.exports = { FileViewPage };
