import { render } from 'preact-compat';
import searchBox from '../search-box';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();

  return module;
});

describe('searchBox()', () => {
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
        searchBox({
          container: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/search-box/js/"
`);
    });
  });

  describe('Rendering', () => {
    test('renders during init()', () => {
      const widget = searchBox({ container: document.createElement('div') });

      widget.init({ helper });

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0]).toMatchSnapshot();
    });

    test('renders during render()', () => {
      const container = document.createElement('div');
      const widget = searchBox({ container });

      widget.init({ helper });
      widget.render({ helper, searchMetadata: { isSearchStalled: false } });

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[0][0]).toMatchSnapshot();
      expect(render.mock.calls[0][1]).toEqual(container);
      expect(render.mock.calls[1][0]).toMatchSnapshot();
      expect(render.mock.calls[1][1]).toEqual(container);
    });

    test('sets the correct CSS classes', () => {
      const widget = searchBox({
        container: document.createElement('div'),
      });

      widget.init({ helper });

      expect(render.mock.calls[0][0].props.cssClasses).toMatchSnapshot();
    });

    test('sets isSearchStalled', () => {
      const widget = searchBox({ container: document.createElement('div') });

      widget.init({ helper });
      widget.render({ helper, searchMetadata: { isSearchStalled: true } });

      expect(render.mock.calls[1][0].props.isSearchStalled).toBe(true);
    });
  });
});
