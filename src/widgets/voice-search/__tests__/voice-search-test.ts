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
  return { container, widget };
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
      const { widget } = defaultSetup();

      widget.init({ helper, instantSearchInstance: {} });

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0]).toMatchSnapshot();
    });

    test('renders during render()', () => {
      const { container, widget } = defaultSetup();

      widget.init({ helper, instantSearchInstance: {} });
      widget.render({ helper, instantSearchInstance: {} });

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[0][0]).toMatchSnapshot();
      expect(render.mock.calls[0][1]).toEqual(container);
      expect(render.mock.calls[1][0]).toMatchSnapshot();
      expect(render.mock.calls[1][1]).toEqual(container);
    });

    test('sets the correct CSS classes', () => {
      const { widget } = defaultSetup();

      widget.init({ helper, instantSearchInstance: {} });

      expect(render.mock.calls[0][0].props.cssClasses).toMatchSnapshot();
    });

    test('sets searchAsYouSpeak', () => {
      const { widget } = defaultSetup({ searchAsYouSpeak: true });

      widget.init({ helper, instantSearchInstance: {} });
      widget.render({ helper, instantSearchInstance: {} });
      expect(render.mock.calls[1][0].props.searchAsYouSpeak).toBe(true);
    });
  });
});
