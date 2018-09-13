import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';
import map from 'lodash/map';
import Template from './Template.js';
import cx from 'classnames';

class Hits extends Component {
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
          rootProps={{ className: this.props.cssClasses.item }}
          templateKey="item"
          {...this.props.templateProps}
        />
      );
    });

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
        data={this.props.results}
        rootProps={{ className }}
        templateKey="empty"
        {...this.props.templateProps}
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
    root: PropTypes.string,
    emptyRoot: PropTypes.string,
    item: PropTypes.string,
    list: PropTypes.string,
  }),
  hits: PropTypes.array,
  results: PropTypes.object,
  templateProps: PropTypes.object.isRequired,
};

Hits.defaultProps = {
  results: { hits: [] },
};

export default Hits;
