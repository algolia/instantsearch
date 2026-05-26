/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectChatPageSummary from '../../connectors/chat-page-summary/connectChatPageSummary';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  ChatPageSummaryRenderState,
  ChatPageSummaryConnectorParams,
  ChatPageSummaryWidgetDescription,
} from '../../connectors/chat-page-summary/connectChatPageSummary';
import type { UIMessage } from '../../lib/chat';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { WidgetFactory, Renderer, Template } from '../../types';
import type { Fragment } from 'preact';

const withUsage = createDocumentationMessageGenerator({
  name: 'chat-page-summary',
});

export type ChatPageSummaryCSSClasses = Partial<{
  root: string;
  message: string;
  loader: string;
  error: string;
  cta: string;
}>;

export type ChatPageSummaryAssistantTemplateData = {
  /** The latest assistant message, if any. */
  message?: UIMessage;
  /** Concatenated text content extracted from the message parts. */
  text: string;
  /** The chat status driving the streaming UI. */
  status: ChatPageSummaryRenderState['status'];
};

export type ChatPageSummaryErrorTemplateData = {
  error: Error;
};

export type ChatPageSummaryCtaTemplateData = {
  /** The prompt being sent — usually echoed inside the CTA label. */
  prompt: string;
  /** Whether the CTA can fire. */
  canHandoff: boolean;
  /** Click handler that opens the main chat with the prompt. */
  onClick: () => void;
};

export type ChatPageSummaryTemplates = Partial<{
  /** Renders the streaming assistant message. */
  assistantMessage: Template<ChatPageSummaryAssistantTemplateData>;
  /** Renders the loading state while the agent is generating. */
  loading: Template;
  /** Renders an error returned by the agent. */
  error: Template<ChatPageSummaryErrorTemplateData>;
  /** Renders the "open chat" CTA button. */
  cta: Template<ChatPageSummaryCtaTemplateData>;
}>;

type ChatPageSummaryWidgetParams = {
  /** CSS Selector or HTMLElement to insert the widget. */
  container: string | HTMLElement;
  /** Templates to use for the widget. */
  templates?: ChatPageSummaryTemplates;
  /** Label shown on the default CTA button. */
  ctaLabel?: string;
  /** CSS classes to add. */
  cssClasses?: ChatPageSummaryCSSClasses;
};

export type ChatPageSummaryWidget = WidgetFactory<
  ChatPageSummaryWidgetDescription & {
    $$widgetType: 'ais.chatPageSummary';
  },
  ChatPageSummaryConnectorParams,
  ChatPageSummaryWidgetParams
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
    cssClasses: ChatPageSummaryCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<ChatPageSummaryTemplates>;
    };
    templates: ChatPageSummaryTemplates;
    ctaLabel: string;
  }): Renderer<
    ChatPageSummaryRenderState,
    Partial<ChatPageSummaryWidgetParams>
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
        defaultTemplates: {} as unknown as ChatPageSummaryTemplates,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      return;
    }

    const text = getTextContent(message);
    const isStreaming = status === 'streaming' || status === 'submitted';
    const showLoader = isStreaming && !text;

    render(
      <div className={cx('ais-ChatPageSummary', cssClasses.root)}>
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
              className={cx('ais-ChatPageSummary-error', cssClasses.error)}
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
              className={cx('ais-ChatPageSummary-loader', cssClasses.loader)}
              aria-busy="true"
            >
              Generating summary…
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
              className={cx('ais-ChatPageSummary-message', cssClasses.message)}
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
            className={cx('ais-ChatPageSummary-cta', cssClasses.cta)}
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

export default (function chatPageSummary(
  widgetParams: ChatPageSummaryWidgetParams & ChatPageSummaryConnectorParams
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

  const makeWidget = connectChatPageSummary(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget(connectorParams),
    $$widgetType: 'ais.chatPageSummary',
  };
} satisfies ChatPageSummaryWidget);

// Keep Fragment imported so JSX fragments (if added later) compile.
export type { Fragment };
