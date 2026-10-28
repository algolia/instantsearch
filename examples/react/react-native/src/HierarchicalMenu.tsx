import React from 'react';
import {
  useHierarchicalMenu,
  UseHierarchicalMenuProps,
} from 'react-instantsearch-core';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { HierarchicalMenuItem } from 'instantsearch.js/es/connectors/hierarchical-menu/connectHierarchicalMenu';

type HierarchicalMenuProps = UseHierarchicalMenuProps & {
  onChange?: () => void;
};

function HierarchicalList({
  items,
  refine,
  onChange,
  depth = 0,
}: {
  items: HierarchicalMenuItem[];
  refine: (value: string) => void;
  onChange?: () => void;
  depth?: number;
}) {
  return (
    <>
      {items.map((item) => (
        <View key={item.value}>
          <TouchableOpacity
            style={[styles.item, { paddingLeft: depth * 16 }]}
            onPress={() => {
              refine(item.value);
              onChange?.();
            }}
          >
            <Text
              style={[styles.label, item.isRefined && styles.labelRefined]}
            >
              {item.label}
            </Text>
            <View style={styles.count}>
              <Text style={styles.countText}>{item.count}</Text>
            </View>
          </TouchableOpacity>

          {item.data && (
            <HierarchicalList
              items={item.data}
              refine={refine}
              onChange={onChange}
              depth={depth + 1}
            />
          )}
        </View>
      ))}
    </>
  );
}

export function HierarchicalMenu({
  onChange,
  ...props
}: HierarchicalMenuProps) {
  const { items, refine } = useHierarchicalMenu(props);

  return (
    <View>
      <HierarchicalList items={items} refine={refine} onChange={onChange} />
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
  label: {
    fontSize: 15,
    flexShrink: 1,
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
