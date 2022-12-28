let state = {};
let widget = {};
let indexResults = null;
let indexHelper = null;
let instantSearchInstance = {
  status: 'idle',
  error: undefined,
  addListener: () => {},
  removeListener: () => {},
};

// we need to have state given by `component` before it is mounted, otherwise
// we can't render it in most cases (items, hits, etc. are used in the template)
// so we share a (mock) global state during a whole test.
//
// (a mock is imported once per test file, so the state is isolated between tests)
//
// This allows us to import this `__setState` function and call it in the test
// to give the necessary data before mounting.
export function __setState(newState) {
  state = newState;
}

export function __setWidget(newWidget) {
  widget = newWidget;
}

export function __setIndexResults(newResults) {
  indexResults = newResults;
}

export function __setIndexHelper(newHelper) {
  indexHelper = newHelper;
}

export function __overrideInstantSearchInstance(newInstantSearchInstance) {
  instantSearchInstance = Object.assign(
    instantSearchInstance,
    newInstantSearchInstance
  );
}

export const createWidgetMixin = jest.fn(() => ({
  data() {
    return {
      state,
      widget,
      instantSearchInstance,
      getParentIndex: () => ({
        getResults: () => indexResults,
        getHelper: () => indexHelper,
      }),
    };
  },
}));
