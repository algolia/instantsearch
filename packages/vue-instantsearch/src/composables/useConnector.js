import { dequal } from '../util/dequal';
import { getInitialRenderState } from '../util/getInitialRenderState';
import {
  inject,
  onBeforeUnmount,
  shallowRef,
  toValue,
  watch,
} from '../util/vue-compat';
import { createWidgetLifecycleController } from '../util/widgetLifecycleController';

// Deep-snapshot the applied widget params so the deep watch can compare
// against them: when a reactive object is mutated in place, Vue fires the
// watcher with `next === prev`, so we must keep our own copy.
function snapshot(value) {
  if (Array.isArray(value)) {
    return value.map(snapshot);
  }
  if (value && typeof value === 'object' && value.constructor === Object) {
    const copy = {};
    Object.keys(value).forEach((key) => {
      copy[key] = snapshot(value[key]);
    });
    return copy;
  }
  return value;
}

// Function references churn on every connector render; dequal treats any
// function pair as equal to avoid infinite update loops (same as React).
const ignoreFunctions = (a, b) =>
  Boolean(a) &&
  Boolean(b) &&
  a.constructor === Function &&
  b.constructor === Function;

export function useConnector(
  connector,
  widgetParams = {},
  additionalWidgetProperties = {}
) {
  const instantSearchInstance = inject(
    '$_ais_instantSearchInstance',
    () => {
      throw new TypeError(
        'It looks like you forgot to wrap your Algolia search component inside of an "<ais-instant-search>" component.'
      );
    },
    true
  );
  const getParentIndex = inject(
    '$_ais_getParentIndex',
    () => () => instantSearchInstance.mainIndex,
    true
  );

  let shouldSetState = true;
  let previousRenderState = null;
  let previousStatus = instantSearchInstance.status;

  const state = shallowRef(null);

  const controller = createWidgetLifecycleController({
    connector,
    additionalWidgetProperties,
    instantSearchInstance,
    getParentIndex,
    renderCallback(connectorState, isFirstRender) {
      // We skip the `init` render: the initial state is computed
      // synchronously below, and skipping also prevents UI flashes when the
      // widget params change.
      if (isFirstRender) {
        shouldSetState = true;
        return;
      }

      // InstantSearch.js may notify after the component unmounted (e.g.
      // <ais-dynamic-widgets> removals) — ignore those late updates.
      if (!shouldSetState) {
        return;
      }

      const {
        instantSearchInstance: instance,
        widgetParams: appliedParams,
        ...renderState
      } = connectorState;

      // Only commit when a non-function render param or the search status
      // changed (status must propagate for loading/stalled/error UIs).
      if (
        !dequal(renderState, previousRenderState, ignoreFunctions) ||
        instance.status !== previousStatus
      ) {
        state.value = renderState;
        previousRenderState = renderState;
        previousStatus = instance.status;
      }
    },
    unmountCallback() {
      shouldSetState = false;
    },
  });

  const initialWidgetParams = toValue(widgetParams);
  const widget = controller.mount(initialWidgetParams);
  let appliedSnapshot = snapshot(initialWidgetParams);

  // Never-null state: computed synchronously before InstantSearch renders,
  // like React — no `v-if="state"` guard needed in consumers.
  const noop = () => {};
  state.value = getInitialRenderState({
    widget,
    parentIndex: getParentIndex(),
    instantSearchInstance,
    createProbeWidget: () => connector(noop, noop)(initialWidgetParams),
  });

  watch(
    () => toValue(widgetParams),
    (nextWidgetParams) => {
      // Unlike the mixin, recreation is dequal-guarded: a reactive tick that
      // yields deep-equal params does not remove/recreate the widget.
      if (dequal(nextWidgetParams, appliedSnapshot)) {
        return;
      }
      appliedSnapshot = snapshot(nextWidgetParams);
      controller.update(nextWidgetParams);
    },
    { deep: true }
  );

  onBeforeUnmount(() => {
    shouldSetState = false;
    controller.unmount();
  });

  return state;
}
