import React from 'react';
import { StyleSheet, Text } from 'react-native';

type RatingProps = {
  value: number;
  max?: number;
  size?: number;
};

// Star rating rendered with text glyphs so the example stays dependency-free
// (no `react-native-svg`). Full stars up to `value`, empty stars for the rest.
export function Rating({ value, max = 5, size = 14 }: RatingProps) {
  const stars = Array.from({ length: max }, (_, index) => index < value);

  return (
    <Text style={[styles.stars, { fontSize: size }]}>
      {stars.map((isFull) => (isFull ? '★' : '☆')).join('')}
    </Text>
  );
}

const styles = StyleSheet.create({
  stars: {
    color: '#e2a400',
    letterSpacing: 2,
  },
});
