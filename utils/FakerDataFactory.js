// Owner: Arsath
// utils/FakerDataFactory.js

'use strict';

/**
 * FakerDataFactory — deterministic, typed test-data generators.
 *
 * Wraps @faker-js/faker to provide a single, consistent source of random
 * (but seed-controllable) test data for every module that needs it:
 *
 *   FakerDataFactory.repoData()       – repository creation payload
 *   FakerDataFactory.issueData()      – issue / bug-report payload
 *   FakerDataFactory.pullRequestData()– PR title + description
 *   FakerDataFactory.gistData()       – gist filename + content + description
 *   FakerDataFactory.searchQuery()    – random but realistic search term
 *   FakerDataFactory.userData()       – generic user profile data
 *   FakerDataFactory.commentData()    – random comment body
 *   FakerDataFactory.setSeed(n)       – make all subsequent calls deterministic
 *
 * Seeding:
 *   Call FakerDataFactory.setSeed(<number>) once (e.g. in globalSetup) to make
 *   every generated value reproducible across CI runs.
 *
 * Author: Arsath
 */

const { faker } = require('@faker-js/faker');

// ─── Visibility options mirroring GitHub's repo visibility dropdown ───────────
const VISIBILITIES = ['public', 'private'];

// ─── Realistic programming languages for repo descriptions ───────────────────
const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Java', 'Rust'];

// ─── Issue label pool ─────────────────────────────────────────────────────────
const ISSUE_LABELS = ['bug', 'enhancement', 'documentation', 'question', 'good first issue'];

const FakerDataFactory = {

  /**
   * Set the global faker seed so that all generated data is reproducible.
   * Call once in your globalSetup.js for deterministic CI runs.
   *
   * @param {number} seed
   */
  setSeed(seed) {
    faker.seed(seed);
  },

  // ───────────────────────────────────────────────────────────────────────────
  //  Repository
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Generate a random GitHub repository creation payload.
   *
   * @returns {{
   *   name: string,
   *   description: string,
   *   visibility: 'public'|'private',
   *   language: string,
   *   topics: string[]
   * }}
   */
  repoData() {
    const adjective = faker.word.adjective();
    const noun      = faker.word.noun();
    return {
      name:        `${adjective}-${noun}-${faker.number.int({ min: 100, max: 999 })}`.toLowerCase().replace(/\s+/g, '-'),
      description: faker.lorem.sentence({ min: 6, max: 12 }),
      visibility:  faker.helpers.arrayElement(VISIBILITIES),
      language:    faker.helpers.arrayElement(LANGUAGES),
      topics:      faker.helpers.arrayElements(
        ['automation', 'testing', 'playwright', 'ci-cd', 'nodejs', 'open-source'],
        { min: 1, max: 3 }
      ),
    };
  },

  // ───────────────────────────────────────────────────────────────────────────
  //  Issue
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Generate a random GitHub issue payload.
   *
   * @returns {{
   *   title: string,
   *   body: string,
   *   label: string
   * }}
   */
  issueData() {
    return {
      title: `[${faker.helpers.arrayElement(ISSUE_LABELS).toUpperCase()}] ${faker.lorem.sentence({ min: 5, max: 10 })}`,
      body:  [
        '## Description',
        faker.lorem.paragraph(2),
        '## Steps to Reproduce',
        faker.lorem.lines(3),
        '## Expected Behaviour',
        faker.lorem.sentence(),
      ].join('\n\n'),
      label: faker.helpers.arrayElement(ISSUE_LABELS),
    };
  },

  // ───────────────────────────────────────────────────────────────────────────
  //  Pull Request
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Generate a random pull request payload.
   *
   * @returns {{
   *   title: string,
   *   body: string,
   *   branch: string
   * }}
   */
  pullRequestData() {
    const verb   = faker.word.verb();
    const noun   = faker.word.noun();
    return {
      title:  `feat: ${verb} ${noun}`.toLowerCase(),
      body:   [
        '## Summary',
        faker.lorem.paragraph(),
        '## Changes',
        faker.lorem.lines(4),
        '## Testing',
        faker.lorem.sentence(),
      ].join('\n\n'),
      branch: `feature/${verb}-${noun}-${faker.number.int({ min: 10, max: 99 })}`.toLowerCase().replace(/\s+/g, '-'),
    };
  },

  // ───────────────────────────────────────────────────────────────────────────
  //  Gist
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Generate a random GitHub Gist payload.
   *
   * @returns {{
   *   filename: string,
   *   content: string,
   *   description: string,
   *   isPublic: boolean
   * }}
   */
  gistData() {
    const ext = faker.helpers.arrayElement(['js', 'py', 'ts', 'sh', 'md']);
    return {
      filename:    `${faker.word.noun().replace(/\s+/g, '_')}_${faker.number.int({ min: 10, max: 99 })}.${ext}`,
      content:     `// Auto-generated gist — ${faker.date.recent().toISOString()}\n\n${faker.lorem.paragraphs(2)}`,
      description: faker.lorem.sentence({ min: 4, max: 8 }),
      isPublic:    faker.datatype.boolean(),
    };
  },

  // ───────────────────────────────────────────────────────────────────────────
  //  Search
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Generate a realistic GitHub search query string.
   *
   * @returns {string}
   */
  searchQuery() {
    return faker.helpers.arrayElement([
      `${faker.word.adjective()} ${faker.word.noun()} playwright`,
      `${faker.word.noun()} automation nodejs`,
      `${faker.word.adjective()} ${faker.word.noun()} testing`,
      `playwright ${faker.word.noun()}`,
      `github-actions ${faker.word.noun()}`,
    ]);
  },

  // ───────────────────────────────────────────────────────────────────────────
  //  User / Profile
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Generate a generic user profile payload (useful for profile-update tests).
   *
   * @returns {{
   *   name: string,
   *   bio: string,
   *   company: string,
   *   location: string,
   *   website: string
   * }}
   */
  userData() {
    return {
      name:     faker.person.fullName(),
      bio:      faker.person.jobTitle() + ' · ' + faker.lorem.sentence({ min: 4, max: 8 }),
      company:  faker.company.name(),
      location: `${faker.location.city()}, ${faker.location.country()}`,
      website:  `https://${faker.internet.domainName()}`,
    };
  },

  // ───────────────────────────────────────────────────────────────────────────
  //  Comment
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Generate a random comment body for issues or pull requests.
   *
   * @returns {string}
   */
  commentData() {
    return faker.lorem.paragraph(faker.number.int({ min: 1, max: 3 }));
  },
};

module.exports = { FakerDataFactory };
