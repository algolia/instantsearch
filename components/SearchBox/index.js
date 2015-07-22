'use strict';

var React = require('react');
var bem = require('../BemHelper')('algolia-magic-search-box');
var cx = require('classnames');

var AlgoliasearchHelper = require('algoliasearch-helper/src/algoliasearch.helper');
var SearchResults = require('algoliasearch-helper/src/SearchResults');

var SearchBox = React.createClass({
  propTypes: {
    helper: React.PropTypes.instanceOf(AlgoliasearchHelper),
    results: React.PropTypes.instanceOf(SearchResults),
    onFocus: React.PropTypes.func,
    placeholder: React.PropTypes.string
  },
  render: function() {
    var onFocus = this.props.onFocus;
    var classNames = cx(bem('input'), this.props.inputClass);

    return <input type="text"
      placeholder={this.props.placeholder}
      name="algolia-query"
      className={classNames}
      data-role="autocomplete"
      autoComplete="off"
      autofocus="autofocus"
      onChange={this.change}
      onFocus={onFocus}
      role="textbox" />;
  },
  change: function(e) {
    var value = e.target.value;
    var helper = this.props.helper;

    helper.setQuery(value).search();
  }
});

module.exports = SearchBox;
