import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import cx from 'classnames';
import map from 'lodash/map';
import Template from './Template.js';

class InfiniteHits extends Component {
  renderResults() {
    const renderedHits = map(this.props.hits, (hit, position) => (
      <Template
        {...this.props.templateProps}
        templateKey="item"
        rootTagName="li"
        rootProps={{ className: this.props.cssClasses.item }}
        key={hit.objectID}
        data={{
          ...hit,
          __hitIndex: position,
        }}
      />
    ));

    return <ol className={this.props.cssClasses.list}>{renderedHits}</ol>;
  }

  renderEmpty() {
    return (
      <Template
        {...this.props.templateProps}
        templateKey="empty"
        rootProps={{
          className: cx(
            this.props.cssClasses.root,
            this.props.cssClasses.emptyRoot
          ),
        }}
        data={this.props.results}
      />
    );
  }

  render() {
    const {
      cssClasses,
      hits,
      showMore,
      loadMoreLabel,
      isLastPage,
    } = this.props;

    if (hits.length === 0) {
      return this.renderEmpty();
    }

    const hitsList = this.renderResults();

    const loadMoreButton = isLastPage ? (
      <button disabled className={cssClasses.loadMore}>
        {loadMoreLabel}
      </button>
    ) : (
      <button
        onClick={showMore}
        className={cx(cssClasses.loadMore, cssClasses.disabledLoadMore)}
      >
        {loadMoreLabel}
      </button>
    );

    return (
      <div className={cssClasses.root}>
        {hitsList}

        {loadMoreButton}
      </div>
    );
  }
}

InfiniteHits.propTypes = {
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    emptyRoot: PropTypes.string.isRequired,
    list: PropTypes.string.isRequired,
    item: PropTypes.string.isRequired,
    loadMore: PropTypes.string.isRequired,
    disabledLoadMore: PropTypes.string.isRequired,
  }).isRequired,
  hits: PropTypes.array,
  results: PropTypes.object,
  showMore: PropTypes.func,
  loadMoreLabel: PropTypes.string,
  templateProps: PropTypes.object.isRequired,
  isLastPage: PropTypes.bool.isRequired,
};

export default InfiniteHits;
