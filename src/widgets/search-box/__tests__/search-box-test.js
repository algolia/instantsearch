import searchBox from '../search-box';
import EventEmitter from 'events';

const onHistoryChange = () => {};

describe('searchBox()', () => {
  let container;
  let state;
  let helper;
  let widget;

  beforeEach(() => {
    state = {
      query: '',
    };
    helper = {
      setQuery: jest.fn(),
      search: jest.fn(),
      state: {
        query: '',
      },
      ...EventEmitter.prototype,
    };
  });

  describe('bad usage', () => {
    it('throws an error if container is not defined', () => {
      expect(() => {
        searchBox({ container: null });
      }).toThrow(/Usage:/);
    });
  });

  describe('targeting a div', () => {
    let opts;

    beforeEach(() => {
      container = document.createElement('div');
      opts = { container };
    });

    it('adds an input inside the div', () => {
      widget = searchBox(opts);
      widget.init({ state, helper, onHistoryChange });
      const inputs = container.getElementsByTagName('input');
      expect(inputs).toHaveLength(1);
    });

    it('add a reset button inside the div', () => {
      widget = searchBox(opts);
      widget.init({ state, helper, onHistoryChange });
      const button = container.getElementsByTagName('button');
      expect(button).toHaveLength(1);
    });

    it('add a magnifier inside the div', () => {
      widget = searchBox(opts);
      widget.init({ state, helper, onHistoryChange });
      const magnifier = container.getElementsByClassName(
        'ais-search-box--magnifier'
      );
      expect(magnifier).toHaveLength(1);
    });

    it('sets default HTML attribute to the input', () => {
      widget = searchBox(opts);
      widget.init({ state, helper, onHistoryChange });
      const input = container.getElementsByTagName('input')[0];
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
        input: 'input-class',
      };

      widget = searchBox(opts);
      widget.init({ state, helper, onHistoryChange });
      const actualRootClasses = container
        .querySelector('input')
        .parentNode.getAttribute('class');
      const actualInputClasses = container
        .querySelector('input')
        .getAttribute('class');
      const expectedRootClasses = 'ais-search-box root-class cx';
      const expectedInputClasses = 'ais-search-box--input input-class';

      expect(actualRootClasses).toEqual(expectedRootClasses);
      expect(actualInputClasses).toEqual(expectedInputClasses);
    });
  });

  describe('wraps the input in a div', () => {
    it('when targeting a div', () => {
      // Given
      container = document.createElement('div');
      widget = searchBox({ container });

      // When
      widget.init({ state, helper, onHistoryChange });

      // Then
      const wrapper = container.querySelectorAll('div.ais-search-box')[0];
      const input = container.querySelectorAll('input')[0];

      expect(wrapper.contains(input)).toEqual(true);
      expect(wrapper.getAttribute('class')).toEqual('ais-search-box');
    });
  });

  describe('reset', () => {
    let defaultInitOptions;
    let defaultWidgetOptions;
    let $;

    beforeEach(() => {
      container = document.createElement('div');
      $ = container.querySelectorAll.bind(container);
      defaultWidgetOptions = { container };
      defaultInitOptions = { state, helper, onHistoryChange };
    });

    it('should be hidden when there is no query', () => {
      // Given
      widget = searchBox(defaultWidgetOptions);

      // When
      widget.init(defaultInitOptions);

      // Then
      expect($('.ais-search-box--reset-wrapper')[0].style.display).toBe('none');
    });

    it('should be shown when there is a query', () => {
      // Given
      widget = searchBox(defaultWidgetOptions);

      // When
      widget.init(defaultInitOptions);
      simulateInputEvent('test', 'tes', widget, helper, state, container);

      // Then
      expect($('.ais-search-box--reset-wrapper')[0].style.display).toBe(
        'block'
      );
    });

    it('should clear the query', () => {
      // Given
      widget = searchBox(defaultWidgetOptions);
      widget.init(defaultInitOptions);
      simulateInputEvent('test', 'tes', widget, helper, state, container);

      // When
      $('.ais-search-box--reset-wrapper')[0].click();

      // Then
      expect(helper.setQuery).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
    });

    it('should let the user define its own string template', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        reset: {
          template: '<button type="reset">Foobar</button>',
        },
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      expect(container.innerHTML).toContain('Foobar');
    });

    it('should not exist when it is disabled', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        reset: false,
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      expect($('.ais-search-box--reset-wrapper')).toHaveLength(0);
    });
  });

  describe('magnifier', () => {
    let defaultInitOptions;
    let defaultWidgetOptions;

    beforeEach(() => {
      container = document.createElement('div');
      defaultWidgetOptions = { container };
      defaultInitOptions = { state, helper, onHistoryChange };
    });

    it('should let the user define its own string template', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        magnifier: {
          template: '<div>Foobar</button>',
        },
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      expect(container.innerHTML).toContain('Foobar');
    });
  });

  describe('keyup', () => {
    beforeEach(() => {
      container = document.body.appendChild(document.createElement('div'));
    });

    describe('instant search', () => {
      beforeEach(() => {
        widget = searchBox({ container });
      });

      it('do not perform the search on keyup event (should be done by input event)', () => {
        simulateKeyUpEvent({}, widget, helper, state, container);
        expect(helper.search).not.toHaveBeenCalled();
      });
    });

    describe('non-instant search', () => {
      beforeEach(() => {
        widget = searchBox({ container, searchOnEnterKeyPressOnly: true });
        helper.state.query = 'tes';
        widget.init({ state: helper.state, helper, onHistoryChange });
      });

      it('performs the search on keyup if <ENTER>', () => {
        // simulateInputEvent('test', 'tes', widget, helper, state, container);
        // simulateKeyUpEvent({keyCode: 13}, widget, helper, state, container);
        const input = container.querySelector('input');
        input.value = 'test';
        const e1 = new window.Event('input');
        input.dispatchEvent(e1);

        expect(helper.setQuery).toHaveBeenCalledTimes(1);
        expect(helper.search).toHaveBeenCalledTimes(0);

        // setQuery is mocked and does not apply the modification of the helper
        // we have to set it ourselves
        helper.state.query = input.value;

        const e2 = new window.Event('keyup', { keyCode: 13 });
        Object.defineProperty(e2, 'keyCode', { get: () => 13 });
        input.dispatchEvent(e2);

        expect(helper.setQuery).toHaveBeenCalledTimes(1);
        expect(helper.search).toHaveBeenCalledTimes(1);
      });

      it("doesn't perform the search on keyup if not <ENTER>", () => {
        const input = container.querySelector('input');
        input.value = 'test';
        const event = new window.Event('keyup', { keyCode: 42 });
        Object.defineProperty(event, 'keyCode', { get: () => 42 });
        input.dispatchEvent(event);

        expect(helper.setQuery).toHaveBeenCalledTimes(0);
        expect(helper.search).toHaveBeenCalledTimes(0);
      });
    });
  });

  it('updates the input on history update', () => {
    let cb;
    container = document.body.appendChild(document.createElement('div'));
    widget = searchBox({ container });
    widget.init({
      state,
      helper,
      onHistoryChange: fn => {
        cb = fn;
      },
    });
    const input = container.querySelector('input');
    expect(input.value).toBe('');
    input.blur();
    cb({ query: 'iphone' });
    expect(input.value).toBe('iphone');
  });

  it('handles external updates', () => {
    container = document.body.appendChild(document.createElement('div'));
    widget = searchBox({ container });
    widget.init({ state, helper, onHistoryChange });
    const input = container.querySelector('input');
    input.blur();
    widget.render({
      helper: { state: { query: 'new value' } },
      searchMetadata: { isSearchStalled: false },
    });
    expect(input.value).toBe('new value');
  });

  describe('autofocus', () => {
    beforeEach(() => {
      container = document.body.appendChild(document.createElement('div'));
    });

    describe('when auto', () => {
      beforeEach(() => {
        widget = searchBox({ container, autofocus: 'auto' });
      });

      it('is called if search is empty', () => {
        // Given
        helper.state.query = '';
        // When
        widget.init({ state, helper, onHistoryChange });
        // Then
        expect(document.activeElement).toBe(container.querySelector('input'));
      });

      it('is not called if search is not empty', () => {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({ state, helper, onHistoryChange });
        // Then
        expect(document.activeElement).not.toBe(
          container.querySelector('input')
        );
      });
    });

    describe('when true', () => {
      beforeEach(() => {
        widget = searchBox({ container, autofocus: true });
      });

      it('is called if search is empty', () => {
        // Given
        helper.state.query = '';
        // When
        widget.init({ state, helper, onHistoryChange });
        // Then
        expect(document.activeElement).toBe(container.querySelector('input'));
      });

      it('is called if search is not empty', () => {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({ state, helper, onHistoryChange });
        // Then
        expect(document.activeElement).toBe(container.querySelector('input'));
      });

      it('forces cursor to be at the end of the query', () => {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({ state, helper, onHistoryChange });
        // Then
        expect(container.querySelector('input').selectionStart).toEqual(3);
        expect(container.querySelector('input').selectionEnd).toEqual(3);
      });
    });

    describe('when false', () => {
      beforeEach(() => {
        widget = searchBox({ container, autofocus: false });
      });

      it('is not called if search is empty', () => {
        // Given
        helper.state.query = '';
        // When
        widget.init({ state, helper, onHistoryChange });
        // Then
        expect(document.activeElement).not.toBe(
          container.querySelector('input')
        );
      });

      it('is not called if search is not empty', () => {
        // Given
        helper.state.query = 'foo';
        // When
        widget.init({ state, helper, onHistoryChange });
        // Then
        expect(document.activeElement).not.toBe(
          container.querySelector('input')
        );
      });
    });
  });
});

function simulateKeyUpEvent(args, widget, helper, state, container) {
  // Given
  helper.state.query = 'foo';
  // When
  widget.init({ state, helper, onHistoryChange });
  // Then
  const event = new window.Event('keyup', args);
  Object.defineProperty(event, 'keyCode', { get: () => args.keyCode });
  container.dispatchEvent(event);
}

// eslint-disable-next-line max-params
function simulateInputEvent(
  query,
  stateQuery,
  widget,
  helper,
  state,
  container
) {
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
  widget.init({ state: helper.state, helper, onHistoryChange });

  // Then
  container.value = query;
  const event = new window.Event('input');
  container.dispatchEvent(event);
}
