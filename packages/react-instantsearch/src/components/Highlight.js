import React from 'react';

export default function Highlight({hit, attributeName, highlight}) {
  const parsedHighlightedValue = highlight({hit, attributeName});
  const reactHighlighted = parsedHighlightedValue.map((v, i) => {
    const key = `split-${i}-${v.value}`;
    if (!v.isHighlighted) {
      return <span key={key} className="ais-Highlight__nonHighlighted">{v.value}</span>;
    }
    return <em key={key} className="ais-Highlight__highlighted">{v.value}</em>;
  });
  return <span className="ais-Highlight">{reactHighlighted}</span>;
}

Highlight.propTypes = {
  hit: React.PropTypes.object.isRequired,
  attributeName: React.PropTypes.string.isRequired,
  highlight: React.PropTypes.func.isRequired,
};
