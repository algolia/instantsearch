import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import cx from 'classnames';
import map from 'lodash/map';
import Template from './Template.js';

class Hits extends Component {
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

    return (
      <div className={this.props.cssClasses.root}>
        <ol className={this.props.cssClasses.list}>{renderedHits}</ol>
      </div>
    );
  }

  renderEmpty() {
    const className = cx(
      this.props.cssClasses.root,
      this.props.cssClasses.emptyRoot
    );

    return (
      <Template
        {...this.props.templateProps}
        templateKey="empty"
        rootProps={{ className }}
        data={this.props.results}
      />
    );
  }

  render() {
    const hasResults = this.props.results.hits.length > 0;

    if (!hasResults) {
      return this.renderEmpty();
    }

    return this.renderResults();
  }
}

Hits.propTypes = {
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    emptyRoot: PropTypes.string.isRequired,
    item: PropTypes.string.isRequired,
    list: PropTypes.string.isRequired,
  }).isRequired,
  hits: PropTypes.array,
  results: PropTypes.object,
  templateProps: PropTypes.object.isRequired,
};

Hits.defaultProps = {
  results: { hits: [] },
};

export default Hits;
