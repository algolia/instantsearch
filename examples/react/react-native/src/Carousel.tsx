import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { ProductHit } from '../types/ProductHit';

import { ProductCard } from './ProductCard';

type CarouselProps = {
  title: string;
  items: ProductHit[];
  onSelect?: (hit: ProductHit) => void;
};

// Horizontal, self-hiding list of products. Recommend widgets return an empty
// `items` array until a model responds, so we render nothing in that case.
export function Carousel({ title, items, onSelect }: CarouselProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={(item) => item.objectID}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProductCard hit={item} onPress={() => onSelect?.(item)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  title: {
    paddingHorizontal: 18,
    marginBottom: 12,
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 18,
  },
});
