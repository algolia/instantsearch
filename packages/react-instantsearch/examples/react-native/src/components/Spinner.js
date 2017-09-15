import React from 'react';
import { ActivityIndicator, View, Dimensions } from 'react-native';
import { createConnector } from 'react-instantsearch';

const { width, height } = Dimensions.get('window');

export default createConnector({
  displayName: 'ConditionalQuery',
  getProvidedProps(props, searchState, results) {
    return {
      loading: results.searching || results.searchingForFacetValues,
      left: props.left ? props.left : 0,
      bottom: props.bottom ? props.bottom : height - 20,
    };
  },
})(({ loading, left, bottom }) => (
  <View
    style={{
      position: 'absolute',
      left: width - left,
      bottom: height - bottom,
      zIndex: 2,
    }}
  >
    <ActivityIndicator animating={loading} />
  </View>
));
