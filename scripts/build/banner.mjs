/**
 * Banner generation utilities for InstantSearch packages.
 */

const algolia = '© Algolia, Inc. and contributors; MIT License';
const link = 'https://github.com/algolia/instantsearch';

/**
 * Creates a license banner for bundle files.
 * @param {Object} options
 * @param {string} options.name - Package display name (e.g., "InstantSearch.js", "React InstantSearch")
 * @param {string} options.version - Package version
 * @returns {string} License banner comment
 */
export function createBanner({ name, version }) {
  const displayVersion =
    process.env.NODE_ENV === 'production'
      ? version
      : `UNRELEASED (${new Date().toUTCString()})`;

  return `/*! ${name} ${displayVersion} | ${algolia} | ${link} */`;
}
