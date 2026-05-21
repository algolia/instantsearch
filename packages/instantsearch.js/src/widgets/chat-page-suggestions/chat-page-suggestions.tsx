/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectChatPageSuggestions from '../../connectors/chat-page-suggestions/connectChatPageSuggestions';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  ChatPageSuggestionsRenderState,
  ChatPageSuggestionsConnectorParams,
  ChatPageSuggestionsWidgetDescription,
} from '../../connectors/chat-page-suggestions/connectChatPageSuggestions';
import type { UIMessage } from '../../lib/chat';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { WidgetFactory, Renderer, Template } from '../../types';
import type { Fragment } from 'preact';

const withUsage = createDocumentationMessageGenerator({
  name: 'chat-page-suggestions',
});

export type ChatPageSuggestionsCSSClasses = Partial<{
  root: string;
  message: string;
  loader: string;
  error: string;
  cta: string;
}>;

export type ChatPageSuggestionsAssistantTemplateData = {
  /** The latest assistant message, if any. */
  message?: UIMessage;
  /** Concatenated text content extracted from the message parts. */
  text: string;
  /** The chat status driving the streaming UI. */
  status: ChatPageSuggestionsRenderState['status'];
};

export type ChatPageSuggestionsErrorTemplateData = {
  error: Error;
};

export type ChatPageSuggestionsCtaTemplateData = {
  /** The prompt being sent — usually echoed inside the CTA label. */
  prompt: string;
  /** Whether the CTA can fire. */
  canHandoff: boolean;
  /** Click handler that opens the main chat with the prompt. */
  onClick: () => void;
};

export type ChatPageSuggestionsTemplates = Partial<{
  /** Renders the streaming assistant message. */
  assistantMessage: Template<ChatPageSuggestionsAssistantTemplateData>;
  /** Renders the loading state while the agent is generating. */
  loading: Template;
  /** Renders an error returned by the agent. */
  error: Template<ChatPageSuggestionsErrorTemplateData>;
  /** Renders the "open chat" CTA button. */
  cta: Template<ChatPageSuggestionsCtaTemplateData>;
}>;

type ChatPageSuggestionsWidgetParams = {
  /** CSS Selector or HTMLElement to insert the widget. */
  container: string | HTMLElement;
  /** Templates to use for the widget. */
  templates?: ChatPageSuggestionsTemplates;
  /** Label shown on the default CTA button. */
  ctaLabel?: string;
  /** CSS classes to add. */
  cssClasses?: ChatPageSuggestionsCSSClasses;
};

export type ChatPageSuggestionsWidget = WidgetFactory<
  ChatPageSuggestionsWidgetDescription & {
    $$widgetType: 'ais.chatPageSuggestions';
  },
  ChatPageSuggestionsConnectorParams,
  ChatPageSuggestionsWidgetParams
>;

function getTextContent(message: UIMessage | undefined): string {
  if (!message?.parts) return '';
  return message.parts
    .map((part) => ('text' in part ? part.text : ''))
    .join('');
}

const createRenderer =
  ({
    renderState,
    cssClasses,
    containerNode,
    templates,
    ctaLabel,
  }: {
    containerNode: HTMLElement;
    cssClasses: ChatPageSuggestionsCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<ChatPageSuggestionsTemplates>;
    };
    templates: ChatPageSuggestionsTemplates;
    ctaLabel: string;
  }): Renderer<
    ChatPageSuggestionsRenderState,
    Partial<ChatPageSuggestionsWidgetParams>
  > =>
  (props, isFirstRendering) => {
    const {
      instantSearchInstance,
      message,
      status,
      error,
      openChat,
      canHandoff,
      prompt,
    } = props;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: {} as unknown as ChatPageSuggestionsTemplates,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      return;
    }

    const text = getTextContent(message);
    const isStreaming = status === 'streaming' || status === 'submitted';
    const showLoader = isStreaming && !text;

    render(
      <div className={cx('ais-ChatPageSuggestions', cssClasses.root)}>
        {error ? (
          templates.error ? (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="error"
              rootTagName="div"
              data={{ error }}
            />
          ) : (
            <div
              className={cx('ais-ChatPageSuggestions-error', cssClasses.error)}
              role="alert"
            >
              {error.message}
            </div>
          )
        ) : null}

        {showLoader ? (
          templates.loading ? (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="loading"
              rootTagName="div"
              data={{}}
            />
          ) : (
            <div
              className={cx(
                'ais-ChatPageSuggestions-loader',
                cssClasses.loader
              )}
              aria-busy="true"
            >
              Generating suggestion…
            </div>
          )
        ) : null}

        {text && !error ? (
          templates.assistantMessage ? (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="assistantMessage"
              rootTagName="div"
              data={{ message, text, status }}
            />
          ) : (
            <div
              className={cx(
                'ais-ChatPageSuggestions-message',
                cssClasses.message
              )}
            >
              {text}
            </div>
          )
        ) : null}

        {templates.cta ? (
          <TemplateComponent
            {...renderState.templateProps}
            templateKey="cta"
            rootTagName="div"
            data={{ prompt, canHandoff, onClick: openChat }}
          />
        ) : (
          <button
            type="button"
            className={cx('ais-ChatPageSuggestions-cta', cssClasses.cta)}
            onClick={openChat}
            disabled={!canHandoff}
          >
            {ctaLabel}
          </button>
        )}
      </div>,
      containerNode
    );
  };

export default (function chatPageSuggestions(
  widgetParams: ChatPageSuggestionsWidgetParams &
    ChatPageSuggestionsConnectorParams
) {
  const {
    container,
    templates = {},
    cssClasses = {},
    ctaLabel = 'Continue in chat',
    ...connectorParams
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = createRenderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
    ctaLabel,
  });

  const makeWidget = connectChatPageSuggestions(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget(connectorParams),
    $$widgetType: 'ais.chatPageSuggestions',
  };
} satisfies ChatPageSuggestionsWidget);

// Keep Fragment imported so JSX fragments (if added later) compile.
export type { Fragment };
