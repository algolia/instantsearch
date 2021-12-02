const isQuestionAsked = require('../isQuestionAsked');

test('with appId undefined should ask', () => {
  expect(
    isQuestionAsked({
      question: { name: 'appId', validate: input => Boolean(input) },
      args: { appId: undefined, interactive: true },
    })
  ).toBe(false);
});

test('with appId defined should not ask', () => {
  expect(
    isQuestionAsked({
      question: { name: 'appId', validate: input => Boolean(input) },
      args: { appId: 'APP_ID', interactive: true },
    })
  ).toBe(true);
});

test('with invalid template should ask', () => {
  expect(
    isQuestionAsked({
      question: {
        name: 'template',
        validate: () => false,
      },
      args: { template: 'Unvalid', interactive: true },
    })
  ).toBe(false);
});

test('with valid template should not ask', () => {
  expect(
    isQuestionAsked({
      question: {
        name: 'template',
        validate: () => true,
      },
      args: { template: 'InstantSearch.js', interactive: true },
    })
  ).toBe(true);
});

test('with indexName should ask attributesToDisplay', () => {
  expect(
    isQuestionAsked({
      question: {
        name: 'attributesToDisplay',
      },
      args: { indexName: 'INDEX_NAME', interactive: true },
    })
  ).toBe(false);
});

test('with config it does not ask', () => {
  expect(
    isQuestionAsked({
      question: {
        name: 'attributesToDisplay',
      },
      args: { config: '' },
    })
  ).toBe(true);
});

test('with --no-interactive it does not ask', () => {
  expect(
    isQuestionAsked({
      question: {
        name: 'attributesToDisplay',
      },
      args: { interactive: false },
    })
  ).toBe(true);
});
