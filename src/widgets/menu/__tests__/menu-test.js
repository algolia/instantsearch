import menu from '../menu';

import sinon from 'sinon';

describe('menu', () => {
  it('throws an exception when no attributeName', () => {
    const container = document.createElement('div');
    expect(menu.bind(null, {container})).toThrow(/^Usage/);
  });

  it('throws an exception when no container', () => {
    const attributeName = '';
    expect(menu.bind(null, {attributeName})).toThrow(/^Usage/);
  });

  it('snapshot', () => {
    const data = {data: [{name: 'foo'}, {name: 'bar'}]};
    const results = {getFacetValues: sinon.spy(() => data)};
    const helper = {
      toggleRefinement: sinon.stub().returnsThis(),
      search: sinon.spy(),
    };
    const state = {
      toggleRefinement: sinon.spy(),
    };
    const createURL = () => '#';
    const ReactDOM = {render: sinon.spy()};
    menu.__Rewire__('ReactDOM', ReactDOM);
    const widget = menu({container: document.createElement('div'), attributeName: 'test'});
    widget.init({helper, createURL});
    widget.render({results, state});
    expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
    menu.__ResetDependency__('ReactDOM');
  });
});
