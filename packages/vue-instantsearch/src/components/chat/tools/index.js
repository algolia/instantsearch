import {
  SearchIndexToolType,
  RecommendToolType,
  DisplayResultsToolType,
  MemorizeToolType,
  MemorySearchToolType,
  PonderToolType,
} from 'instantsearch.js/es/lib/chat';

import { createDisplayResultsTool } from './DisplayResultsTool';
import { createCarouselTool } from './SearchIndexTool';

export { createCarouselTool, createDisplayResultsTool };

/**
 * Default client-side tools for the Vue Chat widget, mirroring
 * react-instantsearch's `createDefaultTools`. Carousel-based tools reuse the
 * ported `AisCarousel`; memory/ponder tools are no-op placeholders.
 */
export function createDefaultTools(itemComponent, getSearchPageURL) {
  return {
    [SearchIndexToolType]: createCarouselTool(
      true,
      itemComponent,
      getSearchPageURL
    ),
    [RecommendToolType]: createCarouselTool(
      false,
      itemComponent,
      getSearchPageURL
    ),
    [DisplayResultsToolType]: createDisplayResultsTool(itemComponent),
    [MemorizeToolType]: {},
    [MemorySearchToolType]: {},
    [PonderToolType]: {},
  };
}
