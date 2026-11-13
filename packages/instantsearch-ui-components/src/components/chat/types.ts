import type { ComponentProps } from '../../types';
import type {
  AbstractChat,
  ClientSideToolComponentProps,
  ClientSideTool as CoreClientSideTool,
  UIMessage,
} from 'instantsearch-core';
import type { ChatState } from 'instantsearch-core/internal';

export type ClientSideToolComponent = (
  props: ClientSideToolComponentProps
) => JSX.Element;

export type ClientSideTool = Omit<CoreClientSideTool, 'layoutComponent'> & {
  layoutComponent?: ClientSideToolComponent;
};

export type ClientSideTools = Record<string, ClientSideTool>;

export type ChatLayoutOwnProps<TMessage extends UIMessage = UIMessage> = {
  open: boolean;
  maximized: boolean;
  headerComponent: JSX.Element;
  messagesComponent: JSX.Element;
  promptComponent: JSX.Element;
  classNames?: { root?: string | string[]; container?: string | string[] };
  isClearing?: boolean;
  clearMessages?: () => void;
  onClearTransitionEnd?: () => void;
  suggestions?: string[];
  tools: ClientSideTools;
} & Pick<ChatState<TMessage>, 'messages'> &
  Partial<Pick<ChatState<TMessage>, 'status'>> &
  Pick<
    AbstractChat<TMessage>,
    'sendMessage' | 'regenerate' | 'stop' | 'error'
  > &
  ComponentProps<'div'>;
