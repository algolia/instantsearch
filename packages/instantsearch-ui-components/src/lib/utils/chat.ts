import { startsWith } from './startsWith';

import type { ChatMessageBase } from '../../components';

export const getTextContent = (message: ChatMessageBase) => {
  return message.parts
    .map((part) => ('text' in part ? part.text : ''))
    .join('');
};

export const hasTextContent = (message: ChatMessageBase) => {
  return getTextContent(message).trim() !== '';
};

export const getToolParts = (message: ChatMessageBase) => {
  return message.parts.filter((part) => startsWith(part.type, 'tool-'));
};

export const hasToolParts = (message: ChatMessageBase) => {
  return getToolParts(message).length > 0;
};
