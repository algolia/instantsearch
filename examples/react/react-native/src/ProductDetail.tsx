import React from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductHit } from '../types/ProductHit';

import { Rating } from './Rating';
import {
  FrequentlyBoughtTogether,
  LookingSimilar,
  RelatedProducts,
} from './Recommend';

type ProductDetailProps = {
  hit: ProductHit | null;
  onClose: () => void;
  onSelectHit: (hit: ProductHit) => void;
};

export function ProductDetail({
  hit,
  onClose,
  onSelectHit,
}: ProductDetailProps) {
  return (
    <Modal
      animationType="slide"
      visible={hit !== null}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
        </View>

        {hit && (
          <ScrollView>
            <Image style={styles.image} source={{ uri: hit.image }} />
            <View style={styles.info}>
              <Text style={styles.category}>{hit.categories[0]}</Text>
              <Text style={styles.name}>{hit.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>${hit.price}</Text>
                <Rating value={Math.round(hit.rating)} />
              </View>
              <Text style={styles.description}>{hit.description}</Text>
            </View>

            <FrequentlyBoughtTogether
              objectID={hit.objectID}
              onSelect={onSelectHit}
            />
            <RelatedProducts objectID={hit.objectID} onSelect={onSelectHit} />
            <LookingSimilar objectID={hit.objectID} onSelect={onSelectHit} />
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  close: {
    fontSize: 15,
    fontWeight: '600',
    color: '#252b33',
  },
  image: {
    width: '100%',
    height: 260,
    resizeMode: 'contain',
    backgroundColor: '#f7f7f7',
  },
  info: {
    padding: 18,
  },
  category: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#888',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
  },
  description: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
});
