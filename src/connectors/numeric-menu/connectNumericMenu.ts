import {
  checkRendering,
  createDocumentationMessageGenerator,
  isFiniteNumber,
  noop,
} from '../../lib/utils';
import { RendererOptions, Renderer, WidgetFactory } from '../../types';
import { SearchParameters } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'numeric-menu',
  connector: true,
});

type Option = {
  /**
   * Name of the option
   */
  label: string;
  /**
   * Higher bound of the option (<=)
   */
  start: number;
  /**
   * Lower bound of the option (>=)
   */
  end: number;
};

type Item = {
  /**
   *  Name of the option.
   */
  label: string;
  /**
   * URL encoded of the bounds object with the form `{start, end}`.
   * This value can be used verbatim in the webpage and can be read by `refine`
   * directly. If you want to inspect the value, you can do:
   * `JSON.parse(window.decodeURI(value))` to get the object.
   */
  value: string;
  /**
   * True if the value is selected
   */
  isRefined: boolean;
};

type ParamTransformItems = (items: Item[]) => Item[];

export type NumericMenuConnectorParams = {
  /**
   * Name of the attribute for filtering
   */
  attribute: string;
  /**
   * List of all the items
   */
  items: Option[];
  /**
   * Function to transform the items passed to the templates
   */
  transformItems?: ParamTransformItems;
};

type Refine = (facetValue: string) => void;

export interface NumericMenuRendererOptions<TNumericMenuWidgetParams>
  extends RendererOptions<TNumericMenuWidgetParams> {
  /**
   * The list of available choices
   */
  items: Item[];
  /**
   * Creates URLs for the next state, the string is the name of the selected option
   */
  createURL: (value: Item['value']) => string;
  /**
   * `true` if the last search contains no result
   */
  hasNoResults: boolean;
  /**
   * Sets the selected value and trigger a new search
   */
  refine: Refine;
}

export type NumericMenuRenderer<TNumericMenuWidgetParams> = Renderer<
  NumericMenuRendererOptions<
    NumericMenuConnectorParams & TNumericMenuWidgetParams
  >
>;

export type NumericMenuWidgetFactory<TNumericMenuWidgetParams> = WidgetFactory<
  NumericMenuConnectorParams & TNumericMenuWidgetParams
>;

type NumericMenuConnector = <TNumericMenuWidgetParams>(
  render: NumericMenuRenderer<TNumericMenuWidgetParams>,
  unmount?: () => void
) => NumericMenuWidgetFactory<TNumericMenuWidgetParams>;

const connectNumericMenu: NumericMenuConnector = (
  renderFn,
  unmountFn = noop
) => {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const {
      attribute = '',
      items = [],
      transformItems = (x => x) as ParamTransformItems,
    } = widgetParams || ({} as typeof widgetParams);

    if (attribute === '') {
      throw new Error(withUsage('The `attribute` option is required.'));
    }

    if (!items || items.length === 0) {
      throw new Error(
        withUsage('The `items` option expects an array of objects.')
      );
    }

    type ConnectorState = {
      refine?: Refine;
      createURL?: (state: SearchParameters) => (facetValue: string) => string;
    };

    const prepareItems = (state: SearchParameters) =>
      items.map(({ start, end, label }) => ({
        label,
        value: (window as any).encodeURI(JSON.stringify({ start, end })),
        isRefined: isRefined(state, attribute, { start, end, label }),
      }));

    const connectorState: ConnectorState = {};

    return {
      $$type: 'ais.numericMenu',

      init({ helper, createURL, instantSearchInstance }) {
        connectorState.refine = facetValue => {
          const refinedState = refine(helper.state, attribute, facetValue);
          helper.setState(refinedState).search();
        };

        connectorState.createURL = state => facetValue =>
          createURL(refine(state, attribute, facetValue));

        renderFn(
          {
            createURL: connectorState.createURL(helper.state),
            items: transformItems(prepareItems(helper.state)),
            hasNoResults: true,
            refine: connectorState.refine,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, state, instantSearchInstance }) {
        renderFn(
          {
            createURL: connectorState.createURL!(state),
            items: transformItems(prepareItems(state)),
            hasNoResults: results.nbHits === 0,
            refine: connectorState.refine!,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();
        return state.clearRefinements(attribute);
      },

      getWidgetState(uiState, { searchParameters }) {
        const values = searchParameters.getNumericRefinements(attribute);

        const equal = values['='] && values['='][0];

        if (equal || equal === 0) {
          return {
            ...uiState,
            numericMenu: {
              ...uiState.numericMenu,
              [attribute]: `${values['=']}`,
            },
          };
        }

        const min = (values['>='] && values['>='][0]) || '';
        const max = (values['<='] && values['<='][0]) || '';

        if (min === '' && max === '') {
          return uiState;
        }

        return {
          ...uiState,
          numericMenu: {
            ...uiState.numericMenu,
            [attribute]: `${min}:${max}`,
          },
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const value = uiState.numericMenu && uiState.numericMenu[attribute];

        const withoutRefinements = searchParameters.clearRefinements(attribute);

        if (!value) {
          return withoutRefinements.setQueryParameters({
            numericRefinements: {
              ...withoutRefinements.numericRefinements,
              [attribute]: {},
            },
          });
        }

        const isExact = value.indexOf(':') === -1;

        if (isExact) {
          return withoutRefinements.addNumericRefinement(
            attribute,
            '=',
            Number(value)
          );
        }

        const [min, max] = value.split(':').map(parseFloat);

        const withMinRefinement = isFiniteNumber(min)
          ? withoutRefinements.addNumericRefinement(attribute, '>=', min)
          : withoutRefinements;

        const withMaxRefinement = isFiniteNumber(max)
          ? withMinRefinement.addNumericRefinement(attribute, '<=', max)
          : withMinRefinement;

        return withMaxRefinement;
      },
    };
  };
};

function isRefined(state: SearchParameters, attribute: string, option: Option) {
  // @TODO: same as another spot, why is this mixing arrays & elements?
  const currentRefinements = state.getNumericRefinements(
    attribute
  ) as SearchParameters.OperatorList;

  if (option.start !== undefined && option.end !== undefined) {
    if (option.start === option.end) {
      return hasNumericRefinement(currentRefinements, '=', option.start);
    }
  }

  if (option.start !== undefined) {
    return hasNumericRefinement(currentRefinements, '>=', option.start);
  }

  if (option.end !== undefined) {
    return hasNumericRefinement(currentRefinements, '<=', option.end);
  }

  if (option.start === undefined && option.end === undefined) {
    return Object.keys(currentRefinements).every(
      operator => (currentRefinements[operator] || []).length === 0
    );
  }

  return false;
}

function refine(
  state: SearchParameters,
  attribute: string,
  facetValue: string
) {
  let resolvedState = state;

  const refinedOption = JSON.parse((window as any).decodeURI(facetValue));

  // @TODO: why is array / element mixed here & hasRefinements; seems wrong?
  const currentRefinements = resolvedState.getNumericRefinements(
    attribute
  ) as SearchParameters.OperatorList;

  if (refinedOption.start === undefined && refinedOption.end === undefined) {
    return resolvedState.removeNumericRefinement(attribute);
  }

  if (!isRefined(resolvedState, attribute, refinedOption)) {
    resolvedState = resolvedState.removeNumericRefinement(attribute);
  }

  if (refinedOption.start !== undefined && refinedOption.end !== undefined) {
    if (refinedOption.start > refinedOption.end) {
      throw new Error('option.start should be > to option.end');
    }

    if (refinedOption.start === refinedOption.end) {
      if (hasNumericRefinement(currentRefinements, '=', refinedOption.start)) {
        resolvedState = resolvedState.removeNumericRefinement(
          attribute,
          '=',
          refinedOption.start
        );
      } else {
        resolvedState = resolvedState.addNumericRefinement(
          attribute,
          '=',
          refinedOption.start
        );
      }
      return resolvedState;
    }
  }

  if (refinedOption.start !== undefined) {
    if (hasNumericRefinement(currentRefinements, '>=', refinedOption.start)) {
      resolvedState = resolvedState.removeNumericRefinement(
        attribute,
        '>=',
        refinedOption.start
      );
    } else {
      resolvedState = resolvedState.addNumericRefinement(
        attribute,
        '>=',
        refinedOption.start
      );
    }
  }

  if (refinedOption.end !== undefined) {
    if (hasNumericRefinement(currentRefinements, '<=', refinedOption.end)) {
      resolvedState = resolvedState.removeNumericRefinement(
        attribute,
        '<=',
        refinedOption.end
      );
    } else {
      resolvedState = resolvedState.addNumericRefinement(
        attribute,
        '<=',
        refinedOption.end
      );
    }
  }

  if (typeof resolvedState.page === 'number') {
    resolvedState.page = 0;
  }

  return resolvedState;
}

function hasNumericRefinement(
  currentRefinements: SearchParameters.OperatorList,
  operator: SearchParameters.Operator,
  value: number
) {
  return (
    currentRefinements[operator] !== undefined &&
    currentRefinements[operator]!.includes(value)
  );
}

export default connectNumericMenu;
