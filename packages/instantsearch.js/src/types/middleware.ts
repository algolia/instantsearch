import type { UiState } from './ui-state';
import type { AtLeastOne } from './utils';
import type InstantSearch from '../lib/InstantSearch';

export type MiddlewareDefinition<TUiState extends UiState = UiState> = {
  /**
   * string to identify the middleware
   */
  $$type: string;
  /**
   * @internal indicator for the default middleware
   */
  $$internal: boolean;
  /**
   * Change handler called on every UiState change
   */
  onStateChange: (options: { uiState: TUiState }) => void;
  /**
   * Called when the middleware is added to InstantSearch
   */
  subscribe: () => void;
  /**
   * Called when InstantSearch is started
   */
  started: () => void;
  /**
   * Called when the middleware is removed from InstantSearch
   */
  unsubscribe: () => void;
};

export type MiddlewareOptions = {
  instantSearchInstance: InstantSearch;
};

export type InternalMiddleware<TUiState extends UiState = UiState> = (
  options: MiddlewareOptions
) => MiddlewareDefinition<TUiState>;

export type Middleware<TUiState extends UiState = UiState> = (
  options: MiddlewareOptions
) => AtLeastOne<MiddlewareDefinition<TUiState>>;
