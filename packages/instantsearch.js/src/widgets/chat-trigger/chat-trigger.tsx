/** @jsx h */

import { h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type { Template } from '../../types';
import type { ChatToggleButtonProps } from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'chatTrigger',
});

export type ChatTriggerCSSClasses = Partial<{
  /**
   * CSS class to add to the button.
   */
  button: string | string[];
}>;

export type ChatTriggerTemplates = Partial<{
  /**
   * Template for the trigger button layout.
   */
  layout: Template<ChatToggleButtonProps>;
  /**
   * Template for the trigger button icon.
   */
  icon: Template<{ isOpen: boolean }>;
}>;

export type ChatTriggerWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Reference to the chat widget instance.
   * Required for the trigger to control the chat's open/close state.
   */
  chat: {
    setOpen: (open: boolean) => void;
    getOpen: () => boolean;
  };

  /**
   * Templates to use for the widget.
   */
  templates?: ChatTriggerTemplates;

  /**
   * CSS classes to add.
   */
  cssClasses?: ChatTriggerCSSClasses;
};

export default function chatTrigger(widgetParams: ChatTriggerWidgetParams) {
  const {
    container,
    chat,
    templates: userTemplates = {},
    cssClasses: userCssClasses = {},
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  if (!chat) {
    throw new Error(
      withUsage(
        'The `chat` option is required. Pass a reference to the chat widget instance.'
      )
    );
  }

  const containerNode = getContainerNode(container);

  const templates: ChatTriggerTemplates = {
    ...userTemplates,
  };

  const defaultTemplateProps = prepareTemplateProps({
    defaultTemplates: {} as unknown as ChatTriggerTemplates,
    templatesConfig: {},
    templates,
  });

  const LayoutComponent = templates.layout
    ? (props: ChatToggleButtonProps) => {
        return (
          <TemplateComponent
            {...defaultTemplateProps}
            templateKey="layout"
            rootTagName="button"
            data={props}
          />
        );
      }
    : undefined;

  const iconComponent = templates.icon
    ? ({ isOpen }: { isOpen: boolean }) => {
        return (
          <TemplateComponent
            {...defaultTemplateProps}
            templateKey="icon"
            rootTagName="span"
            data={{ isOpen }}
          />
        );
      }
    : undefined;

  function renderTrigger() {
    const isOpen = chat.getOpen();
    const button = document.createElement('button');
    button.className = `ais-ChatTrigger ${
      userCssClasses.button ? String(userCssClasses.button) : ''
    }`;
    button.setAttribute('aria-label', 'Open chat');
    button.setAttribute('aria-pressed', String(isOpen));

    button.addEventListener('click', () => {
      chat.setOpen(!chat.getOpen());
      button.setAttribute('aria-pressed', String(chat.getOpen()));
    });

    if (LayoutComponent) {
      render(
        <LayoutComponent
          open={isOpen}
          onClick={() => {
            chat.setOpen(!isOpen);
            button.setAttribute('aria-pressed', String(chat.getOpen()));
          }}
          toggleIconComponent={iconComponent}
        />,
        button
      );
    } else {
      button.textContent = isOpen ? 'Close' : 'Chat';
    }

    render(button, containerNode);
  }

  renderTrigger();

  return {
    $$widgetType: 'ais.chatTrigger',
    dispose: () => {
      render(null, containerNode);
    },
  };
}
