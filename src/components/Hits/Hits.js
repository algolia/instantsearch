/** @jsx h */

import { h } from 'preact';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Template from '../Template/Template';

const Hits = ({ results, hits, bindEvent, cssClasses, templateProps }) => {
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
            bindEvent={bindEvent}
          />
        ))}
      </ol>
    </div>
  );
};

Hits.propTypes = {
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    emptyRoot: PropTypes.string.isRequired,
    item: PropTypes.string.isRequired,
    list: PropTypes.string.isRequired,
  }).isRequired,
  hits: PropTypes.array.isRequired,
  results: PropTypes.object.isRequired,
  sendEvent: PropTypes.func.isRequired,
  bindEvent: PropTypes.func.isRequired,
  templateProps: PropTypes.object.isRequired,
};

Hits.defaultProps = {
  results: { hits: [] },
  hits: [],
};

export default Hits;
