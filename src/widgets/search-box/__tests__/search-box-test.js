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

  context('poweredBy', () => {
    let defaultInitOptions;
    let defaultWidgetOptions;
    let $;

    beforeEach(() => {
      container = document.createElement('div');
      $ = container.querySelectorAll.bind(container);
      defaultWidgetOptions = {container};
      defaultInitOptions = {state, helper, onHistoryChange};
    });

    it('should not add the element with default options', () => {
      // Given
      widget = searchBox(defaultWidgetOptions);

      // When
      widget.init(defaultInitOptions);

      // Then
      expect($('.ais-search-box--powered-by').length).toEqual(0);
    });

    it('should not add the element with poweredBy: false', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        poweredBy: false
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      expect($('.ais-search-box--powered-by').length).toEqual(0);
    });

    it('should add the element with poweredBy: true', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        poweredBy: true
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      expect($('.ais-search-box--powered-by').length).toEqual(1);
    });

    it('should contain a link to Algolia with poweredBy: true', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        poweredBy: true
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      let actual = $('.ais-search-box--powered-by-link');
      let url = `https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=${location.hostname}&utm_campaign=poweredby`;
      expect(actual.length).toEqual(1);
      expect(actual[0].tagName).toEqual('A');
      expect(actual[0].innerHTML).toEqual('Algolia');
      expect(actual[0].getAttribute('href')).toEqual(url);
    });

    it('should let user add its own CSS classes with poweredBy.cssClasses', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        poweredBy: {
          cssClasses: {
            root: 'myroot',
            link: 'mylink'
          }
        }
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      let root = $('.myroot');
      let link = $('.mylink');
      expect(root.length).toEqual(1);
      expect(link.length).toEqual(1);
      expect(link[0].tagName).toEqual('A');
      expect(link[0].innerHTML).toEqual('Algolia');
    });

    it('should still apply default CSS classes even if user provides its own', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        poweredBy: {
          cssClasses: {
            root: 'myroot',
            link: 'mylink'
          }
        }
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      let root = $('.ais-search-box--powered-by');
      let link = $('.ais-search-box--powered-by-link');
      expect(root.length).toEqual(1);
      expect(link.length).toEqual(1);
    });

    it('should let the user define its own string template', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        poweredBy: {
          template: '<div>Foobar</div>'
        }
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      expect(container.innerHTML).toContain('Foobar');
    });

    it('should let the user define its own Hogan template', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        poweredBy: {
          template: '<div>Foobar--{{url}}</div>'
        }
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      expect(container.innerHTML).toContain('Foobar--https://www.algolia.com/');
    });

    it('should let the user define its own function template', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        poweredBy: {
          template: (data) => {
            return `<div>Foobar--${data.url}</div>`;
          }
        }
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      expect(container.innerHTML).toContain('Foobar--https://www.algolia.com/');
    });

    it('should gracefully handle templates with leading spaces', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        poweredBy: {
          template: `

          <div>Foobar</div>`
        }
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      expect(container.innerHTML).toContain('Foobar');
    });

    it('should handle templates not wrapped in a node', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        poweredBy: {
          template: 'Foobar <img src="./test.gif" class="should-be-found"/>'
        }
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      expect(container.innerHTML).toContain('Foobar');
      expect($('.should-be-found').length).toEqual(1);
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
      let event = new window.Event('input');
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
      let event = new window.Event('keyup', args);
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
