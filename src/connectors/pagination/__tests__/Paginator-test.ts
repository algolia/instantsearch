import Paginator from '../Paginator';

describe('paginator: simple cases', () => {
  describe('on the first page', () => {
    const pager = new Paginator({
      currentPage: 0,
      total: 10,
      padding: 2,
    });

    it('should return the pages', () => {
      const pages = pager.pages();
      expect(pages).toHaveLength(5);
      expect(pages).toEqual([0, 1, 2, 3, 4]);
    });

    it('should be the first page', () => {
      expect(pager.isFirstPage()).toBe(true);
    });

    it('should not be the last page', () => {
      expect(pager.isLastPage()).toBe(false);
    });
  });

  describe('on 3rd page', () => {
    const pager = new Paginator({
      currentPage: 2,
      total: 10,
      padding: 2,
    });

    it('should return the pages', () => {
      const pages = pager.pages();
      expect(pages).toHaveLength(5);
      expect(pages).toEqual([0, 1, 2, 3, 4]);
    });

    it('should not be the first page', () => {
      expect(pager.isFirstPage()).toBe(false);
    });

    it('should not be the last page', () => {
      expect(pager.isLastPage()).toBe(false);
    });
  });

  describe('on 5th page', () => {
    const pager = new Paginator({
      currentPage: 5,
      total: 10,
      padding: 2,
    });

    it('should return the pages', () => {
      const pages = pager.pages();
      expect(pages).toHaveLength(5);
      expect(pages).toEqual([3, 4, 5, 6, 7]);
    });

    it('should not be the first page', () => {
      expect(pager.isFirstPage()).toBe(false);
    });

    it('should not be the last page', () => {
      expect(pager.isLastPage()).toBe(false);
    });
  });

  describe('on the page before the last', () => {
    const pager = new Paginator({
      currentPage: 8,
      total: 10,
      padding: 2,
    });

    it('should return the pages', () => {
      const pages = pager.pages();
      expect(pages).toHaveLength(5);
      expect(pages).toEqual([5, 6, 7, 8, 9]);
    });

    it('should not be the first page', () => {
      expect(pager.isFirstPage()).toBe(false);
    });

    it('should not be the last page', () => {
      expect(pager.isLastPage()).toBe(false);
    });
  });

  describe('on last page', () => {
    const pager = new Paginator({
      currentPage: 9,
      total: 10,
      padding: 2,
    });

    it('should return the pages', () => {
      const pages = pager.pages();
      expect(pages).toHaveLength(5);
      expect(pages).toEqual([5, 6, 7, 8, 9]);
    });

    it('should not be the first page', () => {
      expect(pager.isFirstPage()).toBe(false);
    });

    it('should not be the last page', () => {
      expect(pager.isLastPage()).toBe(true);
    });
  });
});

describe('paginator: number of pages is less than 2*padding+1', () => {
  const pager = new Paginator({
    currentPage: 0,
    total: 1,
    padding: 2,
  });

  it('should return the pages', () => {
    const pages = pager.pages();
    expect(pages).toHaveLength(1);
    expect(pages).toEqual([0]);
  });

  it('should be the first page', () => {
    expect(pager.isFirstPage()).toBe(true);
  });

  it('should not be the last page', () => {
    expect(pager.isLastPage()).toBe(true);
  });
});

describe('paginator: bug #668', () => {
  const pager = new Paginator({
    currentPage: 4,
    total: 6,
    padding: 3,
  });

  it('should return the pages', () => {
    const pages = pager.pages();
    expect(pages).toHaveLength(6);
    expect(pages).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('should be the first page', () => {
    expect(pager.isFirstPage()).toBe(false);
  });

  it('should not be the last page', () => {
    expect(pager.isLastPage()).toBe(false);
  });
});

describe('paginator: no results', () => {
  const pager = new Paginator({
    currentPage: 0,
    total: 0,
    padding: 3,
  });

  it('isFirstPage: true', () => {
    expect(pager.isFirstPage()).toBe(true);
  });

  it('isLastPage: true', () => {
    expect(pager.isLastPage()).toBe(true);
  });

  it('pages: just current page', () => {
    expect(pager.pages()).toEqual([0]);
  });
});
