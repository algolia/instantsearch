let React = require('react');
let map = require('lodash/collection/map');

let Template = require('./Template');

class Hits extends React.Component {
  renderWithResults() {
    let renderedHits = map(this.props.results.hits, hit => {
      return (
        <div className={this.props.cssClasses.item} key={hit.objectID}>
          <Template
            data={hit}
            templateKey="item"
            {...this.props.templateProps}
          />
        </div>
      );
    });

    return <div className={this.props.cssClasses.root}>{renderedHits}</div>;
  }

  renderNoResults() {
    let className = `${this.props.cssClasses.root} ${this.props.cssClasses.empty}`;
    return (
      <div className={className}>
        <Template
          data={this.props.results}
          templateKey="empty"
          {...this.props.templateProps}
        />
      </div>
    );
  }

  render() {
    if (this.props.results.hits.length > 0) {
      return this.renderWithResults();
    }
    return this.renderNoResults();
  }
}

Hits.propTypes = {
  cssClasses: React.PropTypes.shape({
    root: React.PropTypes.string,
    item: React.PropTypes.string,
    empty: React.PropTypes.string
  }),
  results: React.PropTypes.object,
  templateProps: React.PropTypes.object.isRequired
};

Hits.defaultProps = {
  results: {hits: []}
};

module.exports = Hits;
