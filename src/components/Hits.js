import React from 'react';
import map from 'lodash/collection/map';

import Template from './Template.js';

import isEqual from 'lodash/lang/isEqual';
import cx from 'classnames';

class Hits extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.results.hits.length === 0 ||
      this.props.results.hits.length !== nextProps.results.hits.length ||
      !isEqual(this.props.results.hits, nextProps.results.hits);
  }

  renderWithResults() {
    let renderedHits = map(this.props.results.hits, hit => {
      return (
        <Template
          data={hit}
          key={hit.objectID}
          rootProps={{className: this.props.cssClasses.item}}
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
        data={this.props.results}
        rootProps={{className: this.props.cssClasses.allItems}}
        templateKey="allItems"
        {...this.props.templateProps}
      />
    );
  }

  renderNoResults() {
    return (
      <Template
        data={this.props.results}
        rootProps={{className: cx(this.props.cssClasses.root, this.props.cssClasses.empty)}}
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
