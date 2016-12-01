import React from 'react';

export default function Highlight({hit, attributeName, highlight}) {
  const parsedHighlightedValue = highlight({hit, attributeName});
  const reactHighlighted = parsedHighlightedValue.map((v, i) => {
    if (!v.isHighlighted) return v.value;
    const key = `split-${i}-${v.value}`;
    return <em key={key} className="ais-highlighted__value">{v.value}</em>;
  });
  return <span className="ais-highlighted">{reactHighlighted}</span>;
}

Highlight.propTypes = {
  hit: React.PropTypes.object.isRequired,
  attributeName: React.PropTypes.string.isRequired,
  highlight: React.PropTypes.func.isRequired,
};
