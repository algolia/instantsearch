const path = require('path');
const utils = require('../../utils');
const getConfiguration = require('../getConfiguration');

jest.mock('../../utils', () => ({
  ...require.requireActual('../../utils'),
  fetchLibraryVersions: jest.fn(() => Promise.resolve(['1.0.0'])),
}));

test('without template throws', async () => {
  expect.assertions(1);

  try {
    await getConfiguration({});
  } catch (err) {
    expect(err.message).toBe('The template is required in the config.');
  }
});

test('with template transforms to its relative path', async () => {
  const configuration = await getConfiguration({
    answers: { template: 'InstantSearch.js' },
  });

  expect(configuration).toEqual(
    expect.objectContaining({
      template: path.resolve('src/templates/InstantSearch.js'),
    })
  );
});

test('with options from arguments and prompt merge', async () => {
  const configuration = await getConfiguration({
    options: {
      name: 'my-app',
    },
    answers: {
      template: 'InstantSearch.js',
      libraryVersion: '1.0.0',
    },
  });

  expect(configuration).toEqual(
    expect.objectContaining({
      name: 'my-app',
      libraryVersion: '1.0.0',
    })
  );
});

test('without stable version available', async () => {
  utils.fetchLibraryVersions.mockImplementationOnce(() =>
    Promise.resolve(['1.0.0-beta.0'])
  );

  const configuration = await getConfiguration({
    answers: {
      template: 'InstantSearch.js',
    },
  });

  expect(configuration.libraryVersion).toBe('1.0.0-beta.0');
});

test('with config file overrides all options', async () => {
  const loadJsonFileFn = jest.fn(x => Promise.resolve(x));
  const ignoredOptions = {
    libraryVersion: '2.0.0',
  };
  const options = {
    config: {
      template: 'InstantSearch.js',
      libraryVersion: '1.0.0',
    },
    ...ignoredOptions,
  };
  const answers = {
    ignoredKey: 'ignoredValue',
  };

  const configuration = await getConfiguration({
    options,
    answers,
    loadJsonFileFn,
  });

  expect(configuration).toEqual(expect.not.objectContaining(ignoredOptions));
  expect(configuration).toEqual(expect.not.objectContaining(answers));
});
