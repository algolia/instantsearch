const postProcessAnswers = require('../postProcessAnswers');
const utils = require('../../utils');

jest.mock('../../utils', () => ({
  ...require.requireActual('../../utils'),
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
