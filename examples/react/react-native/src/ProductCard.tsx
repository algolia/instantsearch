import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { ProductHit } from '../types/ProductHit';

import { Rating } from './Rating';

type ProductCardProps = {
  hit: ProductHit;
  onPress?: () => void;
};

// Compact product tile used inside the horizontal Recommend carousels.
export function ProductCard({ hit, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image style={styles.image} source={{ uri: hit.image }} />
      <Text style={styles.name} numberOfLines={2}>
        {hit.name}
      </Text>
      <Text style={styles.price}>${hit.price}</Text>
      <Rating value={Math.round(hit.rating)} size={12} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 130,
    marginRight: 12,
  },
  image: {
    width: 130,
    height: 110,
    resizeMode: 'contain',
    backgroundColor: '#f7f7f7',
    borderRadius: 6,
  },
  name: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  price: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '700',
  },
});
