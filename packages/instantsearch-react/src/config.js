import React, {Component} from 'react';

import {configManagerPropType} from './propTypes';

export default function config(mapPropsToConfig) {
  return Composed => class Configured extends Component {
    static contextTypes = {
      algoliaConfigManager: configManagerPropType.isRequired,
    };

    constructor(props, context) {
      super();

      this.config = mapPropsToConfig(props);
      context.algoliaConfigManager.register(this.config);
    }

    componentDidMount() {
      this.context.algoliaConfigManager.apply();
    }

    componentWillReceiveProps(nextProps) {
      const nextConfig = mapPropsToConfig(nextProps);
      // @TODO: Maybe compare this.config and nextConfig
      // We might not have to do this since the client already implements
      // caching, so same configs won't yield new results.
      this.context.algoliaConfigManager.swap(this.config, nextConfig);
      this.config = nextConfig;
    }

    componentDidUpdate() {
      this.context.algoliaConfigManager.apply();
    }

    componentWillUnmount() {
      this.context.algoliaConfigManager.unregister(this.config);
    }

    render() {
      return <Composed {...this.props} />;
    }
  };
}
