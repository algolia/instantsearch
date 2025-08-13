import type { ChatMessageBase, ChatStatus } from 'instantsearch-ui-components';

export type UseChatProps = {
  api: string;
  headers?: Record<string, string>;
};

export function useChat({ api, headers }: UseChatProps) {
  const messages: ChatMessageBase[] = [];
  const setMessages = () => {};
  const input = '';
  const handleSubmit = () => {};
  const setInput = () => {};
  const status: ChatStatus = 'ready';
  const stop = () => {};
  const reload = () => {};

  return {
    messages,
    setMessages,
    input,
    handleSubmit,
    setInput,
    status,
    stop,
    reload,
  };
}
