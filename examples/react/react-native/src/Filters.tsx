import React from 'react';
import {
  useClearRefinements,
  useCurrentRefinements,
} from 'react-instantsearch-core';
import {
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HierarchicalMenu } from './HierarchicalMenu';
import { Panel } from './Panel';
import { PriceRange } from './PriceRange';
import { RatingMenu } from './RatingMenu';
import { RefinementList } from './RefinementList';
import { ToggleRefinement } from './ToggleRefinement';

type FiltersProps = {
  isModalOpen: boolean;
  onToggleModal: () => void;
  onChange: () => void;
};

export function Filters({ isModalOpen, onToggleModal, onChange }: FiltersProps) {
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
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalRefinements}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        visible={isModalOpen}
        onRequestClose={onToggleModal}
      >
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Filters</Text>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            <Panel header="Category">
              <HierarchicalMenu
                attributes={[
                  'hierarchicalCategories.lvl0',
                  'hierarchicalCategories.lvl1',
                ]}
                onChange={onChange}
              />
            </Panel>

            <Panel header="Brands">
              <RefinementList
                attribute="brand"
                searchable
                searchablePlaceholder="Search for brands…"
                onChange={onChange}
              />
            </Panel>

            <Panel header="Price">
              <PriceRange attribute="price" onChange={onChange} />
            </Panel>

            <Panel header="Free shipping">
              <ToggleRefinement
                attribute="free_shipping"
                label="Display only items with free shipping"
                on={true}
                onChange={onChange}
              />
            </Panel>

            <Panel header="Ratings">
              <RatingMenu attribute="rating" onChange={onChange} />
            </Panel>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerButton}>
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
            <View style={styles.footerButton}>
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
  header: {
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  body: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#e5e5e5',
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
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
  badge: {
    backgroundColor: '#252b33',
    borderRadius: 24,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginLeft: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
