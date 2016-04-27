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

describe('searchBox()', () => {
  beforeEach(function() {this.jsdom = jsdom();});
  afterEach(function() {this.jsdom();});

  let container;
  let state;
  let helper;
  let widget;
  let onHistoryChange;

  beforeEach(() => {
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
      container = document.body.appendChild(document.createElement('input'));
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
      container = document.body.appendChild(document.createElement('input'));
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
      expect(container.querySelector('.ais-search-box--powered-by')).toBe(null);
    });

    it('adds the poweredBy if specified', () => {
      widget = searchBox({container, poweredBy: true});
      widget.init({state, helper, onHistoryChange});
      const poweredBy = container.querySelector('.ais-search-box--powered-by');
      const poweredByLink = poweredBy.querySelector('a');
      const expectedLink = `https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=${location.hostname}&utm_campaign=poweredby`;
      expect(poweredBy).toNotBe(null);
      expect(poweredByLink.getAttribute('href')).toBe(expectedLink);
    });
  });

  context('input event listener', () => {
    beforeEach(() => {
      container = document.body.appendChild(document.createElement('input'));
    });

    function simulateInputEvent(query, stateQuery) {
      if (query === undefined) {
        query = 'test';
      }

      // Given
      if (stateQuery !== undefined) {
        helper.state.query = stateQuery;
      } else {
        helper.state.query = 'tes';
      }

      // When
      widget.init({state, helper, onHistoryChange});
      // Then
      container.value = query;
      let event = new Event('input');
      container.dispatchEvent(event);
    }

    context('instant search', () => {
      beforeEach(() => {
        widget = searchBox({container});
      });

      it('performs a search on any change', () => {
        simulateInputEvent();
        expect(helper.search.called).toBe(true);
      });

      it('sets the query on any change', () => {
        simulateInputEvent();
        expect(helper.setQuery.calledOnce).toBe(true);
      });

      it('does nothing when query is the same as state', () => {
        simulateInputEvent('test', 'test');
        expect(helper.setQuery.calledOnce).toBe(false);
        expect(helper.search.called).toBe(false);
      });
    });

    context('non-instant search', () => {
      beforeEach(() => {
        widget = searchBox({container, searchOnEnterKeyPressOnly: true});
      });

      it('does not performs (will be handle by keyup event)', () => {
        simulateInputEvent();
        expect(helper.setQuery.calledOnce).toBe(false);
        expect(helper.search.called).toBe(false);
      });
    });

    context('using a queryHook', () => {
      it('calls the queryHook', () => {
        let queryHook = sinon.spy();
        widget = searchBox({container, queryHook});
        simulateInputEvent('queryhook input');
        expect(queryHook.calledOnce).toBe(true);
        expect(queryHook.firstCall.args[0]).toBe('queryhook input');
        expect(queryHook.firstCall.args[1]).toBeA(Function);
      });

      it('does not perform a search by default', () => {
        let queryHook = sinon.spy();
        widget = searchBox({container, queryHook});
        simulateInputEvent();
        expect(helper.setQuery.calledOnce).toBe(false);
        expect(helper.search.called).toBe(false);
      });

      it('when calling the provided search function', () => {
        let queryHook = sinon.spy((query, search) => search(query));
        widget = searchBox({container, queryHook});
        simulateInputEvent('oh rly?');
        expect(helper.setQuery.calledOnce).toBe(true);
        expect(helper.setQuery.firstCall.args[0]).toBe('oh rly?');
        expect(helper.search.called).toBe(true);
      });

      it('can override the query', () => {
        let queryHook = sinon.spy((originalQuery, search) => search('hi mom!'));
        widget = searchBox({container, queryHook});
        simulateInputEvent('come.on.');
        expect(helper.setQuery.firstCall.args[0]).toBe('hi mom!');
      });
    });
  });

  context('keyup', () => {
    beforeEach(() => {
      container = document.body.appendChild(document.createElement('input'));
    });

    function simulateKeyUpEvent(args) {
      // Given
      helper.state.query = 'foo';
      // When
      widget.init({state, helper, onHistoryChange});
      // Then
      let event = new Event('keyup', args);
      Object.defineProperty(event, 'keyCode', {get: () => args.keyCode});
      container.dispatchEvent(event);
    }

    context('instant search', () => {
      beforeEach(() => {
        widget = searchBox({container});
      });

      it('do not perform the search on keyup event (should be done by input event)', () => {
        simulateKeyUpEvent({});
        expect(helper.search.called).toBe(false);
      });
    });

    context('non-instant search', () => {
      beforeEach(() => {
        widget = searchBox({container, searchOnEnterKeyPressOnly: true});
      });

      it('sets the query on keyup if <ENTER>', () => {
        simulateKeyUpEvent({keyCode: 13});
        expect(helper.setQuery.calledOnce).toBe(true);
      });

      it('performs the search on keyup if <ENTER>', () => {
        simulateKeyUpEvent({keyCode: 13});
        expect(helper.search.calledOnce).toBe(true);
      });

      it('doesn\'t perform the search on keyup if not <ENTER>', () => {
        simulateKeyUpEvent({});
        expect(helper.setQuery.called).toBe(false);
        expect(helper.search.called).toBe(false);
      });
    });
  });

  it('updates the input on history update', () => {
    let cb;
    onHistoryChange = function(fn) {
      cb = fn;
    };
    container = document.body.appendChild(document.createElement('input'));
    widget = searchBox({container});
    widget.init({state, helper, onHistoryChange});
    expect(container.value).toBe('');
    container.blur();
    cb({query: 'iphone'});
    expect(container.value).toBe('iphone');
  });


  it('handles external updates', () => {
    container = document.body.appendChild(document.createElement('input'));
    container.value = 'initial';
    widget = searchBox({container});
    widget.init({state, helper, onHistoryChange});
    container.blur();
    widget.render({helper: {state: {query: 'new value'}}});
    expect(container.value).toBe('new value');
  });

  it('does not update the input value when focused', () => {
    container = document.body.appendChild(document.createElement('input'));
    container.value = 'initial';
    container.focus();
    widget = searchBox({container});
    widget.init({state, helper, onHistoryChange});
    widget.render({helper: {state: {query: 'new value'}}});
    expect(container.value).toBe('initial');
  });

  context('autofocus', () => {
    beforeEach(() => {
      container = document.body.appendChild(document.createElement('input'));
      container.focus = sinon.spy();
    });

    context('when auto', () => {
      beforeEach(() => {
        widget = searchBox({container, autofocus: 'auto'});
      });

      it('is called if search is empty', () => {
        // Given
        helper.state.query = '';
        // When
        widget.init({state, helper, onHistoryChange});
        // Then
        expect(container.focus.called).toEqual(true);
      });

      it('is not called if search is not empty', () => {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({state, helper, onHistoryChange});
        // Then
        expect(container.focus.called).toEqual(false);
      });
    });

    context('when true', () => {
      beforeEach(() => {
        widget = searchBox({container, autofocus: true});
      });

      it('is called if search is empty', () => {
        // Given
        helper.state.query = '';
        // When
        widget.init({state, helper, onHistoryChange});
        // Then
        expect(container.focus.called).toEqual(true);
      });

      it('is called if search is not empty', () => {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({state, helper, onHistoryChange});
        // Then
        expect(container.focus.called).toEqual(true);
      });
    });

    context('when false', () => {
      beforeEach(() => {
        widget = searchBox({container, autofocus: false});
      });

      it('is not called if search is empty', () => {
        // Given
        helper.state.query = '';
        // When
        widget.init({state, helper, onHistoryChange});
        // Then
        expect(container.focus.called).toEqual(false);
      });

      it('is not called if search is not empty', () => {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({state, helper, onHistoryChange});
        // Then
        expect(container.focus.called).toEqual(false);
      });
    });
  });
});
