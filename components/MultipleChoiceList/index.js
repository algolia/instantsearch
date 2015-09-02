var React = require('react');

var Template = require('../Template/');

class MultipleChoiceList extends React.Component {
  render() {
    var facetValues = this.props.facetValues;
    var template = this.props.template;

    return (
      <ul>
        {facetValues.map(function(facetValue) {
          return <li key={facetValue.name}><Template data={facetValue} template={template} /></li>;
        })}
      </ul>
    );
  }
}

MultipleChoiceList.propTypes = {
  facetValues: React.PropTypes.array,
  template: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ]).isRequired,
  toggleRefine: React.PropTypes.func
};

module.exports = MultipleChoiceList;
