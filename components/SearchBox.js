var React = require('react');

var PoweredBy = require('./PoweredBy');
var headerFooter = require('../decorators/headerFooter');
var bem = require('../lib/utils').bemHelper('as-search-box');
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
    return (
      <div>
        <input type="text"
          placeholder={this.props.placeholder}
          name="algolia-query"
          className={cx(bem('input'), this.props.cssClasses.input)}
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
  onBlur() {},
  onFocus() {}
};

SearchBox.propTypes = {
  placeholder: React.PropTypes.string,
  cssClasses: React.PropTypes.shape({
    input: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ])
  }),
  poweredBy: React.PropTypes.bool,
  setQuery: React.PropTypes.func,
  search: React.PropTypes.func,
  onFocus: React.PropTypes.func,
  onBlur: React.PropTypes.func,
  value: React.PropTypes.string
};

module.exports = headerFooter(SearchBox);
