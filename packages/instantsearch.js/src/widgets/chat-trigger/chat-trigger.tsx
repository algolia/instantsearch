/** @jsx h */

import { createChatToggleButtonComponent } from 'instantsearch-ui-components';
import { h, Fragment, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectChatTrigger from '../../connectors/chat/connectChatTrigger';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type { ChatTriggerRenderState } from '../../connectors/chat/connectChatTrigger';
import type { Template } from '../../types';
import type {
  ChatToggleButtonProps,
  Pragma,
} from 'instantsearch-ui-components';

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
   * Templates to use for the widget.
   */
  templates?: ChatTriggerTemplates;

  /**
   * CSS classes to add.
   */
  cssClasses?: ChatTriggerCSSClasses;
};

const ChatToggleButton = createChatToggleButtonComponent({
  createElement: h as unknown as Pragma,
  Fragment,
});

export default function chatTrigger(widgetParams: ChatTriggerWidgetParams) {
  const {
    container,
    templates: userTemplates = {},
    cssClasses: userCssClasses = {},
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
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
            rootTagName="fragment"
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

  function renderTrigger(
    renderState: ChatTriggerRenderState,
    _isFirstRender: boolean
  ) {
    const { open, toggleOpen } = renderState;

    if (LayoutComponent) {
      render(
        <LayoutComponent
          open={open}
          onClick={toggleOpen}
          toggleIconComponent={iconComponent}
        />,
        containerNode
      );
    } else {
      render(
        <ChatToggleButton
          open={open}
          onClick={toggleOpen}
          toggleIconComponent={iconComponent}
          classNames={{ root: userCssClasses.button }}
        />,
        containerNode
      );
    }
  }

  const makeWidget = connectChatTrigger(renderTrigger, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({}),
    $$widgetType: 'ais.chatTrigger' as const,
  };
}
