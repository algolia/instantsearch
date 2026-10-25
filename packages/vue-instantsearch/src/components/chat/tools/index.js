import { shouldSearchToolRenderResults } from 'instantsearch-ui-components';
import {
  SearchIndexToolType,
  RecommendToolType,
  DisplayResultsToolType,
  GroupedResultsToolType,
  CompareProductsToolType,
  MemorizeToolType,
  MemorySearchToolType,
  PonderToolType,
} from 'instantsearch.js/es/lib/chat';

import { createCompareProductsTool } from './CompareProductsTool';
import { createGroupedResultsTool } from './GroupedResultsTool';
import { createCarouselTool } from './SearchIndexTool';

export {
  createCarouselTool,
  createCompareProductsTool,
  createGroupedResultsTool,
};

/**
 * Default client-side tools for the Vue Chat widget, mirroring
 * react-instantsearch's `createDefaultTools`. Carousel-based tools reuse the
 * ported `AisCarousel`; memory/ponder tools are no-op placeholders.
 *
 * Unlike React, the item renderer is a getter (`getItemComponent`) resolved
 * at render time, so slot changes don't re-create the widget.
 */
export function createDefaultTools(getItemComponent, getSearchPageURL) {
  const groupedResultsTool = createGroupedResultsTool(getItemComponent);

  return {
    [SearchIndexToolType]: Object.assign(
      createCarouselTool(true, getItemComponent, getSearchPageURL),
      // The agent decides per turn whether the richer Grouped Results tool
      // takes over the rendering of the search results.
      { shouldRender: shouldSearchToolRenderResults }
    ),
    [RecommendToolType]: createCarouselTool(
      false,
      getItemComponent,
      getSearchPageURL
    ),
    [GroupedResultsToolType]: groupedResultsTool,
    // Agents configured before the rename still emit the legacy tool name.
    [DisplayResultsToolType]: groupedResultsTool,
    [CompareProductsToolType]: createCompareProductsTool(getItemComponent),
    [MemorizeToolType]: {},
    [MemorySearchToolType]: {},
    [PonderToolType]: {},
  };
}

/**
 * Merges user tools over the defaults. Overriding a tool's `layoutComponent`
 * keeps the default's `streamInput` and `shouldRender`, so a custom rendering
 * doesn't opt the tool out of the conditions under which the default renders
 * at all.
 */
export function mergeToolOptions(defaultTools, userTools) {
  if (!userTools) {
    return defaultTools;
  }

  const tools = Object.assign({}, defaultTools, userTools);

  Object.keys(userTools).forEach((toolName) => {
    const userTool = userTools[toolName];
    const defaultTool = defaultTools[toolName];
    const defaultStreamInput = defaultTool && defaultTool.streamInput;

    if (
      userTool.layoutComponent !== undefined &&
      userTool.streamInput === undefined &&
      defaultStreamInput !== undefined
    ) {
      tools[toolName] = Object.assign({}, tools[toolName], {
        streamInput: defaultStreamInput,
      });
    }

    if (
      userTool.shouldRender === undefined &&
      defaultTool &&
      defaultTool.shouldRender
    ) {
      tools[toolName] = Object.assign({}, tools[toolName], {
        shouldRender: defaultTool.shouldRender,
      });
    }
  });

  return tools;
}
