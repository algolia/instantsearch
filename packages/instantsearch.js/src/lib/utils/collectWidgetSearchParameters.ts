import type { IndexWidget, Widget } from '../../types';
import type { SearchParameters } from 'algoliasearch-helper';

type WidgetSearchParametersOptions = Parameters<
  NonNullable<Widget['getWidgetSearchParameters']>
>[1];
type SearchDependentWidget = Widget & {
  dependsOn?: 'search';
  getWidgetParameters?: (
    state: SearchParameters,
    widgetParametersOptions: WidgetSearchParametersOptions
  ) => SearchParameters;
};

export type CollectWidgetSearchParametersOptions =
  WidgetSearchParametersOptions & {
    initialSearchParameters: SearchParameters;
    skipWidget?: (widget: Widget | IndexWidget) => boolean;
    useWidgetParameters?: boolean;
  };

export function collectWidgetSearchParameters(
  widgets: Array<Widget | IndexWidget>,
  widgetSearchParametersOptions: CollectWidgetSearchParametersOptions
): SearchParameters {
  const {
    initialSearchParameters,
    skipWidget = () => false,
    useWidgetParameters = true,
    ...rest
  } = widgetSearchParametersOptions;

  return widgets.reduce<SearchParameters>((state, widget) => {
    if (skipWidget(widget) || !widget.getWidgetSearchParameters) {
      return state;
    }

    const searchWidget = widget as SearchDependentWidget;

    if (
      useWidgetParameters &&
      searchWidget.dependsOn === 'search' &&
      searchWidget.getWidgetParameters
    ) {
      return searchWidget.getWidgetParameters(state, rest);
    }

    return widget.getWidgetSearchParameters(state, rest);
  }, initialSearchParameters);
}
