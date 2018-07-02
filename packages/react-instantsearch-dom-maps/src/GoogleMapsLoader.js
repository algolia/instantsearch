import { Component } from 'react';
import PropTypes from 'prop-types';
import injectScript from 'scriptjs';

class GoogleMapsLoader extends Component {
  static propTypes = {
    apiKey: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired,
    endpoint: PropTypes.string,
  };

  static defaultProps = {
    endpoint: 'https://maps.googleapis.com/maps/api/js?v=3.31',
  };

  state = {
    google: null,
  };

  isUnmounting = false;

  componentDidMount() {
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
