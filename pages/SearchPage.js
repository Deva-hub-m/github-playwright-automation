// Owner: Yazeen
// Owner: Yazeen

const { BasePage } = require('./BasePage');

/**
 * SearchPage — Page Object for GitHub's global search.
 *
 * Covers:
 *   • Navigating to github.com/search with a query
 *   • Filtering results by type (Repositories, Users, Topics, Code)
 *   • Reading result counts and repository/topic names from the result list
 *   • Language filter selection
 */
class SearchPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Global search box present on most GitHub pages (header)
    this.headerSearchInput = page.locator('[data-target="qbsearch-input.inputButton"], input[aria-label="Search GitHub"], button[data-target="qbsearch-input.inputButton"]').first();

    // Search input on the search results page
    this.searchInput = page.locator('input[name="q"][type="text"], input[data-testid="search-input"]').first();

    // "Search" / submit button on the results page
    this.searchSubmitButton = page.locator('button[type="submit"]:has-text("Search"), input[type="submit"][value="Search"]').first();

    // Result type navigation tabs (Repositories, Code, Users, Topics …)
    this.repositoriesTab = page.locator('a[href*="type=repositories"], a:has-text("Repositories")').first();
    this.topicsTab        = page.locator('a[href*="type=topics"], a:has-text("Topics")').first();
    this.usersTab         = page.locator('a[href*="type=users"], a:has-text("Users")').first();
    this.codeTab          = page.locator('a[href*="type=code"], a:has-text("Code")').first();

    // Result list containers
    this.repoResultItems  = page.locator('li.repo-list-item, div[data-testid="results-list"] > div, ul.repo-list > li');
    this.topicResultItems = page.locator('li[data-testid="topic-list-item"], .topic-list-item, article');

    // Language filter links inside the left-hand filter panel
    this.languageFilterLinks = page.locator('a[data-ga-click*="language"], .filter-item a[href*="l="]');

    // "No results" message
    this.noResultsHeading = page.locator('h3:has-text("We couldn"), .blankslate h3, [data-testid="no-results"]').first();

    // Sort dropdown
    this.sortDropdown = page.locator('select[name="s"], details summary:has-text("Sort")').first();
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  /**
   * Navigate directly to the search results page for the given query.
   * Optionally restrict to a result type (repositories | topics | users | code).
   *
   * @param {string} query
   * @param {string} [type] - e.g. 'repositories', 'topics', 'users', 'code'
   */
  async search(query, type) {
    const params = new URLSearchParams({ q: query });
    if (type) params.set('type', type);
    await this.navigate(`/search?${params.toString()}`);
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  /**
   * Navigate to the search page without pre-filling a query.
   */
  async open() {
    await this.navigate('/search');
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  // ─── Interactions ──────────────────────────────────────────────────────────

  /**
   * Type a new query into the on-page search input and submit.
   * @param {string} query
   */
  async submitSearch(query) {
    await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.fill(this.searchInput, query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  /**
   * Click the Repositories results tab.
   */
  async selectRepositoriesTab() {
    await this.repositoriesTab.waitFor({ state: 'visible', timeout: 10000 });
    await this.click(this.repositoriesTab);
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  /**
   * Click the Topics results tab.
   */
  async selectTopicsTab() {
    await this.topicsTab.waitFor({ state: 'visible', timeout: 10000 });
    await this.click(this.topicsTab);
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  // ─── Assertions helpers ────────────────────────────────────────────────────

  /**
   * Returns the current page URL.
   * @returns {string}
   */
  getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Return the number of repository result items visible on the page.
   * @returns {Promise<number>}
   */
  async getRepoResultCount() {
    return await this.repoResultItems.count();
  }

  /**
   * Return the number of topic result items visible on the page.
   * @returns {Promise<number>}
   */
  async getTopicResultCount() {
    return await this.topicResultItems.count();
  }

  /**
   * Check whether the "no results" message is displayed.
   * @returns {Promise<boolean>}
   */
  async hasNoResults() {
    try {
      return await this.noResultsHeading.isVisible();
    } catch {
      return false;
    }
  }
}

module.exports = { SearchPage };
//verify for changes