import React, { forwardRef } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Hit as AlgoliaHit } from 'instantsearch.js';
import {
  useInfiniteHits,
  UseInfiniteHitsProps,
} from 'react-instantsearch-core';

type InfiniteHitsProps<THit> = UseInfiniteHitsProps & {
  hitComponent: (props: { hit: THit }) => JSX.Element;
};

export const InfiniteHits = forwardRef(
  <THit extends AlgoliaHit<Record<string, unknown>>>(
    { hitComponent: Hit, ...props }: InfiniteHitsProps<THit>,
    ref: React.ForwardedRef<FlatList<THit>>
  ) => {
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
);

const styles = StyleSheet.create({
  separator: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  item: {
    padding: 18,
  },
});

declare module 'react' {
  // eslint-disable-next-line no-shadow
  function forwardRef<TRef, TProps = unknown>(
    render: (props: TProps, ref: React.Ref<TRef>) => React.ReactElement | null
  ): (props: TProps & React.RefAttributes<TRef>) => React.ReactElement | null;
}
