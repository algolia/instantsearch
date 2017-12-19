import PropTypes from 'prop-types';
import React from 'react';

import Highlighter from './Highlighter';

export default function Snippet(props) {
  return <Highlighter highlightProperty="_snippetResult" {...props} />;
}

Snippet.propTypes = {
  hit: PropTypes.object.isRequired,
  attributeName: PropTypes.string.isRequired,
  highlight: PropTypes.func.isRequired,
  tagName: PropTypes.string,
  nonHighlightedTagName: PropTypes.string,
  separatorComponent: PropTypes.node,
};
