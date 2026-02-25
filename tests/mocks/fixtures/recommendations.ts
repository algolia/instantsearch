import {
  createRecommendResponse,
  createSingleSearchResponse,
} from '../createAPIResponse';
import { createSearchClient } from '../createSearchClient';

type Options = {
  /**
   * Returns only the `objectID` attribute of the hits when `true`.
   *
   * @default false
   */
  minimal?: boolean;
  /**
   * The fixture to use for the recommendations.
   *
   * @default defaultFixture
   */
  fixture?: any[];
};

const defaultFixture = [
  {
    _highlightResult: {
      name: {
        matchLevel: 'none' as const,
        matchedWords: [],
        value: '<em>Moschino Love</em> – Shoulder bag',
      },
    },
    name: 'Moschino Love – Shoulder bag',
    objectID: '1',
  },
  {
    _highlightResult: {
      name: {
        matchLevel: 'none' as const,
        matchedWords: [],
        value: '<em>Bag</em> “Sabrina“ medium Gabs',
      },
    },
    name: 'Bag “Sabrina“ medium Gabs',
    objectID: '2',
  },
];

export function createRecommendSearchClient(options: Options = {}) {
  const { minimal = false, fixture = defaultFixture } = options;
  return createSearchClient({
    getRecommendations: jest.fn((requests) =>
      Promise.resolve(
        createRecommendResponse(
          // @ts-ignore
          // `request` will be implicitly typed as any in type-check:v3
          // since `getRecommendations` is not available there
          requests.map((request) => {
            return createSingleSearchResponse({
              hits: fixture
                .slice(
                  0,
                  typeof request.maxRecommendations === 'number'
                    ? Math.min(request.maxRecommendations, fixture.length)
                    : fixture.length
                )
                .map((hit) => (minimal ? { objectID: hit.objectID } : hit)),
            });
          })
        )
      )
    ),
  });
}
