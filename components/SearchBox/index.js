var React = require('react');
var bem = require('../BemHelper')('as-search-box');
var cx = require('classnames');

class SearchBox {
  handleChange(e) {
    this.props.setQuery(e.target.value);
    this.props.search();
  }

  render() {
    var classNames = cx(bem('input'), this.props.inputClass);

    return (
      <input type="text"
        placeholder={this.props.placeholder}
        name="algolia-query"
        className={classNames}
        autoComplete="off"
        autoFocus="autofocus"
        onChange={this.handleChange.bind(this)}
        role="textbox"
      />
    );
  }
}

SearchBox.propTypes = {
  placeholder: React.PropTypes.string,
  inputClass: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.array
  ]),
  setQuery: React.PropTypes.func,
  search: React.PropTypes.func
};

module.exports = SearchBox;
