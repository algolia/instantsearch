var React = require('react');
var bem = require('../BemHelper')('as-search-box');
var cx = require('classnames');

var SearchBox = React.createClass({
  propTypes: {
    placeholder: React.PropTypes.string,
    inputClass: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.array
    ]),
    setQuery: React.PropTypes.func,
    search: React.PropTypes.func
  },
  render: function() {
    var classNames = cx(bem('input'), this.props.inputClass);

    return (
      <input type="text"
        placeholder={this.props.placeholder}
        name="algolia-query"
        className={classNames}
        data-role="autocomplete"
        autoComplete="off"
        autoFocus="autofocus"
        onChange={this.change}
        role="textbox" />
    );
  },
  change: function(e) {
    this.props.setQuery(e.target.value);
    this.props.search();
  }
});

module.exports = SearchBox;
