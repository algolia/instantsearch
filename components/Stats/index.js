var React = require('react');

var Template = require('../Template/');

class Stats extends React.Component {
  render() {
    var template = this.props.template;
    var data = {
      nbHits: this.props.nbHits,
      processingTimeMS: this.props.processingTimeMS
    };

    return (
      <Template
        data={data}
        template={template}
      />
    );
  }
}

Stats.propTypes = {
  nbHits: React.PropTypes.number,
  processingTimeMS: React.PropTypes.number,
  template: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.string
  ]).isRequired
};

module.exports = Stats;
