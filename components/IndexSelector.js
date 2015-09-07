var React = require('react');

class IndexSelector extends React.Component {
  handleChange(event) {
    this.props.setIndex(event.target.value).search();
  }

  render() {
    var currentIndex = this.props.currentIndex;
    var indices = this.props.indices;
    var htmlAttributes = this.props.htmlAttributes;
    // React needs `className` in place of `class`
    if (htmlAttributes.class) {
      htmlAttributes.className = htmlAttributes.class;
      htmlAttributes.class = null;
    }

    return (
      <select
        {...htmlAttributes}
        onChange={this.handleChange.bind(this)}
        value={currentIndex}
      >
          {indices.map(function(index) {
            return <option key={index.name} value={index.name}>{index.label}</option>;
          })}
      </select>
    );
  }
}

IndexSelector.propTypes = {
  currentIndex: React.PropTypes.string,
  htmlAttributes: React.PropTypes.object,
  indices: React.PropTypes.array,
  setIndex: React.PropTypes.func
};

module.exports = IndexSelector;
