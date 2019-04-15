import { render } from 'preact-compat';
import voiceSearch from '../voice-search';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');
  module.render = jest.fn();
  return module;
});

function defaultSetup(opts = {}) {
  const container = document.createElement('div');
  const widget = voiceSearch({ container, ...opts });
  const init = helper => {
    if (!widget.init) {
      throw new Error('VoiceSearch widget has no init method.');
    }
    widget.init({
      helper,
      instantSearchInstance: {},
      state: {},
      templatesConfig: {},
      createURL: () => '',
    });
  };
  const render = helper => {
    if (!widget.render) {
      throw new Error('VoiceSearch widget has no render method.');
    }
    widget.render({
      helper,
      instantSearchInstance: {},
      templatesConfig: {},
      results: {},
      state: {},
      searchMetadata: {
        isSearchStalled: false,
      },
      createURL: () => '',
    });
  };

  return { container, widget, init, render };
}

describe('voiceSearch()', () => {
  let helper;

  beforeEach(() => {
    render.mockClear();

    helper = {
      setQuery: jest.fn(),
      search: jest.fn(),
      state: {
        query: '',
      },
    };
  });

  describe('Usage', () => {
    it('throws without container', () => {
      expect(() => {
        voiceSearch({
          // @ts-ignore
          container: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/voice-search/js/"
`);
    });
  });

  describe('Rendering', () => {
    test('renders during init()', () => {
      const { init } = defaultSetup();
      init(helper);

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0]).toMatchSnapshot();
    });

    test('renders during render()', () => {
      const { container, init, render: widgetRender } = defaultSetup();
      init(helper);
      widgetRender(helper);

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[0][0]).toMatchSnapshot();
      expect(render.mock.calls[0][1]).toEqual(container);
      expect(render.mock.calls[1][0]).toMatchSnapshot();
      expect(render.mock.calls[1][1]).toEqual(container);
    });

    test('sets the correct CSS classes', () => {
      const { init } = defaultSetup();

      init(helper);

      expect(render.mock.calls[0][0].props.cssClasses).toMatchSnapshot();
    });
  });
});
