import React from 'react';
import Hits from './Hits.js';

class InfiniteHits extends React.Component {

  render() {
    const {cssClasses, hits, results, templateProps, showMore, showMoreLabel} = this.props;
    return (
      <div>
        <Hits
          cssClasses={cssClasses}
          hits={hits}
          results={results}
          templateProps={templateProps}
        />
        <div className={cssClasses.showmore}><button onClick={showMore}>{showMoreLabel}</button></div>
      </div>
    );
  }
}

export default InfiniteHits;
