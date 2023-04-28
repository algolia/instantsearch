import type {
  PlainSearchParameters,
  SearchParameters,
} from 'algoliasearch-helper';
import algoliasearchHelper from 'algoliasearch-helper';
import type { ConnectedProps } from '../core/createConnector';
import createConnector from '../core/createConnector';
import {
  omit,
  getObjectType,
  getPropertyByPath,
  removeEmptyKey,
  removeEmptyArraysFromObject,
} from '../core/utils';
import {
  refineValue,
  getIndexId,
  hasMultipleIndices,
  // @ts-ignore
} from '../core/indexUtils';

type Hit = any;

export type MatchingPatterns = {
  [attribute: string]: {
    /**
     * The score of the optional filter.
     *
     * @see https://www.algolia.com/doc/guides/managing-results/rules/merchandising-and-promoting/in-depth/optional-filters/
     */
    score: number;
  };
};

interface ConfigureRelatedItemsProps {
  /**
   * The reference hit to extract the filters from.
   */
  hit: Hit;
  /**
   * The schema to create the optional filters.
   * Each key represents an attribute from the hit.
   */
  matchingPatterns: MatchingPatterns;
  /**
   * Function to transform the generated search parameters.
   */
  transformSearchParameters?: (
    searchParameters: SearchParameters
  ) => PlainSearchParameters;
}

function createOptionalFilter({
  attributeName,
  attributeValue,
  attributeScore,
}: {
  attributeName: string;
  attributeValue: string;
  attributeScore: number;
}) {
  return `${attributeName}:${attributeValue}<score=${attributeScore || 1}>`;
}

const defaultProps: Partial<ConfigureRelatedItemsProps> = {
  transformSearchParameters: (x) => ({ ...x }),
};

function getId(): string {
  // We store the search state of this widget in `configure`.
  return 'configure';
}

type InternalConfigureRelatedItemsProps = ConfigureRelatedItemsProps &
  Required<typeof defaultProps>;

function getSearchParametersFromProps(
  props: ConnectedProps<InternalConfigureRelatedItemsProps>
): PlainSearchParameters {
  const optionalFilters = Object.keys(props.matchingPatterns).reduce<
    Array<string | string[]>
  >((acc, attributeName) => {
    const attributePattern = props.matchingPatterns[attributeName];
    const attributeValue = getPropertyByPath(props.hit, attributeName);
    const attributeScore = attributePattern.score;

    if (Array.isArray(attributeValue)) {
      return [
        ...acc,
        attributeValue.map((attributeSubValue) => {
          return createOptionalFilter({
            attributeName,
            attributeValue: attributeSubValue,
            attributeScore,
          });
        }),
      ];
    }

    if (typeof attributeValue === 'string') {
      return [
        ...acc,
        createOptionalFilter({
          attributeName,
          attributeValue,
          attributeScore,
        }),
      ];
    }

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        `The \`matchingPatterns\` option returned a value of type ${getObjectType(
          attributeValue
        )} for the "${attributeName}" key. This value was not sent to Algolia because \`optionalFilters\` only supports strings and array of strings.

You can remove the "${attributeName}" key from the \`matchingPatterns\` option.

See https://www.algolia.com/doc/api-reference/api-parameters/optionalFilters/`
      );
    }

    return acc;
  }, []);

  return props.transformSearchParameters(
    new algoliasearchHelper.SearchParameters({
      // @ts-ignore @TODO algoliasearch-helper@3.0.1 will contain the type
      // `sumOrFiltersScores`.
      // See https://github.com/algolia/algoliasearch-helper-js/pull/753
      sumOrFiltersScores: true,
      facetFilters: [`objectID:-${props.hit.objectID}`],
      optionalFilters,
    })
  );
}

interface ConnectorState {
  _searchParameters: PlainSearchParameters;
}

export default createConnector({
  displayName: 'AlgoliaConfigureRelatedItems',
  $$type: 'ais.configureRelatedItems',

  defaultProps,

  getProvidedProps() {
    return {};
  },

  getSearchParameters(
    searchParameters: SearchParameters,
    props: ConnectedProps<InternalConfigureRelatedItemsProps>
  ) {
    return searchParameters.setQueryParameters(
      getSearchParametersFromProps(props)
    );
  },

  transitionState(
    this: ConnectorState,
    props,
    _prevSearchState,
    nextSearchState
  ) {
    const id = getId();
    // We need to transform the exhaustive search parameters back to clean
    // search parameters without the empty default keys so we don't pollute the
    // `configure` search state.
    const searchParameters = removeEmptyArraysFromObject(
      removeEmptyKey(getSearchParametersFromProps(props))
    );

    const searchParametersKeys = Object.keys(searchParameters);
    const nonPresentKeys = this._searchParameters
      ? Object.keys(this._searchParameters).filter(
          (prop) => searchParametersKeys.indexOf(prop) === -1
        )
      : [];
    this._searchParameters = searchParameters;
    const nextValue: any = {
      [id]: {
        ...omit(nextSearchState[id], nonPresentKeys),
        ...searchParameters,
      },
    };

    return refineValue(nextSearchState, nextValue, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
  },

  cleanUp(this: ConnectorState, props, searchState) {
    const id = getId();
    const indexId = getIndexId({
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });

    const subState =
      hasMultipleIndices({
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      }) && searchState.indices
        ? searchState.indices[indexId]
        : searchState;

    const configureKeys =
      subState && subState[id] ? Object.keys(subState[id]) : [];

    const configureState = (
      configureKeys as Array<keyof PlainSearchParameters>
    ).reduce((acc, item) => {
      if (!this._searchParameters[item]) {
        (acc as any)[item] = subState[id][item];
      }

      return acc;
    }, {} as PlainSearchParameters);

    const nextValue = { [id]: configureState };

    return refineValue(searchState, nextValue, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
  },
});
