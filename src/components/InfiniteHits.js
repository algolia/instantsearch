import React from 'react';
import Hits from './Hits.js';

class InfiniteHits extends React.Component {

  render() {
    const {cssClasses, hits, results, showMore, showMoreLabel, templateProps} = this.props;
    const btn = this.props.isLastPage ?
     <button disabled>{showMoreLabel}</button> :
     <button onClick={showMore}>{showMoreLabel}</button>;

    return (
      <div>
        <Hits
          cssClasses={cssClasses}
          hits={hits}
          results={results}
          templateProps={templateProps}
        />
        <div className={cssClasses.showmore}>
          {btn}
        </div>
      </div>
    );
  }
}

InfiniteHits.propTypes = {
  cssClasses: React.PropTypes.shape({
    root: React.PropTypes.string,
    item: React.PropTypes.string,
    allItems: React.PropTypes.string,
    empty: React.PropTypes.string,
    showmore: React.PropTypes.string,
  }),
  hits: React.PropTypes.array,
  results: React.PropTypes.object,
  showMore: React.PropTypes.function,
  showMoreLabel: React.PropTypes.string,
  templateProps: React.PropTypes.object.isRequired,
  isLastPage: React.PropTypes.bool.isRequired,
};

export default InfiniteHits;
