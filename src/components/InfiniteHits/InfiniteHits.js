import React from 'preact-compat';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Template from '../Template/Template';

const InfiniteHits = ({
  results,
  hits,
  showMore,
  isLastPage,
  cssClasses,
  templateProps,
}) => {
  if (results.hits.length === 0) {
    return (
      <Template
        {...templateProps}
        templateKey="empty"
        rootProps={{
          className: cx(cssClasses.root, cssClasses.emptyRoot),
        }}
        data={results}
      />
    );
  }

  return (
    <div className={cssClasses.root}>
      <ol className={cssClasses.list}>
        {hits.map((hit, position) => (
          <Template
            {...templateProps}
            templateKey="item"
            rootTagName="li"
            rootProps={{ className: cssClasses.item }}
            key={hit.objectID}
            data={{
              ...hit,
              __hitIndex: position,
            }}
          />
        ))}
      </ol>

      <Template
        {...templateProps}
        templateKey="showMore"
        rootTagName="button"
        rootProps={{
          className: cx(cssClasses.loadMore, {
            [cssClasses.disabledLoadMore]: isLastPage,
          }),
          disabled: isLastPage,
          onClick: showMore,
        }}
      />
    </div>
  );
};

InfiniteHits.propTypes = {
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    emptyRoot: PropTypes.string.isRequired,
    list: PropTypes.string.isRequired,
    item: PropTypes.string.isRequired,
    loadMore: PropTypes.string.isRequired,
    disabledLoadMore: PropTypes.string.isRequired,
  }).isRequired,
  hits: PropTypes.array.isRequired,
  results: PropTypes.object.isRequired,
  showMore: PropTypes.func,
  templateProps: PropTypes.object.isRequired,
  isLastPage: PropTypes.bool.isRequired,
};

export default InfiniteHits;
