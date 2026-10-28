import { warning } from './logger';
import { startsWith } from './startsWith';

import type { UIMessage } from '../ai-lite';

export type ChatMessageBase = UIMessage;

export type ChatToolMessage = Extract<
  UIMessage['parts'][number],
  { type: `tool-${string}` }
>;

export type ChatToolType = ChatToolMessage['type'];

export const getTextContent = (message: UIMessage) => {
  return message.parts
    .map((part) => (part.type === 'text' ? part.text : ''))
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

const TOOL_PART_PREFIX = 'tool-';

type ToolNameMatcher = {
  matchesToolName?: (toolName: string) => boolean;
};

/**
 * Resolves the tool a message part belongs to, from either a part type
 * (`tool-algolia_search_index`) or a bare tool name.
 *
 * An exact registration wins. Otherwise only tools whose `matchesToolName`
 * claims the name are considered, most specific first, for servers that name a
 * call after the registered tool: the Algolia MCP Server appends the index name
 * (`algolia_search_index_products`).
 *
 * Generic over the tool shape: the renderer, the loader, the widget and the
 * connector hold different subsets of the tool contract.
 */
export const findTool = <TTool>(
  partType: string,
  tools: Record<string, TTool>
): TTool | undefined => {
  const toolName = startsWith(partType, TOOL_PART_PREFIX)
    ? partType.slice(TOOL_PART_PREFIX.length)
    : partType;

  if (tools[toolName]) {
    return tools[toolName];
  }

  const claimants = Object.keys(tools).filter((key) =>
    Boolean(
      (tools[key] as ToolNameMatcher | undefined)?.matchesToolName?.(toolName)
    )
  );

  if (claimants.length === 0) {
    if (__DEV__) {
      const prefixes = Object.keys(tools)
        .filter((key) => startsWith(toolName, `${key}_`))
        .sort();

      const registered = prefixes.map((key) => `"${key}"`).join(', ');

      warning(
        prefixes.length === 0,
        `No tool is registered for "${toolName}". ${
          prefixes.length > 1
            ? `The registered tools ${registered} are prefixes of it`
            : `The registered tool ${registered} is a prefix of it`
        }, but a prefix alone doesn't resolve: declare \`matchesToolName\` on the tool that should handle "${toolName}".`
      );
    }

    return undefined;
  }

  // Most specific claim wins, ties by name, so the winner doesn't depend on
  // registration order.
  claimants.sort((a, b) => b.length - a.length || (a < b ? -1 : 1));

  if (__DEV__) {
    warning(
      claimants.length === 1,
      `Multiple tools claim "${toolName}" through \`matchesToolName\`: ${claimants
        .map((key) => `"${key}"`)
        .join(', ')}. "${claimants[0]}" handles it.`
    );
  }

  return tools[claimants[0]];
};
