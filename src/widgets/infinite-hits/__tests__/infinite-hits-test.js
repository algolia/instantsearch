import { render } from 'preact-compat';
import algoliasearchHelper from 'algoliasearch-helper';
import { TAG_PLACEHOLDER } from '../../../lib/escape-highlight';
import infiniteHits from '../infinite-hits';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();

  return module;
});

describe('infiniteHits call', () => {
  it('throws an exception when no container', () => {
    expect(infiniteHits).toThrow();
  });
});

describe('infiniteHits()', () => {
  let container;
  let widget;
  let results;
  let helper;

  beforeEach(() => {
    render.mockClear();

    helper = algoliasearchHelper({});
    helper.search = jest.fn();

    container = document.createElement('div');
    widget = infiniteHits({
      container,
      escapeHTML: true,
      cssClasses: { root: ['root', 'cx'] },
    });
    widget.init({ helper, instantSearchInstance: {} });
    results = { hits: [{ first: 'hit', second: 'hit' }] };
  });

  it('It does have a specific configuration', () => {
    expect(widget.getConfiguration()).toEqual({
      highlightPreTag: TAG_PLACEHOLDER.highlightPreTag,
      highlightPostTag: TAG_PLACEHOLDER.highlightPostTag,
    });
  });

  it('calls twice render(<Hits props />, container)', () => {
    const state = { page: 0 };
    widget.render({ results, state });
    widget.render({ results, state });

    expect(render).toHaveBeenCalledTimes(2, 'render called twice');
    expect(render.mock.calls[0][0]).toMatchSnapshot();
    expect(render.mock.calls[0][1]).toEqual(container);
    expect(render.mock.calls[1][0]).toMatchSnapshot();
    expect(render.mock.calls[1][1]).toEqual(container);
  });

  it('renders transformed items', () => {
    const state = { page: 0 };

    widget = infiniteHits({
      container,
      transformItems: items =>
        items.map(item => ({ ...item, transformed: true })),
    });

    widget.init({ helper, instantSearchInstance: {} });

    widget.render({
      results,
      state,
      instantSearchInstance: {},
    });

    expect(render.mock.calls[0][0]).toMatchSnapshot();
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

    expect(render).toHaveBeenCalledTimes(2, 'render called twice');
    expect(render.mock.calls[0][0]).toMatchSnapshot();
    expect(render.mock.calls[0][1]).toEqual(container);
    expect(render.mock.calls[1][0]).toMatchSnapshot();
    expect(render.mock.calls[1][1]).toEqual(container);
  });

  it('does not accept allItems templates', () => {
    expect(() =>
      infiniteHits({ container, templates: { allItems: '' } })
    ).toThrow();

    expect(() =>
      infiniteHits({ container, templates: { allItems: 'not empty' } })
    ).toThrow();

    expect(() =>
      infiniteHits({ container, templates: { allItems: () => 'template' } })
    ).toThrow();
  });

  it('updates the search state properly when showMore is called', () => {
    expect(helper.state.page).toBe(0);

    widget.showMore();

    expect(helper.state.page).toBe(1);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });
});
