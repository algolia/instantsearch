/** @jsx h */

import { h, render } from 'preact';

import connectStructuredOutput from '../../connectors/structured-output/connectStructuredOutput';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  StructuredOutputConnectorParams,
  StructuredOutputRenderState,
  StructuredOutputWidgetDescription,
} from '../../connectors/structured-output/connectStructuredOutput';
import type { Renderer, WidgetFactory } from '../../types';
import type { ComponentChildren } from 'preact';

const withUsage = createDocumentationMessageGenerator({
  name: 'on-page-suggestions',
});

/**
 * The shape returned by the `on_page_suggestions` task. The individual
 * suggestion shape is defined by the agent's output schema, so it stays
 * `unknown` here and is resolved by the `item` template.
 */
export type OnPageSuggestionsOutput = {
  suggestions?: unknown[];
};

export type OnPageSuggestionsContextType = 'pdp' | 'plp' | 'custom';

export type OnPageSuggestionsTemplates = Partial<{
  /**
   * Renders a single suggestion. Defaults to the suggestion's `label`/`title`/`text`
   * field, the string itself, or its JSON representation.
   */
  item: (suggestion: unknown, index: number) => ComponentChildren;
  /**
   * Renders the loading state.
   */
  loading: () => ComponentChildren;
  /**
   * Renders when there are no suggestions (or generation failed).
   */
  empty: () => ComponentChildren;
}>;

export type OnPageSuggestionsCSSClasses = Partial<{
  root: string;
  refresh: string;
  list: string;
  item: string;
  loading: string;
  empty: string;
}>;

type OnPageSuggestionsWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;
  /**
   * The structured task to run.
   * @default 'on_page_suggestions'
   */
  task?: string;
  /**
   * The kind of page the suggestions are generated for. Selects how `context`
   * is mapped to the task `variables`.
   */
  contextType: OnPageSuggestionsContextType;
  /**
   * The page data to send (e.g. the product record for `pdp`). Merged with
   * `contextType` into the task `variables`. Ignored when `getVariables` is set.
   */
  context?: Record<string, unknown>;
  /**
   * Full control over the task `variables`. Overrides `contextType`/`context`.
   */
  getVariables?: () => Record<string, unknown>;
  /**
   * Hard cap on the number of rendered suggestions.
   * @default 3
   */
  maxSuggestions?: number;
  /**
   * Templates to use for the widget.
   */
  templates?: OnPageSuggestionsTemplates;
  /**
   * CSS classes to add.
   */
  cssClasses?: OnPageSuggestionsCSSClasses;
};

export type OnPageSuggestionsWidget = WidgetFactory<
  StructuredOutputWidgetDescription<OnPageSuggestionsOutput> & {
    $$widgetType: 'ais.onPageSuggestions';
  },
  Omit<StructuredOutputConnectorParams, 'task'>,
  OnPageSuggestionsWidgetParams
>;

function defaultItem(suggestion: unknown): ComponentChildren {
  if (typeof suggestion === 'string') {
    return suggestion;
  }
  if (suggestion && typeof suggestion === 'object') {
    const record = suggestion as Record<string, unknown>;
    const label = record.label ?? record.title ?? record.text;
    if (typeof label === 'string') {
      return label;
    }
  }
  return JSON.stringify(suggestion);
}

const createRenderer =
  ({
    containerNode,
    cssClasses,
    templates,
    maxSuggestions,
    getVariables,
  }: {
    containerNode: HTMLElement;
    cssClasses: OnPageSuggestionsCSSClasses;
    templates: OnPageSuggestionsTemplates;
    maxSuggestions: number;
    getVariables: () => Record<string, unknown>;
  }): Renderer<
    StructuredOutputRenderState<OnPageSuggestionsOutput>,
    Partial<OnPageSuggestionsWidgetParams>
  > =>
  ({ output, isLoading, error, submit }, isFirstRendering) => {
    if (isFirstRendering) {
      // On-page suggestions are page-context driven, not search driven: kick off
      // a single generation as soon as the widget mounts.
      submit(getVariables());
      return;
    }

    const suggestions = (output?.suggestions ?? []).slice(0, maxSuggestions);
    const itemTemplate = templates.item || defaultItem;

    let children: ComponentChildren;
    if (isLoading && suggestions.length === 0) {
      children = templates.loading ? (
        templates.loading()
      ) : (
        <div className={cssClasses.loading}>Loading suggestions…</div>
      );
    } else if (suggestions.length === 0) {
      children = templates.empty ? (
        templates.empty()
      ) : (
        <div className={cssClasses.empty}>
          {error ? 'Could not load suggestions.' : 'No suggestions.'}
        </div>
      );
    } else {
      children = (
        <ul className={cssClasses.list}>
          {suggestions.map((suggestion, index) => (
            <li key={index} className={cssClasses.item}>
              {itemTemplate(suggestion, index)}
            </li>
          ))}
        </ul>
      );
    }

    render(
      <div className={cssClasses.root}>
        <button
          type="button"
          className={cssClasses.refresh}
          disabled={isLoading}
          onClick={() => submit(getVariables())}
        >
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
        {children}
      </div>,
      containerNode
    );
  };

const onPageSuggestions: OnPageSuggestionsWidget = function onPageSuggestions(
  widgetParams
) {
  const {
    container,
    contextType,
    context,
    getVariables,
    maxSuggestions = 3,
    templates = {},
    cssClasses = {},
    task = 'on_page_suggestions',
    agentId,
    stream,
    transport,
    type,
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const resolveVariables = (): Record<string, unknown> =>
    getVariables ? getVariables() : { contextType, ...context };

  const specializedRenderer = createRenderer({
    containerNode,
    cssClasses: {
      root: 'ais-OnPageSuggestions',
      refresh: 'ais-OnPageSuggestions-refresh',
      list: 'ais-OnPageSuggestions-list',
      item: 'ais-OnPageSuggestions-item',
      loading: 'ais-OnPageSuggestions-loading',
      empty: 'ais-OnPageSuggestions-empty',
      ...cssClasses,
    },
    templates,
    maxSuggestions,
    getVariables: resolveVariables,
  });

  const makeWidget = connectStructuredOutput(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget<OnPageSuggestionsOutput>({
      agentId,
      task,
      stream,
      transport,
      type,
    }),
    $$widgetType: 'ais.onPageSuggestions',
  };
};

export default onPageSuggestions;
