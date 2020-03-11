import { UiState } from '../types';

export type MiddlewareDefinition = {
  onStateChange(options: { state: UiState }): void;
  subscribe(): void;
  unsubscribe(): void;
};

export type Middleware = ({
  instantSearchInstance: InstantSearch,
}) => MiddlewareDefinition;

export { createRouter, RouterProps } from './createRouter';
