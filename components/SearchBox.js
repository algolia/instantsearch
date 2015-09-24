var React = require('react');
var PoweredBy = require('./PoweredBy');
var bem = require('./BemHelper')('as-search-box');
var cx = require('classnames');

class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({value: newProps.value});
  }

  handleChange(e) {
    var newValue = e.target.value;
    this.props.setQuery(newValue);
    this.props.search();
    this.setState({value: newValue});
  }

  render() {
    var classNames = cx(bem('input'), this.props.inputClass);

    return (
      <div>
        <input type="text"
          placeholder={this.props.placeholder}
          name="algolia-query"
          className={classNames}
          autoComplete="off"
          autoFocus="autofocus"
          onChange={this.handleChange.bind(this)}
          role="textbox"
          onBlur={this.props.onBlur}
          onFocus={this.props.onFocus}
          value={this.state.value}
        />
        <PoweredBy display={this.props.poweredBy} />
      </div>
    );
  }
}

SearchBox.defaultProps = {
  onBlur: function() {},
  onFocus: function() {}
};

SearchBox.propTypes = {
  placeholder: React.PropTypes.string,
  inputClass: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.array
  ]),
  poweredBy: React.PropTypes.bool,
  setQuery: React.PropTypes.func,
  search: React.PropTypes.func,
  onFocus: React.PropTypes.func,
  onBlur: React.PropTypes.func,
  value: React.PropTypes.string
};

module.exports = SearchBox;
