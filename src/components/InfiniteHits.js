import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';
import map from 'lodash/map';
import cx from 'classnames';
import Template from './Template.js';

class InfiniteHits extends Component {
  renderResults() {
    const renderedHits = map(this.props.hits, (hit, position) => {
      const data = {
        ...hit,
        __hitIndex: position,
      };

      return (
        <Template
          rootTagName="li"
          data={data}
          key={data.objectID}
          rootProps={{ className: cx(this.props.cssClasses.item) }}
          templateKey="item"
          {...this.props.templateProps}
        />
      );
    });

    return <ol className={cx(this.props.cssClasses.list)}>{renderedHits}</ol>;
  }

  renderEmpty() {
    return (
      <Template
        data={this.props.results}
        rootProps={{
          className: cx(
            this.props.cssClasses.root,
            this.props.cssClasses.emptyRoot
          ),
        }}
        templateKey="empty"
        {...this.props.templateProps}
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
      <button disabled className={cx(cssClasses.loadMore)}>
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
      <div className={cx(cssClasses.root)}>
        {hitsList}

        {loadMoreButton}
      </div>
    );
  }
}

InfiniteHits.propTypes = {
  cssClasses: PropTypes.shape({
    root: PropTypes.string,
    emptyRoot: PropTypes.string,
    list: PropTypes.string,
    item: PropTypes.string,
    loadMore: PropTypes.string,
    disabledLoadMore: PropTypes.string,
  }),
  hits: PropTypes.array,
  results: PropTypes.object,
  showMore: PropTypes.func,
  loadMoreLabel: PropTypes.string,
  templateProps: PropTypes.object.isRequired,
  isLastPage: PropTypes.bool.isRequired,
};

export default InfiniteHits;
