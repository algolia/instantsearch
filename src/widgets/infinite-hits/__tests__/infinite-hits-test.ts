import { render as preactRender } from 'preact';
import algoliasearchHelper from 'algoliasearch-helper';
import { Client } from 'algoliasearch';
import infiniteHits from '../infinite-hits';
import { castToJestMock } from '../../../../test/utils/castToJestMock';

const render = castToJestMock(preactRender);

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      // @ts-ignore: test infiniteHits with invalid parameters
      infiniteHits({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/infinite-hits/js/"
`);
  });
});

describe('infiniteHits()', () => {
  let container;
  let widget;
  let results;
  let helper;

  beforeEach(() => {
    render.mockClear();

    helper = algoliasearchHelper({} as Client, '', {});
    helper.search = jest.fn();

    container = document.createElement('div');
    widget = infiniteHits({
      container,
      escapeHTML: true,
      transformItems: items => items,
      cssClasses: { root: ['root', 'cx'] },
      showPrevious: false,
    });
    widget.init({ helper, instantSearchInstance: {} });
    results = {
      hits: [{ first: 'hit', second: 'hit' }],
      hitsPerPage: 2,
      page: 1,
    };
  });

  it('calls twice render(<Hits props />, container)', () => {
    const state = { page: 0 };

    widget.render({ results, state });
    widget.render({ results, state });

    const [firstRender, secondRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(2);
    expect(firstRender[0].props).toMatchSnapshot();
    expect(firstRender[1]).toEqual(container);
    expect(secondRender[0].props).toMatchSnapshot();
    expect(secondRender[1]).toEqual(container);
  });

  it('renders transformed items', () => {
    const state = { page: 0 };

    widget = infiniteHits({
      container,
      escapeHTML: true,
      transformItems: items =>
        items.map(item => ({ ...item, transformed: true })),
      showPrevious: false,
    });

    widget.init({ helper, instantSearchInstance: {} });

    widget.render({
      results,
      state,
      instantSearchInstance: {},
    });

    const [firstRender] = render.mock.calls;

    expect(firstRender[0].props).toMatchSnapshot();
  });

  it('if it is the last page, then the props should contain isLastPage true', () => {
    const state = { page: 0 };
    widget.render({
      results: { ...results, page: 0, nbPages: 2 },
      state,
    });
    widget.render({
      results: { ...results, page: 1, nbPages: 2 },
      state,
    });

    const [firstRender, secondRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(2);
    expect(firstRender[0].props).toMatchSnapshot();
    expect(firstRender[1]).toEqual(container);
    expect(secondRender[0].props).toMatchSnapshot();
    expect(secondRender[1]).toEqual(container);
  });

  it('updates the search state properly when showMore is called', () => {
    expect(helper.state.page).toBeUndefined();

    const state = { page: 0 };

    widget.render({ results, state });

    const [firstRender] = render.mock.calls;

    const { showMore } = firstRender[0].props;

    showMore();

    expect(helper.state.page).toBe(1);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('should add __position key with absolute position', () => {
    results = { ...results, page: 4, hitsPerPage: 10 };
    const state = { page: results.page };

    widget.render({ results, state });

    expect(results.hits[0].__position).toEqual(41);
  });

  it('if it is the first page, then the props should contain isFirstPage true', () => {
    const state = { page: 0 };

    widget.render({
      results: { ...results, page: 0, nbPages: 2 },
      state,
    });
    widget.render({
      results: { ...results, page: 1, nbPages: 2 },
      state,
    });

    expect(render).toHaveBeenCalledTimes(2);

    const [firstRender, secondRender] = render.mock.calls;

    expect(firstRender[0].props.isFirstPage).toEqual(true);
    expect(firstRender[1]).toEqual(container);

    expect(secondRender[0].props.isFirstPage).toEqual(true);
    expect(secondRender[1]).toEqual(container);
  });

  it('if it is not the first page, then the props should contain isFirstPage false', () => {
    helper.setPage(1);
    widget.init({ helper, instantSearchInstance: {} });

    const state = { page: 1 };
    widget.render({
      results: { ...results, page: 1, nbPages: 2 },
      state,
    });

    const [firstRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(1);
    expect(firstRender[0].props.isFirstPage).toEqual(false);
    expect(firstRender[1]).toEqual(container);
  });
});
