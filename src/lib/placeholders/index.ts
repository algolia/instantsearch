import { InstantSearch, UiState } from '../types';

export type CreatePlaceholder<TArgs = any> = (args: TArgs) => Placeholder;

export type PlaceholderArgs = {
  uiState: UiState;
  instantSearchInstance: InstantSearch;
};

export type Placeholder = {
  (args: PlaceholderArgs): void;
  intialState?(args: PlaceholderArgs): UiState;
  subscribe?(args: PlaceholderArgs): void;
  // Would be nice to be able to force a namespace for each instance
  renderOptions?(args: PlaceholderArgs): { [key: string]: any };
};
