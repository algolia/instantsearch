let React = require('react');

let Template = require('../Template');

class Stats extends React.Component {
  render() {
    let data = {
      hasManyResults: this.props.nbHits > 1,
      hasNoResults: this.props.nbHits === 0,
      hasOneResult: this.props.nbHits === 1,
      hitsPerPage: this.props.hitsPerPage,
      nbHits: this.props.nbHits,
      nbPages: this.props.nbPages,
      page: this.props.page,
      processingTimeMS: this.props.processingTimeMS,
      query: this.props.query,
      cssClasses: this.props.cssClasses
    };

    return (
      <Template data={data} templateKey="body" {...this.props.templateProps} />
    );
  }
}

Stats.propTypes = {
  cssClasses: React.PropTypes.shape({
    time: React.PropTypes.string
  }),
  hitsPerPage: React.PropTypes.number,
  nbHits: React.PropTypes.number,
  nbPages: React.PropTypes.number,
  page: React.PropTypes.number,
  processingTimeMS: React.PropTypes.number,
  query: React.PropTypes.string,
  templateProps: React.PropTypes.object.isRequired
};

module.exports = Stats;
