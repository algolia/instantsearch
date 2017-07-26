import PropTypes from 'prop-types';
import React from 'react';

export default function Highlighter({
  hit,
  attributeName,
  highlight,
  highlightProperty,
  tagName,
}) {
  const parsedHighlightedValue = highlight({
    hit,
    attributeName,
    highlightProperty,
  });
  const reactHighlighted = parsedHighlightedValue.map((v, i) => {
    const key = `split-${i}-${v.value}`;
    if (!v.isHighlighted) {
      return (
        <span key={key} className="ais-Highlight__nonHighlighted">
          {v.value}
        </span>
      );
    }
    const HighlightedTag = tagName ? tagName : 'em';
    return (
      <HighlightedTag key={key} className="ais-Highlight__highlighted">
        {v.value}
      </HighlightedTag>
    );
  });
  return (
    <span className="ais-Highlight">
      {reactHighlighted}
    </span>
  );
}

Highlighter.propTypes = {
  hit: PropTypes.object.isRequired,
  attributeName: PropTypes.string.isRequired,
  highlight: PropTypes.func.isRequired,
  highlightProperty: PropTypes.string.isRequired,
  tagName: PropTypes.string,
};
