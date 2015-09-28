var React = require('react');

function prepareProps(ComposedComponent, askedProps) {
  class PrepareProps extends React.Component {
    render() {
      return (
        <ComposedComponent {...askedProps} {...this.props} />
      );
    }
  }

  // precise displayName for ease of debugging (react dev tool, react warnings)
  PrepareProps.displayName = ComposedComponent.name + '-PrepareProps';

  return PrepareProps;
}

module.exports = prepareProps;
