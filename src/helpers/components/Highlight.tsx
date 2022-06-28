// @ts-nocheck
/** @jsx h */
import { h, Fragment } from 'preact';
import getHighlightedParts from '../../lib/utils/getHighlightedParts';
import getPropertyByPath from '../../lib/utils/getPropertyByPath';
import unescape from '../../lib/utils/unescape';
import { cx, InternalHighlight } from './InternalHighlight';

function HighlightUiComponent({ classNames = {}, ...props }) {
  return (
    <InternalHighlight
      classNames={{
        root: cx('ais-Highlight', classNames.root),

        highlighted: cx('ais-Highlight-highlighted', classNames.highlighted),
        nonHighlighted: cx(
          'ais-Highlight-nonHighlighted',

          classNames.nonHighlighted
        ),

        separator: cx('ais-Highlight-separator', classNames.separator),
      }}
      {...props}
    />
  );
}

export function Highlight({
  hit,
  attribute,
  highlightedTagName,
  nonHighlightedTagName,
  separator,
  ...props
}) {
  const property = getPropertyByPath(hit._highlightResult, attribute) || [];
  const properties = Array.isArray(property) ? property : [property];

  const parts = properties.map((singleValue) =>
    getHighlightedParts(unescape(singleValue.value || ''))
  );

  return (
    <HighlightUiComponent
      {...props}
      parts={parts}
      highlightedTagName={highlightedTagName}
      nonHighlightedTagName={nonHighlightedTagName}
      separator={separator}
    />
  );
}
