const isQuestionAsked = require('../isQuestionAsked');

test('with appId undefined should ask', () => {
  expect(
    isQuestionAsked({
      question: { name: 'appId', validate: input => Boolean(input) },
      args: { appId: undefined },
    })
  ).toBe(true);
});

test('with appId defined should not ask', () => {
  expect(
    isQuestionAsked({
      question: { name: 'appId', validate: input => Boolean(input) },
      args: { appId: 'APP_ID' },
    })
  ).toBe(false);
});

test('with unvalid template should ask', () => {
  expect(
    isQuestionAsked({
      question: {
        name: 'template',
        validate: () => false,
      },
      args: { template: 'Unvalid' },
    })
  ).toBe(true);
});

test('with valid template should not ask', () => {
  expect(
    isQuestionAsked({
      question: {
        name: 'template',
        validate: () => true,
      },
      args: { template: 'InstantSearch.js' },
    })
  ).toBe(false);
});

test('with indexName should ask mainAttribute', () => {
  expect(
    isQuestionAsked({
      question: {
        name: 'mainAttribute',
      },
      args: { indexName: 'INDEX_NAME' },
    })
  ).toBe(false);
});
