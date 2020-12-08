import { InstantSearch, UiState } from '../types';

export type MiddlewareDefinition = {
  onStateChange(options: { uiState: UiState }): void;
  subscribe(): void;
  unsubscribe(): void;
};

export type Middleware = (args: {
  instantSearchInstance: InstantSearch;
}) => MiddlewareDefinition;

export { createRouter, RouterProps } from './createRouter';
export { createTelemetry } from './createTelemetry';
