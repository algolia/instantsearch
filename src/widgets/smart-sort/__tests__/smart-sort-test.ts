import { render } from 'preact';
import smartSort from '../smart-sort';
import algoliasearchHelper, { SearchResults } from 'algoliasearch-helper';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

const templates = {
  text: ({ isSmartSorted }) => {
    return isSmartSorted ? 'See all results' : 'See relevant results';
  },
};

describe('smartSort', () => {
  beforeEach(() => {
    (render as jest.Mock).mockReset();
  });

  describe('Usage', () => {
    it('throws without container', () => {
      expect(() => {
        // @ts-ignore wrong options
        smartSort({ container: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/smart-sort/js/"
`);
    });
  });

  it('render', () => {
    const helper = algoliasearchHelper(createSearchClient(), '', {});
    const widget = smartSort({
      container: document.createElement('div'),
      cssClasses: {
        root: 'my-SmartSort',
      },
      templates,
    });
    widget.init!(createInitOptions({ helper, state: helper.state }));

    const results = {
      nbHits: 20,
      nbSortedHits: 14,
      appliedRelevancyStrictness: 70,
    };

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(results),
        ]),
      })
    );
    const [, secondRender] = (render as jest.Mock).mock.calls;

    expect(render).toHaveBeenCalledTimes(2);
    expect(secondRender[0].props).toEqual(
      expect.objectContaining({
        cssClasses: { root: 'ais-SmartSort my-SmartSort' },
        isSmartSorted: true,
        refine: expect.any(Function),
        relevancyStrictness: undefined,
        templates,
      })
    );
  });

  it('pass relevancyStrictness', () => {
    const helper = algoliasearchHelper(createSearchClient(), '', {});
    const widget = smartSort({
      container: document.createElement('div'),
      relevancyStrictness: 20,
      templates,
    });
    widget.init!(createInitOptions({ helper, state: helper.state }));

    const [firstRender] = (render as jest.Mock).mock.calls;
    expect(render).toHaveBeenCalledTimes(1);
    expect(firstRender[0].props).toEqual(
      expect.objectContaining({
        relevancyStrictness: 20,
      })
    );
  });
});
