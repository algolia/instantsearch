const utils = require('../../utils');
const postProcessAnswers = require('../postProcessAnswers');

jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  fetchLibraryVersions: jest.fn(() => Promise.resolve(['1.0.0'])),
}));

test('merges configuration and answers', async () => {
  expect(
    await postProcessAnswers({
      configuration: { attributesForFaceting: ['test'], b: 1 },
      answers: { attributesForFaceting: [] },
      templateConfig: {},
      optionsFromArguments: {},
    })
  ).toEqual(expect.objectContaining({ attributesForFaceting: [], b: 1 }));
});

describe('libraryVersion', () => {
  test('library version from answers is used', async () => {
    const { libraryVersion } = await postProcessAnswers({
      configuration: {},
      answers: {
        template: 'InstantSearch.js',
        attributesForFaceting: [],
        libraryVersion: '0.1.2',
      },
      optionsFromArguments: {},
      templateConfig: utils.getAppTemplateConfig(
        utils.getTemplatePath('InstantSearch.js')
      ),
    });

    expect(libraryVersion).toBe('0.1.2');
  });

  test('library version falls back to beta if it is the only available', async () => {
    utils.fetchLibraryVersions.mockImplementationOnce(() =>
      Promise.resolve(['1.0.0-beta.0'])
    );

    const { libraryVersion } = await postProcessAnswers({
      configuration: {},
      answers: {
        template: 'InstantSearch.js',
        attributesForFaceting: [],
      },
      optionsFromArguments: {},
      templateConfig: utils.getAppTemplateConfig(
        utils.getTemplatePath('InstantSearch.js')
      ),
    });

    expect(libraryVersion).toBe('1.0.0-beta.0');
  });
});

test('creates alternative names', async () => {
  expect(
    await postProcessAnswers({
      configuration: {},
      answers: {
        attributesForFaceting: [],
        organization: 'algolia',
        name: 'date-range',
      },
      templateConfig: {
        packageNamePrefix: 'instantsearch-widget-',
      },
      optionsFromArguments: {},
    })
  ).toEqual(
    expect.objectContaining({
      packageName: '@algolia/instantsearch-widget-date-range',
      widgetType: 'algolia.date-range',
      camelCaseName: 'dateRange',
      pascalCaseName: 'DateRange',
    })
  );
});

describe('flags', () => {
  describe('dynamicWidgets', () => {
    test('with usage of dynamicWidgets in attributesForFaceting', async () => {
      expect(
        await postProcessAnswers({
          configuration: {},
          templateConfig: {},
          optionsFromArguments: {},
          answers: { attributesForFaceting: ['ais.dynamicWidgets', 'test'] },
        })
      ).toEqual(
        expect.objectContaining({
          attributesForFaceting: ['test'],
          flags: expect.objectContaining({ dynamicWidgets: true }),
        })
      );
    });

    test('without usage of dynamicWidgets in attributesForFaceting', async () => {
      expect(
        await postProcessAnswers({
          configuration: {},
          templateConfig: {},
          optionsFromArguments: {},
          answers: { attributesForFaceting: ['test'] },
        })
      ).toEqual(
        expect.objectContaining({
          attributesForFaceting: ['test'],
          flags: expect.objectContaining({ dynamicWidgets: false }),
        })
      );
    });

    test('without attributes', async () => {
      expect(
        await postProcessAnswers({
          configuration: {},
          templateConfig: {},
          optionsFromArguments: {},
          answers: {},
        })
      ).toEqual(
        expect.objectContaining({
          flags: expect.objectContaining({ dynamicWidgets: false }),
        })
      );
    });
  });

  describe('insights', () => {
    test('with a valid version', async () => {
      utils.fetchLibraryVersions.mockImplementationOnce(() =>
        Promise.resolve(['1.2.0'])
      );

      expect(
        (
          await postProcessAnswers({
            configuration: {},
            templateConfig: {
              libraryName: 'instantsearch.js',
              flags: {
                insights: '>= 1',
              },
            },
            optionsFromArguments: {},
          })
        ).flags
      ).toEqual(expect.objectContaining({ insights: true }));
    });

    test('with an invalid version', async () => {
      utils.fetchLibraryVersions.mockImplementationOnce(() =>
        Promise.resolve(['1.2.0'])
      );

      expect(
        (
          await postProcessAnswers({
            configuration: {},
            templateConfig: {
              libraryName: 'instantsearch.js',
              flags: {
                insights: '>= 1.3',
              },
            },
            optionsFromArguments: {},
          })
        ).flags
      ).toEqual(expect.objectContaining({ insights: false }));
    });

    test('without config', async () => {
      expect(
        (
          await postProcessAnswers({
            configuration: {},
            templateConfig: {},
            optionsFromArguments: {},
          })
        ).flags
      ).toEqual(expect.objectContaining({ insights: false }));
    });
  });

  describe('autocomplete', () => {
    test('with usage of autocomplete in searchInputType', async () => {
      expect(
        await postProcessAnswers({
          configuration: {},
          templateConfig: {
            libraryName: 'instantsearch.js',
            flags: {
              autocomplete: '>= 4.52',
            },
          },
          optionsFromArguments: {},
          answers: { searchInputType: 'autocomplete' },
        })
      ).toEqual(
        expect.objectContaining({
          searchInputType: 'autocomplete',
          flags: expect.objectContaining({ autocomplete: true }),
        })
      );
    });

    test('without usage of autocomplete in searchInputType', async () => {
      expect(
        await postProcessAnswers({
          configuration: {},
          templateConfig: {
            libraryName: 'instantsearch.js',
            flags: {
              autocomplete: '>= 4.52',
            },
          },
          optionsFromArguments: {},
          answers: { searchInputType: 'searchbox' },
        })
      ).toEqual(
        expect.objectContaining({
          searchInputType: 'searchbox',
          flags: expect.objectContaining({ autocomplete: false }),
        })
      );
    });

    test('with a valid version', async () => {
      utils.fetchLibraryVersions.mockImplementationOnce(() =>
        Promise.resolve(['4.52.0'])
      );

      expect(
        (
          await postProcessAnswers({
            configuration: {},
            templateConfig: {
              libraryName: 'instantsearch.js',
              flags: {
                autocomplete: '>= 4.52',
              },
            },
            optionsFromArguments: {},
          })
        ).flags
      ).toEqual(expect.objectContaining({ autocomplete: true }));
    });

    test('with an invalid version', async () => {
      utils.fetchLibraryVersions.mockImplementationOnce(() =>
        Promise.resolve(['4.0.0'])
      );

      expect(
        (
          await postProcessAnswers({
            configuration: {},
            templateConfig: {
              libraryName: 'instantsearch.js',
              flags: {
                autocomplete: '>= 4.52',
              },
            },
            optionsFromArguments: {},
          })
        ).flags
      ).toEqual(expect.objectContaining({ autocomplete: false }));
    });

    test('without config', async () => {
      expect(
        (
          await postProcessAnswers({
            configuration: {},
            templateConfig: {},
            optionsFromArguments: {},
          })
        ).flags
      ).toEqual(expect.objectContaining({ autocomplete: false }));
    });
  });
});
