import React from 'react';
import Highlighter from './Highlighter';

export default function Highlight(props) {
  return <Highlighter highlightProperty="_highlightResult" {...props} />;
}

Highlight.propTypes = {
  hit: React.PropTypes.object.isRequired,
  attributeName: React.PropTypes.string.isRequired,
  highlight: React.PropTypes.func.isRequired,
  tagName: React.PropTypes.string,
};
