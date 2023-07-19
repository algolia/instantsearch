'use strict';

var formatSort = require('../../../src/functions/formatSort');

it('splits into attribute & direction', function () {
  expect(formatSort(['isRefined:desc', 'isNotRefined:desc'])).toEqual([
    ['isRefined', 'isNotRefined'],
    ['desc', 'desc'],
  ]);
});

it('leaves direction empty if no direction was given', function () {
  expect(formatSort(['isRefined:desc', 'isNotRefined'])).toEqual([
    ['isRefined', 'isNotRefined'],
    ['desc', undefined],
  ]);
});

it('takes from defaults if no direction was given', function () {
  expect(
    formatSort(
      ['isRefined:desc', 'isNotRefined'],
      ['books:asc', 'isRefined:desc', 'isNotRefined:asc']
    )
  ).toEqual([
    ['isRefined', 'isNotRefined'],
    ['desc', 'asc'],
  ]);
});

it('leaves direction empty if no direction was given & no default matches', function () {
  expect(
    formatSort(
      ['isRefined:desc', 'isNotRefined'],
      ['books:asc', 'isRefined:desc']
    )
  ).toEqual([
    ['isRefined', 'isNotRefined'],
    ['desc', undefined],
  ]);
});
