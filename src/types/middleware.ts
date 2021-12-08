import type InstantSearch from '../lib/InstantSearch.js';
import type { UiState } from './ui-state.js';
import type { AtLeastOne } from './utils/index.js';

export type MiddlewareDefinition<TUiState extends UiState = UiState> = {
  onStateChange(options: { uiState: TUiState }): void;
  subscribe(): void;
  unsubscribe(): void;
};

export type MiddlewareOptions = {
  instantSearchInstance: InstantSearch;
};

export type InternalMiddleware<TUiState extends UiState = UiState> = (
  options: MiddlewareOptions
) => MiddlewareDefinition<TUiState>;

export type Middleware = (
  options: MiddlewareOptions
) => AtLeastOne<MiddlewareDefinition>;
