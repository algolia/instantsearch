import { createTaskController } from '../../lib/tasks';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

import createTasksWidget from './connectTasks';

import type { TaskController, TaskTransport } from '../../lib/tasks';
import type {
  Connector,
  DisposeOptions,
  IndexRenderState,
  InitOptions,
  InstantSearch,
  RenderOptions,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  WidgetDescription,
  WidgetRenderState,
} from '../../types';
import type { TasksWidget, TasksWidgetControls } from './connectTasks';

/**
 * A task-backed widget description: it must expose a `renderState` and store it
 * under an `indexRenderState` key (the two together make the render-state
 * lifecycle methods required on the produced widget).
 */
export type TaskWidgetDescription = WidgetDescription & {
  renderState: Record<string, unknown>;
  indexRenderState: Record<string, unknown>;
};

/**
 * The controller wiring resolved from `widgetParams`. Mirrors the tail of
 * {@link createTaskController}'s options (the `instantSearchInstance` is
 * injected by the factory at `init` time).
 */
export type TaskControllerOptions = {
  /** Agent Studio agent id. Ignored when `transport` is set. */
  agentId?: string;
  /** Custom transport. When set, `agentId` and client credentials are ignored. */
  transport?: TaskTransport;
  /** Task (a.k.a. configuration) id sent as the `task` field. */
  task: string;
  /** Whether to stream partial outputs. Default `true`. */
  stream?: boolean;
};

/**
 * The engine state handed to a task connector's `getWidgetRenderState`, plus
 * the current render options. Everything a domain projection needs that is
 * *not* domain-specific: the raw controller output, its loading/error state,
 * and an imperative `refresh`.
 */
export type TaskConnectorRenderState<TParams, TOutput> = {
  widgetParams: TParams;
  /** Latest (unwrapped) controller output, or `undefined` before the first resolve. */
  output: TOutput | undefined;
  /** Whether a request is currently in flight. */
  isLoading: boolean;
  /** Error from the last request, or `undefined` on success. */
  error: Error | undefined;
  /** Imperative refetch that bypasses the debounce (no-op while loading / before results). */
  refresh: () => void;
  /** The render options for the current render (init or search cycle). */
  renderOptions: InitOptions | RenderOptions;
  instantSearchInstance: InstantSearch;
};

/**
 * The domain half of a task-backed connector — everything that differs between
 * one task widget and the next. {@link createTaskConnector} owns the rest (the
 * controller lifecycle, the search-drive `tasks` widget, the render-isolated
 * repaint on streamed deltas, and disposal).
 */
export type TaskConnectorDefinition<
  TDescription extends TaskWidgetDescription,
  TParams extends UnknownWidgetParams,
  TOutput = unknown
> = {
  /** Connector name used for documentation links and error messages. */
  connectorName: string;
  /** `$$type` of the produced widget, e.g. `'ais.promptSuggestions'`. */
  $$type: TDescription['$$type'];
  /** Key the widget render state is stored under, e.g. `'promptSuggestions'`. */
  renderStateKey: keyof TDescription['indexRenderState'] & string;
  /** Debounce (ms) applied to the auto-refetch on a search-state change. Default `0`. */
  debounce?: number;
  /**
   * Validate `widgetParams` and resolve the controller wiring (task id, creds
   * source). Throw (via `withUsage`) on invalid params. Runs once per instance,
   * when the widget is created — so `throw` here surfaces synchronously.
   */
  getControllerOptions: (
    widgetParams: TParams,
    withUsage: ReturnType<typeof createDocumentationMessageGenerator>
  ) => TaskControllerOptions;
  /**
   * Map the current render (search results and state) to the task `input`.
   * Return `null` to clear the output without firing a request.
   */
  getInput: (
    widgetParams: TParams
  ) => (renderOptions: RenderOptions) => Record<string, unknown> | null;
  /**
   * Optional dedup key derived from the current render; unchanged between
   * renders means no refetch. Defaults to a JSON stringify of `getInput`.
   */
  getSignature?: (
    widgetParams: TParams
  ) => (renderOptions: RenderOptions) => string | null;
  /**
   * Project the current engine state (see {@link TaskConnectorRenderState}) into
   * the domain render state. The factory appends `widgetParams`, so return the
   * domain fields only.
   */
  getWidgetRenderState: (
    options: TaskConnectorRenderState<TParams, TOutput>
  ) => TDescription['renderState'];
};

/**
 * Builds a task-backed InstantSearch connector from its domain half.
 *
 * Every task widget shares the same skeleton: resolve credentials + task id
 * from the search client, create a {@link TaskController}, drive it off the
 * search results via a headless `tasks` widget, expose `isLoading`/`error`/
 * `refresh`, and repaint on streamed deltas (which arrive outside the search
 * cycle) by calling the render function directly. This factory owns all of
 * that; a specific widget (e.g. `connectPromptSuggestions`) supplies only its
 * task config, input mapping, and output → render-state projection.
 *
 * The produced connector deliberately keeps the controller subscription on the
 * widget it returns: the React (`useConnector`) and Vue (`createWidgetMixin`)
 * wrappers only propagate updates through *this* widget's render function, so
 * the controller — the source of streamed deltas — must live here, not on a
 * separate parent widget.
 */
export function createTaskConnector<
  TDescription extends TaskWidgetDescription,
  TParams extends UnknownWidgetParams,
  TOutput = unknown
>(
  definition: TaskConnectorDefinition<TDescription, TParams, TOutput>
): Connector<TDescription, TParams> {
  const {
    connectorName,
    $$type,
    renderStateKey,
    debounce = 0,
    getControllerOptions,
    getInput,
    getSignature,
    getWidgetRenderState: getDomainRenderState,
  } = definition;

  const withUsage = createDocumentationMessageGenerator({
    name: connectorName,
    connector: true,
  });

  const connector = (
    renderFn: Renderer<TDescription['renderState'], TParams>,
    unmountFn: Unmounter = noop
  ) => {
    checkRendering(renderFn, withUsage());

    return (widgetParams: TParams) => {
      // Validation + task/creds resolution happen once, synchronously, so bad
      // params throw at widget-creation time (what the flavors assert against).
      const controllerOptions = getControllerOptions(widgetParams, withUsage);
      const input = getInput(widgetParams);
      const signature = getSignature?.(widgetParams);

      let controller: TaskController<TOutput> | undefined;
      let unsubscribe: () => void = noop;
      let tasksWidget: TasksWidget | undefined;
      let tasksWidgetMounted = false;
      let latestRenderOptions: InitOptions | RenderOptions | undefined;

      // Populated by the `tasks` widget with its imperative controls; re-exposed
      // as `refresh` so the search-drive internals stay encapsulated.
      const controls: TasksWidgetControls = { refresh: noop };
      const refresh = () => controls.refresh();

      const getWidgetRenderState = (
        renderOptions: InitOptions | RenderOptions
      ): WidgetRenderState<TDescription['renderState'], TParams> =>
        ({
          ...getDomainRenderState({
            widgetParams,
            output: controller?.output,
            isLoading: controller?.isLoading ?? false,
            error: controller?.error,
            refresh,
            renderOptions,
            instantSearchInstance: renderOptions.instantSearchInstance,
          }),
          widgetParams,
        } as WidgetRenderState<TDescription['renderState'], TParams>);

      // Paints from the current render options — used for the initial render,
      // each search-cycle render, and (crucially) every controller state change
      // (streamed partials / resolve / error), which land outside the search
      // cycle. Repainting directly keeps deltas scoped to this widget's subtree.
      const triggerRender = (
        renderOptions: InitOptions | RenderOptions,
        isFirstRendering = false
      ) => {
        renderFn(
          {
            ...getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          isFirstRendering
        );
      };

      return {
        $$type,

        init(initOptions: InitOptions) {
          latestRenderOptions = initOptions;

          // Created here so it can resolve credentials from the search client.
          // Owned by this widget; the `tasks` widget only pumps it.
          controller = createTaskController<TOutput>({
            instantSearchInstance: initOptions.instantSearchInstance,
            ...controllerOptions,
          });

          unsubscribe = controller.on(() => {
            if (latestRenderOptions) {
              triggerRender(latestRenderOptions);
            }
          });

          tasksWidget = createTasksWidget({
            controller,
            input,
            getSignature: signature,
            debounce,
            controls,
          });

          triggerRender(initOptions, true);
        },

        render(renderOptions: RenderOptions) {
          latestRenderOptions = renderOptions;

          // Mount the search-drive on first render (not init), following the
          // `dynamicWidgets` precedent: adding widgets to a live index is a
          // render-time operation.
          if (!tasksWidgetMounted && tasksWidget) {
            tasksWidgetMounted = true;
            renderOptions.parent.addWidgets([tasksWidget]);
          }

          triggerRender(renderOptions);
        },

        dispose(disposeOptions: DisposeOptions) {
          if (tasksWidgetMounted && tasksWidget) {
            disposeOptions.parent.removeWidgets([tasksWidget]);
            tasksWidgetMounted = false;
          }
          unsubscribe();
          controller?.dispose();
          unmountFn();
        },

        getWidgetRenderState,

        getRenderState(
          renderState: IndexRenderState,
          renderOptions: InitOptions | RenderOptions
        ) {
          return {
            ...renderState,
            [renderStateKey]: getWidgetRenderState(renderOptions),
          } as IndexRenderState & TDescription['indexRenderState'];
        },
      };
    };
  };

  // The widget above is a valid task connector widget by construction, but its
  // fully-generic `Widget<TDescription>` shape (the `SearchWidget | RecommendWidget`
  // union, the generic `$$type`) can't be verified from inside a generic factory.
  // This is the single boundary where we assert the contract we build by hand.
  return connector as unknown as Connector<TDescription, TParams>;
}
