import React from 'react';
import { connectStats } from 'react-instantsearch-native';
import { Button, View, Platform, Dimensions } from 'react-native';
import { Actions } from 'react-native-router-flux';

import Spinner from './Spinner';

const { height, width } = Dimensions.get('window');

const styles = {
  stats: {
    position: 'absolute',
    height: 100,
    left: 0,
    ...Platform.select({
      ios: {
        top: height - 100,
      },
      android: {
        top: height - 120,
        paddingLeft: 10,
        paddingRight: 10,
      },
    }),
    width,
  },
};
export default connectStats(({ nbHits, searchState, onSearchStateChange }) => (
  <View style={styles.stats}>
    <Button
      title={`See ${nbHits} products`}
      onPress={() =>
        /* eslint-disable new-cap */
        Actions.Home({
          searchState,
          onSearchStateChange,
        })
      }
      /* eslint-enable new-cap */
      color="#162331"
    />
    <Spinner
      left={Platform.OS === 'ios' ? 100 : 210}
      bottom={Platform.OS === 'ios' ? 597 : 530}
    />
  </View>
));
