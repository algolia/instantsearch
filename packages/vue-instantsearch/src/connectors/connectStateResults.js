const connectStateResults =
  (renderFn, unmountFn = () => {}) =>
  (widgetParams = {}) => ({
    init({ instantSearchInstance }) {
      renderFn(
        {
          state: undefined,
          results: undefined,
          instantSearchInstance,
          widgetParams,
        },
        true
      );
    },

    render({ results, instantSearchInstance, state }) {
      const resultsCopy = { ...results };

      const stateCopy = { ...state };

      renderFn(
        {
          results: resultsCopy,
          state: stateCopy,
          instantSearchInstance,
          widgetParams,
        },
        false
      );
    },

    dispose() {
      unmountFn();
    },
  });

export default connectStateResults;
