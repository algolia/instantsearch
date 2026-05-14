import { startsWith } from './startsWith';

import type { UIMessage } from '../ai-lite';


type ChatToolMessage = Extract<
  UIMessage['parts'][number],
  { type: `tool-${string}` }
>;

export const getTextContent = (message: UIMessage) => {
  return message.parts
    .map((part) => ('text' in part ? part.text : ''))
    .join('');
};

export const hasTextContent = (message: UIMessage) => {
  return getTextContent(message).trim() !== '';
};

export const isPartText = (
  part: UIMessage['parts'][number]
): part is Extract<UIMessage['parts'][number], { type: 'text' }> => {
  return part.type === 'text';
};

export const isPartTool = (
  part: UIMessage['parts'][number]
): part is ChatToolMessage => {
  return startsWith(part.type, 'tool-');
};

export function findTool<TTool>(
  partType: string,
  tools: Record<string, TTool>
): TTool | undefined {
  const toolName = partType.replace('tool-', '');
  let tool: TTool | undefined = tools[toolName];
  if (!tool) {
    tool = Object.entries(tools).find(([key]) =>
      startsWith(toolName, `${key}_`)
    )?.[1];
  }
  return tool;
}
