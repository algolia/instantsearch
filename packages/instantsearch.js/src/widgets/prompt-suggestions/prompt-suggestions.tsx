/** @jsx h */

import { createPromptSuggestionsComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import connectPromptSuggestions from '../../connectors/prompt-suggestions/connectPromptSuggestions';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  PromptSuggestionsRenderState,
  PromptSuggestionsConnectorParams,
  PromptSuggestionsWidgetDescription,
} from '../../connectors/prompt-suggestions/connectPromptSuggestions';
import type { WidgetFactory, Renderer } from '../../types';
import type {
  PromptSuggestionsClassNames,
  PromptSuggestionsHeaderComponentProps,
  PromptSuggestionsTranslations,
} from 'instantsearch-ui-components';
import type { ComponentChildren } from 'preact';

const withUsage = createDocumentationMessageGenerator({
  name: 'prompt-suggestions',
});

const PromptSuggestions = createPromptSuggestionsComponent({
  createElement: h,
  Fragment: 'fragment',
});

export type PromptSuggestionsCSSClasses =
  Partial<PromptSuggestionsClassNames>;

/**
 * Props passed to a custom `templates.layout`. Mirrors the connector render
 * state so a layout template owns the full markup.
 */
export type PromptSuggestionsLayoutTemplateProps = {
  suggestions: string[];
  isLoading: boolean;
  onSuggestionClick: (prompt: string) => void;
  isChatBusy: boolean;
};

export type PromptSuggestionsTemplates = {
  /**
   * Replaces the default pills layout with custom markup. Receives the full
   * render state — the template is responsible for rendering the list, the
   * loading state, and the click handlers.
   */
  layout?: (
    props: PromptSuggestionsLayoutTemplateProps
  ) => ComponentChildren;
  /**
   * Replaces the default header. Set to `false` to disable the header.
   */
  header?:
    | ((props: PromptSuggestionsHeaderComponentProps) => ComponentChildren)
    | false;
};

type PromptSuggestionsWidgetParams = {
  /** CSS Selector or HTMLElement to insert the widget. */
  container: string | HTMLElement;
  /** CSS classes to add. */
  cssClasses?: PromptSuggestionsCSSClasses;
  /** Custom templates. */
  templates?: PromptSuggestionsTemplates;
  /** Translations for the widget. */
  translations?: Partial<PromptSuggestionsTranslations>;
  /**
   * Override the default click behavior (handoff to the chat widget). Receives
   * the prompt and a `sendToChat` callback you can use to fall through to the
   * default behavior after running custom logic (analytics, routing, etc.).
   */
  onSuggestionClick?: (
    prompt: string,
    helpers: { sendToChat: (prompt: string) => boolean }
  ) => void;
};

export type PromptSuggestionsWidget = WidgetFactory<
  PromptSuggestionsWidgetDescription & {
    $$widgetType: 'ais.promptSuggestions';
  },
  PromptSuggestionsConnectorParams,
  PromptSuggestionsWidgetParams
>;

const createRenderer =
  ({
    containerNode,
    cssClasses,
    templates,
    translations,
    onSuggestionClickOverride,
  }: {
    containerNode: HTMLElement;
    cssClasses: PromptSuggestionsCSSClasses;
    templates?: PromptSuggestionsTemplates;
    translations?: Partial<PromptSuggestionsTranslations>;
    onSuggestionClickOverride?: PromptSuggestionsWidgetParams['onSuggestionClick'];
  }): Renderer<
    PromptSuggestionsRenderState,
    Partial<PromptSuggestionsWidgetParams>
  > =>
  (props) => {
    const {
      suggestions,
      isLoading,
      onSuggestionClick,
      isChatBusy,
      sendToChat,
    } = props;

    const handleClick = onSuggestionClickOverride
      ? (prompt: string) => onSuggestionClickOverride(prompt, { sendToChat })
      : onSuggestionClick;

    if (templates?.layout) {
      render(
        <Fragment>
          {templates.layout({
            suggestions,
            isLoading,
            onSuggestionClick: handleClick,
            isChatBusy,
          })}
        </Fragment>,
        containerNode
      );
      return;
    }

    let headerComponent;
    if (templates?.header === false) {
      headerComponent = false as const;
    } else if (templates?.header) {
      const headerTemplate = templates.header;
      headerComponent = (headerProps: PromptSuggestionsHeaderComponentProps) => (
        <Fragment>{headerTemplate(headerProps)}</Fragment>
      );
    }

    render(
      <PromptSuggestions
        classNames={cssClasses}
        suggestions={suggestions}
        isLoading={isLoading}
        onSuggestionClick={handleClick}
        disabled={isChatBusy}
        headerComponent={headerComponent}
        translations={translations}
      />,
      containerNode
    );
  };

export default (function promptSuggestions(
  widgetParams: PromptSuggestionsWidgetParams &
    PromptSuggestionsConnectorParams
) {
  const {
    container,
    cssClasses = {},
    templates,
    translations,
    onSuggestionClick: onSuggestionClickOverride,
    ...connectorParams
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = createRenderer({
    containerNode,
    cssClasses,
    templates,
    translations,
    onSuggestionClickOverride,
  });

  const makeWidget = connectPromptSuggestions(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget(connectorParams),
    $$widgetType: 'ais.promptSuggestions',
  };
} satisfies PromptSuggestionsWidget);
