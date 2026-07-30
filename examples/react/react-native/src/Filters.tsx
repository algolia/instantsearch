import React from 'react';
import {
  useClearRefinements,
  useCurrentRefinements,
  useRefinementList,
} from 'react-instantsearch-core';
import {
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FiltersProps = {
  isModalOpen: boolean;
  onToggleModal: () => void;
  onChange: () => void;
};

export function Filters({ isModalOpen, onToggleModal, onChange }: FiltersProps) {
  const { items, refine } = useRefinementList({ attribute: 'brand' });
  const { canRefine: canClear, refine: clear } = useClearRefinements();
  const { items: currentRefinements } = useCurrentRefinements();
  const totalRefinements = currentRefinements.reduce(
    (acc, { refinements }) => acc + refinements.length,
    0
  );

  return (
    <>
      <TouchableOpacity style={styles.filtersButton} onPress={onToggleModal}>
        <Text style={styles.filtersButtonText}>Filters</Text>
        {totalRefinements > 0 && (
          <View style={styles.itemCount}>
            <Text style={styles.itemCountText}>{totalRefinements}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        visible={isModalOpen}
        onRequestClose={onToggleModal}
      >
        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>
            <View style={styles.title}>
              <Text style={styles.titleText}>Brand</Text>
            </View>
            <View style={styles.list}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.item}
                  onPress={() => {
                    refine(item.value);
                    onChange();
                  }}
                >
                  <Text
                    style={[
                      styles.labelText,
                      item.isRefined && styles.labelTextRefined,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <View style={styles.itemCount}>
                    <Text style={styles.itemCountText}>{item.count}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.filterListButtonContainer}>
            <View style={styles.filterListButton}>
              <Button
                title="Clear all"
                color="#252b33"
                disabled={!canClear}
                onPress={() => {
                  clear();
                  onChange();
                }}
              />
            </View>
            <View style={styles.filterListButton}>
              <Button
                title="See results"
                color="#252b33"
                onPress={onToggleModal}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    padding: 18,
  },
  title: {
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    marginTop: 16,
  },
  item: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  labelText: {
    fontSize: 16,
  },
  labelTextRefined: {
    fontWeight: 'bold',
  },
  filterListButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  filterListButton: {
    flex: 1,
    alignItems: 'center',
    marginTop: 10,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#252b33',
    borderRadius: 16,
  },
  filtersButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#252b33',
  },
  itemCount: {
    backgroundColor: '#252b33',
    borderRadius: 24,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginLeft: 6,
  },
  itemCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
