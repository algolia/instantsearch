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
    indices: PropTypes.array,
    templateProps: PropTypes.object.isRequired,
  };

  renderNoResults({ label }) {
    const { cssClasses: { root, empty } } = this.props;
    const className = cx(root, empty);
    return (
      <div key={label}>
        <strong>{label}</strong>
        <Template
          rootProps={{ className }}
          templateKey="empty"
          {...this.props.templateProps}
        />
      </div>
    );
  }

  renderResults({ label, hits }) {
    const { cssClasses: { item } } = this.props;

    const hitsMarkup = hits.map((hit, __hitIndex) => (
      <Template
        key={hit.objectID}
        data={{ ...hit, __hitIndex }}
        rootProps={{ className: item }}
        templateKey="item"
        {...this.props.templateProps}
      />
    ));

    return (
      <div key={label}>
        <strong>{label}</strong>
        <div>{hitsMarkup}</div>
      </div>
    );
  }

  render() {
    const { indices, cssClasses: { root } } = this.props;

    const markup = indices.map(
      ({ label, hits }) =>
        hits
          ? this.renderResults({ label, hits })
          : this.renderNoResults({ label })
    );

    return <div className={root}>{markup}</div>;
  }
}

export default MultiIndexResults;
