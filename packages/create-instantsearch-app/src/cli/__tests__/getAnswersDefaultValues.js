const getAnswersDefaultValues = require('../getAnswersDefaultValues');

test('without attributesToDisplay in configuration', () => {
  const { attributesToDisplay } = getAnswersDefaultValues({}, {}, undefined);
  expect(attributesToDisplay).toBeUndefined();
});

test('with attributesToDisplay in configuration', () => {
  const { attributesToDisplay } = getAnswersDefaultValues(
    {},
    { attributesToDisplay: ['name'] },
    undefined
  );
  expect(attributesToDisplay).toEqual(['name']);
});
