const { BasePage } = require('./BasePage');

/**
 * IssuePage Object
 * Owner: Nitheesh
 */
class IssuePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.newIssueButton = page.locator('a[href$="/issues/new/choose"], a[href$="/issues/new"], a:has-text("New issue")');
    this.issueTitleInput = page.locator('#issue_title, input[name="issue[title]"]');
    this.issueBodyInput = page.locator('#issue_body, textarea[name="issue[body]"]');
    this.submitIssueButton = page.locator('button:has-text("Submit new issue")');
    this.issueHeaderTitle = page.locator('.gh-header-title .js-issue-title');
    this.issueStateBadge = page.locator('.State, span[data-view-component="true"]:has-text("Open")');
    this.issuesList = page.locator('div[aria-label="Issues"], div[data-issue-and-pr-hovercards-enabled]');
    this.searchIssuesInput = page.locator('#js-issues-search');
  }

  /**
   * Navigate to the issues tab of a repository
   * @param {string} owner
   * @param {string} repo
   */
  async goto(owner, repo) {
    await this.navigate(`/${owner}/${repo}/issues`);
  }

  /**
   * Create a new issue in the repository
   * @param {string} title
   * @param {string} body
   */
  async createIssue(title, body = '') {
    await this.click(this.newIssueButton);
    await this.fill(this.issueTitleInput, title);
    if (body) {
      await this.fill(this.issueBodyInput, body);
    }
    await this.click(this.submitIssueButton);
  }

  /**
   * Get created issue title text
   * @returns {Promise<string>}
   */
  async getCreatedIssueTitle() {
    return await this.getText(this.issueHeaderTitle);
  }

  /**
   * Search issues by keyword
   * @param {string} keyword
   */
  async searchIssues(keyword) {
    await this.fill(this.searchIssuesInput, keyword);
    await this.page.keyboard.press('Enter');
  }
}

module.exports = { IssuePage };
