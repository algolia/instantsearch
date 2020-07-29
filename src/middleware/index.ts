import { UiState, InstantSearch } from '../types';

export type MiddlewareDefinition = {
  $$type: string;
  onStateChange(options: { uiState: UiState }): void;
  subscribe(): void;
  unsubscribe(): void;
};

export type MiddlewareOptions = {
  instantSearchInstance: InstantSearch;
};

export type Middleware = (options: MiddlewareOptions) => MiddlewareDefinition;

export { createRouter, RouterProps } from './createRouter';
export { createInsightsMiddleware } from './insights';
