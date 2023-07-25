import PropTypes from 'prop-types';
import { Component } from 'react';

class GoogleMapsLoader extends Component {
  static propTypes = {
    apiKey: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired,
    endpoint: PropTypes.string,
  };

  static defaultProps = {
    endpoint: 'https://maps.googleapis.com/maps/api/js?v=quarterly',
  };

  state = {
    google: null,
  };

  isUnmounting = false;

  componentDidMount() {
    // Inline the import to avoid to run the module on the server (rely on `document`)
    // Under the hood we use `dynamic-import-node` to transpile the `import` to `require`
    // see: https://github.com/algolia/react-instantsearch/issues/1425
    return import('scriptjs').then(({ default: injectScript }) => {
      const { apiKey, endpoint } = this.props;
      const operator = endpoint.indexOf('?') !== -1 ? '&' : '?';
      const endpointWithCredentials = `${endpoint}${operator}key=${apiKey}`;

      injectScript(endpointWithCredentials, () => {
        if (!this.isUnmounting) {
          this.setState(() => ({
            google: window.google,
          }));
        }
      });
    });
  }

  componentWillUnmount() {
    this.isUnmounting = true;
  }

  render() {
    if (!this.state.google) {
      return null;
    }

    return this.props.children(this.state.google);
  }
}

export default GoogleMapsLoader;
