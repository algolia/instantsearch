import sinon from 'sinon';
import hitsPerPageSelector from '../hits-per-page-selector';

describe('hitsPerPageSelector call', () => {
  it('throws an exception when no options', () => {
    const container = document.createElement('div');
    expect(hitsPerPageSelector.bind(null, {container})).toThrow(/^Usage:/);
  });

  it('throws an exception when no container', () => {
    const options = {a: {value: 'value', label: 'My value'}};
    expect(hitsPerPageSelector.bind(null, {options})).toThrow(/^Usage:/);
  });
});

describe('hitsPerPageSelector()', () => {
  let ReactDOM;
  let container;
  let options;
  let cssClasses;
  let widget;
  let helper;
  let results;
  let consoleLog;
  let state;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};

    hitsPerPageSelector.__Rewire__('ReactDOM', ReactDOM);
    consoleLog = sinon.stub(window.console, 'log');

    container = document.createElement('div');
    options = [
      {value: 10, label: '10 results'},
      {value: 20, label: '20 results'},
    ];
    cssClasses = {
      root: ['custom-root', 'cx'],
      item: 'custom-item',
    };
    widget = hitsPerPageSelector({container, options, cssClasses});
    helper = {
      state: {
        hitsPerPage: 20,
      },
      setQueryParameter: sinon.stub().returnsThis(),
      search: sinon.spy(),
    };
    state = {
      hitsPerPage: 10,
    };
    results = {
      hits: [],
      nbHits: 0,
    };
  });

  it('doesn\'t configure anything', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('calls twice ReactDOM.render(<Selector props />, container)', () => {
    widget.init({helper, state: helper.state});
    widget.render({results, state});
    widget.render({results, state});
    expect(ReactDOM.render.callCount).toBe(2);
    expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
  });

  it('sets the underlying hitsPerPage', () => {
    widget.init({helper, state: helper.state});
    widget.setHitsPerPage(helper, helper.state, 10);
    expect(helper.setQueryParameter.calledOnce).toBe(true, 'setQueryParameter called once');
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('should throw if there is no name attribute in a passed object', () => {
    options.length = 0;
    options.push({label: 'Label without a value'});
    widget.init({state: helper.state, helper});
    expect(consoleLog.calledOnce).toBe(true, 'console.log called once');
    expect(consoleLog.firstCall.args[0]).
      toEqual(
`[Warning][hitsPerPageSelector] No option in \`options\`
  with \`value: hitsPerPage\` (hitsPerPage: 20)`
      );
  });

  it('must include the current hitsPerPage at initialization time', () => {
    helper.state.hitsPerPage = -1;
    widget.init({state: helper.state, helper});
    expect(consoleLog.calledOnce).toBe(true, 'console.log called once');
    expect(consoleLog.firstCall.args[0]).
      toEqual(
`[Warning][hitsPerPageSelector] No option in \`options\`
  with \`value: hitsPerPage\` (hitsPerPage: -1)`
      );
  });

  it('should not throw an error if state does not have a `hitsPerPage`', () => {
    delete helper.state.hitsPerPage;
    expect(() => {
      widget.init({state: helper.state, helper});
    }).not.toThrow(/No option in `options`/);
  });

  afterEach(() => {
    hitsPerPageSelector.__ResetDependency__('ReactDOM');
    consoleLog.restore();
  });
});
