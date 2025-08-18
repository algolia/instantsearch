import type { UIMessage } from 'ai';

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';
export type ChatRole = 'data' | 'user' | 'assistant' | 'system';

export type ChatMessageBase = UIMessage;
