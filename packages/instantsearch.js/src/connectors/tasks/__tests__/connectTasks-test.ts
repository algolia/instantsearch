/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import createTasksWidget from '../connectTasks';

import type { TaskController } from '../../../lib/tasks';
import type { RenderOptions } from '../../../types';
import type { TasksWidgetControls } from '../connectTasks';
import type { SearchResults } from 'algoliasearch-helper';

const DEBOUNCE = 20;
const WAIT = DEBOUNCE + 10;

function flush(ms = 0) {
  return new Promise((r) => setTimeout(r, ms));
}

// A minimal stand-in for the engine the widget drives. Only the surface the
// widget actually touches is mocked (`isLoading` + the imperative methods).
function createFakeController(
  overrides: Partial<TaskController> = {}
): TaskController & {
  submit: jest.Mock;
  reset: jest.Mock;
  invalidate: jest.Mock;
} {
  return {
    output: undefined,
    isLoading: false,
    error: undefined,
    submit: jest.fn(() => Promise.resolve(undefined)),
    reset: jest.fn(),
    invalidate: jest.fn(),
    on: jest.fn(() => () => {}),
    dispose: jest.fn(),
    ...overrides,
  } as unknown as TaskController & {
    submit: jest.Mock;
    reset: jest.Mock;
    invalidate: jest.Mock;
  };
}

// Builds render options carrying just what the widget reads: `results`, whose
// `query` the default `input` maps to the task input.
function renderOptions(query: string | null): RenderOptions {
  const results =
    query === null
      ? null
      : ({ query, hits: [{ objectID: '1' }] } as unknown as SearchResults);
  return { results } as unknown as RenderOptions;
}

const input = (options: RenderOptions) =>
  options.results ? { query: options.results.query } : null;

describe('createTasksWidget', () => {
  it('is a headless `ais.tasks` widget with a render/dispose lifecycle', () => {
    const widget = createTasksWidget({
      controller: createFakeController(),
      input,
    });

    expect(widget.$$type).toBe('ais.tasks');
    expect(typeof widget.render).toBe('function');
    expect(typeof widget.dispose).toBe('function');
    // Headless: it owns no render state.
    expect(widget.getWidgetRenderState).toBeUndefined();
  });

  describe('search-drive', () => {
    it('submits the derived input after the debounce on first results', async () => {
      const controller = createFakeController();
      const widget = createTasksWidget({ controller, input, debounce: DEBOUNCE });

      widget.render!(renderOptions('shoes'));
      expect(controller.submit).not.toHaveBeenCalled();

      await flush(WAIT);
      expect(controller.submit).toHaveBeenCalledTimes(1);
      expect(controller.submit).toHaveBeenCalledWith({ query: 'shoes' });
    });

    it('does not refetch when the signature is unchanged', async () => {
      const controller = createFakeController();
      const widget = createTasksWidget({ controller, input, debounce: DEBOUNCE });

      widget.render!(renderOptions('shoes'));
      await flush(WAIT);
      widget.render!(renderOptions('shoes'));
      await flush(WAIT);

      expect(controller.submit).toHaveBeenCalledTimes(1);
    });

    it('refetches when the signature changes', async () => {
      const controller = createFakeController();
      const widget = createTasksWidget({ controller, input, debounce: DEBOUNCE });

      widget.render!(renderOptions('a'));
      await flush(WAIT);
      widget.render!(renderOptions('b'));
      await flush(WAIT);

      expect(controller.submit).toHaveBeenCalledTimes(2);
      expect(controller.submit).toHaveBeenLastCalledWith({ query: 'b' });
    });

    it('resets the controller (no fetch) when the input maps to null', async () => {
      const controller = createFakeController();
      const widget = createTasksWidget({ controller, input, debounce: DEBOUNCE });

      // Move from a real state to an empty one to exercise the reset path (the
      // default signature also goes null, so the change is detected).
      widget.render!(renderOptions('a'));
      await flush(WAIT);
      widget.render!(renderOptions(null));
      await flush(WAIT);

      expect(controller.reset).toHaveBeenCalled();
    });

    it('honours a custom `getSignature` for dedup', async () => {
      const controller = createFakeController();
      const getSignature = jest.fn(() => 'static');
      const widget = createTasksWidget({
        controller,
        input,
        getSignature,
        debounce: DEBOUNCE,
      });

      widget.render!(renderOptions('a'));
      await flush(WAIT);
      // Different query, but the custom signature is unchanged → no refetch.
      widget.render!(renderOptions('b'));
      await flush(WAIT);

      expect(controller.submit).toHaveBeenCalledTimes(1);
    });

    it('abandons an in-flight request when the signature changes mid-flight', async () => {
      const controller = createFakeController({ isLoading: true });
      const widget = createTasksWidget({ controller, input, debounce: DEBOUNCE });

      widget.render!(renderOptions('a'));
      await flush(WAIT);
      controller.invalidate.mockClear();

      // A newer signature arrives while a request is in flight.
      widget.render!(renderOptions('b'));

      expect(controller.invalidate).toHaveBeenCalledTimes(1);
    });
  });

  describe('controls', () => {
    it('populates `refresh`, which submits immediately, bypassing the debounce', () => {
      const controller = createFakeController();
      const controls: TasksWidgetControls = { refresh: jest.fn() };
      const widget = createTasksWidget({
        controller,
        input,
        debounce: DEBOUNCE,
        controls,
      });

      widget.render!(renderOptions('shoes'));
      // The debounced submit has not fired yet.
      expect(controller.submit).not.toHaveBeenCalled();

      controls.refresh();
      expect(controller.submit).toHaveBeenCalledTimes(1);
      expect(controller.submit).toHaveBeenCalledWith({ query: 'shoes' });
    });

    it('`refresh` is a no-op while a request is in flight', () => {
      const controller = createFakeController({ isLoading: true });
      const controls: TasksWidgetControls = { refresh: jest.fn() };
      const widget = createTasksWidget({
        controller,
        input,
        debounce: DEBOUNCE,
        controls,
      });

      widget.render!(renderOptions('shoes'));
      controls.refresh();

      expect(controller.submit).not.toHaveBeenCalled();
    });

    it('`refresh` is a no-op before the first render with results', () => {
      const controller = createFakeController();
      const controls: TasksWidgetControls = { refresh: jest.fn() };
      createTasksWidget({ controller, input, debounce: DEBOUNCE, controls });

      controls.refresh();
      expect(controller.submit).not.toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('cancels a pending debounced submit and leaves the engine intact', async () => {
      const controller = createFakeController();
      const widget = createTasksWidget({ controller, input, debounce: DEBOUNCE });

      widget.render!(renderOptions('shoes'));
      widget.dispose!({} as never);
      await flush(WAIT);

      expect(controller.submit).not.toHaveBeenCalled();
      // The engine is owned by the consumer — the widget must not tear it down.
      expect(controller.dispose).not.toHaveBeenCalled();
    });
  });
});
