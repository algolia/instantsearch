import algoliasearchHelper, {
  SearchParameters,
  PlainSearchParameters,
} from 'algoliasearch-helper';
import { Unmounter, WidgetFactory, AlgoliaHit } from '../../types';
import {
  createDocumentationMessageGenerator,
  getObjectType,
  warning,
} from '../../lib/utils';
import connectConfigure, {
  ConfigureRenderer,
  ConfigureConnectorParams,
} from '../configure/connectConfigure';

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

export interface ConfigureRelatedItemsConnectorParams {
  /**
   * The reference hit to extract the filters from.
   */
  hit: AlgoliaHit;
  /**
   * The schema to create the optional filters.
   * Each key represents an attribute from the hit.
   */
  matchingPatterns: MatchingPatterns;
  /**
   * Function to transform the generated search parameters.
   */
  transformSearchParameters?(
    searchParameters: SearchParameters
  ): PlainSearchParameters;
}

export type ConfigureRelatedItemsWidgetFactory<
  TConfigureRelatedItemsWidgetParams
> = WidgetFactory<
  ConfigureRelatedItemsConnectorParams & TConfigureRelatedItemsWidgetParams
>;

type ConfigureRelatedItemsConnector = <TConfigureRelatedItemsWidgetParams>(
  render?: ConfigureRenderer<ConfigureConnectorParams>,
  unmount?: Unmounter
) => ConfigureRelatedItemsWidgetFactory<TConfigureRelatedItemsWidgetParams>;

const withUsage = createDocumentationMessageGenerator({
  name: 'configure-related-items',
  connector: true,
});

function createOptionalFilter({
  attributeName,
  attributeValue,
  attributeScore,
}) {
  return `${attributeName}:${attributeValue}<score=${attributeScore || 1}>`;
}

const connectConfigureRelatedItems: ConfigureRelatedItemsConnector = (
  renderFn,
  unmountFn
) => {
  return widgetParams => {
    const { hit, matchingPatterns, transformSearchParameters = x => x } =
      widgetParams || ({} as typeof widgetParams);

    if (!hit) {
      throw new Error(withUsage('The `hit` option is required.'));
    }

    if (!matchingPatterns) {
      throw new Error(withUsage('The `matchingPatterns` option is required.'));
    }

    const optionalFilters = Object.keys(matchingPatterns).reduce<
      Array<string | string[]>
    >((acc, attributeName) => {
      const attribute = matchingPatterns[attributeName];
      const attributeValue = hit[attributeName];
      const attributeScore = attribute.score;

      if (Array.isArray(attributeValue)) {
        return [
          ...acc,
          attributeValue.map(attributeSubValue => {
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

      warning(
        false,
        `
The \`matchingPatterns\` option returned a value of type ${getObjectType(
          attributeValue
        )} for the "${attributeName}" key. This value was not sent to Algolia because \`optionalFilters\` only supports strings and array of strings.

You can remove the "${attributeName}" key from the \`matchingPatterns\` option.

See https://www.algolia.com/doc/api-reference/api-parameters/optionalFilters/
            `
      );

      return acc;
    }, []);

    const searchParameters: PlainSearchParameters = {
      ...transformSearchParameters(
        new algoliasearchHelper.SearchParameters({
          // @ts-ignore @TODO algoliasearch-helper@3.0.1 will contain the type
          // `sumOrFiltersScores`.
          // See https://github.com/algolia/algoliasearch-helper-js/pull/753
          sumOrFiltersScores: true,
          facetFilters: [`objectID:-${hit.objectID}`],
          // @ts-ignore @TODO algoliasearch-helper@3.0.1 will contain the type
          // `optionalFilters`.
          // See https://github.com/algolia/algoliasearch-helper-js/pull/754
          optionalFilters,
        })
      ),
    };

    const makeConfigure = connectConfigure(renderFn, unmountFn);

    return {
      ...makeConfigure({ searchParameters }),

      $$type: 'ais.configureRelatedItems',
    };
  };
};

export default connectConfigureRelatedItems;
