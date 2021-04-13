import InstantSearch from '../lib/InstantSearch';
import { UiState } from './ui-state';
import { AtLeastOne } from './utils';

export type MiddlewareDefinition = {
  onStateChange(options: { uiState: UiState }): void;
  subscribe(): void;
  unsubscribe(): void;
};

export type MiddlewareOptions = {
  instantSearchInstance: InstantSearch;
};

export type InternalMiddleware = (
  options: MiddlewareOptions
) => MiddlewareDefinition;

export type Middleware = (
  options: MiddlewareOptions
) => AtLeastOne<MiddlewareDefinition>;
