import React from 'react';
import map from 'lodash/collection/map';

import Template from './Template.js';

import hasKey from 'lodash/object/has';
import isEqual from 'lodash/lang/isEqual';
import cx from 'classnames';

class Hits extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.results.hits.length === 0 ||
      this.props.results.hits.length !== nextProps.results.hits.length ||
      !isEqual(this.props.results.hits, nextProps.results.hits);
  }

  renderWithResults() {
    let renderedHits = map(this.props.results.hits, (hit, position) => {
      let data = {
        ...hit,
        __hitIndex: position
      };
      return (
        <Template
          data={data}
          key={data.objectID}
          rootProps={{className: this.props.cssClasses.item}}
          templateKey="item"
          {...this.props.templateProps}
        />
      );
    });

    return <div className={this.props.cssClasses.root}>{renderedHits}</div>;
  }

  renderAllResults() {
    let className = cx(
      this.props.cssClasses.root,
      this.props.cssClasses.allItems
    );

    return (
      <Template
        data={this.props.results}
        rootProps={{className}}
        templateKey="allItems"
        {...this.props.templateProps}
      />
    );
  }

  renderNoResults() {
    let className = cx(
      this.props.cssClasses.root,
      this.props.cssClasses.empty
    );
    return (
      <Template
        data={this.props.results}
        rootProps={{className}}
        templateKey="empty"
        {...this.props.templateProps}
      />
    );
  }

  render() {
    let hasResults = this.props.results.hits.length > 0;
    let hasAllItemsTemplate = hasKey(this.props, 'templateProps.templates.allItems');

    if (!hasResults) {
      return this.renderNoResults();
    }

    // If a allItems template is defined, it takes precedence over our looping
    // through hits
    if (hasAllItemsTemplate) {
      return this.renderAllResults();
    }

    return this.renderWithResults();
  }
}

Hits.propTypes = {
  cssClasses: React.PropTypes.shape({
    root: React.PropTypes.string,
    item: React.PropTypes.string,
    allItems: React.PropTypes.string,
    empty: React.PropTypes.string
  }),
  results: React.PropTypes.object,
  templateProps: React.PropTypes.object.isRequired
};

Hits.defaultProps = {
  results: {hits: []}
};

export default Hits;
