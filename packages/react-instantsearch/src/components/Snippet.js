import React from 'react';

import Highlighter from './Highlighter';

export default function Snippet(props) {
  return <Highlighter highlightProperty="_snippetResult" {...props}/>;
}

Snippet.propTypes = {
  hit: React.PropTypes.object.isRequired,
  attributeName: React.PropTypes.string.isRequired,
  highlight: React.PropTypes.func.isRequired,
};
