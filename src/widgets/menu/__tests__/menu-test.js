import menu from '../menu';

import sinon from 'sinon';

describe('menu', () => {
  it('throws an exception when no attributeName', () => {
    const container = document.createElement('div');
    expect(menu.bind(null, { container })).toThrow(/^Usage/);
  });

  it('throws an exception when no container', () => {
    const attributeName = '';
    expect(menu.bind(null, { attributeName })).toThrow(/^Usage/);
  });

  it('snapshot', () => {
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
    menu.__Rewire__('ReactDOM', ReactDOM);
    const widget = menu({
      container: document.createElement('div'),
      attributeName: 'test',
    });
    const instantSearchInstance = { templatesConfig: undefined };
    widget.init({ helper, createURL, instantSearchInstance });
    widget.render({ results, createURL, state });
    expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
    menu.__ResetDependency__('ReactDOM');
  });
});
