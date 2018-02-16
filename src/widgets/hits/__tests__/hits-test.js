import expect from 'expect';
import sinon from 'sinon';
import hits from '../hits.js';
import defaultTemplates from '../defaultTemplates.js';

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
    ReactDOM = { render: sinon.spy() };
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

    expect(ReactDOM.render.callCount).toBe(2);
    expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toMatchSnapshot();
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
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
