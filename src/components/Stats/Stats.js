/** @jsx h */

import { h } from 'preact';
import PropTypes from 'prop-types';
import Template from '../Template/Template';

const Stats = ({
  nbHits,
  hitsPerPage,
  nbPages,
  page,
  processingTimeMS,
  query,
  templateProps,
  cssClasses,
}) => (
  <div className={cssClasses.root}>
    <Template
      {...templateProps}
      templateKey="text"
      rootTagName="span"
      rootProps={{ className: cssClasses.text }}
      data={{
        hasManyResults: nbHits > 1,
        hasNoResults: nbHits === 0,
        hasOneResult: nbHits === 1,
        hitsPerPage,
        nbHits,
        nbPages,
        page,
        processingTimeMS,
        query,
        cssClasses,
      }}
    />
  </div>
);

Stats.propTypes = {
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
  hitsPerPage: PropTypes.number,
  nbHits: PropTypes.number,
  nbPages: PropTypes.number,
  page: PropTypes.number,
  processingTimeMS: PropTypes.number,
  query: PropTypes.string,
  templateProps: PropTypes.object.isRequired,
};

export default Stats;
