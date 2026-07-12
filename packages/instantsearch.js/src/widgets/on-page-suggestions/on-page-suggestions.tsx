/** @jsx h */

import { createOnPageSuggestionsComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import connectOnPageSuggestions from '../../connectors/on-page-suggestions/connectOnPageSuggestions';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  OnPageSuggestionsRenderState,
  OnPageSuggestionsConnectorParams,
  OnPageSuggestionsWidgetDescription,
} from '../../connectors/on-page-suggestions/connectOnPageSuggestions';
import type { WidgetFactory, Renderer } from '../../types';
import type {
  OnPageSuggestionsClassNames,
  OnPageSuggestionsHeaderComponentProps,
  OnPageSuggestionsTranslations,
} from 'instantsearch-ui-components';
import type { ComponentChildren } from 'preact';

const withUsage = createDocumentationMessageGenerator({
  name: 'on-page-suggestions',
});

const OnPageSuggestions = createOnPageSuggestionsComponent({
  createElement: h,
  Fragment: 'fragment',
});

export type OnPageSuggestionsCSSClasses =
  Partial<OnPageSuggestionsClassNames>;

/**
 * Props passed to a custom `templates.layout`. Mirrors the connector render
 * state so a layout template owns the full markup.
 */
export type OnPageSuggestionsLayoutTemplateProps = {
  suggestions: string[];
  isLoading: boolean;
  onSuggestionClick: (prompt: string) => void;
  isChatBusy: boolean;
};

export type OnPageSuggestionsTemplates = {
  /**
   * Replaces the default pills layout with custom markup. Receives the full
   * render state — the template is responsible for rendering the list, the
   * loading state, and the click handlers.
   */
  layout?: (
    props: OnPageSuggestionsLayoutTemplateProps
  ) => ComponentChildren;
  /**
   * Replaces the default header. Set to `false` to disable the header.
   */
  header?:
    | ((props: OnPageSuggestionsHeaderComponentProps) => ComponentChildren)
    | false;
};

type OnPageSuggestionsWidgetParams = {
  /** CSS Selector or HTMLElement to insert the widget. */
  container: string | HTMLElement;
  /** CSS classes to add. */
  cssClasses?: OnPageSuggestionsCSSClasses;
  /** Custom templates. */
  templates?: OnPageSuggestionsTemplates;
  /** Translations for the widget. */
  translations?: Partial<OnPageSuggestionsTranslations>;
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

export type OnPageSuggestionsWidget = WidgetFactory<
  OnPageSuggestionsWidgetDescription & {
    $$widgetType: 'ais.onPageSuggestions';
  },
  OnPageSuggestionsConnectorParams,
  OnPageSuggestionsWidgetParams
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
    cssClasses: OnPageSuggestionsCSSClasses;
    templates?: OnPageSuggestionsTemplates;
    translations?: Partial<OnPageSuggestionsTranslations>;
    onSuggestionClickOverride?: OnPageSuggestionsWidgetParams['onSuggestionClick'];
  }): Renderer<
    OnPageSuggestionsRenderState,
    Partial<OnPageSuggestionsWidgetParams>
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
      headerComponent = (headerProps: OnPageSuggestionsHeaderComponentProps) => (
        <Fragment>{headerTemplate(headerProps)}</Fragment>
      );
    }

    render(
      <OnPageSuggestions
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

export default (function onPageSuggestions(
  widgetParams: OnPageSuggestionsWidgetParams &
    OnPageSuggestionsConnectorParams
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

  const makeWidget = connectOnPageSuggestions(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget(connectorParams),
    $$widgetType: 'ais.onPageSuggestions',
  };
} satisfies OnPageSuggestionsWidget);
