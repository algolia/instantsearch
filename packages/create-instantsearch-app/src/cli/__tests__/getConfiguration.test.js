const loadJsonFile = require('load-json-file');

const getConfiguration = require('../getConfiguration');

jest.mock('load-json-file');

test('without template throws', async () => {
  expect.assertions(1);

  await expect(getConfiguration({})).rejects.toThrow(
    new Error('The template is required in the config.')
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

test('with config file overrides all options', async () => {
  loadJsonFile.mockImplementationOnce((x) => Promise.resolve(x));
  const ignoredOptions = {
    libraryVersion: '3.0.0',
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
  });

  expect(configuration).toEqual(expect.not.objectContaining(ignoredOptions));
  expect(configuration).toEqual(expect.not.objectContaining(answers));
});
