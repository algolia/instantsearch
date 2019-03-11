import { InstantSearch } from './instantsearch';

export type RenderOptions<T = unknown> = {
  widgetParams: T;
  instantSearchInstance: InstantSearch;
};

export type Renderer<T extends RenderOptions> = (
  renderOptions: T,
  isFirstRender: boolean
) => void;
