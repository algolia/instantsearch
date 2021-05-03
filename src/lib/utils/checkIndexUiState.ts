import capitalize from './capitalize';
import { warning } from './logger';
import { IndexWidget } from '../../widgets/index/index';
import { Widget, IndexUiState } from '../../types';
import { keys } from './typedObject';

// Some connectors are responsible for multiple widgets so we need
// to map them.
function getWidgetNames(connectorName: string): string[] {
  switch (connectorName) {
    case 'range':
      return [];

    case 'menu':
      return ['menu', 'menuSelect'];

    default:
      return [connectorName];
  }
}

type WidgetType = Required<Widget>['$$type'];

type StateDescription = {
  connectors: string[];
  widgets: WidgetType[];
};

type StateToWidgets = {
  [TParameter in keyof IndexUiState]: StateDescription;
};

type WidgetDescription = {
  connectors: string[];
  // no longer widget type, "ais." is stripped
  widgets: string[];
};

type MissingWidgets = Array<[string, WidgetDescription]>;

const stateToWidgetsMap: StateToWidgets = {
  query: {
    connectors: ['connectSearchBox'],
    widgets: ['ais.searchBox', 'ais.autocomplete', 'ais.voiceSearch'],
  },
  refinementList: {
    connectors: ['connectRefinementList'],
    widgets: ['ais.refinementList'],
  },
  menu: {
    connectors: ['connectMenu'],
    widgets: ['ais.menu'],
  },
  hierarchicalMenu: {
    connectors: ['connectHierarchicalMenu'],
    widgets: ['ais.hierarchicalMenu'],
  },
  numericMenu: {
    connectors: ['connectNumericMenu'],
    widgets: ['ais.numericMenu'],
  },
  ratingMenu: {
    connectors: ['connectRatingMenu'],
    widgets: ['ais.ratingMenu'],
  },
  range: {
    connectors: ['connectRange'],
    widgets: ['ais.rangeInput', 'ais.rangeSlider', 'ais.range'],
  },
  toggle: {
    connectors: ['connectToggleRefinement'],
    widgets: ['ais.toggleRefinement'],
  },
  geoSearch: {
    connectors: ['connectGeoSearch'],
    widgets: ['ais.geoSearch'],
  },
  sortBy: {
    connectors: ['connectSortBy'],
    widgets: ['ais.sortBy'],
  },
  page: {
    connectors: ['connectPagination'],
    widgets: ['ais.pagination', 'ais.infiniteHits'],
  },
  hitsPerPage: {
    connectors: ['connectHitsPerPage'],
    widgets: ['ais.hitsPerPage'],
  },
  configure: {
    connectors: ['connectConfigure'],
    widgets: ['ais.configure'],
  },
  places: {
    connectors: [],
    widgets: ['ais.places'],
  },
};

type CheckIndexUiStateParams = {
  index: IndexWidget;
  indexUiState: IndexUiState;
};

export function checkIndexUiState({
  index,
  indexUiState,
}: CheckIndexUiStateParams) {
  const mountedWidgets = index
    .getWidgets()
    .map(widget => widget.$$type)
    .filter(Boolean);

  const missingWidgets = keys(indexUiState).reduce<MissingWidgets>(
    (acc, parameter) => {
      const widgetUiState = stateToWidgetsMap[parameter];

      if (!widgetUiState) {
        return acc;
      }

      const requiredWidgets = widgetUiState.widgets;

      if (
        requiredWidgets &&
        !requiredWidgets.some(requiredWidget =>
          mountedWidgets.includes(requiredWidget)
        )
      ) {
        acc.push([
          parameter,
          {
            connectors: widgetUiState.connectors,
            widgets: widgetUiState.widgets.map(
              widgetIdentifier => widgetIdentifier.split('ais.')[1]
            ),
          },
        ]);
      }

      return acc;
    },
    []
  );

  warning(
    missingWidgets.length === 0,
    `The UI state for the index "${index.getIndexId()}" is not consistent with the widgets mounted.

This can happen when the UI state is specified via \`initialUiState\`, \`routing\` or \`setUiState\` but that the widgets responsible for this state were not added. This results in those query parameters not being sent to the API.

To fully reflect the state, some widgets need to be added to the index "${index.getIndexId()}":

${missingWidgets
  .map(([stateParameter, { widgets }]) => {
    return `- \`${stateParameter}\` needs one of these widgets: ${([] as string[])
      .concat(...widgets.map(name => getWidgetNames(name!)))
      .map((name: string) => `"${name}"`)
      .join(', ')}`;
  })
  .join('\n')}

If you do not wish to display widgets but still want to support their search parameters, you can mount "virtual widgets" that don't render anything:

\`\`\`
${missingWidgets
  .filter(([_stateParameter, { connectors }]) => {
    return connectors.length > 0;
  })
  .map(([_stateParameter, { connectors, widgets }]) => {
    const capitalizedWidget = capitalize(widgets[0]!);
    const connectorName = connectors[0];

    return `const virtual${capitalizedWidget} = ${connectorName}(() => null);`;
  })
  .join('\n')}

search.addWidgets([
  ${missingWidgets
    .filter(([_stateParameter, { connectors }]) => {
      return connectors.length > 0;
    })
    .map(([_stateParameter, { widgets }]) => {
      const capitalizedWidget = capitalize(widgets[0]!);

      return `virtual${capitalizedWidget}({ /* ... */ })`;
    })
    .join(',\n  ')}
]);
\`\`\`

If you're using custom widgets that do set these query parameters, we recommend using connectors instead.

See https://www.algolia.com/doc/guides/building-search-ui/widgets/customize-an-existing-widget/js/#customize-the-complete-ui-of-the-widgets`
  );
}
