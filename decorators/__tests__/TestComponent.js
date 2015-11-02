let React = require('react');

// This component is only used in tests, as a placeholder
class TestComponent extends React.Component {
  render() {
    return <div {...this.props} />;
  }
}


module.exports = TestComponent;
