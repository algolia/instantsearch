import { createHighlightComponent } from '@algolia/ui-components-highlight-vdom';
import { createElement, Fragment } from 'preact';

export const InternalHighlight = createHighlightComponent({
  createElement,
  Fragment,
});
