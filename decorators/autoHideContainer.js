var React = require('react');
var ReactDOM = require('react-dom');

function autoHideContainer(ComposedComponent) {
  class AutoHide extends React.Component {
    componentDidMount() {
      this._hideOrShowContainer(this.props);
    }

    componentWillReceiveProps(nextProps) {
      this._hideOrShowContainer(nextProps);
    }

    _hideOrShowContainer(props) {
      var container = ReactDOM.findDOMNode(this).parentNode;
      if (props.hideContainerWhenNoResults === true && props.hasResults === false) {
        container.style.display = 'none';
      } else if (props.hideContainerWhenNoResults === true) {
        container.style.display = '';
      }
    }

    render() {
      if (this.props.hasResults === false &&
        this.props.hideContainerWhenNoResults === true) {
        return <div />;
      }

      return <ComposedComponent {...this.props} />;
    }
  }

  AutoHide.propTypes = {
    hasResults: React.PropTypes.bool.isRequired,
    hideContainerWhenNoResults: React.PropTypes.bool.isRequired
  };

  // precise displayName for ease of debugging (react dev tool, react warnings)
  AutoHide.displayName = ComposedComponent.name + '-AutoHide';

  return AutoHide;
}

module.exports = autoHideContainer;
