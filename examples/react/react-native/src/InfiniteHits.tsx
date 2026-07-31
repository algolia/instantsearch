import { Hit as AlgoliaHit } from 'instantsearch.js';
import React from 'react';
import {
  useInfiniteHits,
  UseInfiniteHitsProps,
} from 'react-instantsearch-core';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

type InfiniteHitsProps<THit> = UseInfiniteHitsProps & {
  hitComponent: (props: { hit: THit }) => React.JSX.Element;
  onHitPress?: (hit: THit) => void;
  ListHeaderComponent?: React.ReactElement;
  // With React 19, `ref` is a regular prop on function components.
  ref?: React.Ref<FlatList<THit>>;
};

export function InfiniteHits<THit extends AlgoliaHit<Record<string, unknown>>>({
  ref,
  hitComponent: Hit,
  onHitPress,
  ListHeaderComponent,
  ...props
}: InfiniteHitsProps<THit>) {
  const { hits, isLastPage, showMore, sendEvent } = useInfiniteHits(props);

  return (
    <FlatList
      ref={ref}
      data={hits as unknown as THit[]}
      keyExtractor={(item) => item.objectID}
      ListHeaderComponent={ListHeaderComponent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      onEndReached={() => {
        if (!isLastPage) {
          showMore();
        }
      }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          activeOpacity={0.7}
          disabled={!onHitPress}
          onPress={() => {
            // Report the click to Algolia Insights, then open the product.
            sendEvent('click', item, 'Product Clicked');
            onHitPress?.(item as unknown as THit);
          }}
        >
          <Hit hit={item as unknown as THit} />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  item: {
    padding: 18,
  },
});
