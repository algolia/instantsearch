import stats from '../stats';

const instantSearchInstance = { templatesConfig: undefined };

describe('stats call', () => {
  it('should throw when called without container', () => {
    expect(() => stats()).toThrow(/^Usage:/);
  });
});

describe('stats()', () => {
  let ReactDOM;
  let container;
  let widget;
  let results;

  beforeEach(() => {
    ReactDOM = { render: jest.fn() };
    stats.__Rewire__('render', ReactDOM.render);

    container = document.createElement('div');
    widget = stats({ container, cssClasses: { text: ['text', 'cx'] } });
    results = {
      hits: [{}, {}],
      nbHits: 20,
      page: 0,
      nbPages: 10,
      hitsPerPage: 2,
      processingTimeMS: 42,
      query: 'a query',
    };

    widget.init({
      helper: { state: {} },
      instantSearchInstance,
    });
  });

  it('configures nothing', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('calls twice ReactDOM.render(<Stats props />, container)', () => {
    widget.render({ results, instantSearchInstance });
    widget.render({ results, instantSearchInstance });
    expect(ReactDOM.render).toHaveBeenCalledTimes(2);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[0][1]).toEqual(container);
    expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[1][1]).toEqual(container);
  });

  afterEach(() => {
    stats.__ResetDependency__('render');
  });
});
