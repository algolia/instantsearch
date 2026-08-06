import connectRatingMenu from 'instantsearch.js/es/connectors/rating-menu/connectRatingMenu';
import React from 'react';
import { useConnector } from 'react-instantsearch-core';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Rating } from './Rating';

import type {
  RatingMenuConnectorParams,
  RatingMenuWidgetDescription,
} from 'instantsearch.js/es/connectors/rating-menu/connectRatingMenu';

type RatingMenuProps = {
  attribute: string;
  onChange?: () => void;
};

// There is no `useRatingMenu` hook in react-instantsearch-core, so we bridge
// the vanilla `connectRatingMenu` connector with `useConnector` — the escape
// hatch for any InstantSearch.js connector that lacks a dedicated hook.
export function RatingMenu({ attribute, onChange }: RatingMenuProps) {
  const { items, refine } = useConnector<
    RatingMenuConnectorParams,
    RatingMenuWidgetDescription
  >(connectRatingMenu, { attribute });

  return (
    <View>
      {items.map((item) => (
        <TouchableOpacity
          key={item.value}
          style={[styles.item, item.count === 0 && styles.itemDisabled]}
          disabled={item.count === 0}
          onPress={() => {
            refine(item.value);
            onChange?.();
          }}
        >
          <View style={styles.labelRow}>
            <Rating value={item.stars.filter(Boolean).length} />
            <Text
              style={[styles.label, item.isRefined && styles.labelRefined]}
            >
              & Up
            </Text>
          </View>
          <View style={styles.count}>
            <Text style={styles.countText}>{item.count}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemDisabled: {
    opacity: 0.4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    marginLeft: 8,
  },
  labelRefined: {
    fontWeight: '700',
    color: '#252b33',
  },
  count: {
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  countText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
  },
});
