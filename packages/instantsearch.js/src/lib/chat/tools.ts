import type { ChatToolType } from 'instantsearch-ui-components';

export const SearchIndexToolType: ChatToolType = 'tool-algolia_search_index';

export const defaultTools: ChatToolType[] = [SearchIndexToolType];
