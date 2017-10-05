import sinon from 'sinon';

import menuSelect from '../menu-select';

describe('menuSelect', () => {
  it('throws an exception when no attributeName', () => {
    const container = document.createElement('div');
    expect(menuSelect.bind(null, { container })).toThrow(/^Usage/);
  });

  it('throws an exception when no container', () => {
    const attributeName = 'categories';
    expect(menuSelect.bind(null, { attributeName })).toThrow(/^Usage/);
  });

  it('render correctly', () => {
    const data = { data: [{ name: 'foo' }, { name: 'bar' }] };
    const results = { getFacetValues: sinon.spy(() => data) };
    const state = { toggleRefinement: sinon.spy() };
    const helper = {
      toggleRefinement: sinon.stub().returnsThis(),
      search: sinon.spy(),
      state,
    };
    const createURL = () => '#';
    const ReactDOM = { render: sinon.spy() };
    menuSelect.__Rewire__('ReactDOM', ReactDOM);
    const widget = menuSelect({
      container: document.createElement('div'),
      attributeName: 'test',
    });
    const instantSearchInstance = { templatesConfig: undefined };
    widget.init({ helper, createURL, instantSearchInstance });
    widget.render({ results, createURL, state });
    expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
    menuSelect.__ResetDependency__('ReactDOM');
  });
});
