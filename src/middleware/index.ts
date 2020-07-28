import { UiState, InstantSearch } from '../types';

export type MiddlewareDefinition<TExtraDefinition = {}> = {
  $$type: string;
  onStateChange(options: { uiState: UiState }): void;
  subscribe(): void;
  unsubscribe(): void;
} & TExtraDefinition;

export type MiddlewareOptions = {
  instantSearchInstance: InstantSearch;
};

export type Middleware<TExtraDefinition = {}> = (
  options: MiddlewareOptions
) => MiddlewareDefinition<TExtraDefinition>;

export { createRouter, RouterProps } from './createRouter';
export { createInsightsMiddleware } from './insights';
