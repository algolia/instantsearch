import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';

import { RawHits } from './Hits.js';
import panel from './decorators/panel.js';

export class RawInfiniteHits extends Component {
  render() {
    const {
      cssClasses,
      hits,
      results,
      showMore,
      showMoreLabel,
      templateProps,
    } = this.props;
    const btn = this.props.isLastPage ? (
      <button disabled>{showMoreLabel}</button>
    ) : (
      <button onClick={showMore}>{showMoreLabel}</button>
    );

    return (
      <div>
        <RawHits
          cssClasses={cssClasses}
          hits={hits}
          results={results}
          templateProps={templateProps}
        />
        <div className={cssClasses.showmore}>{btn}</div>
      </div>
    );
  }
}

RawInfiniteHits.propTypes = {
  cssClasses: PropTypes.shape({
    root: PropTypes.string,
    item: PropTypes.string,
    allItems: PropTypes.string,
    empty: PropTypes.string,
    showmore: PropTypes.string,
  }),
  hits: PropTypes.array,
  results: PropTypes.object,
  showMore: PropTypes.func,
  showMoreLabel: PropTypes.string,
  templateProps: PropTypes.object.isRequired,
  isLastPage: PropTypes.bool.isRequired,
};

export default panel(RawInfiniteHits);
