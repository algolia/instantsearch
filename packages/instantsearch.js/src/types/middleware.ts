import type InstantSearch from '../lib/InstantSearch';
import type { UiState } from './ui-state';
import type { AtLeastOne } from './utils';

export type MiddlewareDefinition<TUiState extends UiState = UiState> = {
  $$type: string;
  onStateChange(options: { uiState: TUiState }): void;
  subscribe(): void;
  started(): void;
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
