// Owner: Neil Joe

'use strict';

const { BasePage } = require('./BasePage');

/**
 * CodeBrowserPage — actions for browsing a repository's file tree on GitHub.
 *
 * Covers:
 *   - Navigating to a repository root and sub-directories
 *   - Reading the list of files / folders shown in the tree
 *   - Clicking into a file or folder entry
 *   - Verifying the breadcrumb path
 */
class CodeBrowserPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Individual file/folder name links inside the tree.
    // GitHub renders each link twice (visible + aria-hidden duplicate), so we
    // deduplicate in getFileNames() / entryExists().
    this.fileLinks = page.locator(
      'table[aria-labelledby="folders-and-files"] td[class*="name"] a'
    );

    // Breadcrumb navigation bar
    this.breadcrumb = page.locator('[aria-label="Breadcrumbs"], nav[aria-label="breadcrumb"], .breadcrumb');

    // Repository name heading shown at the top
    this.repoHeading = page.locator('[itemprop="name"] a, h1 strong a').first();
  }

  /**
   * Navigate to the root of a repository.
   *
   * @param {string} owner  GitHub username or org
   * @param {string} repo   Repository name
   */
  async openRepo(owner, repo) {
    await this.page.goto(`/${owner}/${repo}`, { waitUntil: 'domcontentloaded' });
    return this;
  }

  /**
   * Navigate to a specific directory path within a repository.
   *
   * @param {string} owner  GitHub username or org
   * @param {string} repo   Repository name
   * @param {string} path   Directory path relative to repo root (e.g. 'src/utils')
   */
  async openDirectory(owner, repo, path) {
    await this.page.goto(`/${owner}/${repo}/tree/HEAD/${path}`, { waitUntil: 'domcontentloaded' });
    return this;
  }

  /**
   * Return the unique names of all files and folders in the current tree view.
   * GitHub renders each link twice; this deduplicates by converting to a Set.
   *
   * @returns {Promise<string[]>}
   */
  async getFileNames() {
    await this.fileLinks.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const all = await this.fileLinks.allInnerTexts();
    return [...new Set(all.map(n => n.trim()).filter(Boolean))];
  }

  /**
   * Click a file or folder entry by its exact name.
   *
   * @param {string} name  Exact file / folder name as shown in the tree
   */
  async clickEntry(name) {
    const link = this.fileLinks.filter({ hasText: name }).first();
    await link.click();
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  /**
   * Return the full text of the breadcrumb navigation.
   *
   * @returns {Promise<string>}
   */
  async getBreadcrumbText() {
    const bc = this.breadcrumb.first();
    const visible = await bc.isVisible().catch(() => false);
    if (!visible) return '';
    return (await bc.innerText()).trim();
  }

  /**
   * Check whether a file or folder with the given name exists in the tree.
   * Matches against the link text content (case-sensitive exact match).
   *
   * GitHub renders each file entry twice — one visible link and one aria-hidden
   * duplicate. We count how many matching links exist; any count > 0 means the
   * entry is present.
   *
   * @param {string} name
   * @returns {Promise<boolean>}
   */
  async entryExists(name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^${escaped}$`);
    const count = await this.fileLinks.filter({ hasText: pattern }).count();
    return count > 0;
  }
}

module.exports = { CodeBrowserPage };
