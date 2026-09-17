const { BasePage } = require('./BasePage');

/**
 * PullRequestPage Object
 * Owner: Nitheesh
 */
class PullRequestPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.newPRButton = page.locator('a[href$="/compare"], a:has-text("New pull request")');
    this.prTitleInput = page.locator('#pull_request_title, input[name="pull_request[title]"]');
    this.prBodyInput = page.locator('#pull_request_body, textarea[name="pull_request[body]"]');
    this.createPRButton = page.locator('button:has-text("Create pull request")');
    this.prHeaderTitle = page.locator('.gh-header-title .js-issue-title');
    this.prStateBadge = page.locator('.State, span[data-view-component="true"]:has-text("Open")');
    this.prList = page.locator('div[aria-label="Pull Requests"], div[data-issue-and-pr-hovercards-enabled]');
    this.searchPRInput = page.locator('#js-issues-search');
  }

  /**
   * Navigate to the pull requests tab of a repository
   * @param {string} owner
   * @param {string} repo
   */
  async goto(owner, repo) {
    await this.navigate(`/${owner}/${repo}/pulls`);
  }

  /**
   * Create a pull request
   * @param {string} title
   * @param {string} body
   */
  async createPullRequest(title, body = '') {
    await this.click(this.newPRButton);
    await this.fill(this.prTitleInput, title);
    if (body) {
      await this.fill(this.prBodyInput, body);
    }
    await this.click(this.createPRButton);
  }

  /**
   * Get created pull request title text
   * @returns {Promise<string>}
   */
  async getCreatedPRTitle() {
    return await this.getText(this.prHeaderTitle);
  }

  /**
   * Search pull requests by keyword
   * @param {string} keyword
   */
  async searchPullRequests(keyword) {
    await this.fill(this.searchPRInput, keyword);
    await this.page.keyboard.press('Enter');
  }
}

module.exports = { PullRequestPage };
