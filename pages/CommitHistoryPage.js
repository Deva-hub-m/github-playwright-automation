// Owner: Neil Joe

'use strict';

const { BasePage } = require('./BasePage');

/**
 * CommitHistoryPage — actions for viewing the commit history of a repository.
 *
 * Covers:
 *   - Navigating to the commit list for a branch or file path
 *   - Reading commit messages
 *   - Reading commit authors and relative dates
 *   - Clicking into a specific commit to view its diff
 *   - Reading the commit SHA shown on the detail page
 */
class CommitHistoryPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Each commit row — GitHub's React-based commit list uses li[data-testid]
    this.commitItems = page.locator('li[data-testid]');

    // Commit message title links — the heading div inside each commit row contains
    // one or more <a> tags that link to /commit/<sha>.  We grab all such links
    // that are inside a heading element (class contains "ListItemTitle").
    // Fallback: any <a href*="/commit/"> whose direct parent has a class containing
    // "heading" or "title".
    this.commitMessages = page.locator(
      '[class*="ListItemTitle"] a[href*="/commit/"], ' +
      '[class*="heading"] a[href*="/commit/"]'
    );

    // Author names within each commit row
    this.commitAuthors = page.locator(
      '[data-testid="commit-author-username"], ' +
      'a[rel="author"], ' +
      '.commit-author'
    );

    // Relative timestamps on commit rows
    this.commitDates = page.locator('relative-time, time-ago');

    // Full SHA displayed on the individual commit detail page
    this.commitSha = page.locator(
      '[data-testid="commit-sha"], ' +
      'span.commit-sha, ' +
      '.sha-block .sha'
    ).first();

    // Diff stats area on a commit detail page
    this.diffStats = page.locator(
      '[data-testid="diff-stats"], ' +
      '.diffstat'
    ).first();
  }

  /**
   * Navigate to the commit history for the default branch of a repository.
   *
   * @param {string} owner  GitHub username or org
   * @param {string} repo   Repository name
   */
  async openCommitHistory(owner, repo) {
    await this.navigate(`/${owner}/${repo}/commits`);
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  /**
   * Navigate to the commit history for a specific branch.
   *
   * @param {string} owner   GitHub username or org
   * @param {string} repo    Repository name
   * @param {string} branch  Branch name
   */
  async openBranchCommits(owner, repo, branch) {
    await this.navigate(`/${owner}/${repo}/commits/${branch}`);
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  /**
   * Navigate to the commit history for a specific file path.
   *
   * @param {string} owner   GitHub username or org
   * @param {string} repo    Repository name
   * @param {string} branch  Branch name
   * @param {string} path    File path (e.g. 'README.md')
   */
  async openFileCommits(owner, repo, branch, path) {
    await this.navigate(`/${owner}/${repo}/commits/${branch}/${path}`);
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  /**
   * Return all visible commit messages as an array of strings.
   * Each commit title may be split across multiple sibling <a> tags;
   * this joins all link texts per commit row into a single string.
   *
   * @returns {Promise<string[]>}
   */
  async getCommitMessages() {
    // Wait for at least one commit item to be visible
    await this.commitItems.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    // Collect all commit message link texts, deduplicate, and filter empty
    const texts = await this.commitMessages.allInnerTexts();
    const unique = [...new Set(texts.map(t => t.trim()).filter(Boolean))];

    // If the CSS class approach found nothing, fall back to commit-item inner text
    if (unique.length === 0) {
      const itemTexts = await this.commitItems.allInnerTexts();
      return itemTexts.map(t => t.split('\n')[0].trim()).filter(Boolean);
    }
    return unique;
  }

  /**
   * Return all visible commit author names as an array of strings.
   *
   * @returns {Promise<string[]>}
   */
  async getCommitAuthors() {
    await this.commitAuthors.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    return await this.commitAuthors.allInnerTexts();
  }

  /**
   * Return the number of commit rows visible on the current page.
   *
   * @returns {Promise<number>}
   */
  async getCommitCount() {
    await this.commitItems.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    return await this.commitItems.count();
  }

  /**
   * Click a commit by its message text to open the commit detail page.
   *
   * @param {string} message  Commit message (or substring) to click
   */
  async clickCommitByMessage(message) {
    const link = this.commitMessages.filter({ hasText: message }).first();
    await link.click();
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  /**
   * Return the full or abbreviated commit SHA shown on the detail page.
   *
   * @returns {Promise<string>}
   */
  async getCommitSha() {
    const el = this.commitSha;
    const visible = await el.isVisible().catch(() => false);
    if (!visible) return '';
    return (await el.innerText()).trim();
  }

  /**
   * Check whether any commits are listed on the current page.
   *
   * @returns {Promise<boolean>}
   */
  async hasCommits() {
    await this.commitItems.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const count = await this.commitItems.count();
    return count > 0;
  }
}

module.exports = { CommitHistoryPage };
