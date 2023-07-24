import React from 'react';
import { connectStateResults } from 'react-instantsearch-native';
import { ActivityIndicator, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default connectStateResults(({ searching, props }) => {
  const left = props.left ? props.left : 0;
  const bottom = props.bottom ? props.bottom : height - 20;

  return (
    <View
      style={{
        position: 'absolute',
        left: width - left,
        bottom: height - bottom,
        zIndex: 2,
      }}
    >
      <ActivityIndicator animating={searching} />
    </View>
  );
});
