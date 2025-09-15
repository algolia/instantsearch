/** @jsx h */

import { createChatComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import connectChat from '../../connectors/chat/connectChat';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  ChatRenderState,
  ChatConnectorParams,
  ChatWidgetDescription,
} from '../../connectors/chat/connectChat';
import type { UIMessage } from '../../lib/chat';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { WidgetFactory, Renderer } from '../../types';
import type { ChatClassNames } from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'chat',
});

const Chat = createChatComponent({
  createElement: h,
  Fragment,
});

function createRenderer({
  renderState,
  cssClasses,
  containerNode,
  templates,
}: {
  containerNode: HTMLElement;
  cssClasses: ChatCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<Required<ChatTemplates>>;
  };
  templates: ChatTemplates;
}): Renderer<ChatRenderState, Partial<ChatWidgetParams>> {
  let open = false;
  let input = '';

  return (props, isFirstRendering) => {
    const { instantSearchInstance, sendMessage, getMessages, renderCallback } =
      props;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: {} as unknown as Required<ChatTemplates>,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      return;
    }

    renderCallback(() => {
      renderChat();
    });

    const setOpen = (o: boolean) => {
      open = o;
      renderChat();
    };

    const setInput = (i: string) => {
      input = i;
      renderChat();
    };

    function renderChat() {
      render(
        <Chat
          open={open}
          toggleButtonProps={{
            open,
            onClick: () => {
              setOpen(!open);
            },
          }}
          messagesProps={{
            messages: getMessages(),
            // TODO: retrieve proper index name and index ui state
            indexUiState:
              instantSearchInstance.getUiState()[
                instantSearchInstance.indexName
              ] || {},
            setIndexUiState: (state) =>
              instantSearchInstance.setUiState({
                ...instantSearchInstance.getUiState(),
                [instantSearchInstance.indexName]: state,
              }),
            // TODO: support tools
          }}
          headerProps={{
            onClose: () => {
              setOpen(false);
            },
          }}
          promptProps={{
            value: input,
            onInput: (e) => {
              setInput(e);
            },
            onSubmit: (e) => {
              sendMessage({ text: e });
              setInput('');
            },
          }}
          classNames={cssClasses}
        />,
        containerNode
      );
    }

    renderChat();
  };
}

export type ChatCSSClasses = Partial<ChatClassNames>;

export type ChatTemplates = Partial<{
  /**
   * Template to use for each result. This template will receive an object containing a single record.
   */
  // item: TemplateWithBindEvent<Hit<THit>>;
  // /**
  //  * Template to use to wrap all items.
  //  */
  // layout: Template<
  //   Pick<
  //     Parameters<NonNullable<LookingSimilarUiProps<Hit<THit>>['layout']>>[0],
  //     'items'
  //   > & {
  //     templates: {
  //       item: LookingSimilarUiProps<Hit<THit>>['itemComponent'];
  //     };
  //     cssClasses: Pick<LookingSimilarCSSClasses, 'list' | 'item'>;
  //   }
  // >;
}>;

type ChatWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: ChatTemplates;

  /**
   * CSS classes to add.
   */
  cssClasses?: ChatCSSClasses;
};

export type ChatWidget = WidgetFactory<
  // TODO: fix for generic
  ChatWidgetDescription<UIMessage> & {
    $$widgetType: 'ais.chat';
  },
  ChatConnectorParams,
  ChatWidgetParams
>;

export default (function chat<TUiMessage extends UIMessage = UIMessage>(
  widgetParams: ChatWidgetParams & ChatConnectorParams<TUiMessage>
) {
  const {
    container,
    templates = {},
    cssClasses = {},
    resume = false,
    ...options
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
  });

  const makeWidget = connectChat(specializedRenderer, () =>
    render(null, containerNode)
  );
  return {
    ...makeWidget({
      resume,
      ...options,
    }),
    $$widgetType: 'ais.chat',
  };
} satisfies ChatWidget);
