import type { TaskController } from '../../lib/tasks';
import type { RenderOptions, Widget } from '../../types';

/**
 * Imperative controls the task widget exposes back to its owner. The owning
 * connector re-surfaces these in its own render state (e.g. as `refresh`), so
 * the search-drive internals (debounce timer, latest render options) stay
 * encapsulated in the widget rather than leaking up.
 */
export type TasksWidgetControls = {
  /**
   * Re-runs the current `input` immediately, bypassing the debounce. No-op
   * while a request is in flight or before the first render with results.
   */
  refresh: () => void;
};

export type TasksWidgetParams = {
  /**
   * The stateful engine this widget drives. Created and owned by the consumer
   * (it holds the resolved endpoint/credentials); the widget only pumps it.
   */
  controller: TaskController;
  /**
   * Maps the current render (search results and state) to the task `input`.
   * Return `null` to clear the output without firing a request (e.g. there is
   * nothing to describe). Called at submit time, after the debounce.
   */
  input: (renderOptions: RenderOptions) => Record<string, unknown> | null;
  /**
   * Dedup key derived from the current render; when it is unchanged between
   * renders, no refetch fires. Defaults to a JSON stringify of `input(...)`.
   */
  getSignature?: (renderOptions: RenderOptions) => string | null;
  /** Debounce (ms) applied to auto-refetch on a signature change. Default `0`. */
  debounce?: number;
  /**
   * Optional object populated in place with the widget's imperative controls
   * (see {@link TasksWidgetControls}) so the owner can re-expose them.
   */
  controls?: TasksWidgetControls;
};

export type TasksWidget = Widget<{ $$type: 'ais.tasks' }>;

/**
 * Search-driven, headless task widget — the task-side analog of `index`.
 *
 * It is a plain tree citizen: once added to an index it observes the search
 * render cycle and, whenever the derived `input` signature changes, debounced-
 * submits the input to the injected {@link TaskController} — the way `index`
 * re-runs a search when the UI state changes. It owns **no render state**; the
 * connector that mounts it (e.g. `connectPromptSuggestions`) subscribes to the
 * controller directly and projects its state into a UI shape.
 */
export default function createTasksWidget(
  params: TasksWidgetParams
): TasksWidget {
  const { controller, input, getSignature, debounce = 0, controls } = params;

  let latestRenderOptions: RenderOptions | undefined;
  let lastSignature: string | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const computeSignature = (renderOptions: RenderOptions): string | null => {
    if (getSignature) {
      return getSignature(renderOptions);
    }
    const nextInput = input(renderOptions);
    return nextInput === null ? null : JSON.stringify(nextInput);
  };

  const fire = (renderOptions: RenderOptions) => {
    const nextInput = input(renderOptions);
    if (nextInput === null) {
      // Nothing to describe — clear any previous output rather than fetch.
      controller.reset();
      return;
    }
    controller.submit(nextInput);
  };

  const refresh = () => {
    if (controller.isLoading || !latestRenderOptions?.results) {
      return;
    }
    clearTimeout(debounceTimer);
    lastSignature = computeSignature(latestRenderOptions);
    fire(latestRenderOptions);
  };

  if (controls) {
    controls.refresh = refresh;
  }

  return {
    $$type: 'ais.tasks',

    render(renderOptions) {
      latestRenderOptions = renderOptions;

      const signature = renderOptions.results
        ? computeSignature(renderOptions)
        : null;

      if (signature === lastSignature) {
        return;
      }
      lastSignature = signature;

      // A newer signature supersedes any in-flight request: abandon it so its
      // (now stale) streamed output can't paint while we wait out the debounce.
      if (controller.isLoading) {
        controller.invalidate();
      }

      clearTimeout(debounceTimer);

      if (signature === null) {
        controller.reset();
        return;
      }

      debounceTimer = setTimeout(() => {
        if (latestRenderOptions) {
          fire(latestRenderOptions);
        }
      }, debounce);
    },

    dispose() {
      clearTimeout(debounceTimer);
    },
  };
}
