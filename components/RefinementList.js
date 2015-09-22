var React = require('react');

var Template = require('./Template');
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
    var facetValues = this.props.facetValues;
    var templates = this.props.templates;
    var rootClass = cx(this.props.cssClasses.root);
    var listClass = cx(this.props.cssClasses.list);
    var itemClass = cx(this.props.cssClasses.item);

    return (
      <div className={rootClass}>
        <Template template={templates.header} />
        <div className={listClass}>
        {facetValues.map(facetValue => {
          return (
            <div className={itemClass} key={facetValue.name} onClick={this.handleClick.bind(this, facetValue.name)}>
              <Template data={facetValue} template={templates.item} />
            </div>
          );
        })}
        </div>
        <Template template={templates.footer} />
      </div>
    );
  }
}

RefinementList.propTypes = {
  cssClasses: React.PropTypes.shape({
    root: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ]),
    item: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ]),
    list: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ])
  }),
  facetValues: React.PropTypes.array,
  templates: React.PropTypes.shape({
    header: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func
    ]),
    item: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func
    ]).isRequired,
    footer: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func
    ])
  }),
  toggleRefinement: React.PropTypes.func.isRequired
};

RefinementList.defaultProps = {
  cssClasses: {
    root: null,
    item: null,
    list: null
  }
};

module.exports = RefinementList;
