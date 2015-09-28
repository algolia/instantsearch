var React = require('react');

function bindProps(ComposedComponent, askedProps) {
  class BindProps extends React.Component {
    render() {
      return (
        <ComposedComponent {...askedProps} {...this.props} />
      );
    }
  }

  // precise displayName for ease of debugging (react dev tool, react warnings)
  BindProps.displayName = ComposedComponent.name + '-BindProps';

  return BindProps;
}

module.exports = bindProps;
