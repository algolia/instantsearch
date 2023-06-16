'use strict';

const SearchParameters = require('../../../src/SearchParameters');

test('without a previous page it should return the given SearchParameters', () => {
  const parameters = new SearchParameters();
  const parametersWithPageReseted = parameters.resetPage();

  expect(parameters).toBe(parametersWithPageReseted);
  expect(parametersWithPageReseted.page).toBeUndefined();
});

test('with a previous page of 0 it should return the given SearchParameters', () => {
  const parameters = new SearchParameters({
    page: 0,
  });

  const parametersWithPageReseted = parameters.resetPage();

  expect(parameters).toBe(parametersWithPageReseted);
  expect(parametersWithPageReseted.page).toBe(0);
});

test('with a previous page it should set the page to 0', () => {
  const parameters = new SearchParameters({
    page: 5,
  });

  const parametersWithPageReseted = parameters.resetPage();

  expect(parameters).not.toBe(parametersWithPageReseted);
  expect(parametersWithPageReseted.page).toBe(0);
});
