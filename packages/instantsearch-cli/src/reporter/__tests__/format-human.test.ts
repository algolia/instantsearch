import { success, failure } from '../index';
import { formatHuman } from '../format-human';

describe('formatHuman', () => {
  test('failure renders a single error line', () => {
    const report = failure({
      command: 'init',
      code: 'missing_required_flag',
      message: 'Missing required flags: --app-id',
    });

    expect(formatHuman(report)).toBe('Error: Missing required flags: --app-id');
  });

  test('init shows files created', () => {
    const report = success({
      command: 'init',
      payload: {
        filesCreated: ['instantsearch.json', 'src/components/search/provider.tsx'],
        manifestUpdated: 'instantsearch.json',
      },
    });

    expect(formatHuman(report)).toBe(
      [
        'InstantSearch initialized.',
        '',
        'Files created:',
        '  instantsearch.json',
        '  src/components/search/provider.tsx',
      ].join('\n')
    );
  });

  test('add experience shows files and next steps', () => {
    const report = success({
      command: 'add experience',
      payload: {
        experience: { name: 'search', path: 'src/components/search' },
        filesCreated: [
          'src/components/search/provider.tsx',
          'src/components/search/SearchBox.tsx',
        ],
        manifestUpdated: 'instantsearch.json',
        nextSteps: {
          imports: [
            "import { SearchProvider } from 'src/components/search/provider';",
            "import { SearchBox } from 'src/components/search/SearchBox';",
          ],
          mountingGuidance:
            'Render <SearchProvider> around the widgets wherever the search should appear.',
        },
      },
    });

    expect(formatHuman(report)).toBe(
      [
        'Experience "search" created in src/components/search/',
        '',
        'Files created:',
        '  src/components/search/provider.tsx',
        '  src/components/search/SearchBox.tsx',
        '',
        'Next steps:',
        '',
        "  import { SearchProvider } from 'src/components/search/provider';",
        "  import { SearchBox } from 'src/components/search/SearchBox';",
        '',
        '  Render <SearchProvider> around the widgets wherever the search should appear.',
      ].join('\n')
    );
  });

  test('add widget shows files and next steps', () => {
    const report = success({
      command: 'add widget',
      payload: {
        experience: { name: 'search', path: 'src/components/search' },
        widget: 'SortBy',
        filesCreated: ['src/components/search/SortBy.tsx'],
        nextSteps: {
          imports: ["import { SortBy } from 'src/components/search/SortBy';"],
          mountingGuidance:
            'Render <SortBy /> inside <SearchProvider> wherever the search should appear.',
        },
      },
    });

    expect(formatHuman(report)).toBe(
      [
        'Widget "SortBy" added to experience "search".',
        '',
        'Files created:',
        '  src/components/search/SortBy.tsx',
        '',
        'Next steps:',
        '',
        "  import { SortBy } from 'src/components/search/SortBy';",
        '',
        '  Render <SortBy /> inside <SearchProvider> wherever the search should appear.',
      ].join('\n')
    );
  });

  test('unknown command falls back to pretty JSON', () => {
    const report = success({
      command: 'some-future-command',
      payload: { foo: 'bar' },
    });

    expect(formatHuman(report)).toBe(JSON.stringify(report, null, 2));
  });
});
