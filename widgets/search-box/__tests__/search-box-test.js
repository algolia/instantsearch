/* eslint-env mocha */

import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import searchBox from '../search-box';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

function createHTMLNodeFromString(string) {
  var parent = document.createElement('div');
  parent.innerHTML = string;
  return parent.firstChild;
}

describe('search-box()', () => {
  jsdom({useEach: true});

  var ReactDOM;
  var container;
  var initialState;
  var helper;
  var widget;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    searchBox.__Rewire__('ReactDOM', ReactDOM);
    initialState = {
      query: ''
    };
    helper = {
      on: sinon.spy(),
      state: {
        query: ''
      }
    };
  });

  context('bad usage', () => {
    it('throws an error if container is not defined', () => {
      expect(() => {
        searchBox({container: null});
      }).toThrow(/Usage: /);
    });
  });

  context('targeting a div', () => {
    beforeEach(() => {
      container = document.createElement('div');
      widget = searchBox({container});
    });

    it('configures nothing', () => {
      expect(widget.getConfiguration).toEqual(undefined);
    });

    it('adds an input inside the div', () => {
      widget.init(initialState, helper);
      var inputs = container.getElementsByTagName('input');
      expect(inputs.length).toEqual(1);
    });

    it('sets default HTML attribute to the input', () => {
      widget.init(initialState, helper);
      var input = container.getElementsByTagName('input')[0];
      expect(input.getAttribute('autocapitalize')).toEqual('off');
      expect(input.getAttribute('autocomplete')).toEqual('off');
      expect(input.getAttribute('autocorrect')).toEqual('off');
      expect(input.getAttribute('class')).toEqual('ais-search-box--input');
      expect(input.getAttribute('placeholder')).toEqual('');
      expect(input.getAttribute('role')).toEqual('textbox');
      expect(input.getAttribute('spellcheck')).toEqual('false');
      expect(input.getAttribute('type')).toEqual('text');
    });
  });

  context('targeting an input', () => {
    it('reuse the existing input', () => {
      container = createHTMLNodeFromString('<input />');
      widget = searchBox({container});
      widget.init(initialState, helper);
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
      widget.init(initialState, helper);
      expect(container.getAttribute('id')).toEqual('foo');
      expect(container.getAttribute('class')).toEqual('my-class ais-search-box--input');
      expect(container.getAttribute('placeholder')).toEqual('Search');
    });
  });

  context('wraps the input in a div', () => {
    it('when targeting a div', () => {
      // Given
      container = document.createElement('div');
      widget = searchBox({container});

      // When
      widget.init(initialState, helper);

      // Then
      var wrapper = container.querySelectorAll('div.ais-search-box')[0];
      var input = container.querySelectorAll('input')[0];

      expect(wrapper.contains(input)).toEqual(true);
      expect(wrapper.getAttribute('class')).toEqual('ais-search-box');
    });

    it('when targeting an input', () => {
      // Given
      container = createHTMLNodeFromString('<input />');
      widget = searchBox({container});

      // When
      widget.init(initialState, helper);

      // Then
      var wrapper = container.parentNode;
      expect(wrapper.getAttribute('class')).toEqual('ais-search-box');
    });

    it('can be disabled with wrapInput:false', () => {
      // Given
      container = document.createElement('div');
      widget = searchBox({container, wrapInput: false});

      // When
      widget.init(initialState, helper);

      // Then
      var wrapper = container.querySelectorAll('div.ais-search-box');
      var input = container.querySelectorAll('input')[0];
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
      widget.init(initialState, helper);
      expect(ReactDOM.render.notCalled).toBe(true);
    });

    it('add the poweredBy if specified', () => {
      widget = searchBox({container, poweredBy: true});
      widget.init(initialState, helper);
      expect(ReactDOM.render.notCalled).toBe(false);
    });
  });

  context('focus', () => {
    var input;
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
        widget.init(initialState, helper);
        // Then
        expect(input.focus.called).toEqual(true);
      });

      it('is not called if search is not empty', () => {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init(initialState, helper);
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
        widget.init(initialState, helper);
        // Then
        expect(input.focus.called).toEqual(true);
      });

      it('is called if search is not empty', () => {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init(initialState, helper);
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
        widget.init(initialState, helper);
        // Then
        expect(input.focus.called).toEqual(false);
      });

      it('is not called if search is not empty', () => {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init(initialState, helper);
        // Then
        expect(input.focus.called).toEqual(false);
      });
    });
  });

  afterEach(() => {
    searchBox.__ResetDependency__('ReactDOM');
  });
});

