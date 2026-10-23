import { fakeAct, skippableDescribe } from '../../common';

import { createInsightsTests } from './insights';
import { createOptionsTests } from './options';
import { createTemplatesTests } from './templates';

import type { TestOptions, TestSetup } from '../../common';
import type {
  AutocompleteConnectorParams,
  TransformItemsIndicesConfig,
} from 'instantsearch.js/es/connectors/autocomplete/connectAutocomplete';
import type { AutocompleteWidget } from 'instantsearch.js/src/widgets/autocomplete/autocomplete';
import type { AutocompleteProps } from 'react-instantsearch';

type JSBaseWidgetParams = Parameters<AutocompleteWidget>[0];
export type JSAutocompleteWidgetParams = Omit<JSBaseWidgetParams, 'container'> &
  AutocompleteConnectorParams;
export type ReactAutocompleteWidgetParams = AutocompleteProps<any>;

type AutocompleteWidgetParams = {
  javascript: JSAutocompleteWidgetParams;
  react: ReactAutocompleteWidgetParams;
  vue: {
    requiresSearch?: boolean;
    indices?: Array<Record<string, unknown>>;
    feeds?: Array<Record<string, unknown>>;
    showQuerySuggestions?: Record<string, unknown>;
    showPromptSuggestions?: Record<string, unknown>;
    showRecent?: boolean | Record<string, unknown>;
    searchParameters?: Record<string, unknown>;
    getSearchPageUrl?: (uiState: any) => string;
    onSelect?: (params: any) => void;
    transformItems?: (
      indices: TransformItemsIndicesConfig[]
    ) => TransformItemsIndicesConfig[];
    placeholder?: string;
    autofocus?: boolean;
    detachedMediaQuery?: string;
    translations?: Record<string, string>;
    aiMode?: boolean;
    /**
     * Scoped slots (`item`, `header`, `noResults`, `querySuggestionItem`,
     * `promptSuggestionItem`, `recentItem`, `panel`, ...).
     */
    slots?: Record<string, (scope: any) => any>;
  };
};

declare module '../../common' {
  interface FlavoredWidgetParams {
    createAutocompleteWidgetTests: AutocompleteWidgetParams;
  }
}

export type AutocompleteWidgetSetup = TestSetup<{
  widgetParams: AutocompleteWidgetParams;
}>;

export function createAutocompleteWidgetTests(
  setup: AutocompleteWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    Object.defineProperty(window, 'scrollTo', {
      writable: true,
      value: jest.fn(),
    });
  });

  skippableDescribe('Autocomplete widget common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests, flavor });
    createTemplatesTests(setup, { act, skippedTests, flavor });
    createInsightsTests(setup, { act, skippedTests, flavor });
  });
}
createAutocompleteWidgetTests.flavored = true;
