import { Hit as AlgoliaHit } from 'instantsearch.js';
import React from 'react';
import {
  useInfiniteHits,
  UseInfiniteHitsProps,
} from 'react-instantsearch-core';
import { StyleSheet, View, FlatList } from 'react-native';

type InfiniteHitsProps<THit> = UseInfiniteHitsProps & {
  hitComponent: (props: { hit: THit }) => React.JSX.Element;
  // With React 19, `ref` is a regular prop on function components.
  ref?: React.Ref<FlatList<THit>>;
};

export function InfiniteHits<THit extends AlgoliaHit<Record<string, unknown>>>({
  ref,
  hitComponent: Hit,
  ...props
}: InfiniteHitsProps<THit>) {
  const { hits, isLastPage, showMore } = useInfiniteHits(props);

  return (
    <FlatList
      ref={ref}
      data={hits as unknown as THit[]}
      keyExtractor={(item) => item.objectID}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      onEndReached={() => {
        if (!isLastPage) {
          showMore();
        }
      }}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Hit hit={item as unknown as THit} />
        </View>
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
