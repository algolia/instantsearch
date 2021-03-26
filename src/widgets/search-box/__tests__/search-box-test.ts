import { render } from 'preact';
import searchBox from '../search-box';
import algoliaSearchHelper, { AlgoliaSearchHelper } from 'algoliasearch-helper';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';

const mockedRender = render as jest.Mock;

jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('searchBox()', () => {
  let helper: AlgoliaSearchHelper;

  beforeEach(() => {
    mockedRender.mockClear();

    helper = algoliaSearchHelper(createSearchClient(), '', { query: '' });
  });

  describe('Usage', () => {
    it('throws without container', () => {
      expect(() => {
        searchBox({
          // @ts-expect-error
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

      widget.init!(createInitOptions({ helper }));

      const [firstRender] = mockedRender.mock.calls;

      expect(mockedRender).toHaveBeenCalledTimes(1);
      expect(firstRender[0].props).toMatchSnapshot();
    });

    test('renders during render()', () => {
      const container = document.createElement('div');
      const widget = searchBox({ container });

      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper }));

      const [firstRender, secondRender] = mockedRender.mock.calls;

      expect(mockedRender).toHaveBeenCalledTimes(2);
      expect(firstRender[0].props).toMatchSnapshot();
      expect(firstRender[1]).toEqual(container);
      expect(secondRender[0].props).toMatchSnapshot();
      expect(secondRender[1]).toEqual(container);
    });

    test('sets the correct CSS classes', () => {
      const widget = searchBox({
        container: document.createElement('div'),
      });

      widget.init!(createInitOptions({ helper }));

      const [firstRender] = mockedRender.mock.calls;

      expect(firstRender[0].props.cssClasses).toMatchSnapshot();
    });

    test('sets isSearchStalled', () => {
      const widget = searchBox({ container: document.createElement('div') });

      widget.init!(createInitOptions({ helper }));
      widget.render!(
        createRenderOptions({
          helper,
          searchMetadata: { isSearchStalled: true },
        })
      );

      const [, secondRender] = mockedRender.mock.calls;

      expect(secondRender[0].props.isSearchStalled).toBe(true);
    });
  });
});
