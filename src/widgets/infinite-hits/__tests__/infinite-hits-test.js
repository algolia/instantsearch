import algoliasearchHelper from 'algoliasearch-helper';
import infiniteHits from '../infinite-hits';

describe('infiniteHits call', () => {
  it('throws an exception when no container', () => {
    expect(infiniteHits).toThrow();
  });
});

describe('infiniteHits()', () => {
  let ReactDOM;
  let container;
  let widget;
  let results;
  let helper;

  beforeEach(() => {
    helper = algoliasearchHelper({});
    helper.search = jest.fn();

    ReactDOM = { render: jest.fn() };
    infiniteHits.__Rewire__('render', ReactDOM.render);

    container = document.createElement('div');
    widget = infiniteHits({
      container,
      escapeHits: true,
      cssClasses: { root: ['root', 'cx'] },
    });
    widget.init({ helper, instantSearchInstance: {} });
    results = { hits: [{ first: 'hit', second: 'hit' }] };
  });

  it('It does have a specific configuration', () => {
    expect(widget.getConfiguration()).toEqual({
      highlightPostTag: '__/ais-highlight__',
      highlightPreTag: '__ais-highlight__',
    });
  });

  it('calls twice ReactDOM.render(<Hits props />, container)', () => {
    const state = { page: 0 };
    widget.render({ results, state });
    widget.render({ results, state });

    expect(ReactDOM.render).toHaveBeenCalledTimes(
      2,
      'ReactDOM.render called twice'
    );
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[0][1]).toEqual(container);
    expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[1][1]).toEqual(container);
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

    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
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

    expect(ReactDOM.render).toHaveBeenCalledTimes(
      2,
      'ReactDOM.render called twice'
    );
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[0][1]).toEqual(container);
    expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[1][1]).toEqual(container);
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

  afterEach(() => {
    infiniteHits.__ResetDependency__('render');
    infiniteHits.__ResetDependency__('defaultTemplates');
  });
});
