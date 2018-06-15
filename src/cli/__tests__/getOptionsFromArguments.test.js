const getOptionsFromArguments = require('../getOptionsFromArguments');

test('with a single option', () => {
  expect(getOptionsFromArguments('cmd --appId APP_ID'.split(' '))).toEqual({
    appId: 'APP_ID',
  });
});

test('with multiple options', () => {
  expect(
    getOptionsFromArguments([
      'cmd',
      '--appId',
      'APP_ID',
      '--apiKey',
      'API_KEY',
      '--indexName',
      'INDEX_NAME',
      '--template',
      'Vue InstantSearch',
    ])
  ).toEqual({
    appId: 'APP_ID',
    apiKey: 'API_KEY',
    indexName: 'INDEX_NAME',
    template: 'Vue InstantSearch',
  });
});

test('with different commands', () => {
  expect(
    getOptionsFromArguments(['yarn', 'start', '--appId', 'APP_ID'])
  ).toEqual({
    appId: 'APP_ID',
  });

  expect(
    getOptionsFromArguments(['node', 'index', '--appId', 'APP_ID'])
  ).toEqual({
    appId: 'APP_ID',
  });

  expect(
    getOptionsFromArguments([
      'npm',
      'init',
      'instantsearch-app',
      '--appId',
      'APP_ID',
    ])
  ).toEqual({
    appId: 'APP_ID',
  });

  expect(
    getOptionsFromArguments([
      'yarn',
      'create',
      'instantsearch-app',
      '--appId',
      'APP_ID',
    ])
  ).toEqual({
    appId: 'APP_ID',
  });

  expect(
    getOptionsFromArguments(['create-instantsearch-app', '--appId', 'APP_ID'])
  ).toEqual({
    appId: 'APP_ID',
  });
});
