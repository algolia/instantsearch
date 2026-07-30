import { _objectSpread } from './polyfills';

/**
 * PoC — framework-agnostic widget lifecycle controller.
 *
 * Owns the connector -> factory -> widget wiring shared by the Options-API
 * mixin (`createWidgetMixin`) and the composables (`useConnector`):
 * widget creation with additional properties, add/remove on the parent index,
 * remove-and-recreate on widget params change, and the SSR force-render.
 *
 * State-update policy stays with each consumer (they differ: the mixin keeps
 * its historical null-start semantics, the composable adopts React's).
 */
export function createWidgetLifecycleController({
  connector,
  additionalWidgetProperties = {},
  instantSearchInstance,
  getParentIndex,
  renderCallback,
  unmountCallback = () => {},
  // Called between widget creation and `addWidgets`: on a started instance,
  // `addWidgets` runs the widget's `init` synchronously, and the render
  // callback may need to see the widget already (e.g. the mixin reads
  // `this.widget.dependsOn`).
  onWidgetCreated = () => {},
}) {
  const factory = connector(renderCallback, unmountCallback);
  let widget = null;

  const createWidget = (widgetParams) => {
    widget = _objectSpread(factory(widgetParams), additionalWidgetProperties);
    onWidgetCreated(widget);
    return widget;
  };

  return {
    mount(widgetParams) {
      widget = createWidget(widgetParams);
      getParentIndex().addWidgets([widget]);

      if (
        instantSearchInstance._initialResults &&
        !instantSearchInstance.started
      ) {
        if (typeof instantSearchInstance.__forceRender !== 'function') {
          throw new Error(
            'You are using server side rendering with <ais-instant-search> instead of <ais-instant-search-ssr>.'
          );
        }
        instantSearchInstance.__forceRender(widget, getParentIndex());
      }

      return widget;
    },
    update(nextWidgetParams) {
      getParentIndex().removeWidgets([widget]);
      widget = createWidget(nextWidgetParams);
      getParentIndex().addWidgets([widget]);
      return widget;
    },
    unmount() {
      if (widget) {
        getParentIndex().removeWidgets([widget]);
        widget = null;
      }
    },
  };
}
