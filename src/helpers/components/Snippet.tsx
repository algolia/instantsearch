// @ts-nocheck
/** @jsx h */
import { h, Fragment } from 'preact';
import getHighlightedParts from '../../lib/utils/getHighlightedParts';
import getPropertyByPath from '../../lib/utils/getPropertyByPath';
import unescape from '../../lib/utils/unescape';
import { cx, InternalHighlight } from './InternalHighlight';

function SnippetUiComponent({ classNames = {}, ...props }) {
  return (
    <InternalHighlight
      classNames={{
        root: cx('ais-Snippet', classNames.root),
        highlighted: cx('ais-Snippet-highlighted', classNames.highlighted),
        nonHighlighted: cx(
          'ais-Snippet-nonHighlighted',
          classNames.nonHighlighted
        ),
        separator: cx('ais-Snippet-separator', classNames.separator),
      }}
      {...props}
    />
  );
}

export function Snippet({
  hit,
  attribute,
  highlightedTagName,
  nonHighlightedTagName,
  separator,
  ...props
}) {
  const property = getPropertyByPath(hit._snippetResult, attribute) || [];
  const properties = Array.isArray(property) ? property : [property];

  const parts = properties.map((singleValue) =>
    getHighlightedParts(unescape(singleValue.value || ''))
  );

  return (
    <SnippetUiComponent
      {...props}
      parts={parts}
      highlightedTagName={highlightedTagName}
      nonHighlightedTagName={nonHighlightedTagName}
      separator={separator}
    />
  );
}
