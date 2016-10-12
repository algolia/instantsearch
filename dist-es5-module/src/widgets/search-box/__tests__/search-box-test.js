'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _searchBox = require('../search-box');

var _searchBox2 = _interopRequireDefault(_searchBox);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);

function createHTMLNodeFromString(string) {
  var parent = document.createElement('div');
  parent.innerHTML = string;
  return parent.firstChild;
}

var onHistoryChange = function onHistoryChange() {};

describe('searchBox()', function () {
  var container = void 0;
  var state = void 0;
  var helper = void 0;
  var widget = void 0;

  beforeEach(function () {
    state = {
      query: ''
    };
    helper = _extends({
      setQuery: _sinon2.default.spy(),
      search: _sinon2.default.spy(),
      state: {
        query: ''
      }
    }, _events2.default.prototype);
  });

  context('bad usage', function () {
    it('throws an error if container is not defined', function () {
      (0, _expect2.default)(function () {
        (0, _searchBox2.default)({ container: null });
      }).toThrow(/Usage:/);
    });
  });

  context('targeting a div', function () {
    var opts = void 0;

    beforeEach(function () {
      container = document.createElement('div');
      opts = { container: container };
    });

    it('adds an input inside the div', function () {
      widget = (0, _searchBox2.default)(opts);
      widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
      var inputs = container.getElementsByTagName('input');
      (0, _expect2.default)(inputs.length).toEqual(1);
    });

    it('sets default HTML attribute to the input', function () {
      widget = (0, _searchBox2.default)(opts);
      widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
      var input = container.getElementsByTagName('input')[0];
      (0, _expect2.default)(input.getAttribute('autocapitalize')).toEqual('off');
      (0, _expect2.default)(input.getAttribute('autocomplete')).toEqual('off');
      (0, _expect2.default)(input.getAttribute('autocorrect')).toEqual('off');
      (0, _expect2.default)(input.getAttribute('class')).toEqual('ais-search-box--input');
      (0, _expect2.default)(input.getAttribute('placeholder')).toEqual('');
      (0, _expect2.default)(input.getAttribute('role')).toEqual('textbox');
      (0, _expect2.default)(input.getAttribute('spellcheck')).toEqual('false');
      (0, _expect2.default)(input.getAttribute('type')).toEqual('text');
    });

    it('supports cssClasses option', function () {
      opts.cssClasses = {
        root: ['root-class', 'cx'],
        input: 'input-class'
      };

      widget = (0, _searchBox2.default)(opts);
      widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
      var actualRootClasses = container.querySelector('input').parentNode.getAttribute('class');
      var actualInputClasses = container.querySelector('input').getAttribute('class');
      var expectedRootClasses = 'ais-search-box root-class cx';
      var expectedInputClasses = 'ais-search-box--input input-class';

      (0, _expect2.default)(actualRootClasses).toEqual(expectedRootClasses);
      (0, _expect2.default)(actualInputClasses).toEqual(expectedInputClasses);
    });
  });

  context('targeting an input', function () {
    it('reuse the existing input', function () {
      container = document.body.appendChild(document.createElement('input'));
      widget = (0, _searchBox2.default)({ container: container });
      widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
      (0, _expect2.default)(container.tagName).toEqual('INPUT');
      (0, _expect2.default)(container.getAttribute('autocapitalize')).toEqual('off');
      (0, _expect2.default)(container.getAttribute('autocomplete')).toEqual('off');
      (0, _expect2.default)(container.getAttribute('autocorrect')).toEqual('off');
      (0, _expect2.default)(container.getAttribute('class')).toEqual('ais-search-box--input');
      (0, _expect2.default)(container.getAttribute('placeholder')).toEqual('');
      (0, _expect2.default)(container.getAttribute('role')).toEqual('textbox');
      (0, _expect2.default)(container.getAttribute('spellcheck')).toEqual('false');
      (0, _expect2.default)(container.getAttribute('type')).toEqual('text');
    });

    it('passes HTML attributes', function () {
      container = createHTMLNodeFromString('<input id="foo" class="my-class" placeholder="Search" />');
      widget = (0, _searchBox2.default)({ container: container });
      widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
      (0, _expect2.default)(container.getAttribute('id')).toEqual('foo');
      (0, _expect2.default)(container.getAttribute('class')).toEqual('my-class ais-search-box--input');
      (0, _expect2.default)(container.getAttribute('placeholder')).toEqual('Search');
    });

    it('supports cssClasses', function () {
      container = createHTMLNodeFromString('<input class="my-class" />');
      widget = (0, _searchBox2.default)({ container: container, cssClasses: { root: 'root-class', input: 'input-class' } });
      widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });

      var actualRootClasses = container.parentNode.getAttribute('class');
      var actualInputClasses = container.getAttribute('class');
      var expectedRootClasses = 'ais-search-box root-class';
      var expectedInputClasses = 'my-class ais-search-box--input input-class';

      (0, _expect2.default)(actualRootClasses).toEqual(expectedRootClasses);
      (0, _expect2.default)(actualInputClasses).toEqual(expectedInputClasses);
    });
  });

  context('wraps the input in a div', function () {
    it('when targeting a div', function () {
      // Given
      container = document.createElement('div');
      widget = (0, _searchBox2.default)({ container: container });

      // When
      widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });

      // Then
      var wrapper = container.querySelectorAll('div.ais-search-box')[0];
      var input = container.querySelectorAll('input')[0];

      (0, _expect2.default)(wrapper.contains(input)).toEqual(true);
      (0, _expect2.default)(wrapper.getAttribute('class')).toEqual('ais-search-box');
    });

    it('when targeting an input', function () {
      // Given
      container = document.body.appendChild(document.createElement('input'));
      widget = (0, _searchBox2.default)({ container: container });

      // When
      widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });

      // Then
      var wrapper = container.parentNode;
      (0, _expect2.default)(wrapper.getAttribute('class')).toEqual('ais-search-box');
    });

    it('can be disabled with wrapInput:false', function () {
      // Given
      container = document.createElement('div');
      widget = (0, _searchBox2.default)({ container: container, wrapInput: false });

      // When
      widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });

      // Then
      var wrapper = container.querySelectorAll('div.ais-search-box');
      var input = container.querySelectorAll('input')[0];
      (0, _expect2.default)(wrapper.length).toEqual(0);
      (0, _expect2.default)(container.firstChild).toEqual(input);
    });
  });

  context('poweredBy', function () {
    var defaultInitOptions = void 0;
    var defaultWidgetOptions = void 0;
    var $ = void 0;

    beforeEach(function () {
      container = document.createElement('div');
      $ = container.querySelectorAll.bind(container);
      defaultWidgetOptions = { container: container };
      defaultInitOptions = { state: state, helper: helper, onHistoryChange: onHistoryChange };
    });

    it('should not add the element with default options', function () {
      // Given
      widget = (0, _searchBox2.default)(defaultWidgetOptions);

      // When
      widget.init(defaultInitOptions);

      // Then
      (0, _expect2.default)($('.ais-search-box--powered-by').length).toEqual(0);
    });

    it('should not add the element with poweredBy: false', function () {
      // Given
      widget = (0, _searchBox2.default)(_extends({}, defaultWidgetOptions, {
        poweredBy: false
      }));

      // When
      widget.init(defaultInitOptions);

      // Then
      (0, _expect2.default)($('.ais-search-box--powered-by').length).toEqual(0);
    });

    it('should add the element with poweredBy: true', function () {
      // Given
      widget = (0, _searchBox2.default)(_extends({}, defaultWidgetOptions, {
        poweredBy: true
      }));

      // When
      widget.init(defaultInitOptions);

      // Then
      (0, _expect2.default)($('.ais-search-box--powered-by').length).toEqual(1);
    });

    it('should contain a link to Algolia with poweredBy: true', function () {
      // Given
      widget = (0, _searchBox2.default)(_extends({}, defaultWidgetOptions, {
        poweredBy: true
      }));

      // When
      widget.init(defaultInitOptions);

      // Then
      var actual = $('.ais-search-box--powered-by-link');
      var url = 'https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=' + location.hostname + '&utm_campaign=poweredby';
      (0, _expect2.default)(actual.length).toEqual(1);
      (0, _expect2.default)(actual[0].tagName).toEqual('A');
      (0, _expect2.default)(actual[0].innerHTML).toEqual('Algolia');
      (0, _expect2.default)(actual[0].getAttribute('href')).toEqual(url);
    });

    it('should let user add its own CSS classes with poweredBy.cssClasses', function () {
      // Given
      widget = (0, _searchBox2.default)(_extends({}, defaultWidgetOptions, {
        poweredBy: {
          cssClasses: {
            root: 'myroot',
            link: 'mylink'
          }
        }
      }));

      // When
      widget.init(defaultInitOptions);

      // Then
      var root = $('.myroot');
      var link = $('.mylink');
      (0, _expect2.default)(root.length).toEqual(1);
      (0, _expect2.default)(link.length).toEqual(1);
      (0, _expect2.default)(link[0].tagName).toEqual('A');
      (0, _expect2.default)(link[0].innerHTML).toEqual('Algolia');
    });

    it('should still apply default CSS classes even if user provides its own', function () {
      // Given
      widget = (0, _searchBox2.default)(_extends({}, defaultWidgetOptions, {
        poweredBy: {
          cssClasses: {
            root: 'myroot',
            link: 'mylink'
          }
        }
      }));

      // When
      widget.init(defaultInitOptions);

      // Then
      var root = $('.ais-search-box--powered-by');
      var link = $('.ais-search-box--powered-by-link');
      (0, _expect2.default)(root.length).toEqual(1);
      (0, _expect2.default)(link.length).toEqual(1);
    });

    it('should let the user define its own string template', function () {
      // Given
      widget = (0, _searchBox2.default)(_extends({}, defaultWidgetOptions, {
        poweredBy: {
          template: '<div>Foobar</div>'
        }
      }));

      // When
      widget.init(defaultInitOptions);

      // Then
      (0, _expect2.default)(container.innerHTML).toContain('Foobar');
    });

    it('should let the user define its own Hogan template', function () {
      // Given
      widget = (0, _searchBox2.default)(_extends({}, defaultWidgetOptions, {
        poweredBy: {
          template: '<div>Foobar--{{url}}</div>'
        }
      }));

      // When
      widget.init(defaultInitOptions);

      // Then
      (0, _expect2.default)(container.innerHTML).toContain('Foobar--https://www.algolia.com/');
    });

    it('should let the user define its own function template', function () {
      // Given
      widget = (0, _searchBox2.default)(_extends({}, defaultWidgetOptions, {
        poweredBy: {
          template: function template(data) {
            return '<div>Foobar--' + data.url + '</div>';
          }
        }
      }));

      // When
      widget.init(defaultInitOptions);

      // Then
      (0, _expect2.default)(container.innerHTML).toContain('Foobar--https://www.algolia.com/');
    });

    it('should gracefully handle templates with leading spaces', function () {
      // Given
      widget = (0, _searchBox2.default)(_extends({}, defaultWidgetOptions, {
        poweredBy: {
          template: '\n\n          <div>Foobar</div>'
        }
      }));

      // When
      widget.init(defaultInitOptions);

      // Then
      (0, _expect2.default)(container.innerHTML).toContain('Foobar');
    });

    it('should handle templates not wrapped in a node', function () {
      // Given
      widget = (0, _searchBox2.default)(_extends({}, defaultWidgetOptions, {
        poweredBy: {
          template: 'Foobar <img src="./test.gif" class="should-be-found"/>'
        }
      }));

      // When
      widget.init(defaultInitOptions);

      // Then
      (0, _expect2.default)(container.innerHTML).toContain('Foobar');
      (0, _expect2.default)($('.should-be-found').length).toEqual(1);
    });
  });

  context('input event listener', function () {
    beforeEach(function () {
      container = document.body.appendChild(document.createElement('input'));
    });

    context('instant search', function () {
      beforeEach(function () {
        widget = (0, _searchBox2.default)({ container: container });
      });

      it('performs a search on any change', function () {
        simulateInputEvent('test', 'tes', widget, helper, state, container);
        (0, _expect2.default)(helper.search.called).toBe(true);
      });

      it('sets the query on any change', function () {
        simulateInputEvent('test', 'tes', widget, helper, state, container);
        (0, _expect2.default)(helper.setQuery.calledOnce).toBe(true);
      });

      it('does nothing when query is the same as state', function () {
        simulateInputEvent('test', 'test', widget, helper, state, container);
        (0, _expect2.default)(helper.setQuery.calledOnce).toBe(false);
        (0, _expect2.default)(helper.search.called).toBe(false);
      });
    });

    context('non-instant search and input event', function () {
      beforeEach(function () {
        widget = (0, _searchBox2.default)({ container: container, searchOnEnterKeyPressOnly: true });
        simulateInputEvent('test', 'tes', widget, helper, state, container);
      });

      it('updates the query', function () {
        (0, _expect2.default)(helper.setQuery.calledOnce).toBe(true);
      });

      it('does not search', function () {
        (0, _expect2.default)(helper.search.called).toBe(false);
      });
    });

    context('using a queryHook', function () {
      it('calls the queryHook', function () {
        var queryHook = _sinon2.default.spy();
        widget = (0, _searchBox2.default)({ container: container, queryHook: queryHook });
        simulateInputEvent('queryhook input', 'tes', widget, helper, state, container);
        (0, _expect2.default)(queryHook.calledOnce).toBe(true);
        (0, _expect2.default)(queryHook.firstCall.args[0]).toBe('queryhook input');
        (0, _expect2.default)(queryHook.firstCall.args[1]).toBeA(Function);
      });

      it('does not perform a search by default', function () {
        var queryHook = _sinon2.default.spy();
        widget = (0, _searchBox2.default)({ container: container, queryHook: queryHook });
        simulateInputEvent('test', 'tes', widget, helper, state, container);
        (0, _expect2.default)(helper.setQuery.calledOnce).toBe(false);
        (0, _expect2.default)(helper.search.called).toBe(false);
      });

      it('when calling the provided search function', function () {
        var queryHook = _sinon2.default.spy(function (query, search) {
          return search(query);
        });
        widget = (0, _searchBox2.default)({ container: container, queryHook: queryHook });
        simulateInputEvent('oh rly?', 'tes', widget, helper, state, container);
        (0, _expect2.default)(helper.setQuery.calledOnce).toBe(true);
        (0, _expect2.default)(helper.setQuery.firstCall.args[0]).toBe('oh rly?');
        (0, _expect2.default)(helper.search.called).toBe(true);
      });

      it('can override the query', function () {
        var queryHook = _sinon2.default.spy(function (originalQuery, search) {
          return search('hi mom!');
        });
        widget = (0, _searchBox2.default)({ container: container, queryHook: queryHook });
        simulateInputEvent('come.on.', 'tes', widget, helper, state, container);
        (0, _expect2.default)(helper.setQuery.firstCall.args[0]).toBe('hi mom!');
      });
    });
  });

  context('keyup', function () {
    beforeEach(function () {
      container = document.body.appendChild(document.createElement('input'));
    });

    context('instant search', function () {
      beforeEach(function () {
        widget = (0, _searchBox2.default)({ container: container });
      });

      it('do not perform the search on keyup event (should be done by input event)', function () {
        simulateKeyUpEvent({}, widget, helper, state, container);
        (0, _expect2.default)(helper.search.called).toBe(false);
      });
    });

    context('non-instant search', function () {
      beforeEach(function () {
        widget = (0, _searchBox2.default)({ container: container, searchOnEnterKeyPressOnly: true });
      });

      it('performs the search on keyup if <ENTER>', function () {
        simulateInputEvent('test', 'tes', widget, helper, state, container);
        simulateKeyUpEvent({ keyCode: 13 }, widget, helper, state, container);
        (0, _expect2.default)(helper.search.calledOnce).toBe(true);
      });

      it('doesn\'t perform the search on keyup if not <ENTER>', function () {
        simulateKeyUpEvent({}, widget, helper, state, container);
        (0, _expect2.default)(helper.setQuery.called).toBe(false);
        (0, _expect2.default)(helper.search.called).toBe(false);
      });
    });
  });

  it('updates the input on history update', function () {
    var cb = void 0;
    container = document.body.appendChild(document.createElement('input'));
    widget = (0, _searchBox2.default)({ container: container });
    widget.init({ state: state, helper: helper, onHistoryChange: function onHistoryChange(fn) {
        cb = fn;
      } });
    (0, _expect2.default)(container.value).toBe('');
    container.blur();
    cb({ query: 'iphone' });
    (0, _expect2.default)(container.value).toBe('iphone');
  });

  it('handles external updates', function () {
    container = document.body.appendChild(document.createElement('input'));
    container.value = 'initial';
    widget = (0, _searchBox2.default)({ container: container });
    widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
    container.blur();
    widget.render({ helper: { state: { query: 'new value' } } });
    (0, _expect2.default)(container.value).toBe('new value');
  });

  it('does not update the input value when focused', function () {
    container = document.body.appendChild(document.createElement('input'));
    container.value = 'initial';
    container.focus();
    widget = (0, _searchBox2.default)({ container: container });
    widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
    widget.render({ helper: { state: { query: 'new value' } } });
    (0, _expect2.default)(container.value).toBe('initial');
  });

  context('autofocus', function () {
    beforeEach(function () {
      container = document.body.appendChild(document.createElement('input'));
      container.focus = _sinon2.default.spy();
      container.setSelectionRange = _sinon2.default.spy();
    });

    context('when auto', function () {
      beforeEach(function () {
        widget = (0, _searchBox2.default)({ container: container, autofocus: 'auto' });
      });

      it('is called if search is empty', function () {
        // Given
        helper.state.query = '';
        // When
        widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
        // Then
        (0, _expect2.default)(container.focus.called).toEqual(true);
      });

      it('is not called if search is not empty', function () {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
        // Then
        (0, _expect2.default)(container.focus.called).toEqual(false);
      });
    });

    context('when true', function () {
      beforeEach(function () {
        widget = (0, _searchBox2.default)({ container: container, autofocus: true });
      });

      it('is called if search is empty', function () {
        // Given
        helper.state.query = '';
        // When
        widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
        // Then
        (0, _expect2.default)(container.focus.called).toEqual(true);
      });

      it('is called if search is not empty', function () {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
        // Then
        (0, _expect2.default)(container.focus.called).toEqual(true);
      });

      it('forces cursor to be at the end of the query', function () {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
        // Then
        (0, _expect2.default)(container.setSelectionRange.calledWith(3, 3)).toEqual(true);
      });
    });

    context('when false', function () {
      beforeEach(function () {
        widget = (0, _searchBox2.default)({ container: container, autofocus: false });
      });

      it('is not called if search is empty', function () {
        // Given
        helper.state.query = '';
        // When
        widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
        // Then
        (0, _expect2.default)(container.focus.called).toEqual(false);
      });

      it('is not called if search is not empty', function () {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
        // Then
        (0, _expect2.default)(container.focus.called).toEqual(false);
      });
    });
  });
});

function simulateKeyUpEvent(args, widget, helper, state, container) {
  // Given
  helper.state.query = 'foo';
  // When
  widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
  // Then
  var event = new window.Event('keyup', args);
  Object.defineProperty(event, 'keyCode', { get: function get() {
      return args.keyCode;
    } });
  container.dispatchEvent(event);
}

// eslint-disable-next-line max-params
function simulateInputEvent(query, stateQuery, widget, helper, state, container) {
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
  widget.init({ state: state, helper: helper, onHistoryChange: onHistoryChange });
  // Then
  container.value = query;
  var event = new window.Event('input');
  container.dispatchEvent(event);
}