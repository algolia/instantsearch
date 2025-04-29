import { createHighlightComponent } from 'instantsearch-ui-components';
import { createElement, Fragment } from 'preact';

export const InternalHighlight = createHighlightComponent({
  createElement,
  Fragment,
});
