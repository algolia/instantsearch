var React = require('react');

var Template = require('./Template');
var autoHide = require('../decorators/autoHide');
var debounce = require('lodash/function/debounce');

class Toggle extends React.Component {
  render() {
    var template = this.props.template;
    // When a checkbox is wrapped inside a label, click events fire twice, so we
    // debounce it to only keep the first one
    var toggleFilter = debounce(this.props.toggleFilter, 0, {
      leading: true,
      trailing: false
    });
    var data = {
      label: this.props.label,
      isRefined: this.props.isRefined
    };

    return (
      <span onClick={toggleFilter}>
        <Template data={data} template={template} />
      </span>
    );
  }
}

Toggle.propTypes = {
  template: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ]).isRequired,
  toggleFilter: React.PropTypes.func.isRequired,
  label: React.PropTypes.string,
  isRefined: React.PropTypes.bool
};

module.exports = autoHide(Toggle);
