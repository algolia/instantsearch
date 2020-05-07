import { UiState } from '../types';

export type MiddlewareDefinition = {
  onStateChange(options: { uiState: UiState }): void;
  subscribe(): void;
  unsubscribe(): void;
};

export type Middleware = ({
  instantSearchInstance: InstantSearch,
}) => MiddlewareDefinition;

export { createRouter, RouterProps } from './createRouter';
