import InstantSearch from '../lib/InstantSearch';
import { UiState } from './ui-state';
import { AtLeastOne } from './utils';

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
