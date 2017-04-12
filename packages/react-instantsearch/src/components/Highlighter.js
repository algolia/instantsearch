import React from 'react';

export default function Highlighter(
  { hit, attributeName, highlight, highlightProperty, tagName }
) {
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
  return <span className="ais-Highlight">{reactHighlighted}</span>;
}

Highlighter.propTypes = {
  hit: React.PropTypes.object.isRequired,
  attributeName: React.PropTypes.string.isRequired,
  highlight: React.PropTypes.func.isRequired,
  highlightProperty: React.PropTypes.string.isRequired,
  tagName: React.PropTypes.string,
};
