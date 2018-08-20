import expect from 'expect';
import sinon from 'sinon';
import hits from '../hits';
import defaultTemplates from '../defaultTemplates';

describe('hits call', () => {
  it('throws an exception when no container', () => {
    expect(hits).toThrow();
  });
});

describe('hits()', () => {
  let ReactDOM;
  let container;
  let templateProps;
  let widget;
  let results;

  beforeEach(() => {
    ReactDOM = { render: jest.fn() };
    hits.__Rewire__('render', ReactDOM.render);

    container = document.createElement('div');
    templateProps = {
      transformData: undefined,
      templatesConfig: undefined,
      templates: defaultTemplates,
      useCustomCompileOptions: { item: false, empty: false },
    };
    widget = hits({ container, cssClasses: { root: ['root', 'cx'] } });
    widget.init({ instantSearchInstance: { templateProps } });
    results = { hits: [{ first: 'hit', second: 'hit' }] };
  });

  it('calls twice ReactDOM.render(<Hits props />, container)', () => {
    widget.render({ results });
    widget.render({ results });

    expect(ReactDOM.render).toHaveBeenCalledTimes(2);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[0][1]).toEqual(container);
    expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[1][1]).toEqual(container);
  });

  it('renders transformed items', () => {
    widget = hits({
      container,
      transformItems: items =>
        items.map(item => ({ ...item, transformed: true })),
    });

    widget.init({ instantSearchInstance: {} });
    widget.render({ results });

    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  });

  it('does not accept both item and allItems templates', () => {
    expect(
      hits.bind({ container, templates: { item: '', allItems: '' } })
    ).toThrow();
  });

  afterEach(() => {
    hits.__ResetDependency__('render');
  });
});
