/** @jsx h */

import { h } from 'preact';
import PropTypes from 'prop-types';
import Template from '../Template/Template';

const Stats = ({
  nbHits,
  nbSortedHits,
  areHitsSorted,
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
        hasManySortedResults: nbSortedHits > 1,
        hasNoSortedResults: nbSortedHits === 0,
        hasOneSortedResults: nbSortedHits === 1,
        hasManyResults: nbHits > 1,
        hasNoResults: nbHits === 0,
        hasOneResult: nbHits === 1,
        areHitsSorted,
        hitsPerPage,
        nbHits,
        nbSortedHits,
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
  nbSortedHits: PropTypes.number,
  areHitsSorted: PropTypes.bool,
  nbPages: PropTypes.number,
  page: PropTypes.number,
  processingTimeMS: PropTypes.number,
  query: PropTypes.string,
  templateProps: PropTypes.object.isRequired,
};

export default Stats;
