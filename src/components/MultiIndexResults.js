import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import Template from './Template';

class MultiIndexResults extends React.Component {
  static propTypes = {
    cssClasses: PropTypes.shape({
      root: PropTypes.string,
      item: PropTypes.string,
      empty: PropTypes.string,
    }),
    derivedIndices: PropTypes.array,
    templateProps: PropTypes.object.isRequired,
  };

  renderNoResults() {
    const { cssClasses: { root, empty } } = this.props;
    const className = cx(root, empty);
    return (
      <Template
        rootProps={{ className }}
        templateKey="empty"
        {...this.props.templateProps}
      />
    );
  }

  render() {
    const { derivedIndices, cssClasses: { root, item } } = this.props;
    const hasResults = derivedIndices.some(
      ({ results }) => results && results.hits && results.hits.length > 0
    );

    if (!hasResults) {
      return this.renderNoResults();
    }

    const renderedHits = derivedIndices
      .filter(({ results }) => results && results.hits)
      .map(({ label, results }) => (
        <div key={label}>
          <strong>{label}</strong>
          <div>
            {results.hits.map((hit, position) => {
              const data = { ...hit, __hitIndex: position };
              return (
                <Template
                  data={data}
                  key={data.objectID}
                  rootProps={{ className: item }}
                  templateKey="item"
                  {...this.props.templateProps}
                />
              );
            })}
          </div>
        </div>
      ));

    return <div className={root}>{renderedHits}</div>;
  }
}

export default MultiIndexResults;
