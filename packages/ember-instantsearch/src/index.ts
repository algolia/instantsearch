export { default as Connector } from './components/connector.gts';
export { default as Highlight } from './components/highlight.gts';
export { default as Index } from './components/index-widget.gts';
export { default as InstantSearch } from './components/instant-search.gts';
export { default as Widget } from './components/widget.gts';
export { useConnector } from './use-connector.ts';
export { default as version } from './version.ts';

export type { ConnectorSignature } from './components/connector.gts';
export type { HighlightSignature } from './components/highlight.gts';
export type { IndexSignature } from './components/index-widget.gts';
export type { InstantSearchSignature } from './components/instant-search.gts';
export type { Yielded } from './-private/yielded.ts';
export type { WidgetParams, WidgetSignature } from './components/widget.gts';
export type {
  AdditionalWidgetProperties,
  Connection,
  RenderState,
} from './use-connector.ts';
export type { Parent } from './types.ts';
