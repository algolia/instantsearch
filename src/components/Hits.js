import React from 'react';
import map from 'lodash/map';
import Template from './Template.js';
import hasKey from 'lodash/has';
import cx from 'classnames';

class Hits extends React.Component {
  renderWithResults() {
    const renderedHits = map(this.props.hits, (hit, position) => {
      const data = {
        ...hit,
        __hitIndex: position,
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
    const className = cx(
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
    const className = cx(
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
    const hasResults = this.props.results.hits.length > 0;
    const hasAllItemsTemplate = hasKey(this.props, 'templateProps.templates.allItems');

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
    empty: React.PropTypes.string,
  }),
  results: React.PropTypes.object,
  templateProps: React.PropTypes.object.isRequired,
};

Hits.defaultProps = {
  results: {hits: []},
};

export default Hits;
