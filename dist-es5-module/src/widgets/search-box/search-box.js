'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _utils = require('../../lib/utils.js');

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _hogan = require('hogan.js');

var _hogan2 = _interopRequireDefault(_hogan);

var _defaultTemplates = require('./defaultTemplates.js');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bem = (0, _utils.bemHelper)('ais-search-box');
var KEY_ENTER = 13;
var KEY_SUPPRESS = 8;

/**
 * Instantiate a searchbox
 * @function searchBox
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} [options.placeholder] Input's placeholder
 * @param  {boolean|Object} [options.poweredBy=false] Define if a "powered by Algolia" link should be added near the input
 * @param  {function|string} [options.poweredBy.template] Template used for displaying the link. Can accept a function or a Hogan string.
 * @param  {number} [options.poweredBy.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.poweredBy.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.poweredBy.cssClasses.link] CSS class to add to the link element
 * @param  {boolean} [options.wrapInput=true] Wrap the input in a `div.ais-search-box`
 * @param  {boolean|string} [autofocus='auto'] autofocus on the input
 * @param  {boolean} [options.searchOnEnterKeyPressOnly=false] If set, trigger the search
 * once `<Enter>` is pressed only
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the
 * wrapping div (if `wrapInput` set to `true`)
 * @param  {string|string[]} [options.cssClasses.input] CSS class to add to the input
 * @param  {function} [options.queryHook] A function that will be called every time a new search would be done. You
 * will get the query as first parameter and a search(query) function to call as the second parameter.
 * This queryHook can be used to debounce the number of searches done from the searchBox.
 * @return {Object}
 */

var usage = 'Usage:\nsearchBox({\n  container,\n  [ placeholder ],\n  [ cssClasses.{input,poweredBy} ],\n  [ poweredBy=false || poweredBy.{template, cssClasses.{root,link}} ],\n  [ wrapInput ],\n  [ autofocus ],\n  [ searchOnEnterKeyPressOnly ],\n  [ queryHook ]\n})';
function searchBox(_ref) {
  var container = _ref.container;
  var _ref$placeholder = _ref.placeholder;
  var placeholder = _ref$placeholder === undefined ? '' : _ref$placeholder;
  var _ref$cssClasses = _ref.cssClasses;
  var cssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;
  var _ref$poweredBy = _ref.poweredBy;
  var poweredBy = _ref$poweredBy === undefined ? false : _ref$poweredBy;
  var _ref$wrapInput = _ref.wrapInput;
  var wrapInput = _ref$wrapInput === undefined ? true : _ref$wrapInput;
  var _ref$autofocus = _ref.autofocus;
  var autofocus = _ref$autofocus === undefined ? 'auto' : _ref$autofocus;
  var _ref$searchOnEnterKey = _ref.searchOnEnterKeyPressOnly;
  var searchOnEnterKeyPressOnly = _ref$searchOnEnterKey === undefined ? false : _ref$searchOnEnterKey;
  var queryHook = _ref.queryHook;

  // the 'input' event is triggered when the input value changes
  // in any case: typing, copy pasting with mouse..
  // 'onpropertychange' is the IE8 alternative until we support IE8
  // but it's flawed: http://help.dottoro.com/ljhxklln.php
  var INPUT_EVENT = window.addEventListener ? 'input' : 'propertychange';

  if (!container) {
    throw new Error(usage);
  }

  container = (0, _utils.getContainerNode)(container);

  // Only possible values are 'auto', true and false
  if (typeof autofocus !== 'boolean') {
    autofocus = 'auto';
  }

  // Convert to object if only set to true
  if (poweredBy === true) {
    poweredBy = {};
  }

  return {
    getInput: function getInput() {
      // Returns reference to targeted input if present, or create a new one
      if (container.tagName === 'INPUT') {
        return container;
      }
      return document.createElement('input');
    },
    wrapInput: function wrapInput(input) {
      // Wrap input in a .ais-search-box div
      var wrapper = document.createElement('div');
      var CSSClassesToAdd = (0, _classnames2.default)(bem(null), cssClasses.root).split(' ');
      CSSClassesToAdd.forEach(function (cssClass) {
        return wrapper.classList.add(cssClass);
      });
      wrapper.appendChild(input);
      return wrapper;
    },
    addDefaultAttributesToInput: function addDefaultAttributesToInput(input, query) {
      var defaultAttributes = {
        autocapitalize: 'off',
        autocomplete: 'off',
        autocorrect: 'off',
        placeholder: placeholder,
        role: 'textbox',
        spellcheck: 'false',
        type: 'text',
        value: query
      };

      // Overrides attributes if not already set
      (0, _forEach2.default)(defaultAttributes, function (value, key) {
        if (input.hasAttribute(key)) {
          return;
        }
        input.setAttribute(key, value);
      });

      // Add classes
      var CSSClassesToAdd = (0, _classnames2.default)(bem('input'), cssClasses.input).split(' ');
      CSSClassesToAdd.forEach(function (cssClass) {
        return input.classList.add(cssClass);
      });
    },
    addPoweredBy: function addPoweredBy(input) {
      // Default values
      poweredBy = _extends({
        cssClasses: {},
        template: _defaultTemplates2.default.poweredBy
      }, poweredBy);

      var poweredByCSSClasses = {
        root: (0, _classnames2.default)(bem('powered-by'), poweredBy.cssClasses.root),
        link: (0, _classnames2.default)(bem('powered-by-link'), poweredBy.cssClasses.link)
      };

      var url = 'https://www.algolia.com/?' + 'utm_source=instantsearch.js&' + 'utm_medium=website&' + ('utm_content=' + location.hostname + '&') + 'utm_campaign=poweredby';

      var templateData = {
        cssClasses: poweredByCSSClasses,
        url: url
      };

      var template = poweredBy.template;
      var stringNode = void 0;

      if ((0, _isString2.default)(template)) {
        stringNode = _hogan2.default.compile(template).render(templateData);
      }
      if ((0, _isFunction2.default)(template)) {
        stringNode = template(templateData);
      }

      // Crossbrowser way to create a DOM node from a string. We wrap in
      // a `span` to make sure we have one and only one node.
      var tmpNode = document.createElement('div');
      tmpNode.innerHTML = '<span>' + stringNode.trim() + '</span>';
      var htmlNode = tmpNode.firstChild;

      input.parentNode.insertBefore(htmlNode, input.nextSibling);
    },
    init: function init(_ref2) {
      var state = _ref2.state;
      var helper = _ref2.helper;
      var onHistoryChange = _ref2.onHistoryChange;

      var isInputTargeted = container.tagName === 'INPUT';
      var input = this._input = this.getInput();
      var previousQuery = void 0;

      // Add all the needed attributes and listeners to the input
      this.addDefaultAttributesToInput(input, state.query);

      // always set the query every keystrokes when there's no queryHook
      if (!queryHook) {
        addListener(input, INPUT_EVENT, getInputValueAndCall(setQuery));
      }

      // search on enter
      if (searchOnEnterKeyPressOnly) {
        addListener(input, 'keyup', ifKey(KEY_ENTER, getInputValueAndCall(maybeSearch)));
      } else {
        addListener(input, INPUT_EVENT, getInputValueAndCall(maybeSearch));

        // handle IE8 weirdness where BACKSPACE key will not trigger an input change..
        // can be removed as soon as we remove support for it
        if (INPUT_EVENT === 'propertychange' || window.attachEvent) {
          addListener(input, 'keyup', ifKey(KEY_SUPPRESS, getInputValueAndCall(setQuery)));
          addListener(input, 'keyup', ifKey(KEY_SUPPRESS, getInputValueAndCall(maybeSearch)));
        }
      }

      function maybeSearch(query) {
        if (queryHook) {
          queryHook(query, setQueryAndSearch);
          return;
        }

        search(query);
      }

      function setQuery(query) {
        if (query !== helper.state.query) {
          previousQuery = helper.state.query;
          helper.setQuery(query);
        }
      }

      function search(query) {
        if (previousQuery !== undefined && previousQuery !== query) helper.search();
      }

      function setQueryAndSearch(query) {
        setQuery(query);
        search(query);
      }

      if (isInputTargeted) {
        // To replace the node, we need to create an intermediate node
        var placeholderNode = document.createElement('div');
        input.parentNode.insertBefore(placeholderNode, input);
        var parentNode = input.parentNode;
        var wrappedInput = wrapInput ? this.wrapInput(input) : input;
        parentNode.replaceChild(wrappedInput, placeholderNode);
      } else {
        var _wrappedInput = wrapInput ? this.wrapInput(input) : input;
        container.appendChild(_wrappedInput);
      }

      // Optional "powered by Algolia" widget
      if (poweredBy) {
        this.addPoweredBy(input);
      }

      // Update value when query change outside of the input
      onHistoryChange(function (fullState) {
        input.value = fullState.query || '';
      });

      // When the page is coming from BFCache
      // (https://developer.mozilla.org/en-US/docs/Working_with_BFCache)
      // then we force the input value to be the current query
      // Otherwise, this happens:
      // - <input> autocomplete = off (default)
      // - search $query
      // - navigate away
      // - use back button
      // - input query is empty (because <input> autocomplete = off)
      window.addEventListener('pageshow', function () {
        input.value = helper.state.query;
      });

      if (autofocus === true || autofocus === 'auto' && helper.state.query === '') {
        input.focus();
        input.setSelectionRange(helper.state.query.length, helper.state.query.length);
      }
    },
    render: function render(_ref3) {
      var helper = _ref3.helper;

      // updating the query from the outside using the helper
      // will fall in this case
      // If the input is focused, we do not update it.
      if (document.activeElement === this._input) {
        return;
      }

      if (helper.state.query !== this._input.value) {
        this._input.value = helper.state.query;
      }
    }
  };
}

function addListener(el, type, fn) {
  if (el.addEventListener) {
    el.addEventListener(type, fn);
  } else {
    el.attachEvent('on' + type, fn);
  }
}

function getValue(e) {
  return (e.currentTarget ? e.currentTarget : e.srcElement).value;
}

function ifKey(expectedKeyCode, func) {
  return function (actualEvent) {
    return actualEvent.keyCode === expectedKeyCode && func(actualEvent);
  };
}

function getInputValueAndCall(func) {
  return function (actualEvent) {
    return func(getValue(actualEvent));
  };
}

exports.default = searchBox;