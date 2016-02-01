/* eslint-env mocha */

import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'jsdom-global';

import searchBox from '../search-box';
import EventEmitter from 'events';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

function createHTMLNodeFromString(string) {
  let parent = document.createElement('div');
  parent.innerHTML = string;
  return parent.firstChild;
}

describe('search-box()', () => {
  beforeEach(function() {this.jsdom = jsdom();});
  afterEach(function() {this.jsdom();});

  let ReactDOM;
  let container;
  let state;
  let helper;
  let widget;
  let onHistoryChange;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    searchBox.__Rewire__('ReactDOM', ReactDOM);
    state = {
      query: ''
    };
    helper = {
      setQuery: sinon.spy(),
      search: sinon.spy(),
      state: {
        query: ''
      },
      ...EventEmitter.prototype
    };
    onHistoryChange = function() {};
  });

  context('bad usage', () => {
    it('throws an error if container is not defined', () => {
      expect(() => {
        searchBox({container: null});
      }).toThrow(/Usage:/);
    });
  });

  context('targeting a div', () => {
    let opts;

    beforeEach(() => {
      container = document.createElement('div');
      opts = {container};
    });

    it('adds an input inside the div', () => {
      widget = searchBox(opts);
      widget.init({state, helper, onHistoryChange});
      let inputs = container.getElementsByTagName('input');
      expect(inputs.length).toEqual(1);
    });

    it('sets default HTML attribute to the input', () => {
      widget = searchBox(opts);
      widget.init({state, helper, onHistoryChange});
      let input = container.getElementsByTagName('input')[0];
      expect(input.getAttribute('autocapitalize')).toEqual('off');
      expect(input.getAttribute('autocomplete')).toEqual('off');
      expect(input.getAttribute('autocorrect')).toEqual('off');
      expect(input.getAttribute('class')).toEqual('ais-search-box--input');
      expect(input.getAttribute('placeholder')).toEqual('');
      expect(input.getAttribute('role')).toEqual('textbox');
      expect(input.getAttribute('spellcheck')).toEqual('false');
      expect(input.getAttribute('type')).toEqual('text');
    });

    it('supports cssClasses option', () => {
      opts.cssClasses = {
        root: ['root-class', 'cx'],
        input: 'input-class'
      };

      widget = searchBox(opts);
      widget.init({state, helper, onHistoryChange});
      let actualRootClasses = container.querySelector('input').parentNode.getAttribute('class');
      let actualInputClasses = container.querySelector('input').getAttribute('class');
      let expectedRootClasses = 'ais-search-box root-class cx';
      let expectedInputClasses = 'ais-search-box--input input-class';

      expect(actualRootClasses).toEqual(expectedRootClasses);
      expect(actualInputClasses).toEqual(expectedInputClasses);
    });
  });

  context('targeting an input', () => {
    it('reuse the existing input', () => {
      container = createHTMLNodeFromString('<input />');
      widget = searchBox({container});
      widget.init({state, helper, onHistoryChange});
      expect(container.tagName).toEqual('INPUT');
      expect(container.getAttribute('autocapitalize')).toEqual('off');
      expect(container.getAttribute('autocomplete')).toEqual('off');
      expect(container.getAttribute('autocorrect')).toEqual('off');
      expect(container.getAttribute('class')).toEqual('ais-search-box--input');
      expect(container.getAttribute('placeholder')).toEqual('');
      expect(container.getAttribute('role')).toEqual('textbox');
      expect(container.getAttribute('spellcheck')).toEqual('false');
      expect(container.getAttribute('type')).toEqual('text');
    });

    it('passes HTML attributes', () => {
      container = createHTMLNodeFromString('<input id="foo" class="my-class" placeholder="Search" />');
      widget = searchBox({container});
      widget.init({state, helper, onHistoryChange});
      expect(container.getAttribute('id')).toEqual('foo');
      expect(container.getAttribute('class')).toEqual('my-class ais-search-box--input');
      expect(container.getAttribute('placeholder')).toEqual('Search');
    });

    it('supports cssClasses', () => {
      container = createHTMLNodeFromString('<input class="my-class" />');
      widget = searchBox({container, cssClasses: {root: 'root-class', input: 'input-class'}});
      widget.init({state, helper, onHistoryChange});

      let actualRootClasses = container.parentNode.getAttribute('class');
      let actualInputClasses = container.getAttribute('class');
      let expectedRootClasses = 'ais-search-box root-class';
      let expectedInputClasses = 'my-class ais-search-box--input input-class';

      expect(actualRootClasses).toEqual(expectedRootClasses);
      expect(actualInputClasses).toEqual(expectedInputClasses);
    });
  });

  context('wraps the input in a div', () => {
    it('when targeting a div', () => {
      // Given
      container = document.createElement('div');
      widget = searchBox({container});

      // When
      widget.init({state, helper, onHistoryChange});

      // Then
      let wrapper = container.querySelectorAll('div.ais-search-box')[0];
      let input = container.querySelectorAll('input')[0];

      expect(wrapper.contains(input)).toEqual(true);
      expect(wrapper.getAttribute('class')).toEqual('ais-search-box');
    });

    it('when targeting an input', () => {
      // Given
      container = createHTMLNodeFromString('<input />');
      widget = searchBox({container});

      // When
      widget.init({state, helper, onHistoryChange});

      // Then
      let wrapper = container.parentNode;
      expect(wrapper.getAttribute('class')).toEqual('ais-search-box');
    });

    it('can be disabled with wrapInput:false', () => {
      // Given
      container = document.createElement('div');
      widget = searchBox({container, wrapInput: false});

      // When
      widget.init({state, helper, onHistoryChange});

      // Then
      let wrapper = container.querySelectorAll('div.ais-search-box');
      let input = container.querySelectorAll('input')[0];
      expect(wrapper.length).toEqual(0);
      expect(container.firstChild).toEqual(input);
    });
  });

  context('adds a PoweredBy', () => {
    beforeEach(() => {
      container = document.createElement('div');
    });

    it('do not add the poweredBy if not specified', () => {
      widget = searchBox({container});
      widget.init({state, helper, onHistoryChange});
      expect(ReactDOM.render.notCalled).toBe(true);
    });

    it('add the poweredBy if specified', () => {
      widget = searchBox({container, poweredBy: true});
      widget.init({state, helper, onHistoryChange});
      expect(ReactDOM.render.notCalled).toBe(false);
    });
  });

  context('input event listener', () => {
    let input;
    beforeEach(() => {
      container = document.createElement('div');
      input = createHTMLNodeFromString('<input />');
      input.addEventListener = sinon.spy();
    });

    function simulateInputEvent() {
      // Given
      helper.state.query = 'foo';
      // When
      widget.init({state, helper, onHistoryChange});
      // Then
      expect(input.addEventListener.called).toEqual(true);
      expect(input.addEventListener.args[1].length).toEqual(3);
      expect(input.addEventListener.args[1][0]).toEqual('input');
      let fn = input.addEventListener.args[1][1];

      return fn({currentTarget: {value: 'test'}});
    }

    context('instant search', () => {
      beforeEach(() => {
        widget = searchBox({container, autofocus: 'auto'});
        widget.getInput = sinon.stub().returns(input);
      });

      it('performs a search on any change', () => {
        simulateInputEvent();
        expect(helper.setQuery.calledOnce).toBe(true);
        expect(helper.search.called).toBe(true);
      });
    });

    context('non-instant search', () => {
      beforeEach(() => {
        widget = searchBox({container, autofocus: 'auto', searchOnEnterKeyPressOnly: true});
        widget.getInput = sinon.stub().returns(input);
      });

      it('does not performs (will be handle by keyup event)', () => {
        simulateInputEvent();
        expect(helper.setQuery.calledOnce).toBe(true);
        expect(helper.search.called).toBe(false);
      });
    });
  });

  context('keyup', () => {
    let input;
    beforeEach(() => {
      container = document.createElement('div');
      input = createHTMLNodeFromString('<input />');
      input.addEventListener = sinon.spy();
    });

    function simulateKeyUpEvent(args) {
      // Given
      helper.state.query = 'foo';
      // When
      widget.init({state, helper, onHistoryChange});
      // Then
      expect(input.addEventListener.called).toEqual(true);
      expect(input.addEventListener.args[0].length).toEqual(2);
      expect(input.addEventListener.args[0][0]).toEqual('keyup');
      let fn = input.addEventListener.args[0][1];

      return fn(args);
    }

    context('instant search', () => {
      beforeEach(() => {
        widget = searchBox({container, autofocus: 'auto'});
        widget.getInput = sinon.stub().returns(input);
      });

      it('do not perform the search on keyup event (should be done by input event)', () => {
        simulateKeyUpEvent({});
        expect(helper.setQuery.calledOnce).toBe(true);
        expect(helper.search.called).toBe(false);
      });
    });

    context('non-instant search', () => {
      beforeEach(() => {
        widget = searchBox({container, autofocus: 'auto', searchOnEnterKeyPressOnly: true});
        widget.getInput = sinon.stub().returns(input);
      });

      it('performs the search on keyup if <ENTER>', () => {
        simulateKeyUpEvent({keyCode: 13});
        expect(helper.setQuery.calledOnce).toBe(true);
        expect(helper.search.calledOnce).toBe(true);
      });

      it('doesn\'t perform the search on keyup if not <ENTER>', () => {
        simulateKeyUpEvent({});
        expect(helper.setQuery.calledOnce).toBe(true);
        expect(helper.search.calledOnce).toBe(false);
      });
    });
  });

  it('updates the input on history update', () => {
    let cb;
    onHistoryChange = function(fn) {
      cb = fn;
    };
    container = document.createElement('div');
    widget = searchBox({container});
    widget.init({state, helper, onHistoryChange});
    let input = container.querySelector('input');
    expect(input.value).toBe('');
    input.blur();
    cb({query: 'iphone'});
    expect(input.value).toBe('iphone');
  });

  context('focus', () => {
    let input;
    beforeEach(() => {
      container = document.createElement('div');
      input = createHTMLNodeFromString('<input />');
      input.focus = sinon.spy();
    });

    context('auto', () => {
      beforeEach(() => {
        widget = searchBox({container, autofocus: 'auto'});
        widget.getInput = sinon.stub().returns(input);
      });

      it('is called if search is empty', () => {
        // Given
        helper.state.query = '';
        // When
        widget.init({state, helper, onHistoryChange});
        // Then
        expect(input.focus.called).toEqual(true);
      });

      it('is not called if search is not empty', () => {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({state, helper, onHistoryChange});
        // Then
        expect(input.focus.called).toEqual(false);
      });
    });

    context('true', () => {
      beforeEach(() => {
        widget = searchBox({container, autofocus: true});
        widget.getInput = sinon.stub().returns(input);
      });

      it('is called if search is empty', () => {
        // Given
        helper.state.query = '';
        // When
        widget.init({state, helper, onHistoryChange});
        // Then
        expect(input.focus.called).toEqual(true);
      });

      it('is called if search is not empty', () => {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({state, helper, onHistoryChange});
        // Then
        expect(input.focus.called).toEqual(true);
      });
    });

    context('false', () => {
      beforeEach(() => {
        widget = searchBox({container, autofocus: false});
        widget.getInput = sinon.stub().returns(input);
      });

      it('is not called if search is empty', () => {
        // Given
        helper.state.query = '';
        // When
        widget.init({state, helper, onHistoryChange});
        // Then
        expect(input.focus.called).toEqual(false);
      });

      it('is not called if search is not empty', () => {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({state, helper, onHistoryChange});
        // Then
        expect(input.focus.called).toEqual(false);
      });
    });
  });

  afterEach(() => {
    searchBox.__ResetDependency__('ReactDOM');
  });
});

