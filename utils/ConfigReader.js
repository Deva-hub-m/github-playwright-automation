// Owner: Arsath
// utils/ConfigReader.js

'use strict';

/**
 * ConfigReader — typed, centralised access to environment variables.
 *
 * Loads `.env` via dotenv on first require so every module that imports
 * ConfigReader can call it without calling `dotenv.config()` themselves.
 *
 * API:
 *   ConfigReader.get(key, defaultValue?)   → string  (raw env value)
 *   ConfigReader.getRequired(key)          → string  (throws if missing)
 *   ConfigReader.getBool(key, default?)    → boolean ('true'/'1'/'yes' → true)
 *   ConfigReader.getInt(key, default?)     → number  (parsed as integer)
 *   ConfigReader.getBaseUrl()             → string  (BASE_URL)
 *   ConfigReader.isHeadless()             → boolean (HEADLESS)
 *   ConfigReader.getTimeout()             → number  (TIMEOUT in ms)
 *   ConfigReader.getBrowser()             → string  (BROWSER)
 *   ConfigReader.getCredentials()         → { username, password }
 *
 * Author: Arsath
 */

require('dotenv').config();

const ConfigReader = {

  // ───────────────────────────────────────────────────────────────────────────
  //  Core accessors
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Return the value of an environment variable, or `defaultValue` if absent.
   *
   * @param {string} key
   * @param {string} [defaultValue='']
   * @returns {string}
   */
  get(key, defaultValue = '') {
    return process.env[key] || defaultValue;
  },

  /**
   * Return the value of an environment variable.
   * Throws if the variable is not set (or is an empty string).
   *
   * @param {string} key
   * @returns {string}
   */
  getRequired(key) {
    const value = process.env[key];
    if (value === undefined || value === '') {
      throw new Error(
        `ConfigReader: required environment variable "${key}" is not set. ` +
        `Copy .env.example to .env and fill in the missing value.`
      );
    }
    return value;
  },

  /**
   * Return a boolean environment variable.
   * Treats '1', 'true', 'yes' (case-insensitive) as `true`; everything else
   * (including absence) as `false`, unless `defaultValue` is provided.
   *
   * @param {string}  key
   * @param {boolean} [defaultValue=false]
   * @returns {boolean}
   */
  getBool(key, defaultValue = false) {
    const raw = process.env[key];
    if (raw === undefined || raw === '') return defaultValue;
    return ['1', 'true', 'yes'].includes(raw.toLowerCase());
  },

  /**
   * Return an integer environment variable.
   * Throws if the value cannot be parsed as a finite integer.
   *
   * @param {string} key
   * @param {number} [defaultValue]
   * @returns {number}
   */
  getInt(key, defaultValue) {
    const raw = process.env[key];
    if (raw === undefined || raw === '') {
      if (defaultValue !== undefined) return defaultValue;
      throw new Error(`ConfigReader: environment variable "${key}" is not set.`);
    }
    const parsed = parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
      throw new TypeError(`ConfigReader: "${key}" must be an integer, got "${raw}".`);
    }
    return parsed;
  },

  // ───────────────────────────────────────────────────────────────────────────
  //  Project-specific convenience getters
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Base URL for the application under test.
   * Defaults to 'https://github.com' to match playwright.config.js.
   *
   * @returns {string}
   */
  getBaseUrl() {
    return this.get('BASE_URL', 'https://github.com');
  },

  /**
   * Whether tests should run in headless mode.
   * Controlled by the HEADLESS environment variable (default: true).
   *
   * @returns {boolean}
   */
  isHeadless() {
    return this.getBool('HEADLESS', true);
  },

  /**
   * Global test timeout in milliseconds.
   * Controlled by the TIMEOUT environment variable (default: 30 000).
   *
   * @returns {number}
   */
  getTimeout() {
    return this.getInt('TIMEOUT', 30000);
  },

  /**
   * Target browser name (chromium | firefox | webkit).
   * Defaults to 'chromium'.
   *
   * @returns {string}
   */
  getBrowser() {
    return this.get('BROWSER', 'chromium');
  },

  /**
   * GitHub credentials loaded from environment variables.
   * Throws clearly if either variable is missing so CI failures are obvious.
   *
   * @returns {{ username: string, password: string }}
   */
  getCredentials() {
    return {
      username: this.getRequired('GITHUB_USERNAME'),
      password: this.getRequired('GITHUB_PASSWORD'),
    };
  },
};

module.exports = { ConfigReader };
