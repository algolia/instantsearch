import { SearchParameters } from 'algoliasearch-helper';

export const resolveSingleLeafWidgetDriven = (...nodes) => {
  const uiState = nodes.reduce((state, node) => {
    return node.widgets
      .filter(w => Boolean(w.getWidgetState))
      .reduce((innerState, widget) => {
        const nextState = widget.getWidgetState(innerState, {
          searchParameters: node.state,
        });

        return nextState;
      }, state);
  }, {});

  const searchParameters = nodes.reduce((state, node) => {
    return node.widgets
      .filter(w => Boolean(w.getWidgetSearchParameters))
      .reduce((innerState, widget) => {
        // Retrieve the configutation for the widget from the state. It does
        // require a change inside the `getConfiguration` function. Right now
        // it's plain object rather than a SearchParameters. With this change
        // we can get rid of the `enhanceConfiguration` function since the SP
        // manage it for us.
        const innerStateWithConfiguration = widget.getConfiguration
          ? widget.getConfiguration(innerState)
          : innerState;

        const nextState = widget.getWidgetSearchParameters(
          // Merge the parent with the configuration of the widget
          innerStateWithConfiguration,
          {
            uiState,
          }
        );

        return nextState;
      }, state);
  }, new SearchParameters());

  return searchParameters;
};
