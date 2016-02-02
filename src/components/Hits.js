import React from 'react';
import map from 'lodash/collection/map';

import Template from './Template.js';

class Hits extends React.Component {
  renderWithResults() {
    let renderedHits = map(this.props.results.hits, hit => {
      return (
        <Template
          cssClass={this.props.cssClasses.item}
          data={hit}
          key={hit.objectID}
          templateKey="item"
          {...this.props.templateProps}
        />
      );
    });

    return <div className={this.props.cssClasses.root}>{renderedHits}</div>;
  }

  renderAllResults() {
    return (
      <Template
        cssClass={this.props.cssClasses.allItems}
        data={this.props.results}
        templateKey="allItems"
        {...this.props.templateProps}
      />
    );
  }

  renderNoResults() {
    let className = this.props.cssClasses.root + ' ' + this.props.cssClasses.empty;
    return (
      <Template
        cssClass={className}
        data={this.props.results}
        templateKey="empty"
        {...this.props.templateProps}
      />
    );
  }

  render() {
    if (this.props.results.hits.length > 0) {
      const useAllItemsTemplate =
        this.props.templateProps &&
        this.props.templateProps.templates &&
        this.props.templateProps.templates.allItems;
      if (useAllItemsTemplate) {
        return this.renderAllResults();
      }
      return this.renderWithResults();
    }
    return this.renderNoResults();
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
