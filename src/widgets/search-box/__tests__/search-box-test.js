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
      const button = container.querySelectorAll('button[type="reset"]');
      expect(button).toHaveLength(1);
    });

    it('add a submit inside the div', () => {
      widget = searchBox(opts);
      widget.init({ state, helper, onHistoryChange });
      const submit = container.querySelectorAll('button[type="submit"]');
      expect(submit).toHaveLength(1);
    });

    it('sets default HTML attribute to the input', () => {
      widget = searchBox(opts);
      widget.init({ state, helper, onHistoryChange });
      const input = container.getElementsByTagName('input')[0];
      expect(input.getAttribute('autocapitalize')).toEqual('off');
      expect(input.getAttribute('autocomplete')).toEqual('off');
      expect(input.getAttribute('autocorrect')).toEqual('off');
      expect(input.getAttribute('class')).toEqual('ais-SearchBox-input');
      expect(input.getAttribute('placeholder')).toEqual('');
      expect(input.getAttribute('role')).toEqual('textbox');
      expect(input.getAttribute('spellcheck')).toEqual('false');
      expect(input.getAttribute('type')).toEqual('text');
    });

    it('supports cssClasses option', () => {
      opts.cssClasses = {
        root: ['root', 'customRoot'],
        form: 'form',
        input: 'input',
        reset: 'reset',
        resetIcon: 'resetIcon',
        loadingIndicator: 'loadingIndicator',
        loadingIcon: 'loadingIcon',
        submit: 'submit',
      };

      widget = searchBox(opts);
      widget.init({ state, helper, onHistoryChange });

      expect(container.querySelector('.ais-SearchBox').classList).toContain(
        'root'
      );
      expect(container.querySelector('.ais-SearchBox').classList).toContain(
        'customRoot'
      );
      expect(
        container.querySelector('.ais-SearchBox-form').classList
      ).toContain('form');
      expect(
        container.querySelector('.ais-SearchBox-input').classList
      ).toContain('input');
      expect(
        container.querySelector('.ais-SearchBox-reset').classList
      ).toContain('reset');
      expect(
        container.querySelector('.ais-SearchBox-resetIcon').classList
      ).toContain('resetIcon');
      expect(
        container.querySelector('.ais-SearchBox-submit').classList
      ).toContain('submit');
      expect(
        container.querySelector('.ais-SearchBox-loadingIndicator').classList
      ).toContain('loadingIndicator');
      expect(
        container.querySelector('.ais-SearchBox-loadingIcon').classList
      ).toContain('loadingIcon');
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
      const wrapper = container.querySelector('.ais-SearchBox');
      const input = container.querySelector('.ais-SearchBox-input');

      expect(wrapper.contains(input)).toEqual(true);
    });
  });

  describe('reset', () => {
    let defaultInitOptions;
    let defaultWidgetOptions;

    beforeEach(() => {
      container = document.createElement('div');
      defaultWidgetOptions = { container };
      defaultInitOptions = { state, helper, onHistoryChange };
    });

    it('should be hidden when there is no query', () => {
      // Given
      widget = searchBox(defaultWidgetOptions);

      // When
      widget.init(defaultInitOptions);

      // Then
      const element = container.querySelector('.ais-SearchBox-reset');
      expect(element.hasAttribute('hidden')).toBe(true);
    });

    it('should be shown when there is a query', () => {
      // Given
      widget = searchBox(defaultWidgetOptions);

      // When
      widget.init(defaultInitOptions);
      simulateInputEvent('test', 'tes', widget, helper, state, container);

      // Then
      const element = container.querySelector('.ais-SearchBox-reset');
      expect(element.getAttribute('hidden')).toBe('');
    });

    it('should clear the query', () => {
      // Given
      widget = searchBox(defaultWidgetOptions);
      widget.init(defaultInitOptions);
      simulateInputEvent('test', 'tes', widget, helper, state, container);

      const element = container.querySelector('.ais-SearchBox-reset');
      // When
      element.click();

      // Then
      expect(helper.setQuery).toHaveBeenCalled();
      expect(helper.search).toHaveBeenCalled();
      expect(document.activeElement).toBe(container.querySelector('input'));
    });

    it('should let the user define its own string template', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        templates: {
          reset: '<button type="reset">Foobar</button>',
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
        showReset: false,
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      expect(document.querySelectorAll('ais-SearchBox-reset')).toHaveLength(0);
    });
  });

  describe('submit', () => {
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
        templates: { submit: '<div>Foobar</button>' },
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      expect(container.innerHTML).toContain('Foobar');
    });

    it('should not be present if showSubmit is `false`', () => {
      // Given
      widget = searchBox({
        ...defaultWidgetOptions,
        showSubmit: false,
      });

      // When
      widget.init(defaultInitOptions);

      // Then
      expect(
        container.querySelectorAll('.ais-search-box--submit')
      ).toHaveLength(0);
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
        widget = searchBox({ container, searchAsYouType: false });
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

        const e2 = new window.Event('submit');
        input.parentElement.dispatchEvent(e2);

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

  describe('markup', () => {
    it('renders correctly', () => {
      container = document.createElement('div');
      widget = searchBox({ container });

      widget.init({ state, helper, onHistoryChange });

      const wrapper = container.querySelector('.ais-SearchBox');

      expect(wrapper).toMatchSnapshot();
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
  _state,
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
