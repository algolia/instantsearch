'use strict';

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _Paginator = require('../Paginator');

var _Paginator2 = _interopRequireDefault(_Paginator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

describe('paginator: simple cases', function () {
  context('on the first page', function () {
    var pager = new _Paginator2.default({
      currentPage: 0,
      total: 10,
      padding: 2
    });

    it('should return the pages', function () {
      var pages = pager.pages();
      (0, _expect2.default)(pages.length).toBe(5);
      (0, _expect2.default)(pages).toEqual([0, 1, 2, 3, 4]);
    });

    it('should be the first page', function () {
      (0, _expect2.default)(pager.isFirstPage()).toBe(true);
    });

    it('should not be the last page', function () {
      (0, _expect2.default)(pager.isLastPage()).toBe(false);
    });
  });

  context('on 3rd page', function () {
    var pager = new _Paginator2.default({
      currentPage: 2,
      total: 10,
      padding: 2
    });

    it('should return the pages', function () {
      var pages = pager.pages();
      (0, _expect2.default)(pages.length).toBe(5);
      (0, _expect2.default)(pages).toEqual([0, 1, 2, 3, 4]);
    });

    it('should not be the first page', function () {
      (0, _expect2.default)(pager.isFirstPage()).toBe(false);
    });

    it('should not be the last page', function () {
      (0, _expect2.default)(pager.isLastPage()).toBe(false);
    });
  });

  context('on 5th page', function () {
    var pager = new _Paginator2.default({
      currentPage: 5,
      total: 10,
      padding: 2
    });

    it('should return the pages', function () {
      var pages = pager.pages();
      (0, _expect2.default)(pages.length).toBe(5);
      (0, _expect2.default)(pages).toEqual([3, 4, 5, 6, 7]);
    });

    it('should not be the first page', function () {
      (0, _expect2.default)(pager.isFirstPage()).toBe(false);
    });

    it('should not be the last page', function () {
      (0, _expect2.default)(pager.isLastPage()).toBe(false);
    });
  });

  context('on the page before the last', function () {
    var pager = new _Paginator2.default({
      currentPage: 8,
      total: 10,
      padding: 2
    });

    it('should return the pages', function () {
      var pages = pager.pages();
      (0, _expect2.default)(pages.length).toBe(5);
      (0, _expect2.default)(pages).toEqual([5, 6, 7, 8, 9]);
    });

    it('should not be the first page', function () {
      (0, _expect2.default)(pager.isFirstPage()).toBe(false);
    });

    it('should not be the last page', function () {
      (0, _expect2.default)(pager.isLastPage()).toBe(false);
    });
  });

  context('on last page', function () {
    var pager = new _Paginator2.default({
      currentPage: 9,
      total: 10,
      padding: 2
    });

    it('should return the pages', function () {
      var pages = pager.pages();
      (0, _expect2.default)(pages.length).toBe(5);
      (0, _expect2.default)(pages).toEqual([5, 6, 7, 8, 9]);
    });

    it('should not be the first page', function () {
      (0, _expect2.default)(pager.isFirstPage()).toBe(false);
    });

    it('should not be the last page', function () {
      (0, _expect2.default)(pager.isLastPage()).toBe(true);
    });
  });
});

describe('paginator: number of pages is less than 2*padding+1', function () {
  var pager = new _Paginator2.default({
    currentPage: 0,
    total: 1,
    padding: 2
  });

  it('should return the pages', function () {
    var pages = pager.pages();
    (0, _expect2.default)(pages.length).toBe(1);
    (0, _expect2.default)(pages).toEqual([0]);
  });

  it('should be the first page', function () {
    (0, _expect2.default)(pager.isFirstPage()).toBe(true);
  });

  it('should not be the last page', function () {
    (0, _expect2.default)(pager.isLastPage()).toBe(true);
  });
});

describe('paginator: bug #668', function () {
  var pager = new _Paginator2.default({
    currentPage: 4,
    total: 6,
    padding: 3
  });

  it('should return the pages', function () {
    var pages = pager.pages();
    (0, _expect2.default)(pages.length).toBe(6);
    (0, _expect2.default)(pages).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('should be the first page', function () {
    (0, _expect2.default)(pager.isFirstPage()).toBe(false);
  });

  it('should not be the last page', function () {
    (0, _expect2.default)(pager.isLastPage()).toBe(false);
  });
});