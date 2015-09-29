var React = require('react');

var cx = require('classnames');

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
    if (e.target.tagName === 'A' && e.target.href) {
      e.preventDefault();
    }

    if (e.target.tagName === 'INPUT') {
      this.refine(value);
      return;
    }

    var parent = e.target;

    while (parent !== e.currentTarget) {
      if (parent.tagName === 'LABEL' && parent.querySelector('input[type="checkbox"]')) {
        return;
      }

      parent = parent.parentNode;
    }

    this.refine(value);
  }

  render() {
    return (
      <div className={cx(this.props.cssClasses.list)}>
      {this.props.facetValues.map(facetValue => {
        return (
          <div
            className={cx(this.props.cssClasses.item)}
            key={facetValue.name}
            onClick={this.handleClick.bind(this, facetValue.name)}
          >
            <this.props.Template data={facetValue} templateKey="item" />
          </div>
        );
      })}
      </div>
    );
  }
}

RefinementList.propTypes = {
  cssClasses: React.PropTypes.shape({
    item: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ]),
    list: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ])
  }),
  transformData: React.PropTypes.func,
  facetValues: React.PropTypes.array,
  Template: React.PropTypes.func,
  toggleRefinement: React.PropTypes.func.isRequired
};

RefinementList.defaultProps = {
  cssClasses: {
    item: null,
    list: null
  }
};

module.exports = RefinementList;
