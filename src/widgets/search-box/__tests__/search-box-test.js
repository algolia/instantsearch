import { render } from 'preact';
import searchBox from '../search-box';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

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

      const [firstRender] = render.mock.calls;

      expect(render).toHaveBeenCalledTimes(1);
      expect(firstRender[0].props).toMatchSnapshot();
    });

    test('renders during render()', () => {
      const container = document.createElement('div');
      const widget = searchBox({ container });

      widget.init({ helper });
      widget.render({ helper, searchMetadata: { isSearchStalled: false } });

      const [firstRender, secondRender] = render.mock.calls;

      expect(render).toHaveBeenCalledTimes(2);
      expect(firstRender[0].props).toMatchSnapshot();
      expect(firstRender[1]).toEqual(container);
      expect(secondRender[0].props).toMatchSnapshot();
      expect(secondRender[1]).toEqual(container);
    });

    test('sets the correct CSS classes', () => {
      const widget = searchBox({
        container: document.createElement('div'),
      });

      widget.init({ helper });

      const [firstRender] = render.mock.calls;

      expect(firstRender[0].props.cssClasses).toMatchSnapshot();
    });

    test('sets isSearchStalled', () => {
      const widget = searchBox({ container: document.createElement('div') });

      widget.init({ helper });
      widget.render({ helper, searchMetadata: { isSearchStalled: true } });

      const [, secondRender] = render.mock.calls;

      expect(secondRender[0].props.isSearchStalled).toBe(true);
    });
  });
});
