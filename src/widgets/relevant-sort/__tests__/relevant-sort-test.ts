import { render } from 'preact';
import relevantSort from '../relevant-sort';
import algoliasearchHelper, { SearchResults } from 'algoliasearch-helper';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

const templates = {
  text: '',
  button: ({ isRelevantSorted }) => {
    return isRelevantSorted ? 'See all results' : 'See relevant results';
  },
};

describe('relevantSort', () => {
  beforeEach(() => {
    (render as jest.Mock).mockReset();
  });

  describe('Usage', () => {
    it('throws without container', () => {
      expect(() => {
        // @ts-ignore wrong options
        relevantSort({ container: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/relevant-sort/js/"
`);
    });
  });

  it('render', () => {
    const helper = algoliasearchHelper(createSearchClient(), '', {});
    const widget = relevantSort({
      container: document.createElement('div'),
      cssClasses: {
        root: 'my-RelevantSort',
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
        cssClasses: {
          root: 'ais-RelevantSort my-RelevantSort',
          text: 'ais-RelevantSort-text',
          button: 'ais-RelevantSort-button',
        },
        isRelevantSorted: true,
        isVirtualReplica: true,
        refine: expect.any(Function),
        templates,
      })
    );
  });
});
