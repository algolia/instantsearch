import { describe, it, expect } from 'vitest';

import {
  parseChangelogContent,
  getLatestRelease,
  getReleasesBetween,
} from '../src/changelog/parser';
import {
  classifyChanges,
  getBreakingChanges,
  getNewFeatures,
} from '../src/changelog/classifier';

const SAMPLE_CHANGELOG = `# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.87.0](https://github.com/algolia/instantsearch/compare/instantsearch.js@4.86.1...instantsearch.js@4.87.0) (2024-01-15)


### Bug Fixes

* **autocomplete:** item ids are shifted when there are deduped items ([#6862](https://github.com/algolia/instantsearch/issues/6862)) ([2b24d3b](https://github.com/algolia/instantsearch/commit/2b24d3b))


### Features

* add \`FilterSuggestions\` widget ([#6861](https://github.com/algolia/instantsearch/issues/6861)) ([3ff224f](https://github.com/algolia/instantsearch/commit/3ff224f))
* **chat:** add default memory tools ([#6873](https://github.com/algolia/instantsearch/issues/6873)) ([36127f4](https://github.com/algolia/instantsearch/commit/36127f4))


## [4.86.1](https://github.com/algolia/instantsearch/compare/instantsearch.js@4.86.0...instantsearch.js@4.86.1) (2024-01-10)


### Bug Fixes

* **dependencies:** remove qs limitation ([#6850](https://github.com/algolia/instantsearch/issues/6850)) ([ca86687](https://github.com/algolia/instantsearch/commit/ca86687))


# [4.86.0](https://github.com/algolia/instantsearch/compare/instantsearch.js@4.85.0...instantsearch.js@4.86.0) (2024-01-05)


### BREAKING CHANGES

* **searchBox:** The \`submit\` option has been renamed to \`submitButton\`


### Features

* **sortBy:** support composition sorting strategies ([#6841](https://github.com/algolia/instantsearch/issues/6841)) ([f7d7a66](https://github.com/algolia/instantsearch/commit/f7d7a66))
`;

describe('parseChangelogContent', () => {
  it('should parse releases from changelog', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );

    expect(releases).toHaveLength(3);
    expect(releases[0].version).toBe('4.87.0');
    expect(releases[1].version).toBe('4.86.1');
    expect(releases[2].version).toBe('4.86.0');
  });

  it('should extract package name', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );

    expect(releases[0].packageName).toBe('instantsearch.js');
  });

  it('should extract compare URL', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );

    expect(releases[0].compareUrl).toBe(
      'https://github.com/algolia/instantsearch/compare/instantsearch.js@4.86.1...instantsearch.js@4.87.0'
    );
  });

  it('should extract date', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );

    expect(releases[0].date).toBe('2024-01-15');
  });

  it('should parse features', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );
    const features = releases[0].changes.filter((c) => c.type === 'feature');

    expect(features).toHaveLength(2);
    expect(features[0].description).toContain('FilterSuggestions');
    expect(features[1].scope).toBe('chat');
  });

  it('should parse bug fixes', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );
    const fixes = releases[0].changes.filter((c) => c.type === 'fix');

    expect(fixes).toHaveLength(1);
    expect(fixes[0].scope).toBe('autocomplete');
  });

  it('should parse PR numbers', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );
    const features = releases[0].changes.filter((c) => c.type === 'feature');

    expect(features[0].prNumber).toBe(6861);
  });

  it('should parse breaking changes', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );
    const breakingChanges = releases[2].changes.filter(
      (c) => c.type === 'breaking' || c.isBreaking
    );

    expect(breakingChanges.length).toBeGreaterThan(0);
  });
});

describe('getLatestRelease', () => {
  it('should return the first release', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );
    const latest = getLatestRelease(releases);

    expect(latest?.version).toBe('4.87.0');
  });

  it('should return undefined for empty array', () => {
    const latest = getLatestRelease([]);

    expect(latest).toBeUndefined();
  });
});

describe('getReleasesBetween', () => {
  it('should return releases between versions', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );
    const between = getReleasesBetween(releases, '4.86.0', '4.87.0');

    expect(between).toHaveLength(3);
  });

  it('should return empty array for invalid versions', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );
    const between = getReleasesBetween(releases, '1.0.0', '2.0.0');

    expect(between).toHaveLength(0);
  });
});

describe('classifyChanges', () => {
  it('should classify releases with features as medium/high priority', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );
    const needs = classifyChanges([releases[0]]);

    expect(needs).toHaveLength(1);
    expect(['high', 'medium']).toContain(needs[0].priority);
  });

  it('should suggest widget-docs for new widget features', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );
    const needs = classifyChanges([releases[0]]);

    expect(needs[0].suggestedContentTypes).toContain('release-notes');
  });

  it('should classify releases with breaking changes as high priority', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );
    const needs = classifyChanges([releases[2]]);

    // Release with breaking changes should be high priority
    expect(needs[0].priority).toBe('high');
    expect(needs[0].suggestedContentTypes).toContain('migration-guide');
  });
});

describe('getBreakingChanges', () => {
  it('should extract all breaking changes', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );
    const breaking = getBreakingChanges(releases);

    expect(breaking.length).toBeGreaterThan(0);
  });
});

describe('getNewFeatures', () => {
  it('should extract all features', () => {
    const releases = parseChangelogContent(
      SAMPLE_CHANGELOG,
      'instantsearch.js'
    );
    const features = getNewFeatures(releases);

    expect(features.length).toBeGreaterThanOrEqual(3);
  });
});
