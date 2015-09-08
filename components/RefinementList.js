var React = require('react');

var Template = require('./Template');

class RefinementList extends React.Component {
  refine(value) {
    this.props.toggleRefinement(value);
  }

  // Click events on DOM tree like LABEL > INPUT will result in two click events
  // instead of one. No matter the framework: see
  // a label, you will get two click events instead of one.
  // No matter the framework, see https://www.google.com/search?q=click+label+twice
  //
  // Thus making it hard to distinguish activation from deactivation because both click events
  // are very close. Debounce is a solution but hacky.
  //
  // So the code here checks if the click was done on or in a LABEL. If this LABEL
  // has a checkbox inside, we ignore the first click event because we will get another one.
  handleClick(value, e) {
    if (e.target.tagName === 'INPUT') {
      this.refine(value);
      return;
    }

    var parent = e.target;
    var checkboxInLabel = false;

    while (parent !== e.currentTarget) {
      if (parent.tagName === 'LABEL' && parent.querySelector('input[type="checkbox"]')) {
        checkboxInLabel = true;
        return;
      }

      parent = parent.parentNode;
    }

    if (checkboxInLabel === false) {
      this.refine(value);
    }
  }

  render() {
    var facetValues = this.props.facetValues;
    var template = this.props.template;

    return (
      <ul className={this.props.rootClass}>
        {facetValues.map(facetValue => {
          return (
            <li className={this.props.itemClass} key={facetValue.name} onClick={this.handleClick.bind(this, facetValue.name)}>
              <Template data={facetValue} template={template} />
            </li>
          );
        })}
      </ul>
    );
  }
}

RefinementList.propTypes = {
  rootClass: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.arrayOf(React.PropTypes.string)
  ]),
  itemClass: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.arrayOf(React.PropTypes.string)
  ]),
  facetValues: React.PropTypes.array,
  template: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ]).isRequired,
  toggleRefinement: React.PropTypes.func.isRequired
};

module.exports = RefinementList;
