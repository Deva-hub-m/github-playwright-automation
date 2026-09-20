// Owner: Yazeen
// Owner: Yazeen

const { BasePage } = require('./BasePage');

/**
 * ExplorePage — Page Object for GitHub's Explore section.
 *
 * Covers three areas:
 *   • /explore          — the main Explore landing page
 *   • /trending         — Trending repositories page (optionally filtered by
 *                         language and date range)
 *   • /topics           — Topics discovery page
 *   • /topics/<topic>   — Individual topic detail page
 */
class ExplorePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // ── Explore landing ──────────────────────────────────────────────────────

    // "Explore" heading that appears at the top of /explore
    this.exploreHeading = page.locator('h1:has-text("Explore"), h2:has-text("Explore")').first();

    // "Trending repositories" link on the Explore landing page
    this.trendingLink = page.locator('a[href="/trending"], a:has-text("Trending")').first();

    // "Topics" link on the Explore landing page
    this.topicsLink = page.locator('a[href="/topics"], a:has-text("Topics")').first();

    // ── Trending page ────────────────────────────────────────────────────────

    // Individual repository rows in the trending list
    this.trendingRepoItems = page.locator('article.Box-row, article[class*="Box-row"]');

    // Language filter dropdown on the Trending page
    this.languageDropdown = page.locator('details summary:has-text("Language"), button:has-text("Language")').first();

    // Date-range filter dropdown ("Today", "This week", "This month")
    this.dateRangeDropdown = page.locator('details summary:has-text("Date range"), button:has-text("Date range"), details summary:has-text("Spoken Language")').first();

    // Specific date-range options inside the dropdown menu
    this.dateRangeToday     = page.locator('a[href*="since=daily"], a:has-text("Today")').first();
    this.dateRangeThisWeek  = page.locator('a[href*="since=weekly"], a:has-text("This week")').first();
    this.dateRangeThisMonth = page.locator('a[href*="since=monthly"], a:has-text("This month")').first();

    // ── Topics page ──────────────────────────────────────────────────────────

    // Topic cards / items on /topics
    this.topicCards = page.locator('.topic-card, article[data-category], a[href^="/topics/"]');

    // Search box on /topics
    this.topicsSearchInput = page.locator('input[name="q"], input[placeholder*="Search topics"]').first();

    // "Featured" topics section header
    this.featuredSectionHeading = page.locator('h2:has-text("Featured"), h1:has-text("Topics")').first();

    // ── Topic detail page (/topics/<name>) ───────────────────────────────────

    // The main topic name heading
    this.topicDetailHeading = page.locator('h1, .gutter-condensed h1, [data-testid="topic-header"] h1').first();

    // Repositories listed under a topic detail page
    this.topicRepoItems = page.locator('article.border, li.col-12, div.d-flex.flex-column article').first();
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  /**
   * Open the GitHub Explore landing page.
   */
  async openExplore() {
    await this.navigate('/explore');
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  /**
   * Open the GitHub Trending repositories page.
   * @param {string} [language]   - Optional language slug, e.g. 'javascript'
   * @param {string} [since]      - Optional date range: 'daily' | 'weekly' | 'monthly'
   */
  async openTrending(language, since) {
    const params = new URLSearchParams();
    if (language) params.set('l', language);
    if (since)    params.set('since', since);
    const qs = params.toString();
    await this.navigate(qs ? `/trending?${qs}` : '/trending');
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  /**
   * Open the GitHub Topics discovery page.
   */
  async openTopics() {
    await this.navigate('/topics');
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  /**
   * Open the detail page for a specific topic.
   * @param {string} topic - e.g. 'javascript', 'machine-learning'
   */
  async openTopic(topic) {
    await this.navigate(`/topics/${topic}`);
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  // ─── Interactions ──────────────────────────────────────────────────────────

  /**
   * Type into the Topics page search box and press Enter.
   * @param {string} query
   */
  async searchTopics(query) {
    await this.topicsSearchInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.fill(this.topicsSearchInput, query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  // ─── Assertion helpers ─────────────────────────────────────────────────────

  /**
   * Return the number of trending repository rows visible on the page.
   * @returns {Promise<number>}
   */
  async getTrendingRepoCount() {
    return await this.trendingRepoItems.count();
  }

  /**
   * Return the number of topic cards visible on /topics.
   * @returns {Promise<number>}
   */
  async getTopicCardCount() {
    return await this.topicCards.count();
  }

  /**
   * Check whether the Trending page heading / list container is visible.
   * @returns {Promise<boolean>}
   */
  async isTrendingListVisible() {
    try {
      return (await this.trendingRepoItems.count()) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check whether the Topics page shows at least one topic card.
   * @returns {Promise<boolean>}
   */
  async hasTopicCards() {
    try {
      return (await this.topicCards.count()) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Return the text content of the topic detail page heading.
   * @returns {Promise<string>}
   */
  async getTopicDetailHeadingText() {
    await this.topicDetailHeading.waitFor({ state: 'visible', timeout: 10000 });
    return await this.getText(this.topicDetailHeading);
  }
}

module.exports = { ExplorePage };
//verify for changes
