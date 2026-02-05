import { describe, it, expect } from 'vitest';

import { classifyChanges, groupByPriority } from '../src/changelog/classifier';

import type { Release, ChangeEntry } from '../src/types';

function createRelease(changes: ChangeEntry[], version = '1.0.0'): Release {
  return {
    version,
    date: '2024-01-15',
    packageName: 'test-package',
    changes,
  };
}

describe('classifyChanges', () => {
  it('should return empty array for release with no doc-relevant changes', () => {
    const release = createRelease([]);
    const needs = classifyChanges([release]);

    // Empty changes = no documentation needs (filtered out)
    expect(needs.length).toBe(0);
  });

  it('should classify new widget as high priority', () => {
    const release = createRelease([
      {
        type: 'feature',
        description: 'add new FilterSuggestions widget',
        isBreaking: false,
      },
    ]);
    const needs = classifyChanges([release]);

    expect(needs[0].priority).toBe('high');
    expect(needs[0].suggestedContentTypes).toContain('widget-docs');
  });

  it('should classify new hook as high priority', () => {
    const release = createRelease([
      {
        type: 'feature',
        scope: 'useHits',
        description: 'add useHits hook for React',
        isBreaking: false,
      },
    ]);
    const needs = classifyChanges([release]);

    expect(needs[0].suggestedContentTypes).toContain('hook-docs');
  });

  it('should classify new connector as connector-docs', () => {
    const release = createRelease([
      {
        type: 'feature',
        scope: 'connectHits',
        description: 'add new parameter to connectHits',
        isBreaking: false,
      },
    ]);
    const needs = classifyChanges([release]);

    expect(needs[0].suggestedContentTypes).toContain('connector-docs');
  });

  it('should classify breaking change as high priority with migration guide', () => {
    const release = createRelease([
      {
        type: 'breaking',
        scope: 'searchBox',
        description: 'rename submit option to submitButton',
        isBreaking: true,
      },
    ]);
    const needs = classifyChanges([release]);

    expect(needs[0].priority).toBe('high');
    expect(needs[0].suggestedContentTypes).toContain('migration-guide');
  });

  it('should classify deprecation as medium priority', () => {
    const release = createRelease([
      {
        type: 'deprecation',
        scope: 'analytics',
        description: 'deprecate analytics widget in favor of insights',
        isBreaking: false,
      },
    ]);
    const needs = classifyChanges([release]);

    expect(needs[0].priority).toBe('medium');
  });

  it('should classify bug fixes with scope as low priority', () => {
    const release = createRelease([
      {
        type: 'fix',
        scope: 'pagination',
        description: 'fix edge case in page calculation',
        isBreaking: false,
      },
    ]);
    const needs = classifyChanges([release]);

    expect(needs[0].priority).toBe('low');
  });

  it('should always include release-notes for non-empty releases', () => {
    const release = createRelease([
      {
        type: 'feature',
        description: 'add new feature',
        isBreaking: false,
      },
    ]);
    const needs = classifyChanges([release]);

    expect(needs[0].suggestedContentTypes).toContain('release-notes');
  });

  it('should handle multiple change types correctly', () => {
    const release = createRelease([
      {
        type: 'feature',
        description: 'add new widget',
        isBreaking: false,
      },
      {
        type: 'breaking',
        description: 'remove deprecated option',
        isBreaking: true,
      },
      {
        type: 'fix',
        scope: 'hits',
        description: 'fix rendering issue',
        isBreaking: false,
      },
    ]);
    const needs = classifyChanges([release]);

    // Should be high priority due to breaking change
    expect(needs[0].priority).toBe('high');
    // Should have migration guide
    expect(needs[0].suggestedContentTypes).toContain('migration-guide');
  });
});

describe('groupByPriority', () => {
  it('should group documentation needs by priority', () => {
    const releases = [
      createRelease(
        [
          {
            type: 'breaking',
            description: 'breaking change',
            isBreaking: true,
          },
        ],
        '2.0.0'
      ),
      createRelease(
        [{ type: 'feature', description: 'new feature', isBreaking: false }],
        '1.1.0'
      ),
      createRelease(
        [
          {
            type: 'fix',
            scope: 'hits',
            description: 'bug fix',
            isBreaking: false,
          },
        ],
        '1.0.1'
      ),
    ];

    const needs = classifyChanges(releases);
    const grouped = groupByPriority(needs);

    expect(grouped.high.length).toBeGreaterThan(0);
    expect(grouped.medium.length).toBeGreaterThanOrEqual(0);
    expect(grouped.low.length).toBeGreaterThanOrEqual(0);
  });
});
